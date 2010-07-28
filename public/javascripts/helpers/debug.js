// Script written by Drew Noakes -- http://drewnoakes.com
// 4 Dec 2006

// the div element used for debug output.  created in enableDebug.
var debugDiv;

// call this function from a script within the document for which to enable debug output
function enableDebug() {
    document.write("<div id='debugContent' style='display:block; position:absolute; top:7px; right:7px; padding:10px; width:300px; background:#000; color:yellowgreen; text-align:left; font-family:courier new; border:solid 1px black; z-index:9999;'></div>");
    debugDiv = document.getElementById("debugContent");
    //writeClearLink();
}

// writes the string passed to it to the page
function writeDebug(message) {
    if (debugDiv)
        debugDiv.innerHTML += message + "<br\/>";
}

// writes the value of some code expression.
// eg: writeEval("document.location"); // writes "document.location = http://drewnoakes.com"
function writeEval(code) {
    writeDebug(code + " = " + eval(code));
}

// writes all of the properties of the object passed to it
function writeDebugObject(object) {
    for (property in object)
        writeDebug(property);
}

// clears the debug output.  called either manually or by the user clicking the 'clear' link in the debug div.
function clearDebug() {
    if (debugDiv) {
        debugDiv.innerHTML = "";
        writeClearLink();
    }
}

// writes a link in the debug div that clears debug output
function writeClearLink() {
    //writeDebug("<a href='#' onclick='clearDebug(); return false;'>clear</a>");
}
