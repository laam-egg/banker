import Decimal from "decimal.js";
import { convertToSameUnit, convertToUnit, MemorySize } from "../../memorySize";

export type VmemMappingSolverInput = {
    virtualMemorySize: MemorySize,
    numPhysicalMemoryFrames: number,
    frameSize: MemorySize,
};

export type VmemMappingSolverOutput = {
    numVirtualMemoryPages: Decimal,
    numBitsForPageNumber: Decimal,
    numBitsForFrameNumber: Decimal,
    numBitsForOffset: Decimal,
    numBitsForPhysicalAddress: Decimal,
    pageTable: {
        size: MemorySize,
        numRows: Decimal,
        rowSizeInBits: Decimal,
        numBitsForVirtualAddress: Decimal,
    },
    reversePageTable: {
        size: MemorySize,
        numRows: Decimal,
        rowSizeInBits: Decimal,
        minNumBitsForPID: Decimal,
        minNumBitsForVirtualAddress: Decimal,
    },
};

export function vmemMappingSolver(input: VmemMappingSolverInput): VmemMappingSolverOutput {
    const { virtualMemorySize, numPhysicalMemoryFrames, frameSize } = input;

    const { numVirtualMemoryPages, numBitsForPageNumber } = computeVirtual({
        virtualMemorySize,
        frameSize,
    });
    const { numBitsForFrameNumber, numBitsForOffset, numBitsForPhysicalAddress } = computePhysical({
        numPhysicalMemoryFrames,
        frameSize,
    });
    const { pageTableSize, numRows: numRegularPageTableRows, rowSizeInBits: regularPageTableRowSizeInBits, numBitsForVirtualAddress } = computePageTable({
        numVirtualMemoryPages,
        numBitsForFrameNumber,
        numBitsForOffset,
        numBitsForPageNumber,
    });
    const { reversePageTableSize, numRows: numReversePageTableRows, rowSizeInBits: reversePageTableRowSizeInBits, minNumBitsForPID, minNumBitsForVirtualAddress } = computeReversePageTable({
        numPhysicalMemoryFrames: new Decimal(numPhysicalMemoryFrames),
        numBitsForPageNumber,
        numBitsForFrameNumber,
        numBitsForOffset,
    });

    return {
        numVirtualMemoryPages,
        numBitsForPageNumber,
        numBitsForFrameNumber,
        numBitsForOffset,
        numBitsForPhysicalAddress,
        pageTable: {
            size: pageTableSize,
            numRows: numRegularPageTableRows,
            rowSizeInBits: regularPageTableRowSizeInBits,
            numBitsForVirtualAddress,
        },
        reversePageTable: {
            size: reversePageTableSize,
            numRows: numReversePageTableRows,
            rowSizeInBits: reversePageTableRowSizeInBits,
            minNumBitsForPID,
            minNumBitsForVirtualAddress,
        },
    };
}

function computeVirtual({
    virtualMemorySize, frameSize,
}: {
    virtualMemorySize: MemorySize, frameSize: MemorySize,
}): {
    numVirtualMemoryPages: Decimal,
    numBitsForPageNumber: Decimal,
} {
    const { values: [virtualMemorySizeValue, frameSizeValue] } = convertToSameUnit(virtualMemorySize, frameSize);
    const numVirtualMemoryPages = virtualMemorySizeValue.div(frameSizeValue);
    const numBitsForPageNumber = Decimal.ceil(Decimal.log2(numVirtualMemoryPages))

    return {
        numVirtualMemoryPages,
        numBitsForPageNumber,
    };
}

function computePhysical({
    numPhysicalMemoryFrames, frameSize,
}: {
    numPhysicalMemoryFrames: number, frameSize: MemorySize,
}): {
    numBitsForFrameNumber: Decimal,
    numBitsForOffset: Decimal,
    numBitsForPhysicalAddress: Decimal,
} {
    const numBitsForFrameNumber = Decimal.ceil(Decimal.log2(numPhysicalMemoryFrames));
    const frameSizeValueInBytes = convertToUnit(frameSize, 'B');
    const numBitsForOffset = Decimal.log2(frameSizeValueInBytes);
    const numBitsForPhysicalAddress = numBitsForFrameNumber.add(numBitsForOffset);

    return {
        numBitsForFrameNumber,
        numBitsForOffset,
        numBitsForPhysicalAddress,
    };
}

function computePageTable({
    numVirtualMemoryPages,
    numBitsForFrameNumber,
    numBitsForOffset,
    numBitsForPageNumber,
}: {
    numVirtualMemoryPages: Decimal,
    numBitsForFrameNumber: Decimal,
    numBitsForOffset: Decimal,
    numBitsForPageNumber: Decimal,
}): {
    pageTableSize: MemorySize,
    numRows: Decimal,
    rowSizeInBits: Decimal,
    numBitsForVirtualAddress: Decimal,
} {
    const numBitsForVirtualAddress = numBitsForOffset.add(numBitsForPageNumber);
    const rowSizeInBits = numBitsForFrameNumber;
    const numRows = numVirtualMemoryPages;
    const pageTableSizeInBytes = numRows.mul(rowSizeInBits).div(8);

    return {
        pageTableSize: {
            amount: pageTableSizeInBytes,
            unit: 'B',
        },
        numRows,
        rowSizeInBits,
        numBitsForVirtualAddress,
    };
}

function computeReversePageTable({
    numPhysicalMemoryFrames,
    numBitsForPageNumber,
    numBitsForFrameNumber,
    numBitsForOffset,
}: {
    numPhysicalMemoryFrames: Decimal,
    numBitsForPageNumber: Decimal,
    numBitsForFrameNumber: Decimal,
    numBitsForOffset: Decimal,
}): {
    reversePageTableSize: MemorySize,
    numRows: Decimal,
    rowSizeInBits: Decimal,
    minNumBitsForPID: Decimal,
    minNumBitsForVirtualAddress: Decimal,
} {
    const minNumBitsForPID = numBitsForFrameNumber;
    const minNumBitsForVirtualAddress = minNumBitsForPID.add(numBitsForPageNumber).add(numBitsForOffset);
    const numRows = numPhysicalMemoryFrames;
    const rowSizeInBits = minNumBitsForPID.add(numBitsForPageNumber);
    const reversePageTableSizeInBytes = Decimal.ceil(
        numRows.mul(rowSizeInBits).div(8)
    );

    return {
        reversePageTableSize: {
            amount: reversePageTableSizeInBytes,
            unit: 'B',
        },
        numRows,
        rowSizeInBits,
        minNumBitsForPID,
        minNumBitsForVirtualAddress,
    };
}
