import { existsSync, readFileSync } from "fs";
import * as ts from "typescript";
import { Delinter } from "./delint";
import * as formatter from "./formatter/index";
import * as uml from "./uml/index";

export interface ITypeScriptUmlOptions {
    formatter?: "yuml";
}

export class TypeScriptUml {

    /**
     * Parse the source files in a TypeScript project
     *
     * @static
     * @param {string} rootPath Project root path, if tsConfigPath is not defined, the tsconfig.json file
     * will be searched in this directory
     * @param {string} [tsConfigPath] (Optional) Path to tsconfig.json file
     * @returns {uml.Program} The parse results
     *
     * @memberOf TypeScriptUml
     */
    public static parseProject(rootPath: string, tsConfigPath?: string): uml.Program {
        const tsConfig = this._readTsconfig(rootPath, tsConfigPath);

        const delinter = new Delinter();

        for (const f of tsConfig.fileNames) {
            this.parseFile(f, tsConfig.options.target, delinter);
        }

        return delinter.umlProgram;
    }

    /**
     * Parse a single TypeScript source file
     *
     * @static
     * @param {string} fileName Source file to parse
     * @param {ts.ScriptTarget} target TypeScript compiler script target
     * @param {Delinter} [delinter] (Optional) Delinter instance to use for delinting
     * @returns {uml.Program} The parse results
     *
     * @memberOf TypeScriptUml
     */
    public static parseFile(fileName: string, target: ts.ScriptTarget, delinter?: Delinter): uml.Program {
        if (!delinter) {
            delinter = new Delinter();
        }

        const sourceFile = ts.createSourceFile(fileName, readFileSync(fileName).toString(),
            target, /*setParentNodes */ true);

        delinter.parse(sourceFile);

        return delinter.umlProgram;
    }

    /**
     * Generate a uml class diagram from a uml program description.
     *
     * @static
     * @param {uml.Program} program Uml program description
     * @param {ITypeScriptUmlOptions} [options] Options
     * @returns {string} Class diagram formatted according to the specified options
     *
     * @memberOf TypeScriptUml
     */
    public static generateClassDiagram(program: uml.Program, options?: ITypeScriptUmlOptions): string {
        let _formatter: formatter.AbstractFormatter = null;
        const defaultOptions: ITypeScriptUmlOptions = {
            formatter: "yuml",
        };

        if (!options) {
            options = {};
        }

        if (!options.hasOwnProperty("formatter")) {
            options.formatter = defaultOptions.formatter;
        }

        switch (options.formatter) {
            case "yuml":
                _formatter = new formatter.YumlFormatter();
                break;
            default:
                throw new Error(`Unknown formatter ${options.formatter}`);
        }
        return _formatter.generateClassDiagram(program);
    }

    private static _defaultFormatDiagnosticsHost: ts.FormatDiagnosticsHost = {
        getCanonicalFileName: (fileName: string) => {
            return ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
        },
        getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
        getNewLine: () => ts.sys.newLine,
    };

    /**
     * Find and parse the tsconfig.json file for the project in the searchPath.
     *
     * @private
     * @static
     * @param {string} searchPath Base search path to look for the tsconfig
     * @param {string} [tsConfigPath] Path of the tsconfig.json file to parse (optional)
     * @returns {ts.ParsedCommandLine} The parse results
     *
     * @memberOf TypeScriptUml
     */
    private static _readTsconfig(searchPath: string, tsConfigPath?: string): ts.ParsedCommandLine {
        const configPath = tsConfigPath ? tsConfigPath : ts.findConfigFile(searchPath, existsSync);

        const config = ts.readConfigFile(configPath, (path) => {
            return readFileSync(path).toString();
        });

        if (config.error) {
            const formattedDiagnostic = ts.formatDiagnostics([config.error], this._defaultFormatDiagnosticsHost);
            throw new Error(`Failed to read tsconfig file ${configPath}: ${formattedDiagnostic}`);
        }

        const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, searchPath);

        if (parsed.errors.length > 0) {
            const formattedDiagnostic = ts.formatDiagnostics(parsed.errors, this._defaultFormatDiagnosticsHost);
            throw new Error(`Failed to parse tsconfig file ${configPath}: ${formattedDiagnostic}`);
        }

        return parsed;
    }

    private constructor() {
        // Static class, don't allow instantiation
    }

}
