import { convertToFullOutput, PageReplacementAlgorithmInput, PageReplacementAlgorithmOutput, PageRequest, validateInput } from "./base";

export function mruAlgorithm(input : PageReplacementAlgorithmInput): PageReplacementAlgorithmOutput {
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
            // Thay thế trang được sử dụng gần nhất
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
} : {
    pastReferenceString: string[],
    currentPagesInFrames: string[],
}): number {
    let frameToOverwrite = null;
    let distance = pastReferenceString.length + 2;
    for (let iPage = 0; iPage < currentPagesInFrames.length; ++iPage) {
        const page = currentPagesInFrames[iPage];

        let used = false;
        for (let iPastReference = pastReferenceString.length - 1; iPastReference >= 0; --iPastReference) {
            const pastReference = pastReferenceString[iPastReference];
            if (pastReference === page) {
                used = true;
                const pageDistance = pastReferenceString.length - iPastReference;
                if (pageDistance < distance) {
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
        // has ever been used. So just take
        // the page in the first frame i.e. iPage = 0.
        if (currentPagesInFrames.length < 1) {
            throw new Error("no pages, no frames???")
        }
        return 0;
    }
    return frameToOverwrite;
}
