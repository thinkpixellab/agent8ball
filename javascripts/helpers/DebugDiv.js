
goog.provide('pixelLab.DebugDiv');

goog.require('goog.debug.LogManager');
goog.require('goog.dom');

// call this function from a script within the document for which to enable debug output
pixelLab.DebugDiv.enable = function() {
  if (!pixelLab.DebugDiv.s_debugDiv) {
    var div = pixelLab.DebugDiv.s_debugDiv = goog.dom.createDom('div', {
      'id': 'debugContent',
      'style': 'display:block; position:absolute; top:7px; right:7px; padding:10px; width:300px; background: rgba(0,0,0,.4); color:yellowgreen; text-align:left; font-family:courier new; border:solid 1px black; z-index:9999;'
    });

    document.body.appendChild(div);

    goog.debug.LogManager.getRoot().addHandler(pixelLab.DebugDiv._onLog);
  }
};

// clears the debug output.  called either manually or by the user clicking the 'clear' link in the debug div.
pixelLab.DebugDiv.clear = function() {
  if (pixelLab.DebugDiv.s_debugDiv) {
    goog.dom.removeChildren(pixelLab.DebugDiv.s_debugDiv);
    pixelLab.DebugDiv.s_debugDiv.style.setProperty('display', 'none');
  }
};

/**
 * Log a LogRecord.
 * @param {goog.debug.LogRecord} logRecord A log record to log.
 * @private
 */
pixelLab.DebugDiv._onLog = function(logRecord) {
  if (pixelLab.DebugDiv.s_debugDiv) {
    pixelLab.DebugDiv.s_debugDiv.style.setProperty('display', 'block');
    var c = goog.dom.createDom('div', null, goog.string.htmlEscape(logRecord.getMessage()));
    goog.dom.appendChild(pixelLab.DebugDiv.s_debugDiv, c);
  }
};
