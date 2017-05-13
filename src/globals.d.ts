// tslint:disable

interface Array<T> {
    find(predicate: (element: T, index?: number, array?: Array<T>) => boolean): T;
}
