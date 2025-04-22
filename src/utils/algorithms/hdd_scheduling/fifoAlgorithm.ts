import _ from "lodash";
import { convertToFullOutput, HDDSchedulingAlgorithmInput, HDDSchedulingAlgorithmOutput, HeadStatus, validateHDDSchedulingAlgorithmInput } from "./base";

export function fifoAlgorithm(input : HDDSchedulingAlgorithmInput): HDDSchedulingAlgorithmOutput {
    validateHDDSchedulingAlgorithmInput(input);
    const referenceString = _.cloneDeep(input.referenceString);
    const headStatuses: HeadStatus[] = [];

    for (const referencedCylinder of referenceString) {
        const headStatus: HeadStatus = {
            cylinder: referencedCylinder,
            action: 'seek',
        }
        headStatuses.push(headStatus);
    }

    return convertToFullOutput({ headStatuses, input });
}
