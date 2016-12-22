/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
"use strict";
const os = require("os");
const net = require("net");
const path = require("path");
const utils = require("./utils");
const vscode = require("vscode");
const cp = require("child_process");
const Settings = require("./settings");
const string_decoder_1 = require("string_decoder");
const vscode_languageclient_1 = require("vscode-languageclient");
var SessionStatus;
(function (SessionStatus) {
    SessionStatus[SessionStatus["NotStarted"] = 0] = "NotStarted";
    SessionStatus[SessionStatus["Initializing"] = 1] = "Initializing";
    SessionStatus[SessionStatus["Running"] = 2] = "Running";
    SessionStatus[SessionStatus["Stopping"] = 3] = "Stopping";
    SessionStatus[SessionStatus["Failed"] = 4] = "Failed";
})(SessionStatus = exports.SessionStatus || (exports.SessionStatus = {}));
var SessionType;
(function (SessionType) {
    SessionType[SessionType["UseDefault"] = 0] = "UseDefault";
    SessionType[SessionType["UseCurrent"] = 1] = "UseCurrent";
    SessionType[SessionType["UsePath"] = 2] = "UsePath";
    SessionType[SessionType["UseBuiltIn"] = 3] = "UseBuiltIn";
})(SessionType || (SessionType = {}));
class SessionManager {
    constructor(requiredEditorServicesVersion, log, extensionFeatures = []) {
        this.requiredEditorServicesVersion = requiredEditorServicesVersion;
        this.log = log;
        this.extensionFeatures = extensionFeatures;
        this.ShowSessionMenuCommandName = "PowerShell.ShowSessionMenu";
        this.registeredCommands = [];
        this.languageServerClient = undefined;
        this.sessionSettings = undefined;
        this.isWindowsOS = os.platform() == "win32";
        // Get the current version of this extension
        this.hostVersion =
            vscode
                .extensions
                .getExtension("ms-vscode.PowerShell")
                .packageJSON
                .version;
        this.registerCommands();
        this.createStatusBarItem();
    }
    start(sessionConfig = { type: SessionType.UseDefault }) {
        this.sessionSettings = Settings.load(utils.PowerShellLanguageId);
        this.log.startNewLog(this.sessionSettings.developer.editorServicesLogLevel);
        this.sessionConfiguration = this.resolveSessionConfiguration(sessionConfig);
        if (this.sessionConfiguration.type === SessionType.UsePath ||
            this.sessionConfiguration.type === SessionType.UseBuiltIn) {
            var bundledModulesPath = this.sessionSettings.developer.bundledModulesPath;
            if (!path.isAbsolute(bundledModulesPath)) {
                bundledModulesPath = path.resolve(__dirname, bundledModulesPath);
            }
            var startArgs = "-EditorServicesVersion '" + this.requiredEditorServicesVersion + "' " +
                "-HostName 'Visual Studio Code Host' " +
                "-HostProfileId 'Microsoft.VSCode' " +
                "-HostVersion '" + this.hostVersion + "' " +
                "-BundledModulesPath '" + bundledModulesPath + "' ";
            if (this.sessionSettings.developer.editorServicesWaitForDebugger) {
                startArgs += '-WaitForDebugger ';
            }
            if (this.sessionSettings.developer.editorServicesLogLevel) {
                startArgs += "-LogLevel '" + this.sessionSettings.developer.editorServicesLogLevel + "' ";
            }
            this.startPowerShell(this.sessionConfiguration.path, bundledModulesPath, startArgs);
        }
        else {
            this.setSessionFailure("PowerShell could not be started, click 'Show Logs' for more details.");
        }
    }
    stop() {
        // Shut down existing session if there is one
        this.log.write(os.EOL + os.EOL + "Shutting down language client...");
        if (this.sessionStatus === SessionStatus.Failed) {
            // Before moving further, clear out the client and process if
            // the process is already dead (i.e. it crashed)
            this.languageServerClient = undefined;
            this.powerShellProcess = undefined;
        }
        this.sessionStatus = SessionStatus.Stopping;
        // Close the language server client
        if (this.languageServerClient !== undefined) {
            this.languageServerClient.stop();
            this.languageServerClient = undefined;
        }
        // Clean up the session file
        utils.deleteSessionFile();
        // Kill the PowerShell process we spawned via the console
        if (this.powerShellProcess !== undefined) {
            this.log.write(os.EOL + "Terminating PowerShell process...");
            this.powerShellProcess.kill();
            this.powerShellProcess = undefined;
        }
        this.sessionStatus = SessionStatus.NotStarted;
    }
    dispose() {
        // Stop the current session
        this.stop();
        // Dispose of all commands
        this.registeredCommands.forEach(command => { command.dispose(); });
    }
    onConfigurationUpdated() {
        var settings = Settings.load(utils.PowerShellLanguageId);
        // Detect any setting changes that would affect the session
        if (settings.useX86Host !== this.sessionSettings.useX86Host ||
            settings.developer.powerShellExePath.toLowerCase() !== this.sessionSettings.developer.powerShellExePath.toLowerCase() ||
            settings.developer.editorServicesLogLevel.toLowerCase() !== this.sessionSettings.developer.editorServicesLogLevel.toLowerCase() ||
            settings.developer.bundledModulesPath.toLowerCase() !== this.sessionSettings.developer.bundledModulesPath.toLowerCase()) {
            vscode.window.showInformationMessage("The PowerShell runtime configuration has changed, would you like to start a new session?", "Yes", "No")
                .then((response) => {
                if (response === "Yes") {
                    this.restartSession({ type: SessionType.UseDefault });
                }
            });
        }
    }
    registerCommands() {
        this.registeredCommands = [
            vscode.commands.registerCommand('PowerShell.RestartSession', () => { this.restartSession(); }),
            vscode.commands.registerCommand(this.ShowSessionMenuCommandName, () => { this.showSessionMenu(); }),
            vscode.workspace.onDidChangeConfiguration(() => this.onConfigurationUpdated())
        ];
    }
    startPowerShell(powerShellExePath, bundledModulesPath, startArgs) {
        try {
            this.setSessionStatus("Starting PowerShell...", SessionStatus.Initializing);
            let startScriptPath = path.resolve(__dirname, '../scripts/Start-EditorServices.ps1');
            var editorServicesLogPath = this.log.getLogFilePath("EditorServices");
            startArgs += "-LogPath '" + editorServicesLogPath + "' ";
            var powerShellArgs = [
                "-NoProfile",
                "-NonInteractive"
            ];
            // Only add ExecutionPolicy param on Windows
            if (this.isWindowsOS) {
                powerShellArgs.push("-ExecutionPolicy", "Unrestricted");
            }
            powerShellArgs.push("-Command", "& '" + startScriptPath + "' " + startArgs);
            // Launch PowerShell as child process
            this.powerShellProcess = cp.spawn(powerShellExePath, powerShellArgs);
            var decoder = new string_decoder_1.StringDecoder('utf8');
            this.powerShellProcess.stdout.on('data', (data) => {
                this.log.write("OUTPUT: " + data);
                var response = JSON.parse(decoder.write(data).trim());
                if (response["status"] === "started") {
                    let sessionDetails = response;
                    // Write out the session configuration file
                    utils.writeSessionFile(sessionDetails);
                    // Start the language service client
                    this.startLanguageClient(sessionDetails.languageServicePort);
                }
                else {
                }
            });
            this.powerShellProcess.stderr.on('data', (data) => {
                this.log.writeError("ERROR: " + data);
                if (this.sessionStatus === SessionStatus.Initializing) {
                    this.setSessionFailure("PowerShell could not be started, click 'Show Logs' for more details.");
                }
                else if (this.sessionStatus === SessionStatus.Running) {
                    this.promptForRestart();
                }
            });
            this.powerShellProcess.on('close', (exitCode) => {
                this.log.write(os.EOL + "powershell.exe terminated with exit code: " + exitCode + os.EOL);
                if (this.languageServerClient != undefined) {
                    this.languageServerClient.stop();
                }
                if (this.sessionStatus === SessionStatus.Running) {
                    this.setSessionStatus("Session exited", SessionStatus.Failed);
                    this.promptForRestart();
                }
            });
            console.log("powershell.exe started, pid: " + this.powerShellProcess.pid + ", exe: " + powerShellExePath);
            this.log.write("powershell.exe started --", "    pid: " + this.powerShellProcess.pid, "    exe: " + powerShellExePath, "    bundledModulesPath: " + bundledModulesPath, "    args: " + startScriptPath + ' ' + startArgs + os.EOL + os.EOL);
        }
        catch (e) {
            this.setSessionFailure("The language service could not be started: ", e);
        }
    }
    promptForRestart() {
        vscode.window.showErrorMessage("The PowerShell session has terminated due to an error, would you like to restart it?", "Yes", "No")
            .then((answer) => { if (answer === "Yes") {
            this.restartSession();
        } });
    }
    startLanguageClient(port) {
        this.log.write("Connecting to language service on port " + port + "..." + os.EOL);
        try {
            let connectFunc = () => {
                return new Promise((resolve, reject) => {
                    var socket = net.connect(port);
                    socket.on('connect', () => {
                        this.log.write("Language service connected.");
                        resolve({ writer: socket, reader: socket });
                    });
                });
            };
            let clientOptions = {
                documentSelector: [utils.PowerShellLanguageId],
                synchronize: {
                    configurationSection: utils.PowerShellLanguageId,
                }
            };
            this.languageServerClient =
                new vscode_languageclient_1.LanguageClient('PowerShell Editor Services', connectFunc, clientOptions);
            this.languageServerClient.onReady().then(() => {
                this.languageServerClient
                    .sendRequest(PowerShellVersionRequest.type)
                    .then((versionDetails) => {
                    this.versionDetails = versionDetails;
                    this.setSessionStatus(this.versionDetails.architecture === "x86"
                        ? `${this.versionDetails.displayVersion} (${this.versionDetails.architecture})`
                        : this.versionDetails.displayVersion, SessionStatus.Running);
                    this.updateExtensionFeatures(this.languageServerClient);
                });
            }, (reason) => {
                this.setSessionFailure("Could not start language service: ", reason);
            });
            this.languageServerClient.start();
        }
        catch (e) {
            this.setSessionFailure("The language service could not be started: ", e);
        }
    }
    updateExtensionFeatures(languageClient) {
        this.extensionFeatures.forEach(feature => {
            feature.setLanguageClient(languageClient);
        });
    }
    restartSession(sessionConfig) {
        this.stop();
        this.start(sessionConfig);
    }
    createStatusBarItem() {
        if (this.statusBarItem == undefined) {
            // Create the status bar item and place it right next
            // to the language indicator
            this.statusBarItem =
                vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1);
            this.statusBarItem.command = this.ShowSessionMenuCommandName;
            this.statusBarItem.show();
            vscode.window.onDidChangeActiveTextEditor(textEditor => {
                if (textEditor === undefined
                    || textEditor.document.languageId !== "powershell") {
                    this.statusBarItem.hide();
                }
                else {
                    this.statusBarItem.show();
                }
            });
        }
    }
    setSessionStatus(statusText, status) {
        // Set color and icon for 'Running' by default
        var statusIconText = "$(terminal) ";
        var statusColor = "#affc74";
        if (status == SessionStatus.Initializing) {
            statusIconText = "$(sync) ";
            statusColor = "#f3fc74";
        }
        else if (status == SessionStatus.Failed) {
            statusIconText = "$(alert) ";
            statusColor = "#fcc174";
        }
        this.sessionStatus = status;
        this.statusBarItem.color = statusColor;
        this.statusBarItem.text = statusIconText + statusText;
    }
    setSessionFailure(message, ...additionalMessages) {
        this.log.writeAndShowError(message, ...additionalMessages);
        this.setSessionStatus("Initialization Error", SessionStatus.Failed);
    }
    resolveSessionConfiguration(sessionConfig) {
        switch (sessionConfig.type) {
            case SessionType.UseCurrent: return this.sessionConfiguration;
            case SessionType.UseDefault:
                // Is there a setting override for the PowerShell path?
                var powerShellExePath = (this.sessionSettings.developer.powerShellExePath || "").trim();
                if (powerShellExePath.length > 0) {
                    return this.resolveSessionConfiguration({ type: SessionType.UsePath, path: this.sessionSettings.developer.powerShellExePath });
                }
                else {
                    return this.resolveSessionConfiguration({ type: SessionType.UseBuiltIn, is32Bit: this.sessionSettings.useX86Host });
                }
            case SessionType.UsePath:
                sessionConfig.path = this.resolvePowerShellPath(sessionConfig.path);
                return sessionConfig;
            case SessionType.UseBuiltIn:
                sessionConfig.path = this.getBuiltInPowerShellPath(sessionConfig.is32Bit);
                return sessionConfig;
        }
    }
    getBuiltInPowerShellPath(use32Bit) {
        // Find the path to powershell.exe based on the current platform
        // and the user's desire to run the x86 version of PowerShell
        var powerShellExePath = undefined;
        if (this.isWindowsOS) {
            powerShellExePath =
                use32Bit || !process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')
                    ? process.env.windir + '\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
                    : process.env.windir + '\\Sysnative\\WindowsPowerShell\\v1.0\\powershell.exe';
        }
        else if (os.platform() == "darwin") {
            powerShellExePath = "/usr/local/bin/powershell";
            // Check for OpenSSL dependency on macOS.  Look for the default Homebrew installation
            // path and if that fails check the system-wide library path.
            if (!(utils.checkIfFileExists("/usr/local/opt/openssl/lib/libcrypto.1.0.0.dylib") &&
                utils.checkIfFileExists("/usr/local/opt/openssl/lib/libssl.1.0.0.dylib")) &&
                !(utils.checkIfFileExists("/usr/local/lib/libcrypto.1.0.0.dylib") &&
                    utils.checkIfFileExists("/usr/local/lib/libssl.1.0.0.dylib"))) {
                var thenable = vscode.window.showWarningMessage("The PowerShell extension will not work without OpenSSL on macOS and OS X", "Show Documentation");
                thenable.then((s) => {
                    if (s === "Show Documentation") {
                        cp.exec("open https://github.com/PowerShell/vscode-powershell/blob/master/docs/troubleshooting.md#1-powershell-intellisense-does-not-work-cant-debug-scripts");
                    }
                });
                // Don't continue initializing since Editor Services will not load successfully
                this.setSessionFailure("Cannot start PowerShell Editor Services due to missing OpenSSL dependency.");
                return null;
            }
        }
        else {
            powerShellExePath = "/usr/bin/powershell";
        }
        return this.resolvePowerShellPath(powerShellExePath);
    }
    resolvePowerShellPath(powerShellExePath) {
        // If the path does not exist, show an error
        if (!utils.checkIfFileExists(powerShellExePath)) {
            this.setSessionFailure("powershell.exe cannot be found or is not accessible at path " + powerShellExePath);
            return null;
        }
        return powerShellExePath;
    }
    showSessionMenu() {
        var menuItems = [
            new SessionMenuItem(`Current session: PowerShell ${this.versionDetails.displayVersion} (${this.versionDetails.architecture}) ${this.versionDetails.edition} Edition [${this.versionDetails.version}]`, () => { vscode.commands.executeCommand("PowerShell.ShowLogs"); }),
            new SessionMenuItem("Restart Current Session", () => { this.restartSession(); }),
        ];
        if (this.isWindowsOS) {
            var item32 = new SessionMenuItem("Switch to Windows PowerShell (x86)", () => { this.restartSession({ type: SessionType.UseBuiltIn, is32Bit: true }); });
            var item64 = new SessionMenuItem("Switch to Windows PowerShell (x64)", () => { this.restartSession({ type: SessionType.UseBuiltIn, is32Bit: false }); });
            // If the configured PowerShell path isn't being used, offer it as an option
            if (this.sessionSettings.developer.powerShellExePath !== "" &&
                (this.sessionConfiguration.type !== SessionType.UsePath ||
                    this.sessionConfiguration.path !== this.sessionSettings.developer.powerShellExePath)) {
                menuItems.push(new SessionMenuItem(`Switch to PowerShell at path: ${this.sessionSettings.developer.powerShellExePath}`, () => {
                    this.restartSession({ type: SessionType.UsePath, path: this.sessionSettings.developer.powerShellExePath });
                }));
            }
            if (this.sessionConfiguration.type === SessionType.UseBuiltIn) {
                menuItems.push(this.sessionConfiguration.is32Bit ? item64 : item32);
            }
            else {
                menuItems.push(item32);
                menuItems.push(item64);
            }
        }
        else {
            if (this.sessionConfiguration.type !== SessionType.UseBuiltIn) {
                menuItems.push(new SessionMenuItem("Use built-in PowerShell", () => { this.restartSession({ type: SessionType.UseBuiltIn, is32Bit: false }); }));
            }
        }
        menuItems.push(new SessionMenuItem("Open Session Logs Folder", () => { vscode.commands.executeCommand("PowerShell.OpenLogFolder"); }));
        vscode
            .window
            .showQuickPick(menuItems)
            .then((selectedItem) => { selectedItem.callback(); });
    }
}
exports.SessionManager = SessionManager;
class SessionMenuItem {
    constructor(label, callback = () => { }) {
        this.label = label;
        this.callback = callback;
    }
}
var PowerShellVersionRequest;
(function (PowerShellVersionRequest) {
    PowerShellVersionRequest.type = { get method() { return 'powerShell/getVersion'; } };
})(PowerShellVersionRequest = exports.PowerShellVersionRequest || (exports.PowerShellVersionRequest = {}));
//# sourceMappingURL=session.js.map