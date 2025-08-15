declare module '@tensorflow-models/blazeface' {
  export interface BlazeFacePrediction {
    topLeft: [number, number];
    bottomRight: [number, number];
  }
  export interface BlazeFaceModel {
    estimateFaces(input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement, returnTensors?: boolean): Promise<any[]>;
  }
  export function load(): Promise<BlazeFaceModel>
}

declare module 'compressorjs' {
  export interface CompressorOptions {
    quality?: number
    convertSize?: number
    success?: (file: File | Blob) => void
    error?: (err: any) => void
  }
  export default class Compressor {
    constructor(file: File | Blob, options?: CompressorOptions)
  }
}
