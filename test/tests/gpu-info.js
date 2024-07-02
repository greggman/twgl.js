import {describe, it} from '../mocha-support.js';

function getGPUInfo(gl, ext) {
  return JSON.stringify({
    ...(ext
          ? Object.fromEntries(['UNMASKED_VENDOR_WEBGL', 'UNMASKED_RENDERER_WEBGL'].map(pname => [pname, gl.getParameter(ext[pname])]))
          : { WEBGL_debug_renderer_info: 'unavailable' }
    ),
    ...JSON.parse(JSON.stringify(navigator.userAgentData || {})),
  }, null, 2);
}

describe('gpu info', () => {
  const gl = new OffscreenCanvas(1, 1).getContext('webgl2');
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const title = getGPUInfo(gl, ext);
  it(title, () => {});
});
