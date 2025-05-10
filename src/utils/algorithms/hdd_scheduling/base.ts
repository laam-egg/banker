export const ALL_HDD_SCHEDULING_ALGORITHMS = [
    { label: "FIFO (First-In-First-Out)", value: "fifo" },
    { label: "SSTF (Shortest Seek-Time First)", value: "sstf" },
    { label: "SCAN/Elevator, Left First", value: "scan_left_first" },
    { label: "SCAN/Evelator, Right First", value: "scan_right_first" },
    { label: "C-SCAN, to the left", value: "c_scan_to_the_left" },
    { label: "C-SCAN, to the right", value: "c_scan_to_the_right" },
    { label: "LOOK, Left First", value: "look_left_first" },
    { label: "LOOK, Right First", value: "look_right_first" },
    { label: "C-LOOK, to the left", value: "c_look_to_the_left" },
    { label: "C-LOOK, to the right", value: "c_look_to_the_right" },
] as const satisfies Array<{ label: string, value: string }>;

export type HDDSchedulingAlgorithmId = typeof ALL_HDD_SCHEDULING_ALGORITHMS[number]['value'];

export type HeadStatus = {
    cylinder: number,
    action: 'seek' | 'jump',
};

export type HDDSchedulingAlgorithmInput = {
    algorithm: HDDSchedulingAlgorithmId,
    referenceString: number[],
    numCylinders: number,
    startingCylinder: number,
};

export type HDDSchedulingAlgorithmOutput = {
    headStatuses: HeadStatus[],
    numSeekOperations: number,
    numCylindersCameAcross: number,
    numCylindersCameAcrossIncludingJumping: number,
    input: HDDSchedulingAlgorithmInput,
}

export function validateHDDSchedulingAlgorithmInput(input: HDDSchedulingAlgorithmInput) {
    if (input.algorithm === 'fifo') {
        // Automatically figure out the total number of cylinders
        // based on the reference string
        const maxCylinder = Math.max(...input.referenceString);
        input.numCylinders = Math.max(input.numCylinders, maxCylinder + 1);
    }

    const { referenceString, numCylinders, startingCylinder } = input;

    if (numCylinders <= 0) {
        throw new Error("Number of cylinders must be greater than 0 ; it is " + numCylinders);
    }

    if (referenceString.length === 0) {
        throw new Error("Reference string must not be empty");
    }

    if (referenceString.some(x => x < 0 || (x >= numCylinders))) {
        throw new Error("Reference string contains out-of-range cylinder numbers");
    }

    if (startingCylinder < 0 || startingCylinder >= numCylinders) {
        throw new Error("Starting cylinder is out of range");
    }
}

export function convertToFullOutput({
    headStatuses,
    input,
}: {
    headStatuses: HeadStatus[],
    input: HDDSchedulingAlgorithmInput,
}): HDDSchedulingAlgorithmOutput {
    const numSeekOperations = headStatuses.filter(status => status.action === 'seek').length;
    let numCylindersCameAcross = 0;
    let numCylindersCameAcrossIncludingJumping = 0;
    let lastCylinder = input.startingCylinder;
    for (const headStatus of headStatuses) {
        const leap = Math.abs(headStatus.cylinder - lastCylinder);
        if (headStatus.action === 'seek') {
            numCylindersCameAcross += leap;
        }
        numCylindersCameAcrossIncludingJumping += leap;
        lastCylinder = headStatus.cylinder;
    }

    return {
        headStatuses,
        numSeekOperations,
        numCylindersCameAcross,
        numCylindersCameAcrossIncludingJumping,
        input,
    };
}

export function findNearestCylinderIndex(direction: 'left' | 'right' | 'any', currentCylinder: number, cylinders: number[]): number {
    if (direction === 'any') {
        let iLeft = findNearestCylinderIndex('left', currentCylinder, cylinders);
        let iRight = findNearestCylinderIndex('right', currentCylinder, cylinders);
        if (iLeft === -1 && iRight === -1) {
            return -1;
        } else if (iLeft === -1) {
            return iRight;
        } else if (iRight === -1) {
            return iLeft;
        } else {
            return Math.abs(cylinders[iLeft] - currentCylinder) < Math.abs(cylinders[iRight] - currentCylinder)
                ? iLeft
                : iRight;
        }
    }

    let nearestCylinderIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < cylinders.length; i++) {
        const cylinder = cylinders[i];
        const distance = Math.abs(cylinder - currentCylinder);
        if (distance < minDistance && ((direction === 'left' && cylinder < currentCylinder) || (direction === 'right' && cylinder > currentCylinder))) {
            minDistance = distance;
            nearestCylinderIndex = i;
        }
    }

    return nearestCylinderIndex;
}
