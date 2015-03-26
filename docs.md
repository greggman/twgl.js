TWGL A Tiny WebGL helper Library
================================

This library's sole purpose is to make using the WebGL API easier.

## TL;DR

If you want to get shit done use [three.js](http://threejs.org). If you want
to do stuff low-level with WebGL consider using TWGL.

## Why? What? How?

WebGL is a very verbose API. Setting up shaders, buffers, attributes and uniforms
takes a lot of code. A simple lit cube in WebGL might easily take 60 calls into WebGL.

TWGL's is an attempt to make that simpler by providing a few tiny helper functions
that make it much simpler.

Compare

### Compiling a Shader

TWGL

WebGL

### Creating Buffers for a Cube

TWGL

WebGL

### Setting Attributes for a Cube

TWGL

WebGL

### Setting Uniforms for a Lit Cube

TWGL

WebGL

## Future

*   See where this fits into WebGL 2.0
*   Consider adding texture related stuff
*   Consider adding framebuffer related stuff
