var _ = require('./utils');

var globalObject = _.memoGobalObject();

exports.debug = false;
exports.perfs = false;
exports.voidElements = ["AREA", "BASE", "BR", "COL", "COMMAND", "EMBED", "HR", "IMG", "INPUT", "KEYGEN", "LINK", "META", "PARAM", "SOURCE", "TRACK", "WBR"];
exports.events = ['wheel', 'scroll', 'touchcancel', 'touchend', 'touchmove', 'touchstart', 'click', 'doubleclick', 'drag', 'dragend', 'dragenter', 'dragexit', 'dragleave', 'dragover', 'dragstart', 'drop', 'change', 'input', 'submit', 'focus', 'blur', 'keydown', 'keypress', 'keyup', 'copy', 'cut', 'paste', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup'];

// redraw with requestAnimationFrame (https://developer.mozilla.org/fr/docs/Web/API/window.requestAnimationFrame)
// perfs measures (http://www.html5rocks.com/en/tutorials/webperformance/usertiming/)
var Performances = {
  mark: function() {},
  measure: function() {},
  getEntriesByName: function() {
    return [];
  },
  getEntriesByType: function() {
    return [];
  },
  clearMarks: function() {},
  clearMeasures: function() {}
};

// Avoid some issues in non browser environments
if (typeof globalObject === 'undefined') {
  globalObject = {
    __fake: true
  };
}
// Avoid some issues in older browsers
if (typeof globalObject.console === 'undefined') {
  globalObject.console = {
    log: function() {},
    error: function() {},
    table: function() {},
    debug: function() {},
    trace: function() {}
  };
}

if (typeof globalObject.performance !== 'undefined' && typeof globalObject.performance.mark !== 'undefined' && typeof globalObject.performance.measure !== 'undefined') {
  Performances = globalObject.performance;
}

globalObject.requestAnimationFrame =
  globalObject.requestAnimationFrame ||
  globalObject.mozRequestAnimationFrame ||
  globalObject.webkitRequestAnimationFrame ||
  globalObject.msRequestAnimationFrame ||
  (function() {
    if (globalObject.console) console.error('[ELEMJS] No requestAnimationFrame, using lame polyfill ...');
    return function(callback, element) {
      globalObject.setTimeout(callback, 1000 / 60);
    }
  })();

var ElemMeasureStart = 'ElemMeasureStart';
var ElemMeasureStop = 'ElemMeasureStop';
var ElemMeasure = 'ElemComponentRenderingMeasure';
var names = [ElemMeasure];

exports.markStart = function(name) {
  if (exports.perfs) {
    if (name) {
      Performances.mark(name + '_start');
    } else {
      Performances.mark(ElemMeasureStart);
    }
  }
};

exports.markStop = function(name) {
  if (exports.perfs) {
    if (name) {
      Performances.mark(name + '_stop');
      Performances.measure(name, name + '_start', name + '_stop');
      if (!_.contains(names, name)) names.push(name);
    } else {
      Performances.mark(ElemMeasureStop);
      Performances.measure(ElemMeasure, ElemMeasureStart, ElemMeasureStop);
    }
  }
};

exports.collectMeasures = function() {
  if (!exports.perfs) return [];
  var results = [];
  _.each(names, function(name) {
    results = results.concat(Performances.getEntriesByName(name));
  });
  Performances.clearMarks();
  Performances.clearMeasures();
  names = [ElemMeasure];
  return results;
};

exports.printMeasures = function() {
  if (!exports.perfs) return;
  if (globalObject.console) console.table(exports.collectMeasures());
};

exports.defer = function(cb) {
  globalObject.requestAnimationFrame.call(globalObject, cb);
};

exports.defered = function(cb) {
  return function() {
    exports.defer(cb);
  };
};

exports.__internalAccess = {};

if (!Function.prototype.bind) {
  if (globalObject.console) console.error('[ELEMJS] No Function.prototype.bind, using polyfill ...');
  Function.prototype.bind = function(oThis) {
    if (typeof this !== "function") {
      throw new TypeError("Function.prototype.bind - can't call bounded element");
    }
    var aArgs = Array.prototype.slice.call(arguments, 1);
    var fToBind = this;
    var fNOP = function() {};
    var fBound = function() {
      return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
        aArgs.concat(Array.prototype.slice.call(arguments)));
    };
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
  };
}
