// Script written by Drew Noakes -- http://drewnoakes.com
// 4 Dec 2006
goog.provide('pixelLab.Debug');

// call this function from a script within the document for which to enable debug output
pixelLab.Debug.enable = function() {
  var div = pixelLab.Debug.s_debugDiv = document.createElement('div');
  div.id = 'debugContent';
  div.style.cssText = 'display:block; position:absolute; top:7px; right:7px; padding:10px; width:300px; background:#000; color:yellowgreen; text-align:left; font-family:courier new; border:solid 1px black; z-index:9999;';
  document.body.appendChild(div);
};

// writes the string passed to it to the page
pixelLab.Debug.writeDebug = function(message) {
  if (pixelLab.Debug.s_debugDiv) {
    pixelLab.Debug.s_debugDiv.style.setProperty('display', 'block');
    pixelLab.Debug.s_debugDiv.innerHTML += message + "<br\/>";
  }
};

// writes the value of some code expression.
// eg: writeEval("document.location"); // writes "document.location = http://drewnoakes.com"
pixelLab.Debug.writeEval = function(code) {
  pixelLab.Debug.writeDebug(code + " = " + eval(code));
};

// writes all of the properties of the object passed to it
pixelLab.Debug.writeDebugObject = function(object) {
  for (var property in object) {
    pixelLab.Debug.writeDebug(property);
  }
};

// clears the debug output.  called either manually or by the user clicking the 'clear' link in the debug div.
pixelLab.Debug.clearDebug = function() {
  if (pixelLab.Debug.s_debugDiv) {
    pixelLab.Debug.s_debugDiv.innerHTML = "";
    pixelLab.Debug.s_debugDiv.style.setProperty('display', 'none');
  }
};
