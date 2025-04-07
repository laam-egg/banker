import { convertToFullOutput, PageReplacementAlgorithmInput, PageReplacementAlgorithmOutput, PageRequest, validateInput } from "./base";

export function optimalAlgorithm(input : PageReplacementAlgorithmInput): PageReplacementAlgorithmOutput {
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
            // Thay thế trang sẽ không được sử dụng lâu nhất
            const replacementIndex = findFrameToOverwrite({
                futureReferenceString: referenceString.slice(iReference + 1),
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
    futureReferenceString,
    currentPagesInFrames,
} : {
    futureReferenceString: string[],
    currentPagesInFrames: string[],
}): number {
    let frameToOverwrite = null;
    let distance = -1;
    for (let iPage = 0; iPage < currentPagesInFrames.length; ++iPage) {
        const page = currentPagesInFrames[iPage];

        let used = false;
        for (let iFutureReference = 0; iFutureReference < futureReferenceString.length; ++iFutureReference) {
            const futureReference = futureReferenceString[iFutureReference];
            if (futureReference === page) {
                used = true;
                const pageDistance = iFutureReference;
                if (pageDistance > distance) {
                    distance = pageDistance;
                    frameToOverwrite = iPage;
                }
                break;
            }
        }
    
        if (!used) {
            return iPage; // never used so the best to replace!
        }
    }
    if (null === frameToOverwrite) {
        // None of the pages in the current frames
        // is gonna ever be used. So just take
        // the page in the first frame i.e. iPage = 0.
        if (currentPagesInFrames.length < 1) {
            throw new Error("no pages, no frames???")
        }
        return 0;
    }
    return frameToOverwrite;
}
