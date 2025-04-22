import { useEffect, useRef } from "react";
import { HDDSchedulingAlgorithmOutput } from "../../utils/algorithms/hdd_scheduling/base";

const DEFAULT_CANVAS_WIDTH = 1000;
const DEFAULT_CANVAS_HEIGHT = 500;
const CANVAS_RULER_HEIGHT = 20;
const PATH_VERTICAL_HEIGHT = 50;
const DISTANCE_BETWEEN_TWO_CONSECUTIVE_CYLINDERS = 10;
const X_OFFSET = 16;

export function HDDSchedulingOutputSection({
    output,
}: {
    output: HDDSchedulingAlgorithmOutput | null,
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (output === null) {
            return;
        }

        const canvas = document.createElement("canvas");

        // Determine the ratio and size of the canvas
        const visibleCylinderNumbers: number[] = [
            ...new Set([
                ...output.headStatuses.map(x => x.cylinder),
                output.input.startingCylinder,
                0,
                output.input.numCylinders - 1,
            ])
        ].sort((a, b) => a - b);
        console.log("visibleCylinderNumbers", visibleCylinderNumbers);

        const canvasWidth = Math.min(
            16380, Math.max(DEFAULT_CANVAS_WIDTH + X_OFFSET * 2, DISTANCE_BETWEEN_TWO_CONSECUTIVE_CYLINDERS * visibleCylinderNumbers.length + X_OFFSET * 2)
        );
        const pixelsPerCylinder = canvasWidth / visibleCylinderNumbers.length;
        const canvasHeight = Math.max(DEFAULT_CANVAS_HEIGHT, output.headStatuses.length * (PATH_VERTICAL_HEIGHT) + CANVAS_RULER_HEIGHT + 30);
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Failed to get canvas context");
        }
        // Now draw the canvas ruler!
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = "#f1f1f1";
        ctx.fillRect(0, 0, canvasWidth, CANVAS_RULER_HEIGHT);
        for (let i = 0; i < visibleCylinderNumbers.length; ++i) {
            const x = i * pixelsPerCylinder + X_OFFSET;
            const cylinder = visibleCylinderNumbers[i];

            ctx.fillStyle = "red";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(cylinder.toString(), x, CANVAS_RULER_HEIGHT / 2);

            ctx.beginPath();
            ctx.strokeStyle = "#aaa";
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.moveTo(x, CANVAS_RULER_HEIGHT);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
        }

        // And draw the lines!
        const { headStatuses } = output;
        let currentCylinder = output.input.startingCylinder;
        for (let i = 0; i < headStatuses.length; i++) {
            const headStatus = headStatuses[i];
            ctx.beginPath();
            let iCurrentCylinder = visibleCylinderNumbers.indexOf(currentCylinder);
            if (iCurrentCylinder === -1) {
                throw new Error("Current cylinder not found in visible cylinder numbers");
            }
            let x = iCurrentCylinder * pixelsPerCylinder + X_OFFSET;
            let y = CANVAS_RULER_HEIGHT + i * PATH_VERTICAL_HEIGHT;
            ctx.moveTo(x, y);
            ctx.fillStyle = "blue";
            ctx.strokeStyle = "blue";
            if (headStatus.action === 'seek') {
                // continuous line
                ctx.setLineDash([]);
            } else if (headStatus.action === 'jump') {
                // dashed line
                ctx.setLineDash([5, 5]);
            } else {
                throw new Error("Not implemented action: " + headStatus.action);
            }
            currentCylinder = headStatus.cylinder;
            iCurrentCylinder = visibleCylinderNumbers.indexOf(currentCylinder);
            if (iCurrentCylinder === -1) {
                throw new Error("Current cylinder not found in visible cylinder numbers");
            }
            x = iCurrentCylinder * pixelsPerCylinder + X_OFFSET;
            y = CANVAS_RULER_HEIGHT + (i + 1) * PATH_VERTICAL_HEIGHT;
            ctx.lineTo(x, y);
            ctx.stroke();

            // Draw a dot at x y with red
            ctx.fillStyle = "red";
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            // ctx.fillStyle = "blue";
            // ctx.font = "12px Arial";
            // ctx.textAlign = "center";
            // ctx.textBaseline = "middle";
            // ctx.fillText(headStatus.cylinder.toString(), x, y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        if (containerRef.current) {
            containerRef.current.appendChild(canvas);
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        }
    }, [output]);

    return (
        output === null
            ? <></>
            : <>
            <h2>Result</h2>
            <div>
                {`${output.numCylindersCameAcross} cylinders came across`}
            </div>
            <br />
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    overflowX: "auto",
                    overflowY: "auto",
                    whiteSpace: "nowrap",
                }}
                ref={containerRef}
            >
            </div>
            </>
    );
}
