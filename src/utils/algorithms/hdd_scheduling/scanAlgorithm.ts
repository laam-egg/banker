import _ from "lodash";
import { convertToFullOutput, findNearestCylinderIndex, HDDSchedulingAlgorithmInput, HDDSchedulingAlgorithmOutput, HeadStatus, validateHDDSchedulingAlgorithmInput } from "./base";

export function scanAlgorithm(input: HDDSchedulingAlgorithmInput, currentDirection: 'left' | 'right'): HDDSchedulingAlgorithmOutput {
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
            const headStatus: HeadStatus = {
                cylinder: input.numCylinders - 1,
                action: 'seek',
            };
            headStatuses.push(headStatus);
            currentCylinder = input.numCylinders - 1;
            currentDirection = 'left'; // Change direction
        } else {
            const headStatus: HeadStatus = {
                cylinder: 0,
                action: 'seek',
            };
            headStatuses.push(headStatus);
            currentCylinder = 0;
            currentDirection = 'right'; // Change direction
        }
    }

    return convertToFullOutput({ headStatuses, input });
}

