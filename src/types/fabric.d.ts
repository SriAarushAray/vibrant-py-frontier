
declare module 'fabric' {
  export class Canvas {
    constructor(
      element: HTMLCanvasElement, 
      options?: {
        width?: number;
        height?: number;
        backgroundColor?: string;
      }
    );
    width?: number;
    height?: number;
    add(...objects: Object[]): Canvas;
    remove(...objects: Object[]): Canvas;
    renderAll(): Canvas;
    getObjects(): Object[];
    setActiveObject(object: Object): Canvas;
    dispose(): void;
  }

  export class Object {
    set(options: any): Object;
    get(property: string): any;
    type?: string;
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
    selectable?: boolean;
  }

  export class Rect extends Object {
    constructor(options?: any);
  }

  export class Image extends Object {
    static fromURL(url: string, callback: (image: Image) => void, options?: any): void;
    scale(value: number): Image;
  }

  export const util: {
    cos: (value: number) => number;
    sin: (value: number) => number;
    degreesToRadians: (value: number) => number;
  };
}
