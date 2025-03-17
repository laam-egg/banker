import { checkSameSize } from "./dimensional";
import { addVectors, isVectorEqualTo, subtractVectors } from "./vectors";

export type Matrix = number[][];

export function createMatrix(numRows: number, numCols: number): Matrix {
    return Array.from({ length: numRows }, () => Array(numCols).fill(0));
}

export function addMatrices(matrix1: Matrix, matrix2: Matrix): Matrix {
    checkSameSize(matrix1, matrix2, `${matrix1} vs ${matrix2}`);
    return matrix1.map((row, i) => addVectors(row, matrix2[i]));
}

export function subtractMatrices(matrix1: Matrix, matrix2: Matrix): Matrix {
    checkSameSize(matrix1, matrix2, `${matrix1} vs ${matrix2}`);
    return matrix1.map((row, i) => subtractVectors(row, matrix2[i]));
}

export function negateMatrices(matrix: Matrix): Matrix {
    return matrix.map(row => row.map(cell => -cell));
}

export function isMatrixEqualTo(matrix1: Matrix, matrix2: Matrix): boolean {
    return matrix1.every((row, i) => isVectorEqualTo(row, matrix2[i]));
}

export function prettyPrintMatrix(m: Matrix): string {
    return "[\n" + m.map(row => row.join(" ")).join("\n") + " \n]";
}
