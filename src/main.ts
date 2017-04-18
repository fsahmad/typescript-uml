import { existsSync, readFileSync } from "fs";
import * as ts from "typescript";
import { IClassDiagramOptions } from "./classDiagramOptions";
import { Delinter } from "./delint";
import * as formatter from "./formatter/index";
import { IParseOptions } from "./parseOptions";
import * as uml from "./uml/index";

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
    public static parseProject(rootPath: string, options?: IParseOptions): uml.CodeModel {
        const _options = this._setDefaultParseOptions(options);

        const tsConfig = this._readTsconfig(rootPath, _options);

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
            case "plantuml":
                _formatter = new formatter.PlantUMLFormatter();
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
     * Fill options object with default values for unspecified properties.
     *
     * @private
     * @static
     * @param {IParseOptions} [options] Options object
     * @returns {IParseOptions} Options object with default values for unspecified properties
     *
     * @memberOf TypeScriptUml
     */
    private static _setDefaultParseOptions(options?: IParseOptions): IParseOptions {
        const defaultOptions: IParseOptions = {
            exclude: [],
            include: null,
            tsconfig: null,
        };

        if (!options) {
            options = defaultOptions;
        }

        Object.keys(defaultOptions).forEach((key) => {
            if (!options.hasOwnProperty(key)) {
                (options as any)[key] = (defaultOptions as any)[key];
            }
        });
        return options;
    }

    /**
     * Find and parse the tsconfig.json file for the project in the searchPath.
     *
     * @private
     * @static
     * @param {string} searchPath Base search path to look for the tsconfig
     * @param {string} options Path of the tsconfig.json file to parse (optional)
     * @returns {ts.ParsedCommandLine} The parse results
     *
     * @memberOf TypeScriptUml
     */
    private static _readTsconfig(searchPath: string, options: IParseOptions): ts.ParsedCommandLine {
        const configPath = options.tsconfig ? options.tsconfig : ts.findConfigFile(searchPath, existsSync);

        const config = ts.readConfigFile(configPath, (path) => {
            return readFileSync(path).toString();
        });

        if (config.error) {
            const formattedDiagnostic = ts.formatDiagnostics([config.error], this._defaultFormatDiagnosticsHost);
            throw new Error(`Failed to read tsconfig file ${configPath}: ${formattedDiagnostic}`);
        }

        if (options.include) {
            config.config.include = options.include;
        }

        if (options.exclude) {
            if (!config.config.exclude) {
                config.config.exclude = options.exclude;
            } else {
                config.config.exclude = (config.config.exclude as string[]).concat(options.exclude);
            }
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
        if (exclude === null || exclude === undefined) {
            exclude = [];
        }

        codeModel.nodes.forEach((key, node) => {
            if (this._isIncluded(node, include) && !this._isExcluded(node, exclude)) {
                newCodeModel.nodes.setValue(key, codeModel.nodes.getValue(key));
            }
        });

        newCodeModel.associations = codeModel.associations.filter((association) => {
            return this._isIncluded(association, include) && !this._isExcluded(association, exclude);
        });

        newCodeModel.generalizations = codeModel.generalizations.filter((generalization) => {
            return this._isIncluded(generalization, include) && !this._isExcluded(generalization, exclude);
        });

        return newCodeModel;
    }

    private static _createExcludeCodeModel(
        codeModel: uml.CodeModel, exclude: string[]): uml.CodeModel {
        const newCodeModel = new uml.CodeModel();

        codeModel.nodes.forEach((key, node) => {
            if (!this._isExcluded(node, exclude)) {
                newCodeModel.nodes.setValue(key, codeModel.nodes.getValue(key));
            }
        });

        newCodeModel.associations = codeModel.associations.filter((association) => {
            return !this._isExcluded(association, exclude);
        });

        newCodeModel.generalizations = codeModel.generalizations.filter((generalization) => {
            return !this._isExcluded(generalization, exclude);
        });

        return newCodeModel;
    }

    private static _isIncluded(object: uml.Node | uml.Link, include: string[]): boolean {
        const node: uml.Node = object instanceof uml.Node ? object as uml.Node : null;
        const link: uml.Link = object instanceof uml.Link ? object as uml.Link : null;

        if (node) {
            return include.find((value) => {
                return node.identifier === value;

            }) !== undefined;
        } else if (link) {
            return include.find((value) => value === link.fromName) !== undefined &&
                include.find((value) => value === link.toName) !== undefined;
        }
    }

    private static _isExcluded(object: uml.Node | uml.Link, exclude: string[]): boolean {
        const node: uml.Node = object instanceof uml.Node ? object as uml.Node : null;
        const link: uml.Link = object instanceof uml.Link ? object as uml.Link : null;

        return exclude.find((value) => {
            if (node) {
                return node.identifier === value;
            } else if (link) {
                return link.fromName === value || link.toName === value;
            }
        }) !== undefined;
    }

    private constructor() {
        // Static class, don't allow instantiation
    }

}
