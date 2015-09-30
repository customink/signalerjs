export default function promisePolyfill() {
  /* istanbul ignore next */
  if (typeof Promise === 'undefined') {
    require('es6-promise').polyfill();
  }
}
