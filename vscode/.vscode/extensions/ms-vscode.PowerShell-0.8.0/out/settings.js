/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
const vscode = require("vscode");
function load(myPluginId) {
    let configuration = vscode.workspace.getConfiguration(myPluginId);
    let defaultScriptAnalysisSettings = {
        enable: true,
        settingsPath: ""
    };
    let defaultDeveloperSettings = {
        powerShellExePath: undefined,
        bundledModulesPath: "../modules/",
        editorServicesLogLevel: "Normal",
        editorServicesWaitForDebugger: false
    };
    return {
        useX86Host: configuration.get("useX86Host", false),
        enableProfileLoading: configuration.get("enableProfileLoading", false),
        scriptAnalysis: configuration.get("scriptAnalysis", defaultScriptAnalysisSettings),
        developer: configuration.get("developer", defaultDeveloperSettings)
    };
}
exports.load = load;
//# sourceMappingURL=settings.js.map