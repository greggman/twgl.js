
/**
 * Various default settings for twgl.
 *
 * Note: You can call this any number of times. Example:
 *
 *     twgl.setDefaults({ textureColor: [1, 0, 0, 1] });
 *     twgl.setDefaults({ attribPrefix: 'a_' });
 *
 * is equivalent to
 *
 *     twgl.setDefaults({
 *       textureColor: [1, 0, 0, 1],
 *       attribPrefix: 'a_',
 *     });
 *
 * @typedef {Object} Defaults
 * @property {string} [attribPrefix] The prefix to stick on attributes
 *
 *   When writing shaders I prefer to name attributes with `a_`, uniforms with `u_` and varyings with `v_`
 *   as it makes it clear where they came from. But, when building geometry I prefer using un-prefixed names.
 *
 *   In other words I'll create arrays of geometry like this
 *
 *       const arrays = {
 *         position: ...
 *         normal: ...
 *         texcoord: ...
 *       };
 *
 *   But need those mapped to attributes and my attributes start with `a_`.
 *
 *   Default: `""`
 *
 * @property {number[]} [textureColor] Array of 4 values in the range 0 to 1
 *
 *   The default texture color is used when loading textures from
 *   urls. Because the URL will be loaded async we'd like to be
 *   able to use the texture immediately. By putting a 1x1 pixel
 *   color in the texture we can start using the texture before
 *   the URL has loaded.
 *
 *   Default: `[0.5, 0.75, 1, 1]`
 *
 * @property {string} [crossOrigin]
 *
 *   If not undefined sets the crossOrigin attribute on images
 *   that twgl creates when downloading images for textures.
 *
 *   Also see {@link TextureOptions}.
 *
 * @property {bool} [addExtensionsToContext]
 *
 *   If true, then, when twgl will try to add any supported WebGL extensions
 *   directly to the context under their normal GL names. For example
 *   if ANGLE_instances_arrays exists then twgl would enable it,
 *   add the functions `vertexAttribDivisor`, `drawArraysInstanced`,
 *   `drawElementsInstanced`, and the constant `VERTEX_ATTRIB_ARRAY_DIVISOR`
 *   to the `WebGLRenderingContext`.
 *
 * @memberOf module:twgl
 */
export type Defaults = {
    attribPrefix?: string;
    textureColor?: number[];
    crossOrigin?: string;
    addExtensionsToContext?: boolean;
};
/**
 * Sets various defaults for twgl.
 *
 * In the interest of terseness which is kind of the point
 * of twgl I've integrated a few of the older functions here
 *
 * @param {Defaults} newDefaults The default settings.
 * @memberOf module:twgl
 */
export function setDefaults(newDefaults: Defaults): void;
/**
 * Attempts to enable all of the following extensions
 * and add their functions and constants to the
 * `WebGLRenderingContext` using their normal non-extension like names.
 *
 *      ANGLE_instanced_arrays
 *      EXT_blend_minmax
 *      EXT_color_buffer_float
 *      EXT_color_buffer_half_float
 *      EXT_disjoint_timer_query
 *      EXT_disjoint_timer_query_webgl2
 *      EXT_frag_depth
 *      EXT_sRGB
 *      EXT_shader_texture_lod
 *      EXT_texture_filter_anisotropic
 *      OES_element_index_uint
 *      OES_standard_derivatives
 *      OES_texture_float
 *      OES_texture_float_linear
 *      OES_texture_half_float
 *      OES_texture_half_float_linear
 *      OES_vertex_array_object
 *      WEBGL_color_buffer_float
 *      WEBGL_compressed_texture_atc
 *      WEBGL_compressed_texture_etc1
 *      WEBGL_compressed_texture_pvrtc
 *      WEBGL_compressed_texture_s3tc
 *      WEBGL_compressed_texture_s3tc_srgb
 *      WEBGL_depth_texture
 *      WEBGL_draw_buffers
 *
 * For example if `ANGLE_instanced_arrays` exists then the functions
 * `drawArraysInstanced`, `drawElementsInstanced`, `vertexAttribDivisor`
 * and the constant `VERTEX_ATTRIB_ARRAY_DIVISOR` are added to the
 * `WebGLRenderingContext`.
 *
 * Note that if you want to know if the extension exists you should
 * probably call `gl.getExtension` for each extension. Alternatively
 * you can check for the existence of the functions or constants that
 * are expected to be added. For example
 *
 *    if (gl.drawBuffers) {
 *      // Either WEBGL_draw_buffers was enabled OR you're running in WebGL2
 *      ....
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @memberOf module:twgl
 */
export function addExtensionsToContext(gl: WebGLRenderingContext): void;
/**
 * Creates a webgl context.
 *
 * Will return a WebGL2 context if possible.
 *
 * You can check if it's WebGL2 with
 *
 *     twgl.isWebGL2(gl);
 *
 * @param {HTMLCanvasElement} canvas The canvas tag to get
 *     context from. If one is not passed in one will be
 *     created.
 * @return {WebGLRenderingContext} The created context.
 */
export function createContext(canvas: HTMLCanvasElement): WebGLRenderingContext;
/**
 * Gets a WebGL context.  Will create a WebGL2 context if possible.
 *
 * You can check if it's WebGL2 with
 *
 *    function isWebGL2(gl) {
 *      return gl.getParameter(gl.VERSION).indexOf("WebGL 2.0 ") == 0;
 *    }
 *
 * Note: For a WebGL1 context will attempt to enable Vertex Array Objects
 * and add WebGL2 entry points. (unless you first set defaults with
 * `twgl.setDefaults({enableVertexArrayObjects: false})`;
 *
 * @param {HTMLCanvasElement} canvas a canvas element.
 * @param {WebGLContextAttributes} [opt_attribs] optional webgl context creation attributes
 * @return {WebGLRenderingContext} The created context.
 * @memberOf module:twgl
 */
export function getContext(canvas: HTMLCanvasElement, opt_attribs?: WebGLContextAttributes): WebGLRenderingContext;
/**
 * Resize a canvas to match the size it's displayed.
 * @param {HTMLCanvasElement} canvas The canvas to resize.
 * @param {number} [multiplier] So you can pass in `window.devicePixelRatio` or other scale value if you want to.
 * @return {boolean} true if the canvas was resized.
 * @memberOf module:twgl
 */
export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement, multiplier?: number): boolean;
/**
 * The info for an attribute. This is effectively just the arguments to `gl.vertexAttribPointer` plus the WebGLBuffer
 * for the attribute.
 *
 * @typedef {Object} AttribInfo
 * @property {number[]|ArrayBufferView} [value] a constant value for the attribute. Note: if this is set the attribute will be
 *    disabled and set to this constant value and all other values will be ignored.
 * @property {number} [numComponents] the number of components for this attribute.
 * @property {number} [size] synonym for `numComponents`.
 * @property {number} [type] the type of the attribute (eg. `gl.FLOAT`, `gl.UNSIGNED_BYTE`, etc...) Default = `gl.FLOAT`
 * @property {boolean} [normalize] whether or not to normalize the data. Default = false
 * @property {number} [offset] offset into buffer in bytes. Default = 0
 * @property {number} [stride] the stride in bytes per element. Default = 0
 * @property {number} [divisor] the divisor in instances. Default = 0.
 *    Requires WebGL2 or the ANGLE_instanced_arrays extension.
 *    and, if you're using WebGL1 you must have called {@link addExtensionsToContext}
 * @property {WebGLBuffer} buffer the buffer that contains the data for this attribute
 * @property {number} [drawType] the draw type passed to gl.bufferData. Default = gl.STATIC_DRAW
 * @memberOf module:twgl
 */
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
/**
 * Use this type of array spec when TWGL can't guess the type or number of components of an array
 * @typedef {Object} FullArraySpec
 * @property {number[]|ArrayBufferView} [value] a constant value for the attribute. Note: if this is set the attribute will be
 *    disabled and set to this constant value and all other values will be ignored.
 * @property {(number|number[]|ArrayBufferView)} [data] The data of the array. A number alone becomes the number of elements of type.
 * @property {number} [numComponents] number of components for `vertexAttribPointer`. Default is based on the name of the array.
 *    If `coord` is in the name assumes `numComponents = 2`.
 *    If `color` is in the name assumes `numComponents = 4`.
 *    otherwise assumes `numComponents = 3`
 * @property {number|TypedArrayConstructor} [type] type. This is used if `data` is a JavaScript array, or `buffer` is passed in, or `data` is a number.
 *   It can either be the constructor for a typedarray. (eg. `Uint8Array`) OR a WebGL type, (eg `gl.UNSIGNED_BYTE`).
 *   For example if you want colors in a `Uint8Array` you might have a `FullArraySpec` like `{ type: gl.UNSIGNED_BYTE, data: [255,0,255,255, ...], }`.
 * @property {number} [size] synonym for `numComponents`.
 * @property {boolean} [normalize] normalize for `vertexAttribPointer`. Default is true if type is `Int8Array` or `Uint8Array` otherwise false.
 * @property {number} [stride] stride for `vertexAttribPointer`. Default = 0
 * @property {number} [offset] offset for `vertexAttribPointer`. Default = 0
 * @property {number} [divisor] divisor for `vertexAttribDivisor`. Default = 0.
 *     Requires WebGL2 or the ANGLE_instanced_arrays extension.
 *     and, if you using WebGL1 you must have called {@link addExtensionsToContext}
 * @property {string} [attrib] name of attribute this array maps to. Defaults to same name as array prefixed by the default attribPrefix.
 * @property {string} [name] synonym for `attrib`.
 * @property {string} [attribName] synonym for `attrib`.
 * @property {WebGLBuffer} [buffer] Buffer to use for this attribute. This lets you use your own buffer
 *    but you will need to supply `numComponents` and `type`. You can effectively pass an `AttribInfo`
 *    to provide this. Example:
 *
 *         const bufferInfo1 = twgl.createBufferInfoFromArrays(gl, {
 *           position: [1, 2, 3, ... ],
 *         });
 *         const bufferInfo2 = twgl.createBufferInfoFromArrays(gl, {
 *           position: bufferInfo1.attribs.position,  // use the same buffer from bufferInfo1
 *         });
 *
 * @property {number} [drawType] the draw type passed to gl.bufferData. Default = gl.STATIC_DRAW
 * @memberOf module:twgl
 */
export type FullArraySpec = {
    value?: number[] | ArrayBufferView;
    data?: number | number[] | ArrayBufferView;
    numComponents?: number;
    type?: number | TypedArrayConstructor;
    size?: number;
    normalize?: boolean;
    stride?: number;
    offset?: number;
    divisor?: number;
    attrib?: string;
    name?: string;
    attribName?: string;
    buffer?: WebGLBuffer;
    drawType?: number;
};
/**
 * An individual array in {@link Arrays}
 *
 * When passed to {@link createBufferInfoFromArrays} if an ArraySpec is `number[]` or `ArrayBufferView`
 * the types will be guessed based on the name. `indices` will be `Uint16Array`, everything else will
 * be `Float32Array`. If an ArraySpec is a number it's the number of floats for an empty (zeroed) buffer.
 *
 * @typedef {(number|number[]|ArrayBufferView|FullArraySpec)} ArraySpec
 * @memberOf module:twgl
 */
export type ArraySpec = number | number[] | ArrayBufferView | FullArraySpec;
/**
 * This is a JavaScript object of arrays by name. The names should match your shader's attributes. If your
 * attributes have a common prefix you can specify it by calling {@link setAttributePrefix}.
 *
 *     Bare JavaScript Arrays
 *
 *         var arrays = {
 *            position: [-1, 1, 0],
 *            normal: [0, 1, 0],
 *            ...
 *         }
 *
 *     Bare TypedArrays
 *
 *         var arrays = {
 *            position: new Float32Array([-1, 1, 0]),
 *            color: new Uint8Array([255, 128, 64, 255]),
 *            ...
 *         }
 *
 * *   Will guess at `numComponents` if not specified based on name.
 *
 *     If `coord` is in the name assumes `numComponents = 2`
 *
 *     If `color` is in the name assumes `numComponents = 4`
 *
 *     otherwise assumes `numComponents = 3`
 *
 * Objects with various fields. See {@link FullArraySpec}.
 *
 *     var arrays = {
 *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
 *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
 *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
 *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
 *     };
 *
 * @typedef {Object.<string, ArraySpec>} Arrays
 * @memberOf module:twgl
 */
export type Arrays = {
    [key: string]: ArraySpec;
};
/**
 * @typedef {Object} BufferInfo
 * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
 * @property {number} [elementType] The type of indices `UNSIGNED_BYTE`, `UNSIGNED_SHORT` etc..
 * @property {WebGLBuffer} [indices] The indices `ELEMENT_ARRAY_BUFFER` if any indices exist.
 * @property {Object.<string, AttribInfo>} [attribs] The attribs appropriate to call `setAttributes`
 * @memberOf module:twgl
 */
export type BufferInfo = {
    numElements: number;
    elementType?: number;
    indices?: WebGLBuffer;
    attribs?: {
        [key: string]: AttribInfo;
    };
};
/**
 * A DrawObject is useful for putting objects in to an array and passing them to {@link drawObjectList}.
 *
 * You need either a `BufferInfo` or a `VertexArrayInfo`.
 *
 * @typedef {Object} DrawObject
 * @property {boolean} [active] whether or not to draw. Default = `true` (must be `false` to be not true). In other words `undefined` = `true`
 * @property {number} [type] type to draw eg. `gl.TRIANGLES`, `gl.LINES`, etc...
 * @property {ProgramInfo} programInfo A ProgramInfo as returned from {@link createProgramInfo}
 * @property {BufferInfo} [bufferInfo] A BufferInfo as returned from {@link createBufferInfoFromArrays}
 * @property {VertexArrayInfo} [vertexArrayInfo] A VertexArrayInfo as returned from {@link createVertexArrayInfo}
 * @property {Object<string, ?>} uniforms The values for the uniforms.
 *   You can pass multiple objects by putting them in an array. For example
 *
 *     var sharedUniforms = {
 *       u_fogNear: 10,
 *       u_projection: ...
 *       ...
 *     };
 *
 *     var localUniforms = {
 *       u_world: ...
 *       u_diffuseColor: ...
 *     };
 *
 *     var drawObj = {
 *       ...
 *       uniforms: [sharedUniforms, localUniforms],
 *     };
 *
 * @property {number} [offset] the offset to pass to `gl.drawArrays` or `gl.drawElements`. Defaults to 0.
 * @property {number} [count] the count to pass to `gl.drawArrays` or `gl.drawElements`. Defaults to bufferInfo.numElements.
 * @property {number} [instanceCount] the number of instances. Defaults to undefined.
 * @memberOf module:twgl
 */
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
/**
 * The options for a framebuffer attachment.
 *
 * Note: For a `format` that is a texture include all the texture
 * options from {@link TextureOptions} for example
 * `min`, `mag`, `clamp`, etc... Note that unlike {@link TextureOptions}
 * `auto` defaults to `false` for attachment textures but `min` and `mag` default
 * to `gl.LINEAR` and `wrap` defaults to `CLAMP_TO_EDGE`
 *
 * @typedef {Object} AttachmentOptions
 * @property {number} [attachmentPoint] The attachment point. Defaults
 *   to `gl.COLOR_ATTACHMENT0 + ndx` unless type is a depth or stencil type
 *   then it's gl.DEPTH_ATTACHMENT or `gl.DEPTH_STENCIL_ATTACHMENT` depending
 *   on the format or attachment type.
 * @property {number} [format] The format. If one of `gl.RGBA4`,
 *   `gl.RGB565`, `gl.RGB5_A1`, `gl.DEPTH_COMPONENT16`,
 *   `gl.STENCIL_INDEX8` or `gl.DEPTH_STENCIL` then will create a
 *   renderbuffer. Otherwise will create a texture. Default = `gl.RGBA`
 * @property {number} [type] The type. Used for texture. Default = `gl.UNSIGNED_BYTE`.
 * @property {number} [target] The texture target for `gl.framebufferTexture2D`.
 *   Defaults to `gl.TEXTURE_2D`. Set to appropriate face for cube maps.
 * @property {number} [samples] The number of samples. Default = 1
 * @property {number} [level] level for `gl.framebufferTexture2D`. Defaults to 0.
 * @property {number} [layer] layer for `gl.framebufferTextureLayer`. Defaults to undefined.
 *   If set then `gl.framebufferTextureLayer` is called, if not then `gl.framebufferTexture2D`
 * @property {(WebGLRenderbuffer | WebGLTexture)} [attachment] An existing renderbuffer or texture.
 *    If provided will attach this Object. This allows you to share
 *    attachments across framebuffers.
 * @memberOf module:twgl
 * @mixes TextureOptions
 */
export type AttachmentOptions = TextureOptions & {
    attachmentPoint?: number;
    format?: number;
    type?: number;
    target?: number;
    samples?: number;
    level?: number;
    layer?: number;
    attachment?: WebGLRenderbuffer | WebGLTexture;
};
/**
 * @typedef {Object} FramebufferInfo
 * @property {WebGLFramebuffer} framebuffer The WebGLFramebuffer for this framebufferInfo
 * @property {Array.<(WebGLRenderbuffer | WebGLTexture)>} attachments The created attachments in the same order as passed in to {@link createFramebufferInfo}.
 * @property {number} width The width of the framebuffer and its attachments
 * @property {number} height The width of the framebuffer and its attachments
 * @memberOf module:twgl
 */
export type FramebufferInfo = {
    framebuffer: WebGLFramebuffer;
    attachments: (WebGLRenderbuffer | WebGLTexture)[];
    width: number;
    height: number;
};
/**
 * Error Callback
 * @callback ErrorCallback
 * @param {string} msg error message.
 * @param {number} [lineOffset] amount to add to line number
 * @memberOf module:twgl
 */
export type ErrorCallback = (msg: string, lineOffset?: number) => void;
/**
 * @typedef {Object} FullProgramSpec
 * @property {string[]} shaders the shader source or element ids.
 * @property {function(string)} [errorCallback] callback for errors
 * @property {Object.<string,number>|string[]} [attribLocations] a attribute name to location map, or array of attribute names where index = location.
 * @property {(BufferInfo|Object.<string,AttribInfo>|string[])} [transformFeedbackVaryings] If passed
 *   a BufferInfo will use the attribs names inside. If passed an object of AttribInfos will use the names from that object. Otherwise
 *   you can pass an array of names.
 * @property {number} [transformFeedbackMode] the mode to pass `gl.transformFeedbackVaryings`. Defaults to `SEPARATE_ATTRIBS`.
 * @property {ProgramCallback} [callback] callback for async program compilation.
 * @memberOf module:twgl
 */
export type FullProgramSpec = {
    shaders: string[];
    errorCallback?: (...params: any[]) => any;
    attribLocations?: {
        [key: string]: number;
    } | string[];
    transformFeedbackVaryings?: BufferInfo | {
        [key: string]: AttribInfo;
    } | string[];
    transformFeedbackMode?: number;
    callback?: ProgramCallback;
};
/**
 * @typedef {string[]|FullProgramSpec} ProgramSpec
 * @memberOf module:twgl
 */
export type ProgramSpec = string[] | FullProgramSpec;
/**
 * @typedef {Object} ProgramOptions
 * @property {function(string)} [errorCallback] callback for errors
 * @property {Object.<string,number>|string[]} [attribLocations] a attribute name to location map, or array of attribute names where index = location.
 * @property {(BufferInfo|Object.<string,AttribInfo>|string[])} [transformFeedbackVaryings] If passed
 *   a BufferInfo will use the attribs names inside. If passed an object of AttribInfos will use the names from that object. Otherwise
 *   you can pass an array of names.
 * @property {number} [transformFeedbackMode] the mode to pass `gl.transformFeedbackVaryings`. Defaults to `SEPARATE_ATTRIBS`.
 * @property {ProgramCallback} [callback] callback for async program compilation.
 * @memberOf module:twgl
 */
export type ProgramOptions = {
    errorCallback?: (...params: any[]) => any;
    attribLocations?: {
        [key: string]: number;
    } | string[];
    transformFeedbackVaryings?: BufferInfo | {
        [key: string]: AttribInfo;
    } | string[];
    transformFeedbackMode?: number;
    callback?: ProgramCallback;
};
/**
 * @typedef {Object} TransformFeedbackInfo
 * @property {number} index index of transform feedback
 * @property {number} type GL type
 * @property {number} size 1 - 4
 * @memberOf module:twgl
 */
export type TransformFeedbackInfo = {
    index: number;
    type: number;
    size: number;
};
/**
 * Create TransformFeedbackInfo for passing to bindTransformFeedbackInfo.
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {WebGLProgram} program an existing WebGLProgram.
 * @return {Object<string, TransformFeedbackInfo>}
 * @memberOf module:twgl
 */
export function createTransformFeedbackInfo(gl: WebGLRenderingContext, program: WebGLProgram): {
    [key: string]: TransformFeedbackInfo;
};
/**
 * Binds buffers for transform feedback.
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {(ProgramInfo|Object<string, TransformFeedbackInfo>)} transformFeedbackInfo A ProgramInfo or TransformFeedbackInfo.
 * @param {(BufferInfo|Object<string, AttribInfo>)} [bufferInfo] A BufferInfo or set of AttribInfos.
 * @memberOf module:twgl
 */
export function bindTransformFeedbackInfo(gl: WebGLRenderingContext, transformFeedbackInfo: ProgramInfo | {
    [key: string]: TransformFeedbackInfo;
}, bufferInfo?: BufferInfo | {
    [key: string]: AttribInfo;
}): void;
/**
 * Creates a transform feedback and sets the buffers
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {ProgramInfo} programInfo A ProgramInfo as returned from {@link createProgramInfo}
 * @param {(BufferInfo|Object<string, AttribInfo>)} [bufferInfo] A BufferInfo or set of AttribInfos.
 * @return {WebGLTransformFeedback} the created transform feedback
 * @memberOf module:twgl
 */
export function createTransformFeedback(gl: WebGLRenderingContext, programInfo: ProgramInfo, bufferInfo?: BufferInfo | {
    [key: string]: AttribInfo;
}): WebGLTransformFeedback;
/**
 * @typedef {Object} UniformData
 * @property {string} name The name of the uniform
 * @property {number} type The WebGL type enum for this uniform
 * @property {number} size The number of elements for this uniform
 * @property {number} blockNdx The block index this uniform appears in
 * @property {number} offset The byte offset in the block for this uniform's value
 * @memberOf module:twgl
 */
export type UniformData = {
    name: string;
    type: number;
    size: number;
    blockNdx: number;
    offset: number;
};
/**
 * The specification for one UniformBlockObject
 *
 * @typedef {Object} BlockSpec
 * @property {number} index The index of the block.
 * @property {number} size The size in bytes needed for the block
 * @property {number[]} uniformIndices The indices of the uniforms used by the block. These indices
 *    correspond to entries in a UniformData array in the {@link UniformBlockSpec}.
 * @property {bool} usedByVertexShader Self explanatory
 * @property {bool} usedByFragmentShader Self explanatory
 * @property {bool} used Self explanatory
 * @memberOf module:twgl
 */
export type BlockSpec = {
    index: number;
    size: number;
    uniformIndices: number[];
    usedByVertexShader: boolean;
    usedByFragmentShader: boolean;
    used: boolean;
};
/**
 * A `UniformBlockSpec` represents the data needed to create and bind
 * UniformBlockObjects for a given program
 *
 * @typedef {Object} UniformBlockSpec
 * @property {Object.<string, BlockSpec>} blockSpecs The BlockSpec for each block by block name
 * @property {UniformData[]} uniformData An array of data for each uniform by uniform index.
 * @memberOf module:twgl
 */
export type UniformBlockSpec = {
    blockSpecs: {
        [key: string]: BlockSpec;
    };
    uniformData: UniformData[];
};
/**
 * Represents a UniformBlockObject including an ArrayBuffer with all the uniform values
 * and a corresponding WebGLBuffer to hold those values on the GPU
 *
 * @typedef {Object} UniformBlockInfo
 * @property {string} name The name of the block
 * @property {ArrayBuffer} array The array buffer that contains the uniform values
 * @property {Float32Array} asFloat A float view on the array buffer. This is useful
 *    inspecting the contents of the buffer in the debugger.
 * @property {WebGLBuffer} buffer A WebGL buffer that will hold a copy of the uniform values for rendering.
 * @property {number} [offset] offset into buffer
 * @property {Object<string, ArrayBufferView>} uniforms A uniform name to ArrayBufferView map.
 *   each Uniform has a correctly typed `ArrayBufferView` into array at the correct offset
 *   and length of that uniform. So for example a float uniform would have a 1 float `Float32Array`
 *   view. A single mat4 would have a 16 element `Float32Array` view. An ivec2 would have an
 *   `Int32Array` view, etc.
 * @property {Object<string, function>} setters A setter for this uniform.
 *   The reason to use setters is elements of arrays are padded to vec4 sizes which
 *   means if you want to set an array of 4 floats you'd need to set 16 values
 *   (or set elements 0, 4, 8, 12). In other words
 *   `someBlockInfo.uniforms.some4FloatArrayUniform.set([0, , , , 1, , , , 2, , , , 3])`
 *   where as the setter handles just passing in [0, 1, 2, 3] either directly as in
 *   `someBlockInfo.setter.some4FloatArrayUniform.set([0, 1, 2, 3])` (not recommended)
 *   or via {@link setBlockUniforms}
 * @memberOf module:twgl
 */
export type UniformBlockInfo = {
    name: string;
    array: ArrayBuffer;
    asFloat: Float32Array;
    buffer: WebGLBuffer;
    offset?: number;
    uniforms: {
        [key: string]: ArrayBufferView;
    };
    setters: {
        [key: string]: (...params: any[]) => any;
    };
};
/**
 * @typedef {Object} ProgramInfo
 * @property {WebGLProgram} program A shader program
 * @property {Object<string, function>} uniformSetters object of setters as returned from createUniformSetters,
 * @property {Object<string, function>} attribSetters object of setters as returned from createAttribSetters,
 * @property {UniformBlockSpec} [uniformBlockSpec] a uniform block spec for making UniformBlockInfos with createUniformBlockInfo etc..
 * @property {Object<string, TransformFeedbackInfo>} [transformFeedbackInfo] info for transform feedbacks
 * @memberOf module:twgl
 */
export type ProgramInfo = {
    program: WebGLProgram;
    uniformSetters: {
        [key: string]: (...params: any[]) => any;
    };
    attribSetters: {
        [key: string]: (...params: any[]) => any;
    };
    uniformBlockSpec?: UniformBlockSpec;
    transformFeedbackInfo?: {
        [key: string]: TransformFeedbackInfo;
    };
};
/**
 * A function to generate the source for a texture.
 * @callback TextureFunc
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {TextureOptions} options the texture options
 * @return {*} Returns any of the things documented for `src` for {@link TextureOptions}.
 * @memberOf module:twgl
 */
export type TextureFunc = (gl: WebGLRenderingContext, options: TextureOptions) => any;
/**
 * Texture options passed to most texture functions. Each function will use whatever options
 * are appropriate for its needs. This lets you pass the same options to all functions.
 *
 * Note: A `TexImageSource` is defined in the WebGL spec as a `HTMLImageElement`, `HTMLVideoElement`,
 * `HTMLCanvasElement`, `ImageBitmap`, or `ImageData`.
 *
 * @typedef {Object} TextureOptions
 * @property {number} [target] the type of texture `gl.TEXTURE_2D` or `gl.TEXTURE_CUBE_MAP`. Defaults to `gl.TEXTURE_2D`.
 * @property {number} [level] the mip level to affect. Defaults to 0. Note, if set auto will be considered false unless explicitly set to true.
 * @property {number} [width] the width of the texture. Only used if src is an array or typed array or null.
 * @property {number} [height] the height of a texture. Only used if src is an array or typed array or null.
 * @property {number} [depth] the depth of a texture. Only used if src is an array or type array or null and target is `TEXTURE_3D` .
 * @property {number} [min] the min filter setting (eg. `gl.LINEAR`). Defaults to `gl.NEAREST_MIPMAP_LINEAR`
 *     or if texture is not a power of 2 on both dimensions then defaults to `gl.LINEAR`.
 * @property {number} [mag] the mag filter setting (eg. `gl.LINEAR`). Defaults to `gl.LINEAR`
 * @property {number} [minMag] both the min and mag filter settings.
 * @property {number} [internalFormat] internal format for texture. Defaults to `gl.RGBA`
 * @property {number} [format] format for texture. Defaults to `gl.RGBA`.
 * @property {number} [type] type for texture. Defaults to `gl.UNSIGNED_BYTE` unless `src` is ArrayBufferView. If `src`
 *     is ArrayBufferView defaults to type that matches ArrayBufferView type.
 * @property {number} [wrap] Texture wrapping for both S and T (and R if TEXTURE_3D or WebGLSampler). Defaults to `gl.REPEAT` for 2D unless src is WebGL1 and src not npot and `gl.CLAMP_TO_EDGE` for cube
 * @property {number} [wrapS] Texture wrapping for S. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
 * @property {number} [wrapT] Texture wrapping for T. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
 * @property {number} [wrapR] Texture wrapping for R. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
 * @property {number} [minLod] TEXTURE_MIN_LOD setting
 * @property {number} [maxLod] TEXTURE_MAX_LOD setting
 * @property {number} [baseLevel] TEXTURE_BASE_LEVEL setting
 * @property {number} [maxLevel] TEXTURE_MAX_LEVEL setting
 * @property {number} [compareFunc] TEXTURE_COMPARE_FUNC setting
 * @property {number} [compareMode] TEXTURE_COMPARE_MODE setting
 * @property {number} [unpackAlignment] The `gl.UNPACK_ALIGNMENT` used when uploading an array. Defaults to 1.
 * @property {number[]|ArrayBufferView} [color] Color to initialize this texture with if loading an image asynchronously.
 *     The default use a blue 1x1 pixel texture. You can set another default by calling `twgl.setDefaults`
 *     or you can set an individual texture's initial color by setting this property. Example: `[1, .5, .5, 1]` = pink
 * @property {number} [premultiplyAlpha] Whether or not to premultiply alpha. Defaults to whatever the current setting is.
 *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
 *     the current setting for specific textures.
 * @property {number} [flipY] Whether or not to flip the texture vertically on upload. Defaults to whatever the current setting is.
 *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
 *     the current setting for specific textures.
 * @property {number} [colorspaceConversion] Whether or not to let the browser do colorspace conversion of the texture on upload. Defaults to whatever the current setting is.
 *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
 *     the current setting for specific textures.
 * @property {boolean} [auto] If `undefined` or `true`, in WebGL1, texture filtering is set automatically for non-power of 2 images and
 *    mips are generated for power of 2 images. In WebGL2 mips are generated if they can be. Note: if `level` is set above
 *    then then `auto` is assumed to be `false` unless explicity set to `true`.
 * @property {number[]} [cubeFaceOrder] The order that cube faces are pulled out of an img or set of images. The default is
 *
 *     [gl.TEXTURE_CUBE_MAP_POSITIVE_X,
 *      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
 *      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
 *      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
 *      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
 *      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
 *
 * @property {(number[]|ArrayBufferView|TexImageSource|TexImageSource[]|string|string[]|TextureFunc)} [src] source for texture
 *
 *    If `string` then it's assumed to be a URL to an image. The image will be downloaded async. A usable
 *    1x1 pixel texture will be returned immediately. The texture will be updated once the image has downloaded.
 *    If `target` is `gl.TEXTURE_CUBE_MAP` will attempt to divide image into 6 square pieces. 1x6, 6x1, 3x2, 2x3.
 *    The pieces will be uploaded in `cubeFaceOrder`
 *
 *    If `string[]` or `TexImageSource[]` and target is `gl.TEXTURE_CUBE_MAP` then it must have 6 entries, one for each face of a cube map.
 *
 *    If `string[]` or `TexImageSource[]` and target is `gl.TEXTURE_2D_ARRAY` then each entry is a slice of the a 2d array texture
 *    and will be scaled to the specified width and height OR to the size of the first image that loads.
 *
 *    If `TexImageSource` then it wil be used immediately to create the contents of the texture. Examples `HTMLImageElement`,
 *    `HTMLCanvasElement`, `HTMLVideoElement`.
 *
 *    If `number[]` or `ArrayBufferView` it's assumed to be data for a texture. If `width` or `height` is
 *    not specified it is guessed as follows. First the number of elements is computed by `src.length / numComponents`
 *    where `numComponents` is derived from `format`. If `target` is `gl.TEXTURE_CUBE_MAP` then `numElements` is divided
 *    by 6. Then
 *
 * *   If neither `width` nor `height` are specified and `sqrt(numElements)` is an integer then width and height
 *        are set to `sqrt(numElements)`. Otherwise `width = numElements` and `height = 1`.
 *
 * *   If only one of `width` or `height` is specified then the other equals `numElements / specifiedDimension`.
 *
 * If `number[]` will be converted to `type`.
 *
 * If `src` is a function it will be called with a `WebGLRenderingContext` and these options.
 * Whatever it returns is subject to these rules. So it can return a string url, an `HTMLElement`
 * an array etc...
 *
 * If `src` is undefined then an empty texture will be created of size `width` by `height`.
 *
 * @property {string} [crossOrigin] What to set the crossOrigin property of images when they are downloaded.
 *    default: undefined. Also see {@link setDefaults}.
 *
 * @memberOf module:twgl
 */
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
    compareFunc?: number;
    compareMode?: number;
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
/**
 * The src image(s) used to create a texture.
 *
 * When you call {@link createTexture} or {@link createTextures}
 * you can pass in urls for images to load into the textures. If it's a single url
 * then this will be a single HTMLImageElement. If it's an array of urls used for a cubemap
 * this will be a corresponding array of images for the cubemap.
 *
 * @typedef {HTMLImageElement|HTMLImageElement[]} TextureSrc
 * @memberOf module:twgl
 */
export type TextureSrc = HTMLImageElement | HTMLImageElement[];
/**
 * A callback for when an image finished downloading and been uploaded into a texture
 * @callback TextureReadyCallback
 * @param {*} err If truthy there was an error.
 * @param {WebGLTexture} texture the texture.
 * @param {TextureSrc} source image(s) used to as the src for the texture
 * @memberOf module:twgl
 */
export type TextureReadyCallback = (err: any, texture: WebGLTexture, source: TextureSrc) => void;
/**
 * A callback for when all images have finished downloading and been uploaded into their respective textures
 * @callback TexturesReadyCallback
 * @param {*} err If truthy there was an error.
 * @param {Object.<string, WebGLTexture>} textures the created textures by name. Same as returned by {@link createTextures}.
 * @param {Object.<string, TextureSrc>} sources the image(s) used for the texture by name.
 * @memberOf module:twgl
 */
export type TexturesReadyCallback = (err: any, textures: {
    [key: string]: WebGLTexture;
}, sources: {
    [key: string]: TextureSrc;
}) => void;
/**
 * A callback for when an image finished downloading and been uploaded into a texture
 * @callback CubemapReadyCallback
 * @param {*} err If truthy there was an error.
 * @param {WebGLTexture} tex the texture.
 * @param {HTMLImageElement[]} imgs the images for each face.
 * @memberOf module:twgl
 */
export type CubemapReadyCallback = (err: any, tex: WebGLTexture, imgs: HTMLImageElement[]) => void;
/**
 * A callback for when an image finished downloading and been uploaded into a texture
 * @callback ThreeDReadyCallback
 * @param {*} err If truthy there was an error.
 * @param {WebGLTexture} tex the texture.
 * @param {HTMLImageElement[]} imgs the images for each slice.
 * @memberOf module:twgl
 */
export type ThreeDReadyCallback = (err: any, tex: WebGLTexture, imgs: HTMLImageElement[]) => void;
/**
 * Check if context is WebGL 2.0
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @return {bool} true if it's WebGL 2.0
 * @memberOf module:twgl
 */
export function isWebGL2(gl: WebGLRenderingContext): boolean;
/**
 * Check if context is WebGL 1.0
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @return {bool} true if it's WebGL 1.0
 * @memberOf module:twgl
 */
export function isWebGL1(gl: WebGLRenderingContext): boolean;
/**
 * Gets a string for WebGL enum
 *
 * Note: Several enums are the same. Without more
 * context (which function) it's impossible to always
 * give the correct enum. As it is, for matching values
 * it gives all enums. Checking the WebGL2RenderingContext
 * that means
 *
 *      0     = ZERO | POINT | NONE | NO_ERROR
 *      1     = ONE | LINES | SYNC_FLUSH_COMMANDS_BIT
 *      32777 = BLEND_EQUATION_RGB | BLEND_EQUATION_RGB
 *      36662 = COPY_READ_BUFFER | COPY_READ_BUFFER_BINDING
 *      36663 = COPY_WRITE_BUFFER | COPY_WRITE_BUFFER_BINDING
 *      36006 = FRAMEBUFFER_BINDING | DRAW_FRAMEBUFFER_BINDING
 *
 * It's also not useful for bits really unless you pass in individual bits.
 * In other words
 *
 *     const bits = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT;
 *     twgl.glEnumToString(gl, bits);  // not going to work
 *
 * Note that some enums only exist on extensions. If you
 * want them to show up you need to pass the extension at least
 * once. For example
 *
 *     const ext = gl.getExtension('WEBGL_compressed_texture_s3tc');
 *     if (ext) {
 *        twgl.glEnumToString(ext, 0);  // just prime the function
 *
 *        ..later..
 *
 *        const internalFormat = ext.COMPRESSED_RGB_S3TC_DXT1_EXT;
 *        console.log(twgl.glEnumToString(gl, internalFormat));
 *
 * Notice I didn't have to pass the extension the second time. This means
 * you can have place that generically gets an enum for texture formats for example.
 * and as long as you primed the function with the extensions
 *
 * If you're using `twgl.addExtensionsToContext` to enable your extensions
 * then twgl will automatically get the extension's enums.
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext or any extension object
 * @param {number} value the value of the enum you want to look up.
 * @return {string} enum string or hex value
 * @memberOf module:twgl
 * @function glEnumToString
 */
export function glEnumToString(gl: WebGLRenderingContext, value: number): string;
/**
 * @typedef {Object} VertexArrayInfo
 * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
 * @property {number} [elementType] The type of indices `UNSIGNED_BYTE`, `UNSIGNED_SHORT` etc..
 * @property {WebGLVertexArrayObject} [vertexArrayObject] a vertex array object
 * @memberOf module:twgl
 */
export type VertexArrayInfo = {
    numElements: number;
    elementType?: number;
    vertexArrayObject?: WebGLVertexArrayObject;
};
/**
 * Sets the contents of a buffer attached to an attribInfo
 *
 * This is helper function to dynamically update a buffer.
 *
 * Let's say you make a bufferInfo
 *
 *     var arrays = {
 *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
 *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
 *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
 *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
 *     };
 *     var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
 *
 *  And you want to dynamically update the positions. You could do this
 *
 *     // assuming arrays.position has already been updated with new data.
 *     twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.position, arrays.position);
 *
 * @param {WebGLRenderingContext} gl
 * @param {AttribInfo} attribInfo The attribInfo who's buffer contents to set. NOTE: If you have an attribute prefix
 *   the name of the attribute will include the prefix.
 * @param {ArraySpec} array Note: it is arguably inefficient to pass in anything but a typed array because anything
 *    else will have to be converted to a typed array before it can be used by WebGL. During init time that
 *    inefficiency is usually not important but if you're updating data dynamically best to be efficient.
 * @param {number} [offset] an optional offset into the buffer. This is only an offset into the WebGL buffer
 *    not the array. To pass in an offset into the array itself use a typed array and create an `ArrayBufferView`
 *    for the portion of the array you want to use.
 *
 *        var someArray = new Float32Array(1000); // an array with 1000 floats
 *        var someSubArray = new Float32Array(someArray.buffer, offsetInBytes, sizeInUnits); // a view into someArray
 *
 *    Now you can pass `someSubArray` into setAttribInfoBufferFromArray`
 * @memberOf module:twgl/attributes
 */
export function setAttribInfoBufferFromArray(gl: WebGLRenderingContext, attribInfo: AttribInfo, array: ArraySpec, offset?: number): void;
/**
 * Creates a BufferInfo from an object of arrays.
 *
 * This can be passed to {@link setBuffersAndAttributes} and to
 * {@link module:twgl:drawBufferInfo}.
 *
 * Given an object like
 *
 *     var arrays = {
 *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
 *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
 *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
 *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
 *     };
 *
 *  Creates an BufferInfo like this
 *
 *     bufferInfo = {
 *       numElements: 4,        // or whatever the number of elements is
 *       indices: WebGLBuffer,  // this property will not exist if there are no indices
 *       attribs: {
 *         position: { buffer: WebGLBuffer, numComponents: 3, },
 *         normal:   { buffer: WebGLBuffer, numComponents: 3, },
 *         texcoord: { buffer: WebGLBuffer, numComponents: 2, },
 *       },
 *     };
 *
 *  The properties of arrays can be JavaScript arrays in which case the number of components
 *  will be guessed.
 *
 *     var arrays = {
 *        position: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0],
 *        texcoord: [0, 0, 0, 1, 1, 0, 1, 1],
 *        normal:   [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
 *        indices:  [0, 1, 2, 1, 2, 3],
 *     };
 *
 *  They can also be TypedArrays
 *
 *     var arrays = {
 *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
 *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
 *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
 *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
 *     };
 *
 *  Or AugmentedTypedArrays
 *
 *     var positions = createAugmentedTypedArray(3, 4);
 *     var texcoords = createAugmentedTypedArray(2, 4);
 *     var normals   = createAugmentedTypedArray(3, 4);
 *     var indices   = createAugmentedTypedArray(3, 2, Uint16Array);
 *
 *     positions.push([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]);
 *     texcoords.push([0, 0, 0, 1, 1, 0, 1, 1]);
 *     normals.push([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
 *     indices.push([0, 1, 2, 1, 2, 3]);
 *
 *     var arrays = {
 *        position: positions,
 *        texcoord: texcoords,
 *        normal:   normals,
 *        indices:  indices,
 *     };
 *
 * For the last example it is equivalent to
 *
 *     var bufferInfo = {
 *       attribs: {
 *         position: { numComponents: 3, buffer: gl.createBuffer(), },
 *         texcoord: { numComponents: 2, buffer: gl.createBuffer(), },
 *         normal: { numComponents: 3, buffer: gl.createBuffer(), },
 *       },
 *       indices: gl.createBuffer(),
 *       numElements: 6,
 *     };
 *
 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.position.buffer);
 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.position, gl.STATIC_DRAW);
 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.texcoord.buffer);
 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.texcoord, gl.STATIC_DRAW);
 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.normal.buffer);
 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.normal, gl.STATIC_DRAW);
 *     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices);
 *     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indices, gl.STATIC_DRAW);
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {Arrays} arrays Your data
 * @param {BufferInfo} [srcBufferInfo] An existing
 *        buffer info to start from. WebGLBuffers etc specified
 *        in the srcBufferInfo will be used in a new BufferInfo
 *        with any arrays specified overriding the ones in
 *        srcBufferInfo.
 * @return {BufferInfo} A BufferInfo
 * @memberOf module:twgl/attributes
 */
export function createBufferInfoFromArrays(gl: WebGLRenderingContext, arrays: Arrays, srcBufferInfo?: BufferInfo): BufferInfo;
/**
 * Calls `gl.drawElements` or `gl.drawArrays`, whichever is appropriate
 *
 * normally you'd call `gl.drawElements` or `gl.drawArrays` yourself
 * but calling this means if you switch from indexed data to non-indexed
 * data you don't have to remember to update your draw call.
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {(BufferInfo|VertexArrayInfo)} bufferInfo A BufferInfo as returned from {@link createBufferInfoFromArrays} or
 *   a VertexArrayInfo as returned from {@link createVertexArrayInfo}
 * @param {number} [type] eg (gl.TRIANGLES, gl.LINES, gl.POINTS, gl.TRIANGLE_STRIP, ...). Defaults to `gl.TRIANGLES`
 * @param {number} [count] An optional count. Defaults to bufferInfo.numElements
 * @param {number} [offset] An optional offset. Defaults to 0.
 * @param {number} [instanceCount] An optional instanceCount. if set then `drawArraysInstanced` or `drawElementsInstanced` will be called
 * @memberOf module:twgl/draw
 */
export function drawBufferInfo(gl: WebGLRenderingContext, bufferInfo: BufferInfo | VertexArrayInfo, type?: number, count?: number, offset?: number, instanceCount?: number): void;
/**
 * Draws a list of objects
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {DrawObject[]} objectsToDraw an array of objects to draw.
 * @memberOf module:twgl/draw
 */
export function drawObjectList(gl: WebGLRenderingContext, objectsToDraw: DrawObject[]): void;
/**
 * Creates a framebuffer and attachments.
 *
 * This returns a {@link FramebufferInfo} because it needs to return the attachments as well as the framebuffer.
 * It also leaves the framebuffer it just created as the currently bound `FRAMEBUFFER`.
 * Note: If this is WebGL2 or if you called {@link addExtensionsToContext} then it will set the drawBuffers
 * to `[COLOR_ATTACHMENT0, COLOR_ATTACHMENT1, ...]` for how ever many color attachments were created.
 *
 * The simplest usage
 *
 *     // create an RGBA/UNSIGNED_BYTE texture and DEPTH_STENCIL renderbuffer
 *     const fbi = twgl.createFramebufferInfo(gl);
 *
 * More complex usage
 *
 *     // create an RGB565 renderbuffer and a STENCIL_INDEX8 renderbuffer
 *     const attachments = [
 *       { format: RGB565, mag: NEAREST },
 *       { format: STENCIL_INDEX8 },
 *     ]
 *     const fbi = twgl.createFramebufferInfo(gl, attachments);
 *
 * Passing in a specific size
 *
 *     const width = 256;
 *     const height = 256;
 *     const fbi = twgl.createFramebufferInfo(gl, attachments, width, height);
 *
 * **Note!!** It is up to you to check if the framebuffer is renderable by calling `gl.checkFramebufferStatus`.
 * [WebGL1 only guarantees 3 combinations of attachments work](https://www.khronos.org/registry/webgl/specs/latest/1.0/#6.6).
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {AttachmentOptions[]} [attachments] which attachments to create. If not provided the default is a framebuffer with an
 *    `RGBA`, `UNSIGNED_BYTE` texture `COLOR_ATTACHMENT0` and a `DEPTH_STENCIL` renderbuffer `DEPTH_STENCIL_ATTACHMENT`.
 * @param {number} [width] the width for the attachments. Default = size of drawingBuffer
 * @param {number} [height] the height for the attachments. Default = size of drawingBuffer
 * @return {FramebufferInfo} the framebuffer and attachments.
 * @memberOf module:twgl/framebuffers
 */
export function createFramebufferInfo(gl: WebGLRenderingContext, attachments?: AttachmentOptions[], width?: number, height?: number): FramebufferInfo;
/**
 * Resizes the attachments of a framebuffer.
 *
 * You need to pass in the same `attachments` as you passed in {@link createFramebufferInfo}
 * because TWGL has no idea the format/type of each attachment.
 *
 * The simplest usage
 *
 *     // create an RGBA/UNSIGNED_BYTE texture and DEPTH_STENCIL renderbuffer
 *     const fbi = twgl.createFramebufferInfo(gl);
 *
 *     ...
 *
 *     function render() {
 *       if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
 *         // resize the attachments
 *         twgl.resizeFramebufferInfo(gl, fbi);
 *       }
 *
 * More complex usage
 *
 *     // create an RGB565 renderbuffer and a STENCIL_INDEX8 renderbuffer
 *     const attachments = [
 *       { format: RGB565, mag: NEAREST },
 *       { format: STENCIL_INDEX8 },
 *     ]
 *     const fbi = twgl.createFramebufferInfo(gl, attachments);
 *
 *     ...
 *
 *     function render() {
 *       if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
 *         // resize the attachments to match
 *         twgl.resizeFramebufferInfo(gl, fbi, attachments);
 *       }
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {FramebufferInfo} framebufferInfo a framebufferInfo as returned from {@link createFramebufferInfo}.
 * @param {AttachmentOptions[]} [attachments] the same attachments options as passed to {@link createFramebufferInfo}.
 * @param {number} [width] the width for the attachments. Default = size of drawingBuffer
 * @param {number} [height] the height for the attachments. Default = size of drawingBuffer
 * @memberOf module:twgl/framebuffers
 */
export function resizeFramebufferInfo(gl: WebGLRenderingContext, framebufferInfo: FramebufferInfo, attachments?: AttachmentOptions[], width?: number, height?: number): void;
/**
 * Binds a framebuffer
 *
 * This function pretty much solely exists because I spent hours
 * trying to figure out why something I wrote wasn't working only
 * to realize I forget to set the viewport dimensions.
 * My hope is this function will fix that.
 *
 * It is effectively the same as
 *
 *     gl.bindFramebuffer(gl.FRAMEBUFFER, someFramebufferInfo.framebuffer);
 *     gl.viewport(0, 0, someFramebufferInfo.width, someFramebufferInfo.height);
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {FramebufferInfo|null} [framebufferInfo] a framebufferInfo as returned from {@link createFramebufferInfo}.
 *   If falsy will bind the canvas.
 * @param {number} [target] The target. If not passed `gl.FRAMEBUFFER` will be used.
 * @memberOf module:twgl/framebuffers
 */
export function bindFramebufferInfo(gl: WebGLRenderingContext, framebufferInfo?: FramebufferInfo | null, target?: number): void;
/**
 * Creates a ProgramInfo from 2 sources.
 *
 * A ProgramInfo contains
 *
 *     programInfo = {
 *        program: WebGLProgram,
 *        uniformSetters: object of setters as returned from createUniformSetters,
 *        attribSetters: object of setters as returned from createAttribSetters,
 *     }
 *
 * NOTE: There are 4 signatures for this function
 *
 *     twgl.createProgramInfo(gl, [vs, fs], options);
 *     twgl.createProgramInfo(gl, [vs, fs], opt_errFunc);
 *     twgl.createProgramInfo(gl, [vs, fs], opt_attribs, opt_errFunc);
 *     twgl.createProgramInfo(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderSources Array of sources for the
 *        shaders or ids. The first is assumed to be the vertex shader,
 *        the second the fragment shader.
 * @param {ProgramOptions|string[]|ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
 * @param {number[]|ErrorCallback} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
 * @param {ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {ProgramInfo?} The created ProgramInfo or null if it failed to link or compile
 * @memberOf module:twgl/programs
 */
export function createProgramInfo(gl: WebGLRenderingContext, shaderSources: string[], opt_attribs?: ProgramOptions | string[] | ErrorCallback, opt_locations?: number[] | ErrorCallback, opt_errorCallback?: ErrorCallback): ProgramInfo;
/**
 * Creates a `UniformBlockInfo` for the specified block
 *
 * Note: **If the blockName matches no existing blocks a warning is printed to the console and a dummy
 * `UniformBlockInfo` is returned**. This is because when debugging GLSL
 * it is common to comment out large portions of a shader or for example set
 * the final output to a constant. When that happens blocks get optimized out.
 * If this function did not create dummy blocks your code would crash when debugging.
 *
 * @param {WebGL2RenderingContext} gl A WebGL2RenderingContext
 * @param {ProgramInfo} programInfo a `ProgramInfo`
 *     as returned from {@link createProgramInfo}
 * @param {string} blockName The name of the block.
 * @return {UniformBlockInfo} The created UniformBlockInfo
 * @memberOf module:twgl/programs
 */
export function createUniformBlockInfo(gl: WebGL2RenderingContext, programInfo: ProgramInfo, blockName: string): UniformBlockInfo;
/**
 * Binds a uniform block to the matching uniform block point.
 * Matches by blocks by name so blocks must have the same name not just the same
 * structure.
 *
 * If you have changed any values and you upload the values into the corresponding WebGLBuffer
 * call {@link setUniformBlock} instead.
 *
 * @param {WebGL2RenderingContext} gl A WebGL 2 rendering context.
 * @param {(ProgramInfo|UniformBlockSpec)} programInfo a `ProgramInfo`
 *     as returned from {@link createProgramInfo} or or `UniformBlockSpec` as
 *     returned from {@link createUniformBlockSpecFromProgram}.
 * @param {UniformBlockInfo} uniformBlockInfo a `UniformBlockInfo` as returned from
 *     {@link createUniformBlockInfo}.
 * @return {bool} true if buffer was bound. If the programInfo has no block with the same block name
 *     no buffer is bound.
 * @memberOf module:twgl/programs
 */
export function bindUniformBlock(gl: WebGL2RenderingContext, programInfo: ProgramInfo | UniformBlockSpec, uniformBlockInfo: UniformBlockInfo): boolean;
/**
 * Uploads the current uniform values to the corresponding WebGLBuffer
 * and binds that buffer to the program's corresponding bind point for the uniform block object.
 *
 * If you haven't changed any values and you only need to bind the uniform block object
 * call {@link bindUniformBlock} instead.
 *
 * @param {WebGL2RenderingContext} gl A WebGL 2 rendering context.
 * @param {(ProgramInfo|UniformBlockSpec)} programInfo a `ProgramInfo`
 *     as returned from {@link createProgramInfo} or or `UniformBlockSpec` as
 *     returned from {@link createUniformBlockSpecFromProgram}.
 * @param {UniformBlockInfo} uniformBlockInfo a `UniformBlockInfo` as returned from
 *     {@link createUniformBlockInfo}.
 * @memberOf module:twgl/programs
 */
export function setUniformBlock(gl: WebGL2RenderingContext, programInfo: ProgramInfo | UniformBlockSpec, uniformBlockInfo: UniformBlockInfo): void;
/**
 * Sets values of a uniform block object
 *
 * @param {UniformBlockInfo} uniformBlockInfo A UniformBlockInfo as returned by {@link createUniformBlockInfo}.
 * @param {Object.<string, ?>} values A uniform name to value map where the value is correct for the given
 *    type of uniform. So for example given a block like
 *
 *       uniform SomeBlock {
 *         float someFloat;
 *         vec2 someVec2;
 *         vec3 someVec3Array[2];
 *         int someInt;
 *       }
 *
 *  You can set the values of the uniform block with
 *
 *       twgl.setBlockUniforms(someBlockInfo, {
 *          someFloat: 12.3,
 *          someVec2: [1, 2],
 *          someVec3Array: [1, 2, 3, 4, 5, 6],
 *          someInt: 5,
 *       }
 *
 *  Arrays can be JavaScript arrays or typed arrays
 *
 *  You can also fill out structure and array values either via
 *  shortcut. Example
 *
 *     // -- in shader --
 *     struct Light {
 *       float intensity;
 *       vec4 color;
 *       float nearFar[2];
 *     };
 *     uniform Lights {
 *       Light lights[2];
 *     };
 *
 *     // in JavaScript
 *
 *     twgl.setBlockUniforms(someBlockInfo, {
 *       lights: [
 *         { intensity: 5.0, color: [1, 0, 0, 1], nearFar[0.1, 10] },
 *         { intensity: 2.0, color: [0, 0, 1, 1], nearFar[0.2, 15] },
 *       ],
 *     });
 *
 *   or the more traditional way
 *
 *     twgl.setBlockUniforms(someBlockInfo, {
 *       "lights[0].intensity": 5.0,
 *       "lights[0].color": [1, 0, 0, 1],
 *       "lights[0].nearFar": [0.1, 10],
 *       "lights[1].intensity": 2.0,
 *       "lights[1].color": [0, 0, 1, 1],
 *       "lights[1].nearFar": [0.2, 15],
 *     });
 *
 *   You can also specify partial paths
 *
 *     twgl.setBlockUniforms(someBlockInfo, {
 *       'lights[1]': { intensity: 5.0, color: [1, 0, 0, 1], nearFar[0.2, 15] },
 *     });
 *
 *   But you can not specify leaf array indices.
 *
 *     twgl.setBlockUniforms(someBlockInfo, {
 *       'lights[1].nearFar[1]': 15,     // BAD! nearFar is a leaf
 *       'lights[1].nearFar': [0.2, 15], // GOOD
 *     });
 *
 * **IMPORTANT!**, packing in a UniformBlock is unintuitive.
 *  For example the actual layout of `someVec3Array` above in memory
 *  is `1, 2, 3, unused, 4, 5, 6, unused`. twgl takes in 6 values
 *  as shown about and copies them, skipping the padding. This might
 *  be confusing if you're already familiar with Uniform blocks.
 *
 *  If you want to deal with the padding yourself you can access the array
 *  buffer views directly. eg:
 *
 *      someBlockInfo.someVec3Array.set([1, 2, 3, 0, 4, 5, 6, 0]);
 *
 *  Any name that doesn't match will be ignored
 * @memberOf module:twgl/programs
 */
export function setBlockUniforms(uniformBlockInfo: UniformBlockInfo, values: {
    [key: string]: any;
}): void;
/**
 * Set uniforms and binds related textures.
 *
 * example:
 *
 *     const programInfo = createProgramInfo(
 *         gl, ["some-vs", "some-fs"]);
 *
 *     const tex1 = gl.createTexture();
 *     const tex2 = gl.createTexture();
 *
 *     ... assume we setup the textures with data ...
 *
 *     const uniforms = {
 *       u_someSampler: tex1,
 *       u_someOtherSampler: tex2,
 *       u_someColor: [1,0,0,1],
 *       u_somePosition: [0,1,1],
 *       u_someMatrix: [
 *         1,0,0,0,
 *         0,1,0,0,
 *         0,0,1,0,
 *         0,0,0,0,
 *       ],
 *     };
 *
 *     gl.useProgram(programInfo.program);
 *
 * This will automatically bind the textures AND set the
 * uniforms.
 *
 *     twgl.setUniforms(programInfo, uniforms);
 *
 * For the example above it is equivalent to
 *
 *     let texUnit = 0;
 *     gl.activeTexture(gl.TEXTURE0 + texUnit);
 *     gl.bindTexture(gl.TEXTURE_2D, tex1);
 *     gl.uniform1i(u_someSamplerLocation, texUnit++);
 *     gl.activeTexture(gl.TEXTURE0 + texUnit);
 *     gl.bindTexture(gl.TEXTURE_2D, tex2);
 *     gl.uniform1i(u_someSamplerLocation, texUnit++);
 *     gl.uniform4fv(u_someColorLocation, [1, 0, 0, 1]);
 *     gl.uniform3fv(u_somePositionLocation, [0, 1, 1]);
 *     gl.uniformMatrix4fv(u_someMatrix, false, [
 *         1,0,0,0,
 *         0,1,0,0,
 *         0,0,1,0,
 *         0,0,0,0,
 *       ]);
 *
 * Note it is perfectly reasonable to call `setUniforms` multiple times. For example
 *
 *     const uniforms = {
 *       u_someSampler: tex1,
 *       u_someOtherSampler: tex2,
 *     };
 *
 *     const moreUniforms {
 *       u_someColor: [1,0,0,1],
 *       u_somePosition: [0,1,1],
 *       u_someMatrix: [
 *         1,0,0,0,
 *         0,1,0,0,
 *         0,0,1,0,
 *         0,0,0,0,
 *       ],
 *     };
 *
 *     twgl.setUniforms(programInfo, uniforms);
 *     twgl.setUniforms(programInfo, moreUniforms);
 *
 * You can also add WebGLSamplers to uniform samplers as in
 *
 *     const uniforms = {
 *       u_someSampler: {
 *         texture: someWebGLTexture,
 *         sampler: someWebGLSampler,
 *       },
 *     };
 *
 * In which case both the sampler and texture will be bound to the
 * same unit.
 *
 * @param {(ProgramInfo|Object.<string, function>)} setters a `ProgramInfo` as returned from `createProgramInfo` or the setters returned from
 *        `createUniformSetters`.
 * @param {Object.<string, ?>} values an object with values for the
 *        uniforms.
 *   You can pass multiple objects by putting them in an array or by calling with more arguments.For example
 *
 *     const sharedUniforms = {
 *       u_fogNear: 10,
 *       u_projection: ...
 *       ...
 *     };
 *
 *     const localUniforms = {
 *       u_world: ...
 *       u_diffuseColor: ...
 *     };
 *
 *     twgl.setUniforms(programInfo, sharedUniforms, localUniforms);
 *
 *     // is the same as
 *
 *     twgl.setUniforms(programInfo, [sharedUniforms, localUniforms]);
 *
 *     // is the same as
 *
 *     twgl.setUniforms(programInfo, sharedUniforms);
 *     twgl.setUniforms(programInfo, localUniforms};
 *
 *   You can also fill out structure and array values either via
 *   shortcut. Example
 *
 *     // -- in shader --
 *     struct Light {
 *       float intensity;
 *       vec4 color;
 *       float nearFar[2];
 *     };
 *     uniform Light lights[2];
 *
 *     // in JavaScript
 *
 *     twgl.setUniforms(programInfo, {
 *       lights: [
 *         { intensity: 5.0, color: [1, 0, 0, 1], nearFar[0.1, 10] },
 *         { intensity: 2.0, color: [0, 0, 1, 1], nearFar[0.2, 15] },
 *       ],
 *     });
 *
 *   or the more traditional way
 *
 *     twgl.setUniforms(programInfo, {
 *       "lights[0].intensity": 5.0,
 *       "lights[0].color": [1, 0, 0, 1],
 *       "lights[0].nearFar": [0.1, 10],
 *       "lights[1].intensity": 2.0,
 *       "lights[1].color": [0, 0, 1, 1],
 *       "lights[1].nearFar": [0.2, 15],
 *     });
 *
 *   You can also specify partial paths
 *
 *     twgl.setUniforms(programInfo, {
 *       'lights[1]': { intensity: 5.0, color: [1, 0, 0, 1], nearFar[0.2, 15] },
 *     });
 *
 *   But you can not specify leaf array indices
 *
 *     twgl.setUniforms(programInfo, {
 *       'lights[1].nearFar[1]': 15,     // BAD! nearFar is a leaf
 *       'lights[1].nearFar': [0.2, 15], // GOOD
 *     });
 *
 * @memberOf module:twgl/programs
 */
export function setUniforms(setters: ProgramInfo | {
    [key: string]: (...params: any[]) => any;
}, values: {
    [key: string]: any;
}): void;
/**
 * Sets attributes and buffers including the `ELEMENT_ARRAY_BUFFER` if appropriate
 *
 * Example:
 *
 *     const programInfo = createProgramInfo(
 *         gl, ["some-vs", "some-fs");
 *
 *     const arrays = {
 *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
 *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
 *     };
 *
 *     const bufferInfo = createBufferInfoFromArrays(gl, arrays);
 *
 *     gl.useProgram(programInfo.program);
 *
 * This will automatically bind the buffers AND set the
 * attributes.
 *
 *     setBuffersAndAttributes(gl, programInfo, bufferInfo);
 *
 * For the example above it is equivalent to
 *
 *     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 *     gl.enableVertexAttribArray(a_positionLocation);
 *     gl.vertexAttribPointer(a_positionLocation, 3, gl.FLOAT, false, 0, 0);
 *     gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
 *     gl.enableVertexAttribArray(a_texcoordLocation);
 *     gl.vertexAttribPointer(a_texcoordLocation, 4, gl.FLOAT, false, 0, 0);
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
 * @param {(ProgramInfo|Object.<string, function>)} setters A `ProgramInfo` as returned from {@link createProgramInfo} or Attribute setters as returned from {@link createAttributeSetters}
 * @param {(BufferInfo|VertexArrayInfo)} buffers a `BufferInfo` as returned from {@link createBufferInfoFromArrays}.
 *   or a `VertexArrayInfo` as returned from {@link createVertexArrayInfo}
 * @memberOf module:twgl/programs
 */
export function setBuffersAndAttributes(gl: WebGLRenderingContext, setters: ProgramInfo | {
    [key: string]: (...params: any[]) => any;
}, buffers: BufferInfo | VertexArrayInfo): void;
/**
 * Sets a texture from an array or typed array. If the width or height is not provided will attempt to
 * guess the size. See {@link TextureOptions}.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {(number[]|ArrayBufferView)} src An array or typed arry with texture data.
 * @param {TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @memberOf module:twgl/textures
 */
export function setTextureFromArray(gl: WebGLRenderingContext, tex: WebGLTexture, src: number[] | ArrayBufferView, options?: TextureOptions): void;
/**
 * Creates a texture based on the options passed in.
 *
 * Note: may reset UNPACK_ALIGNMENT, UNPACK_ROW_LENGTH, UNPACK_IMAGE_HEIGHT, UNPACK_SKIP_IMAGES
 * UNPACK_SKIP_PIXELS, and UNPACK_SKIP_ROWS
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 * @param {TextureReadyCallback} [callback] A callback called when an image has been downloaded and uploaded to the texture.
 * @return {WebGLTexture} the created texture.
 * @memberOf module:twgl/textures
 */
export function createTexture(gl: WebGLRenderingContext, options?: TextureOptions, callback?: TextureReadyCallback): WebGLTexture;
/**
 * Resizes a texture based on the options passed in.
 *
 * Note: This is not a generic resize anything function.
 * It's mostly used by {@link resizeFramebufferInfo}
 * It will use `options.src` if it exists to try to determine a `type`
 * otherwise it will assume `gl.UNSIGNED_BYTE`. No data is provided
 * for the texture. Texture parameters will be set accordingly
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the texture to resize
 * @param {TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @param {number} [width] the new width. If not passed in will use `options.width`
 * @param {number} [height] the new height. If not passed in will use `options.height`
 * @param {number} [depth] the new depth. If not passed in will use `options.depth`
 * @memberOf module:twgl/textures
 */
export function resizeTexture(gl: WebGLRenderingContext, tex: WebGLTexture, options: TextureOptions, width?: number, height?: number, depth?: number): void;
/**
 * Creates a bunch of textures based on the passed in options.
 *
 * Example:
 *
 *     const textures = twgl.createTextures(gl, {
 *       // a power of 2 image
 *       hftIcon: { src: "images/hft-icon-16.png", mag: gl.NEAREST },
 *       // a non-power of 2 image
 *       clover: { src: "images/clover.jpg" },
 *       // From a canvas
 *       fromCanvas: { src: ctx.canvas },
 *       // A cubemap from 6 images
 *       yokohama: {
 *         target: gl.TEXTURE_CUBE_MAP,
 *         src: [
 *           'images/yokohama/posx.jpg',
 *           'images/yokohama/negx.jpg',
 *           'images/yokohama/posy.jpg',
 *           'images/yokohama/negy.jpg',
 *           'images/yokohama/posz.jpg',
 *           'images/yokohama/negz.jpg',
 *         ],
 *       },
 *       // A cubemap from 1 image (can be 1x6, 2x3, 3x2, 6x1)
 *       goldengate: {
 *         target: gl.TEXTURE_CUBE_MAP,
 *         src: 'images/goldengate.jpg',
 *       },
 *       // A 2x2 pixel texture from a JavaScript array
 *       checker: {
 *         mag: gl.NEAREST,
 *         min: gl.LINEAR,
 *         src: [
 *           255,255,255,255,
 *           192,192,192,255,
 *           192,192,192,255,
 *           255,255,255,255,
 *         ],
 *       },
 *       // a 1x2 pixel texture from a typed array.
 *       stripe: {
 *         mag: gl.NEAREST,
 *         min: gl.LINEAR,
 *         format: gl.LUMINANCE,
 *         src: new Uint8Array([
 *           255,
 *           128,
 *           255,
 *           128,
 *           255,
 *           128,
 *           255,
 *           128,
 *         ]),
 *         width: 1,
 *       },
 *     });
 *
 * Now
 *
 * *   `textures.hftIcon` will be a 2d texture
 * *   `textures.clover` will be a 2d texture
 * *   `textures.fromCanvas` will be a 2d texture
 * *   `textures.yohohama` will be a cubemap texture
 * *   `textures.goldengate` will be a cubemap texture
 * *   `textures.checker` will be a 2d texture
 * *   `textures.stripe` will be a 2d texture
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {Object.<string,TextureOptions>} options A object of TextureOptions one per texture.
 * @param {TexturesReadyCallback} [callback] A callback called when all textures have been downloaded.
 * @return {Object.<string,WebGLTexture>} the created textures by name
 * @memberOf module:twgl/textures
 */
export function createTextures(gl: WebGLRenderingContext, options: {
    [key: string]: TextureOptions;
}, callback?: TexturesReadyCallback): {
    [key: string]: WebGLTexture;
};


/**
 * Sets the default attrib prefix
 *
 * When writing shaders I prefer to name attributes with `a_`, uniforms with `u_` and varyings with `v_`
 * as it makes it clear where they came from. But, when building geometry I prefer using un-prefixed names.
 *
 * In other words I'll create arrays of geometry like this
 *
 *     var arrays = {
 *       position: ...
 *       normal: ...
 *       texcoord: ...
 *     };
 *
 * But need those mapped to attributes and my attributes start with `a_`.
 *
 * @deprecated see {@link setDefaults}
 * @param {string} prefix prefix for attribs
 * @memberOf module:twgl/attributes
 */
export function setAttributePrefix(prefix: string): void;
/**
 * Given typed array creates a WebGLBuffer and copies the typed array
 * into it.
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {ArrayBuffer|SharedArrayBuffer|ArrayBufferView|WebGLBuffer} typedArray the typed array. Note: If a WebGLBuffer is passed in it will just be returned. No action will be taken
 * @param {number} [type] the GL bind type for the buffer. Default = `gl.ARRAY_BUFFER`.
 * @param {number} [drawType] the GL draw type for the buffer. Default = 'gl.STATIC_DRAW`.
 * @return {WebGLBuffer} the created WebGLBuffer
 * @memberOf module:twgl/attributes
 */
export function createBufferFromTypedArray(gl: WebGLRenderingContext, typedArray: ArrayBuffer | SharedArrayBuffer | ArrayBufferView | WebGLBuffer, type?: number, drawType?: number): WebGLBuffer;
/**
 * @typedef {(Int8ArrayConstructor|Uint8ArrayConstructor|Int16ArrayConstructor|Uint16ArrayConstructor|Int32ArrayConstructor|Uint32ArrayConstructor|Float32ArrayConstructor)} TypedArrayConstructor
 */
export type TypedArrayConstructor = Int8ArrayConstructor | Uint8ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor;
/**
 * Creates a set of attribute data and WebGLBuffers from set of arrays
 *
 * Given
 *
 *      var arrays = {
 *        position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
 *        texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
 *        normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
 *        color:    { numComponents: 4, data: [255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255], type: Uint8Array, },
 *        indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
 *      };
 *
 * returns something like
 *
 *      var attribs = {
 *        position: { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
 *        texcoord: { numComponents: 2, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
 *        normal:   { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
 *        color:    { numComponents: 4, type: gl.UNSIGNED_BYTE, normalize: true,  buffer: WebGLBuffer, },
 *      };
 *
 * notes:
 *
 * *   Arrays can take various forms
 *
 *     Bare JavaScript Arrays
 *
 *         var arrays = {
 *            position: [-1, 1, 0],
 *            normal: [0, 1, 0],
 *            ...
 *         }
 *
 *     Bare TypedArrays
 *
 *         var arrays = {
 *            position: new Float32Array([-1, 1, 0]),
 *            color: new Uint8Array([255, 128, 64, 255]),
 *            ...
 *         }
 *
 * *   Will guess at `numComponents` if not specified based on name.
 *
 *     If `coord` is in the name assumes `numComponents = 2`
 *
 *     If `color` is in the name assumes `numComponents = 4`
 *
 *     otherwise assumes `numComponents = 3`
 *
 * @param {WebGLRenderingContext} gl The webgl rendering context.
 * @param {Arrays} arrays The arrays
 * @param {BufferInfo} [srcBufferInfo] a BufferInfo to copy from
 *   This lets you share buffers. Any arrays you supply will override
 *   the buffers from srcBufferInfo.
 * @return {Object.<string, AttribInfo>} the attribs
 * @memberOf module:twgl/attributes
 */
export function createAttribsFromArrays(gl: WebGLRenderingContext, arrays: Arrays, srcBufferInfo?: BufferInfo): {
    [key: string]: AttribInfo;
};
/**
 * Sets the contents of a buffer attached to an attribInfo
 *
 * This is helper function to dynamically update a buffer.
 *
 * Let's say you make a bufferInfo
 *
 *     var arrays = {
 *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
 *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
 *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
 *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
 *     };
 *     var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
 *
 *  And you want to dynamically update the positions. You could do this
 *
 *     // assuming arrays.position has already been updated with new data.
 *     twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.position, arrays.position);
 *
 * @param {WebGLRenderingContext} gl
 * @param {AttribInfo} attribInfo The attribInfo who's buffer contents to set. NOTE: If you have an attribute prefix
 *   the name of the attribute will include the prefix.
 * @param {ArraySpec} array Note: it is arguably inefficient to pass in anything but a typed array because anything
 *    else will have to be converted to a typed array before it can be used by WebGL. During init time that
 *    inefficiency is usually not important but if you're updating data dynamically best to be efficient.
 * @param {number} [offset] an optional offset into the buffer. This is only an offset into the WebGL buffer
 *    not the array. To pass in an offset into the array itself use a typed array and create an `ArrayBufferView`
 *    for the portion of the array you want to use.
 *
 *        var someArray = new Float32Array(1000); // an array with 1000 floats
 *        var someSubArray = new Float32Array(someArray.buffer, offsetInBytes, sizeInUnits); // a view into someArray
 *
 *    Now you can pass `someSubArray` into setAttribInfoBufferFromArray`
 * @memberOf module:twgl/attributes
 */
export function setAttribInfoBufferFromArray(gl: WebGLRenderingContext, attribInfo: AttribInfo, array: ArraySpec, offset?: number): void;
/**
 * Creates a BufferInfo from an object of arrays.
 *
 * This can be passed to {@link setBuffersAndAttributes} and to
 * {@link module:twgl:drawBufferInfo}.
 *
 * Given an object like
 *
 *     var arrays = {
 *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
 *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
 *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
 *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
 *     };
 *
 *  Creates an BufferInfo like this
 *
 *     bufferInfo = {
 *       numElements: 4,        // or whatever the number of elements is
 *       indices: WebGLBuffer,  // this property will not exist if there are no indices
 *       attribs: {
 *         position: { buffer: WebGLBuffer, numComponents: 3, },
 *         normal:   { buffer: WebGLBuffer, numComponents: 3, },
 *         texcoord: { buffer: WebGLBuffer, numComponents: 2, },
 *       },
 *     };
 *
 *  The properties of arrays can be JavaScript arrays in which case the number of components
 *  will be guessed.
 *
 *     var arrays = {
 *        position: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0],
 *        texcoord: [0, 0, 0, 1, 1, 0, 1, 1],
 *        normal:   [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
 *        indices:  [0, 1, 2, 1, 2, 3],
 *     };
 *
 *  They can also be TypedArrays
 *
 *     var arrays = {
 *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
 *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
 *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
 *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
 *     };
 *
 *  Or AugmentedTypedArrays
 *
 *     var positions = createAugmentedTypedArray(3, 4);
 *     var texcoords = createAugmentedTypedArray(2, 4);
 *     var normals   = createAugmentedTypedArray(3, 4);
 *     var indices   = createAugmentedTypedArray(3, 2, Uint16Array);
 *
 *     positions.push([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]);
 *     texcoords.push([0, 0, 0, 1, 1, 0, 1, 1]);
 *     normals.push([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
 *     indices.push([0, 1, 2, 1, 2, 3]);
 *
 *     var arrays = {
 *        position: positions,
 *        texcoord: texcoords,
 *        normal:   normals,
 *        indices:  indices,
 *     };
 *
 * For the last example it is equivalent to
 *
 *     var bufferInfo = {
 *       attribs: {
 *         position: { numComponents: 3, buffer: gl.createBuffer(), },
 *         texcoord: { numComponents: 2, buffer: gl.createBuffer(), },
 *         normal: { numComponents: 3, buffer: gl.createBuffer(), },
 *       },
 *       indices: gl.createBuffer(),
 *       numElements: 6,
 *     };
 *
 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.position.buffer);
 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.position, gl.STATIC_DRAW);
 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.texcoord.buffer);
 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.texcoord, gl.STATIC_DRAW);
 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.normal.buffer);
 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.normal, gl.STATIC_DRAW);
 *     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices);
 *     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indices, gl.STATIC_DRAW);
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {Arrays} arrays Your data
 * @param {BufferInfo} [srcBufferInfo] An existing
 *        buffer info to start from. WebGLBuffers etc specified
 *        in the srcBufferInfo will be used in a new BufferInfo
 *        with any arrays specified overriding the ones in
 *        srcBufferInfo.
 * @return {BufferInfo} A BufferInfo
 * @memberOf module:twgl/attributes
 */
export function createBufferInfoFromArrays(gl: WebGLRenderingContext, arrays: Arrays, srcBufferInfo?: BufferInfo): BufferInfo;
/**
 * Creates a buffer from an array, typed array, or array spec
 *
 * Given something like this
 *
 *     [1, 2, 3],
 *
 * or
 *
 *     new Uint16Array([1,2,3]);
 *
 * or
 *
 *     {
 *        data: [1, 2, 3],
 *        type: Uint8Array,
 *     }
 *
 * returns a WebGLBuffer that contains the given data.
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
 * @param {ArraySpec} array an array, typed array, or array spec.
 * @param {string} arrayName name of array. Used to guess the type if type can not be derived otherwise.
 * @return {WebGLBuffer} a WebGLBuffer containing the data in array.
 * @memberOf module:twgl/attributes
 */
export function createBufferFromArray(gl: WebGLRenderingContext, array: ArraySpec, arrayName: string): WebGLBuffer;
/**
 * Creates buffers from arrays or typed arrays
 *
 * Given something like this
 *
 *     var arrays = {
 *        positions: [1, 2, 3],
 *        normals: [0, 0, 1],
 *     }
 *
 * returns something like
 *
 *     buffers = {
 *       positions: WebGLBuffer,
 *       normals: WebGLBuffer,
 *     }
 *
 * If the buffer is named 'indices' it will be made an ELEMENT_ARRAY_BUFFER.
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
 * @param {Arrays} arrays
 * @return {Object<string, WebGLBuffer>} returns an object with one WebGLBuffer per array
 * @memberOf module:twgl/attributes
 */
export function createBuffersFromArrays(gl: WebGLRenderingContext, arrays: Arrays): {
    [key: string]: WebGLBuffer;
};


/**
 * Calls `gl.drawElements` or `gl.drawArrays`, whichever is appropriate
 *
 * normally you'd call `gl.drawElements` or `gl.drawArrays` yourself
 * but calling this means if you switch from indexed data to non-indexed
 * data you don't have to remember to update your draw call.
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {(BufferInfo|VertexArrayInfo)} bufferInfo A BufferInfo as returned from {@link createBufferInfoFromArrays} or
 *   a VertexArrayInfo as returned from {@link createVertexArrayInfo}
 * @param {number} [type] eg (gl.TRIANGLES, gl.LINES, gl.POINTS, gl.TRIANGLE_STRIP, ...). Defaults to `gl.TRIANGLES`
 * @param {number} [count] An optional count. Defaults to bufferInfo.numElements
 * @param {number} [offset] An optional offset. Defaults to 0.
 * @param {number} [instanceCount] An optional instanceCount. if set then `drawArraysInstanced` or `drawElementsInstanced` will be called
 * @memberOf module:twgl/draw
 */
export function drawBufferInfo(gl: WebGLRenderingContext, bufferInfo: BufferInfo | VertexArrayInfo, type?: number, count?: number, offset?: number, instanceCount?: number): void;
/**
 * Draws a list of objects
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {DrawObject[]} objectsToDraw an array of objects to draw.
 * @memberOf module:twgl/draw
 */
export function drawObjectList(gl: WebGLRenderingContext, objectsToDraw: DrawObject[]): void;


/**
 * Creates a framebuffer and attachments.
 *
 * This returns a {@link FramebufferInfo} because it needs to return the attachments as well as the framebuffer.
 * It also leaves the framebuffer it just created as the currently bound `FRAMEBUFFER`.
 * Note: If this is WebGL2 or if you called {@link addExtensionsToContext} then it will set the drawBuffers
 * to `[COLOR_ATTACHMENT0, COLOR_ATTACHMENT1, ...]` for how ever many color attachments were created.
 *
 * The simplest usage
 *
 *     // create an RGBA/UNSIGNED_BYTE texture and DEPTH_STENCIL renderbuffer
 *     const fbi = twgl.createFramebufferInfo(gl);
 *
 * More complex usage
 *
 *     // create an RGB565 renderbuffer and a STENCIL_INDEX8 renderbuffer
 *     const attachments = [
 *       { format: RGB565, mag: NEAREST },
 *       { format: STENCIL_INDEX8 },
 *     ]
 *     const fbi = twgl.createFramebufferInfo(gl, attachments);
 *
 * Passing in a specific size
 *
 *     const width = 256;
 *     const height = 256;
 *     const fbi = twgl.createFramebufferInfo(gl, attachments, width, height);
 *
 * **Note!!** It is up to you to check if the framebuffer is renderable by calling `gl.checkFramebufferStatus`.
 * [WebGL1 only guarantees 3 combinations of attachments work](https://www.khronos.org/registry/webgl/specs/latest/1.0/#6.6).
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {AttachmentOptions[]} [attachments] which attachments to create. If not provided the default is a framebuffer with an
 *    `RGBA`, `UNSIGNED_BYTE` texture `COLOR_ATTACHMENT0` and a `DEPTH_STENCIL` renderbuffer `DEPTH_STENCIL_ATTACHMENT`.
 * @param {number} [width] the width for the attachments. Default = size of drawingBuffer
 * @param {number} [height] the height for the attachments. Default = size of drawingBuffer
 * @return {FramebufferInfo} the framebuffer and attachments.
 * @memberOf module:twgl/framebuffers
 */
export function createFramebufferInfo(gl: WebGLRenderingContext, attachments?: AttachmentOptions[], width?: number, height?: number): FramebufferInfo;
/**
 * Resizes the attachments of a framebuffer.
 *
 * You need to pass in the same `attachments` as you passed in {@link createFramebufferInfo}
 * because TWGL has no idea the format/type of each attachment.
 *
 * The simplest usage
 *
 *     // create an RGBA/UNSIGNED_BYTE texture and DEPTH_STENCIL renderbuffer
 *     const fbi = twgl.createFramebufferInfo(gl);
 *
 *     ...
 *
 *     function render() {
 *       if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
 *         // resize the attachments
 *         twgl.resizeFramebufferInfo(gl, fbi);
 *       }
 *
 * More complex usage
 *
 *     // create an RGB565 renderbuffer and a STENCIL_INDEX8 renderbuffer
 *     const attachments = [
 *       { format: RGB565, mag: NEAREST },
 *       { format: STENCIL_INDEX8 },
 *     ]
 *     const fbi = twgl.createFramebufferInfo(gl, attachments);
 *
 *     ...
 *
 *     function render() {
 *       if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
 *         // resize the attachments to match
 *         twgl.resizeFramebufferInfo(gl, fbi, attachments);
 *       }
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {FramebufferInfo} framebufferInfo a framebufferInfo as returned from {@link createFramebufferInfo}.
 * @param {AttachmentOptions[]} [attachments] the same attachments options as passed to {@link createFramebufferInfo}.
 * @param {number} [width] the width for the attachments. Default = size of drawingBuffer
 * @param {number} [height] the height for the attachments. Default = size of drawingBuffer
 * @memberOf module:twgl/framebuffers
 */
export function resizeFramebufferInfo(gl: WebGLRenderingContext, framebufferInfo: FramebufferInfo, attachments?: AttachmentOptions[], width?: number, height?: number): void;
/**
 * Binds a framebuffer
 *
 * This function pretty much solely exists because I spent hours
 * trying to figure out why something I wrote wasn't working only
 * to realize I forget to set the viewport dimensions.
 * My hope is this function will fix that.
 *
 * It is effectively the same as
 *
 *     gl.bindFramebuffer(gl.FRAMEBUFFER, someFramebufferInfo.framebuffer);
 *     gl.viewport(0, 0, someFramebufferInfo.width, someFramebufferInfo.height);
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {FramebufferInfo|null} [framebufferInfo] a framebufferInfo as returned from {@link createFramebufferInfo}.
 *   If falsy will bind the canvas.
 * @param {number} [target] The target. If not passed `gl.FRAMEBUFFER` will be used.
 * @memberOf module:twgl/framebuffers
 */
export function bindFramebufferInfo(gl: WebGLRenderingContext, framebufferInfo?: FramebufferInfo | null, target?: number): void;


/**
 * Program Callback
 * @callback ProgramCallback
 * @param {string} [err] error message, falsy if no error
 * @param {WebGLProgram|ProgramInfo} [result] the program or programInfo
 */
export type ProgramCallback = (err?: string, result?: WebGLProgram | ProgramInfo) => void;
/**
 * Creates a program, attaches (and/or compiles) shaders, binds attrib locations, links the
 * program.
 *
 * NOTE: There are 4 signatures for this function
 *
 *     twgl.createProgram(gl, [vs, fs], options);
 *     twgl.createProgram(gl, [vs, fs], opt_errFunc);
 *     twgl.createProgram(gl, [vs, fs], opt_attribs, opt_errFunc);
 *     twgl.createProgram(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {WebGLShader[]|string[]} shaders The shaders to attach, or element ids for their source, or strings that contain their source
 * @param {ProgramOptions|string[]|ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
 * @param {number[]|ErrorCallback} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
 * @param {ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {WebGLProgram?} the created program or null if error of a callback was provided.
 * @memberOf module:twgl/programs
 */
export function createProgram(gl: WebGLRenderingContext, shaders: WebGLShader[] | string[], opt_attribs?: ProgramOptions | string[] | ErrorCallback, opt_locations?: number[] | ErrorCallback, opt_errorCallback?: ErrorCallback): WebGLProgram;
/**
 * Same as createProgram but returns a promise
 *
 * NOTE: There are 4 signatures for this function
 *
 *     twgl.createProgramAsync(gl, [vs, fs], options);
 *     twgl.createProgramAsync(gl, [vs, fs], opt_errFunc);
 *     twgl.createProgramAsync(gl, [vs, fs], opt_attribs, opt_errFunc);
 *     twgl.createProgramAsync(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
 *
 * @function
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {WebGLShader[]|string[]} shaders The shaders to attach, or element ids for their source, or strings that contain their source
 * @param {ProgramOptions|string[]|ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
 * @param {number[]|ErrorCallback} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
 * @param {ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {Promise<WebGLProgram>} The created program
 * @memberOf module:twgl/programs
 */
export function createProgramAsync(gl: WebGLRenderingContext, shaders: WebGLShader[] | string[], opt_attribs?: ProgramOptions | string[] | ErrorCallback, opt_locations?: number[] | ErrorCallback, opt_errorCallback?: ErrorCallback): Promise<WebGLProgram>;
/**
 * Same as createProgramInfo but returns a promise
 * @function
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderSources Array of sources for the
 *        shaders or ids. The first is assumed to be the vertex shader,
 *        the second the fragment shader.
 * @param {ProgramOptions|string[]|ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
 * @param {number[]|ErrorCallback} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
 * @param {ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {Promise<ProgramInfo>} The created ProgramInfo
 * @memberOf module:twgl/programs
 */
export function createProgramInfoAsync(gl: WebGLRenderingContext, shaderSources: string[], opt_attribs?: ProgramOptions | string[] | ErrorCallback, opt_locations?: number[] | ErrorCallback, opt_errorCallback?: ErrorCallback): Promise<ProgramInfo>;
/**
 * Creates a program from 2 script tags.
 *
 * NOTE: There are 4 signatures for this function
 *
 *     twgl.createProgramFromScripts(gl, [vs, fs], opt_options);
 *     twgl.createProgramFromScripts(gl, [vs, fs], opt_errFunc);
 *     twgl.createProgramFromScripts(gl, [vs, fs], opt_attribs, opt_errFunc);
 *     twgl.createProgramFromScripts(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderScriptIds Array of ids of the script
 *        tags for the shaders. The first is assumed to be the
 *        vertex shader, the second the fragment shader.
 * @param {ProgramOptions|string[]|ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
 * @param {number[]|ErrorCallback} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
 * @param {ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {WebGLProgram?} the created program or null if error or a callback was provided.
 * @memberOf module:twgl/programs
 */
export function createProgramFromScripts(gl: WebGLRenderingContext, shaderScriptIds: string[], opt_attribs?: ProgramOptions | string[] | ErrorCallback, opt_locations?: number[] | ErrorCallback, opt_errorCallback?: ErrorCallback): WebGLProgram;
/**
 * Creates a program from 2 sources.
 *
 * NOTE: There are 4 signatures for this function
 *
 *     twgl.createProgramFromSource(gl, [vs, fs], opt_options);
 *     twgl.createProgramFromSource(gl, [vs, fs], opt_errFunc);
 *     twgl.createProgramFromSource(gl, [vs, fs], opt_attribs, opt_errFunc);
 *     twgl.createProgramFromSource(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderSources Array of sources for the
 *        shaders. The first is assumed to be the vertex shader,
 *        the second the fragment shader.
 * @param {ProgramOptions|string[]|ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
 * @param {number[]|ErrorCallback} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
 * @param {ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {WebGLProgram?} the created program or null if error or a callback was provided.
 * @memberOf module:twgl/programs
 */
export function createProgramFromSources(gl: WebGLRenderingContext, shaderSources: string[], opt_attribs?: ProgramOptions | string[] | ErrorCallback, opt_locations?: number[] | ErrorCallback, opt_errorCallback?: ErrorCallback): WebGLProgram;
/**
 * Creates setter functions for all uniforms of a shader
 * program.
 *
 * @see {@link setUniforms}
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {WebGLProgram} program the program to create setters for.
 * @returns {Object.<string, function>} an object with a setter by name for each uniform
 * @memberOf module:twgl/programs
 */
export function createUniformSetters(gl: WebGLRenderingContext, program: WebGLProgram): {
    [key: string]: (...params: any[]) => any;
};
/**
 * Creates a UniformBlockSpec for the given program.
 *
 * A UniformBlockSpec represents the data needed to create and bind
 * UniformBlockObjects
 *
 * @param {WebGL2RenderingContext} gl A WebGL2 Rendering Context
 * @param {WebGLProgram} program A WebGLProgram for a successfully linked program
 * @return {UniformBlockSpec} The created UniformBlockSpec
 * @memberOf module:twgl/programs
 */
export function createUniformBlockSpecFromProgram(gl: WebGL2RenderingContext, program: WebGLProgram): UniformBlockSpec;
/**
 * Creates a `UniformBlockInfo` for the specified block
 *
 * Note: **If the blockName matches no existing blocks a warning is printed to the console and a dummy
 * `UniformBlockInfo` is returned**. This is because when debugging GLSL
 * it is common to comment out large portions of a shader or for example set
 * the final output to a constant. When that happens blocks get optimized out.
 * If this function did not create dummy blocks your code would crash when debugging.
 *
 * @param {WebGL2RenderingContext} gl A WebGL2RenderingContext
 * @param {WebGLProgram} program A WebGLProgram
 * @param {UniformBlockSpec} uniformBlockSpec. A UniformBlockSpec as returned
 *     from {@link createUniformBlockSpecFromProgram}.
 * @param {string} blockName The name of the block.
 * @return {UniformBlockInfo} The created UniformBlockInfo
 * @memberOf module:twgl/programs
 */
export function createUniformBlockInfoFromProgram(gl: WebGL2RenderingContext, program: WebGLProgram, blockName: string): UniformBlockInfo;
/**
 * Creates a `UniformBlockInfo` for the specified block
 *
 * Note: **If the blockName matches no existing blocks a warning is printed to the console and a dummy
 * `UniformBlockInfo` is returned**. This is because when debugging GLSL
 * it is common to comment out large portions of a shader or for example set
 * the final output to a constant. When that happens blocks get optimized out.
 * If this function did not create dummy blocks your code would crash when debugging.
 *
 * @param {WebGL2RenderingContext} gl A WebGL2RenderingContext
 * @param {ProgramInfo} programInfo a `ProgramInfo`
 *     as returned from {@link createProgramInfo}
 * @param {string} blockName The name of the block.
 * @return {UniformBlockInfo} The created UniformBlockInfo
 * @memberOf module:twgl/programs
 */
export function createUniformBlockInfo(gl: WebGL2RenderingContext, programInfo: ProgramInfo, blockName: string): UniformBlockInfo;
/**
 * Binds a uniform block to the matching uniform block point.
 * Matches by blocks by name so blocks must have the same name not just the same
 * structure.
 *
 * If you have changed any values and you upload the values into the corresponding WebGLBuffer
 * call {@link setUniformBlock} instead.
 *
 * @param {WebGL2RenderingContext} gl A WebGL 2 rendering context.
 * @param {(ProgramInfo|UniformBlockSpec)} programInfo a `ProgramInfo`
 *     as returned from {@link createProgramInfo} or or `UniformBlockSpec` as
 *     returned from {@link createUniformBlockSpecFromProgram}.
 * @param {UniformBlockInfo} uniformBlockInfo a `UniformBlockInfo` as returned from
 *     {@link createUniformBlockInfo}.
 * @return {bool} true if buffer was bound. If the programInfo has no block with the same block name
 *     no buffer is bound.
 * @memberOf module:twgl/programs
 */
export function bindUniformBlock(gl: WebGL2RenderingContext, programInfo: ProgramInfo | UniformBlockSpec, uniformBlockInfo: UniformBlockInfo): boolean;
/**
 * Uploads the current uniform values to the corresponding WebGLBuffer
 * and binds that buffer to the program's corresponding bind point for the uniform block object.
 *
 * If you haven't changed any values and you only need to bind the uniform block object
 * call {@link bindUniformBlock} instead.
 *
 * @param {WebGL2RenderingContext} gl A WebGL 2 rendering context.
 * @param {(ProgramInfo|UniformBlockSpec)} programInfo a `ProgramInfo`
 *     as returned from {@link createProgramInfo} or or `UniformBlockSpec` as
 *     returned from {@link createUniformBlockSpecFromProgram}.
 * @param {UniformBlockInfo} uniformBlockInfo a `UniformBlockInfo` as returned from
 *     {@link createUniformBlockInfo}.
 * @memberOf module:twgl/programs
 */
export function setUniformBlock(gl: WebGL2RenderingContext, programInfo: ProgramInfo | UniformBlockSpec, uniformBlockInfo: UniformBlockInfo): void;
/**
 * Sets values of a uniform block object
 *
 * @param {UniformBlockInfo} uniformBlockInfo A UniformBlockInfo as returned by {@link createUniformBlockInfo}.
 * @param {Object.<string, ?>} values A uniform name to value map where the value is correct for the given
 *    type of uniform. So for example given a block like
 *
 *       uniform SomeBlock {
 *         float someFloat;
 *         vec2 someVec2;
 *         vec3 someVec3Array[2];
 *         int someInt;
 *       }
 *
 *  You can set the values of the uniform block with
 *
 *       twgl.setBlockUniforms(someBlockInfo, {
 *          someFloat: 12.3,
 *          someVec2: [1, 2],
 *          someVec3Array: [1, 2, 3, 4, 5, 6],
 *          someInt: 5,
 *       }
 *
 *  Arrays can be JavaScript arrays or typed arrays
 *
 *  You can also fill out structure and array values either via
 *  shortcut. Example
 *
 *     // -- in shader --
 *     struct Light {
 *       float intensity;
 *       vec4 color;
 *       float nearFar[2];
 *     };
 *     uniform Lights {
 *       Light lights[2];
 *     };
 *
 *     // in JavaScript
 *
 *     twgl.setBlockUniforms(someBlockInfo, {
 *       lights: [
 *         { intensity: 5.0, color: [1, 0, 0, 1], nearFar[0.1, 10] },
 *         { intensity: 2.0, color: [0, 0, 1, 1], nearFar[0.2, 15] },
 *       ],
 *     });
 *
 *   or the more traditional way
 *
 *     twgl.setBlockUniforms(someBlockInfo, {
 *       "lights[0].intensity": 5.0,
 *       "lights[0].color": [1, 0, 0, 1],
 *       "lights[0].nearFar": [0.1, 10],
 *       "lights[1].intensity": 2.0,
 *       "lights[1].color": [0, 0, 1, 1],
 *       "lights[1].nearFar": [0.2, 15],
 *     });
 *
 *   You can also specify partial paths
 *
 *     twgl.setBlockUniforms(someBlockInfo, {
 *       'lights[1]': { intensity: 5.0, color: [1, 0, 0, 1], nearFar[0.2, 15] },
 *     });
 *
 *   But you can not specify leaf array indices.
 *
 *     twgl.setBlockUniforms(someBlockInfo, {
 *       'lights[1].nearFar[1]': 15,     // BAD! nearFar is a leaf
 *       'lights[1].nearFar': [0.2, 15], // GOOD
 *     });
 *
 * **IMPORTANT!**, packing in a UniformBlock is unintuitive.
 *  For example the actual layout of `someVec3Array` above in memory
 *  is `1, 2, 3, unused, 4, 5, 6, unused`. twgl takes in 6 values
 *  as shown about and copies them, skipping the padding. This might
 *  be confusing if you're already familiar with Uniform blocks.
 *
 *  If you want to deal with the padding yourself you can access the array
 *  buffer views directly. eg:
 *
 *      someBlockInfo.someVec3Array.set([1, 2, 3, 0, 4, 5, 6, 0]);
 *
 *  Any name that doesn't match will be ignored
 * @memberOf module:twgl/programs
 */
export function setBlockUniforms(uniformBlockInfo: UniformBlockInfo, values: {
    [key: string]: any;
}): void;
/**
 * Set uniforms and binds related textures.
 *
 * example:
 *
 *     const programInfo = createProgramInfo(
 *         gl, ["some-vs", "some-fs"]);
 *
 *     const tex1 = gl.createTexture();
 *     const tex2 = gl.createTexture();
 *
 *     ... assume we setup the textures with data ...
 *
 *     const uniforms = {
 *       u_someSampler: tex1,
 *       u_someOtherSampler: tex2,
 *       u_someColor: [1,0,0,1],
 *       u_somePosition: [0,1,1],
 *       u_someMatrix: [
 *         1,0,0,0,
 *         0,1,0,0,
 *         0,0,1,0,
 *         0,0,0,0,
 *       ],
 *     };
 *
 *     gl.useProgram(programInfo.program);
 *
 * This will automatically bind the textures AND set the
 * uniforms.
 *
 *     twgl.setUniforms(programInfo, uniforms);
 *
 * For the example above it is equivalent to
 *
 *     let texUnit = 0;
 *     gl.activeTexture(gl.TEXTURE0 + texUnit);
 *     gl.bindTexture(gl.TEXTURE_2D, tex1);
 *     gl.uniform1i(u_someSamplerLocation, texUnit++);
 *     gl.activeTexture(gl.TEXTURE0 + texUnit);
 *     gl.bindTexture(gl.TEXTURE_2D, tex2);
 *     gl.uniform1i(u_someSamplerLocation, texUnit++);
 *     gl.uniform4fv(u_someColorLocation, [1, 0, 0, 1]);
 *     gl.uniform3fv(u_somePositionLocation, [0, 1, 1]);
 *     gl.uniformMatrix4fv(u_someMatrix, false, [
 *         1,0,0,0,
 *         0,1,0,0,
 *         0,0,1,0,
 *         0,0,0,0,
 *       ]);
 *
 * Note it is perfectly reasonable to call `setUniforms` multiple times. For example
 *
 *     const uniforms = {
 *       u_someSampler: tex1,
 *       u_someOtherSampler: tex2,
 *     };
 *
 *     const moreUniforms {
 *       u_someColor: [1,0,0,1],
 *       u_somePosition: [0,1,1],
 *       u_someMatrix: [
 *         1,0,0,0,
 *         0,1,0,0,
 *         0,0,1,0,
 *         0,0,0,0,
 *       ],
 *     };
 *
 *     twgl.setUniforms(programInfo, uniforms);
 *     twgl.setUniforms(programInfo, moreUniforms);
 *
 * You can also add WebGLSamplers to uniform samplers as in
 *
 *     const uniforms = {
 *       u_someSampler: {
 *         texture: someWebGLTexture,
 *         sampler: someWebGLSampler,
 *       },
 *     };
 *
 * In which case both the sampler and texture will be bound to the
 * same unit.
 *
 * @param {(ProgramInfo|Object.<string, function>)} setters a `ProgramInfo` as returned from `createProgramInfo` or the setters returned from
 *        `createUniformSetters`.
 * @param {Object.<string, ?>} values an object with values for the
 *        uniforms.
 *   You can pass multiple objects by putting them in an array or by calling with more arguments.For example
 *
 *     const sharedUniforms = {
 *       u_fogNear: 10,
 *       u_projection: ...
 *       ...
 *     };
 *
 *     const localUniforms = {
 *       u_world: ...
 *       u_diffuseColor: ...
 *     };
 *
 *     twgl.setUniforms(programInfo, sharedUniforms, localUniforms);
 *
 *     // is the same as
 *
 *     twgl.setUniforms(programInfo, [sharedUniforms, localUniforms]);
 *
 *     // is the same as
 *
 *     twgl.setUniforms(programInfo, sharedUniforms);
 *     twgl.setUniforms(programInfo, localUniforms};
 *
 *   You can also fill out structure and array values either via
 *   shortcut. Example
 *
 *     // -- in shader --
 *     struct Light {
 *       float intensity;
 *       vec4 color;
 *       float nearFar[2];
 *     };
 *     uniform Light lights[2];
 *
 *     // in JavaScript
 *
 *     twgl.setUniforms(programInfo, {
 *       lights: [
 *         { intensity: 5.0, color: [1, 0, 0, 1], nearFar[0.1, 10] },
 *         { intensity: 2.0, color: [0, 0, 1, 1], nearFar[0.2, 15] },
 *       ],
 *     });
 *
 *   or the more traditional way
 *
 *     twgl.setUniforms(programInfo, {
 *       "lights[0].intensity": 5.0,
 *       "lights[0].color": [1, 0, 0, 1],
 *       "lights[0].nearFar": [0.1, 10],
 *       "lights[1].intensity": 2.0,
 *       "lights[1].color": [0, 0, 1, 1],
 *       "lights[1].nearFar": [0.2, 15],
 *     });
 *
 *   You can also specify partial paths
 *
 *     twgl.setUniforms(programInfo, {
 *       'lights[1]': { intensity: 5.0, color: [1, 0, 0, 1], nearFar[0.2, 15] },
 *     });
 *
 *   But you can not specify leaf array indices
 *
 *     twgl.setUniforms(programInfo, {
 *       'lights[1].nearFar[1]': 15,     // BAD! nearFar is a leaf
 *       'lights[1].nearFar': [0.2, 15], // GOOD
 *     });
 *
 * @memberOf module:twgl/programs
 */
export function setUniforms(setters: ProgramInfo | {
    [key: string]: (...params: any[]) => any;
}, values: {
    [key: string]: any;
}): void;
/**
 * Alias for `setUniforms`
 * @function
 * @param {(ProgramInfo|Object.<string, function>)} setters a `ProgramInfo` as returned from `createProgramInfo` or the setters returned from
 *        `createUniformSetters`.
 * @param {Object.<string, ?>} values an object with values for the
 * @memberOf module:twgl/programs
 */
export function setUniformsAndBindTextures(setters: ProgramInfo | {
    [key: string]: (...params: any[]) => any;
}, values: {
    [key: string]: any;
}): void;
/**
 * Creates setter functions for all attributes of a shader
 * program. You can pass this to {@link setBuffersAndAttributes} to set all your buffers and attributes.
 *
 * @see {@link setAttributes} for example
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {WebGLProgram} program the program to create setters for.
 * @return {Object.<string, function>} an object with a setter for each attribute by name.
 * @memberOf module:twgl/programs
 */
export function createAttributeSetters(gl: WebGLRenderingContext, program: WebGLProgram): {
    [key: string]: (...params: any[]) => any;
};
/**
 * Sets attributes and buffers including the `ELEMENT_ARRAY_BUFFER` if appropriate
 *
 * Example:
 *
 *     const programInfo = createProgramInfo(
 *         gl, ["some-vs", "some-fs");
 *
 *     const arrays = {
 *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
 *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
 *     };
 *
 *     const bufferInfo = createBufferInfoFromArrays(gl, arrays);
 *
 *     gl.useProgram(programInfo.program);
 *
 * This will automatically bind the buffers AND set the
 * attributes.
 *
 *     setBuffersAndAttributes(gl, programInfo, bufferInfo);
 *
 * For the example above it is equivalent to
 *
 *     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 *     gl.enableVertexAttribArray(a_positionLocation);
 *     gl.vertexAttribPointer(a_positionLocation, 3, gl.FLOAT, false, 0, 0);
 *     gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
 *     gl.enableVertexAttribArray(a_texcoordLocation);
 *     gl.vertexAttribPointer(a_texcoordLocation, 4, gl.FLOAT, false, 0, 0);
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
 * @param {(ProgramInfo|Object.<string, function>)} setters A `ProgramInfo` as returned from {@link createProgramInfo} or Attribute setters as returned from {@link createAttributeSetters}
 * @param {(BufferInfo|VertexArrayInfo)} buffers a `BufferInfo` as returned from {@link createBufferInfoFromArrays}.
 *   or a `VertexArrayInfo` as returned from {@link createVertexArrayInfo}
 * @memberOf module:twgl/programs
 */
export function setBuffersAndAttributes(gl: WebGLRenderingContext, setters: ProgramInfo | {
    [key: string]: (...params: any[]) => any;
}, buffers: BufferInfo | VertexArrayInfo): void;
/**
 * Creates a ProgramInfo from an existing program.
 *
 * A ProgramInfo contains
 *
 *     programInfo = {
 *        program: WebGLProgram,
 *        uniformSetters: object of setters as returned from createUniformSetters,
 *        attribSetters: object of setters as returned from createAttribSetters,
 *     }
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {WebGLProgram} program an existing WebGLProgram.
 * @return {ProgramInfo} The created ProgramInfo.
 * @memberOf module:twgl/programs
 */
export function createProgramInfoFromProgram(gl: WebGLRenderingContext, program: WebGLProgram): ProgramInfo;
/**
 * Creates a ProgramInfo from 2 sources.
 *
 * A ProgramInfo contains
 *
 *     programInfo = {
 *        program: WebGLProgram,
 *        uniformSetters: object of setters as returned from createUniformSetters,
 *        attribSetters: object of setters as returned from createAttribSetters,
 *     }
 *
 * NOTE: There are 4 signatures for this function
 *
 *     twgl.createProgramInfo(gl, [vs, fs], options);
 *     twgl.createProgramInfo(gl, [vs, fs], opt_errFunc);
 *     twgl.createProgramInfo(gl, [vs, fs], opt_attribs, opt_errFunc);
 *     twgl.createProgramInfo(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderSources Array of sources for the
 *        shaders or ids. The first is assumed to be the vertex shader,
 *        the second the fragment shader.
 * @param {ProgramOptions|string[]|ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
 * @param {number[]|ErrorCallback} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
 * @param {ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {ProgramInfo?} The created ProgramInfo or null if it failed to link or compile
 * @memberOf module:twgl/programs
 */
export function createProgramInfo(gl: WebGLRenderingContext, shaderSources: string[], opt_attribs?: ProgramOptions | string[] | ErrorCallback, opt_locations?: number[] | ErrorCallback, opt_errorCallback?: ErrorCallback): ProgramInfo;
/**
 * Creates multiple programs
 *
 * Note: the reason this function exists is because the fastest way to create multiple
 * programs in WebGL is to create and compile all shaders and link all programs and only
 * afterwards check if they succeeded. In that way, giving all your shaders
 *
 * @see {@link createProgram}
 *
 * Example:
 *
 *     const programs = twgl.createPrograms(gl, {
 *       lambert: [lambertVS, lambertFS],
 *       phong: [phongVS, phoneFS],
 *       particles: {
 *         shaders: [particlesVS, particlesFS],
 *         transformFeedbackVaryings: ['position', 'velocity'],
 *       },
 *     });
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {Object.<string, ProgramSpec>} programSpecs An object of ProgramSpecs, one per program.
 * @param {ProgramOptions} [programOptions] options to apply to all programs
 * @return {Object.<string, WebGLProgram>?} the created programInfos by name
 */
export function createPrograms(gl: WebGLRenderingContext, programSpecs: {
    [key: string]: ProgramSpec;
}, programOptions?: ProgramOptions): {
    [key: string]: WebGLProgram;
};
/**
 * Creates multiple programInfos
 *
 * Note: the reason this function exists is because the fastest way to create multiple
 * programs in WebGL is to create and compile all shaders and link all programs and only
 * afterwards check if they succeeded. In that way, giving all your shaders
 *
 * @see {@link createProgramInfo}
 *
 * Examples:
 *
 *     const programInfos = twgl.createProgramInfos(gl, {
 *       lambert: [lambertVS, lambertFS],
 *       phong: [phongVS, phoneFS],
 *       particles: {
 *         shaders: [particlesVS, particlesFS],
 *         transformFeedbackVaryings: ['position', 'velocity'],
 *       },
 *     });
 *
 * or
 *
 *     const {lambert, phong, particles} = twgl.createProgramInfos(gl, {
 *       lambert: [lambertVS, lambertFS],
 *       phong: [phongVS, phoneFS],
 *       particles: {
 *         shaders: [particlesVS, particlesFS],
 *         transformFeedbackVaryings: ['position', 'velocity'],
 *       },
 *     });
 *
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {Object.<string, ProgramSpec>} programSpecs An object of ProgramSpecs, one per program.
 * @param {ProgramOptions} [programOptions] options to apply to all programs
 * @return {Object.<string, ProgramInfo>?} the created programInfos by name
 */
export function createProgramInfos(gl: WebGLRenderingContext, programSpecs: {
    [key: string]: ProgramSpec;
}, programOptions?: ProgramOptions): {
    [key: string]: ProgramInfo;
};
/**
 * Creates multiple programs asynchronously
 *
 * @see {@link createProgramAsync}
 *
 * Example:
 *
 *     const programs = await twgl.createProgramsAsync(gl, {
 *       lambert: [lambertVS, lambertFS],
 *       phong: [phongVS, phoneFS],
 *       particles: {
 *         shaders: [particlesVS, particlesFS],
 *         transformFeedbackVaryings: ['position', 'velocity'],
 *       },
 *     });
 *
 * @function
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {Object.<string, ProgramSpec>} programSpecs An object of ProgramSpecs, one per program.
 * @param {ProgramOptions} [programOptions] options to apply to all programs
 * @return {Object.<string, WebGLProgram>?} the created programInfos by name
 */
export function createProgramsAsync(gl: WebGLRenderingContext, programSpecs: {
    [key: string]: ProgramSpec;
}, programOptions?: ProgramOptions): {
    [key: string]: WebGLProgram;
};
/**
 * Creates multiple programInfos asynchronously
 *
 * @see {@link createProgramInfoAsync}
 *
 * Example:
 *
 *     const programInfos = await twgl.createProgramInfosAsync(gl, {
 *       lambert: [lambertVS, lambertFS],
 *       phong: [phongVS, phoneFS],
 *       particles: {
 *         shaders: [particlesVS, particlesFS],
 *         transformFeedbackVaryings: ['position', 'velocity'],
 *       },
 *     });
 *
 * @function
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {Object.<string, ProgramSpec>} programSpecs An object of ProgramSpecs, one per program.
 * @param {ProgramOptions} [programOptions] options to apply to all programs
 * @return {Promise<Object.<string, ProgramInfo>>} the created programInfos by name
 */
export function createProgramInfosAsync(gl: WebGLRenderingContext, programSpecs: {
    [key: string]: ProgramSpec;
}, programOptions?: ProgramOptions): Promise<{
    [key: string]: ProgramInfo;
}>;


/**
 * Gets the number of bytes per element for a given internalFormat / type
 * @param {number} internalFormat The internalFormat parameter from texImage2D etc..
 * @param {number} type The type parameter for texImage2D etc..
 * @return {number} the number of bytes per element for the given internalFormat, type combo
 * @memberOf module:twgl/textures
 */
export function getBytesPerElementForInternalFormat(internalFormat: number, type: number): number;
/**
 * Info related to a specific texture internalFormat as returned
 * from {@link getFormatAndTypeForInternalFormat}.
 *
 * @typedef {Object} TextureFormatInfo
 * @property {number} format Format to pass to texImage2D and related functions
 * @property {number} type Type to pass to texImage2D and related functions
 * @memberOf module:twgl/textures
 */
export type TextureFormatInfo = {
    format: number;
    type: number;
};
/**
 * Gets the format and type for a given internalFormat
 *
 * @param {number} internalFormat The internal format
 * @return {TextureFormatInfo} the corresponding format and type,
 * @memberOf module:twgl/textures
 */
export function getFormatAndTypeForInternalFormat(internalFormat: number): TextureFormatInfo;
/**
 * Gets whether or not we can generate mips for the given
 * internal format.
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {number} width The width parameter from texImage2D etc..
 * @param {number} height The height parameter from texImage2D etc..
 * @param {number} internalFormat The internalFormat parameter from texImage2D etc..
 * @return {boolean} true if we can generate mips
 * @memberOf module:twgl/textures
 */
export function canGenerateMipmap(gl: WebGLRenderingContext, width: number, height: number, internalFormat: number): boolean;
/**
 * Gets whether or not we can generate mips for the given format
 * @param {number} internalFormat The internalFormat parameter from texImage2D etc..
 * @return {boolean} true if we can generate mips
 * @memberOf module:twgl/textures
 */
export function canFilter(internalFormat: number): boolean;
/**
 * Gets the number of components for a given image format.
 * @param {number} format the format.
 * @return {number} the number of components for the format.
 * @memberOf module:twgl/textures
 */
export function getNumComponentsForFormat(format: number): number;
/**
 * Sets the default texture color.
 *
 * The default texture color is used when loading textures from
 * urls. Because the URL will be loaded async we'd like to be
 * able to use the texture immediately. By putting a 1x1 pixel
 * color in the texture we can start using the texture before
 * the URL has loaded.
 *
 * @param {number[]} color Array of 4 values in the range 0 to 1
 * @deprecated see {@link setDefaults}
 * @memberOf module:twgl/textures
 */
export function setDefaultTextureColor(color: number[]): void;
/**
 * Sets the texture parameters of a texture.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {TextureOptions} options A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @memberOf module:twgl/textures
 */
export function setTextureParameters(gl: WebGLRenderingContext, tex: WebGLTexture, options: TextureOptions): void;
/**
 * Sets the sampler parameters of a sampler.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLSampler} sampler the WebGLSampler to set parameters for
 * @param {TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @memberOf module:twgl/textures
 */
export function setSamplerParameters(gl: WebGLRenderingContext, sampler: WebGLSampler, options: TextureOptions): void;
/**
 * Sets filtering or generates mips for texture based on width or height
 * If width or height is not passed in uses `options.width` and//or `options.height`
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @param {number} [width] width of texture
 * @param {number} [height] height of texture
 * @param {number} [internalFormat] The internalFormat parameter from texImage2D etc..
 * @memberOf module:twgl/textures
 */
export function setTextureFilteringForSize(gl: WebGLRenderingContext, tex: WebGLTexture, options?: TextureOptions, width?: number, height?: number, internalFormat?: number): void;
/**
 * Set a texture from the contents of an element. Will also set
 * texture filtering or generate mips based on the dimensions of the element
 * unless `options.auto === false`. If `target === gl.TEXTURE_CUBE_MAP` will
 * attempt to slice image into 1x6, 2x3, 3x2, or 6x1 images, one for each face.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {HTMLElement} element a canvas, img, or video element.
 * @param {TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @memberOf module:twgl/textures
 * @kind function
 */
export function setTextureFromElement(gl: WebGLRenderingContext, tex: WebGLTexture, element: HTMLElement, options?: TextureOptions): void;
/**
 * Loads a texture from an image from a Url as specified in `options.src`
 * If `options.color !== false` will set the texture to a 1x1 pixel color so that the texture is
 * immediately useable. It will be updated with the contents of the image once the image has finished
 * downloading. Filtering options will be set as appropriate for image unless `options.auto === false`.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 * @param {TextureReadyCallback} [callback] A function to be called when the image has finished loading. err will
 *    be non null if there was an error.
 * @return {HTMLImageElement} the image being downloaded.
 * @memberOf module:twgl/textures
 */
export function loadTextureFromUrl(gl: WebGLRenderingContext, tex: WebGLTexture, options?: TextureOptions, callback?: TextureReadyCallback): HTMLImageElement;
/**
 * Sets a texture from an array or typed array. If the width or height is not provided will attempt to
 * guess the size. See {@link TextureOptions}.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {(number[]|ArrayBufferView)} src An array or typed arry with texture data.
 * @param {TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @memberOf module:twgl/textures
 */
export function setTextureFromArray(gl: WebGLRenderingContext, tex: WebGLTexture, src: number[] | ArrayBufferView, options?: TextureOptions): void;
/**
 * Sets a texture with no contents of a certain size. In other words calls `gl.texImage2D` with `null`.
 * You must set `options.width` and `options.height`.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @memberOf module:twgl/textures
 */
export function setEmptyTexture(gl: WebGLRenderingContext, tex: WebGLTexture, options: TextureOptions): void;
/**
 * Creates a texture based on the options passed in.
 *
 * Note: may reset UNPACK_ALIGNMENT, UNPACK_ROW_LENGTH, UNPACK_IMAGE_HEIGHT, UNPACK_SKIP_IMAGES
 * UNPACK_SKIP_PIXELS, and UNPACK_SKIP_ROWS
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 * @param {TextureReadyCallback} [callback] A callback called when an image has been downloaded and uploaded to the texture.
 * @return {WebGLTexture} the created texture.
 * @memberOf module:twgl/textures
 */
export function createTexture(gl: WebGLRenderingContext, options?: TextureOptions, callback?: TextureReadyCallback): WebGLTexture;
/**
 * Resizes a texture based on the options passed in.
 *
 * Note: This is not a generic resize anything function.
 * It's mostly used by {@link resizeFramebufferInfo}
 * It will use `options.src` if it exists to try to determine a `type`
 * otherwise it will assume `gl.UNSIGNED_BYTE`. No data is provided
 * for the texture. Texture parameters will be set accordingly
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the texture to resize
 * @param {TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @param {number} [width] the new width. If not passed in will use `options.width`
 * @param {number} [height] the new height. If not passed in will use `options.height`
 * @param {number} [depth] the new depth. If not passed in will use `options.depth`
 * @memberOf module:twgl/textures
 */
export function resizeTexture(gl: WebGLRenderingContext, tex: WebGLTexture, options: TextureOptions, width?: number, height?: number, depth?: number): void;
/**
 * Creates a bunch of textures based on the passed in options.
 *
 * Example:
 *
 *     const textures = twgl.createTextures(gl, {
 *       // a power of 2 image
 *       hftIcon: { src: "images/hft-icon-16.png", mag: gl.NEAREST },
 *       // a non-power of 2 image
 *       clover: { src: "images/clover.jpg" },
 *       // From a canvas
 *       fromCanvas: { src: ctx.canvas },
 *       // A cubemap from 6 images
 *       yokohama: {
 *         target: gl.TEXTURE_CUBE_MAP,
 *         src: [
 *           'images/yokohama/posx.jpg',
 *           'images/yokohama/negx.jpg',
 *           'images/yokohama/posy.jpg',
 *           'images/yokohama/negy.jpg',
 *           'images/yokohama/posz.jpg',
 *           'images/yokohama/negz.jpg',
 *         ],
 *       },
 *       // A cubemap from 1 image (can be 1x6, 2x3, 3x2, 6x1)
 *       goldengate: {
 *         target: gl.TEXTURE_CUBE_MAP,
 *         src: 'images/goldengate.jpg',
 *       },
 *       // A 2x2 pixel texture from a JavaScript array
 *       checker: {
 *         mag: gl.NEAREST,
 *         min: gl.LINEAR,
 *         src: [
 *           255,255,255,255,
 *           192,192,192,255,
 *           192,192,192,255,
 *           255,255,255,255,
 *         ],
 *       },
 *       // a 1x2 pixel texture from a typed array.
 *       stripe: {
 *         mag: gl.NEAREST,
 *         min: gl.LINEAR,
 *         format: gl.LUMINANCE,
 *         src: new Uint8Array([
 *           255,
 *           128,
 *           255,
 *           128,
 *           255,
 *           128,
 *           255,
 *           128,
 *         ]),
 *         width: 1,
 *       },
 *     });
 *
 * Now
 *
 * *   `textures.hftIcon` will be a 2d texture
 * *   `textures.clover` will be a 2d texture
 * *   `textures.fromCanvas` will be a 2d texture
 * *   `textures.yohohama` will be a cubemap texture
 * *   `textures.goldengate` will be a cubemap texture
 * *   `textures.checker` will be a 2d texture
 * *   `textures.stripe` will be a 2d texture
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {Object.<string,TextureOptions>} options A object of TextureOptions one per texture.
 * @param {TexturesReadyCallback} [callback] A callback called when all textures have been downloaded.
 * @return {Object.<string,WebGLTexture>} the created textures by name
 * @memberOf module:twgl/textures
 */
export function createTextures(gl: WebGLRenderingContext, options: {
    [key: string]: TextureOptions;
}, callback?: TexturesReadyCallback): {
    [key: string]: WebGLTexture;
};


/**
 * Get the GL type for a typedArray
 * @param {ArrayBufferView} typedArray a typedArray
 * @return {number} the GL type for array. For example pass in an `Int8Array` and `gl.BYTE` will
 *   be returned. Pass in a `Uint32Array` and `gl.UNSIGNED_INT` will be returned
 * @memberOf module:twgl/typedArray
 */
export function getGLTypeForTypedArray(typedArray: ArrayBufferView): number;
/**
 * Get the GL type for a typedArray type
 * @param {ArrayBufferView} typedArrayType a typedArray constructor
 * @return {number} the GL type for type. For example pass in `Int8Array` and `gl.BYTE` will
 *   be returned. Pass in `Uint32Array` and `gl.UNSIGNED_INT` will be returned
 * @memberOf module:twgl/typedArray
 */
export function getGLTypeForTypedArrayType(typedArrayType: ArrayBufferView): number;
/**
 * Get the typed array constructor for a given GL type
 * @param {number} type the GL type. (eg: `gl.UNSIGNED_INT`)
 * @return {function} the constructor for a the corresponding typed array. (eg. `Uint32Array`).
 * @memberOf module:twgl/typedArray
 */
export function getTypedArrayTypeForGLType(type: number): (...params: any[]) => any;


/**
 * Creates a VertexArrayInfo from a BufferInfo and one or more ProgramInfos
 *
 * This can be passed to {@link setBuffersAndAttributes} and to
 * {@link module:twgl:drawBufferInfo}.
 *
 * > **IMPORTANT:** Vertex Array Objects are **not** a direct analog for a BufferInfo. Vertex Array Objects
 *   assign buffers to specific attributes at creation time. That means they can only be used with programs
 *   who's attributes use the same attribute locations for the same purposes.
 *
 * > Bind your attribute locations by passing an array of attribute names to {@link createProgramInfo}
 *   or use WebGL 2's GLSL ES 3's `layout(location = <num>)` to make sure locations match.
 *
 * also
 *
 * > **IMPORTANT:** After calling twgl.setBuffersAndAttribute with a BufferInfo that uses a Vertex Array Object
 *   that Vertex Array Object will be bound. That means **ANY MANIPULATION OF ELEMENT_ARRAY_BUFFER or ATTRIBUTES**
 *   will affect the Vertex Array Object state.
 *
 * > Call `gl.bindVertexArray(null)` to get back manipulating the global attributes and ELEMENT_ARRAY_BUFFER.
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {ProgramInfo|ProgramInfo[]} programInfo a programInfo or array of programInfos
 * @param {BufferInfo} bufferInfo BufferInfo as returned from createBufferInfoFromArrays etc...
 *
 *    You need to make sure every attribute that will be used is bound. So for example assume shader 1
 *    uses attributes A, B, C and shader 2 uses attributes A, B, D. If you only pass in the programInfo
 *    for shader 1 then only attributes A, B, and C will have their attributes set because TWGL doesn't
 *    now attribute D's location.
 *
 *    So, you can pass in both shader 1 and shader 2's programInfo
 *
 * @return {VertexArrayInfo} The created VertexArrayInfo
 *
 * @memberOf module:twgl/vertexArrays
 */
export function createVertexArrayInfo(gl: WebGLRenderingContext, programInfo: ProgramInfo | ProgramInfo[], bufferInfo: BufferInfo): VertexArrayInfo;
/**
 * Creates a vertex array object and then sets the attributes on it
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {Object.<string, function>} setters Attribute setters as returned from createAttributeSetters
 * @param {Object.<string, AttribInfo>} attribs AttribInfos mapped by attribute name.
 * @param {WebGLBuffer} [indices] an optional ELEMENT_ARRAY_BUFFER of indices
 *
 * @return {WebGLVertexArrayObject|null} The created WebGLVertexArrayObject
 *
 * @memberOf module:twgl/vertexArrays
 */
export function createVAOAndSetAttributes(gl: WebGLRenderingContext, setters: {
    [key: string]: (...params: any[]) => any;
}, attribs: {
    [key: string]: AttribInfo;
}, indices?: WebGLBuffer): WebGLVertexArrayObject | null;
/**
 * Creates a vertex array object and then sets the attributes
 * on it
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {Object.<string, function>| ProgramInfo} programInfo as returned from createProgramInfo or Attribute setters as returned from createAttributeSetters
 * @param {BufferInfo} bufferInfo BufferInfo as returned from createBufferInfoFromArrays etc...
 * @param {WebGLBuffer} [indices] an optional ELEMENT_ARRAY_BUFFER of indices
 *
 * @return {WebGLVertexArrayObject|null} The created WebGLVertexArrayObject
 *
 * @memberOf module:twgl/vertexArrays
 */
export function createVAOFromBufferInfo(gl: WebGLRenderingContext, programInfo: {
    [key: string]: (...params: any[]) => any;
} | ProgramInfo, bufferInfo: BufferInfo, indices?: WebGLBuffer): WebGLVertexArrayObject | null;

declare module v3 {
    /**
     * A JavaScript array with 3 values or a Float32Array with 3 values.
     * When created by the library will create the default type which is `Float32Array`
     * but can be set by calling {@link v3.setDefaultType}.
     * @typedef {(number[]|Float32Array)} Vec3
     * @memberOf module:twgl/v3
     */
    export type Vec3 = number[] | Float32Array;
    /**
     * Sets the type this library creates for a Vec3
     * @param {constructor} ctor the constructor for the type. Either `Float32Array` or `Array`
     * @return {constructor} previous constructor for Vec3
     * @memberOf module:twgl/v3
     */
    export function setDefaultType(ctor: Function): Function;
    /**
     * Creates a vec3; may be called with x, y, z to set initial values.
     * @param {number} [x] Initial x value.
     * @param {number} [y] Initial y value.
     * @param {number} [z] Initial z value.
     * @return {v3.Vec3} the created vector
     * @memberOf module:twgl/v3
     */
    export function create(x?: number, y?: number, z?: number): v3.Vec3;
    /**
     * Adds two vectors; assumes a and b have the same dimension.
     * @param {v3.Vec3} a Operand vector.
     * @param {v3.Vec3} b Operand vector.
     * @param {v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {v3.Vec3} A vector tha tis the sum of a and b.
     * @memberOf module:twgl/v3
     */
    export function add(a: v3.Vec3, b: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    /**
     * Subtracts two vectors.
     * @param {v3.Vec3} a Operand vector.
     * @param {v3.Vec3} b Operand vector.
     * @param {v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {v3.Vec3} A vector that is the difference of a and b.
     * @memberOf module:twgl/v3
     */
    export function subtract(a: v3.Vec3, b: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    /**
     * Performs linear interpolation on two vectors.
     * Given vectors a and b and interpolation coefficient t, returns
     * a + t * (b - a).
     * @param {v3.Vec3} a Operand vector.
     * @param {v3.Vec3} b Operand vector.
     * @param {number} t Interpolation coefficient.
     * @param {v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {v3.Vec3} The linear interpolated result.
     * @memberOf module:twgl/v3
     */
    export function lerp(a: v3.Vec3, b: v3.Vec3, t: number, dst?: v3.Vec3): v3.Vec3;
    /**
     * Performs linear interpolation on two vectors.
     * Given vectors a and b and interpolation coefficient vector t, returns
     * a + t * (b - a).
     * @param {v3.Vec3} a Operand vector.
     * @param {v3.Vec3} b Operand vector.
     * @param {v3.Vec3} t Interpolation coefficients vector.
     * @param {v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {v3.Vec3} the linear interpolated result.
     * @memberOf module:twgl/v3
     */
    export function lerpV(a: v3.Vec3, b: v3.Vec3, t: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    /**
     * Return max values of two vectors.
     * Given vectors a and b returns
     * [max(a[0], b[0]), max(a[1], b[1]), max(a[2], b[2])].
     * @param {v3.Vec3} a Operand vector.
     * @param {v3.Vec3} b Operand vector.
     * @param {v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {v3.Vec3} The max components vector.
     * @memberOf module:twgl/v3
     */
    export function max(a: v3.Vec3, b: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    /**
     * Return min values of two vectors.
     * Given vectors a and b returns
     * [min(a[0], b[0]), min(a[1], b[1]), min(a[2], b[2])].
     * @param {v3.Vec3} a Operand vector.
     * @param {v3.Vec3} b Operand vector.
     * @param {v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {v3.Vec3} The min components vector.
     * @memberOf module:twgl/v3
     */
    export function min(a: v3.Vec3, b: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    /**
     * Multiplies a vector by a scalar.
     * @param {v3.Vec3} v The vector.
     * @param {number} k The scalar.
     * @param {v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {v3.Vec3} The scaled vector.
     * @memberOf module:twgl/v3
     */
    export function mulScalar(v: v3.Vec3, k: number, dst?: v3.Vec3): v3.Vec3;
    /**
     * Divides a vector by a scalar.
     * @param {v3.Vec3} v The vector.
     * @param {number} k The scalar.
     * @param {v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {v3.Vec3} The scaled vector.
     * @memberOf module:twgl/v3
     */
    export function divScalar(v: v3.Vec3, k: number, dst?: v3.Vec3): v3.Vec3;
    /**
     * Computes the cross product of two vectors; assumes both vectors have
     * three entries.
     * @param {v3.Vec3} a Operand vector.
     * @param {v3.Vec3} b Operand vector.
     * @param {v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {v3.Vec3} The vector of a cross b.
     * @memberOf module:twgl/v3
     */
    export function cross(a: v3.Vec3, b: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    /**
     * Computes the dot product of two vectors; assumes both vectors have
     * three entries.
     * @param {v3.Vec3} a Operand vector.
     * @param {v3.Vec3} b Operand vector.
     * @return {number} dot product
     * @memberOf module:twgl/v3
     */
    export function dot(a: v3.Vec3, b: v3.Vec3): number;
    /**
     * Computes the length of vector
     * @param {v3.Vec3} v vector.
     * @return {number} length of vector.
     * @memberOf module:twgl/v3
     */
    export function length(v: v3.Vec3): number;
    /**
     * Computes the square of the length of vector
     * @param {v3.Vec3} v vector.
     * @return {number} square of the length of vector.
     * @memberOf module:twgl/v3
     */
    export function lengthSq(v: v3.Vec3): number;
    /**
     * Computes the distance between 2 points
     * @param {v3.Vec3} a vector.
     * @param {v3.Vec3} b vector.
     * @return {number} distance between a and b
     * @memberOf module:twgl/v3
     */
    export function distance(a: v3.Vec3, b: v3.Vec3): number;
    /**
     * Computes the square of the distance between 2 points
     * @param {v3.Vec3} a vector.
     * @param {v3.Vec3} b vector.
     * @return {number} square of the distance between a and b
     * @memberOf module:twgl/v3
     */
    export function distanceSq(a: v3.Vec3, b: v3.Vec3): number;
    /**
     * Divides a vector by its Euclidean length and returns the quotient.
     * @param {v3.Vec3} a The vector.
     * @param {v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {v3.Vec3} The normalized vector.
     * @memberOf module:twgl/v3
     */
    export function normalize(a: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    /**
     * Negates a vector.
     * @param {v3.Vec3} v The vector.
     * @param {v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {v3.Vec3} -v.
     * @memberOf module:twgl/v3
     */
    export function negate(v: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    /**
     * Copies a vector.
     * @param {v3.Vec3} v The vector.
     * @param {v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {v3.Vec3} A copy of v.
     * @memberOf module:twgl/v3
     */
    export function copy(v: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    /**
     * Multiplies a vector by another vector (component-wise); assumes a and
     * b have the same length.
     * @param {v3.Vec3} a Operand vector.
     * @param {v3.Vec3} b Operand vector.
     * @param {v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {v3.Vec3} The vector of products of entries of a and
     *     b.
     * @memberOf module:twgl/v3
     */
    export function multiply(a: v3.Vec3, b: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    /**
     * Divides a vector by another vector (component-wise); assumes a and
     * b have the same length.
     * @param {v3.Vec3} a Operand vector.
     * @param {v3.Vec3} b Operand vector.
     * @param {v3.Vec3} [dst] vector to hold result. If not new one is created.
     * @return {v3.Vec3} The vector of quotients of entries of a and
     *     b.
     * @memberOf module:twgl/v3
     */
    export function divide(a: v3.Vec3, b: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
}
declare module m4 {
    /**
     * A JavaScript array with 16 values or a Float32Array with 16 values.
     * When created by the library will create the default type which is `Float32Array`
     * but can be set by calling {@link m4.setDefaultType}.
     * @typedef {(number[]|Float32Array)} Mat4
     * @memberOf module:twgl/m4
     */
    export type Mat4 = number[] | Float32Array;
    /**
     * Sets the type this library creates for a Mat4
     * @param {constructor} ctor the constructor for the type. Either `Float32Array` or `Array`
     * @return {constructor} previous constructor for Mat4
     * @memberOf module:twgl/m4
     */
    export function setDefaultType(ctor: Function): Function;
    /**
     * Negates a matrix.
     * @param {m4.Mat4} m The matrix.
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} -m.
     * @memberOf module:twgl/m4
     */
    export function negate(m: m4.Mat4, dst?: m4.Mat4): m4.Mat4;
    /**
     * Creates a matrix.
     * @return {m4.Mat4} A new matrix.
     * @memberOf module:twgl/m4
     */
    export function create(): m4.Mat4;
    /**
     * Copies a matrix.
     * @param {m4.Mat4} m The matrix.
     * @param {m4.Mat4} [dst] The matrix. If not passed a new one is created.
     * @return {m4.Mat4} A copy of m.
     * @memberOf module:twgl/m4
     */
    export function copy(m: m4.Mat4, dst?: m4.Mat4): m4.Mat4;
    /**
     * Creates an n-by-n identity matrix.
     *
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} An n-by-n identity matrix.
     * @memberOf module:twgl/m4
     */
    export function identity(dst?: m4.Mat4): m4.Mat4;
    /**
     * Takes the transpose of a matrix.
     * @param {m4.Mat4} m The matrix.
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The transpose of m.
     * @memberOf module:twgl/m4
     */
    export function transpose(m: m4.Mat4, dst?: m4.Mat4): m4.Mat4;
    /**
     * Computes the inverse of a 4-by-4 matrix.
     * @param {m4.Mat4} m The matrix.
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The inverse of m.
     * @memberOf module:twgl/m4
     */
    export function inverse(m: m4.Mat4, dst?: m4.Mat4): m4.Mat4;
    /**
     * Multiplies two 4-by-4 matrices with a on the left and b on the right
     * @param {m4.Mat4} a The matrix on the left.
     * @param {m4.Mat4} b The matrix on the right.
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The matrix product of a and b.
     * @memberOf module:twgl/m4
     */
    export function multiply(a: m4.Mat4, b: m4.Mat4, dst?: m4.Mat4): m4.Mat4;
    /**
     * Sets the translation component of a 4-by-4 matrix to the given
     * vector.
     * @param {m4.Mat4} a The matrix.
     * @param {v3.Vec3} v The vector.
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The matrix with translation set.
     * @memberOf module:twgl/m4
     */
    export function setTranslation(a: m4.Mat4, v: v3.Vec3, dst?: m4.Mat4): m4.Mat4;
    /**
     * Returns the translation component of a 4-by-4 matrix as a vector with 3
     * entries.
     * @param {m4.Mat4} m The matrix.
     * @param {v3.Vec3} [dst] vector to hold result. If not passed a new one is created.
     * @return {v3.Vec3} The translation component of m.
     * @memberOf module:twgl/m4
     */
    export function getTranslation(m: m4.Mat4, dst?: v3.Vec3): v3.Vec3;
    /**
     * Returns an axis of a 4x4 matrix as a vector with 3 entries
     * @param {m4.Mat4} m The matrix.
     * @param {number} axis The axis 0 = x, 1 = y, 2 = z;
     * @return {v3.Vec3} [dst] vector.
     * @return {v3.Vec3} The axis component of m.
     * @memberOf module:twgl/m4
     */
    export function getAxis(m: m4.Mat4, axis: number): void;
    /**
     * Sets an axis of a 4x4 matrix as a vector with 3 entries
     * @param {m4.Mat4} m The matrix.
     * @param {v3.Vec3} v the axis vector
     * @param {number} axis The axis  0 = x, 1 = y, 2 = z;
     * @param {m4.Mat4} [dst] The matrix to set. If not passed a new one is created.
     * @return {m4.Mat4} The matrix with axis set.
     * @memberOf module:twgl/m4
     */
    export function setAxis(m: m4.Mat4, v: v3.Vec3, axis: number, dst?: m4.Mat4): m4.Mat4;
    /**
     * Computes a 4-by-4 perspective transformation matrix given the angular height
     * of the frustum, the aspect ratio, and the near and far clipping planes.  The
     * arguments define a frustum extending in the negative z direction.  The given
     * angle is the vertical angle of the frustum, and the horizontal angle is
     * determined to produce the given aspect ratio.  The arguments near and far are
     * the distances to the near and far clipping planes.  Note that near and far
     * are not z coordinates, but rather they are distances along the negative
     * z-axis.  The matrix generated sends the viewing frustum to the unit box.
     * We assume a unit box extending from -1 to 1 in the x and y dimensions and
     * from 0 to 1 in the z dimension.
     * @param {number} fieldOfViewYInRadians The camera angle from top to bottom (in radians).
     * @param {number} aspect The aspect ratio width / height.
     * @param {number} zNear The depth (negative z coordinate)
     *     of the near clipping plane.
     * @param {number} zFar The depth (negative z coordinate)
     *     of the far clipping plane.
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The perspective matrix.
     * @memberOf module:twgl/m4
     */
    export function perspective(fieldOfViewYInRadians: number, aspect: number, zNear: number, zFar: number, dst?: m4.Mat4): m4.Mat4;
    /**
     * Computes a 4-by-4 orthogonal transformation matrix given the left, right,
     * bottom, and top dimensions of the near clipping plane as well as the
     * near and far clipping plane distances.
     * @param {number} left Left side of the near clipping plane viewport.
     * @param {number} right Right side of the near clipping plane viewport.
     * @param {number} bottom Bottom of the near clipping plane viewport.
     * @param {number} top Top of the near clipping plane viewport.
     * @param {number} near The depth (negative z coordinate)
     *     of the near clipping plane.
     * @param {number} far The depth (negative z coordinate)
     *     of the far clipping plane.
     * @param {m4.Mat4} [dst] Output matrix. If not passed a new one is created.
     * @return {m4.Mat4} The perspective matrix.
     * @memberOf module:twgl/m4
     */
    export function ortho(left: number, right: number, bottom: number, top: number, near: number, far: number, dst?: m4.Mat4): m4.Mat4;
    /**
     * Computes a 4-by-4 perspective transformation matrix given the left, right,
     * top, bottom, near and far clipping planes. The arguments define a frustum
     * extending in the negative z direction. The arguments near and far are the
     * distances to the near and far clipping planes. Note that near and far are not
     * z coordinates, but rather they are distances along the negative z-axis. The
     * matrix generated sends the viewing frustum to the unit box. We assume a unit
     * box extending from -1 to 1 in the x and y dimensions and from 0 to 1 in the z
     * dimension.
     * @param {number} left The x coordinate of the left plane of the box.
     * @param {number} right The x coordinate of the right plane of the box.
     * @param {number} bottom The y coordinate of the bottom plane of the box.
     * @param {number} top The y coordinate of the right plane of the box.
     * @param {number} near The negative z coordinate of the near plane of the box.
     * @param {number} far The negative z coordinate of the far plane of the box.
     * @param {m4.Mat4} [dst] Output matrix. If not passed a new one is created.
     * @return {m4.Mat4} The perspective projection matrix.
     * @memberOf module:twgl/m4
     */
    export function frustum(left: number, right: number, bottom: number, top: number, near: number, far: number, dst?: m4.Mat4): m4.Mat4;
    /**
     * Computes a 4-by-4 look-at transformation.
     *
     * This is a matrix which positions the camera itself. If you want
     * a view matrix (a matrix which moves things in front of the camera)
     * take the inverse of this.
     *
     * @param {v3.Vec3} eye The position of the eye.
     * @param {v3.Vec3} target The position meant to be viewed.
     * @param {v3.Vec3} up A vector pointing up.
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The look-at matrix.
     * @memberOf module:twgl/m4
     */
    export function lookAt(eye: v3.Vec3, target: v3.Vec3, up: v3.Vec3, dst?: m4.Mat4): m4.Mat4;
    /**
     * Creates a 4-by-4 matrix which translates by the given vector v.
     * @param {v3.Vec3} v The vector by
     *     which to translate.
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The translation matrix.
     * @memberOf module:twgl/m4
     */
    export function translation(v: v3.Vec3, dst?: m4.Mat4): m4.Mat4;
    /**
     * Translates the given 4-by-4 matrix by the given vector v.
     * @param {m4.Mat4} m The matrix.
     * @param {v3.Vec3} v The vector by
     *     which to translate.
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The translated matrix.
     * @memberOf module:twgl/m4
     */
    export function translate(m: m4.Mat4, v: v3.Vec3, dst?: m4.Mat4): m4.Mat4;
    /**
     * Creates a 4-by-4 matrix which rotates around the x-axis by the given angle.
     * @param {number} angleInRadians The angle by which to rotate (in radians).
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The rotation matrix.
     * @memberOf module:twgl/m4
     */
    export function rotationX(angleInRadians: number, dst?: m4.Mat4): m4.Mat4;
    /**
     * Rotates the given 4-by-4 matrix around the x-axis by the given
     * angle.
     * @param {m4.Mat4} m The matrix.
     * @param {number} angleInRadians The angle by which to rotate (in radians).
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The rotated matrix.
     * @memberOf module:twgl/m4
     */
    export function rotateX(m: m4.Mat4, angleInRadians: number, dst?: m4.Mat4): m4.Mat4;
    /**
     * Creates a 4-by-4 matrix which rotates around the y-axis by the given angle.
     * @param {number} angleInRadians The angle by which to rotate (in radians).
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The rotation matrix.
     * @memberOf module:twgl/m4
     */
    export function rotationY(angleInRadians: number, dst?: m4.Mat4): m4.Mat4;
    /**
     * Rotates the given 4-by-4 matrix around the y-axis by the given
     * angle.
     * @param {m4.Mat4} m The matrix.
     * @param {number} angleInRadians The angle by which to rotate (in radians).
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The rotated matrix.
     * @memberOf module:twgl/m4
     */
    export function rotateY(m: m4.Mat4, angleInRadians: number, dst?: m4.Mat4): m4.Mat4;
    /**
     * Creates a 4-by-4 matrix which rotates around the z-axis by the given angle.
     * @param {number} angleInRadians The angle by which to rotate (in radians).
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The rotation matrix.
     * @memberOf module:twgl/m4
     */
    export function rotationZ(angleInRadians: number, dst?: m4.Mat4): m4.Mat4;
    /**
     * Rotates the given 4-by-4 matrix around the z-axis by the given
     * angle.
     * @param {m4.Mat4} m The matrix.
     * @param {number} angleInRadians The angle by which to rotate (in radians).
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The rotated matrix.
     * @memberOf module:twgl/m4
     */
    export function rotateZ(m: m4.Mat4, angleInRadians: number, dst?: m4.Mat4): m4.Mat4;
    /**
     * Creates a 4-by-4 matrix which rotates around the given axis by the given
     * angle.
     * @param {v3.Vec3} axis The axis
     *     about which to rotate.
     * @param {number} angleInRadians The angle by which to rotate (in radians).
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} A matrix which rotates angle radians
     *     around the axis.
     * @memberOf module:twgl/m4
     */
    export function axisRotation(axis: v3.Vec3, angleInRadians: number, dst?: m4.Mat4): m4.Mat4;
    /**
     * Rotates the given 4-by-4 matrix around the given axis by the
     * given angle.
     * @param {m4.Mat4} m The matrix.
     * @param {v3.Vec3} axis The axis
     *     about which to rotate.
     * @param {number} angleInRadians The angle by which to rotate (in radians).
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The rotated matrix.
     * @memberOf module:twgl/m4
     */
    export function axisRotate(m: m4.Mat4, axis: v3.Vec3, angleInRadians: number, dst?: m4.Mat4): m4.Mat4;
    /**
     * Creates a 4-by-4 matrix which scales in each dimension by an amount given by
     * the corresponding entry in the given vector; assumes the vector has three
     * entries.
     * @param {v3.Vec3} v A vector of
     *     three entries specifying the factor by which to scale in each dimension.
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The scaling matrix.
     * @memberOf module:twgl/m4
     */
    export function scaling(v: v3.Vec3, dst?: m4.Mat4): m4.Mat4;
    /**
     * Scales the given 4-by-4 matrix in each dimension by an amount
     * given by the corresponding entry in the given vector; assumes the vector has
     * three entries.
     * @param {m4.Mat4} m The matrix to be modified.
     * @param {v3.Vec3} v A vector of three entries specifying the
     *     factor by which to scale in each dimension.
     * @param {m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
     * @return {m4.Mat4} The scaled matrix.
     * @memberOf module:twgl/m4
     */
    export function scale(m: m4.Mat4, v: v3.Vec3, dst?: m4.Mat4): m4.Mat4;
    /**
     * Takes a 4-by-4 matrix and a vector with 3 entries,
     * interprets the vector as a point, transforms that point by the matrix, and
     * returns the result as a vector with 3 entries.
     * @param {m4.Mat4} m The matrix.
     * @param {v3.Vec3} v The point.
     * @param {v3.Vec3} [dst] optional vec3 to store result. If not passed a new one is created.
     * @return {v3.Vec3} The transformed point.
     * @memberOf module:twgl/m4
     */
    export function transformPoint(m: m4.Mat4, v: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    /**
     * Takes a 4-by-4 matrix and a vector with 3 entries, interprets the vector as a
     * direction, transforms that direction by the matrix, and returns the result;
     * assumes the transformation of 3-dimensional space represented by the matrix
     * is parallel-preserving, i.e. any combination of rotation, scaling and
     * translation, but not a perspective distortion. Returns a vector with 3
     * entries.
     * @param {m4.Mat4} m The matrix.
     * @param {v3.Vec3} v The direction.
     * @param {v3.Vec3} [dst] optional Vec3 to store result. If not passed a new one is created.
     * @return {v3.Vec3} The transformed direction.
     * @memberOf module:twgl/m4
     */
    export function transformDirection(m: m4.Mat4, v: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
    /**
     * Takes a 4-by-4 matrix m and a vector v with 3 entries, interprets the vector
     * as a normal to a surface, and computes a vector which is normal upon
     * transforming that surface by the matrix. The effect of this function is the
     * same as transforming v (as a direction) by the inverse-transpose of m.  This
     * function assumes the transformation of 3-dimensional space represented by the
     * matrix is parallel-preserving, i.e. any combination of rotation, scaling and
     * translation, but not a perspective distortion.  Returns a vector with 3
     * entries.
     * @param {m4.Mat4} m The matrix.
     * @param {v3.Vec3} v The normal.
     * @param {v3.Vec3} [dst] The direction. If not passed a new one is created.
     * @return {v3.Vec3} The transformed normal.
     * @memberOf module:twgl/m4
     */
    export function transformNormal(m: m4.Mat4, v: v3.Vec3, dst?: v3.Vec3): v3.Vec3;
}
declare module primitives {
    /**
     * @typedef {(Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array)} TypedArray
     */
    
    export type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array;

    export type AugmentedTypedArrayHelper = {
        numComponents: number;
        readonly numElements: number;
        /**
         * Push elements into typed array
         */
        push(...elements: (number |  TypedArray | number[])[]): void;
        /**
         * Reset push cursor
         */
        reset(index?: number): void;
    };

    export type AugmentedTypedArray<T extends TypedArray> = T & AugmentedTypedArrayHelper

    
    /**
     * creates a typed array with a `push` function attached
     * so that you can easily *push* values.
     *
     * `push` can take multiple arguments. If an argument is an array each element
     * of the array will be added to the typed array.
     *
     * Example:
     *
     *     const array = createAugmentedTypedArray(3, 2);  // creates a Float32Array with 6 values
     *     array.push(1, 2, 3);
     *     array.push([4, 5, 6]);
     *     // array now contains [1, 2, 3, 4, 5, 6]
     *
     * Also has `numComponents` and `numElements` properties.
     *
     * @param {number} numComponents number of components
     * @param {number} numElements number of elements. The total size of the array will be `numComponents * numElements`.
     * @param {constructor} opt_type A constructor for the type. Default = `Float32Array`.
     * @return {ArrayBufferView} A typed array.
     * @memberOf module:twgl/primitives
     */
        export function createAugmentedTypedArray<T extends TypedArrayConstructor>(numComponents: number, numElements: number, type: T): AugmentedTypedArray<InstanceType<T>>;
    export function createAugmentedTypedArray<T extends Float32Array>(numComponents: number, numElements: number): AugmentedTypedArray<Float32Array>;
    
    /**
     * Given indexed vertices creates a new set of vertices un-indexed by expanding the indexed vertices.
     * @param {Object.<string, TypedArray>} vertices The indexed vertices to deindex
     * @return {Object.<string, TypedArray>} The deindexed vertices
     * @memberOf module:twgl/primitives
     */
    export function deindexVertices(vertices: {
        [key: string]: TypedArray;
    }): {
        [key: string]: TypedArray;
    };
    /**
     * flattens the normals of deindexed vertices in place.
     * @param {Object.<string, TypedArray>} vertices The deindexed vertices who's normals to flatten
     * @return {Object.<string, TypedArray>} The flattened vertices (same as was passed in)
     * @memberOf module:twgl/primitives
     */
    export function flattenNormals(vertices: {
        [key: string]: TypedArray;
    }): {
        [key: string]: TypedArray;
    };
    /**
     * Reorients directions by the given matrix..
     * @param {(number[]|TypedArray)} array The array. Assumes value floats per element.
     * @param {m4.Mat4} matrix A matrix to multiply by.
     * @return {(number[]|TypedArray)} the same array that was passed in
     * @memberOf module:twgl/primitives
     */
    export function reorientDirections(array: number[] | TypedArray, matrix: m4.Mat4): number[] | TypedArray;
    /**
     * Reorients normals by the inverse-transpose of the given
     * matrix..
     * @param {(number[]|TypedArray)} array The array. Assumes value floats per element.
     * @param {m4.Mat4} matrix A matrix to multiply by.
     * @return {(number[]|TypedArray)} the same array that was passed in
     * @memberOf module:twgl/primitives
     */
    export function reorientNormals(array: number[] | TypedArray, matrix: m4.Mat4): number[] | TypedArray;
    /**
     * Reorients positions by the given matrix. In other words, it
     * multiplies each vertex by the given matrix.
     * @param {(number[]|TypedArray)} array The array. Assumes value floats per element.
     * @param {m4.Mat4} matrix A matrix to multiply by.
     * @return {(number[]|TypedArray)} the same array that was passed in
     * @memberOf module:twgl/primitives
     */
    export function reorientPositions(array: number[] | TypedArray, matrix: m4.Mat4): number[] | TypedArray;
    /**
     * @typedef {(number[]|TypedArray)} NativeArrayOrTypedArray
     */
    export type NativeArrayOrTypedArray = number[] | TypedArray;
    /**
     * Reorients arrays by the given matrix. Assumes arrays have
     * names that contains 'pos' could be reoriented as positions,
     * 'binorm' or 'tan' as directions, and 'norm' as normals.
     *
     * @param {Object.<string, NativeArrayOrTypedArray>} arrays The vertices to reorient
     * @param {m4.Mat4} matrix matrix to reorient by.
     * @return {Object.<string, NativeArrayOrTypedArray>} same arrays that were passed in.
     * @memberOf module:twgl/primitives
     */
    export function reorientVertices(arrays: {
        [key: string]: NativeArrayOrTypedArray;
    }, matrix: m4.Mat4): {
        [key: string]: NativeArrayOrTypedArray;
    };
    /**
     * Creates XY quad BufferInfo
     *
     * The default with no parameters will return a 2x2 quad with values from -1 to +1.
     * If you want a unit quad with that goes from 0 to 1 you'd call it with
     *
     *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0.5, 0.5);
     *
     * If you want a unit quad centered above 0,0 you'd call it with
     *
     *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0, 0.5);
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
     * @param {number} [xOffset] the amount to offset the quad in X
     * @param {number} [yOffset] the amount to offset the quad in Y
     * @return {Object.<string, WebGLBuffer>} the created XY Quad BufferInfo
     * @memberOf module:twgl/primitives
     * @function createXYQuadBuffers
     */
    export function createXYQuadBuffers(gl: WebGLRenderingContext, size?: number, xOffset?: number, yOffset?: number): {
        [key: string]: WebGLBuffer;
    };
    /**
     * Creates XY quad Buffers
     *
     * The default with no parameters will return a 2x2 quad with values from -1 to +1.
     * If you want a unit quad with that goes from 0 to 1 you'd call it with
     *
     *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0.5, 0.5);
     *
     * If you want a unit quad centered above 0,0 you'd call it with
     *
     *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0, 0.5);
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
     * @param {number} [xOffset] the amount to offset the quad in X
     * @param {number} [yOffset] the amount to offset the quad in Y
     * @return {BufferInfo} the created XY Quad buffers
     * @memberOf module:twgl/primitives
     * @function createXYQuadBufferInfo
     */
    export function createXYQuadBufferInfo(gl: WebGLRenderingContext, size?: number, xOffset?: number, yOffset?: number): BufferInfo;
    /**
     * Creates XY quad vertices
     *
     * The default with no parameters will return a 2x2 quad with values from -1 to +1.
     * If you want a unit quad with that goes from 0 to 1 you'd call it with
     *
     *     twgl.primitives.createXYQuadVertices(1, 0.5, 0.5);
     *
     * If you want a unit quad centered above 0,0 you'd call it with
     *
     *     twgl.primitives.createXYQuadVertices(1, 0, 0.5);
     *
     * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
     * @param {number} [xOffset] the amount to offset the quad in X
     * @param {number} [yOffset] the amount to offset the quad in Y
     * @return {Object.<string, TypedArray>} the created XY Quad vertices
     * @memberOf module:twgl/primitives
     */
    export function createXYQuadVertices(size?: number, xOffset?: number, yOffset?: number): {
        [key: string]: TypedArray;
    };
    /**
     * Creates XZ plane BufferInfo.
     *
     * The created plane has position, normal, and texcoord data
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} [width] Width of the plane. Default = 1
     * @param {number} [depth] Depth of the plane. Default = 1
     * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
     * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
     * @param {m4.Mat4} [matrix] A matrix by which to multiply all the vertices.
     * @return {BufferInfo} The created plane BufferInfo.
     * @memberOf module:twgl/primitives
     * @function createPlaneBufferInfo
     */
    export function createPlaneBufferInfo(gl: WebGLRenderingContext, width?: number, depth?: number, subdivisionsWidth?: number, subdivisionsDepth?: number, matrix?: m4.Mat4): BufferInfo;
    /**
     * Creates XZ plane buffers.
     *
     * The created plane has position, normal, and texcoord data
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} [width] Width of the plane. Default = 1
     * @param {number} [depth] Depth of the plane. Default = 1
     * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
     * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
     * @param {m4.Mat4} [matrix] A matrix by which to multiply all the vertices.
     * @return {Object.<string, WebGLBuffer>} The created plane buffers.
     * @memberOf module:twgl/primitives
     * @function createPlaneBuffers
     */
    export function createPlaneBuffers(gl: WebGLRenderingContext, width?: number, depth?: number, subdivisionsWidth?: number, subdivisionsDepth?: number, matrix?: m4.Mat4): {
        [key: string]: WebGLBuffer;
    };
    /**
     * Creates XZ plane vertices.
     *
     * The created plane has position, normal, and texcoord data
     *
     * @param {number} [width] Width of the plane. Default = 1
     * @param {number} [depth] Depth of the plane. Default = 1
     * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
     * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
     * @param {m4.Mat4} [matrix] A matrix by which to multiply all the vertices.
     * @return {Object.<string, TypedArray>} The created plane vertices.
     * @memberOf module:twgl/primitives
     */
    export function createPlaneVertices(width?: number, depth?: number, subdivisionsWidth?: number, subdivisionsDepth?: number, matrix?: m4.Mat4): {
        [key: string]: TypedArray;
    };
    /**
     * Creates sphere BufferInfo.
     *
     * The created sphere has position, normal, and texcoord data
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} radius radius of the sphere.
     * @param {number} subdivisionsAxis number of steps around the sphere.
     * @param {number} subdivisionsHeight number of vertically on the sphere.
     * @param {number} [opt_startLatitudeInRadians] where to start the
     *     top of the sphere. Default = 0.
     * @param {number} [opt_endLatitudeInRadians] Where to end the
     *     bottom of the sphere. Default = Math.PI.
     * @param {number} [opt_startLongitudeInRadians] where to start
     *     wrapping the sphere. Default = 0.
     * @param {number} [opt_endLongitudeInRadians] where to end
     *     wrapping the sphere. Default = 2 * Math.PI.
     * @return {BufferInfo} The created sphere BufferInfo.
     * @memberOf module:twgl/primitives
     * @function createSphereBufferInfo
     */
    export function createSphereBufferInfo(gl: WebGLRenderingContext, radius: number, subdivisionsAxis: number, subdivisionsHeight: number, opt_startLatitudeInRadians?: number, opt_endLatitudeInRadians?: number, opt_startLongitudeInRadians?: number, opt_endLongitudeInRadians?: number): BufferInfo;
    /**
     * Creates sphere buffers.
     *
     * The created sphere has position, normal, and texcoord data
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} radius radius of the sphere.
     * @param {number} subdivisionsAxis number of steps around the sphere.
     * @param {number} subdivisionsHeight number of vertically on the sphere.
     * @param {number} [opt_startLatitudeInRadians] where to start the
     *     top of the sphere. Default = 0.
     * @param {number} [opt_endLatitudeInRadians] Where to end the
     *     bottom of the sphere. Default = Math.PI.
     * @param {number} [opt_startLongitudeInRadians] where to start
     *     wrapping the sphere. Default = 0.
     * @param {number} [opt_endLongitudeInRadians] where to end
     *     wrapping the sphere. Default = 2 * Math.PI.
     * @return {Object.<string, WebGLBuffer>} The created sphere buffers.
     * @memberOf module:twgl/primitives
     * @function createSphereBuffers
     */
    export function createSphereBuffers(gl: WebGLRenderingContext, radius: number, subdivisionsAxis: number, subdivisionsHeight: number, opt_startLatitudeInRadians?: number, opt_endLatitudeInRadians?: number, opt_startLongitudeInRadians?: number, opt_endLongitudeInRadians?: number): {
        [key: string]: WebGLBuffer;
    };
    /**
     * Creates sphere vertices.
     *
     * The created sphere has position, normal, and texcoord data
     *
     * @param {number} radius radius of the sphere.
     * @param {number} subdivisionsAxis number of steps around the sphere.
     * @param {number} subdivisionsHeight number of vertically on the sphere.
     * @param {number} [opt_startLatitudeInRadians] where to start the
     *     top of the sphere. Default = 0.
     * @param {number} [opt_endLatitudeInRadians] Where to end the
     *     bottom of the sphere. Default = Math.PI.
     * @param {number} [opt_startLongitudeInRadians] where to start
     *     wrapping the sphere. Default = 0.
     * @param {number} [opt_endLongitudeInRadians] where to end
     *     wrapping the sphere. Default = 2 * Math.PI.
     * @return {Object.<string, TypedArray>} The created sphere vertices.
     * @memberOf module:twgl/primitives
     */
    export function createSphereVertices(radius: number, subdivisionsAxis: number, subdivisionsHeight: number, opt_startLatitudeInRadians?: number, opt_endLatitudeInRadians?: number, opt_startLongitudeInRadians?: number, opt_endLongitudeInRadians?: number): {
        [key: string]: TypedArray;
    };
    /**
     * Creates a BufferInfo for a cube.
     *
     * The cube is created around the origin. (-size / 2, size / 2).
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} [size] width, height and depth of the cube.
     * @return {BufferInfo} The created BufferInfo.
     * @memberOf module:twgl/primitives
     * @function createCubeBufferInfo
     */
    export function createCubeBufferInfo(gl: WebGLRenderingContext, size?: number): BufferInfo;
    /**
     * Creates the buffers and indices for a cube.
     *
     * The cube is created around the origin. (-size / 2, size / 2).
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} [size] width, height and depth of the cube.
     * @return {Object.<string, WebGLBuffer>} The created buffers.
     * @memberOf module:twgl/primitives
     * @function createCubeBuffers
     */
    export function createCubeBuffers(gl: WebGLRenderingContext, size?: number): {
        [key: string]: WebGLBuffer;
    };
    /**
     * Creates the vertices and indices for a cube.
     *
     * The cube is created around the origin. (-size / 2, size / 2).
     *
     * @param {number} [size] width, height and depth of the cube.
     * @return {Object.<string, TypedArray>} The created vertices.
     * @memberOf module:twgl/primitives
     */
    export function createCubeVertices(size?: number): {
        [key: string]: TypedArray;
    };
    /**
     * Creates a BufferInfo for a truncated cone, which is like a cylinder
     * except that it has different top and bottom radii. A truncated cone
     * can also be used to create cylinders and regular cones. The
     * truncated cone will be created centered about the origin, with the
     * y axis as its vertical axis.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} bottomRadius Bottom radius of truncated cone.
     * @param {number} topRadius Top radius of truncated cone.
     * @param {number} height Height of truncated cone.
     * @param {number} radialSubdivisions The number of subdivisions around the
     *     truncated cone.
     * @param {number} verticalSubdivisions The number of subdivisions down the
     *     truncated cone.
     * @param {boolean} [opt_topCap] Create top cap. Default = true.
     * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
     * @return {BufferInfo} The created cone BufferInfo.
     * @memberOf module:twgl/primitives
     * @function createTruncatedConeBufferInfo
     */
    export function createTruncatedConeBufferInfo(gl: WebGLRenderingContext, bottomRadius: number, topRadius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, opt_topCap?: boolean, opt_bottomCap?: boolean): BufferInfo;
    /**
     * Creates buffers for a truncated cone, which is like a cylinder
     * except that it has different top and bottom radii. A truncated cone
     * can also be used to create cylinders and regular cones. The
     * truncated cone will be created centered about the origin, with the
     * y axis as its vertical axis.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} bottomRadius Bottom radius of truncated cone.
     * @param {number} topRadius Top radius of truncated cone.
     * @param {number} height Height of truncated cone.
     * @param {number} radialSubdivisions The number of subdivisions around the
     *     truncated cone.
     * @param {number} verticalSubdivisions The number of subdivisions down the
     *     truncated cone.
     * @param {boolean} [opt_topCap] Create top cap. Default = true.
     * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
     * @return {Object.<string, WebGLBuffer>} The created cone buffers.
     * @memberOf module:twgl/primitives
     * @function createTruncatedConeBuffers
     */
    export function createTruncatedConeBuffers(gl: WebGLRenderingContext, bottomRadius: number, topRadius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, opt_topCap?: boolean, opt_bottomCap?: boolean): {
        [key: string]: WebGLBuffer;
    };
    /**
     * Creates vertices for a truncated cone, which is like a cylinder
     * except that it has different top and bottom radii. A truncated cone
     * can also be used to create cylinders and regular cones. The
     * truncated cone will be created centered about the origin, with the
     * y axis as its vertical axis. .
     *
     * @param {number} bottomRadius Bottom radius of truncated cone.
     * @param {number} topRadius Top radius of truncated cone.
     * @param {number} height Height of truncated cone.
     * @param {number} radialSubdivisions The number of subdivisions around the
     *     truncated cone.
     * @param {number} verticalSubdivisions The number of subdivisions down the
     *     truncated cone.
     * @param {boolean} [opt_topCap] Create top cap. Default = true.
     * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
     * @return {Object.<string, TypedArray>} The created cone vertices.
     * @memberOf module:twgl/primitives
     */
    export function createTruncatedConeVertices(bottomRadius: number, topRadius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, opt_topCap?: boolean, opt_bottomCap?: boolean): {
        [key: string]: TypedArray;
    };
    /**
     * Creates 3D 'F' BufferInfo.
     * An 'F' is useful because you can easily tell which way it is oriented.
     * The created 'F' has position, normal, texcoord, and color buffers.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @return {BufferInfo} The created BufferInfo.
     * @memberOf module:twgl/primitives
     * @function create3DFBufferInfo
     */
    export function create3DFBufferInfo(gl: WebGLRenderingContext): BufferInfo;
    /**
     * Creates 3D 'F' buffers.
     * An 'F' is useful because you can easily tell which way it is oriented.
     * The created 'F' has position, normal, texcoord, and color buffers.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @return {Object.<string, WebGLBuffer>} The created buffers.
     * @memberOf module:twgl/primitives
     * @function create3DFBuffers
     */
    export function create3DFBuffers(gl: WebGLRenderingContext): {
        [key: string]: WebGLBuffer;
    };
    /**
     * Creates 3D 'F' vertices.
     * An 'F' is useful because you can easily tell which way it is oriented.
     * The created 'F' has position, normal, texcoord, and color arrays.
     *
     * @return {Object.<string, TypedArray>} The created vertices.
     * @memberOf module:twgl/primitives
     */
    export function create3DFVertices(): {
        [key: string]: TypedArray;
    };
    /**
     * Creates crescent BufferInfo.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} verticalRadius The vertical radius of the crescent.
     * @param {number} outerRadius The outer radius of the crescent.
     * @param {number} innerRadius The inner radius of the crescent.
     * @param {number} thickness The thickness of the crescent.
     * @param {number} subdivisionsDown number of steps around the crescent.
     * @param {number} [startOffset] Where to start arc. Default 0.
     * @param {number} [endOffset] Where to end arg. Default 1.
     * @return {BufferInfo} The created BufferInfo.
     * @memberOf module:twgl/primitives
     * @function createCresentBufferInfo
     */
    export function createCresentBufferInfo(gl: WebGLRenderingContext, verticalRadius: number, outerRadius: number, innerRadius: number, thickness: number, subdivisionsDown: number, startOffset?: number, endOffset?: number): BufferInfo;
    /**
     * Creates crescent buffers.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} verticalRadius The vertical radius of the crescent.
     * @param {number} outerRadius The outer radius of the crescent.
     * @param {number} innerRadius The inner radius of the crescent.
     * @param {number} thickness The thickness of the crescent.
     * @param {number} subdivisionsDown number of steps around the crescent.
     * @param {number} [startOffset] Where to start arc. Default 0.
     * @param {number} [endOffset] Where to end arg. Default 1.
     * @return {Object.<string, WebGLBuffer>} The created buffers.
     * @memberOf module:twgl/primitives
     * @function createCresentBuffers
     */
    export function createCresentBuffers(gl: WebGLRenderingContext, verticalRadius: number, outerRadius: number, innerRadius: number, thickness: number, subdivisionsDown: number, startOffset?: number, endOffset?: number): {
        [key: string]: WebGLBuffer;
    };
    /**
     * Creates crescent buffers.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} verticalRadius The vertical radius of the crescent.
     * @param {number} outerRadius The outer radius of the crescent.
     * @param {number} innerRadius The inner radius of the crescent.
     * @param {number} thickness The thickness of the crescent.
     * @param {number} subdivisionsDown number of steps around the crescent.
     * @param {number} [startOffset] Where to start arc. Default 0.
     * @param {number} [endOffset] Where to end arg. Default 1.
     * @return {Object.<string, WebGLBuffer>} The created buffers.
     * @memberOf module:twgl/primitives
     * @function createCresentBuffers
     */
    export function createCresentBuffers(gl: WebGLRenderingContext, verticalRadius: number, outerRadius: number, innerRadius: number, thickness: number, subdivisionsDown: number, startOffset?: number, endOffset?: number): {
        [key: string]: WebGLBuffer;
    };
    /**
     * Creates crescent BufferInfo.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} verticalRadius The vertical radius of the crescent.
     * @param {number} outerRadius The outer radius of the crescent.
     * @param {number} innerRadius The inner radius of the crescent.
     * @param {number} thickness The thickness of the crescent.
     * @param {number} subdivisionsDown number of steps around the crescent.
     * @param {number} [startOffset] Where to start arc. Default 0.
     * @param {number} [endOffset] Where to end arg. Default 1.
     * @return {BufferInfo} The created BufferInfo.
     * @memberOf module:twgl/primitives
     * @function createCrescentBufferInfo
     */
    export function createCrescentBufferInfo(gl: WebGLRenderingContext, verticalRadius: number, outerRadius: number, innerRadius: number, thickness: number, subdivisionsDown: number, startOffset?: number, endOffset?: number): BufferInfo;
    /**
     * Creates crescent buffers.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} verticalRadius The vertical radius of the crescent.
     * @param {number} outerRadius The outer radius of the crescent.
     * @param {number} innerRadius The inner radius of the crescent.
     * @param {number} thickness The thickness of the crescent.
     * @param {number} subdivisionsDown number of steps around the crescent.
     * @param {number} [startOffset] Where to start arc. Default 0.
     * @param {number} [endOffset] Where to end arg. Default 1.
     * @return {Object.<string, WebGLBuffer>} The created buffers.
     * @memberOf module:twgl/primitives
     * @function createCrescentBuffers
     */
    export function createCrescentBuffers(gl: WebGLRenderingContext, verticalRadius: number, outerRadius: number, innerRadius: number, thickness: number, subdivisionsDown: number, startOffset?: number, endOffset?: number): {
        [key: string]: WebGLBuffer;
    };
    /**
     * Creates crescent vertices.
     *
     * @param {number} verticalRadius The vertical radius of the crescent.
     * @param {number} outerRadius The outer radius of the crescent.
     * @param {number} innerRadius The inner radius of the crescent.
     * @param {number} thickness The thickness of the crescent.
     * @param {number} subdivisionsDown number of steps around the crescent.
     * @param {number} [startOffset] Where to start arc. Default 0.
     * @param {number} [endOffset] Where to end arg. Default 1.
     * @return {Object.<string, TypedArray>} The created vertices.
     * @memberOf module:twgl/primitives
     */
    export function createCrescentVertices(verticalRadius: number, outerRadius: number, innerRadius: number, thickness: number, subdivisionsDown: number, startOffset?: number, endOffset?: number): {
        [key: string]: TypedArray;
    };
    /**
     * Creates cylinder BufferInfo. The cylinder will be created around the origin
     * along the y-axis.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} radius Radius of cylinder.
     * @param {number} height Height of cylinder.
     * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
     * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
     * @param {boolean} [topCap] Create top cap. Default = true.
     * @param {boolean} [bottomCap] Create bottom cap. Default = true.
     * @return {BufferInfo} The created BufferInfo.
     * @memberOf module:twgl/primitives
     * @function createCylinderBufferInfo
     */
    export function createCylinderBufferInfo(gl: WebGLRenderingContext, radius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, topCap?: boolean, bottomCap?: boolean): BufferInfo;
    /**
     * Creates cylinder buffers. The cylinder will be created around the origin
     * along the y-axis.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} radius Radius of cylinder.
     * @param {number} height Height of cylinder.
     * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
     * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
     * @param {boolean} [topCap] Create top cap. Default = true.
     * @param {boolean} [bottomCap] Create bottom cap. Default = true.
     * @return {Object.<string, WebGLBuffer>} The created buffers.
     * @memberOf module:twgl/primitives
     * @function createCylinderBuffers
     */
    export function createCylinderBuffers(gl: WebGLRenderingContext, radius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, topCap?: boolean, bottomCap?: boolean): {
        [key: string]: WebGLBuffer;
    };
    /**
     * Creates cylinder vertices. The cylinder will be created around the origin
     * along the y-axis.
     *
     * @param {number} radius Radius of cylinder.
     * @param {number} height Height of cylinder.
     * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
     * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
     * @param {boolean} [topCap] Create top cap. Default = true.
     * @param {boolean} [bottomCap] Create bottom cap. Default = true.
     * @return {Object.<string, TypedArray>} The created vertices.
     * @memberOf module:twgl/primitives
     */
    export function createCylinderVertices(radius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, topCap?: boolean, bottomCap?: boolean): {
        [key: string]: TypedArray;
    };
    /**
     * Creates BufferInfo for a torus
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} radius radius of center of torus circle.
     * @param {number} thickness radius of torus ring.
     * @param {number} radialSubdivisions The number of subdivisions around the torus.
     * @param {number} bodySubdivisions The number of subdivisions around the body torus.
     * @param {boolean} [startAngle] start angle in radians. Default = 0.
     * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
     * @return {BufferInfo} The created BufferInfo.
     * @memberOf module:twgl/primitives
     * @function createTorusBufferInfo
     */
    export function createTorusBufferInfo(gl: WebGLRenderingContext, radius: number, thickness: number, radialSubdivisions: number, bodySubdivisions: number, startAngle?: boolean, endAngle?: boolean): BufferInfo;
    /**
     * Creates buffers for a torus
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} radius radius of center of torus circle.
     * @param {number} thickness radius of torus ring.
     * @param {number} radialSubdivisions The number of subdivisions around the torus.
     * @param {number} bodySubdivisions The number of subdivisions around the body torus.
     * @param {boolean} [startAngle] start angle in radians. Default = 0.
     * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
     * @return {Object.<string, WebGLBuffer>} The created buffers.
     * @memberOf module:twgl/primitives
     * @function createTorusBuffers
     */
    export function createTorusBuffers(gl: WebGLRenderingContext, radius: number, thickness: number, radialSubdivisions: number, bodySubdivisions: number, startAngle?: boolean, endAngle?: boolean): {
        [key: string]: WebGLBuffer;
    };
    /**
     * Creates vertices for a torus
     *
     * @param {number} radius radius of center of torus circle.
     * @param {number} thickness radius of torus ring.
     * @param {number} radialSubdivisions The number of subdivisions around the torus.
     * @param {number} bodySubdivisions The number of subdivisions around the body torus.
     * @param {boolean} [startAngle] start angle in radians. Default = 0.
     * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
     * @return {Object.<string, TypedArray>} The created vertices.
     * @memberOf module:twgl/primitives
     */
    export function createTorusVertices(radius: number, thickness: number, radialSubdivisions: number, bodySubdivisions: number, startAngle?: boolean, endAngle?: boolean): {
        [key: string]: TypedArray;
    };
    /**
     * Creates a disc BufferInfo. The disc will be in the xz plane, centered at
     * the origin. When creating, at least 3 divisions, or pie
     * pieces, need to be specified, otherwise the triangles making
     * up the disc will be degenerate. You can also specify the
     * number of radial pieces `stacks`. A value of 1 for
     * stacks will give you a simple disc of pie pieces.  If you
     * want to create an annulus you can set `innerRadius` to a
     * value > 0. Finally, `stackPower` allows you to have the widths
     * increase or decrease as you move away from the center. This
     * is particularly useful when using the disc as a ground plane
     * with a fixed camera such that you don't need the resolution
     * of small triangles near the perimeter. For example, a value
     * of 2 will produce stacks whose outside radius increases with
     * the square of the stack index. A value of 1 will give uniform
     * stacks.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} radius Radius of the ground plane.
     * @param {number} divisions Number of triangles in the ground plane (at least 3).
     * @param {number} [stacks] Number of radial divisions (default=1).
     * @param {number} [innerRadius] Default 0.
     * @param {number} [stackPower] Power to raise stack size to for decreasing width.
     * @return {BufferInfo} The created BufferInfo.
     * @memberOf module:twgl/primitives
     * @function createDiscBufferInfo
     */
    export function createDiscBufferInfo(gl: WebGLRenderingContext, radius: number, divisions: number, stacks?: number, innerRadius?: number, stackPower?: number): BufferInfo;
    /**
     * Creates disc buffers. The disc will be in the xz plane, centered at
     * the origin. When creating, at least 3 divisions, or pie
     * pieces, need to be specified, otherwise the triangles making
     * up the disc will be degenerate. You can also specify the
     * number of radial pieces `stacks`. A value of 1 for
     * stacks will give you a simple disc of pie pieces.  If you
     * want to create an annulus you can set `innerRadius` to a
     * value > 0. Finally, `stackPower` allows you to have the widths
     * increase or decrease as you move away from the center. This
     * is particularly useful when using the disc as a ground plane
     * with a fixed camera such that you don't need the resolution
     * of small triangles near the perimeter. For example, a value
     * of 2 will produce stacks whose outside radius increases with
     * the square of the stack index. A value of 1 will give uniform
     * stacks.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
     * @param {number} radius Radius of the ground plane.
     * @param {number} divisions Number of triangles in the ground plane (at least 3).
     * @param {number} [stacks] Number of radial divisions (default=1).
     * @param {number} [innerRadius] Default 0.
     * @param {number} [stackPower] Power to raise stack size to for decreasing width.
     * @return {Object.<string, WebGLBuffer>} The created buffers.
     * @memberOf module:twgl/primitives
     * @function createDiscBuffers
     */
    export function createDiscBuffers(gl: WebGLRenderingContext, radius: number, divisions: number, stacks?: number, innerRadius?: number, stackPower?: number): {
        [key: string]: WebGLBuffer;
    };
    /**
     * Creates disc vertices. The disc will be in the xz plane, centered at
     * the origin. When creating, at least 3 divisions, or pie
     * pieces, need to be specified, otherwise the triangles making
     * up the disc will be degenerate. You can also specify the
     * number of radial pieces `stacks`. A value of 1 for
     * stacks will give you a simple disc of pie pieces.  If you
     * want to create an annulus you can set `innerRadius` to a
     * value > 0. Finally, `stackPower` allows you to have the widths
     * increase or decrease as you move away from the center. This
     * is particularly useful when using the disc as a ground plane
     * with a fixed camera such that you don't need the resolution
     * of small triangles near the perimeter. For example, a value
     * of 2 will produce stacks whose outside radius increases with
     * the square of the stack index. A value of 1 will give uniform
     * stacks.
     *
     * @param {number} radius Radius of the ground plane.
     * @param {number} divisions Number of triangles in the ground plane (at least 3).
     * @param {number} [stacks] Number of radial divisions (default=1).
     * @param {number} [innerRadius] Default 0.
     * @param {number} [stackPower] Power to raise stack size to for decreasing width.
     * @return {Object.<string, TypedArray>} The created vertices.
     * @memberOf module:twgl/primitives
     */
    export function createDiscVertices(radius: number, divisions: number, stacks?: number, innerRadius?: number, stackPower?: number): {
        [key: string]: TypedArray;
    };
    /**
     * Used to supply random colors
     * @callback RandomColorFunc
     * @param {number} ndx index of triangle/quad if unindexed or index of vertex if indexed
     * @param {number} channel 0 = red, 1 = green, 2 = blue, 3 = alpha
     * @return {number} a number from 0 to 255
     * @memberOf module:twgl/primitives
     */
    export type RandomColorFunc = (ndx: number, channel: number) => number;
    /**
     * @typedef {Object} RandomVerticesOptions
     * @property {number} [vertsPerColor] Defaults to 3 for non-indexed vertices
     * @property {primitives.RandomColorFunc} [rand] A function to generate random numbers
     * @memberOf module:twgl/primitives
     */
    export type RandomVerticesOptions = {
        vertsPerColor?: number;
        rand?: primitives.RandomColorFunc;
    };
    /**
     * Creates an augmentedTypedArray of random vertex colors.
     * If the vertices are indexed (have an indices array) then will
     * just make random colors. Otherwise assumes they are triangles
     * and makes one random color for every 3 vertices.
     * @param {Object.<string, ArrayBufferView>} vertices Vertices as returned from one of the createXXXVertices functions.
     * @param {primitives.RandomVerticesOptions} [options] options.
     * @return {Object.<string, ArrayBufferView>} same vertices as passed in with `color` added.
     * @memberOf module:twgl/primitives
     */
    export function makeRandomVertexColors(vertices: {
        [key: string]: ArrayBufferView;
    }, options?: primitives.RandomVerticesOptions): {
        [key: string]: ArrayBufferView;
    };
    /**
     * Concatenates sets of vertices
     *
     * Assumes the vertices match in composition. For example
     * if one set of vertices has positions, normals, and indices
     * all sets of vertices must have positions, normals, and indices
     * and of the same type.
     *
     * Example:
     *
     *      const cubeVertices = twgl.primitives.createCubeVertices(2);
     *      const sphereVertices = twgl.primitives.createSphereVertices(1, 10, 10);
     *      // move the sphere 2 units up
     *      twgl.primitives.reorientVertices(
     *          sphereVertices, twgl.m4.translation([0, 2, 0]));
     *      // merge the sphere with the cube
     *      const cubeSphereVertices = twgl.primitives.concatVertices(
     *          [cubeVertices, sphereVertices]);
     *      // turn them into WebGL buffers and attrib data
     *      const bufferInfo = twgl.createBufferInfoFromArrays(gl, cubeSphereVertices);
     *
     * @param {Arrays[]} arrays Array of arrays of vertices
     * @return {Arrays} The concatenated vertices.
     * @memberOf module:twgl/primitives
     */
    export function concatVertices(arrays: Arrays[]): Arrays;
    /**
     * Creates a duplicate set of vertices
     *
     * This is useful for calling reorientVertices when you
     * also want to keep the original available
     *
     * @param {Arrays} arrays of vertices
     * @return {Arrays} The duplicated vertices.
     * @memberOf module:twgl/primitives
     */
    export function duplicateVertices(arrays: Arrays): Arrays;
}