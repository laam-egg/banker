import { InputNumber } from "antd";
import { Dispatch, SetStateAction } from "react";

export function MatrixInput({ matrix, setMatrix }: {
    matrix: number[][];
    setMatrix: Dispatch<SetStateAction<number[][]>>;
}) {
    const handleChange = (value: number | null, row: number, col: number) => {
        setMatrix(prevMatrix => {
            const newMatrix = prevMatrix.map(rowArray => [...rowArray]); // Clone matrix
            newMatrix[row][col] = value ?? 0; // Ensure non-null values
            return newMatrix;
        });
    };

    return (
        <>
            <table>
                <tbody>
                    {matrix.map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => (
                                <td key={j}>
                                    <InputNumber
                                        value={cell}
                                        onChange={(value) => handleChange(value, i, j)}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
