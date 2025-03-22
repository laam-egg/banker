import { checkSameSize } from "./dimensional";

export type Vector = number[];

export function createVector(d: number): Vector {
    return Array(d).fill(0);
}

export function addVectors(v1: Vector, v2: Vector): Vector {
    checkSameSize(v1, v2, `${v1} vs ${v2}`);
    return v1.map((value, i) => value + v2[i]);
}

export function subtractVectors(v1: Vector, v2: Vector): Vector {
    checkSameSize(v1, v2, `${v1} vs ${v2}`);
    return v1.map((value, i) => value - v2[i]);
}

export function negateVector(v: Vector): Vector {
    return v.map(value => -value);
}

export function isVectorLessThan(v1: Vector, v2: Vector): boolean {
    checkSameSize(v1, v2, `${v1} vs ${v2}`);
    return v1.every((value, i) => value < v2[i]);
}

export function isVectorLessThanOrEqualTo(v1: Vector, v2: Vector): boolean {
    checkSameSize(v1, v2, `${v1} vs ${v2}`);
    return v1.every((value, i) => value <= v2[i]);
}

// export function isVectorGreaterThan(v1: Vector, v2: Vector): boolean {
//     checkSameSize(v1, v2, `${v1} vs ${v2}`);
//     return v1.every((value, i) => value > v2[i]);
// }

// export function isVectorGreaterThanOrEqualTo(v1: Vector, v2: Vector): boolean {
//     checkSameSize(v1, v2, `${v1} vs ${v2}`);
//     return v1.every((value, i) => value >= v2[i]);
// }

export function isVectorEqualTo(v1: Vector, v2: Vector): boolean {
    checkSameSize(v1, v2, `${v1} vs ${v2}`);
    return v1.every((value, i) => value === v2[i]);
}

export function prettyPrintVector<T>(v: T[]): string {
    if (typeof v[0] === 'boolean') {
        return "[ " + v.map(b => b ? "T" : "F").join(" ") + " ]";
    }
    return "[ " + v.join(" ") + " ]";
}
