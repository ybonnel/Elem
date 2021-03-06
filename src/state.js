var _ = require('./utils');

module.exports = function(mod) {

  var theModel = _.extend({}, mod || {});

  var callbacks = [];

  function fireCallbacks() {
    _.each(callbacks, function(callback) {
      callback();
    });
  }

  var api = function() {
    return _.clone(theModel);
  };

  function set(obj, silentOrCallback) {
    var silent = _.isBoolean(silentOrCallback) && silentOrCallback === true;
    if (!_.isUndefined(obj) && _.isObject(obj)) {
      _.map(_.keys(obj), function(k) {
        theModel[k] = obj[k];
      });
      if (!silent) fireCallbacks();
      if (!silent)(silentOrCallback || function() {})();
    }
  }

  return _.extend(api, {
    onChange: function(callback) {
      callbacks.push(callback);
    },
    get: function(key) {
      return theModel[key];
    },
    all: function() {
      return _.clone(theModel);
    },
    forceUpdate: function() {
      fireCallbacks();
    },
    set: set,
    replace: function(obj, silentOrCallback) {
      theModel = {};
      set(obj, silentOrCallback);
    },
    remove: function(key) {
      delete theModel[key];
      fireCallbacks();
    }
  });
};
