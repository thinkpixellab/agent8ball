goog.require('goog.math.Vec2');
goog.require('eightball.PoolTable');

var world;
var canvasContext;
var centerOffset;
var cueBall;
var lastMouse;
var cueLine;

$(window).load(function() {
  var canvasElm = $('canvas#demo_canvas');
  if (canvasElm[0]) {

    canvasElm.attr('width', eightball.PoolTable.width * 2 + eightball.PoolTable.bumperThickness * 4);
    canvasElm.attr('height', eightball.PoolTable.height * 2 + eightball.PoolTable.bumperThickness * 4);

    centerOffset = new b2Vec2(eightball.PoolTable.width + eightball.PoolTable.bumperThickness * 2, eightball.PoolTable.height + eightball.PoolTable.bumperThickness * 2);

    world = eightball.PoolTable.createWorld();
    canvasContext = canvasElm[0].getContext('2d');
    canvasContext.translate(centerOffset.x, centerOffset.y);

    canvasElm.click(function(e) {
      if (cueLine) {
        var velocity = new b2Vec2(cueLine.x1 - cueLine.x0, cueLine.y1 - cueLine.y0);
        velocity.Normalize();
        velocity.Multiply(300);
        cueBall.SetLinearVelocity(velocity);
        cueBall.WakeUp();
      }
    });

    canvasElm.mousemove(function(e) {
      var cursorPageOffset = new goog.math.Vec2(e.pageX, e.pageY);
      var elementOffset = new goog.math.Vec2(canvasElm.offset().left, canvasElm.offset().top);
      var elementLocation = cursorPageOffset.subtract(elementOffset);
      lastMouse = elementLocation.subtract(centerOffset);
    });

    canvasElm.mouseleave(function(e) {
      lastMouse = null;
    });

    eightball.PoolTable._step();
  }
});
