declare module 'croppie' {
  export interface CroppieOptions {
    viewport?: { width: number; height: number; type?: 'square' | 'circle' };
    boundary?: { width: number; height: number };
    showZoomer?: boolean;
    enableExif?: boolean;
    enableOrientation?: boolean;
    enableResize?: boolean;
    mouseWheelZoom?: boolean | 'ctrl';
  }

  export interface ResultOptions {
    type?: 'base64' | 'canvas' | 'blob' | 'rawcanvas' | 'viewport';
    size?: 'viewport' | { width?: number; height?: number };
    format?: 'jpeg' | 'png' | 'webp';
    quality?: number;
    circle?: boolean;
    backgroundColor?: string;
  }

  export default class Croppie {
    constructor(element: HTMLElement, options?: CroppieOptions)
    bind(options: { url: string; points?: number[]; zoom?: number; orientation?: number }): Promise<void>
    result(options?: ResultOptions): Promise<string | HTMLCanvasElement | Blob | HTMLElement>
    destroy(): void
    setZoom(zoom: number): void
    rotate(deg: number): void
    refresh(): void
    get(): { points: number[]; zoom: number; orientation: number }
  }
}
