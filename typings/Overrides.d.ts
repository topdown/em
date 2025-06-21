interface Window {
    DEBUG: boolean;
    search: any;
}

declare class AnsiParser {
    constructor(callbacks: Dictionary<Function>)

    parse(data: string): any;
}

interface Array<T> {
    includes(value: T): boolean;
}

interface NodeBuffer extends Uint8Array {
    fill(value: number, offset?: number, end?: number): this;
}

interface ObjectConstructor {
    assign<A, B, C, D, E, F>(a: A, b: B, c: C, d: D, e: E, f: F): A & B & C & D & E & F;
}
