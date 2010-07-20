var world;
var canvasContext;
var canvasWidth;
var canvasHeight;
var centerOffset;

var poolTable = {
  // cm, regulation
  height: 148,
  // cm, regulation
  width: 284,
  // cm, regulation
  ballDiameter: 5.715,
  bumperThickness: 10
};



function step(cnt) {
  var timeStep = 1.0 / 60;
  var iteration = 1;
  world.Step(timeStep, iteration);
  canvasContext.clearRect(-centerOffset.x, -centerOffset.y, 2 * centerOffset.x, 2 * centerOffset.y);
  drawWorld(world, canvasContext);
  setTimeout('step(' + (cnt || 0) + ')', 10);
}

$(window).load(function() {
  var canvasElm = $('#demo_canvas');
  if (canvasElm) {

    canvasElm.attr('width', poolTable.width * 2 + poolTable.bumperThickness * 4);
    canvasElm.attr('height', poolTable.height * 2 + poolTable.bumperThickness * 4);

    centerOffset = new b2Vec2(poolTable.width + poolTable.bumperThickness * 2, poolTable.height + poolTable.bumperThickness * 2);
    world = createWorld();
    canvasContext = canvasElm[0].getContext('2d');
    canvasContext.translate(centerOffset.x, centerOffset.y);

    canvasWidth = canvasElm.width();
    canvasHeight = canvasElm.height();

    canvasElm.click(function(e) {
      createBall(world, e.offsetX - centerOffset.x, e.offsetY - centerOffset.y, poolTable.ballDiameter * 2, new b2Vec2(400, 0));
    });

    step();
  }
});



function createBall(world, x, y, radius, initialVelocity) {
  var ballSd = new b2CircleDef();
  ballSd.density = 1.0;
  ballSd.radius = radius;
  ballSd.restitution = 1;
  ballSd.friction = 0.1;

  var ballBd = new b2BodyDef();
  ballBd.AddShape(ballSd);
  ballBd.position.Set(x, y);
  if (initialVelocity) {
    ballBd.linearVelocity = initialVelocity;
  }
  ballBd.linearDamping = 0.005;
  ballBd.angularDamping = 0.005;
  return world.CreateBody(ballBd);
}
