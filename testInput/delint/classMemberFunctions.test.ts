declare var value;

class Foo {
    // Test class
    private _privateFunction(): void {

    }

    protected protectedFunction(): void {

    }

    public publicFunction(): void {

    }

    implicitPublicFunction(): void {

    }

    public implicitReturnType() {

    }

    public stringReturnType(): string {
        return null;
    }

    public unionReturnType(): Foo | number | string {
        return null;
    }

    public parameterizedFunction(foo: string, bar: number, baz): void {

    }

    public initializerFunction(foo: string, bar: string = "default"): void {
        
    }

    public optionalParameterFunction(foo: string, bar?: string): void {
        
    }
}
