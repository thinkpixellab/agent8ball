// Script written by Drew Noakes -- http://drewnoakes.com
// 4 Dec 2006
goog.provide('pixelLab.DebugDiv');

goog.require('goog.debug.LogManager');

// call this function from a script within the document for which to enable debug output
pixelLab.DebugDiv.enable = function() {
  if (!pixelLab.DebugDiv.s_debugDiv) {
    var div = pixelLab.DebugDiv.s_debugDiv = document.createElement('div');
    div.id = 'debugContent';
    div.style.cssText = 'display:block; position:absolute; top:7px; right:7px; padding:10px; width:300px; background:#000; color:yellowgreen; text-align:left; font-family:courier new; border:solid 1px black; z-index:9999;';

    div.innerHtml = "";
    document.body.appendChild(div);

    goog.debug.LogManager.getRoot().addHandler(pixelLab.DebugDiv._onLog);
  }
};

// clears the debug output.  called either manually or by the user clicking the 'clear' link in the debug div.
pixelLab.DebugDiv.clear = function() {
  if (pixelLab.DebugDiv.s_debugDiv) {
    pixelLab.DebugDiv.s_debugDiv.innerHTML = "";
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
    pixelLab.DebugDiv.s_debugDiv.innerHTML += logRecord.getMessage() + "<br/>";
  }
};
