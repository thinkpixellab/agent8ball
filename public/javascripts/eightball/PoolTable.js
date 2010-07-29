goog.provide('eightball.PoolTable');

goog.require('goog.math.Matrix');
goog.require('goog.math.Line');
goog.require('goog.math.Vec2');
goog.require('b2Vec2');
goog.require('b2AABB');
goog.require('b2World');
goog.require('b2BodyDef');
goog.require('b2PolyDef');
goog.require('b2CircleDef');

/**
 @constructor
 */
eightball.PoolTable = function(canvasElement, cueCanvasElement) {

  // variables
  this.m_lastMouse = null;
  this.m_lastMouseDown = null;
  this.m_cueLine = null;
  this.m_strikePower = 0;
  // will be a number from 0 to 1 indicating strike power
  this.m_isCueVisible = true;

  // get a local reference to this
  var _this = this;

  // load our cuestick image (we'll need this for rendering in the updateCue function)
  this.m_cueImage = new Image();
  this.m_cueImage.onload = function() {
    _this._updateCue();
  };
  this.m_cueImage.src = "/images/cue.png";

  // get local references for our canvas elements
  this.m_canvasElement = canvasElement;
  this.m_cueCanvasElement = cueCanvasElement;

  // get local references for our canvas drawing contexts
  this.m_canvasContext = this.m_canvasElement[0].getContext('2d');
  this.m_cueCanvasContext = this.m_cueCanvasElement[0].getContext('2d');

  // set the width and height of the table
  this.m_canvasElement.attr('width', eightball.PoolTable.width * 2 + eightball.PoolTable.bumperThickness * 4);
  this.m_canvasElement.attr('height', eightball.PoolTable.height * 2 + eightball.PoolTable.bumperThickness * 4);
  this.m_centerOffset = new b2Vec2(eightball.PoolTable.width + eightball.PoolTable.bumperThickness * 2, eightball.PoolTable.height + eightball.PoolTable.bumperThickness * 2);

  // setup our physics world
  this._createWorld(this.m_centerOffset);
  this.m_canvasContext.translate(this.m_centerOffset.x, this.m_centerOffset.y);

  // mouse tracking fields
  this.m_isMouseDown = false;

  // mouse down
  this.m_cueCanvasElement.mousedown(function(e) {
    _this.m_isMouseDown = true;
    _this.m_lastMouseDown = _this.m_lastMouse;
    _this.m_cueLine = new goog.math.Line(_this.m_lastMouseDown.x, _this.m_lastMouseDown.y, _this.m_theCueBall.GetCenterPosition().x, _this.m_theCueBall.GetCenterPosition().y);
  });

  // mouse up
  this.m_cueCanvasElement.mouseup(function(e) {
    _this.m_isMouseDown = false;
    _this.m_isCueVisible = false;
    _this._strikeCue();
    _this._updateCue();
  });

  // mouse move
  this.m_cueCanvasElement.mousemove(function(e) {
    var cursorPageOffset = new goog.math.Vec2(e.pageX, e.pageY);
    var elementOffset = new goog.math.Vec2(_this.m_canvasElement.offset().left, _this.m_canvasElement.offset().top);
    var elementLocation = cursorPageOffset.subtract(elementOffset);
    _this.m_lastMouse = elementLocation.subtract(_this.m_centerOffset);

    if (_this.m_isMouseDown) {
      // if the mouse is down we prepare to strike the ball
      var strikeLine = new goog.math.Line(_this.m_lastMouse.x, _this.m_lastMouse.y, _this.m_lastMouseDown.x, _this.m_lastMouseDown.y);
      var strikeOffset = Math.min(strikeLine.getSegmentLength(), eightball.PoolTable.maxStrikeDistance);

      // calculate the angle range that we'll allow (to prevent backtracking)
      // TODO: there is an obvious bug with the math here related to wrap-around angles
      var cueAngle = _this._getLineAngleDegrees(_this.m_cueLine);
      var strikeAngle = _this._getLineAngleDegrees(strikeLine);
      if (strikeAngle < cueAngle - 90 || strikeAngle > cueAngle + 90) strikeOffset = 0;

      // calculate strike power
      _this.m_strikePower = strikeOffset == 0 ? 0 : strikeOffset / eightball.PoolTable.maxStrikeDistance;

      clearDebug();
      writeDebug("Allowed Angle Range: " + Math.round(cueAngle - 90) + " to " + Math.round(cueAngle + 90));
      writeDebug("Strike Angle: " + Math.round(strikeAngle));
      writeDebug("Strike Power: " + _this.m_strikePower);

      _this._updateCue(_this.m_lastMouseDown, strikeOffset);
    } else {
      // otherwise we update the cue position (by rotating it around the cue ball)
      _this._updateCue(_this.m_lastMouse, 0);
    }
  });

  // mouse leave
  this.m_cueCanvasElement.mouseleave(function(e) {
    _this.m_lastMouse = null;
    _this.m_isMouseDown = false;
  });

  this._step();
};

eightball.PoolTable.prototype.updateLayout = function(width, height) {
  // resize the cue canvas
  this.m_cueCanvasContext.canvas.width = width;
  this.m_cueCanvasContext.canvas.height = height;
  this._updateCue();
};

eightball.PoolTable.prototype._strikeCue = function() {
  if (this.m_cueLine) {
    var velocity = new b2Vec2(this.m_cueLine.x1 - this.m_cueLine.x0, this.m_cueLine.y1 - this.m_cueLine.y0);
    velocity.Normalize();
    velocity.Multiply(500);
    this.m_theCueBall.SetLinearVelocity(velocity);
    this.m_theCueBall.WakeUp();
  }
};

eightball.PoolTable.prototype._updateCue = function(mousePoint, cueOffset) {
  if (this.m_cueImage != null && this.m_cueImage.complete) {

    // clear the cue canvas
    this._clearCueCanvas();

    if (this.m_isCueVisible) {
      // find the location of the cue ball in page coordinates
      var absCue = this._gameCoordinatesToAbsolute(this.m_theCueBall.GetCenterPosition().x, this.m_theCueBall.GetCenterPosition().y);
      var x = Math.round(absCue.x);
      var y = Math.round(absCue.y);

      // get the angle between the current mouse point and cue ball
      var dX = mousePoint.x - this.m_theCueBall.GetCenterPosition().x;
      var dY = this.m_theCueBall.GetCenterPosition().y - mousePoint.y;
      var r = Math.atan2(dY, dX) * -1;
      //angle in radians
      // translate and rotate the canvas
      this.m_cueCanvasContext.translate(x, y);
      this.m_cueCanvasContext.rotate(r);

      // draw the cue stick
      this.m_cueCanvasContext.clearRect(0, 0, this.m_cueCanvasElement.width(), this.m_cueCanvasElement.height());
      this.m_cueCanvasContext.drawImage(this.m_cueImage, eightball.PoolTable.horizontalCueOffset + cueOffset, eightball.PoolTable.verticalCueOffset);
    }
  }
};

eightball.PoolTable.prototype._clearCueCanvas = function() {
  // reset the current transform to the identity and the clear the entire thing
  this.m_cueCanvasContext.setTransform(1, 0, 0, 1, 0, 0);
  this.m_cueCanvasContext.clearRect(0, 0, this.m_cueCanvasElement.width(), this.m_cueCanvasElement.height());
};

eightball.PoolTable.prototype._gameCoordinatesToAbsolute = function(x, y) {

  // translate our game coordinates (where 0,0 is in the center of
  // the table) to absolute coordinates for the page
  var gameTableOffset = new goog.math.Vec2(this.m_canvasElement.offset().left, this.m_canvasElement.offset().top);
  gameTableOffset.x += this.m_canvasElement.width() / 2;
  gameTableOffset.y += this.m_canvasElement.height() / 2;

  var newX = gameTableOffset.x + x;
  var newY = gameTableOffset.y + y;

  return {
    x: newX,
    y: newY
  };
};

eightball.PoolTable.prototype._getLineAngle = function(line) {
  var dX = line.x0 - line.x1;
  var dY = line.y1 - line.y0;
  var r = Math.atan2(dY, dX) * -1;
  //angle in radians
  return r;
};

eightball.PoolTable.prototype._getLineAngleDegrees = function(line) {
  var r = this._getLineAngle(line);
  var d = r * 180 / Math.PI;
  if (d < 0) d = (360 - (d * -1));
  return d;
};

/**
 @const
 @type {number}
 cm, regulation
 */
eightball.PoolTable.maxStrikeDistance = 175;

/**
 @const
 @type {number}
 cm, regulation
 */
eightball.PoolTable.verticalCueOffset = -15;

/**
 @const
 @type {number}
 cm, regulation
 */
eightball.PoolTable.horizontalCueOffset = 7;

/**
 @const
 @type {number}
 cm, regulation
 */
eightball.PoolTable.height = 192;

/**
 @const
 @type {number}
 cm, regulation
 */
eightball.PoolTable.width = 396;

/**
 @const
 @type {number}
 cm, regulation
 */
eightball.PoolTable.ballDiameter = 7;

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

  var tableObject = eightball.PoolTable._createTable(this.m_world, this.m_centerOffset);
  tableObject.userData = 'table';

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
  table.friction = 1.0;

  var side;
  var points;

  // Left
  side = new b2PolyDef();
  points = [
    [-centerOffset.x, -centerOffset.y + eightball.PoolTable.bumperThickness * 2],
    [-centerOffset.x + eightball.PoolTable.bumperThickness * 2, -centerOffset.y + eightball.PoolTable.bumperThickness * 5],
    [-centerOffset.x + eightball.PoolTable.bumperThickness * 2, centerOffset.y - eightball.PoolTable.bumperThickness * 5],
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
    [-centerOffset.x + eightball.PoolTable.bumperThickness * 5, -centerOffset.y + eightball.PoolTable.bumperThickness * 2],
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
  ballSd.density = 4.0;
  ballSd.radius = radius;
  ballSd.restitution = 1.2;
  ballSd.friction = 0.2;

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
  //    if (this.m_lastMouse) {
  //        this.m_cueLine = new goog.math.Line(this.m_lastMouse.x, this.m_lastMouse.y, this.m_theCueBall.GetCenterPosition().x, this.m_theCueBall.GetCenterPosition().y);
  //    } else {
  //        this.m_cueLine = null;
  //    }
  //    if (this.m_cueLine) {
  //        this.m_canvasContext.strokeStyle = '#ffffff';
  //        this.m_canvasContext.beginPath();
  //        this.m_canvasContext.moveTo(this.m_cueLine.x0, this.m_cueLine.y0);
  //        this.m_canvasContext.lineTo(this.m_cueLine.x1, this.m_cueLine.y1);
  //        this.m_canvasContext.stroke();
  //    }
  for (var b = this.m_world.m_bodyList; b; b = b.m_next) {
    var fill;
    if (b.userData == 0) {
      this.m_canvasContext.strokeStyle = 'black';
      this.m_canvasContext.fillStyle = "white";
    } else if (b.userData == 'table') {
      this.m_canvasContext.strokeStyle = 'transparent';
      //this.m_canvasContext.fillStyle = "green";
      this.m_canvasContext.fillStyle = "transparent";
    } else {
      this.m_canvasContext.strokeStyle = 'white';
      this.m_canvasContext.fillStyle = 'transparent';
    }

    for (var s = b.GetShapeList(); s != null; s = s.GetNext()) {
      eightball.PoolTable._drawShape(s, this.m_canvasContext);
    }
  }
};

eightball.PoolTable._drawShape = function(shape, context) {
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
  context.fill();
  context.stroke();
};
