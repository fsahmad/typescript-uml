import { Type } from "./type";

/**
 * Kind of primary type
 *
 * @export
 * @enum {number}
 */
export const enum PrimaryTypeKind {
    ImplicitAny = 0,
    PredefinedType = 1,
    TypeReference = 2,
    ObjectType = 3,
    ArrayType = 4,
    TupleType = 5,
    TypeQuery = 6,
    ThisType = 7,
}

/**
 * Primary type specification
 *
 * @export
 * @class PrimaryType
 * @extends {Type}
 */
export class PrimaryType extends Type {

    private _kind: PrimaryTypeKind;
    private _namespace: string;
    private _typeArguments: Type[];

    /**
     * Kind of primary type
     *
     * @type {PrimaryTypeKind}
     * @memberOf PrimaryType
     */
    public get kind(): PrimaryTypeKind {
        return this._kind;
    }

    public set kind(value: PrimaryTypeKind) {
        this._kind = value;
    }

    /**
     * Namespace of the type reference
     *
     * @type {string}
     * @memberOf PrimaryType
     */
    public get namespace(): string {
        return this._namespace;
    }

    public set namespace(value: string) {
        this._namespace = value;
    }

    /**
     * Array of type arguments, of a generic type, or a tuple type.
     *
     * Example: A type Dictionary<string,number> would have type arguments [string, number].
     *
     * @type {Type[]}
     * @memberOf PrimaryType
     */
    public get typeArguments(): Type[] {
        return this._typeArguments;
    }

    public set typeArguments(value: Type[]) {
        this._typeArguments = value;
    }

    /**
     * Creates an instance of PrimaryType.
     * @param {string} text Full text for the primary type
     * @param {PrimaryTypeKind} kind Kind of primary type
     *
     * @memberOf PrimaryType
     */
    constructor(text: string, kind: PrimaryTypeKind) {
        super(text);
        this._kind = kind;
        this._namespace = null;
        this._typeArguments = [];
    }
}
