// Runs in MAIN world before html2canvas
// Patches CSSStyleDeclaration to intercept oklch values
(function() {
  if (window.__oklchFixed) return;
  window.__oklchFixed = true;

  // Override getComputedStyle so html2canvas never sees oklch
  var _getComputedStyle = window.getComputedStyle;
  window.getComputedStyle = function(el, pseudo) {
    var cs = _getComputedStyle(el, pseudo);
    return new Proxy(cs, {
      get: function(target, prop) {
        var val = target[prop];
        if (typeof val === 'string' && val.includes('oklch')) {
          return '#000000';
        }
        if (typeof val === 'function') return val.bind(target);
        return val;
      }
    });
  };
})();
