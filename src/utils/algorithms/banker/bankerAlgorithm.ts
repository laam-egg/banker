import { Matrix, prettyPrintMatrix, subtractMatrices } from "../../matrices";
import { addVectors, isVectorLessThanOrEqualTo, prettyPrintVector, subtractVectors, Vector } from "../../vectors";
import { safetyAlgorithm } from "./safetyAlgorithm";
import _ from "lodash";

export function bankerAlgorithm(args: {
    Available: Vector,
    Holding: Matrix,
    Max: Matrix,
    iRequest: Vector,
    i: number,
}): {
    verdict: "Chấp nhận yêu cầu" | "Từ chối yêu cầu",
    verdictBoolean: boolean,
    details: string,
} {
    const clonedArgs = _.cloneDeep(args);
    const { Holding, Max, iRequest, i } = clonedArgs;
    let { Available } = clonedArgs;

    const Need = subtractMatrices(Max, Holding);
    let details = `Ma trận Need:\n= Max - Holding\n= ${prettyPrintMatrix(Need)}\n\n`;

    if (!isVectorLessThanOrEqualTo(iRequest, Need[i])) {
        return {
            verdictBoolean: false,
            verdict: "Từ chối yêu cầu",
            details: `Yêu cầu của tiến trình i (i = ${i}) vượt quá nhu cầu đã khai báo của chính nó, tức Request > Need[i].\nCụ thể: ${prettyPrintVector(iRequest)} > ${prettyPrintVector(Need[i])}\n\nQuyết định: từ chối yêu cầu.`,
        };
    }
    if (!isVectorLessThanOrEqualTo(iRequest, Available)) {
        return {
            verdictBoolean: false,
            verdict: "Từ chối yêu cầu",
            details: `Yêu cầu của tiến trình i (i = ${i}) vượt quá tài nguyên có sẵn (tức Request > Available).\nCụ thể: ${prettyPrintVector(iRequest)} > ${prettyPrintVector(Available)}\n\nQuyết định: từ chối yêu cầu.`,
        };
    };

    details += `Yêu cầu của tiến trình i (i = ${i}) hợp lệ, tức (Request <= Need[i]) và (Request <= Available).\nCụ thể:\nRequest=${prettyPrintVector(iRequest)} <= Need[${i}]=${prettyPrintVector(Need[i])}\nRequest=${prettyPrintVector(iRequest)} <= Available=${prettyPrintVector(Available)}\n\n`;
    details += "Tiến hành giả lập việc cấp phát tài nguyên cho tiến trình i và kiểm tra hệ thống có an toàn không. Sau khi giả lập:\n\n";

    Available = subtractVectors(Available, iRequest);
    Need[i] = subtractVectors(Need[i], iRequest);
    Holding[i] = addVectors(Holding[i], iRequest);

    details += `Vectơ Available:\n${prettyPrintVector(Available)}\n\n`;
    details += `Ma trận Need:\n${prettyPrintMatrix(Need)}\n\n`;
    details += `Ma trận Holding:\n${prettyPrintMatrix(Holding)}\n\n`;

    details += `******** Thực hiện thuật toán an toàn *********\n\n`;
    const { verdictBoolean, details: safetyDetails } = safetyAlgorithm({ Available, Holding, Max });
    details += safetyDetails;
    details += "\n\n******** Kết thúc thuật toán an toàn **********\n\n";
    details += `Quyết định: ${verdictBoolean ? "yêu cầu hợp lệ, cho phép cấp phát" : "từ chối yêu cầu."}`;

    return {
        verdictBoolean,
        verdict: verdictBoolean ? "Chấp nhận yêu cầu" : "Từ chối yêu cầu",
        details,
    };
}
