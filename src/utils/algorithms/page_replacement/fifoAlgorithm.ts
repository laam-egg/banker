import { convertToFullOutput, PageReplacementAlgorithmInput, PageReplacementAlgorithmOutput, PageRequest, validateInput } from "./base";

export function fifoAlgorithm(input : PageReplacementAlgorithmInput): PageReplacementAlgorithmOutput {
    validateInput(input);
    const { referenceString, numFrames } = input;
    const pagesInFrames: (string | null)[] = Array(numFrames).fill(null);
    const pageRequests: PageRequest[] = [];

    let replacementIndex = 0;

    for (const reference of referenceString) {
        const indexOfReferencedPage = pagesInFrames.indexOf(reference);
        if (indexOfReferencedPage >= 0) {
            pageRequests.push({
                reference,
                pagesInFrames: [...pagesInFrames],
                pageFault: false,
            });
            continue;
        }

        const indexOfFirstEmptyFrame = pagesInFrames.indexOf(null);
        if (indexOfFirstEmptyFrame < 0) {
            const replacedPage = pagesInFrames[replacementIndex];
            if (replacedPage === null) {
                throw new Error("impossible code path");
            }
            pagesInFrames[replacementIndex] = reference;
            pageRequests.push({
                reference,
                pagesInFrames: [...pagesInFrames],
                pageFault: true,
                needToReplace: true,
                modifiedFrame: replacementIndex,
                replacedPage,
            });
            replacementIndex = (replacementIndex + 1) % numFrames;
        } else {
            pagesInFrames[indexOfFirstEmptyFrame] = reference;
            pageRequests.push({
                reference,
                pagesInFrames: [...pagesInFrames],
                pageFault: true,
                needToReplace: false,
                modifiedFrame: indexOfFirstEmptyFrame,
            });
        }
    }

    return convertToFullOutput({ pageRequests, input });
}
