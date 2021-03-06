/**
 * @license predicate.js
 * (c) 2014-2016 Trevor Landau <landautrevor@gmail.com> @trevor_landau
 * predicate.js may be freely distributed under the MIT license.
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.predicate = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var utils = require('./lib/utils');
var predicate = {};
predicate.VERSION = '1.0.0';

[utils, require('./lib/predicates'), require('./lib/chain'), require('./lib/other')].reduce(utils.assign, predicate);

module.exports = predicate;

},{"./lib/chain":2,"./lib/other":3,"./lib/predicates":4,"./lib/utils":5}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var predicates = require('./predicates');
var predicate = module.exports;

// chaining mixin

var Lazy = function () {
  function Lazy() {
    _classCallCheck(this, Lazy);

    this.lazy = [];
  }

  _createClass(Lazy, [{
    key: 'valueOf',
    value: function valueOf() {
      return this.val();
    }
  }, {
    key: 'val',
    value: function val() {
      return this.lazy[this.method](function (args) {
        return args[0].apply(null, args[1]);
      });
    }
  }]);

  return Lazy;
}();

var Every = function (_Lazy) {
  _inherits(Every, _Lazy);

  function Every() {
    _classCallCheck(this, Every);

    var _this = _possibleConstructorReturn(this, (Every.__proto__ || Object.getPrototypeOf(Every)).call(this));

    _this.method = 'every';
    return _this;
  }

  return Every;
}(Lazy);

var Some = function (_Lazy2) {
  _inherits(Some, _Lazy2);

  function Some() {
    _classCallCheck(this, Some);

    var _this2 = _possibleConstructorReturn(this, (Some.__proto__ || Object.getPrototypeOf(Some)).call(this));

    _this2.method = 'some';
    return _this2;
  }

  return Some;
}(Lazy);

// Extend chaining methods onto the prototypes


[Every, Some].forEach(function (cls) {
  Object.keys(predicates).reduce(function (proto, fnName) {
    if (!predicates.fn(predicates[fnName])) return proto;

    proto[fnName] = function () {
      this.lazy.push([predicates[fnName], arguments]);
      return this;
    };

    return proto;
  }, cls.prototype);
});

predicate.all = predicate.every = function () {
  return new Every();
};

predicate.any = predicate.some = function () {
  return new Some();
};

},{"./predicates":4}],3:[function(require,module,exports){
'use strict';

var predicates = require('./predicates');
var utils = require('./utils');
var predicate = module.exports;

predicate.ternary = function (pred, a, b) {
  if (predicates.bool(pred)) return pred ? a : b;
  if (predicates.undef(a)) return utils.partial(predicate.ternary, pred);
  if (predicates.undef(b)) return utils.partial(predicate.ternary, pred, a);
  return predicate.ternary(pred(a, b), a, b);
};

var _every = Array.prototype.every;
var _some = Array.prototype.some;

predicate.and = function () {
  var predicates = arguments;

  return function _and(val) {
    return _every.call(predicates, function (p) {
      return p(val);
    });
  };
};

predicate.or = function () {
  var predicates = arguments;

  return function _or(val) {
    return _some.call(predicates, function (p) {
      return p(val);
    });
  };
};

},{"./predicates":4,"./utils":5}],4:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var utils = require('./utils');
var predicate = module.exports;

var curry = utils.curry;

if (Object.is) {
  predicate.is = curry(Object.is);
} else {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
  predicate.is = curry(function (v1, v2) {
    if (v1 === 0 && v2 === 0) {
      return 1 / v1 === 1 / v2;
    }
    if (v1 !== v1) {
      return v2 !== v2;
    }
    return v1 === v2;
  });
}

predicate.exists = function (val) {
  return val != null;
};

predicate.truthy = function (val) {
  // coerce for null != null
  return !!(val && predicate.exists(val));
};

predicate.falsey = utils.complement(predicate.truthy);

//---- value comparision methods

predicate.equal = curry(function (a, b) {
  return a === b;
});

predicate.eq = curry(function (a, b) {
  return a == b;
});

predicate.null = predicate.equal(null);
predicate.undef = predicate.equal(undefined);

predicate.lt = predicate.less = curry(function (a, b) {
  return a < b;
});

predicate.ltEq = predicate.le = predicate.lessEq = curry(function (a, b) {
  return predicate.equal(a, b) || predicate.less(a, b);
});

predicate.gt = predicate.greater = curry(function (a, b) {
  return a > b;
});

predicate.gtEq = predicate.ge = predicate.greaterEq = curry(function (a, b) {
  return predicate.equal(a, b) || predicate.greater(a, b);
});

// --- Type checking predicates

// Forces objects toString called returned as [object Object] for instance
var __toString = Object.prototype.toString;
var eqToStr = curry(function (str, val) {
  return predicate.equal(str, __toString.call(val));
});

//---- Object type checks

predicate.object = predicate.obj = function (val) {
  return val === Object(val);
};

predicate.array = predicate.arr = Array.isArray || eqToStr('[object Array]');
predicate.date = eqToStr('[object Date]');
predicate.regex = predicate.regexp = predicate.rgx = predicate.RegExp = eqToStr('[object RegExp]');

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite
predicate.finite = Number.isFinite || function (val) {
  return predicate.number(val) && isFinite(val);
};

predicate.nan = predicate.NaN = predicate.is(NaN);

predicate.instance = curry(function (Cls, inst) {
  return inst instanceof Cls;
});

predicate.arguments = eqToStr('[object Arguments]');
predicate.error = predicate.instance(Error);

// creates fns for predicate.string, etc
var typeofBuilder = curry(function (type, val) {
  return predicate.equal(type, typeof val === 'undefined' ? 'undefined' : _typeof(val));
});

//--- Create typeof methods

// type of string and alias name
// predicate.fn, predicate.num, etc
[['function', 'fn'], ['string', 'str'], ['boolean', 'bool']].reduce(function (predicate, type) {
  predicate[type[0]] = predicate[type[1]] = typeofBuilder(type[0]);
  return predicate;
}, predicate);

predicate.number = predicate.num = function (val) {
  return typeof val === 'number' && predicate.not.NaN(val);
};

predicate.int = function (val) {
  return predicate.num(val) && predicate.zero(utils.mod(val, 1));
};

predicate.pos = function (val) {
  return predicate.num(val) && predicate.greater(val, 0);
};

predicate.neg = function (val) {
  return predicate.num(val) && predicate.less(val, 0);
};

predicate.zero = function (val) {
  return predicate.num(val) && predicate.equal(val, 0);
};

predicate.even = function (val) {
  return predicate.num(val) && predicate.not.zero(val) && predicate.zero(utils.mod(val, 2));
};

predicate.odd = function (val) {
  return predicate.num(val) && predicate.not.zero(val) && predicate.not.zero(utils.mod(val, 2));
};

predicate.contains = predicate.includes = curry(function (arrOrString, val) {
  if (!predicate.array(arrOrString) && !predicate.string(arrOrString)) {
    throw new TypeError('Expected an array or string');
  }

  if (predicate.string(arrOrString) && !predicate.string(val)) {
    return false;
  }

  if (predicate.NaN(val)) {
    return arrOrString.some(predicate.NaN);
  }

  return !!~arrOrString.indexOf(val);
});

var __has = Object.prototype.hasOwnProperty;
predicate.has = curry(function (o, key) {
  return __has.call(o, key);
});

predicate.empty = function (o) {
  if (predicate.not.exists(o)) return true;
  if (predicate.arr(o) || predicate.str(o)) return !o.length;
  if (predicate.obj(o)) {
    for (var k in o) {
      if (predicate.has(o, k)) return false;
    }return true;
  }
  throw new TypeError();
};

predicate.primitive = function (val) {
  return predicate.string(val) || predicate.num(val) || predicate.bool(val) || predicate.null(val) || predicate.undef(val) || predicate.NaN(val);
};

predicate.matches = curry(function (rgx, val) {
  return rgx.test(val);
});

// Assign inverse of each predicate
predicate.not = Object.keys(predicate).reduce(function (acc, fnName) {
  acc[fnName] = utils.complement(predicate[fnName]);
  return acc;
}, {});

},{"./utils":5}],5:[function(require,module,exports){
'use strict';

var predicate = module.exports;
var _slice = Array.prototype.slice;

// Useful for debuging curried functions
var setSrc = function setSrc(curried, src) {
  curried.toString = function () {
    return src.toString();
  };
  curried.src = src;
  return curried;
};

// Curry's fn's with arity 2
var curry = predicate.curry = function (f) {
  return setSrc(function curried(a, b) {
    switch (arguments.length) {
      case 0:
        throw new TypeError('Function called with no arguments');
      case 1:
        return setSrc(function (b) {
          return f(a, b);
        }, f);
    }

    return f(a, b);
  }, f);
};

// TODO: es6ing this breaks!
predicate.partial = function (fn) {
  var args = _slice.call(arguments, 1);
  return function () {
    return fn.apply(null, args.concat(_slice.call(arguments)));
  };
};

predicate.complement = predicate.invert = function (pred) {
  return function () {
    var ret = pred.apply(null, arguments);
    // Handle curried fns
    if (typeof ret === 'function') return predicate.complement(ret);
    return !ret;
  };
};

predicate.mod = curry(function (a, b) {
  return a % b;
});

// assign b's props to a
predicate.assign = curry(Object.assign || function (a, b) {
  // use crummy for/in for perf purposes
  for (var prop in b) {
    if (b.hasOwnProperty(prop)) {
      a[prop] = b[prop];
    }
  }

  return a;
});

},{}]},{},[1])(1)
});