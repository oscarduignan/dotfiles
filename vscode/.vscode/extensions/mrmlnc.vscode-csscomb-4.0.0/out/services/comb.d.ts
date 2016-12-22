import * as vscode from 'vscode';
export interface IResult {
    css: string;
    range: vscode.Range;
}
export interface ITextAndRange {
    text: string;
    range: vscode.Range;
    embeddedRange: IEmbeddedResult;
}
export interface IEmbeddedResult {
    indent: string;
    range: vscode.Range;
}
export declare class Comb {
    private Comb;
    private config;
    private settings;
    private syntax;
    private document;
    private selection;
    private preset;
    constructor();
    use(document: vscode.TextDocument, selection: vscode.Selection, preset: any): Promise<IResult>;
    checkSyntax(document: vscode.TextDocument): boolean;
    private requireCore();
    private getTextAndRange();
    private searchEmbeddedStyles();
}
