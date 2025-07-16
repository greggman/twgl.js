// Ensure that TypeScript can successfully compile with twgl as a dependency.
// You probably want to run `npm run buildts` before running this test.

import * as twgl from "../../../dist/7.x/twgl-full";

{
  function useF32(v: Float32Array) { }
  function useU8(v: Uint8Array) { }

  const f32 = twgl.primitives.createAugmentedTypedArray(3, 5);
  f32.push(1, 2, 3);
  f32.push([4, 5, 6]);
  f32.push(new Uint32Array([6,7,8]));

  useF32(f32);

  const u8 = twgl.primitives.createAugmentedTypedArray(4, 3, Uint8Array);
  u8.push([5, 6, 7, 8]);

  useU8(u8);
}

window.addEventListener("onload", function() {
    const canvas = <HTMLCanvasElement> document.getElementById("myCanvas");
    const gl = <WebGLRenderingContext> canvas.getContext("webgl");
    twgl.setDefaults({attribPrefix: "a_"});

    // just testing that these compile in typescript
    twgl.createProgramInfo(gl, ['vs', 'fs'], ['position', 'normals']);
    twgl.createProgramInfo(gl, ['vs', 'fs'], ['position', 'normals'], [0, 1]);
    twgl.createProgramInfo(gl, ['vs', 'fs'], ['position', 'normals'], [0, 1], (msg: string) => {});
    twgl.createProgramInfo(gl, ['vs', 'fs'], {
      errorCallback: (msg: string) => {},
      attribLocations: ['position', 'normals'],
      transformFeedbackVaryings: ['colors'],
    });

    const programInfo: twgl.ProgramInfo = twgl.createProgramInfo(gl, [
        "vs", "fs" // Placeholders
    ]);
    const identity: twgl.m4.Mat4 = twgl.m4.identity();
    const tex: WebGLTexture = twgl.createTexture(gl, {
      minMag: gl.LINEAR,
      wrap: gl.CLAMP_TO_EDGE,
      src: [
        255, 255, 255, 255,
        192, 192, 192, 255,
        192, 192, 192, 255,
        255, 255, 255, 255,
      ],
    });
    const shapes: twgl.BufferInfo[] = [
      twgl.primitives.createCubeBufferInfo(gl, 2),
      twgl.primitives.createSphereBufferInfo(gl, 1, 24, 12),
      twgl.primitives.createPlaneBufferInfo(gl, 2, 2),
      twgl.primitives.createTruncatedConeBufferInfo(gl, 1, 0, 2, 24, 1),
      twgl.primitives.createCresentBufferInfo(gl, 1, 1, 0.5, 0.1, 24),
      twgl.primitives.createCylinderBufferInfo(gl, 1, 2, 24, 2),
      twgl.primitives.createDiscBufferInfo(gl, 1, 24),
      twgl.primitives.createTorusBufferInfo(gl, 1, 0.4, 24, 12),
    ];
    const buffer: WebGLBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
      array: [1, 2, 3],
      dataArray: {
        data: [1, 2, 3],
      },
      typedArray: new Uint8Array([1, 2, 3]),
      arrayWithGLType: {
        data: [1, 2, 3],
        type: gl.SHORT,
      },
      arrayWithTypedArrayType: {
        data: [1, 2, 3],
        type: Int8Array,
      },
      sizeWithTypedArrayType: {
        data: 3,
        type: Int8Array,
      },
      bufferWithTypedArrayType: {
        buffer,
        type: Uint16Array,
      },
      bufferWithGLType: {
        buffer,
        type: gl.INT,
      },
    });
    shapes.push(bufferInfo)

    twgl.createFramebufferInfo(gl, [
      { format: gl.RGBA, minMag: gl.NEAREST },
    ]);
    twgl.bindFramebufferInfo(gl, null);
    
    function render(time: number) {
        twgl.resizeCanvasToDisplaySize(canvas);
        requestAnimationFrame(render);
    }
    
    requestAnimationFrame(render);
});
