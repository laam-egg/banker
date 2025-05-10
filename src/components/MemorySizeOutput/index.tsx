import { useState } from "react";
import { convertToUnit, MEMORY_SIZE_UNITS, MemorySize, MemorySizeUnit } from "../../utils/memorySize";
import { Select } from "antd";
import Decimal from "decimal.js";

export function MemorySizeOutput({
    memorySize,
}: {
    memorySize: MemorySize,
}) {
    const originalMemorySize: MemorySize = {
        ...memorySize,
    };
    const [unit, _setUnit] = useState<MemorySizeUnit>(memorySize.unit);
    const [amount, setAmount] = useState<Decimal>(memorySize.amount);

    const setUnit = (newUnit: MemorySizeUnit) => {
        const newAmount = convertToUnit(originalMemorySize, newUnit);
        setAmount(newAmount);
        _setUnit(newUnit);
    };

    return (
        <span>
            {amount.toString()}
            <Select
                options={[...MEMORY_SIZE_UNITS].map(unit => ({
                    label: unit,
                    value: unit,
                }))}
                value={unit}
                onChange={setUnit}
                style={{ marginLeft: "8px" }}
            />
        </span>
    );
}
