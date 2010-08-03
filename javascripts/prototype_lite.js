/*  Prototype JavaScript framework, version 1.7_rc2
 *  (c) 2005-2010 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

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
