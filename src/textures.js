/*
 * Copyright 2019 Gregg Tavares
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

import * as utils from './utils.js';
import * as typedArrays from './typedarrays.js';
import * as helper from './helper.js';

/**
 * Low level texture related functions
 *
 * You should generally not need to use these functions. They are provided
 * for those cases where you're doing something out of the ordinary
 * and you need lower level access.
 *
 * For backward compatibility they are available at both `twgl.textures` and `twgl`
 * itself
 *
 * See {@link module:twgl} for core functions
 *
 * @module twgl/textures
 */

// make sure we don't see a global gl
const gl = undefined;  /* eslint-disable-line */
const defaults = {
  textureColor: new Uint8Array([128, 192, 255, 255]),
  textureOptions: {},
  crossOrigin: undefined,
};
const isArrayBuffer = typedArrays.isArrayBuffer;

// Should we make this on demand?
const getShared2DContext = function() {
  let s_ctx;
  return function getShared2DContext() {
    s_ctx = s_ctx ||
        ((typeof document !== 'undefined' && document.createElement)
          ? document.createElement("canvas").getContext("2d")
          : null);
    return s_ctx;
  };
}();

// NOTE: Chrome supports 2D canvas in a Worker (behind flag as of v64 but
//       not only does Firefox NOT support it but Firefox freezes immediately
//       if you try to create one instead of just returning null and continuing.
//  : (global.OffscreenCanvas && (new global.OffscreenCanvas(1, 1)).getContext("2d"));  // OffscreenCanvas may not support 2d

// NOTE: We can maybe remove some of the need for the 2d canvas. In WebGL2
// we can use the various unpack settings. Otherwise we could try using
// the ability of an ImageBitmap to be cut. Unfortunately cutting an ImageBitmap
// is async and the current TWGL code expects a non-Async result though that
// might not be a problem. ImageBitmap though is not available in Edge or Safari
// as of 2018-01-02

/* PixelFormat */
const ALPHA                          = 0x1906;
const RGB                            = 0x1907;
const RGBA                           = 0x1908;
const LUMINANCE                      = 0x1909;
const LUMINANCE_ALPHA                = 0x190A;
const DEPTH_COMPONENT                = 0x1902;
const DEPTH_STENCIL                  = 0x84F9;

/* TextureWrapMode */
// const REPEAT                         = 0x2901;
// const MIRRORED_REPEAT                = 0x8370;
const CLAMP_TO_EDGE                  = 0x812f;

/* TextureMagFilter */
const NEAREST                        = 0x2600;
const LINEAR                         = 0x2601;
const NEAREST_MIPMAP_LINEAR          = 0x2702;

/* TextureMinFilter */
// const NEAREST_MIPMAP_NEAREST         = 0x2700;
// const LINEAR_MIPMAP_NEAREST          = 0x2701;
// const NEAREST_MIPMAP_LINEAR          = 0x2702;
// const LINEAR_MIPMAP_LINEAR           = 0x2703;

/* Texture Target */
const TEXTURE_2D                     = 0x0de1;
const TEXTURE_CUBE_MAP               = 0x8513;
const TEXTURE_3D                     = 0x806f;
const TEXTURE_2D_ARRAY               = 0x8c1a;

/* Cubemap Targets */
const TEXTURE_CUBE_MAP_POSITIVE_X    = 0x8515;
const TEXTURE_CUBE_MAP_NEGATIVE_X    = 0x8516;
const TEXTURE_CUBE_MAP_POSITIVE_Y    = 0x8517;
const TEXTURE_CUBE_MAP_NEGATIVE_Y    = 0x8518;
const TEXTURE_CUBE_MAP_POSITIVE_Z    = 0x8519;
const TEXTURE_CUBE_MAP_NEGATIVE_Z    = 0x851a;

/* Texture Parameters */
const TEXTURE_MIN_FILTER             = 0x2801;
const TEXTURE_MAG_FILTER             = 0x2800;
const TEXTURE_WRAP_S                 = 0x2802;
const TEXTURE_WRAP_T                 = 0x2803;
const TEXTURE_WRAP_R                 = 0x8072;
const TEXTURE_MIN_LOD                = 0x813a;
const TEXTURE_MAX_LOD                = 0x813b;
const TEXTURE_BASE_LEVEL             = 0x813c;
const TEXTURE_MAX_LEVEL              = 0x813d;
const TEXTURE_COMPARE_MODE           = 0x884C;
const TEXTURE_COMPARE_FUNC           = 0x884D;

/* Pixel store */
const UNPACK_ALIGNMENT                   = 0x0cf5;
const UNPACK_ROW_LENGTH                  = 0x0cf2;
const UNPACK_IMAGE_HEIGHT                = 0x806e;
const UNPACK_SKIP_PIXELS                 = 0x0cf4;
const UNPACK_SKIP_ROWS                   = 0x0cf3;
const UNPACK_SKIP_IMAGES                 = 0x806d;
const UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
const UNPACK_PREMULTIPLY_ALPHA_WEBGL     = 0x9241;
const UNPACK_FLIP_Y_WEBGL                = 0x9240;

const R8                           = 0x8229;
const R8_SNORM                     = 0x8F94;
const R16F                         = 0x822D;
const R32F                         = 0x822E;
const R8UI                         = 0x8232;
const R8I                          = 0x8231;
const RG16UI                       = 0x823A;
const RG16I                        = 0x8239;
const RG32UI                       = 0x823C;
const RG32I                        = 0x823B;
const RG8                          = 0x822B;
const RG8_SNORM                    = 0x8F95;
const RG16F                        = 0x822F;
const RG32F                        = 0x8230;
const RG8UI                        = 0x8238;
const RG8I                         = 0x8237;
const R16UI                        = 0x8234;
const R16I                         = 0x8233;
const R32UI                        = 0x8236;
const R32I                         = 0x8235;
const RGB8                         = 0x8051;
const SRGB8                        = 0x8C41;
const RGB565                       = 0x8D62;
const RGB8_SNORM                   = 0x8F96;
const R11F_G11F_B10F               = 0x8C3A;
const RGB9_E5                      = 0x8C3D;
const RGB16F                       = 0x881B;
const RGB32F                       = 0x8815;
const RGB8UI                       = 0x8D7D;
const RGB8I                        = 0x8D8F;
const RGB16UI                      = 0x8D77;
const RGB16I                       = 0x8D89;
const RGB32UI                      = 0x8D71;
const RGB32I                       = 0x8D83;
const RGBA8                        = 0x8058;
const SRGB8_ALPHA8                 = 0x8C43;
const RGBA8_SNORM                  = 0x8F97;
const RGB5_A1                      = 0x8057;
const RGBA4                        = 0x8056;
const RGB10_A2                     = 0x8059;
const RGBA16F                      = 0x881A;
const RGBA32F                      = 0x8814;
const RGBA8UI                      = 0x8D7C;
const RGBA8I                       = 0x8D8E;
const RGB10_A2UI                   = 0x906F;
const RGBA16UI                     = 0x8D76;
const RGBA16I                      = 0x8D88;
const RGBA32I                      = 0x8D82;
const RGBA32UI                     = 0x8D70;

const DEPTH_COMPONENT16            = 0x81A5;
const DEPTH_COMPONENT24            = 0x81A6;
const DEPTH_COMPONENT32F           = 0x8CAC;
const DEPTH32F_STENCIL8            = 0x8CAD;
const DEPTH24_STENCIL8             = 0x88F0;

/* DataType */
const BYTE                         = 0x1400;
const UNSIGNED_BYTE                = 0x1401;
const SHORT                        = 0x1402;
const UNSIGNED_SHORT               = 0x1403;
const INT                          = 0x1404;
const UNSIGNED_INT                 = 0x1405;
const FLOAT                        = 0x1406;
const UNSIGNED_SHORT_4_4_4_4       = 0x8033;
const UNSIGNED_SHORT_5_5_5_1       = 0x8034;
const UNSIGNED_SHORT_5_6_5         = 0x8363;
const HALF_FLOAT                   = 0x140B;
const HALF_FLOAT_OES               = 0x8D61;  // Thanks Khronos for making this different >:(
const UNSIGNED_INT_2_10_10_10_REV  = 0x8368;
const UNSIGNED_INT_10F_11F_11F_REV = 0x8C3B;
const UNSIGNED_INT_5_9_9_9_REV     = 0x8C3E;
const FLOAT_32_UNSIGNED_INT_24_8_REV = 0x8DAD;
const UNSIGNED_INT_24_8            = 0x84FA;

const RG                           = 0x8227;
const RG_INTEGER                   = 0x8228;
const RED                          = 0x1903;
const RED_INTEGER                  = 0x8D94;
const RGB_INTEGER                  = 0x8D98;
const RGBA_INTEGER                 = 0x8D99;

/* Compressed Texture Formats */
// s3tc
const COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
const COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
const COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
const COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;
// s3tc_srgb
const COMPRESSED_SRGB_S3TC_DXT1_EXT       = 0x8C4C;
const COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT = 0x8C4D;
const COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT = 0x8C4E;
const COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT = 0x8C4F;
// etc
const COMPRESSED_RGB_ETC1_WEBGL    = 0x8D64;
const COMPRESSED_R11_EAC = 0x9270;
const COMPRESSED_SIGNED_R11_EAC = 0x9271;
const COMPRESSED_RG11_EAC = 0x9272;
const COMPRESSED_SIGNED_RG11_EAC = 0x9273;
const COMPRESSED_RGB8_ETC2 = 0x9274;
const COMPRESSED_SRGB8_ETC2 = 0x9275;
const COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 0x9276;
const COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 0x9277;
const COMPRESSED_RGBA8_ETC2_EAC = 0x9278;
const COMPRESSED_SRGB8_ALPHA8_ETC2_EAC = 0x9279;
// pvrtc
const COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8C00;
const COMPRESSED_RGB_PVRTC_2BPPV1_IMG = 0x8C01;
const COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8C02;
const COMPRESSED_RGBA_PVRTC_2BPPV1_IMG = 0x8C03;
// astc
const COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93B0;
const COMPRESSED_RGBA_ASTC_5x4_KHR = 0x93B1;
const COMPRESSED_RGBA_ASTC_5x5_KHR = 0x93B2;
const COMPRESSED_RGBA_ASTC_6x5_KHR = 0x93B3;
const COMPRESSED_RGBA_ASTC_6x6_KHR = 0x93B4;
const COMPRESSED_RGBA_ASTC_8x5_KHR = 0x93B5;
const COMPRESSED_RGBA_ASTC_8x6_KHR = 0x93B6;
const COMPRESSED_RGBA_ASTC_8x8_KHR = 0x93B7;
const COMPRESSED_RGBA_ASTC_10x5_KHR = 0x93B8;
const COMPRESSED_RGBA_ASTC_10x6_KHR = 0x93B9;
const COMPRESSED_RGBA_ASTC_10x8_KHR = 0x93BA;
const COMPRESSED_RGBA_ASTC_10x10_KHR = 0x93BB;
const COMPRESSED_RGBA_ASTC_12x10_KHR = 0x93BC;
const COMPRESSED_RGBA_ASTC_12x12_KHR = 0x93BD;
const COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR = 0x93D0;
const COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR = 0x93D1;
const COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR = 0x93D2;
const COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR = 0x93D3;
const COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR = 0x93D4;
const COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR = 0x93D5;
const COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR = 0x93D6;
const COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR = 0x93D7;
const COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR = 0x93D8;
const COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR = 0x93D9;
const COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR = 0x93DA;
const COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR = 0x93DB;
const COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR = 0x93DC;
const COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR = 0x93DD;
// bptc
const COMPRESSED_RGBA_BPTC_UNORM_EXT = 0x8E8C;
const COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT = 0x8E8D;
const COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT = 0x8E8E;
const COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT = 0x8E8F;
// rgtc
const COMPRESSED_RED_RGTC1_EXT = 0x8DBB;
const COMPRESSED_SIGNED_RED_RGTC1_EXT = 0x8DBC;
const COMPRESSED_RED_GREEN_RGTC2_EXT = 0x8DBD;
const COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT = 0x8DBE;

const formatInfo = {};
{
  // NOTE: this is named `numColorComponents` vs `numComponents` so we can let Uglify mangle
  // the name.
  const f = formatInfo;
  f[ALPHA]           = { numColorComponents: 1, };
  f[LUMINANCE]       = { numColorComponents: 1, };
  f[LUMINANCE_ALPHA] = { numColorComponents: 2, };
  f[RGB]             = { numColorComponents: 3, };
  f[RGBA]            = { numColorComponents: 4, };
  f[RED]             = { numColorComponents: 1, };
  f[RED_INTEGER]     = { numColorComponents: 1, };
  f[RG]              = { numColorComponents: 2, };
  f[RG_INTEGER]      = { numColorComponents: 2, };
  f[RGB]             = { numColorComponents: 3, };
  f[RGB_INTEGER]     = { numColorComponents: 3, };
  f[RGBA]            = { numColorComponents: 4, };
  f[RGBA_INTEGER]    = { numColorComponents: 4, };
  f[DEPTH_COMPONENT] = { numColorComponents: 1, };
  f[DEPTH_STENCIL]   = { numColorComponents: 2, };
}

/**
 * @typedef {Object} BlockInfo
 * @property {number} bytes number of bytes in the block
 * @property {number} width width of the block
 * @property {number} height height of the block
 * @private
 */

/**
 * @typedef {Object} TextureFormatDetails
 * @property {number} textureFormat format to pass texImage2D and similar functions.
 * @property {boolean} colorRenderable true if you can render to this format of texture.
 * @property {boolean} textureFilterable true if you can filter the texture, false if you can ony use `NEAREST`.
 * @property {number[]} type Array of possible types you can pass to texImage2D and similar function
 * @property {Object.<number,number>} [bytesPerElementMap] A map of types to bytes per element
 * @property {BlockInfo} [block] block size, only for compressed textures
 * @private
 */

let s_textureInternalFormatInfo;
function getTextureInternalFormatInfo(internalFormat) {
  if (!s_textureInternalFormatInfo) {
    // NOTE: these properties need unique names so we can let Uglify mangle the name.
    const t = {};
    // unsized formats
    t[ALPHA]              = { textureFormat: ALPHA,           colorRenderable: true,  textureFilterable: true,  bytesPerElement: [1, 2, 2, 4],        type: [UNSIGNED_BYTE, HALF_FLOAT, HALF_FLOAT_OES, FLOAT], };
    t[LUMINANCE]          = { textureFormat: LUMINANCE,       colorRenderable: true,  textureFilterable: true,  bytesPerElement: [1, 2, 2, 4],        type: [UNSIGNED_BYTE, HALF_FLOAT, HALF_FLOAT_OES, FLOAT], };
    t[LUMINANCE_ALPHA]    = { textureFormat: LUMINANCE_ALPHA, colorRenderable: true,  textureFilterable: true,  bytesPerElement: [2, 4, 4, 8],        type: [UNSIGNED_BYTE, HALF_FLOAT, HALF_FLOAT_OES, FLOAT], };
    t[RGB]                = { textureFormat: RGB,             colorRenderable: true,  textureFilterable: true,  bytesPerElement: [3, 6, 6, 12, 2],    type: [UNSIGNED_BYTE, HALF_FLOAT, HALF_FLOAT_OES, FLOAT, UNSIGNED_SHORT_5_6_5], };
    t[RGBA]               = { textureFormat: RGBA,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4, 8, 8, 16, 2, 2], type: [UNSIGNED_BYTE, HALF_FLOAT, HALF_FLOAT_OES, FLOAT, UNSIGNED_SHORT_4_4_4_4, UNSIGNED_SHORT_5_5_5_1], };
    t[DEPTH_COMPONENT]    = { textureFormat: DEPTH_COMPONENT, colorRenderable: true,  textureFilterable: false, bytesPerElement: [2, 4],              type: [UNSIGNED_INT, UNSIGNED_SHORT], };

    // sized formats
    t[R8]                 = { textureFormat: RED,             colorRenderable: true,  textureFilterable: true,  bytesPerElement: [1],        type: [UNSIGNED_BYTE], };
    t[R8_SNORM]           = { textureFormat: RED,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [1],        type: [BYTE], };
    t[R16F]               = { textureFormat: RED,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [4, 2],     type: [FLOAT, HALF_FLOAT], };
    t[R32F]               = { textureFormat: RED,             colorRenderable: false, textureFilterable: false, bytesPerElement: [4],        type: [FLOAT], };
    t[R8UI]               = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [1],        type: [UNSIGNED_BYTE], };
    t[R8I]                = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [1],        type: [BYTE], };
    t[R16UI]              = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [2],        type: [UNSIGNED_SHORT], };
    t[R16I]               = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [2],        type: [SHORT], };
    t[R32UI]              = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_INT], };
    t[R32I]               = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [INT], };
    t[RG8]                = { textureFormat: RG,              colorRenderable: true,  textureFilterable: true,  bytesPerElement: [2],        type: [UNSIGNED_BYTE], };
    t[RG8_SNORM]          = { textureFormat: RG,              colorRenderable: false, textureFilterable: true,  bytesPerElement: [2],        type: [BYTE], };
    t[RG16F]              = { textureFormat: RG,              colorRenderable: false, textureFilterable: true,  bytesPerElement: [8, 4],     type: [FLOAT, HALF_FLOAT], };
    t[RG32F]              = { textureFormat: RG,              colorRenderable: false, textureFilterable: false, bytesPerElement: [8],        type: [FLOAT], };
    t[RG8UI]              = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [2],        type: [UNSIGNED_BYTE], };
    t[RG8I]               = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [2],        type: [BYTE], };
    t[RG16UI]             = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_SHORT], };
    t[RG16I]              = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [SHORT], };
    t[RG32UI]             = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [8],        type: [UNSIGNED_INT], };
    t[RG32I]              = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [8],        type: [INT], };
    t[RGB8]               = { textureFormat: RGB,             colorRenderable: true,  textureFilterable: true,  bytesPerElement: [3],        type: [UNSIGNED_BYTE], };
    t[SRGB8]              = { textureFormat: RGB,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [3],        type: [UNSIGNED_BYTE], };
    t[RGB565]             = { textureFormat: RGB,             colorRenderable: true,  textureFilterable: true,  bytesPerElement: [3, 2],     type: [UNSIGNED_BYTE, UNSIGNED_SHORT_5_6_5], };
    t[RGB8_SNORM]         = { textureFormat: RGB,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [3],        type: [BYTE], };
    t[R11F_G11F_B10F]     = { textureFormat: RGB,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [12, 6, 4], type: [FLOAT, HALF_FLOAT, UNSIGNED_INT_10F_11F_11F_REV], };
    t[RGB9_E5]            = { textureFormat: RGB,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [12, 6, 4], type: [FLOAT, HALF_FLOAT, UNSIGNED_INT_5_9_9_9_REV], };
    t[RGB16F]             = { textureFormat: RGB,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [12, 6],    type: [FLOAT, HALF_FLOAT], };
    t[RGB32F]             = { textureFormat: RGB,             colorRenderable: false, textureFilterable: false, bytesPerElement: [12],       type: [FLOAT], };
    t[RGB8UI]             = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [3],        type: [UNSIGNED_BYTE], };
    t[RGB8I]              = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [3],        type: [BYTE], };
    t[RGB16UI]            = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [6],        type: [UNSIGNED_SHORT], };
    t[RGB16I]             = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [6],        type: [SHORT], };
    t[RGB32UI]            = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [12],       type: [UNSIGNED_INT], };
    t[RGB32I]             = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [12],       type: [INT], };
    t[RGBA8]              = { textureFormat: RGBA,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4],        type: [UNSIGNED_BYTE], };
    t[SRGB8_ALPHA8]       = { textureFormat: RGBA,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4],        type: [UNSIGNED_BYTE], };
    t[RGBA8_SNORM]        = { textureFormat: RGBA,            colorRenderable: false, textureFilterable: true,  bytesPerElement: [4],        type: [BYTE], };
    t[RGB5_A1]            = { textureFormat: RGBA,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4, 2, 4],  type: [UNSIGNED_BYTE, UNSIGNED_SHORT_5_5_5_1, UNSIGNED_INT_2_10_10_10_REV], };
    t[RGBA4]              = { textureFormat: RGBA,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4, 2],     type: [UNSIGNED_BYTE, UNSIGNED_SHORT_4_4_4_4], };
    t[RGB10_A2]           = { textureFormat: RGBA,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4],        type: [UNSIGNED_INT_2_10_10_10_REV], };
    t[RGBA16F]            = { textureFormat: RGBA,            colorRenderable: false, textureFilterable: true,  bytesPerElement: [16, 8],    type: [FLOAT, HALF_FLOAT], };
    t[RGBA32F]            = { textureFormat: RGBA,            colorRenderable: false, textureFilterable: false, bytesPerElement: [16],       type: [FLOAT], };
    t[RGBA8UI]            = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_BYTE], };
    t[RGBA8I]             = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [BYTE], };
    t[RGB10_A2UI]         = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_INT_2_10_10_10_REV], };
    t[RGBA16UI]           = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [8],        type: [UNSIGNED_SHORT], };
    t[RGBA16I]            = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [8],        type: [SHORT], };
    t[RGBA32I]            = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [16],       type: [INT], };
    t[RGBA32UI]           = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [16],       type: [UNSIGNED_INT], };
    // Sized Internal
    t[DEPTH_COMPONENT16]  = { textureFormat: DEPTH_COMPONENT, colorRenderable: true,  textureFilterable: false, bytesPerElement: [2, 4],     type: [UNSIGNED_SHORT, UNSIGNED_INT], };
    t[DEPTH_COMPONENT24]  = { textureFormat: DEPTH_COMPONENT, colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_INT], };
    t[DEPTH_COMPONENT32F] = { textureFormat: DEPTH_COMPONENT, colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [FLOAT], };
    t[DEPTH24_STENCIL8]   = { textureFormat: DEPTH_STENCIL,   colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_INT_24_8], };
    t[DEPTH32F_STENCIL8]  = { textureFormat: DEPTH_STENCIL,   colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [FLOAT_32_UNSIGNED_INT_24_8_REV], };

    Object.keys(t).forEach(function(internalFormat) {
      const info = t[internalFormat];
      info.bytesPerElementMap = {};
      info.bytesPerElement.forEach(function(bytesPerElement, ndx) {
        const type = info.type[ndx];
        info.bytesPerElementMap[type] = bytesPerElement;
      });
    });

    const block8_4_4 = { bytes:  8, width: 4, height: 4 };
    const block16_4_4 = { bytes: 16, width: 4, height: 4 };

    // compressed texture formats
    // s3tc:https://registry.khronos.org/OpenGL/extensions/EXT/EXT_texture_compression_s3tc.txt
    t[COMPRESSED_RGB_S3TC_DXT1_EXT]  = { textureFormat: COMPRESSED_RGB_S3TC_DXT1_EXT,  colorRenderable: false, textureFilterable: true, block: block8_4_4 };
    t[COMPRESSED_RGBA_S3TC_DXT1_EXT] = { textureFormat: COMPRESSED_RGBA_S3TC_DXT1_EXT, colorRenderable: false, textureFilterable: true, block: block8_4_4 };
    t[COMPRESSED_RGBA_S3TC_DXT3_EXT] = { textureFormat: COMPRESSED_RGBA_S3TC_DXT3_EXT, colorRenderable: false, textureFilterable: true, block: block16_4_4 };
    t[COMPRESSED_RGBA_S3TC_DXT5_EXT] = { textureFormat: COMPRESSED_RGBA_S3TC_DXT5_EXT, colorRenderable: false, textureFilterable: true, block: block16_4_4 };
    // https://registry.khronos.org/OpenGL/extensions/EXT/EXT_texture_compression_s3tc_srgb.txt
    t[COMPRESSED_SRGB_S3TC_DXT1_EXT]       = { textureFormat: COMPRESSED_SRGB_S3TC_DXT1_EXT,       colorRenderable: false, textureFilterable: true, block: block8_4_4 };
    t[COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT] = { textureFormat: COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT, colorRenderable: false, textureFilterable: true, block: block8_4_4 };
    t[COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT] = { textureFormat: COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT, colorRenderable: false, textureFilterable: true, block: block16_4_4 };
    t[COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT] = { textureFormat: COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT, colorRenderable: false, textureFilterable: true, block: block16_4_4 };
    // https://registry.khronos.org/OpenGL/extensions/OES/OES_compressed_ETC1_RGB8_texture.txt
    t[COMPRESSED_RGB_ETC1_WEBGL]                 = { textureFormat: COMPRESSED_RGB_ETC1_WEBGL,                 colorRenderable: false, textureFilterable: true, block: block8_4_4 };
    t[COMPRESSED_R11_EAC]                        = { textureFormat: COMPRESSED_R11_EAC,                        colorRenderable: false, textureFilterable: true, block: block8_4_4 };
    t[COMPRESSED_SIGNED_R11_EAC]                 = { textureFormat: COMPRESSED_SIGNED_R11_EAC,                 colorRenderable: false, textureFilterable: true, block: block8_4_4 };
    t[COMPRESSED_RG11_EAC]                       = { textureFormat: COMPRESSED_RG11_EAC,                       colorRenderable: false, textureFilterable: true, block: block16_4_4 };
    t[COMPRESSED_SIGNED_RG11_EAC]                = { textureFormat: COMPRESSED_SIGNED_RG11_EAC,                colorRenderable: false, textureFilterable: true, block: block16_4_4 };
    t[COMPRESSED_RGB8_ETC2]                      = { textureFormat: COMPRESSED_RGB8_ETC2,                      colorRenderable: false, textureFilterable: true, block: block8_4_4 };
    t[COMPRESSED_SRGB8_ETC2]                     = { textureFormat: COMPRESSED_SRGB8_ETC2,                     colorRenderable: false, textureFilterable: true, block: block8_4_4 };
    t[COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2]  = { textureFormat: COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2,  colorRenderable: false, textureFilterable: true, block: block8_4_4 };
    t[COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2] = { textureFormat: COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2, colorRenderable: false, textureFilterable: true, block: block8_4_4 };
    t[COMPRESSED_RGBA8_ETC2_EAC]                 = { textureFormat: COMPRESSED_RGBA8_ETC2_EAC,                 colorRenderable: false, textureFilterable: true, block: block16_4_4 };
    t[COMPRESSED_SRGB8_ALPHA8_ETC2_EAC]          = { textureFormat: COMPRESSED_SRGB8_ALPHA8_ETC2_EAC,          colorRenderable: false, textureFilterable: true, block: block16_4_4 };
    // https://registry.khronos.org/OpenGL/extensions/IMG/IMG_texture_compression_pvrtc.txt
    t[COMPRESSED_RGB_PVRTC_4BPPV1_IMG]  = { textureFormat: COMPRESSED_RGB_PVRTC_4BPPV1_IMG,  colorRenderable: false, textureFilterable: true, block: { bytes: 32, width:  8, height:  8, } };
    t[COMPRESSED_RGB_PVRTC_2BPPV1_IMG]  = { textureFormat: COMPRESSED_RGB_PVRTC_2BPPV1_IMG,  colorRenderable: false, textureFilterable: true, block: { bytes: 32, width: 16, height:  8, } };
    t[COMPRESSED_RGBA_PVRTC_4BPPV1_IMG] = { textureFormat: COMPRESSED_RGBA_PVRTC_4BPPV1_IMG, colorRenderable: false, textureFilterable: true, block: { bytes: 32, width:  8, height:  8, } };
    t[COMPRESSED_RGBA_PVRTC_2BPPV1_IMG] = { textureFormat: COMPRESSED_RGBA_PVRTC_2BPPV1_IMG, colorRenderable: false, textureFilterable: true, block: { bytes: 32, width: 16, height:  8, } };
    // https://registry.khronos.org/OpenGL/extensions/KHR/KHR_texture_compression_astc_hdr.txt
    t[COMPRESSED_RGBA_ASTC_4x4_KHR]           = { textureFormat: COMPRESSED_RGBA_ASTC_4x4_KHR,           colorRenderable: false, textureFilterable: true, block: { bytes: 16, width:  4, height:  4, } };
    t[COMPRESSED_RGBA_ASTC_5x4_KHR]           = { textureFormat: COMPRESSED_RGBA_ASTC_5x4_KHR,           colorRenderable: false, textureFilterable: true, block: { bytes: 16, width:  5, height:  4, } };
    t[COMPRESSED_RGBA_ASTC_5x5_KHR]           = { textureFormat: COMPRESSED_RGBA_ASTC_5x5_KHR,           colorRenderable: false, textureFilterable: true, block: { bytes: 16, width:  5, height:  5, } };
    t[COMPRESSED_RGBA_ASTC_6x5_KHR]           = { textureFormat: COMPRESSED_RGBA_ASTC_6x5_KHR,           colorRenderable: false, textureFilterable: true, block: { bytes: 16, width:  6, height:  5, } };
    t[COMPRESSED_RGBA_ASTC_6x6_KHR]           = { textureFormat: COMPRESSED_RGBA_ASTC_6x6_KHR,           colorRenderable: false, textureFilterable: true, block: { bytes: 16, width:  6, height:  6, } };
    t[COMPRESSED_RGBA_ASTC_8x5_KHR]           = { textureFormat: COMPRESSED_RGBA_ASTC_8x5_KHR,           colorRenderable: false, textureFilterable: true, block: { bytes: 16, width:  8, height:  5, } };
    t[COMPRESSED_RGBA_ASTC_8x6_KHR]           = { textureFormat: COMPRESSED_RGBA_ASTC_8x6_KHR,           colorRenderable: false, textureFilterable: true, block: { bytes: 16, width:  8, height:  6, } };
    t[COMPRESSED_RGBA_ASTC_8x8_KHR]           = { textureFormat: COMPRESSED_RGBA_ASTC_8x8_KHR,           colorRenderable: false, textureFilterable: true, block: { bytes: 16, width:  8, height:  8, } };
    t[COMPRESSED_RGBA_ASTC_10x5_KHR]          = { textureFormat: COMPRESSED_RGBA_ASTC_10x5_KHR,          colorRenderable: false, textureFilterable: true, block: { bytes: 16, width: 10, height:  5, } };
    t[COMPRESSED_RGBA_ASTC_10x6_KHR]          = { textureFormat: COMPRESSED_RGBA_ASTC_10x6_KHR,          colorRenderable: false, textureFilterable: true, block: { bytes: 16, width: 10, height:  6, } };
    t[COMPRESSED_RGBA_ASTC_10x8_KHR]          = { textureFormat: COMPRESSED_RGBA_ASTC_10x8_KHR,          colorRenderable: false, textureFilterable: true, block: { bytes: 16, width: 10, height:  8, } };
    t[COMPRESSED_RGBA_ASTC_10x10_KHR]         = { textureFormat: COMPRESSED_RGBA_ASTC_10x10_KHR,         colorRenderable: false, textureFilterable: true, block: { bytes: 16, width: 10, height: 10, } };
    t[COMPRESSED_RGBA_ASTC_12x10_KHR]         = { textureFormat: COMPRESSED_RGBA_ASTC_12x10_KHR,         colorRenderable: false, textureFilterable: true, block: { bytes: 16, width: 12, height: 10, } };
    t[COMPRESSED_RGBA_ASTC_12x12_KHR]         = { textureFormat: COMPRESSED_RGBA_ASTC_12x12_KHR,         colorRenderable: false, textureFilterable: true, block: { bytes: 16, width: 12, height: 12, } };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR]   = { textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR,   colorRenderable: false, textureFilterable: true, block: { bytes: 16, width:  4, height:  4, } };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR]   = { textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR,   colorRenderable: false, textureFilterable: true, block: { bytes: 16, width:  5, height:  4, } };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR]   = { textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR,   colorRenderable: false, textureFilterable: true, block: { bytes: 16, width:  5, height:  5, } };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR]   = { textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR,   colorRenderable: false, textureFilterable: true, block: { bytes: 16, width:  6, height:  5, } };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR]   = { textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR,   colorRenderable: false, textureFilterable: true, block: { bytes: 16, width:  6, height:  6, } };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR]   = { textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR,   colorRenderable: false, textureFilterable: true, block: { bytes: 16, width:  8, height:  5, } };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR]   = { textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR,   colorRenderable: false, textureFilterable: true, block: { bytes: 16, width:  8, height:  6, } };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR]   = { textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR,   colorRenderable: false, textureFilterable: true, block: { bytes: 16, width:  8, height:  8, } };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR]  = { textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR,  colorRenderable: false, textureFilterable: true, block: { bytes: 16, width: 10, height:  5, } };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR]  = { textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR,  colorRenderable: false, textureFilterable: true, block: { bytes: 16, width: 10, height:  6, } };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR]  = { textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR,  colorRenderable: false, textureFilterable: true, block: { bytes: 16, width: 10, height:  8, } };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR] = { textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR, colorRenderable: false, textureFilterable: true, block: { bytes: 16, width: 10, height: 10, } };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR] = { textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR, colorRenderable: false, textureFilterable: true, block: { bytes: 16, width: 12, height: 10, } };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR] = { textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR, colorRenderable: false, textureFilterable: true, block: { bytes: 16, width: 12, height: 12, } };
    // https://registry.khronos.org/OpenGL/extensions/EXT/EXT_texture_compression_bptc.txt
    t[COMPRESSED_RGBA_BPTC_UNORM_EXT]         = { textureFormat: COMPRESSED_RGBA_BPTC_UNORM_EXT,         colorRenderable: false, textureFilterable: true, block: block16_4_4 };
    t[COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT]   = { textureFormat: COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT,   colorRenderable: false, textureFilterable: true, block: block16_4_4 };
    t[COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT]   = { textureFormat: COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT,   colorRenderable: false, textureFilterable: true, block: block16_4_4 };
    t[COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT] = { textureFormat: COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT, colorRenderable: false, textureFilterable: true, block: block16_4_4 };
    // https://registry.khronos.org/OpenGL/extensions/EXT/EXT_texture_compression_rgtc.txt
    t[COMPRESSED_RED_RGTC1_EXT]              = { textureFormat: COMPRESSED_RED_RGTC1_EXT,              colorRenderable: false, textureFilterable: true, block: block8_4_4 };
    t[COMPRESSED_SIGNED_RED_RGTC1_EXT]       = { textureFormat: COMPRESSED_SIGNED_RED_RGTC1_EXT,       colorRenderable: false, textureFilterable: true, block: block8_4_4 };
    t[COMPRESSED_RED_GREEN_RGTC2_EXT]        = { textureFormat: COMPRESSED_RED_GREEN_RGTC2_EXT,        colorRenderable: false, textureFilterable: true, block: block8_4_4 };
    t[COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT] = { textureFormat: COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT, colorRenderable: false, textureFilterable: true, block: block8_4_4 };

    s_textureInternalFormatInfo = t;
  }
  const info = s_textureInternalFormatInfo[internalFormat];
  if (!info) {
    throw new Error("unknown internal format");
  }
  return info;
}

/**
 * Gets the number of bytes per element for a given internalFormat / type
 * @param {number} internalFormat The internalFormat parameter from texImage2D etc..
 * @param {number} type The type parameter for texImage2D etc..
 * @return {number} the number of bytes per element for the given internalFormat, type combo
 * @memberOf module:twgl/textures
 */
function getBytesPerElementForInternalFormat(internalFormat, type) {
  const info = getTextureInternalFormatInfo(internalFormat);
  const bytesPerElement = info.bytesPerElementMap[type];
  if (bytesPerElement === undefined) {
    throw new Error("type not supported for internal format");
  }
  return bytesPerElement;
}

/**
 * Info related to a specific texture internalFormat as returned
 * from {@link module:twgl/textures.getFormatAndTypeForInternalFormat}.
 *
 * @typedef {Object} TextureFormatInfo
 * @property {number} format Format to pass to texImage2D and related functions
 * @property {number} type Type to pass to texImage2D and related functions
 * @memberOf module:twgl/textures
 */

/**
 * Gets the format and type for a given internalFormat
 *
 * @param {number} internalFormat The internal format
 * @return {module:twgl/textures.TextureFormatInfo} the corresponding format and type,
 * @memberOf module:twgl/textures
 */
function getFormatAndTypeForInternalFormat(internalFormat) {
  const info = getTextureInternalFormatInfo(internalFormat);
  if (!info) {
    throw new Error("unknown internal format");
  }
  return {
    format: info.textureFormat,
    type: info.type?.[0] ?? UNSIGNED_BYTE,
  };
}

/**
 * @param {number} internalFormat The internal format
 * @returns if the internalFormat is a compressed format
 * @private
 */
function isCompressedInternalFormat(internalFormat) {
  const info = getTextureInternalFormatInfo(internalFormat);
  return !!info.block;
}

/**
 * Gets the width, height, and bytes per block for the given internal format
 * @param {number} internalFormat
 * @param {number} type
 * @private
 */
function getBlockInfoForInternalFormat(internalFormat, type) {
  const info = getTextureInternalFormatInfo(internalFormat);
  if (info.block) {
    return { blockWidth: info.block.width, blockHeight: info.block.height, bytesPerBlock: info.block.bytes };
  }
  const bytesPerBlock = getBytesPerElementForInternalFormat(internalFormat, type);
  return { blockWidth: 1, blockHeight: 1, bytesPerBlock };
}

/**
 * Returns true if value is power of 2
 * @param {number} value number to check.
 * @return true if value is power of 2
 * @private
 */
function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

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
function canGenerateMipmap(gl, width, height, internalFormat) {
  if (!utils.isWebGL2(gl)) {
    return isPowerOf2(width) && isPowerOf2(height);
  }
  const info = getTextureInternalFormatInfo(internalFormat);
  return info.colorRenderable && info.textureFilterable;
}

/**
 * Gets whether or not we can generate mips for the given format
 * @param {number} internalFormat The internalFormat parameter from texImage2D etc..
 * @return {boolean} true if we can generate mips
 * @memberOf module:twgl/textures
 */
function canFilter(internalFormat) {
  const info = getTextureInternalFormatInfo(internalFormat);
  return info.textureFilterable;
}

/**
 * Gets the number of components for a given image format.
 * @param {number} format the format.
 * @return {number} the number of components for the format.
 * @memberOf module:twgl/textures
 */
function getNumComponentsForFormat(format) {
  const info = formatInfo[format];
  return info.numColorComponents;
}

/**
 * Gets the texture type for a given array type.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @return {number} the gl texture type
 * @private
 */
function getTextureTypeForArrayType(gl, src, defaultType) {
  if (isArrayBuffer(src)) {
    return typedArrays.getGLTypeForTypedArray(src);
  }
  return defaultType || UNSIGNED_BYTE;
}

function guessDimensions(gl, target, width, height, numElements) {
  if (numElements % 1 !== 0) {
    throw new Error("can't guess dimensions");
  }
  if (!width && !height) {
    const size = Math.sqrt(numElements / (target === TEXTURE_CUBE_MAP ? 6 : 1));
    if (size % 1 === 0) {
      width = size;
      height = size;
    } else {
      width = numElements;
      height = 1;
    }
  } else if (!height) {
    height = numElements / width;
    if (height % 1) {
      throw new Error("can't guess dimensions");
    }
  } else if (!width) {
    width = numElements / height;
    if (width % 1) {
      throw new Error("can't guess dimensions");
    }
  }
  return {
    width: width,
    height: height,
  };
}

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
 * @deprecated see {@link module:twgl.setDefaults}
 * @memberOf module:twgl/textures
 */
function setDefaultTextureColor(color) {
  defaults.textureColor = new Uint8Array([color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255]);
}

function setDefaults(newDefaults) {
  helper.copyExistingProperties(newDefaults, defaults);
  if (newDefaults.textureColor) {
    setDefaultTextureColor(newDefaults.textureColor);
  }
}

/**
 * A function to generate the source for a texture.
 * @callback TextureFunc
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {module:twgl.TextureOptions} options the texture options
 * @return {*} Returns any of the things documented for `src` for {@link module:twgl.TextureOptions}.
 * @memberOf module:twgl
 */

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
 * @property {number} [depth] the depth of a texture. Only used if src is an array or typed array or null and target is `TEXTURE_3D` .
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
 * @property {(number[]|ArrayBufferView|TexImageSource|TexImageSource[]|string|string[]|module:twgl.TextureFunc)} [src] source for texture
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
 *    If `number[]` or `ArrayBufferView` it's assumed to be data for a texture.
 *
 *    *  If `width` or `height` is not specified it is guessed as follows.
 *
 *       First the number of elements is computed by `src.length / numComponents`
 *       where `numComponents` is derived from `format`. If `target` is `gl.TEXTURE_CUBE_MAP` then `numElements` is divided
 *       by 6. Then
 *
 *       *   If neither `width` nor `height` are specified and `sqrt(numElements)` is an integer then width and height
 *           are set to `sqrt(numElements)`. Otherwise `width = numElements` and `height = 1`.
 *
 *       *   If only one of `width` or `height` is specified then the other equals `numElements / specifiedDimension`.
 *
 *    * If both `width` and `height` is specified, then, the size of mip levels from `level` will be computed
 *      and data for consecutive mip levels will be uploaded until the data runs out.
 *
 *      In other words: `{ format: g.RGBA, width: 4, height: 4, src: Uint8Array((4 * 4 + 2 * 2 + 1) * 4) }`
 *      uploads 3 mip levels (4x4, 2x2, 1x1) because src is more than the data for the first mip level.
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
 *    default: undefined. Also see {@link module:twgl.setDefaults}.
 *
 * @memberOf module:twgl
 */

/**
 * Saves the current packing state, sets the packing state as specified
 * then calls a function, after which the packing state will be restored.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @param {function():void} [fn] A function to call, after which the packing state will be restored.
 * @private
 */
function scopedSetPackState(gl, options, fn) {
  let colorspaceConversion;
  let premultiplyAlpha;
  let flipY;

  if (options.colorspaceConversion !== undefined) {
    colorspaceConversion = gl.getParameter(UNPACK_COLORSPACE_CONVERSION_WEBGL);
    gl.pixelStorei(UNPACK_COLORSPACE_CONVERSION_WEBGL, options.colorspaceConversion);
  }
  if (options.premultiplyAlpha !== undefined) {
    premultiplyAlpha = gl.getParameter(UNPACK_PREMULTIPLY_ALPHA_WEBGL);
    gl.pixelStorei(UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.premultiplyAlpha);
  }
  if (options.flipY !== undefined) {
    flipY = gl.getParameter(UNPACK_FLIP_Y_WEBGL);
    gl.pixelStorei(UNPACK_FLIP_Y_WEBGL, options.flipY);
  }

  fn();

  if (colorspaceConversion !== undefined) {
    gl.pixelStorei(UNPACK_COLORSPACE_CONVERSION_WEBGL, colorspaceConversion);
  }
  if (premultiplyAlpha !== undefined) {
    gl.pixelStorei(UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiplyAlpha);
  }
  if (flipY !== undefined) {
    gl.pixelStorei(UNPACK_FLIP_Y_WEBGL, flipY);
  }
}

/**
 * returns the property if set or the corresponding state if undefined
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} options
 * @param {string} property the name of the property to copy
 * @param {number} pname
 * @return {module:twgl.TextureOptions}
 */
function getPackStateOption(gl, options, property, pname) {
  const v = options[property];
  return {
    [property]: v === undefined ? gl.getParameter(pname) : v,
  };
}

/**
 * Copy the options object and apply pack state
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} options
 * @return {module:twgl.TextureOptions}
 */
function copyOptionsAndApplyPackState(gl, options) {
  return {
    ...options,
    ...getPackStateOption(gl, options, 'flipY', UNPACK_FLIP_Y_WEBGL),
    ...getPackStateOption(gl, options, 'premultiplyAlpha', UNPACK_PREMULTIPLY_ALPHA_WEBGL),
    ...getPackStateOption(gl, options, 'colorspaceConversion', UNPACK_COLORSPACE_CONVERSION_WEBGL),
  };
}

/**
 * Set skip state to defaults
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @private
 */
function setSkipStateToDefault(gl) {
  gl.pixelStorei(UNPACK_ALIGNMENT, 4);
  if (utils.isWebGL2(gl)) {
    gl.pixelStorei(UNPACK_ROW_LENGTH, 0);
    gl.pixelStorei(UNPACK_IMAGE_HEIGHT, 0);
    gl.pixelStorei(UNPACK_SKIP_PIXELS, 0);
    gl.pixelStorei(UNPACK_SKIP_ROWS, 0);
    gl.pixelStorei(UNPACK_SKIP_IMAGES, 0);
  }
}

/**
 * Sets the parameters of a texture or sampler
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {number|WebGLSampler} target texture target or sampler
 * @param {function()} parameteriFn texParameteri or samplerParameteri fn
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @private
 */
function setTextureSamplerParameters(gl, target, parameteriFn, options) {
  if (options.minMag) {
    parameteriFn.call(gl, target, TEXTURE_MIN_FILTER, options.minMag);
    parameteriFn.call(gl, target, TEXTURE_MAG_FILTER, options.minMag);
  }
  if (options.min) {
    parameteriFn.call(gl, target, TEXTURE_MIN_FILTER, options.min);
  }
  if (options.mag) {
    parameteriFn.call(gl, target, TEXTURE_MAG_FILTER, options.mag);
  }
  if (options.wrap) {
    parameteriFn.call(gl, target, TEXTURE_WRAP_S, options.wrap);
    parameteriFn.call(gl, target, TEXTURE_WRAP_T, options.wrap);
    if (target === TEXTURE_3D || helper.isSampler(gl, target)) {
      parameteriFn.call(gl, target, TEXTURE_WRAP_R, options.wrap);
    }
  }
  if (options.wrapR) {
    parameteriFn.call(gl, target, TEXTURE_WRAP_R, options.wrapR);
  }
  if (options.wrapS) {
    parameteriFn.call(gl, target, TEXTURE_WRAP_S, options.wrapS);
  }
  if (options.wrapT) {
    parameteriFn.call(gl, target, TEXTURE_WRAP_T, options.wrapT);
  }
  if (options.minLod !== undefined) {
    parameteriFn.call(gl, target, TEXTURE_MIN_LOD, options.minLod);
  }
  if (options.maxLod !== undefined) {
    parameteriFn.call(gl, target, TEXTURE_MAX_LOD, options.maxLod);
  }
  if (options.baseLevel !== undefined) {
    parameteriFn.call(gl, target, TEXTURE_BASE_LEVEL, options.baseLevel);
  }
  if (options.maxLevel !== undefined) {
    parameteriFn.call(gl, target, TEXTURE_MAX_LEVEL, options.maxLevel);
  }
  if (options.compareFunc !== undefined) {
    parameteriFn.call(gl, target, TEXTURE_COMPARE_FUNC, options.compareFunc);
  }
  if (options.compareMode !== undefined) {
    parameteriFn.call(gl, target, TEXTURE_COMPARE_MODE, options.compareMode);
  }
}

/**
 * Sets the texture parameters of a texture.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @memberOf module:twgl/textures
 */
function setTextureParameters(gl, tex, options) {
  const target = options.target || TEXTURE_2D;
  gl.bindTexture(target, tex);
  setTextureSamplerParameters(gl, target, gl.texParameteri, options);
}

/**
 * Sets the sampler parameters of a sampler.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLSampler} sampler the WebGLSampler to set parameters for
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @memberOf module:twgl/textures
 */
function setSamplerParameters(gl, sampler, options) {
  setTextureSamplerParameters(gl, sampler, gl.samplerParameteri, options);
}

/**
 * Creates a new sampler object and sets parameters.
 *
 * Example:
 *
 *      const sampler = twgl.createSampler(gl, {
 *        minMag: gl.NEAREST,         // sets both TEXTURE_MIN_FILTER and TEXTURE_MAG_FILTER
 *        wrap: gl.CLAMP_TO_NEAREST,  // sets both TEXTURE_WRAP_S and TEXTURE_WRAP_T and TEXTURE_WRAP_R
 *      });
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {Object.<string,module:twgl.TextureOptions>} options A object of TextureOptions one per sampler.
 * @return {Object.<string,WebGLSampler>} the created samplers by name
 * @private
 */
function createSampler(gl, options) {
  const sampler = gl.createSampler();
  setSamplerParameters(gl, sampler, options);
  return sampler;
}

/**
 * Creates a multiple sampler objects and sets parameters on each.
 *
 * Example:
 *
 *      const samplers = twgl.createSamplers(gl, {
 *        nearest: {
 *          minMag: gl.NEAREST,
 *        },
 *        nearestClampS: {
 *          minMag: gl.NEAREST,
 *          wrapS: gl.CLAMP_TO_NEAREST,
 *        },
 *        linear: {
 *          minMag: gl.LINEAR,
 *        },
 *        nearestClamp: {
 *          minMag: gl.NEAREST,
 *          wrap: gl.CLAMP_TO_EDGE,
 *        },
 *        linearClamp: {
 *          minMag: gl.LINEAR,
 *          wrap: gl.CLAMP_TO_EDGE,
 *        },
 *        linearClampT: {
 *          minMag: gl.LINEAR,
 *          wrapT: gl.CLAMP_TO_EDGE,
 *        },
 *      });
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set on the sampler
 * @private
 */
function createSamplers(gl, samplerOptions) {
  const samplers = {};
  Object.keys(samplerOptions).forEach(function(name) {
    samplers[name] = createSampler(gl, samplerOptions[name]);
  });
  return samplers;
}

/**
 * Makes a 1x1 pixel
 * If no color is passed in uses the default color which can be set by calling `setDefaultTextureColor`.
 * @param {(number[]|ArrayBufferView)} [color] The color using 0-1 values
 * @return {Uint8Array} Unit8Array with color.
 * @private
 */
function make1Pixel(color) {
  color = color || defaults.textureColor;
  if (isArrayBuffer(color)) {
    return color;
  }
  return new Uint8Array([color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255]);
}

/**
 * @typedef {Object} SetTextureFilteringInternalOptions
 * @property {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @property {number} [width] width of texture
 * @property {number} [height] height of texture
 * @property {number} [internalFormat] The internalFormat parameter from texImage2D etc..
 * @property {number} [lastMipLevelUploaded] The last mip level manually uploaded
 * @private
 */

/**
 * Sets filtering or generates mips for texture based on width or height
 * If width or height is not passed in uses `options.width` and//or `options.height`
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {SetTextureFilteringInternalOptions} p
 * @private
 */
function setTextureFilteringForSizeInternal(gl, tex, {options, width, height, internalFormat, lastMipLevelUploaded }) {
  options = options || defaults.textureOptions;
  internalFormat = internalFormat || RGBA;
  const target = options.target || TEXTURE_2D;
  width = width || options.width;
  height = height || options.height;
  gl.bindTexture(target, tex);
  if (lastMipLevelUploaded > 1) {
    const lastLevelWidth = Math.max(1, width >> lastMipLevelUploaded);
    const lastLevelHeight = Math.max(1, height >> lastMipLevelUploaded);
    // Note: This is a guess. The user can set maxLod etc...
    const canUseMips = lastLevelWidth === 1 && lastLevelHeight === 1;
    const magFiltering = canFilter(internalFormat) ? LINEAR : NEAREST;
    const minFiltering = canFilter(internalFormat)
      ? canUseMips
      ? NEAREST_MIPMAP_LINEAR
      : LINEAR
      : NEAREST;
    gl.texParameteri(target, TEXTURE_MAG_FILTER, magFiltering);
    gl.texParameteri(target, TEXTURE_MIN_FILTER, minFiltering);
  } else if (canGenerateMipmap(gl, width, height, internalFormat)) {
    gl.generateMipmap(target);
  } else {
    const filtering = canFilter(internalFormat) ? LINEAR : NEAREST;
    gl.texParameteri(target, TEXTURE_MIN_FILTER, filtering);
    gl.texParameteri(target, TEXTURE_MAG_FILTER, filtering);
    gl.texParameteri(target, TEXTURE_WRAP_S, CLAMP_TO_EDGE);
    gl.texParameteri(target, TEXTURE_WRAP_T, CLAMP_TO_EDGE);
  }
}

/**
 * Sets filtering or generates mips for texture based on width or height
 * If width or height is not passed in uses `options.width` and//or `options.height`
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @param {number} [width] width of texture
 * @param {number} [height] height of texture
 * @param {number} [internalFormat] The internalFormat parameter from texImage2D etc..
 * @memberOf module:twgl/textures
 */
function setTextureFilteringForSize(gl, tex, options, width, height, internalFormat) {
  setTextureFilteringForSizeInternal(gl, tex, { options, width, height, internalFormat });
}

function shouldAutomaticallySetTextureFilteringForSize(options) {
  return options.auto === true || (options.auto === undefined && options.level === undefined);
}

/**
 * Gets an array of cubemap face enums
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @return {number[]} cubemap face enums
 * @private
 */
function getCubeFaceOrder(gl, options) {
  options = options || {};
  return options.cubeFaceOrder || [
      TEXTURE_CUBE_MAP_POSITIVE_X,
      TEXTURE_CUBE_MAP_NEGATIVE_X,
      TEXTURE_CUBE_MAP_POSITIVE_Y,
      TEXTURE_CUBE_MAP_NEGATIVE_Y,
      TEXTURE_CUBE_MAP_POSITIVE_Z,
      TEXTURE_CUBE_MAP_NEGATIVE_Z,
    ];
}

/**
 * @typedef {Object} FaceInfo
 * @property {number} face gl enum for texImage2D
 * @property {number} ndx face index (0 - 5) into source data
 * @ignore
 */

/**
 * Gets an array of FaceInfos
 * There's a bug in some NVidia drivers that will crash the driver if
 * `gl.TEXTURE_CUBE_MAP_POSITIVE_X` is not uploaded first. So, we take
 * the user's desired order from his faces to WebGL and make sure we
 * do the faces in WebGL order
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @return {FaceInfo[]} cubemap face infos. Arguably the `face` property of each element is redundant but
 *    it's needed internally to sort the array of `ndx` properties by `face`.
 * @private
 */
function getCubeFacesWithNdx(gl, options) {
  const faces = getCubeFaceOrder(gl, options);
  // work around bug in NVidia drivers. We have to upload the first face first else the driver crashes :(
  const facesWithNdx = faces.map(function(face, ndx) {
    return { face: face, ndx: ndx };
  });
  facesWithNdx.sort(function(a, b) {
    return a.face - b.face;
  });
  return facesWithNdx;
}

/**
 * Set a texture from the contents of an element. Will also set
 * texture filtering or generate mips based on the dimensions of the element
 * unless `options.auto === false`. If `target === gl.TEXTURE_CUBE_MAP` will
 * attempt to slice image into 1x6, 2x3, 3x2, or 6x1 images, one for each face.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {HTMLElement} element a canvas, img, or video element.
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @memberOf module:twgl/textures
 * @kind function
 */
function setTextureFromElement(gl, tex, element, options) {
  options = options || defaults.textureOptions;
  const target = options.target || TEXTURE_2D;
  const level = options.level || 0;
  let width = element.width;
  let height = element.height;
  const internalFormat = options.internalFormat || options.format || RGBA;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  const type = options.type || formatType.type;
  gl.bindTexture(target, tex);
  if (target === TEXTURE_CUBE_MAP) {
    // guess the parts
    const imgWidth  = element.width;
    const imgHeight = element.height;
    let size;
    let slices;
    if (imgWidth / 6 === imgHeight) {
      // It's 6x1
      size = imgHeight;
      slices = [0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0];
    } else if (imgHeight / 6 === imgWidth) {
      // It's 1x6
      size = imgWidth;
      slices = [0, 0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5];
    } else if (imgWidth / 3 === imgHeight / 2) {
      // It's 3x2
      size = imgWidth / 3;
      slices = [0, 0, 1, 0, 2, 0, 0, 1, 1, 1, 2, 1];
    } else if (imgWidth / 2 === imgHeight / 3) {
      // It's 2x3
      size = imgWidth / 2;
      slices = [0, 0, 1, 0, 0, 1, 1, 1, 0, 2, 1, 2];
    } else {
      throw new Error(`can't figure out cube map from element: ${element.src ? element.src : element.nodeName}`);
    }
    const ctx = getShared2DContext();
    if (ctx) {
      ctx.canvas.width = size;
      ctx.canvas.height = size;
      width = size;
      height = size;
      scopedSetPackState(gl, options, () => {
        getCubeFacesWithNdx(gl, options).forEach(function(f) {
          const xOffset = slices[f.ndx * 2 + 0] * size;
          const yOffset = slices[f.ndx * 2 + 1] * size;
          ctx.drawImage(element, xOffset, yOffset, size, size, 0, 0, size, size);
          gl.texImage2D(f.face, level, internalFormat, format, type, ctx.canvas);
        });
        // Free up the canvas memory
        ctx.canvas.width = 1;
        ctx.canvas.height = 1;
      });
    } else if (typeof createImageBitmap !== 'undefined') {
      // NOTE: It seems like we should prefer ImageBitmap because unlike canvas it's
      // note lossy? (alpha is not premultiplied? although I'm not sure what
      width = size;
      height = size;
      getCubeFacesWithNdx(gl, options).forEach(function(f) {
        const xOffset = slices[f.ndx * 2 + 0] * size;
        const yOffset = slices[f.ndx * 2 + 1] * size;
        // We can't easily use a default texture color here as it would have to match
        // the type across all faces where as with a 2D one there's only one face
        // so we're replacing everything all at once. It also has to be the correct size.
        // On the other hand we need all faces to be the same size so as one face loads
        // the rest match else the texture will be un-renderable.
        gl.texImage2D(f.face, level, internalFormat, size, size, 0, format, type, null);
        createImageBitmap(element, xOffset, yOffset, size, size, {
          premultiplyAlpha: 'none',
          colorSpaceConversion: 'none',
        })
        .then(function(imageBitmap) {
          scopedSetPackState(gl, options, () => {
            gl.bindTexture(target, tex);
            gl.texImage2D(f.face, level, internalFormat, format, type, imageBitmap);
            if (shouldAutomaticallySetTextureFilteringForSize(options)) {
              setTextureFilteringForSize(gl, tex, options, width, height, internalFormat);
            }
          });
        });
      });
    }
  } else if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
    scopedSetPackState(gl, options, () => {
      const smallest = Math.min(element.width, element.height);
      const largest = Math.max(element.width, element.height);
      const depth = largest / smallest;
      if (depth % 1 !== 0) {
        throw new Error("can not compute 3D dimensions of element");
      }
      const xMult = element.width  === largest ? 1 : 0;
      const yMult = element.height === largest ? 1 : 0;
      gl.pixelStorei(UNPACK_ALIGNMENT, 1);
      gl.pixelStorei(UNPACK_ROW_LENGTH, element.width);
      gl.pixelStorei(UNPACK_IMAGE_HEIGHT, 0);
      gl.pixelStorei(UNPACK_SKIP_IMAGES, 0);
      gl.texImage3D(target, level, internalFormat, smallest, smallest, smallest, 0, format, type, null);
      for (let d = 0; d < depth; ++d) {
        const srcX = d * smallest * xMult;
        const srcY = d * smallest * yMult;
        gl.pixelStorei(UNPACK_SKIP_PIXELS, srcX);
        gl.pixelStorei(UNPACK_SKIP_ROWS, srcY);
        gl.texSubImage3D(target, level, 0, 0, d, smallest, smallest, 1, format, type, element);
      }
      setSkipStateToDefault(gl);
    });
  } else {
    scopedSetPackState(gl, options, () => {
      gl.texImage2D(target, level, internalFormat, format, type, element);
    });
  }
  if (shouldAutomaticallySetTextureFilteringForSize(options)) {
    setTextureFilteringForSize(gl, tex, options, width, height, internalFormat);
  }
  setTextureParameters(gl, tex, options);
}

function noop() {
}

/**
 * Checks whether the url's origin is the same so that we can set the `crossOrigin`
 * @param {string} url url to image
 * @returns {boolean} true if the window's origin is the same as image's url
 * @private
 */
function urlIsSameOrigin(url) {
  if (typeof document !== 'undefined') {
    // for IE really
    const a = document.createElement('a');
    a.href = url;
    return a.hostname === location.hostname &&
           a.port     === location.port &&
           a.protocol === location.protocol;
  } else {
    const localOrigin = (new URL(location.href)).origin;
    const urlOrigin = (new URL(url, location.href)).origin;
    return urlOrigin === localOrigin;
  }
}

function setToAnonymousIfUndefinedAndURLIsNotSameOrigin(url, crossOrigin) {
  return crossOrigin === undefined && !urlIsSameOrigin(url)
     ? 'anonymous'
     : crossOrigin;
}

/**
 * Loads an image
 * @param {string} url url to image
 * @param {string} crossOrigin
 * @param {function(err, img)} [callback] a callback that's passed an error and the image. The error will be non-null
 *     if there was an error
 * @return {HTMLImageElement} the image being loaded.
 * @private
 */
function loadImage(url, crossOrigin, callback) {
  callback = callback || noop;
  let img;
  crossOrigin = crossOrigin !== undefined ? crossOrigin : defaults.crossOrigin;
  crossOrigin = setToAnonymousIfUndefinedAndURLIsNotSameOrigin(url, crossOrigin);
  if (typeof Image !== 'undefined') {
    img = new Image();
    if (crossOrigin !== undefined) {
      img.crossOrigin = crossOrigin;
    }

    const clearEventHandlers = function clearEventHandlers() {
      img.removeEventListener('error', onError);  // eslint-disable-line
      img.removeEventListener('load', onLoad);  // eslint-disable-line
      img = null;
    };

    const onError = function onError() {
      const msg = "couldn't load image: " + url;
      helper.error(msg);
      callback(msg, img);
      clearEventHandlers();
    };

    const onLoad = function onLoad() {
      callback(null, img);
      clearEventHandlers();
    };

    img.addEventListener('error', onError);
    img.addEventListener('load', onLoad);
    img.src = url;
    return img;
  } else if (typeof ImageBitmap !== 'undefined') {
    let err;
    let bm;
    const cb = function cb() {
      callback(err, bm);
    };

    const options = {};
    if (crossOrigin) {
      options.mode = 'cors'; // TODO: not sure how to translate image.crossOrigin
    }
    fetch(url, options).then(function(response) {
      if (!response.ok) {
        throw response;
      }
      return response.blob();
    }).then(function(blob) {
      return createImageBitmap(blob, {
        premultiplyAlpha: 'none',
        colorSpaceConversion: 'none',
      });
    }).then(function(bitmap) {
      // not sure if this works. We don't want
      // to catch the user's error. So, call
      // the callback in a timeout so we're
      // not in this scope inside the promise.
      bm = bitmap;
      setTimeout(cb);
    }).catch(function(e) {
      err = e;
      setTimeout(cb);
    });
    img = null;
  }
  return img;
}

/**
 * check if object is a TexImageSource
 *
 * @param {Object} obj Object to test
 * @return {boolean} true if object is a TexImageSource
 * @private
 */
function isTexImageSource(obj) {
  return (typeof ImageBitmap !== 'undefined' && obj instanceof ImageBitmap) ||
         (typeof ImageData !== 'undefined'  && obj instanceof ImageData) ||
         (typeof HTMLElement !== 'undefined'  && obj instanceof HTMLElement);
}

/**
 * if obj is an TexImageSource then just
 * uses it otherwise if obj is a string
 * then load it first.
 *
 * @param {string|TexImageSource} obj
 * @param {string} crossOrigin
 * @param {function(err, img)} [callback] a callback that's passed an error and the image. The error will be non-null
 *     if there was an error
 * @private
 */
function loadAndUseImage(obj, crossOrigin, callback) {
  if (isTexImageSource(obj)) {
    setTimeout(function() {
      callback(null, obj);
    });
    return obj;
  }

  return loadImage(obj, crossOrigin, callback);
}

/**
 * Sets a texture to a 1x1 pixel color. If `options.color === false` is nothing happens. If it's not set
 * the default texture color is used which can be set by calling `setDefaultTextureColor`.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @memberOf module:twgl/textures
 * @private
 */
function setTextureTo1PixelColor(gl, tex, options) {
  options = options || defaults.textureOptions;
  const target = options.target || TEXTURE_2D;
  gl.bindTexture(target, tex);
  if (options.color === false) {
    return;
  }
  // Assume it's a URL
  // Put 1x1 pixels in texture. That makes it renderable immediately regardless of filtering.
  const color = make1Pixel(options.color);
  if (target === TEXTURE_CUBE_MAP) {
    for (let ii = 0; ii < 6; ++ii) {
      gl.texImage2D(TEXTURE_CUBE_MAP_POSITIVE_X + ii, 0, RGBA, 1, 1, 0, RGBA, UNSIGNED_BYTE, color);
    }
  } else if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
    gl.texImage3D(target, 0, RGBA, 1, 1, 1, 0, RGBA, UNSIGNED_BYTE, color);
  } else {
    gl.texImage2D(target, 0, RGBA, 1, 1, 0, RGBA, UNSIGNED_BYTE, color);
  }
}

/**
 * The src image(s) used to create a texture.
 *
 * When you call {@link module:twgl.createTexture} or {@link module:twgl.createTextures}
 * you can pass in urls for images to load into the textures. If it's a single url
 * then this will be a single HTMLImageElement. If it's an array of urls used for a cubemap
 * this will be a corresponding array of images for the cubemap.
 *
 * @typedef {HTMLImageElement|HTMLImageElement[]} TextureSrc
 * @memberOf module:twgl
 */

/**
 * A callback for when an image finished downloading and been uploaded into a texture
 * @callback TextureReadyCallback
 * @param {*} err If truthy there was an error.
 * @param {WebGLTexture} texture the texture.
 * @param {module:twgl.TextureSrc} source image(s) used to as the src for the texture
 * @memberOf module:twgl
 */

/**
 * A callback for when all images have finished downloading and been uploaded into their respective textures
 * @callback TexturesReadyCallback
 * @param {*} err If truthy there was an error.
 * @param {Object.<string, WebGLTexture>} textures the created textures by name. Same as returned by {@link module:twgl.createTextures}.
 * @param {Object.<string, module:twgl.TextureSrc>} sources the image(s) used for the texture by name.
 * @memberOf module:twgl
 */

/**
 * A callback for when an image finished downloading and been uploaded into a texture
 * @callback CubemapReadyCallback
 * @param {*} err If truthy there was an error.
 * @param {WebGLTexture} tex the texture.
 * @param {HTMLImageElement[]} imgs the images for each face.
 * @memberOf module:twgl
 */

/**
 * A callback for when an image finished downloading and been uploaded into a texture
 * @callback ThreeDReadyCallback
 * @param {*} err If truthy there was an error.
 * @param {WebGLTexture} tex the texture.
 * @param {HTMLImageElement[]} imgs the images for each slice.
 * @memberOf module:twgl
 */

/**
 * Loads a texture from an image from a Url as specified in `options.src`
 * If `options.color !== false` will set the texture to a 1x1 pixel color so that the texture is
 * immediately useable. It will be updated with the contents of the image once the image has finished
 * downloading. Filtering options will be set as appropriate for image unless `options.auto === false`.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 * @param {module:twgl.TextureReadyCallback} [callback] A function to be called when the image has finished loading. err will
 *    be non null if there was an error.
 * @return {HTMLImageElement} the image being downloaded.
 * @memberOf module:twgl/textures
 */
function loadTextureFromUrl(gl, tex, options, callback) {
  callback = callback || noop;
  options = options || defaults.textureOptions;
  setTextureTo1PixelColor(gl, tex, options);
  // Because it's async we need to copy the options.
  options = copyOptionsAndApplyPackState(gl, options);
  const img = loadAndUseImage(options.src, options.crossOrigin, function(err, img) {
    if (err) {
      callback(err, tex, img);
    } else {
      setTextureFromElement(gl, tex, img, options);
      callback(null, tex, img);
    }
  });
  return img;
}

/**
 * Loads a cubemap from 6 urls or TexImageSources as specified in `options.src`. Will set the cubemap to a 1x1 pixel color
 * so that it is usable immediately unless `option.color === false`.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @param {module:twgl.CubemapReadyCallback} [callback] A function to be called when all the images have finished loading. err will
 *    be non null if there was an error.
 * @memberOf module:twgl/textures
 * @private
 */
function loadCubemapFromUrls(gl, tex, options, callback) {
  callback = callback || noop;
  const urls = options.src;
  if (urls.length !== 6) {
    throw new Error("there must be 6 urls for a cubemap");
  }
  const level = options.level || 0;
  const internalFormat = options.internalFormat || options.format || RGBA;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  const type = options.type || UNSIGNED_BYTE;
  const target = options.target || TEXTURE_2D;
  if (target !== TEXTURE_CUBE_MAP) {
    throw new Error("target must be TEXTURE_CUBE_MAP");
  }
  setTextureTo1PixelColor(gl, tex, options);
  // Because it's async we need to copy the options.
  options = copyOptionsAndApplyPackState(gl, options);
  let numToLoad = 6;
  const errors = [];
  const faces = getCubeFaceOrder(gl, options);
  let imgs;  // eslint-disable-line

  function uploadImg(faceTarget) {
    return function(err, img) {
      --numToLoad;
      if (err) {
        errors.push(err);
      } else {
        if (img.width !== img.height) {
          errors.push("cubemap face img is not a square: " + img.src);
        } else {
          scopedSetPackState(gl, options, () => {
            gl.bindTexture(target, tex);

            // So assuming this is the first image we now have one face that's img sized
            // and 5 faces that are 1x1 pixel so size the other faces
            if (numToLoad === 5) {
              // use the default order
              getCubeFaceOrder(gl).forEach(function(otherTarget) {
                // Should we re-use the same face or a color?
                gl.texImage2D(otherTarget, level, internalFormat, format, type, img);
              });
            } else {
              gl.texImage2D(faceTarget, level, internalFormat, format, type, img);
            }

            if (shouldAutomaticallySetTextureFilteringForSize(options)) {
              gl.generateMipmap(target);
            }
          });
        }
      }

      if (numToLoad === 0) {
        callback(errors.length ? errors : undefined, tex, imgs);
      }
    };
  }

  imgs = urls.map(function(url, ndx) {
    return loadAndUseImage(url, options.crossOrigin, uploadImg(faces[ndx]));
  });
}

/**
 * Loads a 2d array or 3d texture from urls OR TexImageSources as specified in `options.src`.
 * Will set the texture to a 1x1 pixel color
 * so that it is usable immediately unless `option.color === false`.
 *
 * If the width and height is not specified the width and height of the first
 * image loaded will be used. Note that since images are loaded async
 * which image downloads first is unknown.
 *
 * If an image is not the same size as the width and height it will be scaled
 * to that width and height.
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @param {module:twgl.ThreeDReadyCallback} [callback] A function to be called when all the images have finished loading. err will
 *    be non null if there was an error.
 * @memberOf module:twgl/textures
 * @private
 */
function loadSlicesFromUrls(gl, tex, options, callback) {
  callback = callback || noop;
  const urls = options.src;
  const internalFormat = options.internalFormat || options.format || RGBA;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  const type = options.type || UNSIGNED_BYTE;
  const target = options.target || TEXTURE_2D_ARRAY;
  if (target !== TEXTURE_3D && target !== TEXTURE_2D_ARRAY) {
    throw new Error("target must be TEXTURE_3D or TEXTURE_2D_ARRAY");
  }
  setTextureTo1PixelColor(gl, tex, options);
  // Because it's async we need to copy the options.
  options = copyOptionsAndApplyPackState(gl, options);
  let numToLoad = urls.length;
  const errors = [];
  let imgs;  // eslint-disable-line
  const level = options.level || 0;
  let width = options.width;
  let height = options.height;
  const depth = urls.length;
  let firstImage = true;

  function uploadImg(slice) {
    return function(err, img) {
      --numToLoad;
      if (err) {
        errors.push(err);
      } else {
        scopedSetPackState(gl, options, () => {
          gl.bindTexture(target, tex);

          if (firstImage) {
            firstImage = false;
            width = options.width || img.width;
            height = options.height || img.height;
            gl.texImage3D(target, level, internalFormat, width, height, depth, 0, format, type, null);

            // put it in every slice otherwise some slices will be 0,0,0,0
            for (let s = 0; s < depth; ++s) {
              gl.texSubImage3D(target, level, 0, 0, s, width, height, 1, format, type, img);
            }
          } else {
            let src = img;
            let ctx;
            if (img.width !== width || img.height !== height) {
              // Size the image to fix
              ctx = getShared2DContext();
              src = ctx.canvas;
              ctx.canvas.width = width;
              ctx.canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);
            }

            gl.texSubImage3D(target, level, 0, 0, slice, width, height, 1, format, type, src);

            // free the canvas memory
            if (ctx && src === ctx.canvas) {
              ctx.canvas.width = 0;
              ctx.canvas.height = 0;
            }
          }

          if (shouldAutomaticallySetTextureFilteringForSize(options)) {
            gl.generateMipmap(target);
          }
        });
      }

      if (numToLoad === 0) {
        callback(errors.length ? errors : undefined, tex, imgs);
      }
    };
  }

  imgs = urls.map(function(url, ndx) {
    return loadAndUseImage(url, options.crossOrigin, uploadImg(ndx));
  });
}

/**
 * Sets a texture from an array or typed array. If the width or height is not provided will attempt to
 * guess the size. See {@link module:twgl.TextureOptions}.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {(number[]|ArrayBufferView)} src An array or typed arry with texture data.
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @memberOf module:twgl/textures
 */
function setTextureFromArray(gl, tex, src, options) {
  options = options || defaults.textureOptions;
  const target = options.target || TEXTURE_2D;
  gl.bindTexture(target, tex);
  const level = options.level || 0;
  const internalFormat = options.internalFormat || options.format || RGBA;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  const type = options.type || getTextureTypeForArrayType(gl, src, formatType.type);
  if (!isArrayBuffer(src)) {
    const Type = typedArrays.getTypedArrayTypeForGLType(type);
    src = new Type(src);
  } else if (src instanceof Uint8ClampedArray) {
    src = new Uint8Array(src.buffer);
  }

  const { width, height, depth } = getTextureSize(target, src, options, internalFormat, format, type);
  const compressed = isCompressedInternalFormat(internalFormat);

  setSkipStateToDefault(gl);
  gl.pixelStorei(UNPACK_ALIGNMENT, options.unpackAlignment || 1);
  let mipLevelOffset = 0;  // this is in addition to level
  scopedSetPackState(gl, options, () => {
    let mipLevelByteOffset = 0;
    const { blockWidth, blockHeight, bytesPerBlock } = getBlockInfoForInternalFormat(internalFormat, type);
    while (mipLevelByteOffset < src.byteLength) {
      const mipWidth = Math.max(1, width >> mipLevelOffset);
      const mipHeight = Math.max(1, height >> mipLevelOffset);
      const mipDepth = target === TEXTURE_2D ? Math.max(1, depth >> mipLevelOffset) : depth;
      const blocksAcross = Math.ceil(mipWidth / blockWidth);
      const blocksDown = Math.ceil(mipHeight / blockHeight);
      const numFaces = target === TEXTURE_CUBE_MAP ? 6 : 1;
      const bytesPerMipLevel = blocksAcross * blocksDown * bytesPerBlock * mipDepth * numFaces;
      if (mipLevelByteOffset + bytesPerMipLevel > src.byteLength) {
        throw new Error('src size does not match number of mip levels');
      }
      const mipSource = src.subarray(mipLevelByteOffset / src.BYTES_PER_ELEMENT, (mipLevelByteOffset + bytesPerMipLevel) / src.BYTES_PER_ELEMENT);
      const mipLevel = level + mipLevelOffset;

      if (target === TEXTURE_CUBE_MAP) {
        const faceSize = mipSource.length / 6;
        getCubeFacesWithNdx(gl, options).forEach(f => {
          const offset = faceSize * f.ndx;
          const data = mipSource.subarray(offset, offset + faceSize);
          if (compressed) {
            gl.compressedTexImage2D(f.face, mipLevel, internalFormat, mipWidth, mipHeight, 0, data);
          } else {
            gl.texImage2D(f.face, mipLevel, internalFormat, mipWidth, mipHeight, 0, format, type, data);
          }
        });
      } else if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
        gl.texImage3D(target, mipLevel, internalFormat, mipWidth, mipHeight, mipDepth, 0, format, type, mipSource);
      } else {
        if (compressed) {
          gl.compressedTexImage2D(target, mipLevel, internalFormat, mipWidth, mipHeight, 0, mipSource);
        } else {
          gl.texImage2D(target, mipLevel, internalFormat, mipWidth, mipHeight, 0, format, type, mipSource);
        }
      }
      ++mipLevelOffset;
      mipLevelByteOffset += bytesPerMipLevel;
      if (mipWidth === 1 && mipHeight === 1 && mipDepth === 1 && mipLevelByteOffset !== src.byteLength) {
        throw new Error('src size has more data than can fit in mip levels');
      }
    }
  });
  return { width, height, depth, type, lastMipLevelUploaded: level + mipLevelOffset - 1 };
}

function getTextureSize(target, src, options, internalFormat, format, type) {
  let width = options.width;
  let height = options.height;
  let depth = options.depth;

  const compressed = isCompressedInternalFormat(internalFormat);

  if (compressed) {
    if (!width || !height) {
      throw new Error("compressed texture needs to set width and height!");
    }
    depth = depth || 1;
  } else {
    const bytesPerElement = getBytesPerElementForInternalFormat(internalFormat, type);
    const numElements = src.byteLength / bytesPerElement;  // TODO: check UNPACK_ALIGNMENT?
    if (numElements % 1) {
      throw new Error(`length wrong size for format: ${utils.glEnumToString(gl, format)}`);
    }
    if (compressed && (!width || !height)) {
      throw new Error("compressed texture needs to set width and height!");
    }
    let dimensions;
    if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
      if (!width && !height && !depth) {
        const size = Math.cbrt(numElements);
        if (size % 1 !== 0) {
          throw new Error(`can't guess cube size of array of numElements: ${numElements}`);
        }
        width = size;
        height = size;
        depth = size;
      } else if (width && (!height || !depth)) {
        dimensions = guessDimensions(gl, target, height, depth, numElements / width);
        height = dimensions.width;
        depth = dimensions.height;
      } else if (height && (!width || !depth)) {
        dimensions = guessDimensions(gl, target, width, depth, numElements / height);
        width = dimensions.width;
        depth = dimensions.height;
      } else {
        dimensions = guessDimensions(gl, target, width, height, numElements / depth);
        width = dimensions.width;
        height = dimensions.height;
      }
    } else {
      dimensions = guessDimensions(gl, target, width, height, numElements);
      width = dimensions.width;
      height = dimensions.height;
    }
  }

  return {
    width,
    height,
    depth,
  };
}

/**
 * Sets a texture with no contents of a certain size. In other words calls `gl.texImage2D` with `null`.
 * You must set `options.width` and `options.height`.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @memberOf module:twgl/textures
 */
function setEmptyTexture(gl, tex, options) {
  const target = options.target || TEXTURE_2D;
  gl.bindTexture(target, tex);
  const level = options.level || 0;
  const internalFormat = options.internalFormat || options.format || RGBA;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  const type = options.type || formatType.type;
  scopedSetPackState(gl, options, () => {
    if (target === TEXTURE_CUBE_MAP) {
      for (let ii = 0; ii < 6; ++ii) {
        gl.texImage2D(TEXTURE_CUBE_MAP_POSITIVE_X + ii, level, internalFormat, options.width, options.height, 0, format, type, null);
      }
    } else if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
      gl.texImage3D(target, level, internalFormat, options.width, options.height, options.depth, 0, format, type, null);
    } else {
      gl.texImage2D(target, level, internalFormat, options.width, options.height, 0, format, type, null);
    }
  });
}

/**
 * Creates a texture based on the options passed in.
 *
 * See {@link module:twgl.TextureOptions}
 *
 * Note: may reset UNPACK_ALIGNMENT, UNPACK_ROW_LENGTH, UNPACK_IMAGE_HEIGHT, UNPACK_SKIP_IMAGES
 * UNPACK_SKIP_PIXELS, and UNPACK_SKIP_ROWS
 *
 * UNPACK_FLIP_Y_WEBGL, UNPACK_PREMULTIPLY_ALPHA_WEBGL, UNPACK_COLORSPACE_CONVERSION_WEBGL
 * are left as is though you can pass in options for flipY, premultiplyAlpha, and colorspaceConversion
 * to override them.
 *
 * As for the behavior of these settings
 *
 * ```js
 * gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
 * t1 = twgl.createTexture({src: someImage }); // flipped
 * t2 = twgl.createTexture({src: someImage, flipY: true }); // flipped
 * t3 = twgl.createTexture({src: someImage, flipY: false }); // not flipped
 * t4 = twgl.createTexture({src: someImage }); // flipped
 * ```
 *
 * * t1 is flipped because UNPACK_FLIP_Y_WEBGL is true
 * * t2 is flipped because it was requested
 * * t3 is not flipped because it was requested
 * * t4 is flipped because UNPACK_FLIP_Y_WEBGL has been restored to true
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 * @param {module:twgl.TextureReadyCallback} [callback] A callback called when an image has been downloaded and uploaded to the texture.
 * @return {WebGLTexture} the created texture.
 * @memberOf module:twgl/textures
 */
function createTexture(gl, options, callback) {
  callback = callback || noop;
  options = options || defaults.textureOptions;
  const tex = gl.createTexture();
  const target = options.target || TEXTURE_2D;
  let width  = options.width  || 1;
  let height = options.height || 1;
  let lastMipLevelUploaded = 0;
  const internalFormat = options.internalFormat || RGBA;
  gl.bindTexture(target, tex);
  if (target === TEXTURE_CUBE_MAP) {
    // this should have been the default for cubemaps :(
    gl.texParameteri(target, TEXTURE_WRAP_S, CLAMP_TO_EDGE);
    gl.texParameteri(target, TEXTURE_WRAP_T, CLAMP_TO_EDGE);
  }
  let src = options.src;
  if (src) {
    if (typeof src === "function") {
      src = src(gl, options);
    }
    if (typeof (src) === "string") {
      loadTextureFromUrl(gl, tex, options, callback);
    } else if (isArrayBuffer(src) ||
               (Array.isArray(src) && (
                    typeof src[0] === 'number' ||
                    Array.isArray(src[0]) ||
                    isArrayBuffer(src[0]))
               )
              ) {
      const dimensions = setTextureFromArray(gl, tex, src, options);
      width  = dimensions.width;
      height = dimensions.height;
      lastMipLevelUploaded = dimensions.lastMipLevelUploaded;
    } else if (Array.isArray(src) && (typeof (src[0]) === 'string' || isTexImageSource(src[0]))) {
      if (target === TEXTURE_CUBE_MAP) {
        loadCubemapFromUrls(gl, tex, options, callback);
      } else {
        loadSlicesFromUrls(gl, tex, options, callback);
      }
    } else { // if (isTexImageSource(src))
      setTextureFromElement(gl, tex, src, options);
      width  = src.width;
      height = src.height;
    }
  } else {
    setEmptyTexture(gl, tex, options);
  }
  if (shouldAutomaticallySetTextureFilteringForSize(options)) {
    setTextureFilteringForSizeInternal(gl, tex, { options, width, height, internalFormat, lastMipLevelUploaded });
  }
  setTextureParameters(gl, tex, options);
  return tex;
}

/**
 * Value returned by createTextureAsync
 *
 * @typedef {Object} CreateTextureInfo
 * @param {WebGLTexture} texture the texture.
 * @param {module:twgl.TextureSrc} source image(s) used to as the src for the texture
 * @memberOf module:twgl
 */

/**
 * Creates a texture based on the options passed in.
 *
 * see {@link module:twgl/textures.createTexture}.
 * The only difference is this function returns a promise
 * where as the other returns a texture and takes a callback.
 *
 * Note: this is here for completeness. It is probably better to use
 * the non-async version as it returns a usable texture immediately
 * where as this one you have to wait for it to load.
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 * @return {Promise<CreateTextureInfo>} The created texture and source.
 */
function createTextureAsync(gl, options) {
  return new Promise((resolve, reject) => {
    createTexture(gl, options, (err, texture, source) => {
      if (err) {
        reject(err);
      } else {
        resolve({ texture, source });
      }
    });
  });
}

/**
 * Resizes a texture based on the options passed in.
 *
 * Note: This is not a generic resize anything function.
 * It's mostly used by {@link module:twgl.resizeFramebufferInfo}
 * It will use `options.src` if it exists to try to determine a `type`
 * otherwise it will assume `gl.UNSIGNED_BYTE`. No data is provided
 * for the texture. Texture parameters will be set accordingly
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the texture to resize
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @param {number} [width] the new width. If not passed in will use `options.width`
 * @param {number} [height] the new height. If not passed in will use `options.height`
 * @param {number} [depth] the new depth. If not passed in will use `options.depth`
 * @memberOf module:twgl/textures
 */
function resizeTexture(gl, tex, options, width, height, depth) {
  width = width || options.width;
  height = height || options.height;
  depth = depth || options.depth;
  const target = options.target || TEXTURE_2D;
  gl.bindTexture(target, tex);
  const level = options.level || 0;
  const internalFormat = options.internalFormat || options.format || RGBA;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  let type;
  const src = options.src;
  if (!src) {
    type = options.type || formatType.type;
  } else if (isArrayBuffer(src) || (Array.isArray(src) && typeof (src[0]) === 'number')) {
    type = options.type || getTextureTypeForArrayType(gl, src, formatType.type);
  } else {
    type = options.type || formatType.type;
  }
  if (target === TEXTURE_CUBE_MAP) {
    for (let ii = 0; ii < 6; ++ii) {
      gl.texImage2D(TEXTURE_CUBE_MAP_POSITIVE_X + ii, level, internalFormat, width, height, 0, format, type, null);
    }
  } else if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
    gl.texImage3D(target, level, internalFormat, width, height, depth, 0, format, type, null);
  } else {
    gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
  }
}

/**
 * Check if a src is an async request.
 * if src is a string we're going to download an image
 * if src is an array of strings we're going to download cubemap images
 * @param {*} src The src from a TextureOptions
 * @returns {bool} true if src is async.
 * @private
 */
function isAsyncSrc(src) {
  return typeof src === 'string' ||
         (Array.isArray(src) && typeof src[0] === 'string');
}

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
 * @param {Object.<string,module:twgl.TextureOptions>} options A object of TextureOptions one per texture.
 * @param {module:twgl.TexturesReadyCallback} [callback] A callback called when all textures have been downloaded.
 * @return {Object.<string,WebGLTexture>} the created textures by name
 * @memberOf module:twgl/textures
 */
function createTextures(gl, textureOptions, callback) {
  callback = callback || noop;
  let numDownloading = 0;
  const errors = [];
  const textures = {};
  const images = {};

  function callCallbackIfReady() {
    if (numDownloading === 0) {
      setTimeout(function() {
        callback(errors.length ? errors : undefined, textures, images);
      }, 0);
    }
  }

  Object.keys(textureOptions).forEach(function(name) {
    const options = textureOptions[name];
    let onLoadFn;
    if (isAsyncSrc(options.src)) {
      onLoadFn = function(err, tex, img) {
        images[name] = img;
        --numDownloading;
        if (err) {
          errors.push(err);
        }
        callCallbackIfReady();
      };
      ++numDownloading;
    }
    textures[name] = createTexture(gl, options, onLoadFn);
  });

  // queue the callback if there are no images to download.
  // We do this because if your code is structured to wait for
  // images to download but then you comment out all the async
  // images your code would break.
  callCallbackIfReady();

  return textures;
}

/**
 * Value returned by createTextureAsync
 *
 * @typedef {Object} CreateTexturesInfo
 * @param {Object.<string, WebGLTexture>} textures the created textures by name. Same as returned by {@link module:twgl.createTextures}.
 * @param {Object.<string, module:twgl.TextureSrc>} sources the image(s) used for the texture by name.
 * @memberOf module:twgl
 */

/**
 * Creates textures based on the options passed in.
 *
 * see {@link module:twgl/textures.createTextures}.
 * The only difference is this function returns a promise
 * where as the other returns a texture and takes a callback.
 *
 * Note: this is here for completeness. It is probably better to use
 * the non-async version as it returns usable textures immediately
 * where as this one you have to wait for them to load.
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {Object.<string,module:twgl.TextureOptions>} options A object of TextureOptions one per texture.
 * @return {Promise<CreateTexturesInfo>} The created textures and sources.
 */
function createTexturesAsync(gl, options) {
  return new Promise((resolve, reject) => {
    createTexture(gl, options, (err, textures, sources) => {
      if (err) {
        reject(err);
      } else {
        resolve({ textures, sources });
      }
    });
  });
}

export {
  setDefaults as setTextureDefaults_,

  createSampler,
  createSamplers,
  setSamplerParameters,

  createTexture,
  createTextureAsync,
  setEmptyTexture,
  setTextureFromArray,
  loadTextureFromUrl,
  setTextureFromElement,
  setTextureFilteringForSize,
  setTextureParameters,
  setDefaultTextureColor,
  createTextures,
  createTexturesAsync,
  resizeTexture,

  canGenerateMipmap,
  canFilter,
  getNumComponentsForFormat,
  getBytesPerElementForInternalFormat,
  getFormatAndTypeForInternalFormat,
};

