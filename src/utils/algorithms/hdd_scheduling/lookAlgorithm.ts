import _ from "lodash";
import { convertToFullOutput, findNearestCylinderIndex, HDDSchedulingAlgorithmInput, HDDSchedulingAlgorithmOutput, HeadStatus, validateHDDSchedulingAlgorithmInput } from "./base";

export function lookAlgorithm(input: HDDSchedulingAlgorithmInput, currentDirection: 'left' | 'right'): HDDSchedulingAlgorithmOutput {
    validateHDDSchedulingAlgorithmInput(input);
    const referenceString = _.cloneDeep(input.referenceString);
    const headStatuses: HeadStatus[] = [];

    let currentCylinder = input.startingCylinder;
    while (referenceString.length > 0) {
        while (referenceString.length > 0) {
            const nearestCylinderIndex = findNearestCylinderIndex(currentDirection, currentCylinder, referenceString);
            if (nearestCylinderIndex === -1) {
                break; // No more cylinders in the current direction
            }
            const nearestCylinder = referenceString[nearestCylinderIndex];
            const headStatus: HeadStatus = {
                cylinder: nearestCylinder,
                action: 'seek',
            }
            headStatuses.push(headStatus);
            currentCylinder = nearestCylinder;
            // Remove the cylinder from the reference string
            referenceString.splice(nearestCylinderIndex, 1);
        }
        if (referenceString.length === 0) {
            break; // No more cylinders to process
        }
        
        if (currentDirection === 'right') {
            // If we are going right, we need to go to the end of the cylinders
            currentDirection = 'left'; // Change direction
        } else {
            currentDirection = 'right'; // Change direction
        }
    }

    return convertToFullOutput({ headStatuses, input });
}

