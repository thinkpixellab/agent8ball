// copied as needed from
// http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/jquery-1.3.2.externs.js
/**
 * @param {Object|string} arg
 * @return {jQueryObject}
 */
var $ = function(arg) {};

/**
 * @param {Object|string} arg
 * @return {jQueryObject}
 */
var jQuery = function(arg) {};

/** @constructor */
function jQueryObject() {};

/**
 * @param {Function} fn
 * @return {jQueryObject}
 */
jQueryObject.prototype.resize = function(fn) {};

/**
 * @param {Function} fn
 * @return {jQueryObject}
 */
jQueryObject.prototype.mousedown = function(fn) {};
/**
 * @param {Function} fn
 * @return {jQueryObject}
 */
jQueryObject.prototype.mouseleave = function(fn) {};
/**
 * @param {Function} fn
 * @return {jQueryObject}
 */
jQueryObject.prototype.mousemove = function(fn) {};
/**
 * @param {Function} fn
 * @return {jQueryObject}
 */
jQueryObject.prototype.mouseup = function(fn) {};
/**
 * @param {Function} fn
 * @return {jQueryObject}
 */
jQueryObject.prototype.keypress = function(fn) {};

/**
 * @return {Object}
 */
jQueryObject.prototype.offset = function() {};
/**
 * @param {(number|string)=} opt_speed
 * @param {Function=} opt_fn
 * @return {jQueryObject}
 */
jQueryObject.prototype.fadeIn = function(opt_speed, opt_fn) {};

/**
 * @param {(number|string)=} opt_speed
 * @param {Function=} opt_fn
 * @return {jQueryObject}
 */
jQueryObject.prototype.fadeOut = function(opt_speed, opt_fn) {};

/**
 * @param {(number|string)=} opt_speed
 * @return {jQueryObject}
 */
jQueryObject.prototype.delay = function(opt_speed) {};

/**
 * @param {(number|string)=} opt_speed
 * @param {Function=} opt_fn
 * @return {jQueryObject}
 */
jQueryObject.prototype.hide = function(opt_speed, opt_fn) {};

/**
 * @param {string} opt_val
 * @return {string|jQueryObject}
 */
jQueryObject.prototype.html = function(opt_val) {};

/**
 * @param {Function} fn
 * @return {jQueryObject}
 */
jQueryObject.prototype.ready = function(fn) {};
/**
 * @param {Object} settings
 * @return {Object}
 */
jQueryObject.prototype.ajax = function(settings) {};

/**
 * @param {string|Object} nameOrProperties
 * @param {(string|number|Function)=} opt_value
 * @return {Object|jQueryObject|string}
 */
jQueryObject.prototype.css = function(nameOrProperties, opt_value) {};

/**
 * @param {Function} callback
 * @return {jQueryObject}
 */
jQueryObject.prototype.each = function(callback) {};

/**
 * @param {string|Object} nameOrProperties
 * @param {*=} opt_value
 * @return {Object|jQueryObject}
 */
jQueryObject.prototype.attr = function(nameOrProperties, opt_value) {};

/**
 * @param {string} selector
 * @return {jQueryObject}
 */
jQueryObject.prototype.appendTo = function(selector) {};

/**
 * @param {string} string
 * @return {jQueryObject}
 */
jQueryObject.prototype.unbind = function(string){};

/**
 * @param {string} string
 * @param {function()} func
 * @return {jQueryObject}
 */
jQueryObject.prototype.bind = function(string, func){};

/**
 * @param {boolean} opt_clearQueue
 * @param {boolean} opt_gotoEnd
 * @return {jQueryObject}
 */
jQueryObject.prototype.stop = function(opt_clearQueue, opt_gotoEnd) {};
