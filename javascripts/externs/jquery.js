/**
 * @param {Object|string} arg
 * @return {jQueryObject}
 */
var $ = function(arg) {};

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
