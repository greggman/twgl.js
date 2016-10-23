#Changelist

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


