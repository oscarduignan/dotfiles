"use strict";
var walker = require('walker');
var path = require('path');
var fs = require('fs');
var vscode = require('vscode');
;
var dirList = [];
function addToList(dirPath) {
    dirList.push({
        fullPath: dirPath,
        name: path.basename(dirPath) });
    return;
}
var VisualStudioCodeLocator = (function () {
    function VisualStudioCodeLocator() {
        //this.dirList = <DirList>[];
        this.maxDepth = -1;
        this.ignoredFolders = [];
    }
    VisualStudioCodeLocator.prototype.getPathDepth = function (s) {
        return s.split(path.sep).length;
    };
    VisualStudioCodeLocator.prototype.isMaxDeptReached = function (currentDepth, initialDepth) {
        return (this.maxDepth > 0) && ((currentDepth - initialDepth) > this.maxDepth);
    };
    VisualStudioCodeLocator.prototype.isFolderIgnored = function (folder) {
        return this.ignoredFolders.indexOf(folder) !== -1;
    };
    VisualStudioCodeLocator.prototype.initializeCfg = function () {
        this.ignoredFolders = vscode.workspace.getConfiguration('projectManager').get('vscode.ignoredFolders', []);
        this.maxDepth = vscode.workspace.getConfiguration('projectManager').get('vscode.maxDepthRecursion', -1);
    };
    VisualStudioCodeLocator.prototype.locateProjects = function (projectsDirList) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var promises = [];
            _this.initializeCfg();
            _this.clearDirList();
            projectsDirList.forEach(function (projectBasePath) {
                if (!fs.existsSync(projectBasePath)) {
                    //if (warnFoldersNotFound)
                    vscode.window.showWarningMessage('Directory ' + projectBasePath + ' does not exists.');
                    return;
                }
                var depth = _this.getPathDepth(projectBasePath);
                var promise = new Promise(function (resolve, reject) {
                    try {
                        walker(projectBasePath)
                            .filterDir(function (dir, stat) {
                            return !(_this.isFolderIgnored(path.basename(dir)) ||
                                _this.isMaxDeptReached(_this.getPathDepth(dir), depth));
                        })
                            .on('dir', _this.processDirectory)
                            .on('error', _this.handleError)
                            .on('end', function () {
                            resolve();
                        });
                    }
                    catch (error) {
                        reject(error);
                    }
                });
                promises.push(promise);
            });
            Promise.all(promises)
                .then(function () {
                vscode.window.setStatusBarMessage('PM-VSCode: Searching folders completed', 1500);
                resolve(dirList);
            })
                .catch(function (error) { vscode.window.showErrorMessage('Error while loading VSCode Projects.'); });
        });
    };
    VisualStudioCodeLocator.prototype.clearDirList = function () {
        dirList = [];
    };
    VisualStudioCodeLocator.prototype.processDirectory = function (absPath, stat) {
        vscode.window.setStatusBarMessage(absPath, 600);
        if (fs.existsSync(path.join(absPath, '.vscode'))) {
            addToList(absPath);
        }
    };
    VisualStudioCodeLocator.prototype.handleError = function (err) {
        console.log('Error walker:', err);
    };
    return VisualStudioCodeLocator;
}());
exports.VisualStudioCodeLocator = VisualStudioCodeLocator;
//# sourceMappingURL=vscodeLocator.js.map