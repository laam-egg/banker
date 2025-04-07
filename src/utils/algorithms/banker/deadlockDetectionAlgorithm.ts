import { checkSameSize } from "../../dimensional";
import { Matrix } from "../../matrices";
import { addVectors, isVectorLessThanOrEqualTo, prettyPrintVector, Vector } from "../../vectors";
import _ from "lodash";

export type FinishVector = boolean[];

function findIndexOfFirstUnfinishedProcessButHasFulfillableRequest({
    Finish, Request, Work,
}: {
    Finish: FinishVector,
    Request: Matrix,
    Work: Vector,
}): number | null {
    const N = checkSameSize(Finish, Request, "Finish[n] vs Request[n]");
    checkSameSize(Request[0], Work, "Request[n][m] vs Work[m]");

    for (let i = 0; i < N; ++i) {
        if (Finish[i] == false && isVectorLessThanOrEqualTo(Request[i], Work)) return i;
    }
    return null;
}

function allProcessesHaveFinished({ Finish }: { Finish: FinishVector }): boolean {
    return Finish.every(finished => finished);
}

export function deadlockDetectionAlgorithm(args: {
    Available: Vector,
    Holding: Matrix,
    Request: Matrix,
}): {
    verdictBoolean: boolean,
    verdict: "Không bế tắc" | "Bế tắc",
    details: string,
} {
    const { Available, Holding, Request } = _.cloneDeep(args);

    let details = "";

    let Work = Available;
    let Finish = Holding.map(x => {
        return x.every(y => y === 0);
    });

    details += `Vectơ Work:\n${prettyPrintVector(Work)}\n\n`;
    details += `Vectơ Finish:\n${prettyPrintVector(Finish)}\n\n`;

    details += `======== Tiến hành vòng lặp ========\n\n`;
    
    let loopedAtLeastOnce = false;
    const safetyChain: number[] = [];
    while (true) {
        const i = findIndexOfFirstUnfinishedProcessButHasFulfillableRequest({ Finish, Request, Work });
        if (i === null) {
            details += "Không tìm thấy tiến trình i nào khác thỏa mãn (Finish[i] == false) && (Request[i] <= Work)\n\n"
            break;
        }
        loopedAtLeastOnce = true;
        details += `Tìm thấy tiến trình ${i} thỏa mãn (Finish[i] == false) && (Request[i] <= Work),\ncụ thể ${prettyPrintVector(Request[i])} <= ${prettyPrintVector(Work)}\n\n`;

        const newWork = addVectors(Work, Holding[i]);
        Finish[i] = true;
        details += `Vectơ Work:\n= Work + Holding[i]\n= ${prettyPrintVector(Work)} + ${prettyPrintVector(Holding[i])}\n= ${prettyPrintVector(newWork)}\n\n`;
        Work = newWork;
        details += `Vectơ Finish: ${prettyPrintVector(Finish)}\n\n`;
        details += `--- Tiến trình ${i} được giả sử đã hoàn thành ---\n\n`;
        Finish[i] = true;
        safetyChain.push(i);
    }
    details += "======== Kết thúc vòng lặp =========\n\n";

    if (!loopedAtLeastOnce) {
        details += "Không có tiến trình nào thỏa mãn (Finish[i] == false) && (Request[i] <= Work) từ đầu\n\n";
    }

    const verdictBoolean = allProcessesHaveFinished({ Finish });
    const verdict = verdictBoolean ? "Không bế tắc" : "Bế tắc";
    details += `Kết luận: ${verdictBoolean ? "Hệ thống không bị bế tắc." : "Hệ thống đang trong trạng thái bế tắc."}`;
    if (!verdictBoolean) {
        // Deadlock detected
        const deadlockProcesses = Finish.map((finished, i) => finished ? null : i).filter(i => i !== null);
        details += "\nCác tiến trình đang trong trạng thái bế tắc: " + deadlockProcesses.sort().map(i => `P${i}`).join(", ");
    } else {
        // No deadlock detected
        details += "\nChuỗi tiến trình cho phép tất cả các tiến trình hoàn thành: " + safetyChain.map(i => `P${i}`).join(" -> ");
    }

    return { verdictBoolean, verdict, details };
}