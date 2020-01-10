interface formatReturn {
    content: string
}

declare class DataUriClass {
    constructor()

    format(fileExtension: string, imageBuffer: Buffer): formatReturn
}

declare module 'datauri' {
    export = DataUriClass
}