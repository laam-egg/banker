import { Form, Input, Select } from "antd";
import { MEMORY_SIZE_UNITS, MemorySize } from "../../utils/memorySize";
import Decimal from "decimal.js";

export function MemorySizeInput({
    label = "Memory size:",
    memorySize, setMemorySize,
}: {
    label?: string,
    memorySize: MemorySize,
    setMemorySize: (memorySize: MemorySize) => void,
}) {
    return (
        <>
            <Form.Item label={label}>
                <span style={{
                    display: 'flex',
                    flexDirection: 'row',
                }}>
                    <Input
                        style={{ width: "100%" }}
                        value={memorySize.amount.toString()}
                        onChange={e => {
                            setMemorySize({
                                amount: new Decimal(e.target.value || 0),
                                unit: memorySize.unit,
                            })
                        }}
                    />

                    <Select
                        options={[...MEMORY_SIZE_UNITS].map(unit => ({
                            label: unit,
                            value: unit,
                        }))}
                        value={memorySize.unit}
                        onChange={value => {
                            setMemorySize({
                                amount: memorySize.amount,
                                unit: value,
                            });
                        }}
                    />
                </span>
            </Form.Item>
        </>
    );
}
