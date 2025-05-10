import Decimal from "decimal.js";

export const MEMORY_SIZE_UNITS = ['bit', 'B', 'KB', 'MB', 'GB', 'TB'] as const;

export type MemorySizeUnit = typeof MEMORY_SIZE_UNITS[number];

export type MemorySize = {
    amount: Decimal;
    unit: MemorySizeUnit;
};

export function validateSavedMemorySize(_memorySize: MemorySize): boolean {
    return true; // thanks to serializer and deserializer below
}
export function serializeMemorySize(memorySize: MemorySize): string {
    return `${memorySize.amount.toString()} ${memorySize.unit}`;
}
export function deserializeMemorySize(memorySize: string): MemorySize {
    const [amount, unit] = memorySize.split(' ');
    if (!MEMORY_SIZE_UNITS.includes(unit as MemorySizeUnit)) {
        throw new Error(`Invalid memory size unit: ${unit}`);
    }
    return {
        amount: new Decimal(amount),
        unit: unit as MemorySizeUnit,
    };
}

export function convertToUnit(a: MemorySize, unit: MemorySizeUnit): Decimal {
    const aIndex = MEMORY_SIZE_UNITS.indexOf(a.unit);
    const bIndex = MEMORY_SIZE_UNITS.indexOf(unit);

    if (aIndex === -1 || bIndex === -1) {
        throw new Error(`Invalid memory size unit: ${a.unit} or ${unit}`);
    }

    if (aIndex === bIndex) {
        return a.amount;
    }

    let bAmount = a.amount;

    if (bIndex > aIndex) {
        for (let i = aIndex; i < bIndex; i++) {
            const from = MEMORY_SIZE_UNITS[i];
            const to = MEMORY_SIZE_UNITS[i + 1];

            if (from === 'bit' && to === 'B') {
                bAmount = bAmount.div(8);
            } else if (from === 'B' && to === 'bit') {
                bAmount = bAmount.mul(8);
            } else {
                bAmount = bAmount.div(1024);
            }
        }
    } else {
        for (let i = aIndex; i > bIndex; i--) {
            const from = MEMORY_SIZE_UNITS[i];
            const to = MEMORY_SIZE_UNITS[i - 1];

            if (from === 'B' && to === 'bit') {
                bAmount = bAmount.mul(8);
            } else if (from === 'bit' && to === 'B') {
                bAmount = bAmount.div(8);
            } else {
                bAmount = bAmount.mul(1024);
            }
        }
    }

    return bAmount;
}

export function convertToSameUnit(a: MemorySize, b: MemorySize): {
    values: [Decimal, Decimal],
    unit: MemorySizeUnit,
} {
    const aIndex = MEMORY_SIZE_UNITS.indexOf(a.unit);
    const bIndex = MEMORY_SIZE_UNITS.indexOf(b.unit);

    if (aIndex === -1 || bIndex === -1) {
        throw new Error(`Invalid memory size unit: ${a.unit} or ${b.unit}`);
    }

    if (aIndex === bIndex) {
        return {
            values: [a.amount, b.amount],
            unit: a.unit,
        };
    }

    if (aIndex > bIndex) {
        const { values, unit } = convertToSameUnit(b, a);
        return {
            values: values.reverse() as [Decimal, Decimal],
            unit,
        };
    }

    // aIndex < bIndex, which means a is smaller than b
    // so we gonna use the unit of a

    const bAmount = convertToUnit(b, a.unit);
    return {
        values: [a.amount, bAmount],
        unit: a.unit,
    };
}
