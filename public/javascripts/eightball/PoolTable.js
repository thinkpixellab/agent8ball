goog.require('goog.math.Matrix');
goog.require('goog.math.Line');
goog.provide('eightball.PoolTable');

eightball.PoolTable = {};

/**
 @const
 @type {number}
 cm, regulation
 */
eightball.PoolTable.height = 148;

/**
 @const
 @type {number}
 cm, regulation
 */
eightball.PoolTable.width = 284;
/**
 @const
 @type {number}
 cm, regulation
 */
eightball.PoolTable.ballDiameter = 5.715;

/**
 @const
 @type {number}
 */
eightball.PoolTable.bumperThickness = 10;

eightball.PoolTable.createWorld = function() {

  var worldAABB = new b2AABB();
  worldAABB.minVertex.Set(-1000, -1000);
  worldAABB.maxVertex.Set(1000, 1000);
  var gravity = new b2Vec2(0, 0);
  var doSleep = true;
  var world = new b2World(worldAABB, gravity, doSleep);

  eightball.PoolTable._createTable(world);
  eightball.PoolTable._setupBalls(world);

  return world;
};

eightball.PoolTable._setupBalls = function(world) {
  var ballRadius = eightball.PoolTable.ballDiameter * 2;

  for (var col = 0; col < 5; col++) {

    var ballCount = col + 1;
    var x = 0.5 * eightball.PoolTable.width + col * ballRadius * Math.sqrt(3);
    var yStart = -col * ballRadius;

    for (var row = 0; row < ballCount; row++) {
      eightball.PoolTable._createBall(world, x, yStart + row * ballRadius * 2, ballRadius);
    }

  }

  cueBall = eightball.PoolTable._createBall(world, -0.5 * eightball.PoolTable.width, 0, ballRadius);
};

eightball.PoolTable._createTable = function(world) {

  var matrixFlipHorizontal = new goog.math.Matrix([
    [-1, 0],
    [0, 1]]);

  var matrixFlipVertical = new goog.math.Matrix([
    [-1, 0],
    [0, -1]]);

  var table = new b2BodyDef();
  table.friction = 0.5;

  var side;
  var points;

  // Left
  side = new b2PolyDef();
  points = [
    [-centerOffset.x, -centerOffset.y + eightball.PoolTable.bumperThickness * 2],
    [-centerOffset.x + eightball.PoolTable.bumperThickness * 2, -centerOffset.y + eightball.PoolTable.bumperThickness * 4],
    [-centerOffset.x + eightball.PoolTable.bumperThickness * 2, centerOffset.y - eightball.PoolTable.bumperThickness * 4],
    [-centerOffset.x, centerOffset.y - eightball.PoolTable.bumperThickness * 2]];
  side.SetVertices(points);
  table.AddShape(side);

  // Right
  side = new b2PolyDef();
  points = new goog.math.Matrix(points).multiply(matrixFlipHorizontal).toArray().reverse();
  side.SetVertices(points);
  table.AddShape(side);

  // top left
  points = [
    [-centerOffset.x + eightball.PoolTable.bumperThickness * 2, -centerOffset.y],
    [-centerOffset.x + eightball.PoolTable.bumperThickness * 4, -centerOffset.y + eightball.PoolTable.bumperThickness * 2],
    [-eightball.PoolTable.bumperThickness * 2.2, -centerOffset.y + eightball.PoolTable.bumperThickness * 2],
    [-eightball.PoolTable.bumperThickness * 2, -centerOffset.y]].reverse();

  side = new b2PolyDef();
  side.SetVertices(points);
  table.AddShape(side);

  // top right
  side = new b2PolyDef();
  points = new goog.math.Matrix(points).multiply(matrixFlipHorizontal).toArray().reverse();
  side.SetVertices(points);
  table.AddShape(side);

  // bottom right
  side = new b2PolyDef();
  points = new goog.math.Matrix(points).multiply(matrixFlipVertical).toArray();
  side.SetVertices(points);
  table.AddShape(side);

  // bottom left
  side = new b2PolyDef();
  points = new goog.math.Matrix(points).multiply(matrixFlipHorizontal).toArray().reverse();
  side.SetVertices(points);
  table.AddShape(side);

  return world.CreateBody(table);
};

eightball.PoolTable._createBall = function(world, x, y, radius) {
  var ballSd = new b2CircleDef();
  ballSd.density = 1.0;
  ballSd.radius = radius;
  ballSd.restitution = 1;
  ballSd.friction = 0.1;

  var ballBd = new b2BodyDef();
  ballBd.AddShape(ballSd);
  ballBd.position.Set(x, y);
  ballBd.linearDamping = 0.002;
  ballBd.angularDamping = 0.005;
  return world.CreateBody(ballBd);
};

eightball.PoolTable._step = function(cnt) {
  var timeStep = 1.0 / 60;
  var iteration = 1;
  world.Step(timeStep, iteration);
  canvasContext.clearRect(-centerOffset.x, -centerOffset.y, 2 * centerOffset.x, 2 * centerOffset.y);
  eightball.PoolTable._drawWorld(world, canvasContext);
  setTimeout('eightball.PoolTable._step(' + (cnt || 0) + ')', 10);
};

eightball.PoolTable._drawWorld = function(world, context) {
  if (lastMouse) {
    cueLine = new goog.math.Line(lastMouse.x, lastMouse.y, cueBall.GetCenterPosition().x, cueBall.GetCenterPosition().y);
  } else {
    cueLine = null;
  }

  if (cueLine) {
    context.strokeStyle = '#ffffff';
    context.beginPath();
    context.moveTo(cueLine.x0, cueLine.y0);
    context.lineTo(cueLine.x1, cueLine.y1);
    context.stroke();
  }

  for (var b = world.m_bodyList; b; b = b.m_next) {
    for (var s = b.GetShapeList(); s != null; s = s.GetNext()) {
      eightball.PoolTable._drawShape(s, context);
    }
  }
};

eightball.PoolTable._drawShape = function(shape, context) {
  context.strokeStyle = '#ffffff';
  context.beginPath();

  var i, v;
  switch (shape.m_type) {
  case b2Shape.e_circleShape:
    {
      var circle = shape;
      var pos = circle.m_position;
      var r = circle.m_radius;
      var segments = 16.0;
      var theta = 0.0;
      var dtheta = 2.0 * Math.PI / segments;
      // draw circle
      context.moveTo(pos.x + r, pos.y);
      for (i = 0; i < segments; i++) {
        var d = new b2Vec2(r * Math.cos(theta), r * Math.sin(theta));
        v = b2Math.AddVV(pos, d);
        context.lineTo(v.x, v.y);
        theta += dtheta;
      }
      context.lineTo(pos.x + r, pos.y);

      // draw radius
      context.moveTo(pos.x, pos.y);
      var ax = circle.m_R.col1;
      var pos2 = new b2Vec2(pos.x + r * ax.x, pos.y + r * ax.y);
      context.lineTo(pos2.x, pos2.y);
    }
    break;
  case b2Shape.e_polyShape:
    {
      var poly = shape;
      var tV = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[0]));
      context.moveTo(tV.x, tV.y);
      for (i = 0; i < poly.m_vertexCount; i++) {
        v = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[i]));
        context.lineTo(v.x, v.y);
      }
      context.lineTo(tV.x, tV.y);
    }
    break;
  }
  context.stroke();
};
