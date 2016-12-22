"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
exports.PowerShellLanguageId = 'powershell';
function ensurePathExists(targetPath) {
    // Ensure that the path exists
    try {
        fs.mkdirSync(targetPath);
    }
    catch (e) {
        // If the exception isn't to indicate that the folder
        // exists already, rethrow it.
        if (e.code != 'EEXIST') {
            throw e;
        }
    }
}
exports.ensurePathExists = ensurePathExists;
function getUniqueSessionId() {
    // We need to uniquely identify the current VS Code session
    // using some string so that we get a reliable pipe server name
    // for both the language and debug servers.
    if (os.platform() == "linux") {
        // Electron running on Linux uses an additional layer of
        // separation between parent and child processes which
        // prevents environment variables from being inherited
        // easily.  This causes VSCODE_PID to not be available
        // (for now) so use a different variable to get a
        // unique session.
        return process.env.VSCODE_PID;
    }
    else {
        // VSCODE_PID is available on Windows and OSX
        return process.env.VSCODE_PID;
    }
}
exports.getUniqueSessionId = getUniqueSessionId;
function getPipePath(pipeName) {
    if (os.platform() == "win32") {
        return "\\\\.\\pipe\\" + pipeName;
    }
    else {
        // On UNIX platforms the pipe will live under the temp path
        // For details on how this path is computed, see the corefx
        // source for System.IO.Pipes.PipeStream:
        // https://github.com/dotnet/corefx/blob/d0dc5fc099946adc1035b34a8b1f6042eddb0c75/src/System.IO.Pipes/src/System/IO/Pipes/PipeStream.Unix.cs#L340
        return path.resolve(os.tmpdir(), ".dotnet", "corefx", "pipe", pipeName);
    }
}
exports.getPipePath = getPipePath;
let sessionsFolder = path.resolve(__dirname, "..", "sessions/");
let sessionFilePath = path.resolve(sessionsFolder, "PSES-VSCode-" + process.env.VSCODE_PID);
// Create the sessions path if it doesn't exist already
ensurePathExists(sessionsFolder);
function getSessionFilePath() {
    return sessionFilePath;
}
exports.getSessionFilePath = getSessionFilePath;
function writeSessionFile(sessionDetails) {
    ensurePathExists(sessionsFolder);
    var writeStream = fs.createWriteStream(sessionFilePath);
    writeStream.write(JSON.stringify(sessionDetails));
    writeStream.close();
}
exports.writeSessionFile = writeSessionFile;
function readSessionFile() {
    let fileContents = fs.readFileSync(sessionFilePath, "utf-8");
    return JSON.parse(fileContents);
}
exports.readSessionFile = readSessionFile;
function deleteSessionFile() {
    try {
        fs.unlinkSync(sessionFilePath);
    }
    catch (e) {
    }
}
exports.deleteSessionFile = deleteSessionFile;
function checkIfFileExists(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.R_OK);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.checkIfFileExists = checkIfFileExists;
//# sourceMappingURL=utils.js.map