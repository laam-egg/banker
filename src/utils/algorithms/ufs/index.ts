import Decimal from "decimal.js";
import { convertToUnit, MemorySize } from "../../memorySize";

export type UFSInput = {
    numDirectPointers: number;
    num1stIndirectPointers: number;
    num2ndIndirectPointers: number;
    num3rdIndirectPointers: number;
    blockSize: MemorySize;
    blockNumberSizeInBytes: number;
};

export type UFSOutput = {
    maxFileSize: MemorySize;
    numDataBlocksOnDiskToStoreMaxFile: Decimal;
    numAllBlocksOnDiskToStoreMaxFile: Decimal;
};

export function calculateUFS(input: UFSInput): UFSOutput {
    const {
        numDirectPointers,
        num1stIndirectPointers,
        num2ndIndirectPointers,
        num3rdIndirectPointers,
        blockSize,
        blockNumberSizeInBytes,
    } = input;
    const BASE = convertToUnit(blockSize, 'B').div(blockNumberSizeInBytes);

    // See this for explanation.
    // https://docs.google.com/document/d/1XWR7occV-32ZCpDPcv8FDb7X_oo1P3drQO10mdcNExk/edit?usp=sharing

    function B(n: number | Decimal) {
        n = Decimal(n);
        return Decimal(BASE).pow(n);
    }

    function I(n: number | Decimal) {
        n = Decimal(n);
        if (n.equals(0)) {
            return Decimal(0);
        }

        let result = Decimal(0);
        for (let i = Decimal(1); i.lessThanOrEqualTo(n); i = i.add(1)) {
            const delta = Decimal(BASE).pow(i.minus(1));
            result = result.add(delta);
        }
        return result;
    }

    function D(n: number | Decimal) {
        n = Decimal(n);
        return B(n).minus(I(n));
    }
    
    const numDataBlocksOnDiskToStoreMaxFile = (
        D(0).mul(numDirectPointers)
            .add(
                D(1).mul(num1stIndirectPointers)
            )
            .add(
                D(2).mul(num2ndIndirectPointers)
            )
            .add(
                D(3).mul(num3rdIndirectPointers)
            )
    );

    const maxFileSize = {
        amount: blockSize.amount.mul(numDataBlocksOnDiskToStoreMaxFile),
        unit: blockSize.unit,
    };

    const numAllBlocksOnDiskToStoreMaxFile = (
        B(0).mul(numDirectPointers)
            .add(
                B(1).mul(num1stIndirectPointers)
            )
            .add(
                B(2).mul(num2ndIndirectPointers)
            )
            .add(
                B(3).mul(num3rdIndirectPointers)
            )
    );

    return {
        maxFileSize,
        numDataBlocksOnDiskToStoreMaxFile,
        numAllBlocksOnDiskToStoreMaxFile,
    };
}
