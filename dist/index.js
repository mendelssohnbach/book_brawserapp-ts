/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/atoa/atoa.js":
/*!***********************************!*\
  !*** ./node_modules/atoa/atoa.js ***!
  \***********************************/
/***/ ((module) => {

module.exports = function atoa (a, n) { return Array.prototype.slice.call(a, n); }


/***/ }),

/***/ "./node_modules/contra/debounce.js":
/*!*****************************************!*\
  !*** ./node_modules/contra/debounce.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var ticky = __webpack_require__(/*! ticky */ "./node_modules/ticky/ticky-browser.js");

module.exports = function debounce (fn, args, ctx) {
  if (!fn) { return; }
  ticky(function run () {
    fn.apply(ctx || null, args || []);
  });
};


/***/ }),

/***/ "./node_modules/contra/emitter.js":
/*!****************************************!*\
  !*** ./node_modules/contra/emitter.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var atoa = __webpack_require__(/*! atoa */ "./node_modules/atoa/atoa.js");
var debounce = __webpack_require__(/*! ./debounce */ "./node_modules/contra/debounce.js");

module.exports = function emitter (thing, options) {
  var opts = options || {};
  var evt = {};
  if (thing === undefined) { thing = {}; }
  thing.on = function (type, fn) {
    if (!evt[type]) {
      evt[type] = [fn];
    } else {
      evt[type].push(fn);
    }
    return thing;
  };
  thing.once = function (type, fn) {
    fn._once = true; // thing.off(fn) still works!
    thing.on(type, fn);
    return thing;
  };
  thing.off = function (type, fn) {
    var c = arguments.length;
    if (c === 1) {
      delete evt[type];
    } else if (c === 0) {
      evt = {};
    } else {
      var et = evt[type];
      if (!et) { return thing; }
      et.splice(et.indexOf(fn), 1);
    }
    return thing;
  };
  thing.emit = function () {
    var args = atoa(arguments);
    return thing.emitterSnapshot(args.shift()).apply(this, args);
  };
  thing.emitterSnapshot = function (type) {
    var et = (evt[type] || []).slice(0);
    return function () {
      var args = atoa(arguments);
      var ctx = this || thing;
      if (type === 'error' && opts.throws !== false && !et.length) { throw args.length === 1 ? args[0] : args; }
      et.forEach(function emitter (listen) {
        if (opts.async) { debounce(listen, args, ctx); } else { listen.apply(ctx, args); }
        if (listen._once) { thing.off(type, listen); }
      });
      return thing;
    };
  };
  return thing;
};


/***/ }),

/***/ "./node_modules/crossvent/src/crossvent.js":
/*!*************************************************!*\
  !*** ./node_modules/crossvent/src/crossvent.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var customEvent = __webpack_require__(/*! custom-event */ "./node_modules/custom-event/index.js");
var eventmap = __webpack_require__(/*! ./eventmap */ "./node_modules/crossvent/src/eventmap.js");
var doc = __webpack_require__.g.document;
var addEvent = addEventEasy;
var removeEvent = removeEventEasy;
var hardCache = [];

if (!__webpack_require__.g.addEventListener) {
  addEvent = addEventHard;
  removeEvent = removeEventHard;
}

module.exports = {
  add: addEvent,
  remove: removeEvent,
  fabricate: fabricateEvent
};

function addEventEasy (el, type, fn, capturing) {
  return el.addEventListener(type, fn, capturing);
}

function addEventHard (el, type, fn) {
  return el.attachEvent('on' + type, wrap(el, type, fn));
}

function removeEventEasy (el, type, fn, capturing) {
  return el.removeEventListener(type, fn, capturing);
}

function removeEventHard (el, type, fn) {
  var listener = unwrap(el, type, fn);
  if (listener) {
    return el.detachEvent('on' + type, listener);
  }
}

function fabricateEvent (el, type, model) {
  var e = eventmap.indexOf(type) === -1 ? makeCustomEvent() : makeClassicEvent();
  if (el.dispatchEvent) {
    el.dispatchEvent(e);
  } else {
    el.fireEvent('on' + type, e);
  }
  function makeClassicEvent () {
    var e;
    if (doc.createEvent) {
      e = doc.createEvent('Event');
      e.initEvent(type, true, true);
    } else if (doc.createEventObject) {
      e = doc.createEventObject();
    }
    return e;
  }
  function makeCustomEvent () {
    return new customEvent(type, { detail: model });
  }
}

function wrapperFactory (el, type, fn) {
  return function wrapper (originalEvent) {
    var e = originalEvent || __webpack_require__.g.event;
    e.target = e.target || e.srcElement;
    e.preventDefault = e.preventDefault || function preventDefault () { e.returnValue = false; };
    e.stopPropagation = e.stopPropagation || function stopPropagation () { e.cancelBubble = true; };
    e.which = e.which || e.keyCode;
    fn.call(el, e);
  };
}

function wrap (el, type, fn) {
  var wrapper = unwrap(el, type, fn) || wrapperFactory(el, type, fn);
  hardCache.push({
    wrapper: wrapper,
    element: el,
    type: type,
    fn: fn
  });
  return wrapper;
}

function unwrap (el, type, fn) {
  var i = find(el, type, fn);
  if (i) {
    var wrapper = hardCache[i].wrapper;
    hardCache.splice(i, 1); // free up a tad of memory
    return wrapper;
  }
}

function find (el, type, fn) {
  var i, item;
  for (i = 0; i < hardCache.length; i++) {
    item = hardCache[i];
    if (item.element === el && item.type === type && item.fn === fn) {
      return i;
    }
  }
}


/***/ }),

/***/ "./node_modules/crossvent/src/eventmap.js":
/*!************************************************!*\
  !*** ./node_modules/crossvent/src/eventmap.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var eventmap = [];
var eventname = '';
var ron = /^on/;

for (eventname in __webpack_require__.g) {
  if (ron.test(eventname)) {
    eventmap.push(eventname.slice(2));
  }
}

module.exports = eventmap;


/***/ }),

/***/ "./node_modules/custom-event/index.js":
/*!********************************************!*\
  !*** ./node_modules/custom-event/index.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var NativeCustomEvent = __webpack_require__.g.CustomEvent;

function useNative () {
  try {
    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return  'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {
  }
  return false;
}

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
 *
 * @public
 */

module.exports = useNative() ? NativeCustomEvent :

// IE >= 9
'undefined' !== typeof document && 'function' === typeof document.createEvent ? function CustomEvent (type, params) {
  var e = document.createEvent('CustomEvent');
  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, void 0);
  }
  return e;
} :

// IE <= 8
function CustomEvent (type, params) {
  var e = document.createEventObject();
  e.type = type;
  if (params) {
    e.bubbles = Boolean(params.bubbles);
    e.cancelable = Boolean(params.cancelable);
    e.detail = params.detail;
  } else {
    e.bubbles = false;
    e.cancelable = false;
    e.detail = void 0;
  }
  return e;
}


/***/ }),

/***/ "./node_modules/dragula/classes.js":
/*!*****************************************!*\
  !*** ./node_modules/dragula/classes.js ***!
  \*****************************************/
/***/ ((module) => {

"use strict";


var cache = {};
var start = '(?:^|\\s)';
var end = '(?:\\s|$)';

function lookupClass (className) {
  var cached = cache[className];
  if (cached) {
    cached.lastIndex = 0;
  } else {
    cache[className] = cached = new RegExp(start + className + end, 'g');
  }
  return cached;
}

function addClass (el, className) {
  var current = el.className;
  if (!current.length) {
    el.className = className;
  } else if (!lookupClass(className).test(current)) {
    el.className += ' ' + className;
  }
}

function rmClass (el, className) {
  el.className = el.className.replace(lookupClass(className), ' ').trim();
}

module.exports = {
  add: addClass,
  rm: rmClass
};


/***/ }),

/***/ "./node_modules/dragula/dragula.js":
/*!*****************************************!*\
  !*** ./node_modules/dragula/dragula.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var emitter = __webpack_require__(/*! contra/emitter */ "./node_modules/contra/emitter.js");
var crossvent = __webpack_require__(/*! crossvent */ "./node_modules/crossvent/src/crossvent.js");
var classes = __webpack_require__(/*! ./classes */ "./node_modules/dragula/classes.js");
var doc = document;
var documentElement = doc.documentElement;

function dragula (initialContainers, options) {
  var len = arguments.length;
  if (len === 1 && Array.isArray(initialContainers) === false) {
    options = initialContainers;
    initialContainers = [];
  }
  var _mirror; // mirror image
  var _source; // source container
  var _item; // item being dragged
  var _offsetX; // reference x
  var _offsetY; // reference y
  var _moveX; // reference move x
  var _moveY; // reference move y
  var _initialSibling; // reference sibling when grabbed
  var _currentSibling; // reference sibling now
  var _copy; // item used for copying
  var _renderTimer; // timer for setTimeout renderMirrorImage
  var _lastDropTarget = null; // last container item was over
  var _grabbed; // holds mousedown context until first mousemove

  var o = options || {};
  if (o.moves === void 0) { o.moves = always; }
  if (o.accepts === void 0) { o.accepts = always; }
  if (o.invalid === void 0) { o.invalid = invalidTarget; }
  if (o.containers === void 0) { o.containers = initialContainers || []; }
  if (o.isContainer === void 0) { o.isContainer = never; }
  if (o.copy === void 0) { o.copy = false; }
  if (o.copySortSource === void 0) { o.copySortSource = false; }
  if (o.revertOnSpill === void 0) { o.revertOnSpill = false; }
  if (o.removeOnSpill === void 0) { o.removeOnSpill = false; }
  if (o.direction === void 0) { o.direction = 'vertical'; }
  if (o.ignoreInputTextSelection === void 0) { o.ignoreInputTextSelection = true; }
  if (o.mirrorContainer === void 0) { o.mirrorContainer = doc.body; }

  var drake = emitter({
    containers: o.containers,
    start: manualStart,
    end: end,
    cancel: cancel,
    remove: remove,
    destroy: destroy,
    canMove: canMove,
    dragging: false
  });

  if (o.removeOnSpill === true) {
    drake.on('over', spillOver).on('out', spillOut);
  }

  events();

  return drake;

  function isContainer (el) {
    return drake.containers.indexOf(el) !== -1 || o.isContainer(el);
  }

  function events (remove) {
    var op = remove ? 'remove' : 'add';
    touchy(documentElement, op, 'mousedown', grab);
    touchy(documentElement, op, 'mouseup', release);
  }

  function eventualMovements (remove) {
    var op = remove ? 'remove' : 'add';
    touchy(documentElement, op, 'mousemove', startBecauseMouseMoved);
  }

  function movements (remove) {
    var op = remove ? 'remove' : 'add';
    crossvent[op](documentElement, 'selectstart', preventGrabbed); // IE8
    crossvent[op](documentElement, 'click', preventGrabbed);
  }

  function destroy () {
    events(true);
    release({});
  }

  function preventGrabbed (e) {
    if (_grabbed) {
      e.preventDefault();
    }
  }

  function grab (e) {
    _moveX = e.clientX;
    _moveY = e.clientY;

    var ignore = whichMouseButton(e) !== 1 || e.metaKey || e.ctrlKey;
    if (ignore) {
      return; // we only care about honest-to-god left clicks and touch events
    }
    var item = e.target;
    var context = canStart(item);
    if (!context) {
      return;
    }
    _grabbed = context;
    eventualMovements();
    if (e.type === 'mousedown') {
      if (isInput(item)) { // see also: https://github.com/bevacqua/dragula/issues/208
        item.focus(); // fixes https://github.com/bevacqua/dragula/issues/176
      } else {
        e.preventDefault(); // fixes https://github.com/bevacqua/dragula/issues/155
      }
    }
  }

  function startBecauseMouseMoved (e) {
    if (!_grabbed) {
      return;
    }
    if (whichMouseButton(e) === 0) {
      release({});
      return; // when text is selected on an input and then dragged, mouseup doesn't fire. this is our only hope
    }

    // truthy check fixes #239, equality fixes #207, fixes #501
    if ((e.clientX !== void 0 && Math.abs(e.clientX - _moveX) <= (o.slideFactorX || 0)) &&
      (e.clientY !== void 0 && Math.abs(e.clientY - _moveY) <= (o.slideFactorY || 0))) {
      return;
    }

    if (o.ignoreInputTextSelection) {
      var clientX = getCoord('clientX', e) || 0;
      var clientY = getCoord('clientY', e) || 0;
      var elementBehindCursor = doc.elementFromPoint(clientX, clientY);
      if (isInput(elementBehindCursor)) {
        return;
      }
    }

    var grabbed = _grabbed; // call to end() unsets _grabbed
    eventualMovements(true);
    movements();
    end();
    start(grabbed);

    var offset = getOffset(_item);
    _offsetX = getCoord('pageX', e) - offset.left;
    _offsetY = getCoord('pageY', e) - offset.top;

    classes.add(_copy || _item, 'gu-transit');
    renderMirrorImage();
    drag(e);
  }

  function canStart (item) {
    if (drake.dragging && _mirror) {
      return;
    }
    if (isContainer(item)) {
      return; // don't drag container itself
    }
    var handle = item;
    while (getParent(item) && isContainer(getParent(item)) === false) {
      if (o.invalid(item, handle)) {
        return;
      }
      item = getParent(item); // drag target should be a top element
      if (!item) {
        return;
      }
    }
    var source = getParent(item);
    if (!source) {
      return;
    }
    if (o.invalid(item, handle)) {
      return;
    }

    var movable = o.moves(item, source, handle, nextEl(item));
    if (!movable) {
      return;
    }

    return {
      item: item,
      source: source
    };
  }

  function canMove (item) {
    return !!canStart(item);
  }

  function manualStart (item) {
    var context = canStart(item);
    if (context) {
      start(context);
    }
  }

  function start (context) {
    if (isCopy(context.item, context.source)) {
      _copy = context.item.cloneNode(true);
      drake.emit('cloned', _copy, context.item, 'copy');
    }

    _source = context.source;
    _item = context.item;
    _initialSibling = _currentSibling = nextEl(context.item);

    drake.dragging = true;
    drake.emit('drag', _item, _source);
  }

  function invalidTarget () {
    return false;
  }

  function end () {
    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    drop(item, getParent(item));
  }

  function ungrab () {
    _grabbed = false;
    eventualMovements(true);
    movements(true);
  }

  function release (e) {
    ungrab();

    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    var clientX = getCoord('clientX', e) || 0;
    var clientY = getCoord('clientY', e) || 0;
    var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
    var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
    if (dropTarget && ((_copy && o.copySortSource) || (!_copy || dropTarget !== _source))) {
      drop(item, dropTarget);
    } else if (o.removeOnSpill) {
      remove();
    } else {
      cancel();
    }
  }

  function drop (item, target) {
    var parent = getParent(item);
    if (_copy && o.copySortSource && target === _source) {
      parent.removeChild(_item);
    }
    if (isInitialPlacement(target)) {
      drake.emit('cancel', item, _source, _source);
    } else {
      drake.emit('drop', item, target, _source, _currentSibling);
    }
    cleanup();
  }

  function remove () {
    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    var parent = getParent(item);
    if (parent) {
      parent.removeChild(item);
    }
    drake.emit(_copy ? 'cancel' : 'remove', item, parent, _source);
    cleanup();
  }

  function cancel (revert) {
    if (!drake.dragging) {
      return;
    }
    var reverts = arguments.length > 0 ? revert : o.revertOnSpill;
    var item = _copy || _item;
    var parent = getParent(item);
    var initial = isInitialPlacement(parent);
    if (initial === false && reverts) {
      if (_copy) {
        if (parent) {
          parent.removeChild(_copy);
        }
      } else {
        _source.insertBefore(item, _initialSibling);
      }
    }
    if (initial || reverts) {
      drake.emit('cancel', item, _source, _source);
    } else {
      drake.emit('drop', item, parent, _source, _currentSibling);
    }
    cleanup();
  }

  function cleanup () {
    var item = _copy || _item;
    ungrab();
    removeMirrorImage();
    if (item) {
      classes.rm(item, 'gu-transit');
    }
    if (_renderTimer) {
      clearTimeout(_renderTimer);
    }
    drake.dragging = false;
    if (_lastDropTarget) {
      drake.emit('out', item, _lastDropTarget, _source);
    }
    drake.emit('dragend', item);
    _source = _item = _copy = _initialSibling = _currentSibling = _renderTimer = _lastDropTarget = null;
  }

  function isInitialPlacement (target, s) {
    var sibling;
    if (s !== void 0) {
      sibling = s;
    } else if (_mirror) {
      sibling = _currentSibling;
    } else {
      sibling = nextEl(_copy || _item);
    }
    return target === _source && sibling === _initialSibling;
  }

  function findDropTarget (elementBehindCursor, clientX, clientY) {
    var target = elementBehindCursor;
    while (target && !accepted()) {
      target = getParent(target);
    }
    return target;

    function accepted () {
      var droppable = isContainer(target);
      if (droppable === false) {
        return false;
      }

      var immediate = getImmediateChild(target, elementBehindCursor);
      var reference = getReference(target, immediate, clientX, clientY);
      var initial = isInitialPlacement(target, reference);
      if (initial) {
        return true; // should always be able to drop it right back where it was
      }
      return o.accepts(_item, target, _source, reference);
    }
  }

  function drag (e) {
    if (!_mirror) {
      return;
    }
    e.preventDefault();

    var clientX = getCoord('clientX', e) || 0;
    var clientY = getCoord('clientY', e) || 0;
    var x = clientX - _offsetX;
    var y = clientY - _offsetY;

    _mirror.style.left = x + 'px';
    _mirror.style.top = y + 'px';

    var item = _copy || _item;
    var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
    var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
    var changed = dropTarget !== null && dropTarget !== _lastDropTarget;
    if (changed || dropTarget === null) {
      out();
      _lastDropTarget = dropTarget;
      over();
    }
    var parent = getParent(item);
    if (dropTarget === _source && _copy && !o.copySortSource) {
      if (parent) {
        parent.removeChild(item);
      }
      return;
    }
    var reference;
    var immediate = getImmediateChild(dropTarget, elementBehindCursor);
    if (immediate !== null) {
      reference = getReference(dropTarget, immediate, clientX, clientY);
    } else if (o.revertOnSpill === true && !_copy) {
      reference = _initialSibling;
      dropTarget = _source;
    } else {
      if (_copy && parent) {
        parent.removeChild(item);
      }
      return;
    }
    if (
      (reference === null && changed) ||
      reference !== item &&
      reference !== nextEl(item)
    ) {
      _currentSibling = reference;
      dropTarget.insertBefore(item, reference);
      drake.emit('shadow', item, dropTarget, _source);
    }
    function moved (type) { drake.emit(type, item, _lastDropTarget, _source); }
    function over () { if (changed) { moved('over'); } }
    function out () { if (_lastDropTarget) { moved('out'); } }
  }

  function spillOver (el) {
    classes.rm(el, 'gu-hide');
  }

  function spillOut (el) {
    if (drake.dragging) { classes.add(el, 'gu-hide'); }
  }

  function renderMirrorImage () {
    if (_mirror) {
      return;
    }
    var rect = _item.getBoundingClientRect();
    _mirror = _item.cloneNode(true);
    _mirror.style.width = getRectWidth(rect) + 'px';
    _mirror.style.height = getRectHeight(rect) + 'px';
    classes.rm(_mirror, 'gu-transit');
    classes.add(_mirror, 'gu-mirror');
    o.mirrorContainer.appendChild(_mirror);
    touchy(documentElement, 'add', 'mousemove', drag);
    classes.add(o.mirrorContainer, 'gu-unselectable');
    drake.emit('cloned', _mirror, _item, 'mirror');
  }

  function removeMirrorImage () {
    if (_mirror) {
      classes.rm(o.mirrorContainer, 'gu-unselectable');
      touchy(documentElement, 'remove', 'mousemove', drag);
      getParent(_mirror).removeChild(_mirror);
      _mirror = null;
    }
  }

  function getImmediateChild (dropTarget, target) {
    var immediate = target;
    while (immediate !== dropTarget && getParent(immediate) !== dropTarget) {
      immediate = getParent(immediate);
    }
    if (immediate === documentElement) {
      return null;
    }
    return immediate;
  }

  function getReference (dropTarget, target, x, y) {
    var horizontal = o.direction === 'horizontal';
    var reference = target !== dropTarget ? inside() : outside();
    return reference;

    function outside () { // slower, but able to figure out any position
      var len = dropTarget.children.length;
      var i;
      var el;
      var rect;
      for (i = 0; i < len; i++) {
        el = dropTarget.children[i];
        rect = el.getBoundingClientRect();
        if (horizontal && (rect.left + rect.width / 2) > x) { return el; }
        if (!horizontal && (rect.top + rect.height / 2) > y) { return el; }
      }
      return null;
    }

    function inside () { // faster, but only available if dropped inside a child element
      var rect = target.getBoundingClientRect();
      if (horizontal) {
        return resolve(x > rect.left + getRectWidth(rect) / 2);
      }
      return resolve(y > rect.top + getRectHeight(rect) / 2);
    }

    function resolve (after) {
      return after ? nextEl(target) : target;
    }
  }

  function isCopy (item, container) {
    return typeof o.copy === 'boolean' ? o.copy : o.copy(item, container);
  }
}

function touchy (el, op, type, fn) {
  var touch = {
    mouseup: 'touchend',
    mousedown: 'touchstart',
    mousemove: 'touchmove'
  };
  var pointers = {
    mouseup: 'pointerup',
    mousedown: 'pointerdown',
    mousemove: 'pointermove'
  };
  var microsoft = {
    mouseup: 'MSPointerUp',
    mousedown: 'MSPointerDown',
    mousemove: 'MSPointerMove'
  };
  if (__webpack_require__.g.navigator.pointerEnabled) {
    crossvent[op](el, pointers[type], fn);
  } else if (__webpack_require__.g.navigator.msPointerEnabled) {
    crossvent[op](el, microsoft[type], fn);
  } else {
    crossvent[op](el, touch[type], fn);
    crossvent[op](el, type, fn);
  }
}

function whichMouseButton (e) {
  if (e.touches !== void 0) { return e.touches.length; }
  if (e.which !== void 0 && e.which !== 0) { return e.which; } // see https://github.com/bevacqua/dragula/issues/261
  if (e.buttons !== void 0) { return e.buttons; }
  var button = e.button;
  if (button !== void 0) { // see https://github.com/jquery/jquery/blob/99e8ff1baa7ae341e94bb89c3e84570c7c3ad9ea/src/event.js#L573-L575
    return button & 1 ? 1 : button & 2 ? 3 : (button & 4 ? 2 : 0);
  }
}

function getOffset (el) {
  var rect = el.getBoundingClientRect();
  return {
    left: rect.left + getScroll('scrollLeft', 'pageXOffset'),
    top: rect.top + getScroll('scrollTop', 'pageYOffset')
  };
}

function getScroll (scrollProp, offsetProp) {
  if (typeof __webpack_require__.g[offsetProp] !== 'undefined') {
    return __webpack_require__.g[offsetProp];
  }
  if (documentElement.clientHeight) {
    return documentElement[scrollProp];
  }
  return doc.body[scrollProp];
}

function getElementBehindPoint (point, x, y) {
  point = point || {};
  var state = point.className || '';
  var el;
  point.className += ' gu-hide';
  el = doc.elementFromPoint(x, y);
  point.className = state;
  return el;
}

function never () { return false; }
function always () { return true; }
function getRectWidth (rect) { return rect.width || (rect.right - rect.left); }
function getRectHeight (rect) { return rect.height || (rect.bottom - rect.top); }
function getParent (el) { return el.parentNode === doc ? null : el.parentNode; }
function isInput (el) { return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || isEditable(el); }
function isEditable (el) {
  if (!el) { return false; } // no parents were editable
  if (el.contentEditable === 'false') { return false; } // stop the lookup
  if (el.contentEditable === 'true') { return true; } // found a contentEditable element in the chain
  return isEditable(getParent(el)); // contentEditable is set to 'inherit'
}

function nextEl (el) {
  return el.nextElementSibling || manually();
  function manually () {
    var sibling = el;
    do {
      sibling = sibling.nextSibling;
    } while (sibling && sibling.nodeType !== 1);
    return sibling;
  }
}

function getEventHost (e) {
  // on touchend event, we have to use `e.changedTouches`
  // see http://stackoverflow.com/questions/7192563/touchend-event-properties
  // see https://github.com/bevacqua/dragula/issues/34
  if (e.targetTouches && e.targetTouches.length) {
    return e.targetTouches[0];
  }
  if (e.changedTouches && e.changedTouches.length) {
    return e.changedTouches[0];
  }
  return e;
}

function getCoord (coord, e) {
  var host = getEventHost(e);
  var missMap = {
    pageX: 'clientX', // IE8
    pageY: 'clientY' // IE8
  };
  if (coord in missMap && !(coord in host) && missMap[coord] in host) {
    coord = missMap[coord];
  }
  return host[coord];
}

module.exports = dragula;


/***/ }),

/***/ "./node_modules/ticky/ticky-browser.js":
/*!*********************************************!*\
  !*** ./node_modules/ticky/ticky-browser.js ***!
  \*********************************************/
/***/ ((module) => {

var si = typeof setImmediate === 'function', tick;
if (si) {
  tick = function (fn) { setImmediate(fn); };
} else {
  tick = function (fn) { setTimeout(fn, 0); };
}

module.exports = tick;

/***/ }),

/***/ "./ts/EventListener.ts":
/*!*****************************!*\
  !*** ./ts/EventListener.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EventListener": () => (/* binding */ EventListener)
/* harmony export */ });
class EventListener {
    constructor() {
        this.listeners = {};
    }
    add(listenerId, event, element, handler) {
        this.listeners[listenerId] = {
            event,
            element,
            handler,
        };
        element.addEventListener(event, handler);
    }
    remove(listenerId) {
        const listener = this.listeners[listenerId];
        if (!listener)
            return;
        listener.element.removeEventListener(listener.event, listener.handler);
        delete this.listeners[listenerId];
    }
}


/***/ }),

/***/ "./ts/Task.ts":
/*!********************!*\
  !*** ./ts/Task.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "statusMap": () => (/* binding */ statusMap),
/* harmony export */   "Task": () => (/* binding */ Task)
/* harmony export */ });
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/v4.js");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/validate.js");

const statusMap = {
    todo: 'TODO',
    doing: 'DOING',
    done: 'DONE',
};
class Task {
    constructor(properties) {
        this.id = properties.id || (0,uuid__WEBPACK_IMPORTED_MODULE_0__.default)();
        this.title = properties.title;
        this.status = properties.status || statusMap.todo;
    }
    update(properties) {
        this.title = properties.title || this.title;
        this.status = properties.status || this.status;
    }
    static validate(value) {
        if (!value)
            return false;
        if (!(0,uuid__WEBPACK_IMPORTED_MODULE_1__.default)(value.id))
            return false;
        if (!value.title)
            return false;
        if (!Object.values(statusMap).includes(value.status))
            return false;
        return true;
    }
}


/***/ }),

/***/ "./ts/TaskCollection.ts":
/*!******************************!*\
  !*** ./ts/TaskCollection.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TaskCollection": () => (/* binding */ TaskCollection)
/* harmony export */ });
/* harmony import */ var _Task__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Task */ "./ts/Task.ts");

const STORAGE_KEY = 'TASKS';
class TaskCollection {
    constructor() {
        this.storage = localStorage;
        this.tasks = this.getStoredTasks();
    }
    add(task) {
        this.tasks.push(task);
        this.updateStorage();
    }
    delete(task) {
        this.tasks = this.tasks.filter(({ id }) => id !== task.id);
        this.updateStorage();
    }
    find(id) {
        return this.tasks.find((task) => task.id === id);
    }
    update(task) {
        this.tasks = this.tasks.map((item) => {
            if (item.id === task.id)
                return task;
            return item;
        });
    }
    filter(filterStatus) {
        return this.tasks.filter(({ status }) => status === filterStatus);
    }
    moveAboveTarget(task, target) {
        const taskIndex = this.tasks.indexOf(task);
        const targetIndex = this.tasks.indexOf(target);
        this.changeOrder(task, taskIndex, taskIndex < targetIndex ? targetIndex - 1 : targetIndex);
    }
    moveToLast(task) {
        const taskIndex = this.tasks.indexOf(task);
        this.changeOrder(task, taskIndex, this.tasks.length);
    }
    changeOrder(task, taskIndex, targetIndex) {
        this.tasks.splice(taskIndex, 1);
        this.tasks.splice(targetIndex, 0, task);
        this.updateStorage();
    }
    updateStorage() {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
    }
    getStoredTasks() {
        const jsonString = this.storage.getItem(STORAGE_KEY);
        if (!jsonString)
            return [];
        try {
            const storedTasks = JSON.parse(jsonString);
            assertIsTaskObjects(storedTasks);
            const tasks = storedTasks.map((task) => new _Task__WEBPACK_IMPORTED_MODULE_0__.Task(task));
            return tasks;
        }
        catch (_a) {
            this.storage.removeItem(STORAGE_KEY);
            return [];
        }
    }
}
function assertIsTaskObjects(value) {
    if (!Array.isArray(value) || !value.every((item) => _Task__WEBPACK_IMPORTED_MODULE_0__.Task.validate(item))) {
        throw new Error('引数「value」は TaskObject[] 型と一致しません。');
    }
}


/***/ }),

/***/ "./ts/TaskRenderer.ts":
/*!****************************!*\
  !*** ./ts/TaskRenderer.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TaskRenderer": () => (/* binding */ TaskRenderer)
/* harmony export */ });
/* harmony import */ var dragula__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! dragula */ "./node_modules/dragula/dragula.js");
/* harmony import */ var dragula__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(dragula__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Task__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Task */ "./ts/Task.ts");


class TaskRenderer {
    constructor(todoList, doingList, doneList) {
        this.todoList = todoList;
        this.doingList = doingList;
        this.doneList = doneList;
    }
    append(task) {
        const { taskEl, deleteButtonEl } = this.render(task);
        this.todoList.append(taskEl);
        return { deleteButtonEl };
    }
    remove(task) {
        const taskEl = document.getElementById(task.id);
        if (!taskEl)
            return;
        if (task.status === _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.todo) {
            this.todoList.removeChild(taskEl);
        }
        if (task.status === _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.doing) {
            this.doingList.removeChild(taskEl);
        }
        if (task.status === _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.done) {
            this.doneList.removeChild(taskEl);
        }
    }
    subscribeDragAndDrop(onDrop) {
        dragula__WEBPACK_IMPORTED_MODULE_0___default()([this.todoList, this.doingList, this.doneList]).on('drop', (el, target, _source, sibling) => {
            let newStatus = _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.todo;
            if (target.id === 'doingList')
                newStatus = _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.doing;
            if (target.id === 'doneList')
                newStatus = _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.done;
            onDrop(el, sibling, newStatus);
        });
    }
    getId(el) {
        return el.id;
    }
    renderAll(taskCollection) {
        const todoTasks = this.renderList(taskCollection.filter(_Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.todo), this.todoList);
        const doingTasks = this.renderList(taskCollection.filter(_Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.doing), this.doingList);
        const doneTasks = this.renderList(taskCollection.filter(_Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.done), this.doneList);
        return [...todoTasks, ...doingTasks, ...doneTasks];
    }
    renderList(tasks, listEl) {
        if (tasks.length === 0)
            return [];
        const taskList = [];
        tasks.forEach((task) => {
            const { taskEl, deleteButtonEl } = this.render(task);
            listEl.append(taskEl);
            taskList.push({ task, deleteButtonEl });
        });
        return taskList;
    }
    render(task) {
        // <div class="taskItem">
        //   <span>タイトル</span>
        //   <button>削除</button>
        // </div>
        const taskEl = document.createElement('div');
        const spanEl = document.createElement('span');
        const deleteButtonEl = document.createElement('button');
        taskEl.id = task.id;
        taskEl.classList.add('task-item');
        spanEl.textContent = task.title;
        deleteButtonEl.textContent = '削除';
        taskEl.append(spanEl, deleteButtonEl);
        return { taskEl, deleteButtonEl };
    }
}


/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/regex.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/regex.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/rng.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/rng.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rng)
/* harmony export */ });
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
    // find the complete implementation of crypto (msCrypto) on IE11.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/stringify.js":
/*!*********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/stringify.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-browser/validate.js");

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

var byteToHex = [];

for (var i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__.default)(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stringify);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v4.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v4.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/esm-browser/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-browser/stringify.js");



function v4(options, buf, offset) {
  options = options || {};
  var rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (var i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.default)(rnds);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v4);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/validate.js":
/*!********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/validate.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ "./node_modules/uuid/dist/esm-browser/regex.js");


function validate(uuid) {
  return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__.default.test(uuid);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validate);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*********************!*\
  !*** ./ts/index.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _EventListener__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./EventListener */ "./ts/EventListener.ts");
/* harmony import */ var _Task__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Task */ "./ts/Task.ts");
/* harmony import */ var _TaskCollection__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TaskCollection */ "./ts/TaskCollection.ts");
/* harmony import */ var _TaskRenderer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./TaskRenderer */ "./ts/TaskRenderer.ts");




class Application {
    constructor() {
        this.eventListener = new _EventListener__WEBPACK_IMPORTED_MODULE_0__.EventListener();
        this.taskCollection = new _TaskCollection__WEBPACK_IMPORTED_MODULE_2__.TaskCollection();
        this.taskRenderer = new _TaskRenderer__WEBPACK_IMPORTED_MODULE_3__.TaskRenderer(document.getElementById('todoList'), document.getElementById('doingList'), document.getElementById('doneList'));
        this.handleSubmit = (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('title');
            if (!titleInput.value)
                return;
            const task = new _Task__WEBPACK_IMPORTED_MODULE_1__.Task({ title: titleInput.value });
            this.taskCollection.add(task);
            const { deleteButtonEl } = this.taskRenderer.append(task);
            this.eventListener.add(task.id, 'click', deleteButtonEl, () => this.handleClickDeleteTask(task));
            titleInput.value = '';
        };
        this.executeDeleteTask = (task) => {
            this.eventListener.remove(task.id);
            this.taskCollection.delete(task);
            this.taskRenderer.remove(task);
        };
        this.handleClickDeleteTask = (task) => {
            if (!window.confirm(`「${task.title}」を削除してよろしいですか？`))
                return;
            this.executeDeleteTask(task);
        };
        this.handleClickDeleteAllDoneTasks = () => {
            if (!window.confirm('DONE のタスクを一括削除してよろしいですか？'))
                return;
            const doneTasks = this.taskCollection.filter(_Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.done);
            doneTasks.forEach((task) => this.executeDeleteTask(task));
        };
        this.handleDropAndDrop = (el, sibling, newStatus) => {
            const taskId = this.taskRenderer.getId(el);
            if (!taskId)
                return;
            const task = this.taskCollection.find(taskId);
            if (!task)
                return;
            task.update({ status: newStatus });
            this.taskCollection.update(task);
            console.log(sibling);
        };
    }
    start() {
        const taskItems = this.taskRenderer.renderAll(this.taskCollection);
        const createForm = document.getElementById('createForm');
        const deleteAllDoneTaskButton = document.getElementById('deleteAllDoneTask');
        taskItems.forEach(({ task, deleteButtonEl }) => {
            this.eventListener.add(task.id, 'click', deleteButtonEl, () => this.handleClickDeleteTask(task));
        });
        this.eventListener.add('submit-handler', 'submit', createForm, this.handleSubmit);
        this.eventListener.add('click-handler', 'click', deleteAllDoneTaskButton, this.handleClickDeleteAllDoneTasks);
        this.taskRenderer.subscribeDragAndDrop(this.handleDropAndDrop);
    }
}
window.addEventListener('load', () => {
    const app = new Application();
    app.start();
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsd0NBQXdDOzs7Ozs7Ozs7Ozs7QUNBM0I7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLG9EQUFPOztBQUUzQjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7Ozs7Ozs7Ozs7QUNUYTs7QUFFYixXQUFXLG1CQUFPLENBQUMseUNBQU07QUFDekIsZUFBZSxtQkFBTyxDQUFDLHFEQUFZOztBQUVuQztBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxRUFBcUU7QUFDckU7QUFDQSwwQkFBMEIsK0JBQStCLE9BQU87QUFDaEUsNEJBQTRCO0FBQzVCLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNyRGE7O0FBRWIsa0JBQWtCLG1CQUFPLENBQUMsMERBQWM7QUFDeEMsZUFBZSxtQkFBTyxDQUFDLDREQUFZO0FBQ25DLFVBQVUscUJBQU07QUFDaEI7QUFDQTtBQUNBOztBQUVBLEtBQUsscUJBQU07QUFDWDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxlQUFlO0FBQ2xEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDZCQUE2QixxQkFBTTtBQUNuQztBQUNBLHdFQUF3RTtBQUN4RSwyRUFBMkU7QUFDM0U7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWMsc0JBQXNCO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDcEdhOztBQUViO0FBQ0E7QUFDQTs7QUFFQSxrQkFBa0IscUJBQU07QUFDeEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7OztBQ1hBLHdCQUF3QixxQkFBTTs7QUFFOUI7QUFDQTtBQUNBLDJDQUEyQyxVQUFVLGNBQWM7QUFDbkU7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0EsRUFBRTs7QUFFRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDL0NhOztBQUViO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNoQ2E7O0FBRWIsY0FBYyxtQkFBTyxDQUFDLHdEQUFnQjtBQUN0QyxnQkFBZ0IsbUJBQU8sQ0FBQyw0REFBVztBQUNuQyxjQUFjLG1CQUFPLENBQUMsb0RBQVc7QUFDakM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2YsZUFBZTtBQUNmLGFBQWE7QUFDYixnQkFBZ0I7QUFDaEIsZ0JBQWdCO0FBQ2hCLGNBQWM7QUFDZCxjQUFjO0FBQ2QsdUJBQXVCO0FBQ3ZCLHVCQUF1QjtBQUN2QixhQUFhO0FBQ2Isb0JBQW9CO0FBQ3BCLDhCQUE4QjtBQUM5QixnQkFBZ0I7O0FBRWhCO0FBQ0EsNEJBQTRCO0FBQzVCLDhCQUE4QjtBQUM5Qiw4QkFBOEI7QUFDOUIsaUNBQWlDO0FBQ2pDLGtDQUFrQztBQUNsQywyQkFBMkI7QUFDM0IscUNBQXFDO0FBQ3JDLG9DQUFvQztBQUNwQyxvQ0FBb0M7QUFDcEMsZ0NBQWdDO0FBQ2hDLCtDQUErQztBQUMvQyxzQ0FBc0M7O0FBRXRDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtRUFBbUU7QUFDbkU7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsY0FBYztBQUNkOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCLHNCQUFzQjtBQUN0QixRQUFRO0FBQ1IsNEJBQTRCO0FBQzVCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCLGNBQWM7QUFDZDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsNEJBQTRCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTs7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OUIsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2QsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9icmF3c2VyLWFwcC8uL25vZGVfbW9kdWxlcy9hdG9hL2F0b2EuanMiLCJ3ZWJwYWNrOi8vYnJhd3Nlci1hcHAvLi9ub2RlX21vZHVsZXMvY29udHJhL2RlYm91bmNlLmpzIiwid2VicGFjazovL2JyYXdzZXItYXBwLy4vbm9kZV9tb2R1bGVzL2NvbnRyYS9lbWl0dGVyLmpzIiwid2VicGFjazovL2JyYXdzZXItYXBwLy4vbm9kZV9tb2R1bGVzL2Nyb3NzdmVudC9zcmMvY3Jvc3N2ZW50LmpzIiwid2VicGFjazovL2JyYXdzZXItYXBwLy4vbm9kZV9tb2R1bGVzL2Nyb3NzdmVudC9zcmMvZXZlbnRtYXAuanMiLCJ3ZWJwYWNrOi8vYnJhd3Nlci1hcHAvLi9ub2RlX21vZHVsZXMvY3VzdG9tLWV2ZW50L2luZGV4LmpzIiwid2VicGFjazovL2JyYXdzZXItYXBwLy4vbm9kZV9tb2R1bGVzL2RyYWd1bGEvY2xhc3Nlcy5qcyIsIndlYnBhY2s6Ly9icmF3c2VyLWFwcC8uL25vZGVfbW9kdWxlcy9kcmFndWxhL2RyYWd1bGEuanMiLCJ3ZWJwYWNrOi8vYnJhd3Nlci1hcHAvLi9ub2RlX21vZHVsZXMvdGlja3kvdGlja3ktYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly9icmF3c2VyLWFwcC8uL3RzL0V2ZW50TGlzdGVuZXIudHMiLCJ3ZWJwYWNrOi8vYnJhd3Nlci1hcHAvLi90cy9UYXNrLnRzIiwid2VicGFjazovL2JyYXdzZXItYXBwLy4vdHMvVGFza0NvbGxlY3Rpb24udHMiLCJ3ZWJwYWNrOi8vYnJhd3Nlci1hcHAvLi90cy9UYXNrUmVuZGVyZXIudHMiLCJ3ZWJwYWNrOi8vYnJhd3Nlci1hcHAvLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3JlZ2V4LmpzIiwid2VicGFjazovL2JyYXdzZXItYXBwLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9ybmcuanMiLCJ3ZWJwYWNrOi8vYnJhd3Nlci1hcHAvLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3N0cmluZ2lmeS5qcyIsIndlYnBhY2s6Ly9icmF3c2VyLWFwcC8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjQuanMiLCJ3ZWJwYWNrOi8vYnJhd3Nlci1hcHAvLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3ZhbGlkYXRlLmpzIiwid2VicGFjazovL2JyYXdzZXItYXBwL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2JyYXdzZXItYXBwL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2JyYXdzZXItYXBwL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9icmF3c2VyLWFwcC93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL2JyYXdzZXItYXBwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vYnJhd3Nlci1hcHAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9icmF3c2VyLWFwcC8uL3RzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXRvYSAoYSwgbikgeyByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYSwgbik7IH1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRpY2t5ID0gcmVxdWlyZSgndGlja3knKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWJvdW5jZSAoZm4sIGFyZ3MsIGN0eCkge1xuICBpZiAoIWZuKSB7IHJldHVybjsgfVxuICB0aWNreShmdW5jdGlvbiBydW4gKCkge1xuICAgIGZuLmFwcGx5KGN0eCB8fCBudWxsLCBhcmdzIHx8IFtdKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXRvYSA9IHJlcXVpcmUoJ2F0b2EnKTtcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJy4vZGVib3VuY2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbWl0dGVyICh0aGluZywgb3B0aW9ucykge1xuICB2YXIgb3B0cyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBldnQgPSB7fTtcbiAgaWYgKHRoaW5nID09PSB1bmRlZmluZWQpIHsgdGhpbmcgPSB7fTsgfVxuICB0aGluZy5vbiA9IGZ1bmN0aW9uICh0eXBlLCBmbikge1xuICAgIGlmICghZXZ0W3R5cGVdKSB7XG4gICAgICBldnRbdHlwZV0gPSBbZm5dO1xuICAgIH0gZWxzZSB7XG4gICAgICBldnRbdHlwZV0ucHVzaChmbik7XG4gICAgfVxuICAgIHJldHVybiB0aGluZztcbiAgfTtcbiAgdGhpbmcub25jZSA9IGZ1bmN0aW9uICh0eXBlLCBmbikge1xuICAgIGZuLl9vbmNlID0gdHJ1ZTsgLy8gdGhpbmcub2ZmKGZuKSBzdGlsbCB3b3JrcyFcbiAgICB0aGluZy5vbih0eXBlLCBmbik7XG4gICAgcmV0dXJuIHRoaW5nO1xuICB9O1xuICB0aGluZy5vZmYgPSBmdW5jdGlvbiAodHlwZSwgZm4pIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgaWYgKGMgPT09IDEpIHtcbiAgICAgIGRlbGV0ZSBldnRbdHlwZV07XG4gICAgfSBlbHNlIGlmIChjID09PSAwKSB7XG4gICAgICBldnQgPSB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGV0ID0gZXZ0W3R5cGVdO1xuICAgICAgaWYgKCFldCkgeyByZXR1cm4gdGhpbmc7IH1cbiAgICAgIGV0LnNwbGljZShldC5pbmRleE9mKGZuKSwgMSk7XG4gICAgfVxuICAgIHJldHVybiB0aGluZztcbiAgfTtcbiAgdGhpbmcuZW1pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXJncyA9IGF0b2EoYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpbmcuZW1pdHRlclNuYXBzaG90KGFyZ3Muc2hpZnQoKSkuYXBwbHkodGhpcywgYXJncyk7XG4gIH07XG4gIHRoaW5nLmVtaXR0ZXJTbmFwc2hvdCA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgdmFyIGV0ID0gKGV2dFt0eXBlXSB8fCBbXSkuc2xpY2UoMCk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhcmdzID0gYXRvYShhcmd1bWVudHMpO1xuICAgICAgdmFyIGN0eCA9IHRoaXMgfHwgdGhpbmc7XG4gICAgICBpZiAodHlwZSA9PT0gJ2Vycm9yJyAmJiBvcHRzLnRocm93cyAhPT0gZmFsc2UgJiYgIWV0Lmxlbmd0aCkgeyB0aHJvdyBhcmdzLmxlbmd0aCA9PT0gMSA/IGFyZ3NbMF0gOiBhcmdzOyB9XG4gICAgICBldC5mb3JFYWNoKGZ1bmN0aW9uIGVtaXR0ZXIgKGxpc3Rlbikge1xuICAgICAgICBpZiAob3B0cy5hc3luYykgeyBkZWJvdW5jZShsaXN0ZW4sIGFyZ3MsIGN0eCk7IH0gZWxzZSB7IGxpc3Rlbi5hcHBseShjdHgsIGFyZ3MpOyB9XG4gICAgICAgIGlmIChsaXN0ZW4uX29uY2UpIHsgdGhpbmcub2ZmKHR5cGUsIGxpc3Rlbik7IH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaW5nO1xuICAgIH07XG4gIH07XG4gIHJldHVybiB0aGluZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjdXN0b21FdmVudCA9IHJlcXVpcmUoJ2N1c3RvbS1ldmVudCcpO1xudmFyIGV2ZW50bWFwID0gcmVxdWlyZSgnLi9ldmVudG1hcCcpO1xudmFyIGRvYyA9IGdsb2JhbC5kb2N1bWVudDtcbnZhciBhZGRFdmVudCA9IGFkZEV2ZW50RWFzeTtcbnZhciByZW1vdmVFdmVudCA9IHJlbW92ZUV2ZW50RWFzeTtcbnZhciBoYXJkQ2FjaGUgPSBbXTtcblxuaWYgKCFnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcikge1xuICBhZGRFdmVudCA9IGFkZEV2ZW50SGFyZDtcbiAgcmVtb3ZlRXZlbnQgPSByZW1vdmVFdmVudEhhcmQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGQ6IGFkZEV2ZW50LFxuICByZW1vdmU6IHJlbW92ZUV2ZW50LFxuICBmYWJyaWNhdGU6IGZhYnJpY2F0ZUV2ZW50XG59O1xuXG5mdW5jdGlvbiBhZGRFdmVudEVhc3kgKGVsLCB0eXBlLCBmbiwgY2FwdHVyaW5nKSB7XG4gIHJldHVybiBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJpbmcpO1xufVxuXG5mdW5jdGlvbiBhZGRFdmVudEhhcmQgKGVsLCB0eXBlLCBmbikge1xuICByZXR1cm4gZWwuYXR0YWNoRXZlbnQoJ29uJyArIHR5cGUsIHdyYXAoZWwsIHR5cGUsIGZuKSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50RWFzeSAoZWwsIHR5cGUsIGZuLCBjYXB0dXJpbmcpIHtcbiAgcmV0dXJuIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgZm4sIGNhcHR1cmluZyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50SGFyZCAoZWwsIHR5cGUsIGZuKSB7XG4gIHZhciBsaXN0ZW5lciA9IHVud3JhcChlbCwgdHlwZSwgZm4pO1xuICBpZiAobGlzdGVuZXIpIHtcbiAgICByZXR1cm4gZWwuZGV0YWNoRXZlbnQoJ29uJyArIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmYWJyaWNhdGVFdmVudCAoZWwsIHR5cGUsIG1vZGVsKSB7XG4gIHZhciBlID0gZXZlbnRtYXAuaW5kZXhPZih0eXBlKSA9PT0gLTEgPyBtYWtlQ3VzdG9tRXZlbnQoKSA6IG1ha2VDbGFzc2ljRXZlbnQoKTtcbiAgaWYgKGVsLmRpc3BhdGNoRXZlbnQpIHtcbiAgICBlbC5kaXNwYXRjaEV2ZW50KGUpO1xuICB9IGVsc2Uge1xuICAgIGVsLmZpcmVFdmVudCgnb24nICsgdHlwZSwgZSk7XG4gIH1cbiAgZnVuY3Rpb24gbWFrZUNsYXNzaWNFdmVudCAoKSB7XG4gICAgdmFyIGU7XG4gICAgaWYgKGRvYy5jcmVhdGVFdmVudCkge1xuICAgICAgZSA9IGRvYy5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgIGUuaW5pdEV2ZW50KHR5cGUsIHRydWUsIHRydWUpO1xuICAgIH0gZWxzZSBpZiAoZG9jLmNyZWF0ZUV2ZW50T2JqZWN0KSB7XG4gICAgICBlID0gZG9jLmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gICAgfVxuICAgIHJldHVybiBlO1xuICB9XG4gIGZ1bmN0aW9uIG1ha2VDdXN0b21FdmVudCAoKSB7XG4gICAgcmV0dXJuIG5ldyBjdXN0b21FdmVudCh0eXBlLCB7IGRldGFpbDogbW9kZWwgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gd3JhcHBlckZhY3RvcnkgKGVsLCB0eXBlLCBmbikge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcHBlciAob3JpZ2luYWxFdmVudCkge1xuICAgIHZhciBlID0gb3JpZ2luYWxFdmVudCB8fCBnbG9iYWwuZXZlbnQ7XG4gICAgZS50YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCA9IGUucHJldmVudERlZmF1bHQgfHwgZnVuY3Rpb24gcHJldmVudERlZmF1bHQgKCkgeyBlLnJldHVyblZhbHVlID0gZmFsc2U7IH07XG4gICAgZS5zdG9wUHJvcGFnYXRpb24gPSBlLnN0b3BQcm9wYWdhdGlvbiB8fCBmdW5jdGlvbiBzdG9wUHJvcGFnYXRpb24gKCkgeyBlLmNhbmNlbEJ1YmJsZSA9IHRydWU7IH07XG4gICAgZS53aGljaCA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuICAgIGZuLmNhbGwoZWwsIGUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiB3cmFwIChlbCwgdHlwZSwgZm4pIHtcbiAgdmFyIHdyYXBwZXIgPSB1bndyYXAoZWwsIHR5cGUsIGZuKSB8fCB3cmFwcGVyRmFjdG9yeShlbCwgdHlwZSwgZm4pO1xuICBoYXJkQ2FjaGUucHVzaCh7XG4gICAgd3JhcHBlcjogd3JhcHBlcixcbiAgICBlbGVtZW50OiBlbCxcbiAgICB0eXBlOiB0eXBlLFxuICAgIGZuOiBmblxuICB9KTtcbiAgcmV0dXJuIHdyYXBwZXI7XG59XG5cbmZ1bmN0aW9uIHVud3JhcCAoZWwsIHR5cGUsIGZuKSB7XG4gIHZhciBpID0gZmluZChlbCwgdHlwZSwgZm4pO1xuICBpZiAoaSkge1xuICAgIHZhciB3cmFwcGVyID0gaGFyZENhY2hlW2ldLndyYXBwZXI7XG4gICAgaGFyZENhY2hlLnNwbGljZShpLCAxKTsgLy8gZnJlZSB1cCBhIHRhZCBvZiBtZW1vcnlcbiAgICByZXR1cm4gd3JhcHBlcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kIChlbCwgdHlwZSwgZm4pIHtcbiAgdmFyIGksIGl0ZW07XG4gIGZvciAoaSA9IDA7IGkgPCBoYXJkQ2FjaGUubGVuZ3RoOyBpKyspIHtcbiAgICBpdGVtID0gaGFyZENhY2hlW2ldO1xuICAgIGlmIChpdGVtLmVsZW1lbnQgPT09IGVsICYmIGl0ZW0udHlwZSA9PT0gdHlwZSAmJiBpdGVtLmZuID09PSBmbikge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBldmVudG1hcCA9IFtdO1xudmFyIGV2ZW50bmFtZSA9ICcnO1xudmFyIHJvbiA9IC9eb24vO1xuXG5mb3IgKGV2ZW50bmFtZSBpbiBnbG9iYWwpIHtcbiAgaWYgKHJvbi50ZXN0KGV2ZW50bmFtZSkpIHtcbiAgICBldmVudG1hcC5wdXNoKGV2ZW50bmFtZS5zbGljZSgyKSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBldmVudG1hcDtcbiIsIlxudmFyIE5hdGl2ZUN1c3RvbUV2ZW50ID0gZ2xvYmFsLkN1c3RvbUV2ZW50O1xuXG5mdW5jdGlvbiB1c2VOYXRpdmUgKCkge1xuICB0cnkge1xuICAgIHZhciBwID0gbmV3IE5hdGl2ZUN1c3RvbUV2ZW50KCdjYXQnLCB7IGRldGFpbDogeyBmb286ICdiYXInIH0gfSk7XG4gICAgcmV0dXJuICAnY2F0JyA9PT0gcC50eXBlICYmICdiYXInID09PSBwLmRldGFpbC5mb287XG4gIH0gY2F0Y2ggKGUpIHtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogQ3Jvc3MtYnJvd3NlciBgQ3VzdG9tRXZlbnRgIGNvbnN0cnVjdG9yLlxuICpcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DdXN0b21FdmVudC5DdXN0b21FdmVudFxuICpcbiAqIEBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHVzZU5hdGl2ZSgpID8gTmF0aXZlQ3VzdG9tRXZlbnQgOlxuXG4vLyBJRSA+PSA5XG4ndW5kZWZpbmVkJyAhPT0gdHlwZW9mIGRvY3VtZW50ICYmICdmdW5jdGlvbicgPT09IHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFdmVudCA/IGZ1bmN0aW9uIEN1c3RvbUV2ZW50ICh0eXBlLCBwYXJhbXMpIHtcbiAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcbiAgaWYgKHBhcmFtcykge1xuICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbCk7XG4gIH0gZWxzZSB7XG4gICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlLCB2b2lkIDApO1xuICB9XG4gIHJldHVybiBlO1xufSA6XG5cbi8vIElFIDw9IDhcbmZ1bmN0aW9uIEN1c3RvbUV2ZW50ICh0eXBlLCBwYXJhbXMpIHtcbiAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpO1xuICBlLnR5cGUgPSB0eXBlO1xuICBpZiAocGFyYW1zKSB7XG4gICAgZS5idWJibGVzID0gQm9vbGVhbihwYXJhbXMuYnViYmxlcyk7XG4gICAgZS5jYW5jZWxhYmxlID0gQm9vbGVhbihwYXJhbXMuY2FuY2VsYWJsZSk7XG4gICAgZS5kZXRhaWwgPSBwYXJhbXMuZGV0YWlsO1xuICB9IGVsc2Uge1xuICAgIGUuYnViYmxlcyA9IGZhbHNlO1xuICAgIGUuY2FuY2VsYWJsZSA9IGZhbHNlO1xuICAgIGUuZGV0YWlsID0gdm9pZCAwO1xuICB9XG4gIHJldHVybiBlO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2FjaGUgPSB7fTtcbnZhciBzdGFydCA9ICcoPzpefFxcXFxzKSc7XG52YXIgZW5kID0gJyg/OlxcXFxzfCQpJztcblxuZnVuY3Rpb24gbG9va3VwQ2xhc3MgKGNsYXNzTmFtZSkge1xuICB2YXIgY2FjaGVkID0gY2FjaGVbY2xhc3NOYW1lXTtcbiAgaWYgKGNhY2hlZCkge1xuICAgIGNhY2hlZC5sYXN0SW5kZXggPSAwO1xuICB9IGVsc2Uge1xuICAgIGNhY2hlW2NsYXNzTmFtZV0gPSBjYWNoZWQgPSBuZXcgUmVnRXhwKHN0YXJ0ICsgY2xhc3NOYW1lICsgZW5kLCAnZycpO1xuICB9XG4gIHJldHVybiBjYWNoZWQ7XG59XG5cbmZ1bmN0aW9uIGFkZENsYXNzIChlbCwgY2xhc3NOYW1lKSB7XG4gIHZhciBjdXJyZW50ID0gZWwuY2xhc3NOYW1lO1xuICBpZiAoIWN1cnJlbnQubGVuZ3RoKSB7XG4gICAgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuICB9IGVsc2UgaWYgKCFsb29rdXBDbGFzcyhjbGFzc05hbWUpLnRlc3QoY3VycmVudCkpIHtcbiAgICBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJtQ2xhc3MgKGVsLCBjbGFzc05hbWUpIHtcbiAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UobG9va3VwQ2xhc3MoY2xhc3NOYW1lKSwgJyAnKS50cmltKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGQ6IGFkZENsYXNzLFxuICBybTogcm1DbGFzc1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVtaXR0ZXIgPSByZXF1aXJlKCdjb250cmEvZW1pdHRlcicpO1xudmFyIGNyb3NzdmVudCA9IHJlcXVpcmUoJ2Nyb3NzdmVudCcpO1xudmFyIGNsYXNzZXMgPSByZXF1aXJlKCcuL2NsYXNzZXMnKTtcbnZhciBkb2MgPSBkb2N1bWVudDtcbnZhciBkb2N1bWVudEVsZW1lbnQgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xuXG5mdW5jdGlvbiBkcmFndWxhIChpbml0aWFsQ29udGFpbmVycywgb3B0aW9ucykge1xuICB2YXIgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgaWYgKGxlbiA9PT0gMSAmJiBBcnJheS5pc0FycmF5KGluaXRpYWxDb250YWluZXJzKSA9PT0gZmFsc2UpIHtcbiAgICBvcHRpb25zID0gaW5pdGlhbENvbnRhaW5lcnM7XG4gICAgaW5pdGlhbENvbnRhaW5lcnMgPSBbXTtcbiAgfVxuICB2YXIgX21pcnJvcjsgLy8gbWlycm9yIGltYWdlXG4gIHZhciBfc291cmNlOyAvLyBzb3VyY2UgY29udGFpbmVyXG4gIHZhciBfaXRlbTsgLy8gaXRlbSBiZWluZyBkcmFnZ2VkXG4gIHZhciBfb2Zmc2V0WDsgLy8gcmVmZXJlbmNlIHhcbiAgdmFyIF9vZmZzZXRZOyAvLyByZWZlcmVuY2UgeVxuICB2YXIgX21vdmVYOyAvLyByZWZlcmVuY2UgbW92ZSB4XG4gIHZhciBfbW92ZVk7IC8vIHJlZmVyZW5jZSBtb3ZlIHlcbiAgdmFyIF9pbml0aWFsU2libGluZzsgLy8gcmVmZXJlbmNlIHNpYmxpbmcgd2hlbiBncmFiYmVkXG4gIHZhciBfY3VycmVudFNpYmxpbmc7IC8vIHJlZmVyZW5jZSBzaWJsaW5nIG5vd1xuICB2YXIgX2NvcHk7IC8vIGl0ZW0gdXNlZCBmb3IgY29weWluZ1xuICB2YXIgX3JlbmRlclRpbWVyOyAvLyB0aW1lciBmb3Igc2V0VGltZW91dCByZW5kZXJNaXJyb3JJbWFnZVxuICB2YXIgX2xhc3REcm9wVGFyZ2V0ID0gbnVsbDsgLy8gbGFzdCBjb250YWluZXIgaXRlbSB3YXMgb3ZlclxuICB2YXIgX2dyYWJiZWQ7IC8vIGhvbGRzIG1vdXNlZG93biBjb250ZXh0IHVudGlsIGZpcnN0IG1vdXNlbW92ZVxuXG4gIHZhciBvID0gb3B0aW9ucyB8fCB7fTtcbiAgaWYgKG8ubW92ZXMgPT09IHZvaWQgMCkgeyBvLm1vdmVzID0gYWx3YXlzOyB9XG4gIGlmIChvLmFjY2VwdHMgPT09IHZvaWQgMCkgeyBvLmFjY2VwdHMgPSBhbHdheXM7IH1cbiAgaWYgKG8uaW52YWxpZCA9PT0gdm9pZCAwKSB7IG8uaW52YWxpZCA9IGludmFsaWRUYXJnZXQ7IH1cbiAgaWYgKG8uY29udGFpbmVycyA9PT0gdm9pZCAwKSB7IG8uY29udGFpbmVycyA9IGluaXRpYWxDb250YWluZXJzIHx8IFtdOyB9XG4gIGlmIChvLmlzQ29udGFpbmVyID09PSB2b2lkIDApIHsgby5pc0NvbnRhaW5lciA9IG5ldmVyOyB9XG4gIGlmIChvLmNvcHkgPT09IHZvaWQgMCkgeyBvLmNvcHkgPSBmYWxzZTsgfVxuICBpZiAoby5jb3B5U29ydFNvdXJjZSA9PT0gdm9pZCAwKSB7IG8uY29weVNvcnRTb3VyY2UgPSBmYWxzZTsgfVxuICBpZiAoby5yZXZlcnRPblNwaWxsID09PSB2b2lkIDApIHsgby5yZXZlcnRPblNwaWxsID0gZmFsc2U7IH1cbiAgaWYgKG8ucmVtb3ZlT25TcGlsbCA9PT0gdm9pZCAwKSB7IG8ucmVtb3ZlT25TcGlsbCA9IGZhbHNlOyB9XG4gIGlmIChvLmRpcmVjdGlvbiA9PT0gdm9pZCAwKSB7IG8uZGlyZWN0aW9uID0gJ3ZlcnRpY2FsJzsgfVxuICBpZiAoby5pZ25vcmVJbnB1dFRleHRTZWxlY3Rpb24gPT09IHZvaWQgMCkgeyBvLmlnbm9yZUlucHV0VGV4dFNlbGVjdGlvbiA9IHRydWU7IH1cbiAgaWYgKG8ubWlycm9yQ29udGFpbmVyID09PSB2b2lkIDApIHsgby5taXJyb3JDb250YWluZXIgPSBkb2MuYm9keTsgfVxuXG4gIHZhciBkcmFrZSA9IGVtaXR0ZXIoe1xuICAgIGNvbnRhaW5lcnM6IG8uY29udGFpbmVycyxcbiAgICBzdGFydDogbWFudWFsU3RhcnQsXG4gICAgZW5kOiBlbmQsXG4gICAgY2FuY2VsOiBjYW5jZWwsXG4gICAgcmVtb3ZlOiByZW1vdmUsXG4gICAgZGVzdHJveTogZGVzdHJveSxcbiAgICBjYW5Nb3ZlOiBjYW5Nb3ZlLFxuICAgIGRyYWdnaW5nOiBmYWxzZVxuICB9KTtcblxuICBpZiAoby5yZW1vdmVPblNwaWxsID09PSB0cnVlKSB7XG4gICAgZHJha2Uub24oJ292ZXInLCBzcGlsbE92ZXIpLm9uKCdvdXQnLCBzcGlsbE91dCk7XG4gIH1cblxuICBldmVudHMoKTtcblxuICByZXR1cm4gZHJha2U7XG5cbiAgZnVuY3Rpb24gaXNDb250YWluZXIgKGVsKSB7XG4gICAgcmV0dXJuIGRyYWtlLmNvbnRhaW5lcnMuaW5kZXhPZihlbCkgIT09IC0xIHx8IG8uaXNDb250YWluZXIoZWwpO1xuICB9XG5cbiAgZnVuY3Rpb24gZXZlbnRzIChyZW1vdmUpIHtcbiAgICB2YXIgb3AgPSByZW1vdmUgPyAncmVtb3ZlJyA6ICdhZGQnO1xuICAgIHRvdWNoeShkb2N1bWVudEVsZW1lbnQsIG9wLCAnbW91c2Vkb3duJywgZ3JhYik7XG4gICAgdG91Y2h5KGRvY3VtZW50RWxlbWVudCwgb3AsICdtb3VzZXVwJywgcmVsZWFzZSk7XG4gIH1cblxuICBmdW5jdGlvbiBldmVudHVhbE1vdmVtZW50cyAocmVtb3ZlKSB7XG4gICAgdmFyIG9wID0gcmVtb3ZlID8gJ3JlbW92ZScgOiAnYWRkJztcbiAgICB0b3VjaHkoZG9jdW1lbnRFbGVtZW50LCBvcCwgJ21vdXNlbW92ZScsIHN0YXJ0QmVjYXVzZU1vdXNlTW92ZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbW92ZW1lbnRzIChyZW1vdmUpIHtcbiAgICB2YXIgb3AgPSByZW1vdmUgPyAncmVtb3ZlJyA6ICdhZGQnO1xuICAgIGNyb3NzdmVudFtvcF0oZG9jdW1lbnRFbGVtZW50LCAnc2VsZWN0c3RhcnQnLCBwcmV2ZW50R3JhYmJlZCk7IC8vIElFOFxuICAgIGNyb3NzdmVudFtvcF0oZG9jdW1lbnRFbGVtZW50LCAnY2xpY2snLCBwcmV2ZW50R3JhYmJlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBkZXN0cm95ICgpIHtcbiAgICBldmVudHModHJ1ZSk7XG4gICAgcmVsZWFzZSh7fSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcmV2ZW50R3JhYmJlZCAoZSkge1xuICAgIGlmIChfZ3JhYmJlZCkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdyYWIgKGUpIHtcbiAgICBfbW92ZVggPSBlLmNsaWVudFg7XG4gICAgX21vdmVZID0gZS5jbGllbnRZO1xuXG4gICAgdmFyIGlnbm9yZSA9IHdoaWNoTW91c2VCdXR0b24oZSkgIT09IDEgfHwgZS5tZXRhS2V5IHx8IGUuY3RybEtleTtcbiAgICBpZiAoaWdub3JlKSB7XG4gICAgICByZXR1cm47IC8vIHdlIG9ubHkgY2FyZSBhYm91dCBob25lc3QtdG8tZ29kIGxlZnQgY2xpY2tzIGFuZCB0b3VjaCBldmVudHNcbiAgICB9XG4gICAgdmFyIGl0ZW0gPSBlLnRhcmdldDtcbiAgICB2YXIgY29udGV4dCA9IGNhblN0YXJ0KGl0ZW0pO1xuICAgIGlmICghY29udGV4dCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBfZ3JhYmJlZCA9IGNvbnRleHQ7XG4gICAgZXZlbnR1YWxNb3ZlbWVudHMoKTtcbiAgICBpZiAoZS50eXBlID09PSAnbW91c2Vkb3duJykge1xuICAgICAgaWYgKGlzSW5wdXQoaXRlbSkpIHsgLy8gc2VlIGFsc286IGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8yMDhcbiAgICAgICAgaXRlbS5mb2N1cygpOyAvLyBmaXhlcyBodHRwczovL2dpdGh1Yi5jb20vYmV2YWNxdWEvZHJhZ3VsYS9pc3N1ZXMvMTc2XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7IC8vIGZpeGVzIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8xNTVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdGFydEJlY2F1c2VNb3VzZU1vdmVkIChlKSB7XG4gICAgaWYgKCFfZ3JhYmJlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAod2hpY2hNb3VzZUJ1dHRvbihlKSA9PT0gMCkge1xuICAgICAgcmVsZWFzZSh7fSk7XG4gICAgICByZXR1cm47IC8vIHdoZW4gdGV4dCBpcyBzZWxlY3RlZCBvbiBhbiBpbnB1dCBhbmQgdGhlbiBkcmFnZ2VkLCBtb3VzZXVwIGRvZXNuJ3QgZmlyZS4gdGhpcyBpcyBvdXIgb25seSBob3BlXG4gICAgfVxuXG4gICAgLy8gdHJ1dGh5IGNoZWNrIGZpeGVzICMyMzksIGVxdWFsaXR5IGZpeGVzICMyMDcsIGZpeGVzICM1MDFcbiAgICBpZiAoKGUuY2xpZW50WCAhPT0gdm9pZCAwICYmIE1hdGguYWJzKGUuY2xpZW50WCAtIF9tb3ZlWCkgPD0gKG8uc2xpZGVGYWN0b3JYIHx8IDApKSAmJlxuICAgICAgKGUuY2xpZW50WSAhPT0gdm9pZCAwICYmIE1hdGguYWJzKGUuY2xpZW50WSAtIF9tb3ZlWSkgPD0gKG8uc2xpZGVGYWN0b3JZIHx8IDApKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChvLmlnbm9yZUlucHV0VGV4dFNlbGVjdGlvbikge1xuICAgICAgdmFyIGNsaWVudFggPSBnZXRDb29yZCgnY2xpZW50WCcsIGUpIHx8IDA7XG4gICAgICB2YXIgY2xpZW50WSA9IGdldENvb3JkKCdjbGllbnRZJywgZSkgfHwgMDtcbiAgICAgIHZhciBlbGVtZW50QmVoaW5kQ3Vyc29yID0gZG9jLmVsZW1lbnRGcm9tUG9pbnQoY2xpZW50WCwgY2xpZW50WSk7XG4gICAgICBpZiAoaXNJbnB1dChlbGVtZW50QmVoaW5kQ3Vyc29yKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGdyYWJiZWQgPSBfZ3JhYmJlZDsgLy8gY2FsbCB0byBlbmQoKSB1bnNldHMgX2dyYWJiZWRcbiAgICBldmVudHVhbE1vdmVtZW50cyh0cnVlKTtcbiAgICBtb3ZlbWVudHMoKTtcbiAgICBlbmQoKTtcbiAgICBzdGFydChncmFiYmVkKTtcblxuICAgIHZhciBvZmZzZXQgPSBnZXRPZmZzZXQoX2l0ZW0pO1xuICAgIF9vZmZzZXRYID0gZ2V0Q29vcmQoJ3BhZ2VYJywgZSkgLSBvZmZzZXQubGVmdDtcbiAgICBfb2Zmc2V0WSA9IGdldENvb3JkKCdwYWdlWScsIGUpIC0gb2Zmc2V0LnRvcDtcblxuICAgIGNsYXNzZXMuYWRkKF9jb3B5IHx8IF9pdGVtLCAnZ3UtdHJhbnNpdCcpO1xuICAgIHJlbmRlck1pcnJvckltYWdlKCk7XG4gICAgZHJhZyhlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhblN0YXJ0IChpdGVtKSB7XG4gICAgaWYgKGRyYWtlLmRyYWdnaW5nICYmIF9taXJyb3IpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGlzQ29udGFpbmVyKGl0ZW0pKSB7XG4gICAgICByZXR1cm47IC8vIGRvbid0IGRyYWcgY29udGFpbmVyIGl0c2VsZlxuICAgIH1cbiAgICB2YXIgaGFuZGxlID0gaXRlbTtcbiAgICB3aGlsZSAoZ2V0UGFyZW50KGl0ZW0pICYmIGlzQ29udGFpbmVyKGdldFBhcmVudChpdGVtKSkgPT09IGZhbHNlKSB7XG4gICAgICBpZiAoby5pbnZhbGlkKGl0ZW0sIGhhbmRsZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaXRlbSA9IGdldFBhcmVudChpdGVtKTsgLy8gZHJhZyB0YXJnZXQgc2hvdWxkIGJlIGEgdG9wIGVsZW1lbnRcbiAgICAgIGlmICghaXRlbSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBzb3VyY2UgPSBnZXRQYXJlbnQoaXRlbSk7XG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKG8uaW52YWxpZChpdGVtLCBoYW5kbGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG1vdmFibGUgPSBvLm1vdmVzKGl0ZW0sIHNvdXJjZSwgaGFuZGxlLCBuZXh0RWwoaXRlbSkpO1xuICAgIGlmICghbW92YWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBpdGVtOiBpdGVtLFxuICAgICAgc291cmNlOiBzb3VyY2VcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuTW92ZSAoaXRlbSkge1xuICAgIHJldHVybiAhIWNhblN0YXJ0KGl0ZW0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbWFudWFsU3RhcnQgKGl0ZW0pIHtcbiAgICB2YXIgY29udGV4dCA9IGNhblN0YXJ0KGl0ZW0pO1xuICAgIGlmIChjb250ZXh0KSB7XG4gICAgICBzdGFydChjb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdGFydCAoY29udGV4dCkge1xuICAgIGlmIChpc0NvcHkoY29udGV4dC5pdGVtLCBjb250ZXh0LnNvdXJjZSkpIHtcbiAgICAgIF9jb3B5ID0gY29udGV4dC5pdGVtLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgIGRyYWtlLmVtaXQoJ2Nsb25lZCcsIF9jb3B5LCBjb250ZXh0Lml0ZW0sICdjb3B5Jyk7XG4gICAgfVxuXG4gICAgX3NvdXJjZSA9IGNvbnRleHQuc291cmNlO1xuICAgIF9pdGVtID0gY29udGV4dC5pdGVtO1xuICAgIF9pbml0aWFsU2libGluZyA9IF9jdXJyZW50U2libGluZyA9IG5leHRFbChjb250ZXh0Lml0ZW0pO1xuXG4gICAgZHJha2UuZHJhZ2dpbmcgPSB0cnVlO1xuICAgIGRyYWtlLmVtaXQoJ2RyYWcnLCBfaXRlbSwgX3NvdXJjZSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbnZhbGlkVGFyZ2V0ICgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBlbmQgKCkge1xuICAgIGlmICghZHJha2UuZHJhZ2dpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbTtcbiAgICBkcm9wKGl0ZW0sIGdldFBhcmVudChpdGVtKSk7XG4gIH1cblxuICBmdW5jdGlvbiB1bmdyYWIgKCkge1xuICAgIF9ncmFiYmVkID0gZmFsc2U7XG4gICAgZXZlbnR1YWxNb3ZlbWVudHModHJ1ZSk7XG4gICAgbW92ZW1lbnRzKHRydWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVsZWFzZSAoZSkge1xuICAgIHVuZ3JhYigpO1xuXG4gICAgaWYgKCFkcmFrZS5kcmFnZ2luZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xuICAgIHZhciBjbGllbnRYID0gZ2V0Q29vcmQoJ2NsaWVudFgnLCBlKSB8fCAwO1xuICAgIHZhciBjbGllbnRZID0gZ2V0Q29vcmQoJ2NsaWVudFknLCBlKSB8fCAwO1xuICAgIHZhciBlbGVtZW50QmVoaW5kQ3Vyc29yID0gZ2V0RWxlbWVudEJlaGluZFBvaW50KF9taXJyb3IsIGNsaWVudFgsIGNsaWVudFkpO1xuICAgIHZhciBkcm9wVGFyZ2V0ID0gZmluZERyb3BUYXJnZXQoZWxlbWVudEJlaGluZEN1cnNvciwgY2xpZW50WCwgY2xpZW50WSk7XG4gICAgaWYgKGRyb3BUYXJnZXQgJiYgKChfY29weSAmJiBvLmNvcHlTb3J0U291cmNlKSB8fCAoIV9jb3B5IHx8IGRyb3BUYXJnZXQgIT09IF9zb3VyY2UpKSkge1xuICAgICAgZHJvcChpdGVtLCBkcm9wVGFyZ2V0KTtcbiAgICB9IGVsc2UgaWYgKG8ucmVtb3ZlT25TcGlsbCkge1xuICAgICAgcmVtb3ZlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbmNlbCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRyb3AgKGl0ZW0sIHRhcmdldCkge1xuICAgIHZhciBwYXJlbnQgPSBnZXRQYXJlbnQoaXRlbSk7XG4gICAgaWYgKF9jb3B5ICYmIG8uY29weVNvcnRTb3VyY2UgJiYgdGFyZ2V0ID09PSBfc291cmNlKSB7XG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoX2l0ZW0pO1xuICAgIH1cbiAgICBpZiAoaXNJbml0aWFsUGxhY2VtZW50KHRhcmdldCkpIHtcbiAgICAgIGRyYWtlLmVtaXQoJ2NhbmNlbCcsIGl0ZW0sIF9zb3VyY2UsIF9zb3VyY2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkcmFrZS5lbWl0KCdkcm9wJywgaXRlbSwgdGFyZ2V0LCBfc291cmNlLCBfY3VycmVudFNpYmxpbmcpO1xuICAgIH1cbiAgICBjbGVhbnVwKCk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmUgKCkge1xuICAgIGlmICghZHJha2UuZHJhZ2dpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbTtcbiAgICB2YXIgcGFyZW50ID0gZ2V0UGFyZW50KGl0ZW0pO1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChpdGVtKTtcbiAgICB9XG4gICAgZHJha2UuZW1pdChfY29weSA/ICdjYW5jZWwnIDogJ3JlbW92ZScsIGl0ZW0sIHBhcmVudCwgX3NvdXJjZSk7XG4gICAgY2xlYW51cCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuY2VsIChyZXZlcnQpIHtcbiAgICBpZiAoIWRyYWtlLmRyYWdnaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciByZXZlcnRzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgPyByZXZlcnQgOiBvLnJldmVydE9uU3BpbGw7XG4gICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbTtcbiAgICB2YXIgcGFyZW50ID0gZ2V0UGFyZW50KGl0ZW0pO1xuICAgIHZhciBpbml0aWFsID0gaXNJbml0aWFsUGxhY2VtZW50KHBhcmVudCk7XG4gICAgaWYgKGluaXRpYWwgPT09IGZhbHNlICYmIHJldmVydHMpIHtcbiAgICAgIGlmIChfY29weSkge1xuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKF9jb3B5KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3NvdXJjZS5pbnNlcnRCZWZvcmUoaXRlbSwgX2luaXRpYWxTaWJsaW5nKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGluaXRpYWwgfHwgcmV2ZXJ0cykge1xuICAgICAgZHJha2UuZW1pdCgnY2FuY2VsJywgaXRlbSwgX3NvdXJjZSwgX3NvdXJjZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRyYWtlLmVtaXQoJ2Ryb3AnLCBpdGVtLCBwYXJlbnQsIF9zb3VyY2UsIF9jdXJyZW50U2libGluZyk7XG4gICAgfVxuICAgIGNsZWFudXAoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFudXAgKCkge1xuICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XG4gICAgdW5ncmFiKCk7XG4gICAgcmVtb3ZlTWlycm9ySW1hZ2UoKTtcbiAgICBpZiAoaXRlbSkge1xuICAgICAgY2xhc3Nlcy5ybShpdGVtLCAnZ3UtdHJhbnNpdCcpO1xuICAgIH1cbiAgICBpZiAoX3JlbmRlclRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQoX3JlbmRlclRpbWVyKTtcbiAgICB9XG4gICAgZHJha2UuZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICBpZiAoX2xhc3REcm9wVGFyZ2V0KSB7XG4gICAgICBkcmFrZS5lbWl0KCdvdXQnLCBpdGVtLCBfbGFzdERyb3BUYXJnZXQsIF9zb3VyY2UpO1xuICAgIH1cbiAgICBkcmFrZS5lbWl0KCdkcmFnZW5kJywgaXRlbSk7XG4gICAgX3NvdXJjZSA9IF9pdGVtID0gX2NvcHkgPSBfaW5pdGlhbFNpYmxpbmcgPSBfY3VycmVudFNpYmxpbmcgPSBfcmVuZGVyVGltZXIgPSBfbGFzdERyb3BUYXJnZXQgPSBudWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNJbml0aWFsUGxhY2VtZW50ICh0YXJnZXQsIHMpIHtcbiAgICB2YXIgc2libGluZztcbiAgICBpZiAocyAhPT0gdm9pZCAwKSB7XG4gICAgICBzaWJsaW5nID0gcztcbiAgICB9IGVsc2UgaWYgKF9taXJyb3IpIHtcbiAgICAgIHNpYmxpbmcgPSBfY3VycmVudFNpYmxpbmc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNpYmxpbmcgPSBuZXh0RWwoX2NvcHkgfHwgX2l0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0ID09PSBfc291cmNlICYmIHNpYmxpbmcgPT09IF9pbml0aWFsU2libGluZztcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbmREcm9wVGFyZ2V0IChlbGVtZW50QmVoaW5kQ3Vyc29yLCBjbGllbnRYLCBjbGllbnRZKSB7XG4gICAgdmFyIHRhcmdldCA9IGVsZW1lbnRCZWhpbmRDdXJzb3I7XG4gICAgd2hpbGUgKHRhcmdldCAmJiAhYWNjZXB0ZWQoKSkge1xuICAgICAgdGFyZ2V0ID0gZ2V0UGFyZW50KHRhcmdldCk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG5cbiAgICBmdW5jdGlvbiBhY2NlcHRlZCAoKSB7XG4gICAgICB2YXIgZHJvcHBhYmxlID0gaXNDb250YWluZXIodGFyZ2V0KTtcbiAgICAgIGlmIChkcm9wcGFibGUgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGltbWVkaWF0ZSA9IGdldEltbWVkaWF0ZUNoaWxkKHRhcmdldCwgZWxlbWVudEJlaGluZEN1cnNvcik7XG4gICAgICB2YXIgcmVmZXJlbmNlID0gZ2V0UmVmZXJlbmNlKHRhcmdldCwgaW1tZWRpYXRlLCBjbGllbnRYLCBjbGllbnRZKTtcbiAgICAgIHZhciBpbml0aWFsID0gaXNJbml0aWFsUGxhY2VtZW50KHRhcmdldCwgcmVmZXJlbmNlKTtcbiAgICAgIGlmIChpbml0aWFsKSB7XG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBzaG91bGQgYWx3YXlzIGJlIGFibGUgdG8gZHJvcCBpdCByaWdodCBiYWNrIHdoZXJlIGl0IHdhc1xuICAgICAgfVxuICAgICAgcmV0dXJuIG8uYWNjZXB0cyhfaXRlbSwgdGFyZ2V0LCBfc291cmNlLCByZWZlcmVuY2UpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYWcgKGUpIHtcbiAgICBpZiAoIV9taXJyb3IpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyIGNsaWVudFggPSBnZXRDb29yZCgnY2xpZW50WCcsIGUpIHx8IDA7XG4gICAgdmFyIGNsaWVudFkgPSBnZXRDb29yZCgnY2xpZW50WScsIGUpIHx8IDA7XG4gICAgdmFyIHggPSBjbGllbnRYIC0gX29mZnNldFg7XG4gICAgdmFyIHkgPSBjbGllbnRZIC0gX29mZnNldFk7XG5cbiAgICBfbWlycm9yLnN0eWxlLmxlZnQgPSB4ICsgJ3B4JztcbiAgICBfbWlycm9yLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xuXG4gICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbTtcbiAgICB2YXIgZWxlbWVudEJlaGluZEN1cnNvciA9IGdldEVsZW1lbnRCZWhpbmRQb2ludChfbWlycm9yLCBjbGllbnRYLCBjbGllbnRZKTtcbiAgICB2YXIgZHJvcFRhcmdldCA9IGZpbmREcm9wVGFyZ2V0KGVsZW1lbnRCZWhpbmRDdXJzb3IsIGNsaWVudFgsIGNsaWVudFkpO1xuICAgIHZhciBjaGFuZ2VkID0gZHJvcFRhcmdldCAhPT0gbnVsbCAmJiBkcm9wVGFyZ2V0ICE9PSBfbGFzdERyb3BUYXJnZXQ7XG4gICAgaWYgKGNoYW5nZWQgfHwgZHJvcFRhcmdldCA9PT0gbnVsbCkge1xuICAgICAgb3V0KCk7XG4gICAgICBfbGFzdERyb3BUYXJnZXQgPSBkcm9wVGFyZ2V0O1xuICAgICAgb3ZlcigpO1xuICAgIH1cbiAgICB2YXIgcGFyZW50ID0gZ2V0UGFyZW50KGl0ZW0pO1xuICAgIGlmIChkcm9wVGFyZ2V0ID09PSBfc291cmNlICYmIF9jb3B5ICYmICFvLmNvcHlTb3J0U291cmNlKSB7XG4gICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChpdGVtKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHJlZmVyZW5jZTtcbiAgICB2YXIgaW1tZWRpYXRlID0gZ2V0SW1tZWRpYXRlQ2hpbGQoZHJvcFRhcmdldCwgZWxlbWVudEJlaGluZEN1cnNvcik7XG4gICAgaWYgKGltbWVkaWF0ZSAhPT0gbnVsbCkge1xuICAgICAgcmVmZXJlbmNlID0gZ2V0UmVmZXJlbmNlKGRyb3BUYXJnZXQsIGltbWVkaWF0ZSwgY2xpZW50WCwgY2xpZW50WSk7XG4gICAgfSBlbHNlIGlmIChvLnJldmVydE9uU3BpbGwgPT09IHRydWUgJiYgIV9jb3B5KSB7XG4gICAgICByZWZlcmVuY2UgPSBfaW5pdGlhbFNpYmxpbmc7XG4gICAgICBkcm9wVGFyZ2V0ID0gX3NvdXJjZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKF9jb3B5ICYmIHBhcmVudCkge1xuICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChcbiAgICAgIChyZWZlcmVuY2UgPT09IG51bGwgJiYgY2hhbmdlZCkgfHxcbiAgICAgIHJlZmVyZW5jZSAhPT0gaXRlbSAmJlxuICAgICAgcmVmZXJlbmNlICE9PSBuZXh0RWwoaXRlbSlcbiAgICApIHtcbiAgICAgIF9jdXJyZW50U2libGluZyA9IHJlZmVyZW5jZTtcbiAgICAgIGRyb3BUYXJnZXQuaW5zZXJ0QmVmb3JlKGl0ZW0sIHJlZmVyZW5jZSk7XG4gICAgICBkcmFrZS5lbWl0KCdzaGFkb3cnLCBpdGVtLCBkcm9wVGFyZ2V0LCBfc291cmNlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbW92ZWQgKHR5cGUpIHsgZHJha2UuZW1pdCh0eXBlLCBpdGVtLCBfbGFzdERyb3BUYXJnZXQsIF9zb3VyY2UpOyB9XG4gICAgZnVuY3Rpb24gb3ZlciAoKSB7IGlmIChjaGFuZ2VkKSB7IG1vdmVkKCdvdmVyJyk7IH0gfVxuICAgIGZ1bmN0aW9uIG91dCAoKSB7IGlmIChfbGFzdERyb3BUYXJnZXQpIHsgbW92ZWQoJ291dCcpOyB9IH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNwaWxsT3ZlciAoZWwpIHtcbiAgICBjbGFzc2VzLnJtKGVsLCAnZ3UtaGlkZScpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3BpbGxPdXQgKGVsKSB7XG4gICAgaWYgKGRyYWtlLmRyYWdnaW5nKSB7IGNsYXNzZXMuYWRkKGVsLCAnZ3UtaGlkZScpOyB9XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJNaXJyb3JJbWFnZSAoKSB7XG4gICAgaWYgKF9taXJyb3IpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHJlY3QgPSBfaXRlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBfbWlycm9yID0gX2l0ZW0uY2xvbmVOb2RlKHRydWUpO1xuICAgIF9taXJyb3Iuc3R5bGUud2lkdGggPSBnZXRSZWN0V2lkdGgocmVjdCkgKyAncHgnO1xuICAgIF9taXJyb3Iuc3R5bGUuaGVpZ2h0ID0gZ2V0UmVjdEhlaWdodChyZWN0KSArICdweCc7XG4gICAgY2xhc3Nlcy5ybShfbWlycm9yLCAnZ3UtdHJhbnNpdCcpO1xuICAgIGNsYXNzZXMuYWRkKF9taXJyb3IsICdndS1taXJyb3InKTtcbiAgICBvLm1pcnJvckNvbnRhaW5lci5hcHBlbmRDaGlsZChfbWlycm9yKTtcbiAgICB0b3VjaHkoZG9jdW1lbnRFbGVtZW50LCAnYWRkJywgJ21vdXNlbW92ZScsIGRyYWcpO1xuICAgIGNsYXNzZXMuYWRkKG8ubWlycm9yQ29udGFpbmVyLCAnZ3UtdW5zZWxlY3RhYmxlJyk7XG4gICAgZHJha2UuZW1pdCgnY2xvbmVkJywgX21pcnJvciwgX2l0ZW0sICdtaXJyb3InKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZU1pcnJvckltYWdlICgpIHtcbiAgICBpZiAoX21pcnJvcikge1xuICAgICAgY2xhc3Nlcy5ybShvLm1pcnJvckNvbnRhaW5lciwgJ2d1LXVuc2VsZWN0YWJsZScpO1xuICAgICAgdG91Y2h5KGRvY3VtZW50RWxlbWVudCwgJ3JlbW92ZScsICdtb3VzZW1vdmUnLCBkcmFnKTtcbiAgICAgIGdldFBhcmVudChfbWlycm9yKS5yZW1vdmVDaGlsZChfbWlycm9yKTtcbiAgICAgIF9taXJyb3IgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEltbWVkaWF0ZUNoaWxkIChkcm9wVGFyZ2V0LCB0YXJnZXQpIHtcbiAgICB2YXIgaW1tZWRpYXRlID0gdGFyZ2V0O1xuICAgIHdoaWxlIChpbW1lZGlhdGUgIT09IGRyb3BUYXJnZXQgJiYgZ2V0UGFyZW50KGltbWVkaWF0ZSkgIT09IGRyb3BUYXJnZXQpIHtcbiAgICAgIGltbWVkaWF0ZSA9IGdldFBhcmVudChpbW1lZGlhdGUpO1xuICAgIH1cbiAgICBpZiAoaW1tZWRpYXRlID09PSBkb2N1bWVudEVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gaW1tZWRpYXRlO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UmVmZXJlbmNlIChkcm9wVGFyZ2V0LCB0YXJnZXQsIHgsIHkpIHtcbiAgICB2YXIgaG9yaXpvbnRhbCA9IG8uZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCc7XG4gICAgdmFyIHJlZmVyZW5jZSA9IHRhcmdldCAhPT0gZHJvcFRhcmdldCA/IGluc2lkZSgpIDogb3V0c2lkZSgpO1xuICAgIHJldHVybiByZWZlcmVuY2U7XG5cbiAgICBmdW5jdGlvbiBvdXRzaWRlICgpIHsgLy8gc2xvd2VyLCBidXQgYWJsZSB0byBmaWd1cmUgb3V0IGFueSBwb3NpdGlvblxuICAgICAgdmFyIGxlbiA9IGRyb3BUYXJnZXQuY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgdmFyIGk7XG4gICAgICB2YXIgZWw7XG4gICAgICB2YXIgcmVjdDtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBlbCA9IGRyb3BUYXJnZXQuY2hpbGRyZW5baV07XG4gICAgICAgIHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgaWYgKGhvcml6b250YWwgJiYgKHJlY3QubGVmdCArIHJlY3Qud2lkdGggLyAyKSA+IHgpIHsgcmV0dXJuIGVsOyB9XG4gICAgICAgIGlmICghaG9yaXpvbnRhbCAmJiAocmVjdC50b3AgKyByZWN0LmhlaWdodCAvIDIpID4geSkgeyByZXR1cm4gZWw7IH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc2lkZSAoKSB7IC8vIGZhc3RlciwgYnV0IG9ubHkgYXZhaWxhYmxlIGlmIGRyb3BwZWQgaW5zaWRlIGEgY2hpbGQgZWxlbWVudFxuICAgICAgdmFyIHJlY3QgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBpZiAoaG9yaXpvbnRhbCkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh4ID4gcmVjdC5sZWZ0ICsgZ2V0UmVjdFdpZHRoKHJlY3QpIC8gMik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZSh5ID4gcmVjdC50b3AgKyBnZXRSZWN0SGVpZ2h0KHJlY3QpIC8gMik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZSAoYWZ0ZXIpIHtcbiAgICAgIHJldHVybiBhZnRlciA/IG5leHRFbCh0YXJnZXQpIDogdGFyZ2V0O1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQ29weSAoaXRlbSwgY29udGFpbmVyKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvLmNvcHkgPT09ICdib29sZWFuJyA/IG8uY29weSA6IG8uY29weShpdGVtLCBjb250YWluZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRvdWNoeSAoZWwsIG9wLCB0eXBlLCBmbikge1xuICB2YXIgdG91Y2ggPSB7XG4gICAgbW91c2V1cDogJ3RvdWNoZW5kJyxcbiAgICBtb3VzZWRvd246ICd0b3VjaHN0YXJ0JyxcbiAgICBtb3VzZW1vdmU6ICd0b3VjaG1vdmUnXG4gIH07XG4gIHZhciBwb2ludGVycyA9IHtcbiAgICBtb3VzZXVwOiAncG9pbnRlcnVwJyxcbiAgICBtb3VzZWRvd246ICdwb2ludGVyZG93bicsXG4gICAgbW91c2Vtb3ZlOiAncG9pbnRlcm1vdmUnXG4gIH07XG4gIHZhciBtaWNyb3NvZnQgPSB7XG4gICAgbW91c2V1cDogJ01TUG9pbnRlclVwJyxcbiAgICBtb3VzZWRvd246ICdNU1BvaW50ZXJEb3duJyxcbiAgICBtb3VzZW1vdmU6ICdNU1BvaW50ZXJNb3ZlJ1xuICB9O1xuICBpZiAoZ2xvYmFsLm5hdmlnYXRvci5wb2ludGVyRW5hYmxlZCkge1xuICAgIGNyb3NzdmVudFtvcF0oZWwsIHBvaW50ZXJzW3R5cGVdLCBmbik7XG4gIH0gZWxzZSBpZiAoZ2xvYmFsLm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkKSB7XG4gICAgY3Jvc3N2ZW50W29wXShlbCwgbWljcm9zb2Z0W3R5cGVdLCBmbik7XG4gIH0gZWxzZSB7XG4gICAgY3Jvc3N2ZW50W29wXShlbCwgdG91Y2hbdHlwZV0sIGZuKTtcbiAgICBjcm9zc3ZlbnRbb3BdKGVsLCB0eXBlLCBmbik7XG4gIH1cbn1cblxuZnVuY3Rpb24gd2hpY2hNb3VzZUJ1dHRvbiAoZSkge1xuICBpZiAoZS50b3VjaGVzICE9PSB2b2lkIDApIHsgcmV0dXJuIGUudG91Y2hlcy5sZW5ndGg7IH1cbiAgaWYgKGUud2hpY2ggIT09IHZvaWQgMCAmJiBlLndoaWNoICE9PSAwKSB7IHJldHVybiBlLndoaWNoOyB9IC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vYmV2YWNxdWEvZHJhZ3VsYS9pc3N1ZXMvMjYxXG4gIGlmIChlLmJ1dHRvbnMgIT09IHZvaWQgMCkgeyByZXR1cm4gZS5idXR0b25zOyB9XG4gIHZhciBidXR0b24gPSBlLmJ1dHRvbjtcbiAgaWYgKGJ1dHRvbiAhPT0gdm9pZCAwKSB7IC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS9ibG9iLzk5ZThmZjFiYWE3YWUzNDFlOTRiYjg5YzNlODQ1NzBjN2MzYWQ5ZWEvc3JjL2V2ZW50LmpzI0w1NzMtTDU3NVxuICAgIHJldHVybiBidXR0b24gJiAxID8gMSA6IGJ1dHRvbiAmIDIgPyAzIDogKGJ1dHRvbiAmIDQgPyAyIDogMCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0T2Zmc2V0IChlbCkge1xuICB2YXIgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICByZXR1cm4ge1xuICAgIGxlZnQ6IHJlY3QubGVmdCArIGdldFNjcm9sbCgnc2Nyb2xsTGVmdCcsICdwYWdlWE9mZnNldCcpLFxuICAgIHRvcDogcmVjdC50b3AgKyBnZXRTY3JvbGwoJ3Njcm9sbFRvcCcsICdwYWdlWU9mZnNldCcpXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFNjcm9sbCAoc2Nyb2xsUHJvcCwgb2Zmc2V0UHJvcCkge1xuICBpZiAodHlwZW9mIGdsb2JhbFtvZmZzZXRQcm9wXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZ2xvYmFsW29mZnNldFByb3BdO1xuICB9XG4gIGlmIChkb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50RWxlbWVudFtzY3JvbGxQcm9wXTtcbiAgfVxuICByZXR1cm4gZG9jLmJvZHlbc2Nyb2xsUHJvcF07XG59XG5cbmZ1bmN0aW9uIGdldEVsZW1lbnRCZWhpbmRQb2ludCAocG9pbnQsIHgsIHkpIHtcbiAgcG9pbnQgPSBwb2ludCB8fCB7fTtcbiAgdmFyIHN0YXRlID0gcG9pbnQuY2xhc3NOYW1lIHx8ICcnO1xuICB2YXIgZWw7XG4gIHBvaW50LmNsYXNzTmFtZSArPSAnIGd1LWhpZGUnO1xuICBlbCA9IGRvYy5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuICBwb2ludC5jbGFzc05hbWUgPSBzdGF0ZTtcbiAgcmV0dXJuIGVsO1xufVxuXG5mdW5jdGlvbiBuZXZlciAoKSB7IHJldHVybiBmYWxzZTsgfVxuZnVuY3Rpb24gYWx3YXlzICgpIHsgcmV0dXJuIHRydWU7IH1cbmZ1bmN0aW9uIGdldFJlY3RXaWR0aCAocmVjdCkgeyByZXR1cm4gcmVjdC53aWR0aCB8fCAocmVjdC5yaWdodCAtIHJlY3QubGVmdCk7IH1cbmZ1bmN0aW9uIGdldFJlY3RIZWlnaHQgKHJlY3QpIHsgcmV0dXJuIHJlY3QuaGVpZ2h0IHx8IChyZWN0LmJvdHRvbSAtIHJlY3QudG9wKTsgfVxuZnVuY3Rpb24gZ2V0UGFyZW50IChlbCkgeyByZXR1cm4gZWwucGFyZW50Tm9kZSA9PT0gZG9jID8gbnVsbCA6IGVsLnBhcmVudE5vZGU7IH1cbmZ1bmN0aW9uIGlzSW5wdXQgKGVsKSB7IHJldHVybiBlbC50YWdOYW1lID09PSAnSU5QVVQnIHx8IGVsLnRhZ05hbWUgPT09ICdURVhUQVJFQScgfHwgZWwudGFnTmFtZSA9PT0gJ1NFTEVDVCcgfHwgaXNFZGl0YWJsZShlbCk7IH1cbmZ1bmN0aW9uIGlzRWRpdGFibGUgKGVsKSB7XG4gIGlmICghZWwpIHsgcmV0dXJuIGZhbHNlOyB9IC8vIG5vIHBhcmVudHMgd2VyZSBlZGl0YWJsZVxuICBpZiAoZWwuY29udGVudEVkaXRhYmxlID09PSAnZmFsc2UnKSB7IHJldHVybiBmYWxzZTsgfSAvLyBzdG9wIHRoZSBsb29rdXBcbiAgaWYgKGVsLmNvbnRlbnRFZGl0YWJsZSA9PT0gJ3RydWUnKSB7IHJldHVybiB0cnVlOyB9IC8vIGZvdW5kIGEgY29udGVudEVkaXRhYmxlIGVsZW1lbnQgaW4gdGhlIGNoYWluXG4gIHJldHVybiBpc0VkaXRhYmxlKGdldFBhcmVudChlbCkpOyAvLyBjb250ZW50RWRpdGFibGUgaXMgc2V0IHRvICdpbmhlcml0J1xufVxuXG5mdW5jdGlvbiBuZXh0RWwgKGVsKSB7XG4gIHJldHVybiBlbC5uZXh0RWxlbWVudFNpYmxpbmcgfHwgbWFudWFsbHkoKTtcbiAgZnVuY3Rpb24gbWFudWFsbHkgKCkge1xuICAgIHZhciBzaWJsaW5nID0gZWw7XG4gICAgZG8ge1xuICAgICAgc2libGluZyA9IHNpYmxpbmcubmV4dFNpYmxpbmc7XG4gICAgfSB3aGlsZSAoc2libGluZyAmJiBzaWJsaW5nLm5vZGVUeXBlICE9PSAxKTtcbiAgICByZXR1cm4gc2libGluZztcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRFdmVudEhvc3QgKGUpIHtcbiAgLy8gb24gdG91Y2hlbmQgZXZlbnQsIHdlIGhhdmUgdG8gdXNlIGBlLmNoYW5nZWRUb3VjaGVzYFxuICAvLyBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83MTkyNTYzL3RvdWNoZW5kLWV2ZW50LXByb3BlcnRpZXNcbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8zNFxuICBpZiAoZS50YXJnZXRUb3VjaGVzICYmIGUudGFyZ2V0VG91Y2hlcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZS50YXJnZXRUb3VjaGVzWzBdO1xuICB9XG4gIGlmIChlLmNoYW5nZWRUb3VjaGVzICYmIGUuY2hhbmdlZFRvdWNoZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGUuY2hhbmdlZFRvdWNoZXNbMF07XG4gIH1cbiAgcmV0dXJuIGU7XG59XG5cbmZ1bmN0aW9uIGdldENvb3JkIChjb29yZCwgZSkge1xuICB2YXIgaG9zdCA9IGdldEV2ZW50SG9zdChlKTtcbiAgdmFyIG1pc3NNYXAgPSB7XG4gICAgcGFnZVg6ICdjbGllbnRYJywgLy8gSUU4XG4gICAgcGFnZVk6ICdjbGllbnRZJyAvLyBJRThcbiAgfTtcbiAgaWYgKGNvb3JkIGluIG1pc3NNYXAgJiYgIShjb29yZCBpbiBob3N0KSAmJiBtaXNzTWFwW2Nvb3JkXSBpbiBob3N0KSB7XG4gICAgY29vcmQgPSBtaXNzTWFwW2Nvb3JkXTtcbiAgfVxuICByZXR1cm4gaG9zdFtjb29yZF07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZHJhZ3VsYTtcbiIsInZhciBzaSA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicsIHRpY2s7XG5pZiAoc2kpIHtcbiAgdGljayA9IGZ1bmN0aW9uIChmbikgeyBzZXRJbW1lZGlhdGUoZm4pOyB9O1xufSBlbHNlIHtcbiAgdGljayA9IGZ1bmN0aW9uIChmbikgeyBzZXRUaW1lb3V0KGZuLCAwKTsgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0aWNrOyIsInR5cGUgTGlzdGVuZXJzID0ge1xuICBbaWQ6IHN0cmluZ106IHtcbiAgICBldmVudDogc3RyaW5nO1xuICAgIGVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICAgIGhhbmRsZXI6IChlOiBFdmVudCkgPT4gdm9pZDtcbiAgfTtcbn07XG5cbmV4cG9ydCBjbGFzcyBFdmVudExpc3RlbmVyIHtcbiAgcHJpdmF0ZSByZWFkb25seSBsaXN0ZW5lcnM6IExpc3RlbmVycyA9IHt9O1xuXG4gIGFkZChsaXN0ZW5lcklkOiBzdHJpbmcsIGV2ZW50OiBzdHJpbmcsIGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBoYW5kbGVyOiAoZTogRXZlbnQpID0+IHZvaWQpIHtcbiAgICB0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lcklkXSA9IHtcbiAgICAgIGV2ZW50LFxuICAgICAgZWxlbWVudCxcbiAgICAgIGhhbmRsZXIsXG4gICAgfTtcblxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlcik7XG4gIH1cblxuICByZW1vdmUobGlzdGVuZXJJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgbGlzdGVuZXIgPSB0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lcklkXTtcblxuICAgIGlmICghbGlzdGVuZXIpIHJldHVybjtcblxuICAgIGxpc3RlbmVyLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihsaXN0ZW5lci5ldmVudCwgbGlzdGVuZXIuaGFuZGxlcik7XG5cbiAgICBkZWxldGUgdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXJJZF07XG4gIH1cbn1cbiIsImltcG9ydCB7IHY0IGFzIHV1aWQsIHZhbGlkYXRlIH0gZnJvbSAndXVpZCc7XG5cbmV4cG9ydCBjb25zdCBzdGF0dXNNYXAgPSB7XG4gIHRvZG86ICdUT0RPJyxcbiAgZG9pbmc6ICdET0lORycsXG4gIGRvbmU6ICdET05FJyxcbn0gYXMgY29uc3Q7XG5leHBvcnQgdHlwZSBTdGF0dXMgPSB0eXBlb2Ygc3RhdHVzTWFwW2tleW9mIHR5cGVvZiBzdGF0dXNNYXBdO1xuXG5leHBvcnQgdHlwZSBUYXNrT2JqZWN0ID0ge1xuICBpZDogc3RyaW5nO1xuICB0aXRsZTogc3RyaW5nO1xuICBzdGF0dXM6IFN0YXR1cztcbn07XG5cbmV4cG9ydCBjbGFzcyBUYXNrIHtcbiAgcmVhZG9ubHkgaWQ7XG4gIHRpdGxlO1xuICBzdGF0dXM7XG5cbiAgY29uc3RydWN0b3IocHJvcGVydGllczogeyBpZD86IHN0cmluZzsgdGl0bGU6IHN0cmluZzsgc3RhdHVzPzogU3RhdHVzIH0pIHtcbiAgICB0aGlzLmlkID0gcHJvcGVydGllcy5pZCB8fCB1dWlkKCk7XG4gICAgdGhpcy50aXRsZSA9IHByb3BlcnRpZXMudGl0bGU7XG4gICAgdGhpcy5zdGF0dXMgPSBwcm9wZXJ0aWVzLnN0YXR1cyB8fCBzdGF0dXNNYXAudG9kbztcbiAgfVxuXG4gIHVwZGF0ZShwcm9wZXJ0aWVzOiB7IHRpdGxlPzogc3RyaW5nOyBzdGF0dXM/OiBTdGF0dXMgfSkge1xuICAgIHRoaXMudGl0bGUgPSBwcm9wZXJ0aWVzLnRpdGxlIHx8IHRoaXMudGl0bGU7XG4gICAgdGhpcy5zdGF0dXMgPSBwcm9wZXJ0aWVzLnN0YXR1cyB8fCB0aGlzLnN0YXR1cztcbiAgfVxuXG4gIHN0YXRpYyB2YWxpZGF0ZSh2YWx1ZTogYW55KSB7XG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICghdmFsaWRhdGUodmFsdWUuaWQpKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKCF2YWx1ZS50aXRsZSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICghT2JqZWN0LnZhbHVlcyhzdGF0dXNNYXApLmluY2x1ZGVzKHZhbHVlLnN0YXR1cykpIHJldHVybiBmYWxzZTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG4iLCJpbXBvcnQgeyBTdGF0dXMsIFRhc2ssIFRhc2tPYmplY3QgfSBmcm9tICcuL1Rhc2snO1xuXG5jb25zdCBTVE9SQUdFX0tFWSA9ICdUQVNLUyc7XG5cbmV4cG9ydCBjbGFzcyBUYXNrQ29sbGVjdGlvbiB7XG4gIHByaXZhdGUgcmVhZG9ubHkgc3RvcmFnZTtcbiAgcHJpdmF0ZSB0YXNrcztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2U7XG4gICAgdGhpcy50YXNrcyA9IHRoaXMuZ2V0U3RvcmVkVGFza3MoKTtcbiAgfVxuXG4gIGFkZCh0YXNrOiBUYXNrKSB7XG4gICAgdGhpcy50YXNrcy5wdXNoKHRhc2spO1xuICAgIHRoaXMudXBkYXRlU3RvcmFnZSgpO1xuICB9XG5cbiAgZGVsZXRlKHRhc2s6IFRhc2spIHtcbiAgICB0aGlzLnRhc2tzID0gdGhpcy50YXNrcy5maWx0ZXIoKHsgaWQgfSkgPT4gaWQgIT09IHRhc2suaWQpO1xuICAgIHRoaXMudXBkYXRlU3RvcmFnZSgpO1xuICB9XG5cbiAgZmluZChpZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMudGFza3MuZmluZCgodGFzaykgPT4gdGFzay5pZCA9PT0gaWQpO1xuICB9XG5cbiAgdXBkYXRlKHRhc2s6IFRhc2spIHtcbiAgICB0aGlzLnRhc2tzID0gdGhpcy50YXNrcy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIGlmIChpdGVtLmlkID09PSB0YXNrLmlkKSByZXR1cm4gdGFzaztcbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH0pO1xuICB9XG5cbiAgZmlsdGVyKGZpbHRlclN0YXR1czogU3RhdHVzKSB7XG4gICAgcmV0dXJuIHRoaXMudGFza3MuZmlsdGVyKCh7IHN0YXR1cyB9KSA9PiBzdGF0dXMgPT09IGZpbHRlclN0YXR1cyk7XG4gIH1cblxuICBtb3ZlQWJvdmVUYXJnZXQodGFzazogVGFzaywgdGFyZ2V0OiBUYXNrKSB7XG4gICAgY29uc3QgdGFza0luZGV4ID0gdGhpcy50YXNrcy5pbmRleE9mKHRhc2spO1xuICAgIGNvbnN0IHRhcmdldEluZGV4ID0gdGhpcy50YXNrcy5pbmRleE9mKHRhcmdldCk7XG5cbiAgICB0aGlzLmNoYW5nZU9yZGVyKHRhc2ssIHRhc2tJbmRleCwgdGFza0luZGV4IDwgdGFyZ2V0SW5kZXggPyB0YXJnZXRJbmRleCAtIDEgOiB0YXJnZXRJbmRleCk7XG4gIH1cblxuICBtb3ZlVG9MYXN0KHRhc2s6IFRhc2spIHtcbiAgICBjb25zdCB0YXNrSW5kZXggPSB0aGlzLnRhc2tzLmluZGV4T2YodGFzayk7XG5cbiAgICB0aGlzLmNoYW5nZU9yZGVyKHRhc2ssIHRhc2tJbmRleCwgdGhpcy50YXNrcy5sZW5ndGgpO1xuICB9XG5cbiAgcHJpdmF0ZSBjaGFuZ2VPcmRlcih0YXNrOiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlciwgdGFyZ2V0SW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMudGFza3Muc3BsaWNlKHRhc2tJbmRleCwgMSk7XG4gICAgdGhpcy50YXNrcy5zcGxpY2UodGFyZ2V0SW5kZXgsIDAsIHRhc2spO1xuICAgIHRoaXMudXBkYXRlU3RvcmFnZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVTdG9yYWdlKCkge1xuICAgIHRoaXMuc3RvcmFnZS5zZXRJdGVtKFNUT1JBR0VfS0VZLCBKU09OLnN0cmluZ2lmeSh0aGlzLnRhc2tzKSk7XG4gIH1cblxuICBwcml2YXRlIGdldFN0b3JlZFRhc2tzKCkge1xuICAgIGNvbnN0IGpzb25TdHJpbmcgPSB0aGlzLnN0b3JhZ2UuZ2V0SXRlbShTVE9SQUdFX0tFWSk7XG5cbiAgICBpZiAoIWpzb25TdHJpbmcpIHJldHVybiBbXTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBzdG9yZWRUYXNrcyA9IEpTT04ucGFyc2UoanNvblN0cmluZyk7XG5cbiAgICAgIGFzc2VydElzVGFza09iamVjdHMoc3RvcmVkVGFza3MpO1xuXG4gICAgICBjb25zdCB0YXNrcyA9IHN0b3JlZFRhc2tzLm1hcCgodGFzaykgPT4gbmV3IFRhc2sodGFzaykpO1xuXG4gICAgICByZXR1cm4gdGFza3M7XG4gICAgfSBjYXRjaCB7XG4gICAgICB0aGlzLnN0b3JhZ2UucmVtb3ZlSXRlbShTVE9SQUdFX0tFWSk7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydElzVGFza09iamVjdHModmFsdWU6IGFueSk6IGFzc2VydHMgdmFsdWUgaXMgVGFza09iamVjdFtdIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSB8fCAhdmFsdWUuZXZlcnkoKGl0ZW0pID0+IFRhc2sudmFsaWRhdGUoaXRlbSkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCflvJXmlbDjgIx2YWx1ZeOAjeOBryBUYXNrT2JqZWN0W10g5Z6L44Go5LiA6Ie044GX44G+44Gb44KT44CCJyk7XG4gIH1cbn1cbiIsImltcG9ydCBkcmFndWxhIGZyb20gJ2RyYWd1bGEnO1xuXG5pbXBvcnQgeyBTdGF0dXMsIFRhc2ssIHN0YXR1c01hcCB9IGZyb20gJy4vVGFzayc7XG5pbXBvcnQgeyBUYXNrQ29sbGVjdGlvbiB9IGZyb20gJy4vVGFza0NvbGxlY3Rpb24nO1xuXG5leHBvcnQgY2xhc3MgVGFza1JlbmRlcmVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSB0b2RvTGlzdDogSFRNTEVsZW1lbnQsXG4gICAgcHJpdmF0ZSByZWFkb25seSBkb2luZ0xpc3Q6IEhUTUxFbGVtZW50LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgZG9uZUxpc3Q6IEhUTUxFbGVtZW50XG4gICkge31cblxuICBhcHBlbmQodGFzazogVGFzaykge1xuICAgIGNvbnN0IHsgdGFza0VsLCBkZWxldGVCdXR0b25FbCB9ID0gdGhpcy5yZW5kZXIodGFzayk7XG5cbiAgICB0aGlzLnRvZG9MaXN0LmFwcGVuZCh0YXNrRWwpO1xuICAgIHJldHVybiB7IGRlbGV0ZUJ1dHRvbkVsIH07XG4gIH1cblxuICByZW1vdmUodGFzazogVGFzaykge1xuICAgIGNvbnN0IHRhc2tFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhc2suaWQpO1xuXG4gICAgaWYgKCF0YXNrRWwpIHJldHVybjtcblxuICAgIGlmICh0YXNrLnN0YXR1cyA9PT0gc3RhdHVzTWFwLnRvZG8pIHtcbiAgICAgIHRoaXMudG9kb0xpc3QucmVtb3ZlQ2hpbGQodGFza0VsKTtcbiAgICB9XG5cbiAgICBpZiAodGFzay5zdGF0dXMgPT09IHN0YXR1c01hcC5kb2luZykge1xuICAgICAgdGhpcy5kb2luZ0xpc3QucmVtb3ZlQ2hpbGQodGFza0VsKTtcbiAgICB9XG5cbiAgICBpZiAodGFzay5zdGF0dXMgPT09IHN0YXR1c01hcC5kb25lKSB7XG4gICAgICB0aGlzLmRvbmVMaXN0LnJlbW92ZUNoaWxkKHRhc2tFbCk7XG4gICAgfVxuICB9XG5cbiAgc3Vic2NyaWJlRHJhZ0FuZERyb3Aob25Ecm9wOiAoZWw6IEVsZW1lbnQsIHNpYmxpbmc6IEVsZW1lbnQgfCBudWxsLCBuZXdTdGF0dXM6IFN0YXR1cykgPT4gdm9pZCkge1xuICAgIGRyYWd1bGEoW3RoaXMudG9kb0xpc3QsIHRoaXMuZG9pbmdMaXN0LCB0aGlzLmRvbmVMaXN0XSkub24oXG4gICAgICAnZHJvcCcsXG4gICAgICAoZWwsIHRhcmdldCwgX3NvdXJjZSwgc2libGluZykgPT4ge1xuICAgICAgICBsZXQgbmV3U3RhdHVzOiBTdGF0dXMgPSBzdGF0dXNNYXAudG9kbztcblxuICAgICAgICBpZiAodGFyZ2V0LmlkID09PSAnZG9pbmdMaXN0JykgbmV3U3RhdHVzID0gc3RhdHVzTWFwLmRvaW5nO1xuICAgICAgICBpZiAodGFyZ2V0LmlkID09PSAnZG9uZUxpc3QnKSBuZXdTdGF0dXMgPSBzdGF0dXNNYXAuZG9uZTtcblxuICAgICAgICBvbkRyb3AoZWwsIHNpYmxpbmcsIG5ld1N0YXR1cyk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIGdldElkKGVsOiBFbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsLmlkO1xuICB9XG5cbiAgcmVuZGVyQWxsKHRhc2tDb2xsZWN0aW9uOiBUYXNrQ29sbGVjdGlvbikge1xuICAgIGNvbnN0IHRvZG9UYXNrcyA9IHRoaXMucmVuZGVyTGlzdCh0YXNrQ29sbGVjdGlvbi5maWx0ZXIoc3RhdHVzTWFwLnRvZG8pLCB0aGlzLnRvZG9MaXN0KTtcbiAgICBjb25zdCBkb2luZ1Rhc2tzID0gdGhpcy5yZW5kZXJMaXN0KHRhc2tDb2xsZWN0aW9uLmZpbHRlcihzdGF0dXNNYXAuZG9pbmcpLCB0aGlzLmRvaW5nTGlzdCk7XG4gICAgY29uc3QgZG9uZVRhc2tzID0gdGhpcy5yZW5kZXJMaXN0KHRhc2tDb2xsZWN0aW9uLmZpbHRlcihzdGF0dXNNYXAuZG9uZSksIHRoaXMuZG9uZUxpc3QpO1xuXG4gICAgcmV0dXJuIFsuLi50b2RvVGFza3MsIC4uLmRvaW5nVGFza3MsIC4uLmRvbmVUYXNrc107XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckxpc3QodGFza3M6IFRhc2tbXSwgbGlzdEVsOiBIVE1MRWxlbWVudCkge1xuICAgIGlmICh0YXNrcy5sZW5ndGggPT09IDApIHJldHVybiBbXTtcblxuICAgIGNvbnN0IHRhc2tMaXN0OiBBcnJheTx7XG4gICAgICB0YXNrOiBUYXNrO1xuICAgICAgZGVsZXRlQnV0dG9uRWw6IEhUTUxCdXR0b25FbGVtZW50O1xuICAgIH0+ID0gW107XG5cbiAgICB0YXNrcy5mb3JFYWNoKCh0YXNrKSA9PiB7XG4gICAgICBjb25zdCB7IHRhc2tFbCwgZGVsZXRlQnV0dG9uRWwgfSA9IHRoaXMucmVuZGVyKHRhc2spO1xuXG4gICAgICBsaXN0RWwuYXBwZW5kKHRhc2tFbCk7XG4gICAgICB0YXNrTGlzdC5wdXNoKHsgdGFzaywgZGVsZXRlQnV0dG9uRWwgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGFza0xpc3Q7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlcih0YXNrOiBUYXNrKSB7XG4gICAgLy8gPGRpdiBjbGFzcz1cInRhc2tJdGVtXCI+XG4gICAgLy8gICA8c3Bhbj7jgr/jgqTjg4jjg6s8L3NwYW4+XG4gICAgLy8gICA8YnV0dG9uPuWJiumZpDwvYnV0dG9uPlxuICAgIC8vIDwvZGl2PlxuXG4gICAgY29uc3QgdGFza0VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uc3Qgc3BhbkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGNvbnN0IGRlbGV0ZUJ1dHRvbkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG5cbiAgICB0YXNrRWwuaWQgPSB0YXNrLmlkO1xuICAgIHRhc2tFbC5jbGFzc0xpc3QuYWRkKCd0YXNrLWl0ZW0nKTtcblxuICAgIHNwYW5FbC50ZXh0Q29udGVudCA9IHRhc2sudGl0bGU7XG4gICAgZGVsZXRlQnV0dG9uRWwudGV4dENvbnRlbnQgPSAn5YmK6ZmkJztcblxuICAgIHRhc2tFbC5hcHBlbmQoc3BhbkVsLCBkZWxldGVCdXR0b25FbCk7XG5cbiAgICByZXR1cm4geyB0YXNrRWwsIGRlbGV0ZUJ1dHRvbkVsIH07XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IC9eKD86WzAtOWEtZl17OH0tWzAtOWEtZl17NH0tWzEtNV1bMC05YS1mXXszfS1bODlhYl1bMC05YS1mXXszfS1bMC05YS1mXXsxMn18MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwKSQvaTsiLCIvLyBVbmlxdWUgSUQgY3JlYXRpb24gcmVxdWlyZXMgYSBoaWdoIHF1YWxpdHkgcmFuZG9tICMgZ2VuZXJhdG9yLiBJbiB0aGUgYnJvd3NlciB3ZSB0aGVyZWZvcmVcbi8vIHJlcXVpcmUgdGhlIGNyeXB0byBBUEkgYW5kIGRvIG5vdCBzdXBwb3J0IGJ1aWx0LWluIGZhbGxiYWNrIHRvIGxvd2VyIHF1YWxpdHkgcmFuZG9tIG51bWJlclxuLy8gZ2VuZXJhdG9ycyAobGlrZSBNYXRoLnJhbmRvbSgpKS5cbnZhciBnZXRSYW5kb21WYWx1ZXM7XG52YXIgcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBybmcoKSB7XG4gIC8vIGxhenkgbG9hZCBzbyB0aGF0IGVudmlyb25tZW50cyB0aGF0IG5lZWQgdG8gcG9seWZpbGwgaGF2ZSBhIGNoYW5jZSB0byBkbyBzb1xuICBpZiAoIWdldFJhbmRvbVZhbHVlcykge1xuICAgIC8vIGdldFJhbmRvbVZhbHVlcyBuZWVkcyB0byBiZSBpbnZva2VkIGluIGEgY29udGV4dCB3aGVyZSBcInRoaXNcIiBpcyBhIENyeXB0byBpbXBsZW1lbnRhdGlvbi4gQWxzbyxcbiAgICAvLyBmaW5kIHRoZSBjb21wbGV0ZSBpbXBsZW1lbnRhdGlvbiBvZiBjcnlwdG8gKG1zQ3J5cHRvKSBvbiBJRTExLlxuICAgIGdldFJhbmRvbVZhbHVlcyA9IHR5cGVvZiBjcnlwdG8gIT09ICd1bmRlZmluZWQnICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMgJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKGNyeXB0bykgfHwgdHlwZW9mIG1zQ3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbXNDcnlwdG8uZ2V0UmFuZG9tVmFsdWVzID09PSAnZnVuY3Rpb24nICYmIG1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKG1zQ3J5cHRvKTtcblxuICAgIGlmICghZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyeXB0by5nZXRSYW5kb21WYWx1ZXMoKSBub3Qgc3VwcG9ydGVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3V1aWRqcy91dWlkI2dldHJhbmRvbXZhbHVlcy1ub3Qtc3VwcG9ydGVkJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGdldFJhbmRvbVZhbHVlcyhybmRzOCk7XG59IiwiaW1wb3J0IHZhbGlkYXRlIGZyb20gJy4vdmFsaWRhdGUuanMnO1xuLyoqXG4gKiBDb252ZXJ0IGFycmF5IG9mIDE2IGJ5dGUgdmFsdWVzIHRvIFVVSUQgc3RyaW5nIGZvcm1hdCBvZiB0aGUgZm9ybTpcbiAqIFhYWFhYWFhYLVhYWFgtWFhYWC1YWFhYLVhYWFhYWFhYWFhYWFxuICovXG5cbnZhciBieXRlVG9IZXggPSBbXTtcblxuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXgucHVzaCgoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpKTtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5KGFycikge1xuICB2YXIgb2Zmc2V0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xuICAvLyBOb3RlOiBCZSBjYXJlZnVsIGVkaXRpbmcgdGhpcyBjb2RlISAgSXQncyBiZWVuIHR1bmVkIGZvciBwZXJmb3JtYW5jZVxuICAvLyBhbmQgd29ya3MgaW4gd2F5cyB5b3UgbWF5IG5vdCBleHBlY3QuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQvcHVsbC80MzRcbiAgdmFyIHV1aWQgPSAoYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAwXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDFdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMl1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAzXV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDRdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgNV1dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA2XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDddXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgOF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA5XV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEwXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDExXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEyXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEzXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDE0XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDE1XV0pLnRvTG93ZXJDYXNlKCk7IC8vIENvbnNpc3RlbmN5IGNoZWNrIGZvciB2YWxpZCBVVUlELiAgSWYgdGhpcyB0aHJvd3MsIGl0J3MgbGlrZWx5IGR1ZSB0byBvbmVcbiAgLy8gb2YgdGhlIGZvbGxvd2luZzpcbiAgLy8gLSBPbmUgb3IgbW9yZSBpbnB1dCBhcnJheSB2YWx1ZXMgZG9uJ3QgbWFwIHRvIGEgaGV4IG9jdGV0IChsZWFkaW5nIHRvXG4gIC8vIFwidW5kZWZpbmVkXCIgaW4gdGhlIHV1aWQpXG4gIC8vIC0gSW52YWxpZCBpbnB1dCB2YWx1ZXMgZm9yIHRoZSBSRkMgYHZlcnNpb25gIG9yIGB2YXJpYW50YCBmaWVsZHNcblxuICBpZiAoIXZhbGlkYXRlKHV1aWQpKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKCdTdHJpbmdpZmllZCBVVUlEIGlzIGludmFsaWQnKTtcbiAgfVxuXG4gIHJldHVybiB1dWlkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzdHJpbmdpZnk7IiwiaW1wb3J0IHJuZyBmcm9tICcuL3JuZy5qcyc7XG5pbXBvcnQgc3RyaW5naWZ5IGZyb20gJy4vc3RyaW5naWZ5LmpzJztcblxuZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBybmRzID0gb3B0aW9ucy5yYW5kb20gfHwgKG9wdGlvbnMucm5nIHx8IHJuZykoKTsgLy8gUGVyIDQuNCwgc2V0IGJpdHMgZm9yIHZlcnNpb24gYW5kIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYFxuXG4gIHJuZHNbNl0gPSBybmRzWzZdICYgMHgwZiB8IDB4NDA7XG4gIHJuZHNbOF0gPSBybmRzWzhdICYgMHgzZiB8IDB4ODA7IC8vIENvcHkgYnl0ZXMgdG8gYnVmZmVyLCBpZiBwcm92aWRlZFxuXG4gIGlmIChidWYpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTY7ICsraSkge1xuICAgICAgYnVmW29mZnNldCArIGldID0gcm5kc1tpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmO1xuICB9XG5cbiAgcmV0dXJuIHN0cmluZ2lmeShybmRzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdjQ7IiwiaW1wb3J0IFJFR0VYIGZyb20gJy4vcmVnZXguanMnO1xuXG5mdW5jdGlvbiB2YWxpZGF0ZSh1dWlkKSB7XG4gIHJldHVybiB0eXBlb2YgdXVpZCA9PT0gJ3N0cmluZycgJiYgUkVHRVgudGVzdCh1dWlkKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdmFsaWRhdGU7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgRXZlbnRMaXN0ZW5lciB9IGZyb20gJy4vRXZlbnRMaXN0ZW5lcic7XG5pbXBvcnQgeyBTdGF0dXMsIHN0YXR1c01hcCwgVGFzayB9IGZyb20gJy4vVGFzayc7XG5pbXBvcnQgeyBUYXNrQ29sbGVjdGlvbiB9IGZyb20gJy4vVGFza0NvbGxlY3Rpb24nO1xuaW1wb3J0IHsgVGFza1JlbmRlcmVyIH0gZnJvbSAnLi9UYXNrUmVuZGVyZXInO1xuXG5jbGFzcyBBcHBsaWNhdGlvbiB7XG4gIHByaXZhdGUgcmVhZG9ubHkgZXZlbnRMaXN0ZW5lciA9IG5ldyBFdmVudExpc3RlbmVyKCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgdGFza0NvbGxlY3Rpb24gPSBuZXcgVGFza0NvbGxlY3Rpb24oKTtcbiAgcHJpdmF0ZSByZWFkb25seSB0YXNrUmVuZGVyZXIgPSBuZXcgVGFza1JlbmRlcmVyKFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2RvTGlzdCcpIGFzIEhUTUxFbGVtZW50LFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkb2luZ0xpc3QnKSBhcyBIVE1MRWxlbWVudCxcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZG9uZUxpc3QnKSBhcyBIVE1MRWxlbWVudFxuICApO1xuXG4gIHN0YXJ0KCkge1xuICAgIGNvbnN0IHRhc2tJdGVtcyA9IHRoaXMudGFza1JlbmRlcmVyLnJlbmRlckFsbCh0aGlzLnRhc2tDb2xsZWN0aW9uKTtcbiAgICBjb25zdCBjcmVhdGVGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NyZWF0ZUZvcm0nKSBhcyBIVE1MRWxlbWVudDtcbiAgICBjb25zdCBkZWxldGVBbGxEb25lVGFza0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWxldGVBbGxEb25lVGFzaycpIGFzIEhUTUxFbGVtZW50O1xuXG4gICAgdGFza0l0ZW1zLmZvckVhY2goKHsgdGFzaywgZGVsZXRlQnV0dG9uRWwgfSkgPT4ge1xuICAgICAgdGhpcy5ldmVudExpc3RlbmVyLmFkZCh0YXNrLmlkLCAnY2xpY2snLCBkZWxldGVCdXR0b25FbCwgKCkgPT5cbiAgICAgICAgdGhpcy5oYW5kbGVDbGlja0RlbGV0ZVRhc2sodGFzaylcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmV2ZW50TGlzdGVuZXIuYWRkKCdzdWJtaXQtaGFuZGxlcicsICdzdWJtaXQnLCBjcmVhdGVGb3JtLCB0aGlzLmhhbmRsZVN1Ym1pdCk7XG4gICAgdGhpcy5ldmVudExpc3RlbmVyLmFkZChcbiAgICAgICdjbGljay1oYW5kbGVyJyxcbiAgICAgICdjbGljaycsXG4gICAgICBkZWxldGVBbGxEb25lVGFza0J1dHRvbixcbiAgICAgIHRoaXMuaGFuZGxlQ2xpY2tEZWxldGVBbGxEb25lVGFza3NcbiAgICApO1xuXG4gICAgdGhpcy50YXNrUmVuZGVyZXIuc3Vic2NyaWJlRHJhZ0FuZERyb3AodGhpcy5oYW5kbGVEcm9wQW5kRHJvcCk7XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZVN1Ym1pdCA9IChlOiBFdmVudCkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnN0IHRpdGxlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGl0bGUnKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXG4gICAgaWYgKCF0aXRsZUlucHV0LnZhbHVlKSByZXR1cm47XG5cbiAgICBjb25zdCB0YXNrID0gbmV3IFRhc2soeyB0aXRsZTogdGl0bGVJbnB1dC52YWx1ZSB9KTtcbiAgICB0aGlzLnRhc2tDb2xsZWN0aW9uLmFkZCh0YXNrKTtcblxuICAgIGNvbnN0IHsgZGVsZXRlQnV0dG9uRWwgfSA9IHRoaXMudGFza1JlbmRlcmVyLmFwcGVuZCh0YXNrKTtcblxuICAgIHRoaXMuZXZlbnRMaXN0ZW5lci5hZGQodGFzay5pZCwgJ2NsaWNrJywgZGVsZXRlQnV0dG9uRWwsICgpID0+XG4gICAgICB0aGlzLmhhbmRsZUNsaWNrRGVsZXRlVGFzayh0YXNrKVxuICAgICk7XG5cbiAgICB0aXRsZUlucHV0LnZhbHVlID0gJyc7XG4gIH07XG5cbiAgcHJpdmF0ZSBleGVjdXRlRGVsZXRlVGFzayA9ICh0YXNrOiBUYXNrKSA9PiB7XG4gICAgdGhpcy5ldmVudExpc3RlbmVyLnJlbW92ZSh0YXNrLmlkKTtcbiAgICB0aGlzLnRhc2tDb2xsZWN0aW9uLmRlbGV0ZSh0YXNrKTtcbiAgICB0aGlzLnRhc2tSZW5kZXJlci5yZW1vdmUodGFzayk7XG4gIH07XG5cbiAgcHJpdmF0ZSBoYW5kbGVDbGlja0RlbGV0ZVRhc2sgPSAodGFzazogVGFzaykgPT4ge1xuICAgIGlmICghd2luZG93LmNvbmZpcm0oYOOAjCR7dGFzay50aXRsZX3jgI3jgpLliYrpmaTjgZfjgabjgojjgo3jgZfjgYTjgafjgZnjgYvvvJ9gKSkgcmV0dXJuO1xuXG4gICAgdGhpcy5leGVjdXRlRGVsZXRlVGFzayh0YXNrKTtcbiAgfTtcblxuICBwcml2YXRlIGhhbmRsZUNsaWNrRGVsZXRlQWxsRG9uZVRhc2tzID0gKCkgPT4ge1xuICAgIGlmICghd2luZG93LmNvbmZpcm0oJ0RPTkUg44Gu44K/44K544Kv44KS5LiA5ous5YmK6Zmk44GX44Gm44KI44KN44GX44GE44Gn44GZ44GL77yfJykpIHJldHVybjtcblxuICAgIGNvbnN0IGRvbmVUYXNrcyA9IHRoaXMudGFza0NvbGxlY3Rpb24uZmlsdGVyKHN0YXR1c01hcC5kb25lKTtcblxuICAgIGRvbmVUYXNrcy5mb3JFYWNoKCh0YXNrKSA9PiB0aGlzLmV4ZWN1dGVEZWxldGVUYXNrKHRhc2spKTtcbiAgfTtcblxuICBwcml2YXRlIGhhbmRsZURyb3BBbmREcm9wID0gKGVsOiBFbGVtZW50LCBzaWJsaW5nOiBFbGVtZW50IHwgbnVsbCwgbmV3U3RhdHVzOiBTdGF0dXMpID0+IHtcbiAgICBjb25zdCB0YXNrSWQgPSB0aGlzLnRhc2tSZW5kZXJlci5nZXRJZChlbCk7XG5cbiAgICBpZiAoIXRhc2tJZCkgcmV0dXJuO1xuXG4gICAgY29uc3QgdGFzayA9IHRoaXMudGFza0NvbGxlY3Rpb24uZmluZCh0YXNrSWQpO1xuXG4gICAgaWYgKCF0YXNrKSByZXR1cm47XG5cbiAgICB0YXNrLnVwZGF0ZSh7IHN0YXR1czogbmV3U3RhdHVzIH0pO1xuICAgIHRoaXMudGFza0NvbGxlY3Rpb24udXBkYXRlKHRhc2spO1xuXG4gICAgY29uc29sZS5sb2coc2libGluZyk7XG4gIH07XG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICBjb25zdCBhcHAgPSBuZXcgQXBwbGljYXRpb24oKTtcbiAgYXBwLnN0YXJ0KCk7XG59KTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==