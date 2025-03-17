import { checkSameSize } from "../dimensional";
import { Matrix, prettyPrintMatrix, subtractMatrices } from "../matrices";
import { addVectors, isVectorLessThanOrEqualTo, prettyPrintVector, Vector } from "../vectors";
import _ from "lodash";

export type FinishVector = boolean[];

function findIndexOfFirstUnfinishedProcessButHasFulfillableNeed({
    Finish, Need, Work,
}: {
    Finish: FinishVector,
    Need: Matrix,
    Work: Vector,
}): number | null {
    const N = checkSameSize(Finish, Need, "Finish[n] vs Need[n]");
    checkSameSize(Need[0], Work, "Need[n][m] vs Work[m]");

    for (let i = 0; i < N; ++i) {
        if (Finish[i] == false && isVectorLessThanOrEqualTo(Need[i], Work)) return i;
    }
    return null;
}

function allProcessesHaveFinished({ Finish }: { Finish: FinishVector }): boolean {
    return Finish.every(finished => finished);
}

export function safetyAlgorithm(args: {
    Available: Vector,
    Holding: Matrix,
    Max: Matrix,
}): {
    verdict: "An toàn" | "Không an toàn",
    verdictBoolean: boolean,
    details: string,
} {
    const { Available, Holding, Max } = _.cloneDeep(args);

    const numProcesses = checkSameSize(Holding, Max, "Holding[n][m] vs Max[n][m]");
    checkSameSize(Holding[0], Available, "Holding[0][m] vs Available[m]");
    let details = `Số tiến trình: n = ${numProcesses}\nSố tài nguyên: m = ${Available.length}\n\n`;

    const Need = subtractMatrices(Max, Holding);
    let Work = [...Available];
    const Finish: boolean[] = Array(numProcesses).fill(false);

    details += `Vectơ Work:\n${prettyPrintVector(Work)}\n\n`;
    details += `Vectơ Finish: ${prettyPrintVector(Finish)}\n\n`;

    details += `Ma trận Need:\n${prettyPrintMatrix(Need)}\n\n======== Tiến hành vòng lặp ========\n\n`;

    let loopedAtLeastOnce = false;
    const safetyChain: number[] = [];
    while (true) {
        let i = findIndexOfFirstUnfinishedProcessButHasFulfillableNeed({ Finish, Need, Work });
        if (i === null) {
            details += "Không tìm thấy tiến trình i nào khác thỏa mãn (Finish[i] == false) && (Need[i] <= Work)\n\n"
            break;
        }
        loopedAtLeastOnce = true;
        details += `Tìm thấy tiến trình ${i} thỏa mãn (Finish[i] == false) && (Need[i] <= Work),\ncụ thể ${prettyPrintVector(Need[i])} <= ${prettyPrintVector(Work)}\n\n`;

        const newWork = addVectors(Work, Holding[i]);
        Finish[i] = true;
        details += `Vectơ Work:\n= Work + Holding[i]\n= ${prettyPrintVector(Work)} + ${prettyPrintVector(Holding[i])}\n= ${prettyPrintVector(newWork)}\n\n`;
        Work = newWork;
        details += `Vectơ Finish: ${prettyPrintVector(Finish)}\n\n`;
        details += `--- Tiến trình ${i} đã hoàn thành ---\n\n`;
        safetyChain.push(i);
    }
    details += "======== Kết thúc vòng lặp =========\n\n";

    if (!loopedAtLeastOnce) {
        details += "Không có tiến trình nào thỏa mãn (Finish[i] == false) && (Need[i] <= Work) từ đầu\n\n";
    }

    const verdictBoolean = allProcessesHaveFinished({ Finish });
    const verdict = verdictBoolean ? "An toàn" : "Không an toàn";
    details += `Kết luận: ${verdictBoolean ? "Hệ thống an toàn" : "Hệ thống không an toàn"}`;

    if (verdictBoolean) {
        // Safe
        details += "\nChuỗi tiến trình thỏa mãn điều kiện an toàn:\n" + safetyChain.map(i => `P${i}`).join(" -> ");
    }

    return { verdictBoolean, verdict, details };
}
