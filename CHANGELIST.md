#Changelist

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


