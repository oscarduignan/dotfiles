/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
"use strict";
const vscode = require('vscode');
// TODO: Get the main scenarios working
// - Run action when session already started
// - Run action when session not already started
// - Query for installed templates
// - Run Plaster on the selected template
class NewProjectFeature {
    constructor() {
        this.command =
            vscode.commands.registerCommand('PowerShell.NewProject', () => {
                if (!this.languageClient) {
                    this.waitingForClientToken = new vscode.CancellationTokenSource();
                    vscode.window.showQuickPick(["Cancel"], { placeHolder: "Please wait, starting PowerShell..." }, this.waitingForClientToken.token);
                }
                else {
                    this.showProjectTemplates();
                }
            });
    }
    setLanguageClient(languageClient) {
        this.languageClient = languageClient;
        if (this.waitingForClientToken) {
            this.waitingForClientToken.dispose();
            this.waitingForClientToken = undefined;
            this.showProjectTemplates();
        }
    }
    dispose() {
        this.command.dispose();
    }
    showProjectTemplates() {
        vscode.window
            .showQuickPick(this.getProjectTemplates(), { placeHolder: "Choose a template to create a new project" })
            .then(template => this.createProjectFromTemplate(template.template));
    }
    getProjectTemplates() {
        return this.languageClient
            .sendRequest(GetProjectTemplatesRequest.type, { includeInstalledModules: true })
            .then(response => {
            if (response.needsModuleInstall) {
                // TODO: Offer to install Plaster
                vscode.window.showErrorMessage("Plaster is not installed!");
                return Promise.reject("Plaster needs to be installed");
            }
            else {
                response.templates.map(template => {
                    return {
                        label: template.title,
                        description: `v${template.version} by ${template.author}, tags: ${template.tags}`,
                        detail: template.description,
                        template: template
                    };
                });
            }
        });
    }
    createProjectFromTemplate(template) {
        vscode.window
            .showInputBox({ placeHolder: "Enter an absolute path to the folder where the project should be created",
            ignoreFocusOut: true })
            .then(destinationPath => {
            if (destinationPath) {
                this.languageClient.sendRequest(NewProjectFromTemplateRequest.type, { templatePath: template.templatePath, destinationPath: destinationPath });
            }
            else {
                this.createProjectFromTemplate(template);
            }
        });
    }
}
exports.NewProjectFeature = NewProjectFeature;
var GetProjectTemplatesRequest;
(function (GetProjectTemplatesRequest) {
    GetProjectTemplatesRequest.type = { get method() { return 'powerShell/getProjectTemplates'; } };
})(GetProjectTemplatesRequest || (GetProjectTemplatesRequest = {}));
var NewProjectFromTemplateRequest;
(function (NewProjectFromTemplateRequest) {
    NewProjectFromTemplateRequest.type = { get method() { return 'powerShell/newProjectFromTemplate'; } };
})(NewProjectFromTemplateRequest || (NewProjectFromTemplateRequest = {}));
//# sourceMappingURL=NewProject.js.map