import { Button, Checkbox, Form, InputNumber, Select } from "antd";
import { ButtonLink } from "../../components/ButtonLink";
import { useState } from "react";
import { PageReplacementAlgorithmInput, PageReplacementAlgorithmOutput } from "../../utils/algorithms/page_replacement/base";
import { fifoAlgorithm } from "../../utils/algorithms/page_replacement/fifoAlgorithm";
import { PageReplacementOutputsSection } from "../../components/PageReplacementOutputsSection";
import _ from "lodash";
import { optimalAlgorithm } from "../../utils/algorithms/page_replacement/optimalAlgorithm";
import { lruAlgorithm } from "../../utils/algorithms/page_replacement/lruAlgorithm";
import { mruAlgorithm } from "../../utils/algorithms/page_replacement/mruAlgorithm";
import { lfuAlgorithm, lfuAlgorithmReplacingLeastRecentlyUsedInCaseOfSameFreq } from "../../utils/algorithms/page_replacement/lfuAlgorithm";
import { useSavedState } from "../../hooks/useSavedState";
import { mfuAlgorithm } from "../../utils/algorithms/page_replacement/mfuAlgorithm";
import { secondChanceAlgorithm } from "../../utils/algorithms/page_replacement/secondChanceAlgorithm";
import { convertToReferenceString, ReferenceStringInput, ReferenceStringSeparatorId, validateReferenceStringSeparatorId } from "../../components/ReferenceStringInput";

const ALL_ALGORITHMS = [
    { label: "FIFO (First-In-First-Out)", value: "fifo" },
    { label: "Optimal", value: "optimal" },
    { label: "LRU (Least Recently Used)", value: "lru" },
    { label: "MRU (Most Recently Used)", value: "mru" },
    { label: "LFU (Least Frequently Used)", value: "lfu" },
    { label: "LFU then LRU", value: "lfu_then_lru" },
    { label: "MFU (Most Frequently Used)", value: "mfu" },
    {  label: "Second Chance/Clock Algorithm", value: "second_chance" },
] as const satisfies Array<{ label: string, value: string }>;

type AlgorithmId = typeof ALL_ALGORITHMS[number]['value'];

async function executeOneAlgorithm({
    algorithm, referenceStringInput, numFrames, referenceStringSeparator,
}: {
    algorithm: AlgorithmId,
    referenceStringInput: string,
    referenceStringSeparator: ReferenceStringSeparatorId,
    numFrames: number,
}): Promise<PageReplacementAlgorithmOutput> {
    const referenceString = convertToReferenceString({
        referenceStringSeparator,
        referenceStringInput,
    });
    const input: PageReplacementAlgorithmInput = {
        referenceString,
        numFrames,
    };

    switch (algorithm) {
        case 'fifo':
            return fifoAlgorithm(input);
        case 'optimal':
            return optimalAlgorithm(input);
        case 'lru':
            return lruAlgorithm(input);
        case 'mru':
            return mruAlgorithm(input);
        case 'lfu':
            return lfuAlgorithm(input);
        case 'lfu_then_lru':
            return lfuAlgorithmReplacingLeastRecentlyUsedInCaseOfSameFreq(input);
        case 'mfu':
            return mfuAlgorithm(input);
        case 'second_chance':
            return secondChanceAlgorithm(input);
        default:
            throw new Error("Not implemented yet");
    }
}

export default function PageReplacement() {
    const [numFrames, setNumFrames] = useSavedState<number>(
        3,
        "PR_numFrames",
    );
    const [numFramesEnd, setNumFramesEnd] = useSavedState<number>(
        3,
        "PR_numFramesEnd",
    );
    const [enableMultipleFrames, setEnableMultipleFrames] = useSavedState<boolean>(
        false,
        "PR_enableMultipleFrames",
    );

    const [referenceStringSeparator, setReferenceStringSeparator] = useSavedState<ReferenceStringSeparatorId>(
        "comma",
        "PR_refStringSeparator",
        validateReferenceStringSeparatorId,
    );
    const [referenceStringInput, setReferenceStringInput] = useSavedState<string>(
        "",
        "PR_refString",
    );

    const [algorithm, setAlgorithm] = useSavedState<AlgorithmId>(
        "fifo",
        "PR_algorithm",
        savedAlgorithm => ALL_ALGORITHMS.some(x => x.value === savedAlgorithm),
    );

    const [outputs, setOutputs] = useState<Record<AlgorithmId, null | PageReplacementAlgorithmOutput[]>>({
        fifo: null,
        optimal: null,
        lru: null,
        mru: null,
        lfu: null,
        lfu_then_lru: null,
        mfu: null,
        second_chance: null,
    });

    const execute = async () => {
        try {
            const NUM_FRAMES_START = numFrames;
            const NUM_FRAMES_END = enableMultipleFrames ? numFramesEnd : numFrames;
            if (NUM_FRAMES_START > NUM_FRAMES_END) {
                throw new Error(`invalid range of number of frames: ${NUM_FRAMES_START} to ${NUM_FRAMES_END}`);
            }

            const newOutputsOfCurrentAlgorithm: PageReplacementAlgorithmOutput[] = [];
            for (let i = NUM_FRAMES_START; i <= NUM_FRAMES_END; ++i) {
                const o = await executeOneAlgorithm({
                    algorithm, referenceStringInput, referenceStringSeparator,
                    numFrames: i,
                });
                newOutputsOfCurrentAlgorithm.push(o);
            }

            const newOutputs = _.cloneDeep(outputs);
            newOutputs[algorithm] = newOutputsOfCurrentAlgorithm;
            setOutputs(newOutputs);
        } catch (e) {
            alert(`${e}`);
        }
    };

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
            <ButtonLink to="/">Back</ButtonLink>

            <Form layout="vertical" style={{ display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "stretch" }}>
                <Form.Item label="Algorithm:">
                    <Select
                        options={[...ALL_ALGORITHMS]}
                        value={algorithm}
                        onChange={setAlgorithm}
                    />
                </Form.Item>

                <Form.Item>
                    <Checkbox
                        checked={enableMultipleFrames}
                        onChange={e => setEnableMultipleFrames(e.target.checked)}
                    >
                        Enable multiple number of frames
                    </Checkbox>
                </Form.Item>

                <Form.Item
                    label={enableMultipleFrames
                        ? <span style={{ display: "flex", flexDirection: "row", gap: "0.2em" }}><b>{"Number of frames"}</b>{"starts at (inclusive):"}</span>
                        : "Number of frames:"
                    }
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        value={numFrames}
                        onChange={value => setNumFrames(value ?? 0)}
                    />
                </Form.Item>

                {enableMultipleFrames && (
                    <Form.Item label={
                        <span style={{ display: "flex", flexDirection: "row", gap: "0.2em" }}><b>{"Number of frames"}</b>{"ends at (inclusive):"}</span>
                    }>
                        <InputNumber
                            style={{ width: "100%" }}
                            value={numFramesEnd}
                            onChange={value => setNumFramesEnd(value ?? 0)}
                        />
                    </Form.Item>
                )}

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
                    <PageReplacementOutputsSection outputs={outputs[algorithm]} />
                </>
            }
        </div>
    );
}