import _ from "lodash";
import { convertToFullOutput, findNearestCylinderIndex, HDDSchedulingAlgorithmInput, HDDSchedulingAlgorithmOutput, HeadStatus, validateHDDSchedulingAlgorithmInput } from "./base";

export function clookAlgorithm(input: HDDSchedulingAlgorithmInput, direction: Readonly<'left' | 'right'>): HDDSchedulingAlgorithmOutput {
    validateHDDSchedulingAlgorithmInput(input);
    const referenceString = _.cloneDeep(input.referenceString);
    const headStatuses: HeadStatus[] = [];

    let currentCylinder = input.startingCylinder;
    while (referenceString.length > 0) {
        while (referenceString.length > 0) {
            const nearestCylinderIndex = findNearestCylinderIndex(direction, currentCylinder, referenceString);
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
        
        // RESET
        if (direction === 'right') {
            const i = findNearestCylinderIndex(direction, 0, referenceString);
            currentCylinder = referenceString[i];

            const headStatus: HeadStatus = {
                cylinder: currentCylinder,
                action: 'jump',
            };
            headStatuses.push(headStatus);

            referenceString.splice(i, 1);
        } else {
            const i = findNearestCylinderIndex(direction, input.numCylinders - 1, referenceString);
            currentCylinder = referenceString[i];

            const headStatus: HeadStatus = {
                cylinder: currentCylinder,
                action: 'jump',
            };
            headStatuses.push(headStatus);

            referenceString.splice(i, 1);
        }
    }

    return convertToFullOutput({ headStatuses, input });
}

