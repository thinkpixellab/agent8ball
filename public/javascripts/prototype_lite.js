/*  Prototype JavaScript framework, version 1.7_rc2
 *  (c) 2005-2010 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

/* Based on Alex Arnell's inheritance implementation. */

var Class = (function() {

  function subclass() {};

  function create() {
    var parent = null;

    function klass() {
      this.initialize.apply(this, arguments);
    }

    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    if (!klass.prototype.initialize) {
      klass.prototype.initialize = function() {};
    }

    klass.prototype.constructor = klass;
    return klass;
  }

  return {
    create: create
  };
})();

(function() {

  function extend(destination, source) {
    for (var property in source)
    destination[property] = source[property];
    return destination;
  }

  extend(Object, {
    extend: extend
  });
})();
