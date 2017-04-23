import { Type } from "./type";

export const enum UnionOrIntersectionTypeKind {
    Union = 100,
    Intersection = 101,
}

/**
 * Union or intersection type specification
 *
 * @export
 * @class UnionOrIntersectionType
 * @extends {Type}
 */
export class UnionOrIntersectionType extends Type {
    private _kind: UnionOrIntersectionTypeKind;
    private _types: Type[];

    /**
     * Identify the type as Union or Intersection type
     *
     * @type {UnionOrIntersectionTypeKind}
     * @memberOf UnionOrIntersectionType
     */
    public get kind(): UnionOrIntersectionTypeKind {
        return this._kind;
    }

    public set kind(value: UnionOrIntersectionTypeKind) {
        this._kind = value;
    }

    /**
     * Array of type specifications for the union or intersection
     *
     * @type {Type[]}
     * @memberOf UnionOrIntersectionType
     */
    public get types(): Type[] {
        return this._types;
    }

    public set types(value: Type[]) {
        this._types = value;
    }

    constructor(text: string, kind: UnionOrIntersectionTypeKind) {
        super(text);
        this._kind = kind;
        this._types = [];
    }
}
