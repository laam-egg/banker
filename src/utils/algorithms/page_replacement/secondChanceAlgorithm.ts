import { convertToFullOutput, PageReplacementAlgorithmInput, PageReplacementAlgorithmOutput, PageRequest, validateInput } from "./base";

export function secondChanceAlgorithm(input: PageReplacementAlgorithmInput): PageReplacementAlgorithmOutput {
    validateInput(input);
    const { referenceString, numFrames } = input;
    const pagesInFrames: (string | null)[] = Array(numFrames).fill(null);
    const referenceBits: boolean[] = Array(numFrames).fill(false);
    const pageRequests: PageRequest[] = [];

    let replacementIndex = 0;

    for (const reference of referenceString) {
        const indexOfReferencedPage = pagesInFrames.indexOf(reference);
        if (indexOfReferencedPage >= 0) {
            referenceBits[indexOfReferencedPage] = true;
            pageRequests.push({
                reference,
                pagesInFrames: [...pagesInFrames],
                referenceBits: [...referenceBits],
                clockHand: replacementIndex,
                pageFault: false,
            });
            continue;
        }


        while (referenceBits[replacementIndex] === true) {
            referenceBits[replacementIndex] = false;
            replacementIndex = (replacementIndex + 1) % numFrames;
        }
        const replacedPage = pagesInFrames[replacementIndex];
        pagesInFrames[replacementIndex] = reference;
        referenceBits[replacementIndex] = true;
        const modifiedFrame = replacementIndex;
        replacementIndex = (replacementIndex + 1) % numFrames;

        pageRequests.push({
            reference,
            pagesInFrames: [...pagesInFrames],
            referenceBits: [...referenceBits],
            clockHand: replacementIndex,
            pageFault: true,
            modifiedFrame,
            ...(
                replacedPage !== null
                    ? { replacedPage, needToReplace: true }
                    : { needToReplace: false }
            ),
        });
    }

    return convertToFullOutput({ pageRequests, input });
}
