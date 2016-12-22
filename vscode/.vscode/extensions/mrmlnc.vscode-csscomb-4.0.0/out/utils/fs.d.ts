/// <reference types="node" />
import * as fs from 'fs';
export declare function fileExist(filepath: string): Promise<boolean>;
export declare function fileStat(filepath: string): Promise<fs.Stats>;
export declare function fileRead(filepath: string): Promise<string>;
