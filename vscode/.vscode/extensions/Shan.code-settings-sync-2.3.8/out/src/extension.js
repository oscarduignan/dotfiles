'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const vscode = require('vscode');
const pluginService_1 = require('./pluginService');
const environmentPath_1 = require('./environmentPath');
const fileManager_1 = require('./fileManager');
const commons_1 = require('./commons');
const githubService_1 = require('./githubService');
const setting_1 = require('./setting');
const enums_1 = require('./enums');
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        var openurl = require('open');
        var fs = require('fs');
        var mainSyncSetting = null;
        var newSetting = new setting_1.LocalSetting();
        var settingChanged = false;
        var emptySetting = false;
        var en = new environmentPath_1.Environment(context);
        var common = new commons_1.Commons(en);
        //migration code starts
        yield common.InitializeSettings(false, false).then((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (resolve) {
                mainSyncSetting = resolve;
                if (!mainSyncSetting.Version || mainSyncSetting.Version < environmentPath_1.Environment.CURRENT_VERSION) {
                    settingChanged = true;
                    newSetting.Version = environmentPath_1.Environment.CURRENT_VERSION;
                    if (mainSyncSetting.Token) {
                        let keys = Object.keys(mainSyncSetting);
                        keys.forEach(keyName => {
                            if (keyName != "Version") {
                                if (mainSyncSetting[keyName]) {
                                    newSetting[keyName] = mainSyncSetting[keyName];
                                }
                            }
                        });
                    }
                }
                else {
                    newSetting = mainSyncSetting;
                    let tokenAvailable = (newSetting.Token != null) && (newSetting.Token != "");
                    let gistAvailable = (newSetting.Gist != null) && (newSetting.Gist != "");
                    if (tokenAvailable == true && gistAvailable == true && newSetting.autoDownload == true) {
                        vscode.commands.executeCommand('extension.downloadSettings');
                    }
                }
            }
            else {
                settingChanged = true;
                emptySetting = true;
            }
            if (settingChanged) {
                yield common.SaveSettings(newSetting).then(function (added) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (added) {
                            if (!emptySetting) {
                                vscode.window.showInformationMessage("Sync : Migration to new version complete. Read Release Notes for details.");
                            }
                            else {
                                vscode.window.showInformationMessage("Sync : Settings Created.");
                            }
                        }
                        else {
                            vscode.window.showErrorMessage("GIST and Token couldn't be migrated to new version. You need to add them again.");
                        }
                    });
                });
            }
        }), (reject) => {
            common.LogException(reject, common.ERROR_MESSAGE, false);
        });
        //migration code ends
        var tokenAvailable = newSetting.Token != null && newSetting.Token != "";
        var gistAvailable = newSetting.Gist != null && newSetting.Gist != "";
        let appSetting = en.APP_SETTINGS;
        let appSummary = en.APP_SUMMARY;
        while (appSetting.indexOf("/") > -1) {
            appSetting = appSetting.replace("/", "\\");
        }
        while (appSummary.indexOf("/") > -1) {
            appSummary = appSummary.replace("/", "\\");
        }
        if (newSetting.autoUpload && tokenAvailable && gistAvailable) {
            common.StartWatch();
        }
        var updateSettings = vscode.commands.registerCommand('extension.updateSettings', function () {
            return __awaiter(this, arguments, void 0, function* () {
                let args = arguments;
                var en = new environmentPath_1.Environment(context);
                var common = new commons_1.Commons(en);
                common.CloseWatch();
                var myGi = null;
                var dateNow = new Date();
                var syncSetting = new setting_1.LocalSetting();
                var allSettingFiles = new Array();
                var uploadedExtensions = new Array();
                yield common.InitializeSettings(true, false).then((resolve) => __awaiter(this, void 0, void 0, function* () {
                    syncSetting = resolve;
                    myGi = new githubService_1.GithubService(syncSetting.Token);
                    yield startGitProcess();
                }), (reject) => {
                    common.LogException(reject, common.ERROR_MESSAGE, true);
                    return;
                });
                function startGitProcess() {
                    return __awaiter(this, void 0, void 0, function* () {
                        vscode.window.setStatusBarMessage("Sync : Uploading / Updating Your Settings In Github.");
                        if (!syncSetting.allowUpload) {
                            vscode.window.setStatusBarMessage("Sync : Upload to Other User GIST Not Allowed. Reset Settings Required!");
                            return;
                        }
                        if (syncSetting.Token != null && syncSetting.Token != "") {
                            syncSetting.lastUpload = dateNow;
                            vscode.window.setStatusBarMessage("Sync : Reading Settings and Extensions.");
                            var settingFile = yield fileManager_1.FileManager.GetFile(en.FILE_SETTING, en.FILE_SETTING_NAME);
                            var launchFile = yield fileManager_1.FileManager.GetFile(en.FILE_LAUNCH, en.FILE_LAUNCH_NAME);
                            var destinationKeyBinding = "";
                            if (en.OsType == enums_1.OsType.Mac) {
                                destinationKeyBinding = en.FILE_KEYBINDING_MAC;
                            }
                            else {
                                destinationKeyBinding = en.FILE_KEYBINDING_DEFAULT;
                            }
                            var keybindingFile = yield fileManager_1.FileManager.GetFile(en.FILE_KEYBINDING, destinationKeyBinding);
                            var localeFile = yield fileManager_1.FileManager.GetFile(en.FILE_LOCALE, en.FILE_LOCALE_NAME);
                            if (settingFile) {
                                allSettingFiles.push(settingFile);
                            }
                            if (launchFile) {
                                allSettingFiles.push(launchFile);
                            }
                            if (keybindingFile) {
                                allSettingFiles.push(keybindingFile);
                            }
                            if (localeFile) {
                                allSettingFiles.push(localeFile);
                            }
                            uploadedExtensions = pluginService_1.PluginService.CreateExtensionList();
                            uploadedExtensions.sort(function (a, b) {
                                return a.name.localeCompare(b.name);
                            });
                            // var remoteList = ExtensionInformation.fromJSONList(file.content);
                            // var deletedList = PluginService.GetDeletedExtensions(uploadedExtensions);
                            var fileName = en.FILE_EXTENSION_NAME;
                            var filePath = en.FILE_EXTENSION;
                            var fileContent = JSON.stringify(uploadedExtensions, undefined, 2);
                            ;
                            var file = new fileManager_1.File(fileName, fileContent, filePath);
                            allSettingFiles.push(file);
                            var snippetFiles = yield fileManager_1.FileManager.ListFiles(en.FOLDER_SNIPPETS);
                            snippetFiles.forEach(snippetFile => {
                                allSettingFiles.push(snippetFile);
                            });
                            var extProp = new setting_1.CloudSetting();
                            extProp.lastUpload = dateNow;
                            fileName = en.FILE_CLOUDSETTINGS_NAME;
                            fileContent = JSON.stringify(extProp);
                            file = new fileManager_1.File(fileName, fileContent, "");
                            allSettingFiles.push(file);
                            var newGIST = false;
                            if (syncSetting.Gist == null || syncSetting.Gist === "") {
                                newGIST = true;
                                yield myGi.CreateEmptyGIST(syncSetting.publicGist).then(function (gistID) {
                                    return __awaiter(this, void 0, void 0, function* () {
                                        if (gistID) {
                                            syncSetting.Gist = gistID;
                                            vscode.window.setStatusBarMessage("Sync : Empty GIST ID: " + syncSetting.Gist + " created To insert files, in Process...");
                                        }
                                        else {
                                            vscode.window.showInformationMessage("GIST UNABLE TO CREATE");
                                            return;
                                        }
                                    });
                                }, function (error) {
                                    common.LogException(error, common.ERROR_MESSAGE, true);
                                    return;
                                });
                            }
                            yield myGi.ReadGist(syncSetting.Gist).then(function (gistObj) {
                                return __awaiter(this, void 0, void 0, function* () {
                                    if (gistObj) {
                                        vscode.window.setStatusBarMessage("Sync : Uploading Files Data.");
                                        gistObj = myGi.UpdateGIST(gistObj, allSettingFiles);
                                        yield myGi.SaveGIST(gistObj).then(function (saved) {
                                            return __awaiter(this, void 0, void 0, function* () {
                                                if (saved) {
                                                    yield common.SaveSettings(syncSetting).then(function (added) {
                                                        if (added) {
                                                            if (newGIST) {
                                                                vscode.window.showInformationMessage("Uploaded Successfully." + " GIST ID :  " + syncSetting.Gist + " . Please copy and use this ID in other machines to sync all settings.");
                                                            }
                                                            else {
                                                                vscode.window.setStatusBarMessage("");
                                                                vscode.window.setStatusBarMessage("Uploaded Successfully.", 5000);
                                                            }
                                                            if (syncSetting.showSummary) {
                                                                common.GenerateSummmaryFile(true, allSettingFiles, null, uploadedExtensions, syncSetting);
                                                            }
                                                            if (syncSetting.autoUpload) {
                                                                common.StartWatch();
                                                            }
                                                            vscode.window.setStatusBarMessage("");
                                                        }
                                                    }, function (err) {
                                                        common.LogException(err, common.ERROR_MESSAGE, true);
                                                        return;
                                                    });
                                                }
                                                else {
                                                    vscode.window.showErrorMessage("GIST NOT SAVED");
                                                    return;
                                                }
                                            });
                                        }, function (error) {
                                            common.LogException(error, common.ERROR_MESSAGE, true);
                                            return;
                                        });
                                    }
                                    else {
                                        vscode.window.showErrorMessage("GIST ID: " + syncSetting.Gist + " UNABLE TO READ.");
                                        return;
                                    }
                                });
                            }, function (gistReadError) {
                                common.LogException(gistReadError, common.ERROR_MESSAGE, true);
                                return;
                            });
                        }
                        else {
                            vscode.window.showErrorMessage("ERROR ! Github Account Token Not Set");
                        }
                    });
                }
            });
        });
        var downloadSettings = vscode.commands.registerCommand('extension.downloadSettings', () => __awaiter(this, void 0, void 0, function* () {
            var en = new environmentPath_1.Environment(context);
            var common = new commons_1.Commons(en);
            common.CloseWatch();
            var myGi = null;
            var syncSetting = new setting_1.LocalSetting();
            yield common.InitializeSettings(true, true).then((resolve) => __awaiter(this, void 0, void 0, function* () {
                syncSetting = resolve;
                var actionPromises = new Array();
                yield StartDownload();
            }), (reject) => {
                common.LogException(reject, common.ERROR_MESSAGE, true);
            });
            function StartDownload() {
                return __awaiter(this, void 0, void 0, function* () {
                    myGi = new githubService_1.GithubService(syncSetting.Token);
                    vscode.window.setStatusBarMessage("");
                    vscode.window.setStatusBarMessage("Sync : Reading Settings Online.", 2000);
                    myGi.ReadGist(syncSetting.Gist).then(function (res) {
                        return __awaiter(this, void 0, void 0, function* () {
                            var addedExtensions = new Array();
                            var deletedExtensions = new Array();
                            var updatedFiles = new Array();
                            var actionList = new Array();
                            if (res) {
                                var keys = Object.keys(res.files);
                                if (keys.indexOf(en.FILE_CLOUDSETTINGS_NAME) > -1) {
                                    var cloudSett = JSON.parse(res.files[en.FILE_CLOUDSETTINGS_NAME].content);
                                    var stat = (syncSetting.lastUpload == cloudSett.lastUpload) || (syncSetting.lastDownload == cloudSett.lastUpload);
                                    if (!syncSetting.forceDownload) {
                                        if (stat) {
                                            vscode.window.setStatusBarMessage("");
                                            vscode.window.setStatusBarMessage("Sync : You already have latest version of saved settings.", 5000);
                                            return;
                                        }
                                    }
                                    syncSetting.lastDownload = cloudSett.lastUpload;
                                }
                                keys.forEach(fileName => {
                                    if (res.files[fileName]) {
                                        if (res.files[fileName].content) {
                                            if (fileName.indexOf(".") > -1) {
                                                var f = new fileManager_1.File(fileName, res.files[fileName].content, null);
                                                updatedFiles.push(f);
                                            }
                                        }
                                    }
                                    else {
                                        console.log(fileName + " key in response is empty.");
                                    }
                                });
                                for (var index = 0; index < updatedFiles.length; index++) {
                                    var file = updatedFiles[index];
                                    var path = null;
                                    var writeFile = false;
                                    var content = null;
                                    switch (file.fileName) {
                                        case en.FILE_LAUNCH_NAME: {
                                            writeFile = true;
                                            path = en.FILE_LAUNCH;
                                            content = file.content;
                                            break;
                                        }
                                        case en.FILE_SETTING_NAME: {
                                            writeFile = true;
                                            path = en.FILE_SETTING;
                                            content = file.content;
                                            break;
                                        }
                                        case en.FILE_KEYBINDING_DEFAULT:
                                        case en.FILE_KEYBINDING_MAC: {
                                            writeFile = en.OsType == enums_1.OsType.Mac ? file.fileName == en.FILE_KEYBINDING_MAC : file.fileName == en.FILE_KEYBINDING_DEFAULT;
                                            path = en.FILE_KEYBINDING;
                                            if (writeFile) {
                                                content = file.content;
                                            }
                                            break;
                                        }
                                        case en.FILE_LOCALE_NAME: {
                                            writeFile = true;
                                            path = en.FILE_LOCALE;
                                            content = file.content;
                                            break;
                                        }
                                        case en.FILE_EXTENSION_NAME: {
                                            writeFile = false;
                                            var extensionlist = pluginService_1.PluginService.CreateExtensionList();
                                            extensionlist.sort(function (a, b) {
                                                return a.name.localeCompare(b.name);
                                            });
                                            var remoteList = pluginService_1.ExtensionInformation.fromJSONList(file.content);
                                            var deletedList = pluginService_1.PluginService.GetDeletedExtensions(remoteList);
                                            for (var deletedItemIndex = 0; deletedItemIndex < deletedList.length; deletedItemIndex++) {
                                                var deletedExtension = deletedList[deletedItemIndex];
                                                (function (deletedExtension, ExtensionFolder) {
                                                    return __awaiter(this, void 0, void 0, function* () {
                                                        yield actionList.push(pluginService_1.PluginService.DeleteExtension(deletedExtension, en.ExtensionFolder)
                                                            .then((res) => {
                                                            //vscode.window.showInformationMessage(deletedExtension.name + '-' + deletedExtension.version + " is removed.");
                                                            deletedExtensions.push(deletedExtension);
                                                        }, (rej) => {
                                                            common.LogException(rej, common.ERROR_MESSAGE, true);
                                                        }));
                                                    });
                                                }(deletedExtension, en.ExtensionFolder));
                                            }
                                            var missingList = pluginService_1.PluginService.GetMissingExtensions(remoteList);
                                            if (missingList.length == 0) {
                                                vscode.window.setStatusBarMessage("");
                                                vscode.window.setStatusBarMessage("Sync : No Extension needs to be installed.", 2000);
                                            }
                                            else {
                                                vscode.window.setStatusBarMessage("Sync : Installing Extensions in background.");
                                                missingList.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                                                    yield actionList.push(pluginService_1.PluginService.InstallExtension(element, en.ExtensionFolder)
                                                        .then(function () {
                                                        addedExtensions.push(element);
                                                        //var name = element.publisher + '.' + element.name + '-' + element.version;
                                                        //vscode.window.showInformationMessage("Extension " + name + " installed Successfully");
                                                    }));
                                                }));
                                            }
                                            break;
                                        }
                                        default: {
                                            if (file.fileName.indexOf("keybinding") == -1) {
                                                if (file.fileName.indexOf(".") > -1) {
                                                    writeFile = true;
                                                    yield fileManager_1.FileManager.CreateDirectory(en.FOLDER_SNIPPETS);
                                                    var snippetFile = en.FOLDER_SNIPPETS.concat(file.fileName); //.concat(".json");
                                                    path = snippetFile;
                                                    content = file.content;
                                                }
                                            }
                                            break;
                                        }
                                    }
                                    if (writeFile) {
                                        yield actionList.push(fileManager_1.FileManager.WriteFile(path, content).then(function (added) {
                                            //TODO : add Name attribute in File and show information message here with name , when required.
                                        }, function (error) {
                                            common.LogException(error, common.ERROR_MESSAGE, true);
                                            return;
                                        }));
                                    }
                                }
                            }
                            else {
                                console.log(res);
                                vscode.window.showErrorMessage("Sync : Unable To Read Gist");
                            }
                            Promise.all(actionList)
                                .then(function () {
                                return __awaiter(this, void 0, void 0, function* () {
                                    // if (!syncSetting.showSummary) {
                                    //     if (missingList.length == 0) {
                                    //         //vscode.window.showInformationMessage("No extension need to be installed");
                                    //     }
                                    //     else {
                                    //         //extension message when summary is turned off
                                    //         vscode.window.showInformationMessage("Sync : " + missingList.length + " extensions installed Successfully, Restart Required.");
                                    //     }
                                    //     if (deletedExtensions.length > 0) {
                                    //         vscode.window.showInformationMessage("Sync : " + deletedExtensions.length + " extensions deleted Successfully, Restart Required.");
                                    //     }
                                    // }
                                    yield common.SaveSettings(syncSetting).then(function (added) {
                                        return __awaiter(this, void 0, void 0, function* () {
                                            if (added) {
                                                //vscode.window.showInformationMessage("Sync : Download Complete.");
                                                if (syncSetting.showSummary) {
                                                    common.GenerateSummmaryFile(false, updatedFiles, deletedExtensions, addedExtensions, syncSetting);
                                                }
                                                vscode.window.setStatusBarMessage("");
                                                vscode.window.setStatusBarMessage("Sync : Download Complete.", 5000);
                                                if (newSetting.autoUpload) {
                                                    common.StartWatch();
                                                }
                                            }
                                            else {
                                                vscode.window.showErrorMessage("Sync : Unable to save extension settings file.");
                                            }
                                        });
                                    }, function (errSave) {
                                        common.LogException(errSave, common.ERROR_MESSAGE, true);
                                        return;
                                    });
                                });
                            })
                                .catch(function (e) {
                                common.LogException(e, common.ERROR_MESSAGE, true);
                            });
                        });
                    }, function (err) {
                        common.LogException(err, common.ERROR_MESSAGE, true);
                        return;
                    });
                });
            }
        }));
        var resetSettings = vscode.commands.registerCommand('extension.resetSettings', () => __awaiter(this, void 0, void 0, function* () {
            var en = new environmentPath_1.Environment(context);
            var fManager;
            var common = new commons_1.Commons(en);
            var syncSetting = new setting_1.LocalSetting();
            yield common.InitializeSettings(false, false).then((resolve) => __awaiter(this, void 0, void 0, function* () {
                syncSetting = resolve;
                yield Init();
            }), (reject) => {
                common.LogException(reject, common.ERROR_MESSAGE, true);
            });
            function Init() {
                return __awaiter(this, void 0, void 0, function* () {
                    vscode.window.setStatusBarMessage("Sync : Resetting Your Settings.", 2000);
                    try {
                        syncSetting = new setting_1.LocalSetting();
                        yield common.SaveSettings(syncSetting).then(function (added) {
                            if (added) {
                                vscode.window.showInformationMessage("GIST ID and Github Token Cleared.");
                            }
                        }, function (err) {
                            common.LogException(err, common.ERROR_MESSAGE, true);
                            return;
                        });
                    }
                    catch (err) {
                        common.LogException(err, "Unable to clear settings. Error Logged on console. Please open an issue.", true);
                    }
                });
            }
        }));
        var howSettings = vscode.commands.registerCommand('extension.HowSettings', () => __awaiter(this, void 0, void 0, function* () {
            openurl("http://shanalikhan.github.io/2015/12/15/Visual-Studio-Code-Sync-Settings.html");
        }));
        var otherOptions = vscode.commands.registerCommand('extension.otherOptions', () => __awaiter(this, void 0, void 0, function* () {
            var en = new environmentPath_1.Environment(context);
            var common = new commons_1.Commons(en);
            var setting = null;
            //var myGi: GithubService = null;
            var tokenAvailable = false;
            var gistAvailable = false;
            yield common.InitializeSettings(false, false).then(function (set) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (set) {
                        setting = set;
                        tokenAvailable = setting.Token != null && setting.Token != "";
                        gistAvailable = setting.Gist != null && setting.Gist != "";
                        if (tokenAvailable) {
                        }
                    }
                });
            }, function (err) {
                common.LogException(err, "Unable to toggle summary. Please open an issue.", true);
            });
            let items = new Array();
            items.push("Sync : Open Extension Settings");
            items.push("Sync : Toggle Public / Private GIST Mode & Reset GIST");
            items.push("Sync : Fetch Other User's Settings");
            items.push("Sync : Open Issue");
            items.push("Sync : Release Notes");
            items.push("Sync : Toggle Auto-Download On Startup");
            items.push("Sync : Toggle Show Summary Page On Upload / Download");
            items.push("Sync : Toggle Force Download");
            items.push("Sync : Toggle Auto-Upload On Settings Change");
            var selectedItem = 0;
            var settingChanged = false;
            var teims = vscode.window.showQuickPick(items).then((resolve) => __awaiter(this, void 0, void 0, function* () {
                switch (resolve) {
                    case items[0]: {
                        if (setting.openLinks) {
                            openurl("http://shanalikhan.github.io/2016/07/31/Visual-Studio-code-sync-setting-edit-manually.html");
                            vscode.window.showInformationMessage("Sync : URL Opened displaying about the settings options in details.");
                        }
                        var fsetting = vscode.Uri.file(en.APP_SETTINGS);
                        vscode.workspace.openTextDocument(fsetting).then((a) => {
                            vscode.window.showTextDocument(a, 1, false);
                        });
                        break;
                    }
                    case items[1]: {
                        // set gist public
                        settingChanged = true;
                        selectedItem = 2;
                        if (setting.publicGist) {
                            setting.publicGist = false;
                        }
                        else {
                            setting.publicGist = true;
                        }
                        setting.Gist = null;
                        setting.lastDownload = null;
                        setting.lastUpload = null;
                        break;
                    }
                    case items[2]: {
                        selectedItem = 3;
                        if (tokenAvailable) {
                            yield common.GetGistAndSave(setting).then(function (gist) {
                                if (gist) {
                                    settingChanged = true;
                                    setting.allowUpload = false;
                                    setting.Gist = gist;
                                }
                                else {
                                    vscode.window.showErrorMessage("GIST NOT SAVED");
                                    return;
                                }
                            }, function (err) {
                                common.LogException(err, common.ERROR_MESSAGE, true);
                                selectedItem = 0;
                                return;
                            });
                        }
                        else {
                            vscode.window.showErrorMessage("Token Not Set.");
                            return;
                        }
                        break;
                    }
                    case items[3]: {
                        openurl("https://github.com/shanalikhan/code-settings-sync/issues/new");
                        break;
                    }
                    case items[4]: {
                        openurl("http://shanalikhan.github.io/2016/05/14/Visual-studio-code-sync-settings-release-notes.html");
                        break;
                    }
                    case items[5]: {
                        //auto downlaod on startup
                        selectedItem = 6;
                        settingChanged = true;
                        if (!setting) {
                            vscode.commands.executeCommand('extension.HowSettings');
                            return;
                        }
                        if (!tokenAvailable || !gistAvailable) {
                            vscode.commands.executeCommand('extension.HowSettings');
                            return;
                        }
                        if (setting.autoDownload) {
                            setting.autoDownload = false;
                        }
                        else {
                            setting.autoDownload = true;
                        }
                        break;
                    }
                    case items[6]: {
                        //page summary toggle
                        selectedItem = 7;
                        settingChanged = true;
                        if (!tokenAvailable || !gistAvailable) {
                            vscode.commands.executeCommand('extension.HowSettings');
                            return;
                        }
                        if (setting.showSummary) {
                            setting.showSummary = false;
                        }
                        else {
                            setting.showSummary = true;
                        }
                        break;
                    }
                    case items[7]: {
                        //toggle force download
                        selectedItem = 8;
                        settingChanged = true;
                        if (setting.forceDownload) {
                            setting.forceDownload = false;
                        }
                        else {
                            setting.forceDownload = true;
                        }
                        break;
                    }
                    case items[8]: {
                        //toggle auto upload
                        selectedItem = 9;
                        settingChanged = true;
                        if (setting.autoUpload) {
                            setting.autoUpload = false;
                        }
                        else {
                            setting.autoUpload = true;
                        }
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }), (reject) => {
                common.LogException(reject, "Error", true);
                return;
            }).then((resolve) => __awaiter(this, void 0, void 0, function* () {
                if (settingChanged) {
                    yield common.SaveSettings(setting).then(function (added) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (added) {
                                switch (selectedItem) {
                                    case 2: {
                                        if (setting.publicGist) {
                                            vscode.window.showInformationMessage("Sync : GIST Reset! Public GIST Enabled. Upload Now to get new GIST ID.");
                                        }
                                        else {
                                            vscode.window.showInformationMessage("Sync : GIST Reset! Private GIST Enabled. Upload Now to get new GIST ID.");
                                        }
                                        break;
                                    }
                                    case 3: {
                                        vscode.window.showInformationMessage("Sync : Configured! Now you can download the settings when the GIST Changes.");
                                        vscode.commands.executeCommand('extension.downloadSettings');
                                        break;
                                    }
                                    case 6: {
                                        if (setting.autoDownload) {
                                            vscode.window.showInformationMessage("Sync : Auto Download turned ON upon VSCode Startup.");
                                        }
                                        else {
                                            vscode.window.showInformationMessage("Sync : Auto Download turned OFF upon VSCode Startup.");
                                        }
                                        break;
                                    }
                                    case 7: {
                                        if (setting.showSummary) {
                                            vscode.window.showInformationMessage("Sync : Summary Will be shown upon download / upload.");
                                        }
                                        else {
                                            vscode.window.showInformationMessage("Sync : Summary Will be hidden upon download / upload.");
                                        }
                                        break;
                                    }
                                    case 8: {
                                        if (setting.forceDownload) {
                                            vscode.window.showInformationMessage("Sync : Force Download Turned On.");
                                        }
                                        else {
                                            vscode.window.showInformationMessage("Sync : Force Download Turned Off.");
                                        }
                                        break;
                                    }
                                    case 9: {
                                        if (setting.autoUpload) {
                                            vscode.window.showInformationMessage("Sync : Auto upload on Setting Change Turned On. Will be affected after restart.");
                                        }
                                        else {
                                            vscode.window.showInformationMessage("Sync : Auto upload on Setting Change Turned Off.");
                                        }
                                        break;
                                    }
                                }
                            }
                            else {
                                vscode.window.showErrorMessage("Unable to Toggle.");
                            }
                        });
                    }, function (err) {
                        common.LogException(err, "Unable to toggle. Please open an issue.", true);
                        return;
                    });
                }
            }), (reject) => {
                common.LogException(reject, "Error", true);
                return;
            });
        }));
        context.subscriptions.push(updateSettings);
        context.subscriptions.push(downloadSettings);
        context.subscriptions.push(resetSettings);
        context.subscriptions.push(howSettings);
        context.subscriptions.push(otherOptions);
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map