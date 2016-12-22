export interface IConfiguration {
    preset: string | Object;
    ignoreFilesOnSave: string[];
    supportEmbeddedStyles: boolean;
    formatOnSave: boolean;
    useLatestCore: boolean;
}
export interface ICombConfiguration {
    exclude?: string[];
}
export declare class Config {
    private builtConfigs;
    private home;
    private root;
    constructor();
    scan(): Promise<ICombConfiguration>;
    /**
     * Returns settings for CSSComb
     */
    getEditorConfiguration(): IConfiguration;
    /**
     * Returns CSSComb config or 'syntaxError' if it broken.
     */
    private readConfigurationFile(filepath);
    /**
     * Attempt to find the configuration in the Editor settings.
     */
    private getConfigFromEditor();
    /**
     * Attempt to find the configuration inside open workspace.
     */
    private getConfigFromWorkspace();
    /**
     * Attempt to find the configuration inside user HOME directory.
     */
    private getConfigFromUser();
}
