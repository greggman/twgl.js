To Do
=====

*   add more format to `getNumComponentsForFormat`
*   should `setTextureTo1PixelColor` handle formats that require something other than `RGBA`/`UNSIGNED_BYTE`
    for example R16I requires the data be integers most likely?
*   add `TEXTURE_ARRAY` support
*   skip npot checks if webgl2 (setting for backward compatibility?)
*   document arrays in one place
*   make program attributes an option, not a optional argument?
*   fix cone
*   make other kind of sphere
*   option to warn all unmatched uniforms and/or attributes?

Done
====

*   add `TEXTURE_3D` support
*   Update eslint
*   add new texture parameters
*   Fix createProgramInfo to take strings and not just ids
*   make createUniformBlock make a empty block (with warning?) for non-existent block

    This is so a block that gets optimized out while debugging a shader doesn't break
    the system

*   disconnect blocks from their index so they can be used in a different program
    with a different index.
*   fix gawd damn docs
*   make uglyif strip names
*   remove "a_" prefix
*   make primitives bufferInfo creator generate array { numComponents: x, data: y } ? (decided not to change this)
*   make a augmentedTypedArray example that's lines so I know it works
*   make AMD test
*   add texture stuff
    *   loading
    *   setting filtering
    *   creation?  {
        *   src: url/img/cav/array,
        *   width: height: Assumed Math.sqrt() or Wx1
        *   min: mag: wrap: wrapS: wrapT
    *   handle empty cubemap
    *   handle string cubemap
    *   handle string[] cubemap
    *   should we put img on options? or should we set width and height? (currently not provide)



