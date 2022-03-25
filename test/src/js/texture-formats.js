export const renderableIntTextureFormats = [
  'R8I',
  'RG8I',
  'RGBA8I',
  'R16I',
  'RG16I',
  'RGBA16I',
  'R32I',
  'RG32I',
  'RGBA32I',
];
export const unrenderableIntTextureFormats = [
  'RGB8I',
  'RGB16I',
  'RGB32I',
];
export const renderableUintTextureFormats = [
  'R8UI',
  'RG8UI',
  'RGBA8UI',
  'R16UI',
  'RG16UI',
  'RGBA16UI',
  'R32UI',
  'RG32UI',
  'RGBA32UI',
  'RGB10_A2UI',
];
export const unrenderableUintTextureFormats = [
  'RGB8UI',
  'RGB16UI',
  'RGB32UI',
];
export const float16TextureFormats = [
  'R16F',
  'RG16F',
  'RGB16F',
  'RGBA16F',
];
export const float32TextureFormats = [
  'R32F',
  'RG32F',
  'RGB32F',
  'RGBA32F',
];
export const floatTextureFormats = [
  ...float16TextureFormats,
  ...float32TextureFormats,
  'R11F_G11F_B10F',
];
export const snormTextureFormats = [
  'R8_SNORM',
  'RG8_SNORM',
  'RGB8_SNORM',
  'RGBA8_SNORM',
];
export const normTextureFormats = [
  'R8',
  'RG8',
  'RGB8',
  'RGBA8',
];
export const miscRenderableTextureFormats = [
  'RGB565',
  'RGB5_A1',
  'RGB10_A2',
  'RGBA4',
  'SRGB8_ALPHA8',
];
export const miscNonRenderableTextureFormats = [
  'SRGB8',
  'RGB9_E5',
];
export const depthTextureFormats = [
  'DEPTH_COMPONENT16',
  'DEPTH_COMPONENT24',
  'DEPTH_COMPONENT32F',
];
export const depthStencilTextureFormats = [
  'DEPTH32F_STENCIL8',
  'DEPTH24_STENCIL8',
];
export const multisampleTextureFormats = [
  ...normTextureFormats,
  ...miscRenderableTextureFormats,
];
export const renderableTextureFormats = [
  ...renderableIntTextureFormats,
  ...renderableUintTextureFormats,
  ...normTextureFormats,
  ...miscRenderableTextureFormats,
];
