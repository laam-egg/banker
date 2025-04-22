import _ from "lodash";
import { convertToFullOutput, findNearestCylinderIndex, HDDSchedulingAlgorithmInput, HDDSchedulingAlgorithmOutput, HeadStatus, validateHDDSchedulingAlgorithmInput } from "./base";

export function cscanAlgorithm(input: HDDSchedulingAlgorithmInput, direction: Readonly<'left' | 'right'>): HDDSchedulingAlgorithmOutput {
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
            // If we are going right, we need to go to the end of the cylinders at the other end
            const headStatusEnd: HeadStatus = {
                cylinder: input.numCylinders - 1,
                action: 'seek',
            };
            headStatuses.push(headStatusEnd);

            const headStatus: HeadStatus = {
                cylinder: 0,
                action: 'jump',
            };
            headStatuses.push(headStatus);
            currentCylinder = 0;
        } else {
            const headStatusEnd: HeadStatus = {
                cylinder: 0,
                action: 'seek',
            };
            headStatuses.push(headStatusEnd);
            
            const headStatus: HeadStatus = {
                cylinder: input.numCylinders - 1,
                action: 'jump',
            };
            headStatuses.push(headStatus);
            currentCylinder = input.numCylinders - 1;
        }
    }

    return convertToFullOutput({ headStatuses, input });
}

