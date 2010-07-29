// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

goog.require('eightball.PoolTable');

var poolTable;

$(window).load(function () {
    var canvasElement = $('canvas#demo_canvas');
    var cueCanvasElement = $('canvas#cue_canvas');
    if (canvasElement[0]) {
        poolTable = new eightball.PoolTable(canvasElement, cueCanvasElement);

        width = window.innerWidth;
        height = window.innerHeight;
        poolTable.updateLayout(width, height);
    }
});



$(window).resize(function (e) {
    width = window.innerWidth;
    height = window.innerHeight;
    poolTable.updateLayout(width, height);
});
