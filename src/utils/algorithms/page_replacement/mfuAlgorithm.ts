import { convertToFullOutput, PageReplacementAlgorithmInput, PageReplacementAlgorithmOutput, PageRequest, validateInput } from "./base";

export function mfuAlgorithm(input: PageReplacementAlgorithmInput): PageReplacementAlgorithmOutput {
    validateInput(input);
    const { referenceString, numFrames } = input;
    const pagesInFrames: (string | null)[] = Array(numFrames).fill(null);
    const pageRequests: PageRequest[] = [];

    for (let iReference = 0; iReference < referenceString.length; ++iReference) {
        const reference = referenceString[iReference];
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
        if (indexOfFirstEmptyFrame >= 0) {
            pagesInFrames[indexOfFirstEmptyFrame] = reference;
            pageRequests.push({
                reference,
                pagesInFrames: [...pagesInFrames],
                pageFault: true,
                needToReplace: false,
                modifiedFrame: indexOfFirstEmptyFrame,
            });
        } else {
            const replacementIndex = findFrameToOverwrite({
                pastReferenceString: referenceString.slice(0, iReference),
                currentPagesInFrames: [...pagesInFrames] as string[],
            })
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
        }
    }

    return convertToFullOutput({ pageRequests, input });
}

function findFrameToOverwrite({
    pastReferenceString,
    currentPagesInFrames,
}: {
    pastReferenceString: string[],
    currentPagesInFrames: string[],
}): number {
    // Thay thế trang đã được sử dụng thường xuyên nhất
    let frameToOverwrite = null;
    let freqOfFrameToOverwrite = -1;
    for (let iPage = 0; iPage < currentPagesInFrames.length; ++iPage) {
        const page = currentPagesInFrames[iPage];

        let freqOfPage = 0;
        for (let iPastReference = 0; iPastReference < pastReferenceString.length; ++iPastReference) {
            const pastReference = pastReferenceString[iPastReference];
            if (pastReference === page) {
                ++freqOfPage;
            }
        }

        if (freqOfPage > freqOfFrameToOverwrite) {
            freqOfFrameToOverwrite = freqOfPage;
            frameToOverwrite = iPage;
        }
    }
    if (null === frameToOverwrite) {
        // None of the pages in the current frames
        // has ever been used, i.e. all have freq=0. So just replace
        // the page in the first frame i.e. iPage = 0.
        if (currentPagesInFrames.length < 1) {
            throw new Error("no pages, no frames???")
        }
        return 0;
    }
    return frameToOverwrite;
}
