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