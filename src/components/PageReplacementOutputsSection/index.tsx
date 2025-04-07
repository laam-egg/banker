import { Collapse, Table } from "antd";
import { PageReplacementAlgorithmOutput, PageRequest } from "../../utils/algorithms/page_replacement/base";
import { ColumnsType } from "antd/es/table";
import CollapsePanel from "antd/es/collapse/CollapsePanel";
import { Line } from '@ant-design/plots';
import { useMemo } from "react";

const columns: ColumnsType<PageRequest> = [
    {
        title: '#',
        dataIndex: 'index',
        key: 'index',
        render: (_, __, index) => <>
            <span key={index} style={{ color: "#555" }}>{index + 1}</span>
        </>,
    },

    {
        title: "Frame status",
        dataIndex: "pagesInFrames",
        key: "pagesInFrames",
        render: (_, record, index) => {
            return <div style={{ display: "flex", flexDirection: "row", gap: 4 }} key={index}>
                {record.pagesInFrames.map((page, i) => {
                    const referenced = page === record.reference;
                    const referenceBitOn = (record.referenceBits === undefined) ? false : record.referenceBits[i];
                    return <div key={i} style={{
                        width: 30,
                        height: 30,
                        backgroundColor: referenced ? "rgb(46,140,255)" : "#f1f1f1",
                        color: referenced ? "white" : "black",
                        fontWeight: referenced ? "bold" : "normal",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 4,
                        borderBottom: referenceBitOn ? "4px solid rgb(171, 255, 114)" : "inherit",
                    }}>
                        {page ?? ""}
                    </div>
                })}
            </div>;
        }
    },

    {
        title: "Page Fault?",
        dataIndex: "pageFault",
        key: "pageFault",
        render: (_, record, index) => {
            return record.pageFault ? <>
                <span key={index} style={{ color: "red" }}>Page Fault</span>
            </> : <>
                <span key={index} style={{ color: "green" }}>Page Hit</span>
            </>;
        },
    },

    {
        title: "Modified Frame",
        dataIndex: "modifiedFrame",
        key: "modifiedFrame",
        render: (_, record, index) => {
            if (record.pageFault) {
                if (record.needToReplace) {
                    return <span key={index} style={{ color: "red" }}>{
                        `${record.modifiedFrame} (replaced page ${record.replacedPage})`
                    }</span>;
                } else {
                    return <span key={index} style={{ color: "#aa0" }}>{
                        `${record.modifiedFrame} (no previous page)`
                    }</span>;
                }
            }
            return `-`;
        }
    },

    {
        title: "Reference Bits",
        dataIndex: "referenceBits",
        key: "referenceBits",
        render: (_, record, index) => {
            return <div style={{ display: "flex", flexDirection: "row", gap: 4 }} key={index}>
                {(record.referenceBits ?? []).map((bit, i) => {
                    return <div key={i} style={{
                        width: 30,
                        height: 30,
                        backgroundColor: bit ? "lightgreen" : "#f1f1f1",
                        color: bit ? "white" : "black",
                        fontWeight: bit ? "bold" : "normal",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 4,
                    }}>
                        {bit ? "1" : "0"}
                    </div>
                })}
            </div>;
        }
    },

    {
        title: "Clock Hand",
        dataIndex: "clockHand",
        key: "clockHand",
    }
]

export function PageReplacementOutputsSection({
    outputs,
}: {
    outputs: PageReplacementAlgorithmOutput[],
}) {
    if (outputs.length === 0) return <></>;
    return outputs.length == 1
        ? <SingleOutput output={outputs[0]} />
        : <MultipleOutputs outputs={outputs} />
}

function SingleOutput({ output }: {
    output: PageReplacementAlgorithmOutput,
}) {
    return <div>
        <p>Page requests: {output.pageRequests.length}</p>
        <p>Num page faults: {output.numPageFaults}</p>
        <p>Num page hits: {output.numPageHits}</p>

        <Table<PageRequest>
            columns={columns}
            dataSource={output.pageRequests}
            pagination={false}
        />
    </div>;
}

function MultipleOutputs({ outputs }: {
    outputs: PageReplacementAlgorithmOutput[],
}) {
    const [numPageFaultsByNumFramesData, hasBelady] = useMemo(() => {
        const data = outputs.map(o => {
            return {
                numFrames: o.input.numFrames,
                numPageFaults: o.numPageFaults,
            };
        });

        let hasBelady = false;
        for (let i = 0; i < data.length; ++i) {
            const j = i + 1;
            if (j >= data.length) continue;
            if (data[j].numPageFaults > data[i].numPageFaults) {
                hasBelady = true;
                break;
            }
        }

        return [data, hasBelady] as const;
    }, [outputs]);

    return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2>Number of page faults by frame count</h2>
        <Line data={numPageFaultsByNumFramesData} xField={"numFrames"} yField={"numPageFaults"} />

        {
            hasBelady &&
            <h2 style={{ color: "red" }}>{"Watch out: Belady anomaly!"}</h2>
        }

        <h2>Individual runs</h2>
        <Collapse size="large">
            {outputs.map((output, i) => {
                return <CollapsePanel header={
                    <b>
                        {`Number of frames: ${output.input.numFrames}`}
                    </b>
                } key={i} style={{
                    width: "100%",
                }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <SingleOutput output={output} />
                    </div>
                </CollapsePanel>
            })}
        </Collapse>
    </div>
}
