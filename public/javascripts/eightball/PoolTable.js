goog.provide('eightball.PoolTable');

goog.require('goog.math.Matrix');
goog.require('goog.math.Line');
goog.require('goog.math.Vec2');

/**
 @constructor
 */
eightball.PoolTable = function(canvasElement) {
  this.m_canvasElement = canvasElement;

  this.m_canvasElement.attr('width', eightball.PoolTable.width * 2 + eightball.PoolTable.bumperThickness * 4);
  this.m_canvasElement.attr('height', eightball.PoolTable.height * 2 + eightball.PoolTable.bumperThickness * 4);

  this.m_centerOffset = new b2Vec2(eightball.PoolTable.width + eightball.PoolTable.bumperThickness * 2, eightball.PoolTable.height + eightball.PoolTable.bumperThickness * 2);

  this._createWorld(this.m_centerOffset);
  this.m_canvasContext = this.m_canvasElement[0].getContext('2d');
  this.m_canvasContext.translate(this.m_centerOffset.x, this.m_centerOffset.y);

  var _this = this;
  this.m_canvasElement.click(function(e) {
    if (_this.m_cueLine) {
      var velocity = new b2Vec2(_this.m_cueLine.x1 - _this.m_cueLine.x0, _this.m_cueLine.y1 - _this.m_cueLine.y0);
      velocity.Normalize();
      velocity.Multiply(300);
      _this.m_theCueBall.SetLinearVelocity(velocity);
      _this.m_theCueBall.WakeUp();
    }
  });

  this.m_canvasElement.mousemove(function(e) {
    var cursorPageOffset = new goog.math.Vec2(e.pageX, e.pageY);
    var elementOffset = new goog.math.Vec2(_this.m_canvasElement.offset().left, _this.m_canvasElement.offset().top);
    var elementLocation = cursorPageOffset.subtract(elementOffset);
    _this.m_lastMouse = elementLocation.subtract(_this.m_centerOffset);
  });

  this.m_canvasElement.mouseleave(function(e) {
    _this.m_lastMouse = null;
  });

  this._step();

  this.m_lastMouse = null;
  this.m_cueLine = null;

};

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

eightball.PoolTable.prototype._createWorld = function() {

  var worldAABB = new b2AABB();
  worldAABB.minVertex.Set(-1000, -1000);
  worldAABB.maxVertex.Set(1000, 1000);
  var gravity = new b2Vec2(0, 0);
  var doSleep = true;
  this.m_world = new b2World(worldAABB, gravity, doSleep);

  eightball.PoolTable._createTable(this.m_world, this.m_centerOffset);
  var balls = eightball.PoolTable._setupBalls(this.m_world);
  this.m_theCueBall = balls[0];
};

eightball.PoolTable._setupBalls = function(world) {
  var balls = new Array(16);
  var index = 0;
  var ballRadius = eightball.PoolTable.ballDiameter * 2;

  balls[index] = this._createBall(world, -0.5 * eightball.PoolTable.width, 0, ballRadius);
  balls[index].userData = index;
  index++;

  for (var col = 0; col < 5; col++) {

    var ballCount = col + 1;
    var x = 0.5 * eightball.PoolTable.width + col * ballRadius * Math.sqrt(3);
    var yStart = -col * ballRadius;

    for (var row = 0; row < ballCount; row++) {
      balls[index] = eightball.PoolTable._createBall(world, x, yStart + row * ballRadius * 2, ballRadius);
      balls[index].userData = index;
      index++;
    }

  }

  return balls;
};

eightball.PoolTable._createTable = function(world, centerOffset) {

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

eightball.PoolTable.prototype._step = function(cnt) {
  var timeStep = 1.0 / 60;
  var iteration = 1;
  this.m_world.Step(timeStep, iteration);
  this.m_canvasContext.clearRect(-this.m_centerOffset.x, -this.m_centerOffset.y, 2 * this.m_centerOffset.x, 2 * this.m_centerOffset.y);
  this._drawWorld();
  setTimeout('poolTable._step(' + (cnt || 0) + ')', 10);
};

eightball.PoolTable.prototype._drawWorld = function() {
  if (this.m_lastMouse) {
    this.m_cueLine = new goog.math.Line(this.m_lastMouse.x, this.m_lastMouse.y, this.m_theCueBall.GetCenterPosition().x, this.m_theCueBall.GetCenterPosition().y);
  } else {
    this.m_cueLine = null;
  }

  if (this.m_cueLine) {
    this.m_canvasContext.strokeStyle = '#ffffff';
    this.m_canvasContext.beginPath();
    this.m_canvasContext.moveTo(this.m_cueLine.x0, this.m_cueLine.y0);
    this.m_canvasContext.lineTo(this.m_cueLine.x1, this.m_cueLine.y1);
    this.m_canvasContext.stroke();
  }

  for (var b = this.m_world.m_bodyList; b; b = b.m_next) {
    for (var s = b.GetShapeList(); s != null; s = s.GetNext()) {
      eightball.PoolTable._drawShape(s, this.m_canvasContext);
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

      context.arc(circle.m_position.x, circle.m_position.y, circle.m_radius, 0, 2 * Math.PI, false);

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
