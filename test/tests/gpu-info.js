import {describe, it} from '../mocha-support.js';

function getGPUInfo(gl, ext) {
  return ext
    ? ['UNMASKED_VENDOR_WEBGL', 'UNMASKED_RENDERER_WEBGL'].map(pname => `${pname}: ${gl.getParameter(ext[pname])}`).join(',\n')
    : 'unavailable';
}

describe('gpu info', () => {
  const gl = new OffscreenCanvas(1, 1).getContext('webgl2');
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const title = getGPUInfo(gl, ext);
  it(title, () => {});
});
