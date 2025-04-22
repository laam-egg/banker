import { Form, Input, Select } from "antd";

const REFERENCE_STRING_SEPARATORS = [
    { label: "Comma (,)", value: "comma" },
    { label: "Semicolon (;)", value: "semicolon" },
    { label: "Whitespaces (spaces, newlines, tabs...)", value: "whitespace" },
] as const;

export type ReferenceStringSeparatorId = typeof REFERENCE_STRING_SEPARATORS[number]['value'];

export function validateReferenceStringSeparatorId(
    referenceStringSeparator: ReferenceStringSeparatorId,
): boolean {
    return REFERENCE_STRING_SEPARATORS.some(x => x.value === referenceStringSeparator);
}

export function convertToReferenceString({
    referenceStringInput,
    referenceStringSeparator,
}: {
    referenceStringInput: string,
    referenceStringSeparator: ReferenceStringSeparatorId,
}): string[] {
    switch (referenceStringSeparator) {
        case "comma":
            return referenceStringInput.split(/,\s*/g);
        case "semicolon":
            return referenceStringInput.split(/;\s*/g);
        case "whitespace":
            return referenceStringInput.split(/\s+/g);
        default:
            throw new Error(`Unknown reference string separator: ${referenceStringSeparator}`);
    }
}

export function ReferenceStringInput({
    referenceStringInput,
    setReferenceStringInput,
    referenceStringSeparator,
    setReferenceStringSeparator,
}: {
    referenceStringInput: string,
    setReferenceStringInput: (value: string) => void,
    referenceStringSeparator: ReferenceStringSeparatorId,
    setReferenceStringSeparator: (value: ReferenceStringSeparatorId) => void,
}) {
    return <>
        <Form.Item label="Reference string:">
            <Input
                style={{ width: "100%" }}
                value={referenceStringInput}
                onChange={e => setReferenceStringInput(e.target.value ?? "")}
            />
        </Form.Item>

        <Form.Item label="Reference string Separator:">
            <Select
                options={[...REFERENCE_STRING_SEPARATORS]}
                value={referenceStringSeparator}
                onChange={setReferenceStringSeparator}
            />
        </Form.Item>
    </>;
}
