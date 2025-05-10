import { Button, Form, InputNumber } from "antd";
import { ButtonLink } from "../../components/ButtonLink";
import { MemorySizeInput } from "../../components/MemorySizeInput";
import { useSavedState } from "../../hooks/useSavedState";
import { deserializeMemorySize, MemorySize, serializeMemorySize, validateSavedMemorySize } from "../../utils/memorySize";
import Decimal from "decimal.js";
import { vmemMappingSolver, VmemMappingSolverOutput } from "../../utils/algorithms/virtual_memory/vmemMappingSolver";
import { useState } from "react";
import { VirtualMemorySolversOutputSection } from "../../components/VirtualMemorySolversOutputSection";

export default function VirtualMemorySolvers() {
    const [virtualMemorySize, setVirtualMemorySize] = useSavedState<MemorySize>(
        {
            amount: new Decimal(1),
            unit: "GB",
        },
        "VMEM_virtualMemorySize",
        validateSavedMemorySize,
        serializeMemorySize,
        deserializeMemorySize,
    );

    const [frameSize, setFrameSize] = useSavedState<MemorySize>(
        {
            amount: new Decimal(4),
            unit: "KB",
        },
        "VMEM_frameSize",
        validateSavedMemorySize,
        serializeMemorySize,
        deserializeMemorySize,
    );

    const [numPhysicalMemoryFrames, setNumPhysicalMemoryFrames] = useSavedState<number>(
        256,
        "VMEM_numPhysicalMemoryFrames",
        value => typeof value === "number" && value > 0,
    );

    const [output, setOutput] = useState<VmemMappingSolverOutput | null>(null);

    const calculate = () => {
        const output = vmemMappingSolver({
            frameSize,
            numPhysicalMemoryFrames,
            virtualMemorySize,
        });
        setOutput(output);
    };

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
            <ButtonLink to="/">Back</ButtonLink>
            <Form layout="vertical" style={{ display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "stretch" }}>
                <MemorySizeInput
                    label="Ánh xạ bộ nhớ ảo"
                    memorySize={virtualMemorySize}
                    setMemorySize={setVirtualMemorySize}
                />

                <Form.Item label="lên bộ nhớ vật lý có số frame là:">
                    <InputNumber
                        value={numPhysicalMemoryFrames}
                        onChange={value => setNumPhysicalMemoryFrames(value ?? 0)}
                    />
                </Form.Item>

                <MemorySizeInput
                    label="mỗi frame có kích thước:"
                    memorySize={frameSize}
                    setMemorySize={setFrameSize}
                />

                <div>
                    Kích thước mỗi đơn vị bộ nhớ là 1 byte.
                </div>
            </Form>
            <Button type="primary" onClick={calculate}>Calculate</Button>

            <VirtualMemorySolversOutputSection output={output} />
        </div>
    );
}
