// shim.js
(function() {
  if (typeof window.global === 'undefined') {
    window.global = window;
  }
})();
