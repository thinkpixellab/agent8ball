goog.provide('pixelLab.DebugDiv');

goog.require('goog.asserts');
goog.require('goog.debug.LogManager');
goog.require('goog.dom');
goog.require('goog.style');

// call this function from a script within the document for which to enable debug output
pixelLab.DebugDiv.enable = function() {
  if (!pixelLab.DebugDiv.s_debugDiv) {
    var div = pixelLab.DebugDiv.s_debugDiv = goog.dom.createDom('div', {
      'id': pixelLab.DebugDiv.c_divId,
      'style': 'display:block; position:absolute; top:7px; right:7px; padding:10px; width:300px; background: rgba(0,0,0,.4); color:yellowgreen; text-align:left; font-family:monospace; border:solid 1px black; z-index:9999;'
    });

    document.body.appendChild(div);

    goog.debug.LogManager.getRoot().addHandler(pixelLab.DebugDiv._onLog);
  }
  goog.asserts.assert(document.getElementById(pixelLab.DebugDiv.c_divId));
};

pixelLab.DebugDiv.disable = function() {
  if (pixelLab.DebugDiv.s_debugDiv) {
    goog.dom.removeNode(pixelLab.DebugDiv.s_debugDiv);
    pixelLab.DebugDiv.s_debugDiv = null;
    goog.debug.LogManager.getRoot().removeHandler(pixelLab.DebugDiv._onLog);
  }
  goog.asserts.assert(!document.getElementById(pixelLab.DebugDiv.c_divId));
};

/**
 @return {boolean} true if on, false otherwise.
 */
pixelLab.DebugDiv.toggle = function() {
  if (pixelLab.DebugDiv.s_debugDiv) {
    pixelLab.DebugDiv.disable();
    return false;
  }
  else {
    pixelLab.DebugDiv.enable();
    return true;
  }
};

// clears the debug output.  called either manually or by the user clicking the 'clear' link in the debug div.
pixelLab.DebugDiv.clear = function() {
  if (pixelLab.DebugDiv.s_debugDiv) {
    goog.dom.removeChildren(pixelLab.DebugDiv.s_debugDiv);
    goog.style.setStyle(pixelLab.DebugDiv.s_debugDiv, 'display', 'none');
  }
};

/**
 * Log a LogRecord.
 * @param {goog.debug.LogRecord} logRecord A log record to log.
 * @private
 */
pixelLab.DebugDiv._onLog = function(logRecord) {
  if (pixelLab.DebugDiv.s_debugDiv) {
    goog.style.setStyle(pixelLab.DebugDiv.s_debugDiv, 'display', 'block');
    var c = goog.dom.createDom('div', null, goog.string.htmlEscape(logRecord.getMessage()));
    goog.dom.appendChild(pixelLab.DebugDiv.s_debugDiv, c);
  }
};

/**
 @const
 @private
 @type {string}
 */
pixelLab.DebugDiv.c_divId = '_debugLogDiv';
