import { Button, Form, Input, InputNumber, Select } from "antd";
import { ButtonLink } from "../../components/ButtonLink";
import _ from "lodash";
import { useSavedState } from "../../hooks/useSavedState";
import { convertToReferenceString, ReferenceStringInput, ReferenceStringSeparatorId, validateReferenceStringSeparatorId } from "../../components/ReferenceStringInput";
import { useState } from "react";
import { ALL_HDD_SCHEDULING_ALGORITHMS, HDDSchedulingAlgorithmId, HDDSchedulingAlgorithmInput, HDDSchedulingAlgorithmOutput } from "../../utils/algorithms/hdd_scheduling/base";
import { fifoAlgorithm } from "../../utils/algorithms/hdd_scheduling/fifoAlgorithm";
import { HDDSchedulingOutputSection } from "../../components/HDDSchedulingOutputSection";
import { scanAlgorithm } from "../../utils/algorithms/hdd_scheduling/scanAlgorithm";
import { cscanAlgorithm } from "../../utils/algorithms/hdd_scheduling/cscanAlgorithm";
import { lookAlgorithm } from "../../utils/algorithms/hdd_scheduling/lookAlgorithm";
import { clookAlgorithm } from "../../utils/algorithms/hdd_scheduling/clookAlgorithm";
import { sstfAlgorithm } from "../../utils/algorithms/hdd_scheduling/sstfAlgorithm";


async function executeOneAlgorithm({
    algorithm, referenceStringInput, referenceStringSeparator,
    numCylinders, startingCylinder,
}: {
    algorithm: HDDSchedulingAlgorithmId,
    referenceStringInput: string,
    referenceStringSeparator: ReferenceStringSeparatorId,
    numCylinders: number,
    startingCylinder: number,
}) {
    const referenceString = convertToReferenceString({
        referenceStringInput,
        referenceStringSeparator,
    }).map(x => parseInt(x.trim(), 10));

    if (referenceString.some(x => isNaN(x))) {
        throw new Error("Reference string contains invalid cylinder numbers:" + referenceString.join("|"));
    }

    const input: HDDSchedulingAlgorithmInput = {
        algorithm,
        referenceString,
        numCylinders,
        startingCylinder,
    };

    switch (algorithm) {
        case 'fifo':
            return fifoAlgorithm(input);
        
        case 'scan_left_first':
            return scanAlgorithm(input, 'left');
        case 'scan_right_first':
            return scanAlgorithm(input, 'right');
        
        case 'c_scan_to_the_left':
            return cscanAlgorithm(input, 'left');
        case 'c_scan_to_the_right':
            return cscanAlgorithm(input, 'right');
        
        case 'look_left_first':
            return lookAlgorithm(input, 'left');
        case 'look_right_first':
            return lookAlgorithm(input, 'right');

        case 'c_look_to_the_left':
            return clookAlgorithm(input, 'left');
        case 'c_look_to_the_right':
            return clookAlgorithm(input, 'right');
        
        case 'sstf':
            return sstfAlgorithm(input);

        default:
            throw new Error("Not implemented yet");
    }
}

export default function HDDScheduling() {
    const [referenceStringSeparator, setReferenceStringSeparator] = useSavedState<ReferenceStringSeparatorId>(
        "comma",
        "HDDScheduling_refStringSeparator",
        validateReferenceStringSeparatorId,
    );
    const [referenceStringInput, setReferenceStringInput] = useSavedState<string>(
        "",
        "HDDScheduling_refString",
    );
    const [numCylinders, setNumCylinders] = useSavedState<number>(
        0,
        "HDDScheduling_numCylinders",
    );

    const [startingCylinder, setStartingCylinder] = useSavedState<number>(
        0,
        "HDDScheduling_startingCylinder",
    );

    const [algorithm, setAlgorithm] = useSavedState<HDDSchedulingAlgorithmId>(
        "fifo",
        "HDDScheduling_algorithm",
        savedAlgorithm => ALL_HDD_SCHEDULING_ALGORITHMS.some(x => x.value === savedAlgorithm),
    );

    const [outputs, setOutputs] = useState<Record<HDDSchedulingAlgorithmId, null | HDDSchedulingAlgorithmOutput>>({
        fifo: null,
        sstf: null,
        scan_left_first: null,
        scan_right_first: null,
        c_scan_to_the_left: null,
        c_scan_to_the_right: null,
        look_left_first: null,
        look_right_first: null,
        c_look_to_the_left: null,
        c_look_to_the_right: null,
    });

    const execute = async () => {
        try {
            const newOutputOfCurrentAlgorithm = await executeOneAlgorithm({
                algorithm, referenceStringInput, referenceStringSeparator,
                numCylinders, startingCylinder
            });
            const newOutputs = _.cloneDeep(outputs);
            newOutputs[algorithm] = newOutputOfCurrentAlgorithm;
            setOutputs(newOutputs);
        } catch (e) {
            alert(`${e}`);
        }
    };

    return <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
        <ButtonLink to="/">Back</ButtonLink>

        <Form layout="vertical" style={{ display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "stretch" }}>
            <Form.Item label="Algorithm:">
                <Select
                    options={[...ALL_HDD_SCHEDULING_ALGORITHMS]}
                    value={algorithm}
                    onChange={setAlgorithm}
                />
            </Form.Item>

            <Form.Item
                label={"Total Number of Cylinders" + (
                    algorithm === "fifo" ? " (not required in FIFO)" : ""
                ) + ":"}
            >
                {
                    algorithm === 'fifo' ?
                        <Input
                            style={{ width: "100%" }}
                            value={"Automatic"}
                            disabled={true}
                        />
                        :
                        <InputNumber
                            style={{ width: "100%" }}
                            value={numCylinders}
                            onChange={value => setNumCylinders(value ?? 0)}
                        />
                }
            </Form.Item>

            <Form.Item
                label={"Starting Cylinder:"}
            >
                <InputNumber
                    style={{ width: "100%" }}
                    value={startingCylinder}
                    onChange={value => setStartingCylinder(value ?? 0)}
                />
            </Form.Item>

            <ReferenceStringInput
                referenceStringInput={referenceStringInput}
                setReferenceStringInput={setReferenceStringInput}
                referenceStringSeparator={referenceStringSeparator}
                setReferenceStringSeparator={setReferenceStringSeparator}
            />
        </Form>

        <Button type="primary" onClick={execute}>Run</Button>

        {
            outputs[algorithm] !== null && <>
                <HDDSchedulingOutputSection output={outputs[algorithm]} />
            </>
        }
    </div>;
}
