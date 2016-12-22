/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const utils = require("./utils");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Verbose"] = 0] = "Verbose";
    LogLevel[LogLevel["Normal"] = 1] = "Normal";
    LogLevel[LogLevel["Warning"] = 2] = "Warning";
    LogLevel[LogLevel["Error"] = 3] = "Error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
class Logger {
    constructor() {
        this.MinimumLogLevel = LogLevel.Normal;
        this.logChannel = vscode.window.createOutputChannel("PowerShell Extension Logs");
        this.logBasePath = path.resolve(__dirname, "../logs");
        utils.ensurePathExists(this.logBasePath);
        this.commands = [
            vscode.commands.registerCommand('PowerShell.ShowLogs', () => { this.showLogPanel(); }),
            vscode.commands.registerCommand('PowerShell.OpenLogFolder', () => { this.openLogFolder(); })
        ];
    }
    getLogFilePath(baseName) {
        return path.resolve(this.logSessionPath, `${baseName}.log`);
    }
    writeAtLevel(logLevel, message, ...additionalMessages) {
        if (logLevel >= this.MinimumLogLevel) {
            // TODO: Add timestamp
            this.logChannel.appendLine(message);
            fs.appendFile(this.logFilePath, message + os.EOL);
            additionalMessages.forEach((line) => {
                this.logChannel.appendLine(line);
                fs.appendFile(this.logFilePath, line + os.EOL);
            });
        }
    }
    write(message, ...additionalMessages) {
        this.writeAtLevel(LogLevel.Normal, message, ...additionalMessages);
    }
    writeVerbose(message, ...additionalMessages) {
        this.writeAtLevel(LogLevel.Verbose, message, ...additionalMessages);
    }
    writeWarning(message, ...additionalMessages) {
        this.writeAtLevel(LogLevel.Warning, message, ...additionalMessages);
    }
    writeAndShowWarning(message, ...additionalMessages) {
        this.writeWarning(message, ...additionalMessages);
        vscode.window.showWarningMessage(message, "Show Logs").then((selection) => {
            if (selection !== undefined) {
                this.showLogPanel();
            }
        });
    }
    writeError(message, ...additionalMessages) {
        this.writeAtLevel(LogLevel.Error, message, ...additionalMessages);
    }
    writeAndShowError(message, ...additionalMessages) {
        this.writeError(message, ...additionalMessages);
        vscode.window.showErrorMessage(message, "Show Logs").then((selection) => {
            if (selection !== undefined) {
                this.showLogPanel();
            }
        });
    }
    startNewLog(minimumLogLevel = "Normal") {
        this.MinimumLogLevel = this.logLevelNameToValue(minimumLogLevel.trim());
        this.logSessionPath =
            path.resolve(this.logBasePath, `${Math.floor(Date.now() / 1000)}-${vscode.env.sessionId}`);
        this.logFilePath = this.getLogFilePath("vscode-powershell");
        utils.ensurePathExists(this.logSessionPath);
    }
    logLevelNameToValue(logLevelName) {
        switch (logLevelName.toLowerCase()) {
            case "normal": return LogLevel.Normal;
            case "verbose": return LogLevel.Verbose;
            case "warning": return LogLevel.Warning;
            case "error": return LogLevel.Error;
            default: return LogLevel.Normal;
        }
    }
    dispose() {
        this.commands.forEach((command) => { command.dispose(); });
        this.logChannel.dispose();
    }
    showLogPanel() {
        this.logChannel.show();
    }
    openLogFolder() {
        if (this.logSessionPath) {
            // Open the folder in VS Code since there isn't an easy way to
            // open the folder in the platform's file browser
            vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(this.logSessionPath), true);
        }
    }
}
exports.Logger = Logger;
class LanguageClientLogger {
    constructor(logger) {
        this.logger = logger;
    }
    error(message) {
        this.logger.writeError(message);
    }
    warn(message) {
        this.logger.writeWarning(message);
    }
    info(message) {
        this.logger.write(message);
    }
    log(message) {
        this.logger.writeVerbose(message);
    }
}
exports.LanguageClientLogger = LanguageClientLogger;
//# sourceMappingURL=logging.js.map