
export type Defaults = {
    attribPrefix?: string;
    textureColor?: number[];
    crossOrigin?: string;
    addExtensionsToContext?: boolean;
};
export function setDefaults(newDefaults: Defaults): void;
export function addExtensionsToContext(gl: WebGLRenderingContext): void;
export function getWebGLContext(canvas: HTMLCanvasElement, opt_attribs?: WebGLContextAttributes): WebGLRenderingContext;
export function createContext(canvas: HTMLCanvasElement): WebGLRenderingContext;
export function getContext(canvas: HTMLCanvasElement, opt_attribs?: WebGLContextAttributes): WebGLRenderingContext;
export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement, multiplier?: number): boolean;
export type AttribInfo = {
    value?: number[] | ArrayBufferView;
    numComponents?: number;
    size?: number;
    type?: number;
    normalize?: boolean;
    offset?: number;
    stride?: number;
    divisor?: number;
    buffer: WebGLBuffer;
    drawType?: number;
};
export type FullArraySpec = {
    value?: number[] | ArrayBufferView;
    data: number | number[] | ArrayBufferView;
    numComponents?: number;
    type?: Function;
    size?: number;
    normalize?: boolean;
    stride?: number;
    offset?: number;
    divisor?: number;
    attrib?: string;
    name?: string;
    attribName?: string;
    buffer?: WebGLBuffer;
};
export type ArraySpec = number | number[] | ArrayBufferView | FullArraySpec;
export type Arrays = {
    [key: string]: ArraySpec;
};
export type BufferInfo = {
    numElements: number;
    elementType?: number;
    indices?: WebGLBuffer;
    attribs?: {
        [key: string]: AttribInfo;
    };
};
export type DrawObject = {
    active?: boolean;
    type?: number;
    programInfo: ProgramInfo;
    bufferInfo?: BufferInfo;
    vertexArrayInfo?: VertexArrayInfo;
    uniforms: {
        [key: string]: any;
    };
    offset?: number;
    count?: number;
    instanceCount?: number;
};
export type AttachmentOptions = {
    attach?: number;
    format?: number;
    type?: number;
    target?: number;
    level?: number;
    attachment?: WebGLObject;
};
export type FramebufferInfo = {
    framebuffer: WebGLFramebuffer;
    attachments: WebGLObject[];
};
export type ErrorCallback = (msg: string, lineOffset?: number) => void;
export type ProgramOptions = {
    errorCallback?: (...params: any[]) => any;
    attribLocations?: {
        [key: string]: number;
    };
    transformFeedbackVaryings?: BufferInfo | {
        [key: string]: AttribInfo;
    } | string[];
    transformFeedbackMode?: number;
};
export type TransformFeedbackInfo = {
    index: number;
    type: number;
    size: number;
};
export function createTransformFeedbackInfo(gl: WebGLRenderingContext, program: WebGLProgram): {
    [key: string]: TransformFeedbackInfo;
};
export function bindTransformFeedbackInfo(gl: WebGLRenderingContext, transformFeedbackInfo: ProgramInfo | {
    [key: string]: TransformFeedbackInfo;
}, bufferInfo?: BufferInfo | {
    [key: string]: AttribInfo;
}): void;
export function createTransformFeedback(gl: WebGLRenderingContext, programInfo: ProgramInfo, bufferInfo?: BufferInfo | {
    [key: string]: AttribInfo;
}): WebGLTransformFeedback;
export type UniformData = {
    type: number;
    size: number;
    blockNdx: number;
    offset: number;
};
export type BlockSpec = {
    index: number;
    size: number;
    uniformIndices: number[];
    usedByVertexShader: boolean;
    usedByFragmentShader: boolean;
    used: boolean;
};
export type UniformBlockSpec = {
    uniformData: UniformData[];
};
export type UniformBlockInfo = {
    name: string;
    array: ArrayBuffer;
    asFloat: Float32Array;
    buffer: WebGLBuffer;
    offset?: number;
    uniforms: {
        [key: string]: ArrayBufferView;
    };
};
export type ProgramInfo = {
    program: WebGLProgram;
    uniformSetters: {
        [key: string]: (...params: any[]) => any;
    };
    attribSetters: {
        [key: string]: (...params: any[]) => any;
    };
    transformFeedbackInfo?: {
        [key: string]: TransformFeedbackInfo;
    };
};
export type TextureFunc = (gl: WebGLRenderingContext, options: TextureOptions) => any;
export type TextureOptions = {
    target?: number;
    level?: number;
    width?: number;
    height?: number;
    depth?: number;
    min?: number;
    mag?: number;
    minMag?: number;
    internalFormat?: number;
    format?: number;
    type?: number;
    wrap?: number;
    wrapS?: number;
    wrapT?: number;
    wrapR?: number;
    minLod?: number;
    maxLod?: number;
    baseLevel?: number;
    maxLevel?: number;
    unpackAlignment?: number;
    color?: number[] | ArrayBufferView;
    premultiplyAlpha?: number;
    flipY?: number;
    colorspaceConversion?: number;
    auto?: boolean;
    cubeFaceOrder?: number[];
    src?: number[] | ArrayBufferView | TexImageSource | TexImageSource[] | string | string[] | TextureFunc;
    crossOrigin?: string;
};
export type TextureSrc = HTMLImageElement | HTMLImageElement[];
export type TextureReadyCallback = (err: any, texture: WebGLTexture, souce: TextureSrc) => void;
export type TexturesReadyCallback = (err: any, textures: {
    [key: string]: WebGLTexture;
}, sources: {
    [key: string]: TextureSrc;
}) => void;
export type CubemapReadyCallback = (err: any, tex: WebGLTexture, imgs: HTMLImageElement[]) => void;
export type ThreeDReadyCallback = (err: any, tex: WebGLTexture, imgs: HTMLImageElement[]) => void;
export function isWebGL2(gl: WebGLRenderingContext): boolean;
export function isWebGL1(gl: WebGLRenderingContext): boolean;
export function glEnumToString(gl: WebGLRenderingContext, value: number): string;
export type VertexArrayInfo = {
    numElements: number;
    elementType?: number;
    vertexArrayObject?: WebGLVertexArrayObject;
};
export function setAttribInfoBufferFromArray(gl: WebGLRenderingContext, attribInfo: AttribInfo, array: ArraySpec, offset?: number): void;
export function createBufferInfoFromArrays(gl: WebGLRenderingContext, arrays: Arrays, srcBufferInfo?: BufferInfo): BufferInfo;
export function drawBufferInfo(gl: WebGLRenderingContext, bufferInfo: BufferInfo | VertexArrayInfo, type?: number, count?: number, offset?: number, instanceCount?: number): void;
export function drawObjectList(gl: WebGLRenderingContext, objectsToDraw: DrawObject[]): void;
export function createFramebufferInfo(gl: WebGLRenderingContext, attachments?: AttachmentOptions[], width?: number, height?: number): FramebufferInfo;
export function resizeFramebufferInfo(gl: WebGLRenderingContext, framebufferInfo: FramebufferInfo, attachments?: AttachmentOptions[], width?: number, height?: number): void;
export function bindFramebufferInfo(gl: WebGLRenderingContext, framebufferInfo?: FramebufferInfo, target?: number): void;
export function createProgramInfo(gl: WebGLRenderingContext, shaderSources: string[], opt_attribs?: ProgramOptions | string[] | ErrorCallback, opt_errorCallback?: ErrorCallback): ProgramInfo;
export function createUniformBlockInfo(gl: WebGL2RenderingContext, programInfo: ProgramInfo, blockName: string): UniformBlockInfo;
export function bindUniformBlock(gl: WebGL2RenderingContext, programInfo: ProgramInfo | UniformBlockSpec, uniformBlockInfo: UniformBlockInfo): boolean;
export function setUniformBlock(gl: WebGL2RenderingContext, programInfo: ProgramInfo | UniformBlockSpec, uniformBlockInfo: UniformBlockInfo): void;
export function setBlockUniforms(uniformBlockInfo: UniformBlockInfo, values: {
    [key: string]: any;
}): void;
export function setUniforms(setters: ProgramInfo | {
    [key: string]: (...params: any[]) => any;
}, values: {
    [key: string]: any;
}): void;
export function setBuffersAndAttributes(gl: WebGLRenderingContext, setters: ProgramInfo | {
    [key: string]: (...params: any[]) => any;
}, buffers: BufferInfo | VertexArrayInfo): void;
export function setTextureFromArray(gl: WebGLRenderingContext, tex: WebGLTexture, src: number[] | ArrayBufferView, options?: TextureOptions): void;
export function createTexture(gl: WebGLRenderingContext, options?: TextureOptions, callback?: TextureReadyCallback): WebGLTexture;
export function resizeTexture(gl: WebGLRenderingContext, tex: WebGLTexture, options: TextureOptions, width?: number, height?: number): void;
export function createTextures(gl: WebGLRenderingContext, options: {
    [key: string]: TextureOptions;
}, callback?: TexturesReadyCallback): {
    [key: string]: WebGLTexture;
};


export function setAttributePrefix(prefix: string): void;
export function createBufferFromTypedArray(gl: WebGLRenderingContext, typedArray: ArrayBuffer | SharedArrayBuffer | ArrayBufferView | WebGLBuffer, type?: number, drawType?: number): WebGLBuffer;
export function createAttribsFromArrays(gl: WebGLRenderingContext, arrays: Arrays, srcBufferInfo?: BufferInfo): {
    [key: string]: AttribInfo;
};
export function setAttribInfoBufferFromArray(gl: WebGLRenderingContext, attribInfo: AttribInfo, array: ArraySpec, offset?: number): void;
export function createBufferInfoFromArrays(gl: WebGLRenderingContext, arrays: Arrays, srcBufferInfo?: BufferInfo): BufferInfo;
export function createBufferFromArray(gl: WebGLRenderingContext, array: ArraySpec, arrayName: string): WebGLBuffer;
export function createBuffersFromArrays(gl: WebGLRenderingContext, arrays: Arrays): {
    [key: string]: WebGLBuffer;
};


export function drawBufferInfo(gl: WebGLRenderingContext, bufferInfo: BufferInfo | VertexArrayInfo, type?: number, count?: number, offset?: number, instanceCount?: number): void;
export function drawObjectList(gl: WebGLRenderingContext, objectsToDraw: DrawObject[]): void;


export function createFramebufferInfo(gl: WebGLRenderingContext, attachments?: AttachmentOptions[], width?: number, height?: number): FramebufferInfo;
export function resizeFramebufferInfo(gl: WebGLRenderingContext, framebufferInfo: FramebufferInfo, attachments?: AttachmentOptions[], width?: number, height?: number): void;
export function bindFramebufferInfo(gl: WebGLRenderingContext, framebufferInfo?: FramebufferInfo, target?: number): void;


export function getBindPointForSamplerType(): void;
export function createProgram(gl: WebGLRenderingContext, shaders: WebGLShader[] | string[], opt_attribs?: ProgramOptions | string[] | ErrorCallback, opt_errorCallback?: ErrorCallback): WebGLProgram;
export function createProgramFromScripts(gl: WebGLRenderingContext, shaderScriptIds: string[], opt_attribs?: ProgramOptions | string[] | ErrorCallback, opt_errorCallback?: ErrorCallback): WebGLProgram;
export function createProgramFromSources(gl: WebGLRenderingContext, shaderSources: string[], opt_attribs?: ProgramOptions | string[] | ErrorCallback, opt_errorCallback?: ErrorCallback): WebGLProgram;
export function createUniformSetters(program: WebGLProgram): {
    [key: string]: (...params: any[]) => any;
};
export function createUniformBlockSpecFromProgram(gl: WebGL2RenderingContext, program: WebGLProgram): UniformBlockSpec;
export function createUniformBlockInfoFromProgram(gl: WebGL2RenderingContext, program: WebGLProgram, blockName: string): UniformBlockInfo;
export function createUniformBlockInfo(gl: WebGL2RenderingContext, programInfo: ProgramInfo, blockName: string): UniformBlockInfo;
export function bindUniformBlock(gl: WebGL2RenderingContext, programInfo: ProgramInfo | UniformBlockSpec, uniformBlockInfo: UniformBlockInfo): boolean;
export function setUniformBlock(gl: WebGL2RenderingContext, programInfo: ProgramInfo | UniformBlockSpec, uniformBlockInfo: UniformBlockInfo): void;
export function setBlockUniforms(uniformBlockInfo: UniformBlockInfo, values: {
    [key: string]: any;
}): void;
export function setUniforms(setters: ProgramInfo | {
    [key: string]: (...params: any[]) => any;
}, values: {
    [key: string]: any;
}): void;
export function createAttributeSetters(program: WebGLProgram): {
    [key: string]: (...params: any[]) => any;
};
export function setAttributes(setters: {
    [key: string]: (...params: any[]) => any;
}, buffers: {
    [key: string]: AttribInfo;
}): void;
export function setBuffersAndAttributes(gl: WebGLRenderingContext, setters: ProgramInfo | {
    [key: string]: (...params: any[]) => any;
}, buffers: BufferInfo | VertexArrayInfo): void;
export function createProgramInfoFromProgram(gl: WebGLRenderingContext, program: WebGLProgram): ProgramInfo;
export function createProgramInfo(gl: WebGLRenderingContext, shaderSources: string[], opt_attribs?: ProgramOptions | string[] | ErrorCallback, opt_errorCallback?: ErrorCallback): ProgramInfo;


export function getBytesPerElementForInternalFormat(internalFormat: number, type: number): number;
export type TextureFormatInfo = {
    format: number;
    type: number;
};
export function getFormatAndTypeForInternalFormat(internalFormat: number): TextureFormatInfo;
export function canGenerateMipmap(internalFormat: number, type: number): boolean;
export function canFilter(internalFormat: number, type: number): boolean;
export function getNumComponentsForFormat(format: number): number;
export function setDefaultTextureColor(color: number[]): void;
export function setTextureParameters(gl: WebGLRenderingContext, tex: WebGLTexture, options: TextureOptions): void;
export function setSamplerParameters(gl: WebGLRenderingContext, sampler: WebGLSampler, options: TextureOptions): void;
export function setTextureFilteringForSize(gl: WebGLRenderingContext, tex: WebGLTexture, options?: TextureOptions, width?: number, height?: number, internalFormat?: number, type?: number): void;
export function setTextureFromElement(gl: WebGLRenderingContext, tex: WebGLTexture, element: HTMLElement, options?: TextureOptions): void;
export function setTextureTo1PixelColor(gl: WebGLRenderingContext, tex: WebGLTexture, options?: TextureOptions): void;
export function loadTextureFromUrl(gl: WebGLRenderingContext, tex: WebGLTexture, options?: TextureOptions, callback?: TextureReadyCallback): HTMLImageElement;
export function loadCubemapFromUrls(gl: WebGLRenderingContext, tex: WebGLTexture, options: TextureOptions, callback?: CubemapReadyCallback): void;
export function loadSlicesFromUrls(gl: WebGLRenderingContext, tex: WebGLTexture, options: TextureOptions, callback?: ThreeDReadyCallback): void;
export function setTextureFromArray(gl: WebGLRenderingContext, tex: WebGLTexture, src: number[] | ArrayBufferView, options?: TextureOptions): void;
export function setEmptyTexture(gl: WebGLRenderingContext, tex: WebGLTexture, options: TextureOptions): void;
export function createTexture(gl: WebGLRenderingContext, options?: TextureOptions, callback?: TextureReadyCallback): WebGLTexture;
export function resizeTexture(gl: WebGLRenderingContext, tex: WebGLTexture, options: TextureOptions, width?: number, height?: number): void;
export function createTextures(gl: WebGLRenderingContext, options: {
    [key: string]: TextureOptions;
}, callback?: TexturesReadyCallback): {
    [key: string]: WebGLTexture;
};


export function getGLTypeForTypedArray(typedArray: ArrayBufferView): number;
export function getGLTypeForTypedArrayType(typedArrayType: ArrayBufferView): number;
export function getTypedArrayTypeForGLType(type: number): (...params: any[]) => any;


export function createVertexArrayInfo(gl: WebGLRenderingContext, programInfo: ProgramInfo | ProgramInfo[], bufferInfo: BufferInfo): VertexArrayInfo;
export function createVAOAndSetAttributes(gl: WebGLRenderingContext, setters: {
    [key: string]: (...params: any[]) => any;
}, attribs: {
    [key: string]: AttribInfo;
}, indices?: WebGLBuffer): void;
export function createVAOFromBufferInfo(gl: WebGLRenderingContext, programInfo: {
    [key: string]: (...params: any[]) => any;
} | ProgramInfo, bufferInfo: BufferInfo, indices?: WebGLBuffer): void;

declare module v3 {
    export type Vec3 = number[] | Float32Array;
    export function setDefaultType(ctor: Function): Function;
    export function create(): v3.Vec3;
    export function add(a: v3.Vec3, b: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    export function subtract(a: v3.Vec3, b: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    export function lerp(a: v3.Vec3, b: v3.Vec3, t: number, dst?: v3.Vec3): v3.Vec3;
    export function lerpV(a: v3.Vec3, b: v3.Vec3, t: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    export function max(a: v3.Vec3, b: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    export function min(a: v3.Vec3, b: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    export function mulScalar(v: v3.Vec3, k: number, dst?: v3.Vec3): v3.Vec3;
    export function divScalar(v: v3.Vec3, k: number, dst?: v3.Vec3): v3.Vec3;
    export function cross(a: v3.Vec3, b: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    export function dot(a: v3.Vec3, b: v3.Vec3): number;
    export function length(v: v3.Vec3): number;
    export function lengthSq(v: v3.Vec3): number;
    export function distance(a: v3.Vec3, b: v3.Vec3): number;
    export function distanceSq(a: v3.Vec3, b: v3.Vec3): number;
    export function normalize(a: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    export function negate(v: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    export function copy(v: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    export function multiply(a: v3.Vec3, b: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    export function divide(a: v3.Vec3, b: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
}
declare module m4 {
    export type Mat4 = number[] | Float32Array;
    export function setDefaultType(ctor: Function): Function;
    export function negate(m: m4.Mat4, dst?: m4.Mat4): m4.Mat4;
    export function copy(m: m4.Mat4, dst?: m4.Mat4): m4.Mat4;
    export function identity(dst?: m4.Mat4): m4.Mat4;
    export function transpose(m: m4.Mat4, dst?: m4.Mat4): m4.Mat4;
    export function inverse(m: m4.Mat4, dst?: m4.Mat4): m4.Mat4;
    export function multiply(a: m4.Mat4, b: m4.Mat4, dst?: m4.Mat4): m4.Mat4;
    export function setTranslation(a: m4.Mat4, v: v3.Vec3, dst?: m4.Mat4): m4.Mat4;
    export function getTranslation(m: m4.Mat4, dst?: v3.Vec3): v3.Vec3;
    export function getAxis(m: m4.Mat4, axis: number): void;
    export function setAxis(v: v3.Vec3, axis: number, dst?: m4.Mat4): m4.Mat4;
    export function perspective(fieldOfViewYInRadians: number, aspect: number, zNear: number, zFar: number, dst?: m4.Mat4): m4.Mat4;
    export function ortho(left: number, right: number, bottom: number, top: number, near: number, far: number, dst?: m4.Mat4): m4.Mat4;
    export function frustum(left: number, right: number, bottom: number, top: number, near: number, far: number, dst?: m4.Mat4): m4.Mat4;
    export function lookAt(eye: v3.Vec3, target: v3.Vec3, up: v3.Vec3, dst?: m4.Mat4): m4.Mat4;
    export function translation(v: v3.Vec3, dst?: m4.Mat4): m4.Mat4;
    export function translate(m: m4.Mat4, v: v3.Vec3, dst?: m4.Mat4): m4.Mat4;
    export function rotationX(angleInRadians: number, dst?: m4.Mat4): m4.Mat4;
    export function rotateX(m: m4.Mat4, angleInRadians: number, dst?: m4.Mat4): m4.Mat4;
    export function rotationY(angleInRadians: number, dst?: m4.Mat4): m4.Mat4;
    export function rotateY(m: m4.Mat4, angleInRadians: number, dst?: m4.Mat4): m4.Mat4;
    export function rotationZ(angleInRadians: number, dst?: m4.Mat4): m4.Mat4;
    export function rotateZ(m: m4.Mat4, angleInRadians: number, dst?: m4.Mat4): m4.Mat4;
    export function axisRotation(axis: v3.Vec3, angleInRadians: number, dst?: m4.Mat4): m4.Mat4;
    export function axisRotate(m: m4.Mat4, axis: v3.Vec3, angleInRadians: number, dst?: m4.Mat4): m4.Mat4;
    export function scaling(v: v3.Vec3, dst?: m4.Mat4): m4.Mat4;
    export function scale(m: m4.Mat4, v: v3.Vec3, dst?: m4.Mat4): m4.Mat4;
    export function transformPoint(m: m4.Mat4, v: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    export function transformDirection(m: m4.Mat4, v: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    export function transformNormal(m: m4.Mat4, v: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
}
declare module primitives {
    export type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array;
    export function createAugmentedTypedArray(numComponents: number, numElements: number, opt_type: Function): ArrayBufferView;
    export function deindexVertices(vertices: {
        [key: string]: TypedArray;
    }): {
        [key: string]: TypedArray;
    };
    export function flattenNormals(vertices: {
        [key: string]: TypedArray;
    }): {
        [key: string]: TypedArray;
    };
    export function reorientDirections(array: number[] | TypedArray, matrix: m4.Mat4): number[] | TypedArray;
    export function reorientNormals(array: number[] | TypedArray, matrix: m4.Mat4): number[] | TypedArray;
    export function reorientPositions(array: number[] | TypedArray, matrix: m4.Mat4): number[] | TypedArray;
    export type NativeArrayOrTypedArray = number[] | TypedArray;
    export function reorientVertices(arrays: {
        [key: string]: NativeArrayOrTypedArray;
    }, matrix: m4.Mat4): {
        [key: string]: NativeArrayOrTypedArray;
    };
    export function createXYQuadBufferInfo(gl: WebGLRenderingContext, size?: number, xOffset?: number, yOffset?: number): {
        [key: string]: WebGLBuffer;
    };
    export function createXYQuadBuffers(gl: WebGLRenderingContext, size?: number, xOffset?: number, yOffset?: number): BufferInfo;
    export function createXYQuadVertices(size?: number, xOffset?: number, yOffset?: number): {
        [key: string]: TypedArray;
    };
    export function createPlaneBufferInfo(gl: WebGLRenderingContext, width?: number, depth?: number, subdivisionsWidth?: number, subdivisionsDepth?: number, matrix?: m4.Mat4): BufferInfo;
    export function createPlaneBuffers(gl: WebGLRenderingContext, width?: number, depth?: number, subdivisionsWidth?: number, subdivisionsDepth?: number, matrix?: m4.Mat4): {
        [key: string]: WebGLBuffer;
    };
    export function createPlaneVertices(width?: number, depth?: number, subdivisionsWidth?: number, subdivisionsDepth?: number, matrix?: m4.Mat4): {
        [key: string]: TypedArray;
    };
    export function createSphereBufferInfo(gl: WebGLRenderingContext, radius: number, subdivisionsAxis: number, subdivisionsHeight: number, opt_startLatitudeInRadians?: number, opt_endLatitudeInRadians?: number, opt_startLongitudeInRadians?: number, opt_endLongitudeInRadians?: number): BufferInfo;
    export function createSphereBuffers(gl: WebGLRenderingContext, radius: number, subdivisionsAxis: number, subdivisionsHeight: number, opt_startLatitudeInRadians?: number, opt_endLatitudeInRadians?: number, opt_startLongitudeInRadians?: number, opt_endLongitudeInRadians?: number): {
        [key: string]: WebGLBuffer;
    };
    export function createSphereVertices(radius: number, subdivisionsAxis: number, subdivisionsHeight: number, opt_startLatitudeInRadians?: number, opt_endLatitudeInRadians?: number, opt_startLongitudeInRadians?: number, opt_endLongitudeInRadians?: number): {
        [key: string]: TypedArray;
    };
    export function createCubeBufferInfo(gl: WebGLRenderingContext, size?: number): BufferInfo;
    export function createCubeBuffers(gl: WebGLRenderingContext, size?: number): {
        [key: string]: WebGLBuffer;
    };
    export function createCubeVertices(size?: number): {
        [key: string]: TypedArray;
    };
    export function createTruncatedConeBufferInfo(gl: WebGLRenderingContext, bottomRadius: number, topRadius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, opt_topCap?: boolean, opt_bottomCap?: boolean): BufferInfo;
    export function createTruncatedConeBuffers(gl: WebGLRenderingContext, bottomRadius: number, topRadius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, opt_topCap?: boolean, opt_bottomCap?: boolean): {
        [key: string]: WebGLBuffer;
    };
    export function createTruncatedConeVertices(bottomRadius: number, topRadius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, opt_topCap?: boolean, opt_bottomCap?: boolean): {
        [key: string]: TypedArray;
    };
    export function create3DFBufferInfo(gl: WebGLRenderingContext): BufferInfo;
    export function create3DFBuffers(gl: WebGLRenderingContext): {
        [key: string]: WebGLBuffer;
    };
    export function create3DFVertices(): {
        [key: string]: TypedArray;
    };
    export function createCresentBufferInfo(gl: WebGLRenderingContext, verticalRadius: number, outerRadius: number, innerRadius: number, thickness: number, subdivisionsDown: number, startOffset?: number, endOffset?: number): BufferInfo;
    export function createCresentBuffers(gl: WebGLRenderingContext, verticalRadius: number, outerRadius: number, innerRadius: number, thickness: number, subdivisionsDown: number, startOffset?: number, endOffset?: number): {
        [key: string]: WebGLBuffer;
    };
    export function createCresentVertices(verticalRadius: number, outerRadius: number, innerRadius: number, thickness: number, subdivisionsDown: number, startOffset?: number, endOffset?: number): {
        [key: string]: TypedArray;
    };
    export function createCylinderBufferInfo(gl: WebGLRenderingContext, radius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, topCap?: boolean, bottomCap?: boolean): BufferInfo;
    export function createCylinderBuffers(gl: WebGLRenderingContext, radius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, topCap?: boolean, bottomCap?: boolean): {
        [key: string]: WebGLBuffer;
    };
    export function createCylinderVertices(radius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, topCap?: boolean, bottomCap?: boolean): {
        [key: string]: TypedArray;
    };
    export function createTorusBufferInfo(gl: WebGLRenderingContext, radius: number, thickness: number, radialSubdivisions: number, bodySubdivisions: number, startAngle?: boolean, endAngle?: boolean): BufferInfo;
    export function createTorusBuffers(gl: WebGLRenderingContext, radius: number, thickness: number, radialSubdivisions: number, bodySubdivisions: number, startAngle?: boolean, endAngle?: boolean): {
        [key: string]: WebGLBuffer;
    };
    export function createTorusVertices(radius: number, thickness: number, radialSubdivisions: number, bodySubdivisions: number, startAngle?: boolean, endAngle?: boolean): {
        [key: string]: TypedArray;
    };
    export function createDiscBufferInfo(gl: WebGLRenderingContext, radius: number, divisions: number, stacks?: number, innerRadius?: number, stackPower?: number): BufferInfo;
    export function createDiscBuffers(gl: WebGLRenderingContext, radius: number, divisions: number, stacks?: number, innerRadius?: number, stackPower?: number): {
        [key: string]: WebGLBuffer;
    };
    export function createDiscVertices(radius: number, divisions: number, stacks?: number, innerRadius?: number, stackPower?: number): {
        [key: string]: TypedArray;
    };
    export type RandomColorFunc = (ndx: number, channel: number) => number;
    export type RandomVerticesOptions = {
        vertsPerColor?: number;
        rand?: primitives.RandomColorFunc;
    };
    export function makeRandomVertexColors(vertices: {
        [key: string]: ArrayBufferView;
    }, options?: primitives.RandomVerticesOptions): {
        [key: string]: ArrayBufferView;
    };
    export function concatVertices(arrays: Arrays[]): Arrays;
    export function duplicateVertices(arrays: Arrays): Arrays;
}