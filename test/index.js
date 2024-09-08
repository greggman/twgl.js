/* global mocha */

import './tests/gpu-info.js';
import './tests/attribute-buffer-tests.js';
import './tests/framebuffer-tests.js';
import './tests/helper-tests.js';
import './tests/m4-tests.js';
import './tests/program-tests.js';
import './tests/texture-tests.js';
import './tests/v3-tests.js';

const settings = Object.fromEntries(new URLSearchParams(window.location.search).entries());
if (settings.reporter) {
  mocha.reporter(settings.reporter);
}
mocha.run((failures) => {
  window.testsPromiseInfo.resolve(failures);
});
