import { existsSync, readFileSync } from "fs";
import * as ts from "typescript";
import { Delinter } from "./delint";
import * as formatter from "./formatter/index";
import * as uml from "./uml/index";

export interface IClassDiagramOptions {
    /**
     * Formatter to use to generate diagram
     *
     * @type {"yuml"}
     * @memberOf IClassDiagramOptions
     */
    formatter?: "yuml";

    /**
     * Options for nodes
     *
     * @type {{
     *         include?: string[];
     *         exclude?: string[];
     *     }}
     * @memberOf IClassDiagramOptions
     */
    nodes?: {
        /**
         * Nodes to exclude.
         *
         * If specified, nodes matching the exclude will not be added to the diagram, nor will
         * nodes linked to them be added (unless linked to a non-excluded node).
         *
         * @type {string[]}
         */
        exclude?: string[];

        /**
         * Nodes to include.
         *
         * If specified, only the nodes matching the include will be used as starting points
         * to search for the nodes to add to the diagram.
         *
         * @type {string[]}
         */
        include?: string[];

        // depth?: number;
    };
}

export class TypeScriptUml {

    /**
     * Parse the source files in a TypeScript project
     *
     * @static
     * @param {string} rootPath Project root path, if tsConfigPath is not defined, the tsconfig.json file
     * will be searched in this directory
     * @param {string} [tsConfigPath] (Optional) Path to tsconfig.json file
     * @returns {uml.CodeModel} The parse results
     *
     * @memberOf TypeScriptUml
     */
    public static parseProject(rootPath: string, tsConfigPath?: string): uml.CodeModel {
        const tsConfig = this._readTsconfig(rootPath, tsConfigPath);

        const delinter = new Delinter();

        for (const f of tsConfig.fileNames) {
            this.parseFile(f, tsConfig.options.target, delinter);
        }

        return delinter.umlCodeModel;
    }

    /**
     * Parse a single TypeScript source file
     *
     * @static
     * @param {string} fileName Source file to parse
     * @param {ts.ScriptTarget} target TypeScript compiler script target
     * @param {Delinter} [delinter] (Optional) Delinter instance to use for delinting
     * @returns {uml.CodeModel} The parse results
     *
     * @memberOf TypeScriptUml
     */
    public static parseFile(fileName: string, target: ts.ScriptTarget, delinter?: Delinter): uml.CodeModel {
        if (!delinter) {
            delinter = new Delinter();
        }

        const sourceFile = ts.createSourceFile(fileName, readFileSync(fileName).toString(),
            target, /*setParentNodes */ true);

        delinter.parse(sourceFile);

        return delinter.umlCodeModel;
    }

    /**
     * Generate a uml class diagram from a uml CodeModel description.
     *
     * @static
     * @param {uml.CodeModel} codeModel Uml CodeModel description
     * @param {ITypeScriptUmlOptions} [options] Options
     * @returns {string} Class diagram formatted according to the specified options
     *
     * @memberOf TypeScriptUml
     */
    public static generateClassDiagram(codeModel: uml.CodeModel, options?: IClassDiagramOptions): string {
        let _formatter: formatter.AbstractFormatter = null;
        const defaultOptions: IClassDiagramOptions = {
            formatter: "yuml",
            nodes: {
                exclude: null,
                include: null,
            },
        };

        if (!options) {
            options = {};
        }

        if (!options.hasOwnProperty("formatter")) {
            options.formatter = defaultOptions.formatter;
        }

        if (!options.hasOwnProperty("nodes")) {
            options.nodes = defaultOptions.nodes;
        } else {
            if (!options.nodes.hasOwnProperty("include")) {
                options.nodes.include = defaultOptions.nodes.include;
            }
            if (!options.nodes.hasOwnProperty("exclude")) {
                options.nodes.exclude = defaultOptions.nodes.exclude;
            }
        }

        let diagramCodeModel = codeModel;
        if (options.nodes.include) {
            // Include nodes
            diagramCodeModel = this._createIncludeCodeModel(codeModel, options.nodes.include, options.nodes.exclude);
        } else if (options.nodes.exclude) {
            // Exclude nodes
            diagramCodeModel = this._createExcludeCodeModel(codeModel, options.nodes.exclude);
        }

        switch (options.formatter) {
            case "yuml":
                _formatter = new formatter.YumlFormatter();
                break;
            default:
                throw new Error(`Unknown formatter ${options.formatter}`);
        }
        return _formatter.generateClassDiagram(diagramCodeModel);
    }

    /* istanbul ignore next: code only used by TypeScript API, which is mocked during tests */
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

    private static _createIncludeCodeModel(
        codeModel: uml.CodeModel, include: string[], exclude: string[]): uml.CodeModel {
        const newCodeModel = new uml.CodeModel();
        return newCodeModel;
    }

    private static _createExcludeCodeModel(
        codeModel: uml.CodeModel, exclude: string[]): uml.CodeModel {
        const newCodeModel = new uml.CodeModel();

        codeModel.nodes.keys().filter((key) => {
            return exclude.find((value) => {
                return value === codeModel.nodes.getValue(key).name;
            }) === undefined;
        }).forEach((key) => {
            newCodeModel.nodes.setValue(key, codeModel.nodes.getValue(key));
        });

        newCodeModel.associations = codeModel.associations.filter((association) => {
            return exclude.find((value) => {
                return value === association.fromName || value === association.toName;
            }) === undefined;
        });

        newCodeModel.generalizations = codeModel.generalizations.filter((generalization) => {
            return exclude.find((value) => {
                return value === generalization.fromName || value === generalization.toName;
            }) === undefined;
        });

        return newCodeModel;
    }

    private constructor() {
        // Static class, don't allow instantiation
    }

}
