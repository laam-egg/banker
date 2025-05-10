
import { useState } from "react";
import { ButtonLink } from "../../components/ButtonLink";
import { Button, Form, InputNumber } from "antd";
import { calculateUFS, UFSOutput } from "../../utils/algorithms/ufs";
import { UFSOutputSection } from "../../components/UFSOutputSection";
import { useSavedState } from "../../hooks/useSavedState";
import { deserializeMemorySize, MemorySize, serializeMemorySize, validateSavedMemorySize } from "../../utils/memorySize";
import Decimal from "decimal.js";
import { MemorySizeInput } from "../../components/MemorySizeInput";

export default function UFS() {
    const [numDirectPointers, setNumDirectPointers] = useState(0);
    const [num1stIndirectPointers, setNum1stIndirectPointers] = useState(0);
    const [num2ndIndirectPointers, setNum2ndIndirectPointers] = useState(0);
    const [num3rdIndirectPointers, setNum3rdIndirectPointers] = useState(0);
    const [blockSize, setBlockSize] = useSavedState<MemorySize>(
        {
            amount: Decimal(4),
            unit: "KB",
        },
        "UFS_blockSize",
        validateSavedMemorySize,
        serializeMemorySize,
        deserializeMemorySize,
    );
    const [blockNumberSizeInBytes, setBlockNumberSizeInBytes] = useState(0);

    const [output, setOutput] = useState<UFSOutput | null>(null);

    const calculate = () => {
        const newOutput = calculateUFS({
            numDirectPointers,
            num1stIndirectPointers,
            num2ndIndirectPointers,
            num3rdIndirectPointers,
            blockSize,
            blockNumberSizeInBytes,
        });

        setOutput(newOutput);
    };

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
            <ButtonLink to="/">Back</ButtonLink>
            <Form layout="vertical" style={{ display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "stretch" }}>
                <p>Hệ điều hành sử dụng i-node để quản lý các khối dữ liệu của tập tin.</p>
                <p>I-node của mỗi tập tin chứa số hiệu của:</p>

                <Form.Item label="Số khối dữ liệu trực tiếp:">
                    <InputNumber
                        value={numDirectPointers}
                        onChange={value => setNumDirectPointers(value ?? 0)}
                    />
                </Form.Item>

                <Form.Item label="Số khối dữ liệu gián tiếp cấp 1:">
                    <InputNumber
                        value={num1stIndirectPointers}
                        onChange={value => setNum1stIndirectPointers(value ?? 0)}
                    />
                </Form.Item>

                <Form.Item label="Số khối dữ liệu gián tiếp cấp 2:">
                    <InputNumber
                        value={num2ndIndirectPointers}
                        onChange={value => setNum2ndIndirectPointers(value ?? 0)}
                    />
                </Form.Item>

                <Form.Item label="Số khối dữ liệu gián tiếp cấp 3:">
                    <InputNumber
                        value={num3rdIndirectPointers}
                        onChange={value => setNum3rdIndirectPointers(value ?? 0)}
                    />
                </Form.Item>

                <MemorySizeInput
                    label="Kích thước mỗi khối dữ liệu trên ổ đĩa là:"
                    memorySize={blockSize}
                    setMemorySize={setBlockSize}
                />

                <Form.Item label="số hiệu của mỗi khối chiếm bao nhiêu byte:">
                    <InputNumber
                        value={blockNumberSizeInBytes}
                        onChange={value => setBlockNumberSizeInBytes(value ?? 0)}
                    />
                </Form.Item>
            </Form>
            <Button type="primary" onClick={calculate}>Calculate</Button>

            <UFSOutputSection output={output} />
        </div>
    );
}
