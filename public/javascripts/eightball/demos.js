goog.require('eightball.PoolTable');

var poolTable;

$(window).load(function() {
  var canvasElement = $('canvas#demo_canvas');
  if (canvasElement[0]) {
    poolTable = new eightball.PoolTable(canvasElement);
  }
});
