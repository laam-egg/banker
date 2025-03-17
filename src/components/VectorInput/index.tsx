import { Dispatch, SetStateAction } from "react";
import { MatrixInput } from "../MatrixInput";

export function VectorInput({ vector, setVector }: {
    vector: number[];
    setVector: Dispatch<SetStateAction<number[]>>;
}) {
    return <MatrixInput matrix={[vector]} setMatrix={vectors => {
        if (Array.isArray(vectors)) {
            return setVector(vectors[0]);
        } else {
            setVector(previousVector => vectors([previousVector])[0]);
        }
    }} />;
}
