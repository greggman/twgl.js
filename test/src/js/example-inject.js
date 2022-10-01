function makePromise() {
  const info = {};
  const promise = new Promise((resolve, reject) => {
    Object.assign(info, {resolve, reject});
  });
  info.promise = promise;
  return info;
}

window.testsPromiseInfo = makePromise();

window.addEventListener('error', (event) => {
  console.error(event);
  window.testsPromiseInfo.resolve(1);
});
