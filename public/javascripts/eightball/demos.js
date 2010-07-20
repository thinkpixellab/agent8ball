goog.require('eightball.PoolTable');

var world;
var canvasContext;
var centerOffset;
var cueBall;


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
      var velocity = new b2Vec2(b2Math.b2Random() , b2Math.b2Random() );
      velocity.Normalize();
      velocity.Multiply(300);
      cueBall.SetLinearVelocity(velocity);
      cueBall.WakeUp();
    });

    eightball.PoolTable._step();
  }
});
