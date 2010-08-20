goog.provide('eightball.PoolTable');

goog.require('goog.object');
goog.require('goog.array');
goog.require('goog.math.Matrix');
goog.require('goog.math.Line');
goog.require('goog.math.Vec2');
goog.require('goog.debug.LogManager');
goog.require('goog.events');
goog.require('goog.Timer');
goog.require('goog.events.EventTarget');
goog.require('goog.style');
goog.require('goog.color');

goog.require('pixelLab.DebugDiv');
goog.require('pixelLab.fpsLogger');

goog.require('b2Vec2');
goog.require('b2AABB');
goog.require('b2World');
goog.require('b2BodyDef');
goog.require('b2PolyDef');
goog.require('b2CircleDef');

goog.require('eightball.PocketDropEvent');
goog.require('eightball.DroppingBall');

/**
 @constructor
 @param {!HTMLCanvasElement} canvasElement
 @param {!HTMLCanvasElement} cueCanvasElement
 @extends {goog.events.EventTarget}
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
   @type {!Object.<number, !b2Body>}
   */
  this.m_balls = {};

  /**
   @private
   @type {!pixelLab.fpsLogger}
   */
  this.m_fpsLogger = new pixelLab.fpsLogger();

  /**
   @private
   @type {!Array}
   */
  this.m_droppingBalls = [];

  // get a local reference to 'this' for events
  var _this = this;

  // a local reference to the root log manager
  var logger = goog.debug.LogManager.getRoot();

  // load our cuestick image (we'll need this for rendering in the updateCue function)
  this.m_cueImage = new Image();
  this.m_cueImage.onload = function() {
    _this._updateCue();
  };
  this.m_cueImage.src = "images/cue.png";

  this.m_ballVignetteImage = new Image();
  this.m_ballVignetteImage.src = "images/ballvignette.png";

  this.m_ballImages = {};
  for (var i = 1; i <= 15; i++) {
    var image = new Image();
    image.src = "images/num" + i + ".png";
    this.m_ballImages[i] = image;
  }

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
    if (_this.m_lastMouse && _this._getCueBall()) {
      _this.m_isMouseDown = true;
      _this.m_lastMouseDown = _this.m_lastMouse;
      _this.m_cueLine = new goog.math.Line(_this._getCueBall().GetCenterPosition().x, _this._getCueBall().GetCenterPosition().y, _this.m_lastMouseDown.x, _this.m_lastMouseDown.y);
    }
  });

  // mouse up
  $(this.m_cueCanvasElement).mouseup(function(e) {
    _this.m_isMouseDown = false;
    if (_this.m_isCueVisible && _this.m_strikePower > 0.01) {
      _this._hideCue();
      _this._strikeCue();
      _this._updateCue();
    }
  });

  // mouse move
  $(this.m_cueCanvasElement).mousemove(function(e) {
    if (_this.m_isCueVisible) {
      var cursorPageOffset = new goog.math.Vec2(e.pageX, e.pageY);
      var elementOffset = new goog.math.Vec2($(_this.m_canvasElement).offset().left, $(_this.m_canvasElement).offset().top);
      var elementLocation = cursorPageOffset.subtract(elementOffset);
      _this.m_lastMouse = elementLocation.subtract(_this.m_centerOffset);

      if (_this.m_isMouseDown) {
        // if the mouse is down we prepare to strike the ball
        var strikeLine = new goog.math.Line(_this.m_lastMouseDown.x, _this.m_lastMouseDown.y, _this.m_lastMouse.x, _this.m_lastMouse.y);
        var strikeOffset = Math.min(strikeLine.getSegmentLength(), eightball.PoolTable.s_maxStrikeDistance);

        // calculate the angle range that we'll allow (to prevent backtracking)
        // TODO: there is an obvious bug with the math here related to wrap-around angles
        var cueAngle = _this._getLineAngleDegrees(_this.m_cueLine);
        var strikeAngle = _this._getLineAngleDegrees(strikeLine);
        //if (strikeAngle < cueAngle - 90 || strikeAngle > cueAngle + 90) strikeOffset = 0;
        // calculate strike power
        _this.m_strikePower = strikeOffset == 0 ? 0 : strikeOffset / eightball.PoolTable.s_maxStrikeDistance;

        pixelLab.DebugDiv.clear();
        logger.info("Allowed Angle Range: " + Math.round(cueAngle - 90) + " to " + Math.round(cueAngle + 90));
        logger.info("Strike Angle: " + Math.round(strikeAngle));
        logger.info("Strike Power: " + _this.m_strikePower);

        _this._updateCue(_this.m_lastMouseDown, strikeOffset);
      } else {
        // otherwise we update the cue position (by rotating it around the cue ball)
        _this._updateCue(_this.m_lastMouse, 0);
      }
    }
  });

  // mouse leave
  $(this.m_cueCanvasElement).mouseleave(function(e) {
    _this.m_lastMouse = null;
    _this.m_isMouseDown = false;
  });

  var timer = new goog.Timer(eightball.PoolTable.s_millisecondsPerFrame);
  goog.events.listen(timer, goog.Timer.TICK, this._step, undefined, this);
  timer.start();
};

goog.inherits(eightball.PoolTable, goog.events.EventTarget);

eightball.PoolTable.prototype.updateLayout = function(width, height) {
  // resize the cue canvas
  this.m_cueCanvasContext.canvas.width = width;
  this.m_cueCanvasContext.canvas.height = height;
  this._updateCue();
};

eightball.PoolTable.prototype._hideCue = function() {
  // we need to delay hiding the canvas because otherwise we get weird selection behavior on mouse up
  var timer = new goog.Timer(500);
  goog.events.listen(timer, goog.Timer.TICK, function() {
    goog.style.setStyle(this.m_cueCanvasElement, "display", "none");
    timer.dispose();
  },
  undefined, this);
  timer.start();

  this.m_isCueVisible = false;
};

eightball.PoolTable.prototype._showCue = function() {
  goog.style.setStyle(this.m_cueCanvasElement, "display", "block");
  this.m_isCueVisible = true;
  this._updateCue(this.m_lastMouse, 0);
};

eightball.PoolTable.prototype._strikeCue = function() {
  if (this.m_cueLine && this._getCueBall()) {
    var velocity = new b2Vec2(this.m_cueLine.x1 - this.m_cueLine.x0, this.m_cueLine.y1 - this.m_cueLine.y0);
    velocity.Normalize();
    velocity.Multiply(500);
    this._getCueBall().SetLinearVelocity(velocity);
    this._getCueBall().WakeUp();
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

    if (this.m_isCueVisible && mousePoint && this._getCueBall()) {
      // find the location of the cue ball in page coordinates
      var absCue = this._gameCoordinatesToAbsolute(this._getCueBall().GetCenterPosition().x, this._getCueBall().GetCenterPosition().y);
      var x = Math.round(absCue.x);
      var y = Math.round(absCue.y);

      // get the angle between the current mouse point and cue ball
      var dX = mousePoint.x - this._getCueBall().GetCenterPosition().x;
      var dY = this._getCueBall().GetCenterPosition().y - mousePoint.y;
      var r = (Math.atan2(dY, dX) * -1) + Math.PI;
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
  var ballRadius = eightball.PoolTable.c_ballRadius;
  this.m_balls[index] = this._createBall(index, -0.5 * eightball.PoolTable.s_width, 0);
  index++;

  this._getCueBall().SetLinearVelocity(new b2Vec2(150, -150));
};

eightball.PoolTable.prototype._rackEm = function() {
  var index = 0;
  var ballRadius = eightball.PoolTable.c_ballRadius;
  this.m_balls[index] = this._createBall(index, -0.5 * eightball.PoolTable.s_width, 0);
  index++;

  for (var col = 0; col < 5; col++) {

    var ballCount = col + 1;
    var x = 0.5 * eightball.PoolTable.s_width + col * ballRadius * Math.sqrt(3);
    var yStart = -col * ballRadius;

    for (var row = 0; row < ballCount; row++) {
      this.m_balls[index] = this._createBall(index, x, yStart + row * ballRadius * 2);
      index++;
    }
  }
};

/**
 @private
 */
eightball.PoolTable.prototype._clearTable = function() {
  goog.object.forEach(this.m_balls, function(o, i, b) {
    this.m_world.DestroyBody(o);
  },
  this);
  goog.object.clear(this.m_balls);
  goog.array.clear(this.m_droppingBalls);
  this.m_world.CleanBodyList();
};

/**
 @private
 @param {number} index
 @param {number} x
 @param {number} y
 @return {!b2Body}
 */
eightball.PoolTable.prototype._createBall = function(index, x, y) {
  var ballSd = new b2CircleDef();
  ballSd.density = 4.0;
  ballSd.radius = eightball.PoolTable.c_ballRadius;
  ballSd.restitution = 0.95;
  ballSd.friction = 0.8;

  var ballBd = new b2BodyDef();
  ballBd.AddShape(ballSd);
  ballBd.position.Set(x, y);
  ballBd.linearDamping = 0.005;
  ballBd.angularDamping = 0.08;
  ballBd.userData = [eightball.PoolTable.s_bodyTypes.BALL, index, new goog.math.Vec2(eightball.PoolTable.c_ballRadius, eightball.PoolTable.c_ballRadius)];
  return this.m_world.CreateBody(ballBd);
};

/**
 @private
 */
eightball.PoolTable.prototype._step = function() {
  this.m_fpsLogger.AddInterval();
  var pairs = this.m_world.Step(1.0 / 30.0, 1);
  this.m_canvasContext.clearRect(-this.m_centerOffset.x, -this.m_centerOffset.y, 2 * this.m_centerOffset.x, 2 * this.m_centerOffset.y);
  this._drawWorld();
  this._processPairs(pairs);
  this._processBalls();
};

/**
 @private
 @param {!Array.<b2Pair>} pairs
 */
eightball.PoolTable.prototype._processPairs = function(pairs) {
  var _this = this,
    wallHit = false,
    ballHit = false;
  goog.array.forEach(pairs, function(pair, index, array) {
    //
    // First, look for pocket hits
    //
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

    //
    // Look for other collisions
    //
    var bodyTypes = [pair.m_shape1.m_body.GetUserData()[0], pair.m_shape2.m_body.GetUserData()[0]];
    goog.array.sort(bodyTypes);
    if (bodyTypes[0] == eightball.PoolTable.s_bodyTypes.BALL) {
      if (bodyTypes[1] == eightball.PoolTable.s_bodyTypes.BALL) {
        ballHit = true;
      } else if (bodyTypes[1] == eightball.PoolTable.s_bodyTypes.TABLE) {
        wallHit = true;
      }
    }
  });
  if (ballHit) {
    this._dispatchBallHitEvent();
  }
  if (wallHit) {
    this._dispatchWallHitEvent();
  }
};

/**
 @private
 @param {!b2Body} pocketBody
 @param {!b2Body} ballBody
 */
eightball.PoolTable.prototype._processPocket = function(pocketBody, ballBody) {
  this.m_world.DestroyBody(ballBody);

  // ballBody.GetUserData() == ['ball', ball #]
  var ballNumber = ballBody.GetUserData()[1];
  // remove ball from collection
  delete this.m_balls[ballNumber];

  var droppingBall = new eightball.DroppingBall(ballNumber, ballBody.GetCenterPosition(), pocketBody.GetCenterPosition());
  this.m_droppingBalls.push(droppingBall);

  this._dispatchPocketDropEvent(ballNumber);
};

/**
 @private
 */
eightball.PoolTable.prototype._drawWorld = function() {

  goog.array.forEach(this.m_droppingBalls, this._drawDroppingBall, this);
  while (goog.array.removeIf(this.m_droppingBalls, function(element) {
    return element.GetIsDropped();
  })) {
    // no body needed ;-)
  }

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

eightball.PoolTable.prototype._drawDroppingBall = function(droppingBall, index, array) {
  droppingBall.step();
  if (!droppingBall.GetIsDropped()) {
    var location = droppingBall.GetCurrentLocation();
    var number = droppingBall.number;
    var color = eightball.PoolTable.s_ballColors[number];
    var colorVal = goog.color.parseRgb(color);
    var percentDropped = droppingBall.GetPercentDropped();
    colorVal = goog.color.darken(colorVal, percentDropped);
    this.m_canvasContext.fillStyle = goog.color.rgbArrayToHex(colorVal);
    this.m_canvasContext.beginPath();
    var droppingRadius = eightball.PoolTable.c_ballRadius * (1 - 0.5 * percentDropped);
    this.m_canvasContext.arc(location.x, location.y, droppingRadius, 0, 2 * Math.PI, false);
    this.m_canvasContext.fill();
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
  var regX, regY;

  ctx.fillStyle = eightball.PoolTable.s_ballColors[ballNumber];

  ctx.beginPath();
  ctx.arc(shape.m_position.x, shape.m_position.y, shape.m_radius, 0, 2 * Math.PI, false);
  ctx.fill();

  if (ballNumber > 0) {
    ctx.save();

    //draw clip
    ctx.beginPath();
    ctx.arc(shape.m_position.x, shape.m_position.y, shape.m_radius, 0, Math.PI * 2, true);
    ctx.clip();

    //draw rotated assets
    ctx.translate(shape.m_position.x, shape.m_position.y);
    ctx.rotate(ballBody.GetRotation());
    ctx.translate(-shape.m_position.x, -shape.m_position.y);

    ballBody.GetUserData()[2].x += ballBody.GetLinearVelocity().x * 0.1;
    ballBody.GetUserData()[2].y += ballBody.GetLinearVelocity().y * 0.1;

    var d = Math.sqrt(Math.pow(shape.m_radius - ballBody.GetUserData()[2].x, 2) + Math.pow(shape.m_radius - ballBody.GetUserData()[2].y, 2));
    if (d > shape.m_radius + 4) {
      ballBody.GetUserData()[2].x = goog.math.clamp(28 - ballBody.GetUserData()[2].x, 0, 28);
      ballBody.GetUserData()[2].y = goog.math.clamp(28 - ballBody.GetUserData()[2].y, 0, 28);
    }

    regX = ballBody.GetCenterPosition().x + ballBody.GetUserData()[2].x - shape.m_radius;
    regY = ballBody.GetCenterPosition().y + ballBody.GetUserData()[2].y - shape.m_radius;

    /*
    if (ballNumber > 8) {
    var mod = (Math.abs(ballBody.GetCenterPosition().y-regY)*.2);
    var tpt1 = new goog.math.Vec2(regX,regY-9+mod);
    var tpt2 = new goog.math.Vec2(tpt1.x,tpt1.y-16);
    var tpt3 = new goog.math.Vec2(tpt1.x-20,regY-11-mod);
    var tpt4 = new goog.math.Vec2(tpt1.x+20,tpt3.y);

    var bpt1 = new goog.math.Vec2(regX,regY+9-mod);
    var bpt2 = new goog.math.Vec2(bpt1.x,bpt1.y+16);
    var bpt3 = new goog.math.Vec2(bpt1.x+20,regY+11+mod);
    var bpt4 = new goog.math.Vec2(bpt1.x-20,bpt3.y);

    ctx.fillStyle = eightball.PoolTable.s_ballColors[0];
    ctx.beginPath();
    ctx.moveTo(tpt1.x, tpt1.y);
    ctx.quadraticCurveTo(tpt3.x+1,tpt1.y,tpt3.x,tpt3.y);
    ctx.quadraticCurveTo(tpt3.x+1,tpt2.y,tpt2.x,tpt2.y);
    ctx.quadraticCurveTo(tpt4.x-1,tpt2.y,tpt4.x,tpt4.y);
      ctx.quadraticCurveTo(tpt4.x-1,tpt1.y,tpt1.x,tpt1.y);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(bpt1.x, bpt1.y);
    ctx.quadraticCurveTo(bpt3.x-1,bpt1.y,bpt3.x,bpt3.y);
    ctx.quadraticCurveTo(bpt3.x-1,bpt2.y,bpt2.x,bpt2.y);
    ctx.quadraticCurveTo(bpt4.x+1,bpt2.y,bpt4.x,bpt4.y);
      ctx.quadraticCurveTo(bpt4.x+1,bpt1.y,bpt1.x,bpt1.y);
    ctx.fill();
    }
    //velocity values
  ctx.fillText(Math.round(ballBody.GetUserData()[2].x*10)/10, shape.m_position.x +16, shape.m_position.y - 4);
  ctx.fillText(Math.round(ballBody.GetUserData()[2].y*10)/10, shape.m_position.x +16, shape.m_position.y + 6);
  ctx.fillText(Math.round(d*10)/10, shape.m_position.x +16, shape.m_position.y +16);
  */

    ctx.drawImage(this.m_ballImages[ballNumber], regX - 4, regY - 4);

    //debug dot
    /*  ctx.fillStyle = "rgb(0,255,255)";
  ctx.beginPath();
  ctx.arc(regX,regY,1,0,Math.PI*2,true);
  ctx.fill();*/

    //end rotated assets
    ctx.restore();
  }

  //draw shading and reflections
  ctx.drawImage(this.m_ballVignetteImage, shape.m_position.x - shape.m_radius - 2, shape.m_position.y - shape.m_radius - 2);
};

/**
 @return {number}
 */
eightball.PoolTable.prototype.stepsPerSecond = function() {
  return this.m_fpsLogger.fps;
};

/**
 @private
 @param {number} ballNumber
 */
eightball.PoolTable.prototype._dispatchPocketDropEvent = function(ballNumber) {
  this.dispatchEvent(new eightball.PocketDropEvent(ballNumber, this));
};

/**
 @private
 */
eightball.PoolTable.prototype._dispatchCueStopEvent = function() {
  this.dispatchEvent(new goog.events.Event(eightball.PoolTable.EventType.CUE_STOPPED, this));
};

/**
 @private
 */
eightball.PoolTable.prototype._dispatchWallHitEvent = function() {
  this.dispatchEvent(new goog.events.Event(eightball.PoolTable.EventType.WALL_HIT, this));
};

/**
 @private
 */
eightball.PoolTable.prototype._dispatchBallHitEvent = function() {
  this.dispatchEvent(new goog.events.Event(eightball.PoolTable.EventType.BALL_HIT, this));
};

/**
 @private
 */
eightball.PoolTable.prototype._processBalls = function() {
  var slowBalls = 0;
  var stoppedBalls = 0;
  var count = goog.object.getCount(this.m_balls);
  var processBall = function(ball, key, theThis) {
    var velocity = ball.GetLinearVelocity().Length();
    if (velocity == 0) {
      stoppedBalls++;
      slowBalls++;
    } else if (velocity < 10) {
      ball.SetLinearVelocity(new b2Vec2());
      stoppedBalls++;
      slowBalls++;
    } else if (velocity < 20) {
      slowBalls++;
    }
  };
  goog.object.forEach(this.m_balls, processBall, this);
  if (!this.m_isCueVisible) {
    if (stoppedBalls == count || (slowBalls == count && this._getCueBall() == 0)) {
      this._dispatchCueStopEvent();
      this._showCue();
    }
  }
};

/**
 @private
 @return {b2Body}
 */
eightball.PoolTable.prototype._getCueBall = function() {
  return this.m_balls[0];
};

//
//
// CLass (static) members
//
//
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
 @enum {string}
 */
eightball.PoolTable.s_bodyTypes = {
  TABLE: 'table',
  POCKET: 'pocket',
  BALL: 'ball'
};

/**
 * @enum {string}
 */
eightball.PoolTable.EventType = {
  CUE_STOPPED: 'cueStopped',
  WALL_HIT: 'wallHit',
  BALL_HIT: 'ballHit'
};

/**
 @const
 @enum {string}
 @private
 */
eightball.PoolTable.s_colors = {
  YELLOW: 'rgb(250,164,25)',
  BLUE: 'rgb(35,45,101)',
  RED: 'rgb(192,66,57)',
  PLUM: 'rgb(80,46,67)',
  ORANGE: 'rgb(236,89,37)',
  DARK_GREEN: 'rgb(48,65,37)',
  DARK_RED: 'rgb(117,36,32)',
  BLACK: 'rgb(34,34,34)',
  WHITE: 'rgb(232,208,176)'
};

/**
 @const
 @type {Object.<number,string>}
 @private
 */
eightball.PoolTable.s_ballColors = {
  1: eightball.PoolTable.s_colors.YELLOW,
  9: eightball.PoolTable.s_colors.YELLOW,
  2: eightball.PoolTable.s_colors.BLUE,
  10: eightball.PoolTable.s_colors.BLUE,
  3: eightball.PoolTable.s_colors.RED,
  11: eightball.PoolTable.s_colors.RED,
  4: eightball.PoolTable.s_colors.PLUM,
  12: eightball.PoolTable.s_colors.PLUM,
  5: eightball.PoolTable.s_colors.ORANGE,
  13: eightball.PoolTable.s_colors.ORANGE,
  6: eightball.PoolTable.s_colors.DARK_GREEN,
  14: eightball.PoolTable.s_colors.DARK_GREEN,
  7: eightball.PoolTable.s_colors.DARK_RED,
  15: eightball.PoolTable.s_colors.DARK_RED,
  8: eightball.PoolTable.s_colors.BLACK,
  0: eightball.PoolTable.s_colors.WHITE
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
eightball.PoolTable.c_ballRadius = 14;

/**
 @private
 @const
 @type {number}
 */
eightball.PoolTable.s_bumperThickness = 10;
