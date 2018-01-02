
const global = typeof global !== 'undefined'  // eslint-disable-line
  ? global                                          // eslint-disable-line
  : typeof self !== 'undefined'
    ? self
    : typeof window !== 'undefined'
      ? window :
      {};

export { global as default };

