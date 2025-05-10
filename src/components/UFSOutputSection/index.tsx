import { UFSOutput } from "../../utils/algorithms/ufs";
import { MemorySizeOutput } from "../MemorySizeOutput";

export function UFSOutputSection({
    output,
}: {
    output: UFSOutput | null,
}) {
    return (
        output === null
            ? <></>
            : <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h2>Results</h2>

                <ResultItem
                    label="Kích thước tối đa của tập tin"
                    value={
                        <MemorySizeOutput memorySize={output.maxFileSize} />
                    }
                />

                <ResultItem
                    label="Số khối DỮ LIỆU trên đĩa để lưu trữ tập tin TRÊN"
                    value={output.numDataBlocksOnDiskToStoreMaxFile.toString()}
                />

                <ResultItem
                    label="TỔNG SỐ khối (dữ liệu/chỉ mục) trên đĩa để lưu trữ tập tin TRÊN"
                    value={output.numAllBlocksOnDiskToStoreMaxFile.toString()}
                />

            </div>
    )
}

function ResultItem({
    label,
    value,
}: {
    label: string,
    value: number | React.ReactNode,
}) {
    return (
        <p>
            <span>{label}: </span>
            {
                typeof value === "number"
                    ? <span>{value.toString()}</span>
                    : value
            }
        </p>
    );
}
