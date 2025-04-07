export type PageRequest = {
    reference: string,
    pagesInFrames: (string | null)[],
    referenceBits?: boolean[],
    clockHand?: number,
} & ({
    pageFault: false,
} | {
    pageFault: true,
    needToReplace: false,
    modifiedFrame: number,
} | {
    pageFault: true,
    needToReplace: true,
    modifiedFrame: number,
    replacedPage: string,
});

export type PageReplacementAlgorithmOutput = {
    pageRequests: PageRequest[],
    numPageFaults: number,
    numPageHits: number,
    input: PageReplacementAlgorithmInput,
};

export type PageReplacementAlgorithmInput = {
    referenceString: string[],
    numFrames: number,
};

export function validateInput({ numFrames }: PageReplacementAlgorithmInput) {
    if (numFrames <= 0) {
        throw new Error("Number of frames must be greater than 0");
    }
}

export function convertToFullOutput({ pageRequests, input } : {
    pageRequests: PageRequest[],
    input: PageReplacementAlgorithmInput,
}): PageReplacementAlgorithmOutput {
    const numPageFaults = pageRequests.filter(pageRequest => pageRequest.pageFault).length;
    const numPageHits = pageRequests.length - numPageFaults;

    return {
        pageRequests,
        numPageFaults,
        numPageHits,
        input,
    };
}
