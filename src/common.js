exports.debug = false;
exports.perfs = false;
exports.voidElements = ["AREA","BASE","BR","COL","COMMAND","EMBED","HR","IMG","INPUT","KEYGEN","LINK","META","PARAM","SOURCE","TRACK","WBR"];
exports.events = ['wheel','scroll','touchcancel','touchend','touchmove','touchstart','click','doubleclick','drag','dragend','dragenter','dragexit','dragleave','dragover','dragstart','drop','change','input','submit','focus','blur','keydown','keypress','keyup','copy','cut','paste','mousedown','mouseenter','mouseleave','mousemove','mouseout','mouseover','mouseup'];
    
// redraw with requestAnimationFrame (https://developer.mozilla.org/fr/docs/Web/API/window.requestAnimationFrame)
// perfs measures (http://www.html5rocks.com/en/tutorials/webperformance/usertiming/)
window.performance = window.performance || {
  mark: function() {},
  measure: function() {},
  getEntriesByName: function() { return []; },
  getEntriesByType: function() { return []; },
  clearMarks: function() {},
  clearMeasures: function() {}
};

window.requestAnimationFrame = 
    window.requestAnimationFrame || 
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || 
    window.msRequestAnimationFrame || 
    (function() {
        if (window.console) console.error('No requestAnimationFrame, using lame polyfill ...');
        return function(callback, element){
            window.setTimeout(callback, 1000 / 60);
        }    
    })();

var ElemMeasureStart = 'ElemMeasureStart';
var ElemMeasureStop = 'ElemMeasureStop';
var ElemMeasure = 'ElemComponentRenderingMeasure';
var names = [ElemMeasure];

exports.markStart = function(name) {
  if (exports.perfs) {
    if (name) {
      window.performance.mark(name + '_start');
    } else {
      window.performance.mark(ElemMeasureStart);
    }
  }
};

exports.markStop = function(name) {
  if (exports.perfs) {
    if (name) {
      window.performance.mark(name + '_stop');
      window.performance.measure(name, name + '_start', name + '_stop');
      if (!_.contains(names, name)) names.push(name);
    } else {
      window.performance.mark(ElemMeasureStop);
      window.performance.measure(ElemMeasure, ElemMeasureStart, ElemMeasureStop);
    }
  }
};

exports.collectMeasures = function() {
  if (!exports.perfs) return [];
  var results = [];
  _.each(names, function(name) {
    results = results.concat(window.performance.getEntriesByName(name));
  });
  window.performance.clearMarks();
  window.performance.clearMeasures();
  names = [ElemMeasure];
  return results;
};

exports.printMeasures = function() {
  if (!exports.perfs) return;
  if (window.console) console.table(exports.collectMeasures());
};

exports.defer = function(cb) {
    window.requestAnimationFrame.call(window, cb);
};

exports.defered = function(cb) {
    return function() {
        exports.defer(cb);
    };
};