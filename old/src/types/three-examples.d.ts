declare module 'three/examples/jsm/controls/OrbitControls.js' {
  import { Camera, EventDispatcher, MOUSE, TOUCH, Vector3, WebGLRenderer } from 'three';
  export class OrbitControls extends EventDispatcher<any> {
    constructor(object: Camera, domElement?: HTMLElement);
    object: Camera;
    domElement: HTMLElement | undefined;
    enabled: boolean;
    target: Vector3;
    minDistance: number;
    maxDistance: number;
    enableDamping: boolean;
    dampingFactor: number;
    mouseButtons: { LEFT: MOUSE; MIDDLE: MOUSE; RIGHT: MOUSE };
    touches: { ONE: TOUCH; TWO: TOUCH };
    update(): void;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/postprocessing/EffectComposer.js' {
  import { WebGLRenderer, WebGLRenderTarget } from 'three';
  import { Pass } from 'three/examples/jsm/postprocessing/Pass.js';
  export class EffectComposer {
    constructor(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget);
    addPass(pass: Pass): void;
    setSize(width: number, height: number): void;
    setPixelRatio(ratio: number): void;
    render(deltaTime?: number): void;
  }
}

declare module 'three/examples/jsm/postprocessing/RenderPass.js' {
  import { Camera, Scene } from 'three';
  import { Pass } from 'three/examples/jsm/postprocessing/Pass.js';
  export class RenderPass extends Pass {
    constructor(scene: Scene, camera: Camera);
  }
}

declare module 'three/examples/jsm/postprocessing/UnrealBloomPass.js' {
  import { Pass } from 'three/examples/jsm/postprocessing/Pass.js';
  import { Vector2 } from 'three';
  export class UnrealBloomPass extends Pass {
    constructor(resolution: Vector2, strength: number, radius: number, threshold: number);
    strength: number;
    radius: number;
    threshold: number;
  }
}

declare module 'three/examples/jsm/postprocessing/Pass.js' {
  export class Pass {
    enabled: boolean;
    needsSwap: boolean;
    renderToScreen: boolean;
    setSize(width: number, height: number): void;
    render(): void;
  }
}


