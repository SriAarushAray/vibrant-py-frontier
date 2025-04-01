
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
    freeDrawingBrush: {
      color: string;
      width: number;
    };
    isDrawingMode: boolean;
    clear(): Canvas;
    backgroundColor: string;
    on(event: string, callback: Function): Canvas;
    requestRenderAll(): Canvas;
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
    lockRotation?: boolean;
    stroke?: string;
    strokeWidth?: number;
    strokeDashArray?: number[];
    fill?: string;
    transparentCorners?: boolean;
    cornerColor?: string;
    cornerStrokeColor?: string;
    cornerSize?: number;
    originX?: string;
    originY?: string;
    setCoords(): Object;
  }

  export class Rect extends Object {
    constructor(options?: any);
  }

  export class Circle extends Object {
    constructor(options?: any);
    radius?: number;
  }

  export class Image extends Object {
    static fromURL(url: string, callback: (image: Image) => void, options?: any): void;
    scale(value: number): Image;
    setSrc(url: string, callback: (image: Image) => void, options?: any): void;
    crossOrigin?: string;
  }

  export const util: {
    cos: (value: number) => number;
    sin: (value: number) => number;
    degreesToRadians: (value: number) => number;
  };
}
