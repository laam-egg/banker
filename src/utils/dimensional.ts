export class SizeMismatchError extends Error {
    constructor(context?: string) {
        super("Vectors must be of the same size" + (
            context ? ` (context: ${context})` : ""
        ));
    }
}

export function checkSameSize(v1: any[], v2: any[], context?: string): number {
    if (v1.length !== v2.length) {
        throw new SizeMismatchError(context);
    }
    return v1.length;
}
