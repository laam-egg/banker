import { useState } from "react";
import { MatrixInput } from "../../components/MatrixInput";
import { Button, Form, InputNumber, Select } from "antd";
import { VectorInput } from "../../components/VectorInput";
import { createMatrix } from "../../utils/matrices";
import { createVector } from "../../utils/vectors";
import TextArea from "antd/es/input/TextArea";
import { safetyAlgorithm } from "../../utils/algorithms/safetyAlgorithm";
import { bankerAlgorithm } from "../../utils/algorithms/bankerAlgorithm";
import { deadlockDetectionAlgorithm } from "../../utils/algorithms/deadlockDetectionAlgorithm";

const ALL_ALGORITHMS = [
    { label: "Safety Algorithm", value: "safety" },
    { label: "Banker's Algorithm (Request Algorithm)", value: "banker" },
    { label: "Deadlock Detection Algorithm", value: "deadlock_detection" },
];

export default function Banker() {
    const [numProcesses, setNumProcesses] = useState(5);
    const [numResources, setNumResources] = useState(3);
    const [dimensionsDetermined, setDimensionsDetermined] = useState(false);
    const [holdingMatrix, setHoldingMatrix] = useState<number[][]>(createMatrix(numProcesses, numResources));
    const [maxMatrix, setMaxMatrix] = useState<number[][]>(createMatrix(numProcesses, numResources));
    const [requestMatrix, setRequestMatrix] = useState<number[][]>(createMatrix(numProcesses, numResources));
    const [requestVector, setRequestVector] = useState<number[]>(createVector(numResources));
    const [requesterIndex, setRequesterIndex] = useState(0);
    const [availableVector, setAvailableVector] = useState<number[]>(createVector(numResources));
    const [algorithm, setAlgorithm] = useState<"safety" | "banker" | "deadlock_detection">("safety");

    const [output, setOutput] = useState<Record<typeof ALL_ALGORITHMS[number]["value"], null | {
        verdictBoolean: boolean,
        verdict: string,
        details: string,
    }>>({
        safety: null,
        banker: null,
        deadlock_detection: null,
    });

    const determineDimensions = () => {
        if (numProcesses < 1 || numResources < 1) {
            alert("Invalid dimensions");
            return;
        }
        setHoldingMatrix(createMatrix(numProcesses, numResources));
        setMaxMatrix(createMatrix(numProcesses, numResources));
        setRequestMatrix(createMatrix(numProcesses, numResources));
        setRequestVector(createVector(numResources));
        setAvailableVector(createVector(numResources));
        setDimensionsDetermined(true);
    };

    const executeAlgorithm = () => {
        switch (algorithm) {
            case 'safety': {
                const output = safetyAlgorithm({
                    Available: availableVector,
                    Holding: holdingMatrix,
                    Max: maxMatrix,
                });
                setOutput(prevOutput => ({
                    ...prevOutput,
                    safety: output,
                }));
                break;
            }

            case 'banker': {
                const output = bankerAlgorithm({
                    Available: availableVector,
                    Holding: holdingMatrix,
                    Max: maxMatrix,
                    iRequest: requestVector,
                    i: requesterIndex,
                });
                setOutput(prevOutput => ({
                    ...prevOutput,
                    banker: output,
                }));
                break;
            }

            case 'deadlock_detection': {
                const output = deadlockDetectionAlgorithm({
                    Available: availableVector,
                    Holding: holdingMatrix,
                    Request: requestMatrix,
                });
                setOutput(prevOutput => ({
                    ...prevOutput,
                    deadlock_detection: output,
                }));
                break;
            }
        }
    };

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
            {
                !dimensionsDetermined ? (
                    <>
                        <Form layout="vertical" style={{ display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "stretch" }}>
                            <Form.Item label="Number of processes (n rows):">
                                <InputNumber
                                    style={{ width: "100%" }}
                                    value={numProcesses}
                                    onChange={value => setNumProcesses(value ?? 0)}
                                />
                            </Form.Item>
                            <Form.Item label="Number of resources (m columns):">
                                <InputNumber
                                    style={{ width: "100%" }}
                                    value={numResources}
                                    onChange={value => setNumResources(value ?? 0)}
                                />
                            </Form.Item>
                        </Form>

                        <Button type="primary" onClick={determineDimensions}>Next</Button>
                    </>
                ) : (
                    <>
                        <Button onClick={() => setDimensionsDetermined(false)}>Back</Button>

                        <Form layout="vertical">
                            <Form.Item label="Algorithm:">
                                <Select
                                    options={ALL_ALGORITHMS}
                                    value={algorithm}
                                    onChange={setAlgorithm}
                                />
                            </Form.Item>
                            <Form.Item label="Available Vector:">
                                <VectorInput vector={availableVector} setVector={setAvailableVector} />
                            </Form.Item>
                            <Form.Item label="Allocation/Holding Matrix:">
                                <MatrixInput matrix={holdingMatrix} setMatrix={setHoldingMatrix} />
                            </Form.Item>

                            <Form.Item label="Max Matrix:" style={{
                                display: algorithm !== "deadlock_detection" ? "inherit" : "none",
                            }}>
                                <MatrixInput matrix={maxMatrix} setMatrix={setMaxMatrix} />
                            </Form.Item>

                            <Form.Item label="Request Matrix:" style={{
                                display: algorithm === "deadlock_detection" ? "inherit" : "none",
                            }}>
                                <MatrixInput matrix={requestMatrix} setMatrix={setRequestMatrix} />
                            </Form.Item>

                            <Form.Item label="Requester Index (starting at 0):" style={{
                                display: algorithm === "banker" ? "inherit" : "none",
                            }}>
                                <InputNumber
                                    value={requesterIndex}
                                    onChange={value => setRequesterIndex(value ?? 0)}
                                />
                            </Form.Item>
                            <Form.Item label="Request Vector:" style={{
                                display: algorithm === "banker" ? "inherit" : "none",
                            }}>
                                <VectorInput vector={requestVector} setVector={setRequestVector} />
                            </Form.Item>
                        </Form>

                        <Button type="primary" onClick={executeAlgorithm}>
                            <span>Execute</span>
                            <b>{
                                ALL_ALGORITHMS.find(({ value }) => value === algorithm)?.label
                            }</b>
                        </Button>

                        {
                            output[algorithm] !== null && <>
                                <h3>
                                    <span>{"Kết luận: "}</span>
                                    <span style={{ color: output[algorithm].verdictBoolean ? "green" : "red" }}>
                                        {output[algorithm].verdict}
                                    </span>
                                </h3>
                                <h3>Các bước giải:</h3>
                                <TextArea
                                    value={output[algorithm].details}
                                    style={{
                                        width: "100%", height: "50vh",
                                        fontFamily: "monospace",
                                    }}
                                />
                            </>
                        }
                    </>
                )
            }
        </div>
    );
}
