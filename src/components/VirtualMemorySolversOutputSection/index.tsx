import { VmemMappingSolverOutput } from "../../utils/algorithms/virtual_memory/vmemMappingSolver";
import { MemorySizeOutput } from "../MemorySizeOutput";

export function VirtualMemorySolversOutputSection({
    output,
}: {
    output: VmemMappingSolverOutput | null,
}) {
    return (
        output === null
            ? <></>
            : <>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <h2>Result</h2>

                    <div>
                        <ResultItem
                            label="Số trang"
                            value={output.numVirtualMemoryPages.toString()}
                        />

                        <ResultItem
                            label="Số bit biểu diễn số hiệu trang (page) (p)"
                            value={output.numBitsForPageNumber.toString()}
                        />

                        <ResultItem
                            label="Số bit biểu diễn số hiệu khung (frame) (f)"
                            value={output.numBitsForFrameNumber.toString()}
                        />

                        <ResultItem
                            label="Số bit biểu diễn số hiệu offset (d)"
                            value={output.numBitsForOffset.toString()}
                        />

                        <ResultItem
                            label="Số bit biểu diễn địa chỉ vật lý (f + d)"
                            value={output.numBitsForPhysicalAddress.toString()}
                        />

                        <div>
                            <h3>Đối với bảng phân trang thông thường</h3>
                            <ResultItem
                                label="Kích thước bảng phân trang (page table)"
                                value={
                                    <MemorySizeOutput memorySize={output.pageTable.size} />
                                }
                            />
                            <ResultItem
                                label="Số hàng"
                                value={output.pageTable.numRows.toString()}
                            />
                            <ResultItem
                                label="Kích thước mỗi hàng (bits)"
                                value={output.pageTable.rowSizeInBits.toString()}
                            />
                            <ResultItem
                                label="Số bit biểu diễn địa chỉ ảo (p + d)"
                                value={output.pageTable.numBitsForVirtualAddress.toString()}
                            />
                        </div>

                        <div>
                            <h3>Đối với bảng phân trang nghịch đảo</h3>
                            <ResultItem
                                label="Kích thước bảng phân trang nghịch đảo (reverse page table)"
                                value={
                                    <MemorySizeOutput memorySize={output.reversePageTable.size} />
                                }
                            />
                            <ResultItem
                                label="Số hàng"
                                value={output.reversePageTable.numRows.toString()}
                            />
                            <ResultItem
                                label="Kích thước mỗi hàng (bits)"
                                value={output.reversePageTable.rowSizeInBits.toString()}
                            />
                            <ResultItem
                                label="Số bit tối thiểu để biểu diễn PID (process ID)"
                                value={output.reversePageTable.minNumBitsForPID.toString()}
                            />
                            <ResultItem
                                label="Số bit tối thiểu để biểu diễn địa chỉ ảo (pid + p + d)"
                                value={output.reversePageTable.minNumBitsForVirtualAddress.toString()}
                            />
                        </div>
                    </div>
                </div >
            </>
    );
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
