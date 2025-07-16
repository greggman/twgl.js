# Change List

*   7.0.0

    Support for uploading mipmaps in 1 call.

    As it was you could upload individual mips by calling `setTextureFromElement` or `setTextureFromArray`
    but not really from `createTexture`, `createTextures`. Those 2 functions would call `gl.generateMipmap`
    for you though if it was possible and you didn't specifically opt out.

    Now, `createTexture`, `createTextures`, and `setTextureFromArray`, if passed an array or typedarray as `src`,
    will attempt to fill mip levels based on how much data you pass in.

    So for example, an RGBA8 10x7 texture takes

    * (10x7)x4 - 280bytes for mip level 0
    * (5x3)x4 - 60bytes for mip level 1
    * (2x1)x4 - 8bytes for mip level 2
    * (1x1)x4 - 4bytes for mip level 3

    So:
    
    * If you pass in 280+60+8+4 or 352 bytes then all 4 mips will be filled out.
    * If you pass 348 bytes then the first 3 levels will be filled out.
    * If you pass 72 bytes and pass `level: 1` then the last 3 mips will be filled out.

      (note: you would likely only do this with `setTextureFromArray`)
 
    For this to work, you must pass in a `width` and `height` because otherwise, twgl guesses the size of the texture based
    on the size of the data.

    Note that this also works for compressed textures. You must pass blocks worth of data.
    Following the same pattern if you were using a texture format that has 4x4 blocks and each
    block is 8 bytes then, if you had a 12x8 texture

    * (12x8) is 3x2 blocks * 8 bytes per block = 48 bytes
    * (6x4) is 2x1 blocks * 8 bytes per block = 16 bytes
    * (3x2) is 1 block * 8 bytes per block = 8 bytes
    * (1x1) is 1 block * 8 bytes per block = 8 bytes

    So if you pass in (48+16+8+8) or 80 bytes then twgl will upload to all 4 mip levels.

    Note though that this is a breaking change! This is because before this change, if you
    called `createTexture` and passed in `width: 4, height: 4, src: someUint8ArrayOf100Bytes`
    twgl would just use the first 64 bytes. Now though it would error out trying to use the first
    64 bytes for mip level 0, then the next 16 bytes for mip level 1, then the next 4 bytes mip
    level 1. Which is different than what it used to do.

*   6.2.0

    Support compressed textures

*   6.1.1

    Fix bug in `createProgram` if you pass it an existing shader

*   6.1.0

    Added `createTextureAsync` and `createTexturesAsync`

*   6.0.0

    Internal change. `gl.pixelStorei` state for `UNPACK_COLORSPACE_CONVERSION_WEBGL`
    `UNPACK_PREMULTIPLY_ALPHA_WEBGL` and `UNPACK_FLIP_Y_WEBGL`
    is now saved and restored as the previous behavior had a race condition.

    Before v6.0.0

    ```js
    t1 = twgl.createTexture(gl, {src: 'https://p.com/slow.jpg'});  // may or may not be flipped!!!!
    t2 = twgl.createTexture(gl, {src: 'https://p.com/fast.jpg', flipY: true });  // flipped
    ```

    In the example above, whether or not `t1` is flipped was unknown
    since if `t2` loads first, it would be flipped. If `t1` loads first
    it would not be flipped.

    The fix is to save and restore the `pixelStorei` state for each texture.
    
    Unfortunately, this is a breaking change.

    Before v6.0.0

    ```js
    twgl.createTexture(gl, {src: someImageElem1, flipY: true });  // flipped
    twgl.createTexture(gl, {src: someImageElem2 });               // also flipped
    ```

    From v6.0.0 on

    ```js
    twgl.createTexture(gl, {src: someImage, flipY: true });  // flipped
    twgl.createTexture(gl, {src: someImage });               // NOT flipped
    ```

    Note: in all versions the behavior was and still is, that if you set
    the `pixelStorei` parameters outside they applied.

    ```js
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    twgl.createTexture(gl, {src: someImage });  // flipped
    twgl.createTexture(gl, {src: someImage });  // flipped
    ```

*   5.6.0

    Support offsets and shared buffers in uniform block infos.

*   5.5.0

    add `compareMode` and `compareFunc` to texture options

*   5.4.0

    *   Keep JSDoc docstrings in .d.ts files

*   5.3.1

    *   Add missing `drawType` to FullArraySpec
    *   Allow binding null for a texture in `setUniforms` for texture arrays

*   5.3.0

    *   Allow binding null for a texture in `setUniforms`

*   5.2.0

    *   added `createPrograms`, `createProgramInfos`, `createProgramsAsync`,
        and `createProgramInfosAsync`

*   5.1.0

    *   Allow FullArraySpec.type to be typedArray type or GL type

*   5.0.2

    *   Make isX functions (internal) work across realms

*   5.0.0

    *   Always set attribute divisor if it exists

        This is a breaking change since before twgl didn't set
        the divisors if you didn't assign an divisor to an attribute.

*   4.24.0

    *   Have createFramebufferInfo call drawBuffers

*   4.23.0

    *   Add async shader compilation support

*   4.22.0

    *   Add samples to attachment options

*   4.21.0

    *   Add support for partial uniform paths.

*   4.20.0

    *   Add support for more easily setting uniform and 
        uniform block structures and arrays.

*   4.19.5

    *   Fix issue with uniform blocks and built-in uniforms

*   4.19.4

    *   Fix JSDocs for blockspec and related stuff
    *   Fix more Uniform Block padding issues.
    *   Add browser testing infrastructure.

*   4.19.2

    *   WebGLObject -> WebGLTexture|WebGLRenderbuffer for typescript
    *   Fix glEnumToString for non-number

*   4.19.0

    *   Reset UNPACK_SKIP_etc... state to defaults

*   4.18.0

    *   Fixed padding issue with arrays in uniform blocks

*   4.17.0

    *   better errors for shaders

*   4.16.1

    *   fix how twgl figures out a uniform is an array

*   4.16.0

    *   support WebGL1 depth textures 😅

*   4.15.2

    *   fix s/texTarget/target/ on use of AttachmentOptions

*   4.15.0

    *   Allow anything not otherwise handled to be sent to `texImage2D` as a `TexImageSource`

*   4.14.2

    *   Add width and height to FrameBufferInfo docs
    *   Adjust normals on cone

*   4.14.0

    *   Use constants everywhere. eg `TEXTURE_2D` instead of `gl.TEXTURE_2D`

*   4.13.1

    *   Make AttachmentOptions extend TextureOptions

*   4.13.0

    *   Made `resizeTexture` handle `3D` and `2D_ARRAY`.

*   4.12.0

    *   Add es6 module

*   4.11.5

    *   Fix type info for `m4.setAxis`

*   4.11.4

    *   add `null` as parameter to `bindFramebufferInfo`

    *   fix return types of `createXYQuadBufferInfo` and `createXYQuadBuffers`

*   4.11.3

    *   fix issues with TEXTURE_2D_ARRAY and arrays

*   4.11.0

    *   Support `layer` attachment option for `createFramebufferInfo`

*   4.10.0

    *   Support constant attribute values for float, vec2, vec3 (used to only support vec4)

*   4.9.4

    *   Make helper.js more node friendly

*   4.9.3

    *   Use instanceof Type in helper.js

*   4.9.2

    *   Add .map to twgl-base npm package

*   4.9.0

    *   added v3.lerpV, v3.min, v3.max

    *   fixed issue with urlISSameDomain on servers

*   4.8.2

    *   Fixed IE URL issue

    *   Fixed building with new JS

*   4.8.0

    *   add typescript types

*   4.7.0

    *   expose `getFormatAndTypeForInternalFormat`, `canFilter`, and `canGenerateMipmap`.

*   4.6.0

    *   Crossorigin settings for images are now automatic by default

    *   Fixed bug in `getShaderTypeFromScriptType`

*   4.5.0

    *   Add support for constant attributes

*   4.4.0

    *   Support passing arrays of `TexImageSource` to `createTexture(s)`.

    *   Fix callback arguments for cubemaps and slices

*   4.3.2

    *   Support slicing image in workers.

*   4.3.1

    *   Make TWGL work in workers.

*   4.3.0

    *   Remove references to `window` so twgl can be used in workers

*   4.2.0

    *   add `EXT_color_buffer_float`, `WEBGL_compressed_texture_s3tc_srgb`, and
        `EXT_disjoint_timer_query_webgl2` to `twgl.addExtensionsToContext`.

*   4.1.0

    *   Added `twgl.glEnumToString`

        This was an internal function used to make a few error
        messages more useful but might as well
        export it.

    *   Fix bug in `resizeTexture` for WebGL2.

*   4.0.1

    *   Added check for built in uniforms and attributes

*   4.0.0

    *   Switch to es6 modules for source

        Webpack still builds UMD version

*   3.8.0

    *   Add `SharedArrayBuffer` support

*   3.7.1

    *   Fix `ortho`

*   3.7.0

    *   Support instances with `drawBufferInfo` and `drawObjectList`.

    *   Support passing a multiplier smaller than 1 to `resizeCanvasToDisplaySize`.

*   3.6.0

    *   Added `twgl.addExtensionsToContext`

        Adds most extensions directly on the context so they have the same API
        as WebGL2 or OpenGL ES 3.0

    *   Added instancing support

        Added `divisor` to `AttribInfo` and `FullArraySpec` and calls to
        `gl.vertexAttribDivisor`. NOTE: It's up to you to clear the divisor.
        You can either use vertex array objects (recommended) OR set
        `divisor` to 0 other `AttribInfo`s etc. (not recommended)

*   3.5.0

    *   Added `level` to `TextureOptions`

*   3.4.1

    *   use `getBoundingClientRect` for `resizeCanvasToDisplaySize`

        unlike `clientWidth` and `clientHeight`, `getBoundingClientRect`
        returns fractional dimensions. This is important when passing in devicePixelRatio
        to calculate and actual native size.

*   3.4.0

    *   Support `minMag` for framebuffers

*   3.3.0

    *   Make `createProgram` accept ids, source, and shaders as input.

        This kind of removes the need for `createProgramFromSources` and
        `createProgramFromScripts`

*   3.1.0

    *   Add support for transform feedback

        At least an attempt at something. I'd need more examples
        of how it's used to see if it fits.

*   3.0.0

    *   Fix package.json

        It was pointing to `dist` instead of `dist/2.x`. Because
        that means fixing it will bump users of npm 2.x from
        1.x to 2.x I had to bump to 3.x because and a breaking
        change.

*   2.8.2

    *   Use spec compatible texSubImage3D parameters

*   2.8.1

    *   Fill out TEXTURE_2D_ARRAY with first image

        This is so there is something to render in all slices

*   2.8

    *   Add support for TEXTURE_2D_ARRAY

        You can pass a list of images to `twgl.createTexture` and it will load each
        image into a slice of a `TEXTURE_2D_ARRAY` if the target is `TEXTURE_2D_ARRAY`

*   2.7

    *   mangle some property names

        saves about 4k

    *   add `minMag` property to `TextureOptions`

        It sets both `TEXTURE_MIN_FILTER` and `TEXTURE_MAG_FILTER`

    *   Change texture filtering to use internalFormat

        In WebGL1 we checked power of 2 in width and height. In WebGL2
        we check if the internal format supports filtering. This might
        break things going from WebGL1 to WebGL2 if you expected a
        non-power-of-2 texture to use gl.LINEAR.

        Note: One issue is TWGL can't tell if you've enabled `OES_texture_float_linear`
        so you use float textures it can't tell if it can generate mips or not
        and you'll have to be explicit with texture settings. Currently it assumes
        you can generate mips. Pass in `auto: false` to `createTexture(s)` if you didn't
        enable `OES_texture_float_linear` or similarly for half float formats.

    *   Support samplers

    *   Support webgl2 texture formats

*   2.6.2

    *   remove "experimental-webgl2" which never existed

*   2.6.1

    *   allow offset=0 in setAttributeInfoBufferFromArray

*   2.6

    *   make createBuffersFromArrays add a numElements and elementType properties.

*   2.5

    *   switch to webpack + babel

*   2.4

    *   Support int attributes

*   2.3

    *   Make all `createProgramXXX` functions take a `ProgramOptions` argument

*   2.1

    *   Made guessing numComponents for attributes case insensitive
        as well ask looking for "text" and "colour"

*   2.0

    *   Changed `m4.multiply` to match most other math libraries.

        `m4.multiply(a, b)` was multiplying `b` on the left. Now it's doing the more
        standard thing of multiplying `b` on the right.

        For example this means these 2 statements are equivalent

            m4.multiply(someMatrix, m4.translation([1, 2, 3]));
            m4.translate(someMatrix, [1, 2, 3]);

        In 1.x the first statement would have been

            m4.multiply(m4.translation([1, 2, 3]), someMatrix);

    *   Changed `twgl.drawBufferInfo` so second argument is `BufferInfo`

        In other words in 1.x it was

            twgl.drawBufferInfo(gl, primitiveType, bufferInfo)

        Now in 2.x it's

             twgl.drawBufferInfo(gl, bufferInfo, primitiveType)

        This lets `primitiveType` be optional with the default being `gl.TRIANGLES`.

*   1.9

    *   support `mat2`, `mat3`, and `mat4` attributes

    *   allow buffer offsets for `UniformBlockInfo`s

*   1.8

    *   framebuffers have better texture defaults

        before 1.8 textures created for framebuffers used the texture defaults
        which meant power of 2 dimensions got mips. As of 1.8 twgl only creates
        mip level 0 by default for framebuffer textures.
*   1.7

    *   Add support for 3d textures (WebGL2)

*   1.6

    *   Made `createProgramInfo` and `createProgramXXX` multi-signature

            twgl.createProgramInfo(gl, [vs, fs], opt_errFunc);
            twgl.createProgramInfo(gl, [vs, fs], opt_attribs, opt_errFunc);
            twgl.createProgramInfo(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
*   1.5

    *   separated twgl src into more modules

*   1.4

    *   add Vertex Array Object support


