import _ from "lodash";
import { convertToFullOutput, findNearestCylinderIndex, HDDSchedulingAlgorithmInput, HDDSchedulingAlgorithmOutput, HeadStatus, validateHDDSchedulingAlgorithmInput } from "./base";

export function sstfAlgorithm(input : HDDSchedulingAlgorithmInput): HDDSchedulingAlgorithmOutput {
    validateHDDSchedulingAlgorithmInput(input);
    const referenceString = _.cloneDeep(input.referenceString);
    const headStatuses: HeadStatus[] = [];

    let currentCylinder = input.startingCylinder;
    while (referenceString.length > 0) {
        const nearestCylinderIndex = findNearestCylinderIndex('any', currentCylinder, referenceString);
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

    return convertToFullOutput({ headStatuses, input });
}
