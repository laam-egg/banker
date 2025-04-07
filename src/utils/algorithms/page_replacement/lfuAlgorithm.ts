import { convertToFullOutput, PageReplacementAlgorithmInput, PageReplacementAlgorithmOutput, PageRequest, validateInput } from "./base";

export function lfuAlgorithm(input: PageReplacementAlgorithmInput): PageReplacementAlgorithmOutput {
    return privateLfuAlgorithm(input, false);
}

export function lfuAlgorithmReplacingLeastRecentlyUsedInCaseOfSameFreq(input: PageReplacementAlgorithmInput): PageReplacementAlgorithmOutput {
    return privateLfuAlgorithm(input, true);
}

function privateLfuAlgorithm(input: PageReplacementAlgorithmInput, replaceLeastRecentlyUsedInCaseOfSameFreq: boolean): PageReplacementAlgorithmOutput {
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
                replaceLeastRecentlyUsedInCaseOfSameFreq,
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
    replaceLeastRecentlyUsedInCaseOfSameFreq,
}: {
    pastReferenceString: string[],
    currentPagesInFrames: string[],
    replaceLeastRecentlyUsedInCaseOfSameFreq: boolean,
}): number {
    // Thay thế trang đã được sử dụng không thường xuyên nhất
    let frameToOverwrite = null;
    let freqOfFrameToOverwrite = pastReferenceString.length + 2;
    let distanceOfFrameToOverwrite = -1;
    for (let iPage = 0; iPage < currentPagesInFrames.length; ++iPage) {
        const page = currentPagesInFrames[iPage];

        let freqOfPage = 0;
        let distanceOfPage = -1;
        for (let iPastReference = 0; iPastReference < pastReferenceString.length; ++iPastReference) {
            const pastReference = pastReferenceString[iPastReference];
            if (pastReference === page) {
                ++freqOfPage;
                distanceOfPage = pastReferenceString.length - iPastReference;
            }
        }

        if (
            (freqOfPage < freqOfFrameToOverwrite)
            || (
                (freqOfPage == freqOfFrameToOverwrite)
                && replaceLeastRecentlyUsedInCaseOfSameFreq
                && (distanceOfPage > distanceOfFrameToOverwrite)
            )
        ) {
            freqOfFrameToOverwrite = freqOfPage;
            frameToOverwrite = iPage;
            distanceOfFrameToOverwrite = distanceOfPage;
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
