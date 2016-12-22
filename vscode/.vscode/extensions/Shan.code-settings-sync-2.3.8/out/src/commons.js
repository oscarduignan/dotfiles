"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const vscode = require('vscode');
const fileManager_1 = require('./fileManager');
const fs = require('fs');
var openurl = require('open');
var chokidar = require('chokidar');
class Commons {
    constructor(en) {
        this.en = en;
        this.ERROR_MESSAGE = "Error Logged In Console (Help menu > Toggle Developer Tools). You may open an issue using 'Sync : Open Issue' from advance setting command.";
    }
    LogException(error, message, msgBox) {
        if (error) {
            console.error(error);
            if (error.code == 500) {
                message = "Sync : Internet Not Connected or Unable to Connect to Github. Exception Logged in Console";
                msgBox = false;
            }
        }
        if (msgBox == true) {
            vscode.window.showErrorMessage(message);
        }
        else {
            vscode.window.setStatusBarMessage("");
            vscode.window.setStatusBarMessage(message, 5000);
        }
    }
    InternetConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                resolve(true);
            }));
        });
    }
    StartWatch() {
        let uploadStopped = true;
        Commons.extensionWatcher = chokidar.watch(this.en.ExtensionFolder, { depth: 0, ignoreInitial: true });
        Commons.configWatcher = chokidar.watch(this.en.PATH + "/User/", { ignoreInitial: true });
        //TODO : Uncomment the following lines when code allows feature to update Issue in github code repo - #14444
        // Commons.extensionWatcher.on('addDir', (path, stat)=> {
        //     if (uploadStopped) {
        //         uploadStopped = false;
        //         this.InitiateAutoUpload().then((resolve) => {
        //             uploadStopped = resolve;
        //         }, (reject) => {
        //             uploadStopped = reject;
        //         });
        //     }
        //     else {
        //         vscode.window.setStatusBarMessage("");
        //         vscode.window.setStatusBarMessage("Sync : Updating In Progres... Please Wait.", 3000);
        //     }
        // });
        // Commons.extensionWatcher.on('unlinkDir', (path)=> {
        //     if (uploadStopped) {
        //         uploadStopped = false;
        //         this.InitiateAutoUpload().then((resolve) => {
        //             uploadStopped = resolve;
        //         }, (reject) => {
        //             uploadStopped = reject;
        //         });
        //     }
        //     else {
        //         vscode.window.setStatusBarMessage("");
        //         vscode.window.setStatusBarMessage("Sync : Updating In Progres... Please Wait.", 3000);
        //     }
        // });
        Commons.configWatcher.on('change', (path) => {
            if (uploadStopped) {
                uploadStopped = false;
                let requiredFileChanged = false;
                requiredFileChanged = (path.indexOf("workspaceStorage") == -1) && (path.indexOf(".DS_Store") == -1) && (path.indexOf(this.en.FILE_LOCATIONSETTINGS_NAME) == -1) && (path.indexOf(this.en.APP_SUMMARY_NAME) == -1);
                console.log("Sync : File Change Detected On : " + path);
                if (requiredFileChanged) {
                    console.log("Sync : Initiating Auto-upload For File : " + path);
                    this.InitiateAutoUpload().then((resolve) => {
                        uploadStopped = resolve;
                    }, (reject) => {
                        uploadStopped = reject;
                    });
                }
                else {
                    uploadStopped = true;
                }
            }
            else {
                vscode.window.setStatusBarMessage("");
                vscode.window.setStatusBarMessage("Sync : Updating In Progres... Please Wait.", 3000);
            }
        });
    }
    InitiateAutoUpload() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                vscode.window.setStatusBarMessage("");
                vscode.window.setStatusBarMessage("Sync : Auto Upload Initiating.", 3000);
                setTimeout(function () {
                    vscode.commands.executeCommand('extension.updateSettings', "forceUpdate").then((res) => {
                        resolve(true);
                    });
                }, 3000);
            }));
        });
    }
    CloseWatch() {
        if (Commons.configWatcher != null) {
            Commons.configWatcher.close();
        }
        if (Commons.extensionWatcher != null) {
            Commons.extensionWatcher.close();
        }
    }
    InitializeSettings(askInformation, askGIST) {
        var self = this;
        var localSettings;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield fileManager_1.FileManager.FileExists(self.en.APP_SETTINGS).then(function (fileExist) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (fileExist) {
                        yield fileManager_1.FileManager.ReadFile(self.en.APP_SETTINGS).then(function (settin) {
                            return __awaiter(this, void 0, void 0, function* () {
                                vscode.window.setStatusBarMessage("");
                                vscode.window.setStatusBarMessage("Sync : Checking for Github Token and GIST.", 2000);
                                if (settin) {
                                    var set;
                                    set = JSON.parse(settin);
                                    vscode.window.setStatusBarMessage("");
                                    if (!askInformation) {
                                        resolve(set);
                                    }
                                    else {
                                        if (set.Token == null || set.Token == "") {
                                            openurl("https://github.com/settings/tokens");
                                            yield self.GetTokenAndSave(set).then(function (token) {
                                                if (!token) {
                                                    vscode.window.showErrorMessage("TOKEN NOT SAVED");
                                                    reject(false);
                                                }
                                                else {
                                                    set.Token = token;
                                                }
                                            }, function (err) {
                                                self.LogException(err, self.ERROR_MESSAGE, true);
                                                reject(err);
                                            });
                                        }
                                        if (askGIST) {
                                            if (set.Gist == null || set.Gist === "") {
                                                yield self.GetGistAndSave(set).then(function (Gist) {
                                                    if (Gist) {
                                                        set.Gist = Gist;
                                                    }
                                                    else {
                                                        vscode.window.showErrorMessage("Sync : Gist Not Saved.");
                                                        reject(false);
                                                    }
                                                }, function (err) {
                                                    self.LogException(err, self.ERROR_MESSAGE, true);
                                                    reject(err);
                                                });
                                            }
                                        }
                                    }
                                    resolve(set);
                                }
                                else {
                                    self.LogException(null, "Sync : Empty Settings Found", true);
                                    reject(false);
                                }
                            });
                        });
                    }
                    else {
                        //self.LogException(null, "Sync : Settings File Not Found");
                        resolve(localSettings);
                    }
                });
            });
        }));
    }
    SaveSettings(setting) {
        return __awaiter(this, void 0, void 0, function* () {
            var me = this;
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (setting) {
                    yield fileManager_1.FileManager.WriteFile(me.en.APP_SETTINGS, JSON.stringify(setting)).then(function (added) {
                        resolve(added);
                    }, function (err) {
                        reject(err);
                    });
                }
                else {
                    console.error("SaveSettings: Setting is :" + setting);
                    reject(false);
                }
            }));
        });
    }
    GetSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            var me = this;
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                yield fileManager_1.FileManager.FileExists(me.en.APP_SETTINGS).then(function (fileExist) {
                    return __awaiter(this, void 0, void 0, function* () {
                        //resolve(fileExist);
                        if (fileExist) {
                            yield fileManager_1.FileManager.ReadFile(me.en.APP_SETTINGS).then(function (settingsData) {
                                if (settingsData) {
                                    resolve(JSON.parse(settingsData));
                                }
                                else {
                                    console.log("Sync : " + me.en.APP_SETTINGS + " not Found.");
                                    resolve(null);
                                }
                            });
                        }
                        else {
                            console.log("Sync : " + me.en.APP_SETTINGS + " not Found.");
                            resolve(null);
                        }
                    });
                }, function (err) {
                    reject(err);
                });
            }));
        });
    }
    GetTokenAndSave(sett) {
        return __awaiter(this, void 0, void 0, function* () {
            var me = this;
            var opt = Commons.GetInputBox(true);
            return new Promise((resolve, reject) => {
                (function getToken() {
                    vscode.window.showInputBox(opt).then((token) => __awaiter(this, void 0, void 0, function* () {
                        if (token && token.trim()) {
                            token = token.trim();
                            if (token != 'esc') {
                                sett.Token = token;
                                yield me.SaveSettings(sett).then(function (saved) {
                                    if (saved) {
                                        vscode.window.setStatusBarMessage("Sync : Token Saved", 1000);
                                    }
                                    resolve(token);
                                }, function (err) {
                                    reject(err);
                                });
                            }
                        }
                        //  else {
                        //     if (token !== 'esc') {
                        //         getToken()
                        //     }
                        // }
                    }));
                }());
            });
        });
    }
    GetGistAndSave(sett) {
        return __awaiter(this, void 0, void 0, function* () {
            var me = this;
            var opt = Commons.GetInputBox(false);
            return new Promise((resolve, reject) => {
                (function getGist() {
                    vscode.window.showInputBox(opt).then((gist) => __awaiter(this, void 0, void 0, function* () {
                        if (gist && gist.trim()) {
                            gist = gist.trim();
                            if (gist != 'esc') {
                                sett.Gist = gist.trim();
                                yield me.SaveSettings(sett).then(function (saved) {
                                    if (saved) {
                                        vscode.window.setStatusBarMessage("Sync : Gist Saved", 1000);
                                    }
                                    resolve(gist);
                                }, function (err) {
                                    reject(err);
                                });
                            }
                        }
                        // else {
                        //     if (gist !== 'esc') {
                        //         getGist();
                        //     }
                        // }
                    }));
                })();
            });
        });
    }
    static GetInputBox(token) {
        if (token) {
            let options = {
                placeHolder: "Enter Github Personal Access Token",
                password: false,
                prompt: "Link opened to get the GitHub token. Enter token and press [Enter] or press / type 'esc' to cancel.",
                ignoreFocusOut: true
            };
            return options;
        }
        else {
            let options = {
                placeHolder: "Enter GIST ID",
                password: false,
                prompt: "Enter GIST ID from previously uploaded settings and press [Enter] or press / type 'esc' to cancel.",
                ignoreFocusOut: true
            };
            return options;
        }
    }
    ;
    GenerateSummmaryFile(upload, files, removedExtensions, addedExtensions, syncSettings) {
        var header = null;
        var downloaded = "Download";
        var updated = "Upload";
        var status = null;
        if (upload) {
            status = updated;
        }
        else {
            status = downloaded;
        }
        header = "\r\nFiles " + status + ". \r\n";
        var deletedExtension = "\r\nEXTENSIONS REMOVED : \r\n";
        var addedExtension = "\r\nEXTENSIONS ADDED : \r\n";
        var tempURI = this.en.APP_SUMMARY;
        console.log("Sync : " + "File Path For Summary Page : " + tempURI);
        //        var setting: vscode.Uri = vscode.Uri.parse("untitled:" + tempURI);
        var setting = vscode.Uri.file(tempURI);
        fs.openSync(setting.fsPath, 'w');
        //let a = vscode.window.activeTextEditor;
        vscode.workspace.openTextDocument(setting).then((a) => {
            vscode.window.showTextDocument(a, vscode.ViewColumn.One, true).then((e) => {
                e.edit(edit => {
                    edit.insert(new vscode.Position(0, 0), "VISUAL STUDIO CODE SETTINGS SYNC \r\n\r\n" + status + " SUMMARY \r\n\r\n");
                    edit.insert(new vscode.Position(1, 0), "-------------------- \r\n");
                    edit.insert(new vscode.Position(2, 0), "GITHUB TOKEN: " + syncSettings.Token + " \r\n");
                    edit.insert(new vscode.Position(3, 0), "GITHUB GIST: " + syncSettings.Gist + " \r\n");
                    var type = (syncSettings.publicGist == true) ? "Public" : "Secret";
                    edit.insert(new vscode.Position(4, 0), "GITHUB GIST TYPE: " + type + " \r\n \r\n");
                    edit.insert(new vscode.Position(5, 0), "-------------------- \r\n  \r\n");
                    edit.insert(new vscode.Position(6, 0), header + " \r\n");
                    var row = 6;
                    for (var i = 0; i < files.length; i++) {
                        var element = files[i];
                        if (element.fileName.indexOf(".") > 0) {
                            edit.insert(new vscode.Position(row, 0), element.fileName + " \r\n");
                            row += 1;
                        }
                    }
                    if (removedExtensions) {
                        edit.insert(new vscode.Position(row, 0), deletedExtension + " \r\n");
                        row += 1;
                        if (removedExtensions.length > 0) {
                            removedExtensions.forEach(ext => {
                                edit.insert(new vscode.Position(row, 0), ext.name + " - Version :" + ext.version + " \r\n");
                                row += 1;
                            });
                        }
                        else {
                            edit.insert(new vscode.Position(row, 0), "No Extension needs to be removed. \r\n");
                        }
                    }
                    if (addedExtensions) {
                        row += 1;
                        edit.insert(new vscode.Position(row, 0), " \r\n" + addedExtension + " \r\n");
                        row += 1;
                        if (addedExtensions.length > 0) {
                            addedExtensions.forEach(ext => {
                                edit.insert(new vscode.Position(row, 0), ext.name + " - Version :" + ext.version + " \r\n");
                                row += 1;
                            });
                        }
                        else {
                            edit.insert(new vscode.Position(row, 0), "No Extension needs to install. \r\n");
                        }
                    }
                });
                e.document.save();
                //vscode.commands.executeCommand("workbench.action.openPreviousRecentlyUsedEditorInGroup");
            });
        }, (error) => {
            console.error(error);
            return;
        });
    }
    ;
}
Commons.configWatcher = null;
Commons.extensionWatcher = null;
exports.Commons = Commons;
//# sourceMappingURL=commons.js.map