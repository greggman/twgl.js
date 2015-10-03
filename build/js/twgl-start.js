(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } if (typeof exports !== 'undefined') {
        exports = factory();
    } else {
        root.twgl = factory();
    }
}(this, function () {

