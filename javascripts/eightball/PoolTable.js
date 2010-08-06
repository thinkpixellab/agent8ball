goog.provide('eightball.PoolTable');

goog.require('goog.array');
goog.require('goog.math.Matrix');
goog.require('goog.math.Line');
goog.require('goog.math.Vec2');
goog.require('goog.debug.LogManager');

goog.require('pixelLab.DebugDiv');
goog.require('pixelLab.fpsLogger');

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
  /**
   @private
   @type {goog.math.Vec2}
   */
  this.m_lastMouse = null;
  /**
   @private
   @type {goog.math.Vec2}
   */
  this.m_lastMouseDown = null;
  /**
   @private
   @type {goog.math.Line}
   */
  this.m_cueLine = null;
  /**
   @private
   @type {number}
   */
  this.m_strikePower = 0;
  /**
   will be a number from 0 to 1 indicating strike power
   @private
   @type {boolean}
   */
  this.m_isCueVisible = true;

  /**
   @private
   @type {number}
   */
  this.m_lastStep = 0;

  /**
   @private
   @type {!Array.<b2Body>}
   */
  this.m_balls = [];

  /**
   @private
   @type {!pixelLab.fpsLogger}
   */
  this.m_fpsLogger = new pixelLab.fpsLogger();

  // get a local reference to this
  var _this = this;

  // load our cuestick image (we'll need this for rendering in the updateCue function)
  this.m_cueImage = new Image();
  this.m_cueImage.onload = function() {
    _this._updateCue();
  };
  this.m_cueImage.src = "images/cue.png";

  this.m_ballVignetteImage = new Image();
  this.m_ballVignetteImage.src = "images/ballvignette.png";

  // get local references for our canvas elements
  this.m_canvasElement = canvasElement;
  this.m_cueCanvasElement = cueCanvasElement;

  // get local references for our canvas drawing contexts
  this.m_canvasContext = this.m_canvasElement.getContext('2d');
  this.m_cueCanvasContext = this.m_cueCanvasElement.getContext('2d');

  // set the width and height of the table
  this.m_canvasElement.setAttribute('width', eightball.PoolTable.s_width * 2 + eightball.PoolTable.s_bumperThickness * 4);
  this.m_canvasElement.setAttribute('height', eightball.PoolTable.s_height * 2 + eightball.PoolTable.s_bumperThickness * 4);
  this.m_centerOffset = new b2Vec2(eightball.PoolTable.s_width + eightball.PoolTable.s_bumperThickness * 2, eightball.PoolTable.s_height + eightball.PoolTable.s_bumperThickness * 2);

  // setup our physics world
  this._createWorld();
  this.m_canvasContext.translate(this.m_centerOffset.x, this.m_centerOffset.y);

  // mouse tracking fields
  this.m_isMouseDown = false;

  // mouse down
  $(this.m_cueCanvasElement).mousedown(function(e) {
    _this.m_isMouseDown = true;
    _this.m_lastMouseDown = _this.m_lastMouse;
    _this.m_cueLine = new goog.math.Line(_this.m_lastMouseDown.x, _this.m_lastMouseDown.y, _this.m_theCueBall.GetCenterPosition().x, _this.m_theCueBall.GetCenterPosition().y);
  });

  // mouse up
  $(this.m_cueCanvasElement).mouseup(function(e) {
    _this.m_isMouseDown = false;
    _this.m_isCueVisible = false;
    _this._strikeCue();
    _this._updateCue();
  });

  // mouse move
  $(this.m_cueCanvasElement).mousemove(function(e) {
    var cursorPageOffset = new goog.math.Vec2(e.pageX, e.pageY);
    var elementOffset = new goog.math.Vec2($(_this.m_canvasElement).offset().left, $(_this.m_canvasElement).offset().top);
    var elementLocation = cursorPageOffset.subtract(elementOffset);
    _this.m_lastMouse = elementLocation.subtract(_this.m_centerOffset);

    if (_this.m_isMouseDown) {
      // if the mouse is down we prepare to strike the ball
      var strikeLine = new goog.math.Line(_this.m_lastMouse.x, _this.m_lastMouse.y, _this.m_lastMouseDown.x, _this.m_lastMouseDown.y);
      var strikeOffset = Math.min(strikeLine.getSegmentLength(), eightball.PoolTable.s_maxStrikeDistance);

      // calculate the angle range that we'll allow (to prevent backtracking)
      // TODO: there is an obvious bug with the math here related to wrap-around angles
      var cueAngle = _this._getLineAngleDegrees(_this.m_cueLine);
      var strikeAngle = _this._getLineAngleDegrees(strikeLine);
      if (strikeAngle < cueAngle - 90 || strikeAngle > cueAngle + 90) strikeOffset = 0;

      // calculate strike power
      _this.m_strikePower = strikeOffset == 0 ? 0 : strikeOffset / eightball.PoolTable.s_maxStrikeDistance;

      pixelLab.DebugDiv.clear();
      goog.debug.LogManager.getRoot().info("Allowed Angle Range: " + Math.round(cueAngle - 90) + " to " + Math.round(cueAngle + 90));
      goog.debug.LogManager.getRoot().info("Strike Angle: " + Math.round(strikeAngle));
      goog.debug.LogManager.getRoot().info("Strike Power: " + _this.m_strikePower);

      _this._updateCue(_this.m_lastMouseDown, strikeOffset);
    } else {
      // otherwise we update the cue position (by rotating it around the cue ball)
      _this._updateCue(_this.m_lastMouse, 0);
    }
  });

  // mouse leave
  $(this.m_cueCanvasElement).mouseleave(function(e) {
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

/**
 @private
 @param {goog.math.Vec2=} mousePoint
 @param {number=} cueOffset
 */
eightball.PoolTable.prototype._updateCue = function(mousePoint, cueOffset) {
  if (this.m_cueImage != null && this.m_cueImage.complete) {

    // clear the cue canvas
    this._clearCueCanvas();

    if (this.m_isCueVisible && mousePoint) {
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
      this.m_cueCanvasContext.clearRect(0, 0, this.m_cueCanvasElement.width, this.m_cueCanvasElement.height);
      this.m_cueCanvasContext.drawImage(this.m_cueImage, eightball.PoolTable.s_horizontalCueOffset + cueOffset, eightball.PoolTable.s_verticalCueOffset);
    }
  }
};

/**
 @private
 */
eightball.PoolTable.prototype._clearCueCanvas = function() {
  // reset the current transform to the identity and the clear the entire thing
  this.m_cueCanvasContext.setTransform(1, 0, 0, 1, 0, 0);
  this.m_cueCanvasContext.clearRect(0, 0, this.m_cueCanvasElement.width, this.m_cueCanvasElement.height);
};

/**
 @private
 */
eightball.PoolTable.prototype._gameCoordinatesToAbsolute = function(x, y) {

  // translate our game coordinates (where 0,0 is in the center of
  // the table) to absolute coordinates for the page
  var gameTableOffset = new goog.math.Vec2($(this.m_canvasElement).offset().left, $(this.m_canvasElement).offset().top);
  gameTableOffset.x += this.m_canvasElement.width / 2;
  gameTableOffset.y += this.m_canvasElement.height / 2;

  var newX = gameTableOffset.x + x;
  var newY = gameTableOffset.y + y;

  return {
    x: newX,
    y: newY
  };
};

/**
 @private
 */
eightball.PoolTable.prototype._getLineAngle = function(line) {
  var dX = line.x0 - line.x1;
  var dY = line.y1 - line.y0;
  var r = Math.atan2(dY, dX) * -1;
  //angle in radians
  return r;
};

/**
 @private
 */
eightball.PoolTable.prototype._getLineAngleDegrees = function(line) {
  var r = this._getLineAngle(line);
  var d = r * 180 / Math.PI;
  if (d < 0) d = (360 - (d * -1));
  return d;
};

/**
 @private
 */
eightball.PoolTable.prototype._createWorld = function() {

  var worldAABB = new b2AABB();
  worldAABB.minVertex.Set(-1000, -1000);
  worldAABB.maxVertex.Set(1000, 1000);
  var gravity = new b2Vec2(0, 0);
  var doSleep = true;
  this.m_world = new b2World(worldAABB, gravity, doSleep);

  eightball.PoolTable._createTable(this.m_world, this.m_centerOffset);
  eightball.PoolTable._createPockets(this.m_world, this.m_centerOffset);
  this.rackEm();
};

eightball.PoolTable.prototype.rackEm = function() {
  this._clearTable();

  this._rackEm();
  //this._testRack();
};

eightball.PoolTable.prototype._testRack = function() {
  var index = 0;
  var ballRadius = eightball.PoolTable.s_ballDiameter * 2;
  this.m_balls.push(this._createBall(index, -0.5 * eightball.PoolTable.s_width, 0));
  this.m_theCueBall = this.m_balls[0];
  index++;

  this.m_theCueBall.SetLinearVelocity(new b2Vec2(150, 150));
};

eightball.PoolTable.prototype._rackEm = function() {
  var index = 0;
  var ballRadius = eightball.PoolTable.s_ballDiameter * 2;
  this.m_balls.push(this._createBall(index, -0.5 * eightball.PoolTable.s_width, 0));
  this.m_theCueBall = this.m_balls[0];
  index++;

  for (var col = 0; col < 5; col++) {

    var ballCount = col + 1;
    var x = 0.5 * eightball.PoolTable.s_width + col * ballRadius * Math.sqrt(3);
    var yStart = -col * ballRadius;

    for (var row = 0; row < ballCount; row++) {
      this.m_balls.push(this._createBall(index, x, yStart + row * ballRadius * 2));
      index++;
    }
  }
};

/**
 @private
 */
eightball.PoolTable.prototype._clearTable = function() {
  while (this.m_balls.length > 0) {
    this.m_world.DestroyBody(this.m_balls.pop());
  }
  this.m_world.CleanBodyList();
};

/**
 @private
 @param {!b2World} world
 @param {!b2Vec2} centerOffset
 */
eightball.PoolTable._createTable = function(world, centerOffset) {
  var table = new b2BodyDef();
  table.restitution = 1;
  table.friction = 1.0;

  var side;
  var points;

  // Left
  side = new b2PolyDef();
  points = [
    [-centerOffset.x, -centerOffset.y + eightball.PoolTable.s_bumperThickness * 2.5],
    [-centerOffset.x + eightball.PoolTable.s_bumperThickness * 2, -centerOffset.y + eightball.PoolTable.s_bumperThickness * 4.5],
    [-centerOffset.x + eightball.PoolTable.s_bumperThickness * 2, centerOffset.y - eightball.PoolTable.s_bumperThickness * 4.5],
    [-centerOffset.x, centerOffset.y - eightball.PoolTable.s_bumperThickness * 2.5]];
  side.SetVertices(points);
  table.AddShape(side);

  // Right
  side = new b2PolyDef();
  points = new goog.math.Matrix(points).multiply(eightball.PoolTable.s_matrixFlipHorizontal).toArray().reverse();
  side.SetVertices(points);
  table.AddShape(side);

  // top left
  points = [
    [-centerOffset.x + eightball.PoolTable.s_bumperThickness * 2.3, -centerOffset.y],
    [-centerOffset.x + eightball.PoolTable.s_bumperThickness * 4.5, -centerOffset.y + eightball.PoolTable.s_bumperThickness * 2],
    [-eightball.PoolTable.s_bumperThickness * 2.3, -centerOffset.y + eightball.PoolTable.s_bumperThickness * 2],
    [-eightball.PoolTable.s_bumperThickness * 1.5, -centerOffset.y]].reverse();

  side = new b2PolyDef();
  side.SetVertices(points);
  table.AddShape(side);

  // top right
  side = new b2PolyDef();
  points = new goog.math.Matrix(points).multiply(eightball.PoolTable.s_matrixFlipHorizontal).toArray().reverse();
  side.SetVertices(points);
  table.AddShape(side);

  // bottom right
  side = new b2PolyDef();
  points = new goog.math.Matrix(points).multiply(eightball.PoolTable.s_matrixFlipVertical).toArray();
  side.SetVertices(points);
  table.AddShape(side);

  // bottom left
  side = new b2PolyDef();
  points = new goog.math.Matrix(points).multiply(eightball.PoolTable.s_matrixFlipHorizontal).toArray().reverse();
  side.SetVertices(points);
  table.AddShape(side);

  table.userData = [eightball.PoolTable.s_bodyTypes.TABLE];
  return world.CreateBody(table);
};

/**
 @private
 @param {!b2World} world
 @param {!b2Vec2} centerOffset
 */
eightball.PoolTable._createPockets = function(world, centerOffset) {
  var pockets = new Array(6);

  var pocketCoords = [
    [centerOffset.x - 21, centerOffset.y - 21]];
  pockets[0] = eightball.PoolTable._createPocket(world, pocketCoords[0][0], pocketCoords[0][1]);

  pocketCoords = new goog.math.Matrix(pocketCoords).multiply(eightball.PoolTable.s_matrixFlipHorizontal).toArray();
  pockets[1] = eightball.PoolTable._createPocket(world, pocketCoords[0][0], pocketCoords[0][1]);

  pocketCoords = new goog.math.Matrix(pocketCoords).multiply(eightball.PoolTable.s_matrixFlipVertical).toArray();
  pockets[2] = eightball.PoolTable._createPocket(world, pocketCoords[0][0], pocketCoords[0][1]);

  pocketCoords = new goog.math.Matrix(pocketCoords).multiply(eightball.PoolTable.s_matrixFlipHorizontal).toArray();
  pockets[3] = eightball.PoolTable._createPocket(world, pocketCoords[0][0], pocketCoords[0][1]);

  pocketCoords[0][0] = 0;
  pocketCoords[0][1] = centerOffset.y - 12;
  pockets[4] = eightball.PoolTable._createPocket(world, pocketCoords[0][0], pocketCoords[0][1]);

  pocketCoords = new goog.math.Matrix(pocketCoords).multiply(eightball.PoolTable.s_matrixFlipVertical).toArray();
  pockets[5] = eightball.PoolTable._createPocket(world, pocketCoords[0][0], pocketCoords[0][1]);

  return pockets;
};

/**
 @private
 @param {!b2World} world
 @param {number} x
 @param {number} y
 */
eightball.PoolTable._createPocket = function(world, x, y) {
  var pocketSd = new b2CircleDef();
  pocketSd.radius = 7;

  var pocketBd = new b2BodyDef();
  pocketBd.AddShape(pocketSd);
  pocketBd.position.Set(x, y);
  pocketBd.userData = [eightball.PoolTable.s_bodyTypes.POCKET];

  var body = world.CreateBody(pocketBd);
  return body;
};

/**
 @private
 @param {number} index
 @param {number} x
 @param {number} y
 @returns {!b2Body}
 */
eightball.PoolTable.prototype._createBall = function(index, x, y) {
  var ballSd = new b2CircleDef();
  ballSd.density = 4.0;
  ballSd.radius = eightball.PoolTable.s_ballDiameter * 2;
  ballSd.restitution = 0.95;
  ballSd.friction = 0.05;

  var ballBd = new b2BodyDef();
  ballBd.AddShape(ballSd);
  ballBd.position.Set(x, y);
  ballBd.linearDamping = 0.005;
  ballBd.angularDamping = 0.015;
  ballBd.userData = [eightball.PoolTable.s_bodyTypes.BALL, index];
  return this.m_world.CreateBody(ballBd);
};

/**
 @private
 */
eightball.PoolTable.prototype._step = function() {
  if (this.m_lastStep > 0) {
    var delta = eightball.PoolTable._floatSeconds() - this.m_lastStep;
    this.m_fpsLogger.AddInterval(delta);
    var pairs = this.m_world.Step(delta, 1);
    this.m_canvasContext.clearRect(-this.m_centerOffset.x, -this.m_centerOffset.y, 2 * this.m_centerOffset.x, 2 * this.m_centerOffset.y);
    this._drawWorld();
    this._processPairs(pairs);
    this.stepCount++;
  }

  this.m_lastStep = eightball.PoolTable._floatSeconds();
  goog.global.setTimeout(goog.bind(this._step, this), eightball.PoolTable.s_millisecondsPerFrame);
};

/**
 @private
 @param {!Array.<b2Pair>} pairs
 */
eightball.PoolTable.prototype._processPairs = function(pairs) {
  var _this = this;
  goog.array.forEach(pairs, function(pair, index, array) {
    var pocket = null,
      ball = null;
    if (pair.m_shape1.m_body.GetUserData() == eightball.PoolTable.s_bodyTypes.POCKET) {
      pocket = pair.m_shape1.m_body;
      ball = pair.m_shape2.m_body;
    } else if (pair.m_shape2.m_body.GetUserData() == eightball.PoolTable.s_bodyTypes.POCKET) {
      pocket = pair.m_shape2.m_body;
      ball = pair.m_shape1.m_body;
    }

    if (pocket != null) {
      _this._processPocket(pocket, ball);
    }

  });
};

/**
 @private
 @param {!b2Body} pocketBody
 @param {!b2Body} ballBody
 */
eightball.PoolTable.prototype._processPocket = function(pocketBody, ballBody) {
  this.m_world.DestroyBody(ballBody);
  // TODO: RAISE an event!!
};

/**
 @private
 */
eightball.PoolTable.prototype._drawWorld = function() {
  for (var body = this.m_world.m_bodyList; body; body = body.m_next) {
    var userData = body.GetUserData();
    if (userData) {
      switch (userData[0]) {
      case eightball.PoolTable.s_bodyTypes.BALL:
        this._drawBall(body);
        break;
      case eightball.PoolTable.s_bodyTypes.POCKET:
        // this._drawPocket(body);
        break;
      }
    }
  }
};

/**
 @private
 @param {!b2Body} pocketBody
 */
eightball.PoolTable.prototype._drawPocket = function(pocketBody) {
  var shape = pocketBody.GetShapeList();
  var ctx = this.m_canvasContext;
  ctx.fillStyle = 'rgba(255,255,255,.5)';
  ctx.beginPath();
  ctx.arc(shape.m_position.x, shape.m_position.y, shape.m_radius, 0, 2 * Math.PI, false);
  ctx.fill();
};

/**
 @private
 @param {!b2Body} ballBody
 */
eightball.PoolTable.prototype._drawBall = function(ballBody) {
  var ballNumber = ballBody.GetUserData()[1];
  var shape = ballBody.GetShapeList();
  var ctx = this.m_canvasContext;

  switch (ballNumber) {
  case 1:
  case 9:
    ctx.fillStyle = 'rgb(250,233,0)';
    break;
  case 2:
  case 10:
    ctx.fillStyle = 'rgb(0,32,168)';
    break;
  case 3:
  case 11:
    ctx.fillStyle = 'rgb(252,0,31)';
    break;
  case 4:
  case 12:
    ctx.fillStyle = 'rgb(52,31,134)';
    break;
  case 5:
  case 13:
    ctx.fillStyle = 'rgb(250,149,67)';
    break;
  case 6:
  case 14:
    ctx.fillStyle = 'rgb(9,123,74)';
    break;
  case 7:
  case 15:
    ctx.fillStyle = 'rgb(127,10,19)';
    break;
  case 8:
    ctx.fillStyle = 'rgb(34,34,34)';
    break;
  default:
    ctx.fillStyle = 'white';
  }
  ctx.beginPath();
  ctx.arc(shape.m_position.x, shape.m_position.y, shape.m_radius, 0, 2 * Math.PI, false);
  ctx.fill();

  ctx.drawImage(this.m_ballVignetteImage, shape.m_position.x - shape.m_radius - 2, shape.m_position.y - shape.m_radius - 2);
};

/**
 @returns {number}
 */
eightball.PoolTable.prototype.stepsPerSecond = function() {
  return this.m_fpsLogger.fps;
};

/**
 @private
 @returns {number}
 */
eightball.PoolTable._floatSeconds = function() {
  return goog.now() / 1000.0;
};

/**
 @const
 @private
 @enum {string}
 */
eightball.PoolTable.s_bodyTypes = {
  TABLE: 'table',
  POCKET: 'pocket',
  BALL: 'ball'
};

/**
 @const
 @private
 @type {goog.math.Matrix}
 */
eightball.PoolTable.s_matrixFlipHorizontal = new goog.math.Matrix([
  [-1, 0],
  [0, 1]]);

/**
 @const
 @private
 @type {goog.math.Matrix}
 */
eightball.PoolTable.s_matrixFlipVertical = new goog.math.Matrix([
  [-1, 0],
  [0, -1]]);

/**
 @private
 @const
 @type {number}
 */
eightball.PoolTable.s_millisecondsPerFrame = 1000.0 / 60.0;

/**
 @private
 @const
 @type {number}
 cm, regulation
 */
eightball.PoolTable.s_maxStrikeDistance = 175;

/**
 @private
 @const
 @type {number}
 cm, regulation
 */
eightball.PoolTable.s_verticalCueOffset = -15;

/**
 @private
 @const
 @type {number}
 cm, regulation
 */
eightball.PoolTable.s_horizontalCueOffset = 7;

/**
 @private
 @const
 @type {number}
 cm, regulation
 */
eightball.PoolTable.s_height = 192;

/**
 @private
 @const
 @type {number}
 cm, regulation
 */
eightball.PoolTable.s_width = 396;

/**
 @private
 @const
 @type {number}
 cm, regulation
 */
eightball.PoolTable.s_ballDiameter = 7;

/**
 @private
 @const
 @type {number}
 */
eightball.PoolTable.s_bumperThickness = 10;
