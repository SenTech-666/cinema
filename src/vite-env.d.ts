/// <reference types="vite/client" />

declare module 'qrcode' {
  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: any,
    cb?: (error: Error | null) => void
  ): void;
}