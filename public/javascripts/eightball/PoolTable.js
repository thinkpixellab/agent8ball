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
goog.require('pixelLab.FpsLogger');

goog.require('box2d.Vec2');
goog.require('box2d.AABB');
goog.require('box2d.World');
goog.require('box2d.BodyDef');
goog.require('box2d.PolyDef');
goog.require('box2d.CircleDef');

goog.require('eightball.CollisionEvent');
goog.require('eightball.PocketDropEvent');
goog.require('eightball.DroppingBall');

/**
 @constructor
 @param {!HTMLCanvasElement} canvasElement
 @param {!HTMLCanvasElement} cueCanvasElement
 @param {!Object.<string,string>} imageMap
 @extends {goog.events.EventTarget}
 */
eightball.PoolTable = function(canvasElement, cueCanvasElement, shadowCanvasElement, imageMap) {

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
   will be a number from 0 to 1 indicating strike power
   @private
   @type {number}
   */
  this.m_strikePower = 0;
  /**
   @private
   @type {boolean}
   */
  this.m_isCueVisible = true;

  /**
   @private
   @type {goog.math.Vec2}
   */
  this.gameTableOffset = null;
  /**
   @private
   @type {goog.math.Box}
   */
  this.gameTableBounds = null;

  /**
   @private
   @type {number}
   */
  this.m_bombPulseAngle = 0;

  /**
   @private
   @type {number}
   */
  this.m_bombPulseInc = 0.12;

  /**
   @private
   @type {number}
   */
  this.m_bombNumber = -1;

  /**
   @private
   @type {boolean}
   */
  this._isBombIgnited = false;

  /**
   @private
   @type {!Object.<number, !box2d.Body>}
   */
  this.m_balls = {};

  /**
   @private
   @type {!pixelLab.FpsLogger}
   */
  this.m_fpsLogger = new pixelLab.FpsLogger();

  /**
   @private
   @type {!Array.<!eightball.DroppingBall>}
   */
  this.m_droppingBalls = [];

  // get a local reference to 'this' for events
  var _this = this;

  // a local reference to the root log manager
  var logger = goog.debug.LogManager.getRoot();

  /**
   @private
   @type {boolean}
   */
  this._isBreak = false;

  /**
   @private
   @type {boolean}
   */
  this._isCueHit = false;

  // load our cuestick image (we'll need this for rendering in the updateCue function)
  this.m_cueImage = new Image();
  this.m_cueImage.onload = function() {
    _this._updateCue();
  };
  this.m_cueImage.src = imageMap['cue'];

  this.m_ballVignetteImage = new Image();
  this.m_ballVignetteImage.src = imageMap['ballvignette'];

  this.m_ballImages = {};
  for (var i = 1; i <= 15; i++) {
    var image = new Image();
    image.src = imageMap["num" + i];
    this.m_ballImages[i] = image;
  }

  this.m_bombStampImage = new Image();
  this.m_bombStampImage.src = imageMap['bombstamp'];

  // get local references for our canvas elements
  this.m_canvasElement = canvasElement;
  this.m_cueCanvasElement = cueCanvasElement;
  this.m_shadowCanvasElement = shadowCanvasElement;

  // get local references for our canvas drawing contexts
  this.m_canvasContext = this.m_canvasElement.getContext('2d');
  this.m_cueCanvasContext = this.m_cueCanvasElement.getContext('2d');
  this.m_shadowCanvasContext = this.m_shadowCanvasElement.getContext('2d');

  // set the width and height of the table
  this.m_canvasElement.setAttribute('width', eightball.PoolTable.s_width * 2 + eightball.PoolTable.s_bumperThickness * 4);
  this.m_canvasElement.setAttribute('height', eightball.PoolTable.s_height * 2 + eightball.PoolTable.s_bumperThickness * 4);
  this.m_shadowCanvasElement.setAttribute('width', eightball.PoolTable.s_width * 2 + eightball.PoolTable.s_bumperThickness * 4);
  this.m_shadowCanvasElement.setAttribute('height', eightball.PoolTable.s_height * 2 + eightball.PoolTable.s_bumperThickness * 4);
  this.m_centerOffset = new box2d.Vec2(eightball.PoolTable.s_width + eightball.PoolTable.s_bumperThickness * 2, eightball.PoolTable.s_height + eightball.PoolTable.s_bumperThickness * 2);

  // setup our physics world
  this._createWorld();
  this.m_canvasContext.translate(this.m_centerOffset.x, this.m_centerOffset.y);
  this.m_shadowCanvasContext.translate(this.m_centerOffset.x, this.m_centerOffset.y + 6);

  // mouse tracking fields
  this.m_isMouseDown = false;

  // mouse down
  $(this.m_cueCanvasElement).mousedown(function(e) {
    if (_this.m_lastMouse && _this._getCueBall()) {
      _this.m_isMouseDown = true;
      _this.m_lastMouseDown = _this.m_lastMouse;
      _this.m_cueLine = new goog.math.Line(_this._getCueBall().GetCenterPosition().x, _this._getCueBall().GetCenterPosition().y, _this.m_lastMouseDown.x, _this.m_lastMouseDown.y);
      _this._dispatchCuestickHitStartEvent();
    }
  });

  // mouse up
  $(this.m_cueCanvasElement).mouseup(function(e) {
    _this.m_isMouseDown = false;
    if (_this.m_isCueVisible && _this.m_strikePower > 0.01) {
      _this._hideCue();
      _this._strikeCue();
      _this._updateCue();
      _this._dispatchCuestickHitStopEvent();
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

  this._timer = new goog.Timer(eightball.PoolTable.s_millisecondsPerFrame);
  goog.events.listen(this._timer, goog.Timer.TICK, this._step, undefined, this);
  this._timer.start();

};

goog.inherits(eightball.PoolTable, goog.events.EventTarget);

eightball.PoolTable.prototype.updateLayout = function(width, height) {
  // resize the cue canvas
  this.m_cueCanvasContext.canvas.width = width;
  this.m_cueCanvasContext.canvas.height = height;
  this._updateCue();
};

eightball.PoolTable.prototype.ballCount = function() {
  return this.m_balls.length();
};

eightball.PoolTable.prototype.resume = function() {
  if (this._timer) {
    if (!this._timer.enabled) {
      this._timer.start();
    }
  }
};

eightball.PoolTable.prototype.pause = function() {
  if (this._timer) {
    if (this._timer.enabled) {
      this._timer.stop();
    }
  }
};

eightball.PoolTable.prototype._hideCue = function() {
  // we need to delay hiding the canvas because otherwise we get weird selection behavior on mouse up
  var timer = new goog.Timer(50);
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

  this._ensureCueBall();

  this._updateCue(this.m_lastMouse, 0);
};

eightball.PoolTable.prototype._strikeCue = function() {
  if (this.m_cueLine && this._getCueBall()) {

    var velocity = new box2d.Vec2(this.m_cueLine.x1 - this.m_cueLine.x0, this.m_cueLine.y1 - this.m_cueLine.y0);
    velocity.Normalize();
    velocity.scale(800 * this.m_strikePower + 100);

    this._dispatchCollisionEvent(velocity.magnitude(), eightball.CollisionEvent.EventType.CUESTICK, -1, -1);
    this._isCueHit = true;

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
      var spacing = 5;
      var yDiff = mousePoint.y - this._getCueBall().GetCenterPosition().y;
      var xDiff = Math.abs(this._getCueBall().GetCenterPosition().x - mousePoint.x);

      var lineLength = Math.sqrt((Math.pow(xDiff, 2) + Math.pow(dY, 2)));
      var steps = lineLength / spacing;
      var xStep = dX / steps;
      var yStep = yDiff / steps;

      this.m_cueCanvasContext.lineWidth = 2;
      if (this.m_isMouseDown) {
        this.m_cueCanvasContext.fillStyle = this.m_cueCanvasContext.strokeStyle = eightball.PoolTable.s_colors.TIMER;
      } else {
        this.m_cueCanvasContext.fillStyle = this.m_cueCanvasContext.strokeStyle = eightball.PoolTable.s_colors.WHITE;
      }

      var ballCoordinates, d, hitTest, x2, y2;

      if (this.gameTableBounds == null) {
        var q = this._gameCoordinatesToAbsolute(0, 0);
        this.gameTableBounds = new goog.math.Box(q.y - 180, q.x + 380, q.y + 180, q.x - 380);
      }

      for (var i = 4; i < steps; i++) {
        x2 = x + (xStep * i);
        y2 = y + (yStep * i);
        if (i % 2 == 0) {
          //check non dropped balls
          for (var j = 1; j < 15; j++) {
            if (j in this.m_balls) {
              ballCoordinates = this._gameCoordinatesToAbsolute(this.m_balls[j].m_position.x, this.m_balls[j].m_position.y);
              d = Math.sqrt(Math.pow(ballCoordinates.x - x2, 2) + Math.pow(ballCoordinates.y - y2, 2));
              if (d <= eightball.PoolTable.c_ballRadius + 10) {
                hitTest = true;
                break;
              }
            }
          }
          //check table bounds
          if (!hitTest && (x2 < this.gameTableBounds.left || x2 > this.gameTableBounds.right || y2 < this.gameTableBounds.top || y2 > this.gameTableBounds.bottom)) hitTest = true;
          if (hitTest) {
            break;
          } else {
            this.m_cueCanvasContext.beginPath();
            this.m_cueCanvasContext.moveTo(x2, y2);
          }
        } else {
          this.m_cueCanvasContext.lineTo(x2, y2);
          this.m_cueCanvasContext.stroke();
        }
      }
      if (steps > 4) {
        this.m_cueCanvasContext.beginPath();
        this.m_cueCanvasContext.arc(x2, y2, 4, 0, 2 * Math.PI, false);
        this.m_cueCanvasContext.fill();
      }

      // translate and rotate the canvas
      this.m_cueCanvasContext.translate(x, y);
      this.m_cueCanvasContext.rotate(r);

      // draw the cue stick
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
  this.gameTableOffset = null;
};

/**
 @private
 */
eightball.PoolTable.prototype._gameCoordinatesToAbsolute = function(x, y) {

  // translate our game coordinates (where 0,0 is in the center of
  // the table) to absolute coordinates for the page
  if (this.gameTableOffset == null) {
    this.gameTableOffset = new goog.math.Vec2($(this.m_canvasElement).offset().left, $(this.m_canvasElement).offset().top);
    this.gameTableOffset.x += this.m_canvasElement.width / 2;
    this.gameTableOffset.y += this.m_canvasElement.height / 2;
  }

  var newX = this.gameTableOffset.x + x;
  var newY = this.gameTableOffset.y + y;

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

  var worldAABB = new box2d.AABB();
  worldAABB.minVertex.Set(-1000, -1000);
  worldAABB.maxVertex.Set(1000, 1000);
  var gravity = new box2d.Vec2(0, 0);
  var doSleep = true;
  this.m_world = new box2d.World(worldAABB, gravity, doSleep);

  eightball.PoolTable._createTable(this.m_world, this.m_centerOffset);
  eightball.PoolTable._createPockets(this.m_world, this.m_centerOffset);
  this.rackEm();
};

eightball.PoolTable.prototype.rackEm = function() {
  this._isBreak = true;
  this._clearTable();
  this._rackEm();
  //this._testRack();
};

eightball.PoolTable.prototype._testRack = function() {
  var ballRadius = eightball.PoolTable.c_ballRadius;
  this.m_balls[0] = this._createBall(0, -0.5 * eightball.PoolTable.s_width, -150);

  this._getCueBall().SetLinearVelocity(new box2d.Vec2(-150, -15));
};

eightball.PoolTable.prototype._rackEm = function() {

  this._ensureCueBall();

  var ballRadius = eightball.PoolTable.c_ballRadius;
  var index = 1;

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

eightball.PoolTable.prototype._ensureCueBall = function() {
  // make sure we don't already have a cue ball on the table
  if (!this._getCueBall()) {

    // create the cuee ball
    var ballRadius = eightball.PoolTable.c_ballRadius;
    this.m_balls[0] = this._createBall(0, -0.5 * eightball.PoolTable.s_width, 0);
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
 @return {!box2d.Body}
 */
eightball.PoolTable.prototype._createBall = function(index, x, y) {
  var ballSd = new box2d.CircleDef();
  ballSd.density = 5.0;
  ballSd.radius = eightball.PoolTable.c_ballRadius;
  ballSd.restitution = 0.95;
  ballSd.friction = 0.20;

  var ballBd = new box2d.BodyDef();
  ballBd.AddShape(ballSd);
  ballBd.position.Set(x, y);
  ballBd.linearDamping = 0.018;
  ballBd.angularDamping = 0.12;
  ballBd.userData = [eightball.PoolTable.s_bodyTypes.BALL, index, new goog.math.Vec2(eightball.PoolTable.c_ballRadius, eightball.PoolTable.c_ballRadius), new goog.math.Vec2(28 - eightball.PoolTable.c_ballRadius, 28 - eightball.PoolTable.c_ballRadius)];
  return this.m_world.CreateBody(ballBd);
};

eightball.PoolTable.prototype.igniteBomb = function() {
  this._isBombIgnited = true;
};

eightball.PoolTable.prototype.removeBomb = function() {
  var bombBall = this.m_balls[this.m_bombNumber];

  goog.object.forEach(this.m_balls, function(ball, key, theThis) {

    ball.GetLinearVelocity();
    var v = new box2d.Vec2(ball.m_position.x - bombBall.m_position.x, ball.m_position.y - bombBall.m_position.y);
    //v.Multiply(1.0);
    ball.GetLinearVelocity().add(v);
    ball.WakeUp();

  },
  this);

  bombBall.m_position.Set(5000, 5000);
  this._hideCue();
  //this.m_world.DestroyBody(this.m_balls[this.m_bombNumber]);
  delete this.m_balls[this.m_bombNumber];
};

/**
 @param {number} ballNumber
 @return {box2d.Vec2}
 */
eightball.PoolTable.prototype.getBallLocation = function(ballNumber) {
  var ball = this.m_balls[ballNumber];
  if (ball) {
    return ball.m_position;
  } else return null;
};

/**
 @private
 */
eightball.PoolTable.prototype._step = function() {
  this.m_fpsLogger.AddInterval();
  this.m_world.Step(1.0 / 30.0, 1);

  if(this._hasBomb() || !(this.m_world.sleeping)){
    this.m_canvasContext.clearRect(-this.m_centerOffset.x, -this.m_centerOffset.y, 2 * this.m_centerOffset.x, 2 * this.m_centerOffset.y);
    this.m_shadowCanvasContext.clearRect(-this.m_centerOffset.x, -this.m_centerOffset.y - 6, 2 * this.m_centerOffset.x, 2 * this.m_centerOffset.y);
    this._drawWorld();
    this._processPairs(this.m_world.lastPairs);
    this._processBalls();
  }
};

/**
 @private
 @param {!Array.<box2d.Pair>} pairs
 */
eightball.PoolTable.prototype._processPairs = function(pairs) {
  var _this = this,
    wallHit = 0,
    ballHit = 0,
    ballNum1 = -1,
    ballNum2 = -1,
    totalVelocity = 0;

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
      ballNum1 = pair.m_shape1.m_body.GetUserData()[1];
      if (bodyTypes[1] == eightball.PoolTable.s_bodyTypes.BALL) {
        ballHit++;
        ballNum2 = pair.m_shape2.m_body.GetUserData()[1];
        totalVelocity += pair.m_shape1.m_body.GetLinearVelocity().magnitude();
        totalVelocity += pair.m_shape2.m_body.GetLinearVelocity().magnitude();
      } else if (bodyTypes[1] == eightball.PoolTable.s_bodyTypes.TABLE) {
        wallHit++;
        totalVelocity += pair.m_shape1.m_body.GetLinearVelocity().magnitude();
        totalVelocity += pair.m_shape2.m_body.GetLinearVelocity().magnitude();
      }
    }
  });

  // compute the velocity
  var avgVelocity = (wallHit > 0 || ballHit > 0) ? totalVelocity / (2 * (ballHit + wallHit)) : 0;

  // raise ball collision event
  if (ballHit > 0) {

    var type = eightball.CollisionEvent.EventType.BALL;

    if (this._isBreak) {
      type = eightball.CollisionEvent.EventType.BREAK;
      this._isBreak = false;
    } else if (this._isCueHit) {
      type = eightball.CollisionEvent.EventType.CUEBALL;
      this._isCueHit = false;
    }

    // raise ball collision event
    this._dispatchCollisionEvent(avgVelocity, type, ballNum1, ballNum2);
  }

  // raise wall collision event
  if (wallHit > 0) {
    this._dispatchCollisionEvent(avgVelocity, eightball.CollisionEvent.EventType.WALL, ballNum1, ballNum2);
  }

};

/**
 @private
 @param {!box2d.Body} pocketBody
 @param {!box2d.Body} ballBody
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
        //this._drawBody(body);
        break;
      case eightball.PoolTable.s_bodyTypes.TABLE:
        //this._drawBody(body);
        break;
      }
    }
  }
};

/**
 @param {!eightball.DroppingBall} droppingBall
 @param {number} index
*/
eightball.PoolTable.prototype._drawDroppingBall = function(droppingBall, index) {
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
  } else {
    droppingBall.m_ballLocation.Set(5000, 5000);
  }
};

/**
 @return {boolean}
*/
eightball.PoolTable.prototype._hasBomb = function(){
  return !!this.m_balls[this.m_bombNumber];
};

/**
 @private
 @param {!box2d.Body} ballBody
 */
eightball.PoolTable.prototype._drawBall = function(ballBody) {
  var shape = ballBody.GetShapeList();
  var ctx = this.m_canvasContext;
  var ballNumber = ballBody.GetUserData()[1];
  var isBomb = this.m_bombNumber == ballNumber;

  if (!isBomb) {
    ctx.fillStyle = eightball.PoolTable.s_ballColors[ballNumber];
  } else if (this._isBombIgnited) {
    ctx.fillStyle = 'rgba(237,218,193,0.5)'; // bombBrush;
  } else {
    ctx.fillStyle = eightball.PoolTable.s_colors.BOMBSHELL;
  }

  ctx.beginPath();
  ctx.arc(shape.m_position.x, shape.m_position.y, shape.m_radius, 0, 2 * Math.PI, false);
  ctx.fill();

  if (ballNumber > 0) {
    var pt1 = new goog.math.Vec2(0, 0);
    var pt2 = new goog.math.Vec2(0, 0);
    ctx.save();

    //draw clip
    ctx.beginPath();
    ctx.arc(shape.m_position.x, shape.m_position.y, shape.m_radius, 0, Math.PI * 2, true);
    ctx.clip();

    ballBody.GetUserData()[2].x += ballBody.GetLinearVelocity().x * 0.03;
    ballBody.GetUserData()[2].y += ballBody.GetLinearVelocity().y * 0.03;

    var dx = shape.m_radius - ballBody.GetUserData()[2].x;
    var dy = shape.m_radius - ballBody.GetUserData()[2].y;
    var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    var angle = Math.atan2(dy, dx);

    //check if wrapping needed
    if (d > shape.m_radius * 3) {
      ballBody.GetUserData()[2].x = ballBody.GetUserData()[3].x;
      ballBody.GetUserData()[2].y = ballBody.GetUserData()[3].y;
    }

    //global coordinates for first point
    pt1.x = ballBody.GetCenterPosition().x + ballBody.GetUserData()[2].x - shape.m_radius;
    pt1.y = ballBody.GetCenterPosition().y + ballBody.GetUserData()[2].y - shape.m_radius;

    //global coordinates for second point
    ballBody.GetUserData()[3].x = ballBody.GetUserData()[2].x + Math.sin(Math.PI * 2.5 - angle) * shape.m_radius * 2.7;
    ballBody.GetUserData()[3].y = ballBody.GetUserData()[2].y + Math.cos(Math.PI * 2.5 - angle) * shape.m_radius * 2.7;
    pt2.x = ballBody.GetCenterPosition().x + ballBody.GetUserData()[3].x - shape.m_radius;
    pt2.y = ballBody.GetCenterPosition().y + ballBody.GetUserData()[3].y - shape.m_radius;

    //add stripes
    if (!isBomb && ballNumber > 8) {
      ctx.fillStyle = eightball.PoolTable.s_ballColors[0];
      var pt3 = new goog.math.Vec2(0, 0);
      var pt4 = new goog.math.Vec2(0, 0);
      var pt5 = new goog.math.Vec2(0, 0);
      var pt6 = new goog.math.Vec2(0, 0);

      pt3.x = ballBody.GetUserData()[2].x + Math.sin((Math.PI * -0.7) - angle) * shape.m_radius + ballBody.GetCenterPosition().x - shape.m_radius;
      pt3.y = ballBody.GetUserData()[2].y + Math.cos((Math.PI * -0.7) - angle) * shape.m_radius + ballBody.GetCenterPosition().y - shape.m_radius;
      pt4.x = ballBody.GetUserData()[2].x + Math.sin((Math.PI * -0.7) - angle) * shape.m_radius * 2 + ballBody.GetCenterPosition().x - shape.m_radius;
      pt4.y = ballBody.GetUserData()[2].y + Math.cos((Math.PI * -0.7) - angle) * shape.m_radius * 2 + ballBody.GetCenterPosition().y - shape.m_radius;
      pt5.x = ballBody.GetUserData()[3].x + Math.sin((Math.PI * 0.7) - angle) * shape.m_radius * 2 + ballBody.GetCenterPosition().x - shape.m_radius;
      pt5.y = ballBody.GetUserData()[3].y + Math.cos((Math.PI * 0.7) - angle) * shape.m_radius * 2 + ballBody.GetCenterPosition().y - shape.m_radius;
      pt6.x = ballBody.GetUserData()[3].x + Math.sin((Math.PI * 0.7) - angle) * shape.m_radius + ballBody.GetCenterPosition().x - shape.m_radius;
      pt6.y = ballBody.GetUserData()[3].y + Math.cos((Math.PI * 0.7) - angle) * shape.m_radius + ballBody.GetCenterPosition().y - shape.m_radius;

      ctx.beginPath();
      ctx.moveTo(pt3.x, pt3.y);
      ctx.lineTo(pt4.x, pt4.y);
      ctx.lineTo(pt5.x, pt5.y);
      ctx.lineTo(pt6.x, pt6.y);
      ctx.fill();

      pt3.x = ballBody.GetUserData()[2].x + Math.sin((Math.PI * -0.3) - angle) * shape.m_radius + ballBody.GetCenterPosition().x - shape.m_radius;
      pt3.y = ballBody.GetUserData()[2].y + Math.cos((Math.PI * -0.3) - angle) * shape.m_radius + ballBody.GetCenterPosition().y - shape.m_radius;
      pt4.x = ballBody.GetUserData()[2].x + Math.sin((Math.PI * -0.3) - angle) * shape.m_radius * 2 + ballBody.GetCenterPosition().x - shape.m_radius;
      pt4.y = ballBody.GetUserData()[2].y + Math.cos((Math.PI * -0.3) - angle) * shape.m_radius * 2 + ballBody.GetCenterPosition().y - shape.m_radius;
      pt5.x = ballBody.GetUserData()[3].x + Math.sin((Math.PI * 0.3) - angle) * shape.m_radius * 2 + ballBody.GetCenterPosition().x - shape.m_radius;
      pt5.y = ballBody.GetUserData()[3].y + Math.cos((Math.PI * 0.3) - angle) * shape.m_radius * 2 + ballBody.GetCenterPosition().y - shape.m_radius;
      pt6.x = ballBody.GetUserData()[3].x + Math.sin((Math.PI * 0.3) - angle) * shape.m_radius + ballBody.GetCenterPosition().x - shape.m_radius;
      pt6.y = ballBody.GetUserData()[3].y + Math.cos((Math.PI * 0.3) - angle) * shape.m_radius + ballBody.GetCenterPosition().y - shape.m_radius;

      ctx.beginPath();
      ctx.moveTo(pt3.x, pt3.y);
      ctx.lineTo(pt4.x, pt4.y);
      ctx.lineTo(pt5.x, pt5.y);
      ctx.lineTo(pt6.x, pt6.y);
      ctx.fill();
    }

    //draw the number stamps
    if (!isBomb) {
      ctx.drawImage(this.m_ballImages[ballNumber], pt1.x - 4, pt1.y - 4);
      if (d > shape.m_radius) {
        ctx.drawImage(this.m_ballImages[ballNumber], pt2.x - 4, pt2.y - 4);
      }
    } else {
      ctx.drawImage(this.m_bombStampImage, pt1.x - 6, pt1.y - 6);
      if (d > shape.m_radius) {
        ctx.drawImage(this.m_bombStampImage, pt2.x - 6, pt2.y - 6);
      }
    }
    ctx.restore();
  }

  //draw shading and reflections
  ctx.drawImage(this.m_ballVignetteImage, shape.m_position.x - shape.m_radius - 2, shape.m_position.y - shape.m_radius - 2);
  if (isBomb) {
    this.m_bombPulseAngle += this.m_bombPulseInc;
    var glowBrush = this.m_shadowCanvasContext.createRadialGradient(shape.m_position.x, shape.m_position.y, 0, shape.m_position.x, shape.m_position.y, 32);
    glowBrush.addColorStop(0.2, 'rgba(255,234,136,' + Math.abs(Math.sin(this.m_bombPulseAngle)) + ')');
    glowBrush.addColorStop(0.8, 'rgba(255,234,136,0.0)');
    this.m_shadowCanvasContext.fillStyle = glowBrush;
    this.m_shadowCanvasContext.beginPath();
    this.m_shadowCanvasContext.arc(shape.m_position.x, shape.m_position.y, 32, 0, 2 * Math.PI, false);
    this.m_shadowCanvasContext.fill();
  }
};

/**
 @param {number} number
 */
eightball.PoolTable.prototype.setBombNumber = function(number) {
  this._isBombIgnited = false;
  this.m_bombNumber = number;
  this.m_bombPulseAngle = 0;
  this.m_bombPulseInc = 0.12;
};

eightball.PoolTable.prototype.clearBombNumber = function() {
  this.setBombNumber(-1);
};

eightball.PoolTable.prototype.increaseBombPulse = function() {
  this.m_bombPulseInc += 0.12;
};

/**
 @private
 @param {!box2d.Body} b2body
 */
eightball.PoolTable.prototype._drawBody = function(b2body) {
  for (var shape = b2body.GetShapeList(); shape != null; shape = shape.GetNext()) {
    this._drawShape(shape);
  }
};

eightball.PoolTable.prototype._drawShape = function(shape) {
  var context = this.m_canvasContext;
  context.fillStyle = 'rgba(255,255,255,0.5)';
  context.strokeStyle = 'white';
  context.beginPath();
  switch (shape.m_type) {
  case box2d.Shape.e_circleShape:
    {
      var circle = shape;
      var pos = circle.m_position;
      var r = circle.m_radius;

      context.arc(circle.m_position.x, circle.m_position.y, circle.m_radius, 0, 2 * Math.PI, false);

      // draw radius
      context.moveTo(pos.x, pos.y);
      var ax = circle.m_R.col1;
      var pos2 = new box2d.Vec2(pos.x + r * ax.x, pos.y + r * ax.y);
      context.lineTo(pos2.x, pos2.y);
    }
    break;
  case box2d.Shape.e_polyShape:
    {
      var poly = shape;
      var tV = box2d.Math.AddVV(poly.m_position, box2d.Math.b2MulMV(poly.m_R, poly.m_vertices[0]));
      context.moveTo(tV.x, tV.y);
      for (var i = 0; i < poly.m_vertexCount; i++) {
        var v = box2d.Math.AddVV(poly.m_position, box2d.Math.b2MulMV(poly.m_R, poly.m_vertices[i]));
        context.lineTo(v.x, v.y);
      }
      context.lineTo(tV.x, tV.y);
    }
    break;
  default:
    throw "Don't know how to draw shape type " + shape.m_type;
  }
  context.stroke();
  context.fill();
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
eightball.PoolTable.prototype._dispatchCuestickHitStartEvent = function() {
  this.dispatchEvent(new goog.events.Event(eightball.PoolTable.EventType.CUESTICK_HIT_START, this));
};

/**
 @private
 */
eightball.PoolTable.prototype._dispatchCuestickHitStopEvent = function() {
  this.dispatchEvent(new goog.events.Event(eightball.PoolTable.EventType.CUESTICK_HIT_STOP, this));
};

/**
 @private
 @param {number} velocity
 @param {eightball.CollisionEvent.EventType} type
 */
eightball.PoolTable.prototype._dispatchCollisionEvent = function(velocity, type, ballNumber1, ballNumber2) {
  this.dispatchEvent(new eightball.CollisionEvent(velocity, type, ballNumber1, ballNumber2, this));
};

/**
 @private
 */
eightball.PoolTable.prototype._processBalls = function() {
  var slowBalls = 0;
  var stoppedBalls = 0;

  var count = goog.object.getCount(this.m_balls);

  var processBall = function(ball, key, theThis) {
    var velocity = ball.GetLinearVelocity().magnitude();
    if (velocity == 0) {
      stoppedBalls++;
      slowBalls++;
    } else if (velocity < 10) {
      ball.SetLinearVelocity(new box2d.Vec2());
      stoppedBalls++;
      slowBalls++;
    } else if (velocity < 20) {
      slowBalls++;
    }
  };

  goog.object.forEach(this.m_balls, processBall, this);
  if (!this.m_isCueVisible) {
    if (stoppedBalls == count || (slowBalls == count && (this._getCueBall() && this._getCueBall().GetLinearVelocity().magnitude() == 0))) {
      this._dispatchCueStopEvent();
      this._showCue();
    }
  }
};

/**
 @private
 @return {box2d.Body}
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
 @param {!box2d.World} world
 @param {!box2d.Vec2} centerOffset
 */
eightball.PoolTable._createTable = function(world, centerOffset) {
  var table = new box2d.BodyDef();
  table.restitution = 1;
  table.friction = 1.0;

  var side;
  var points;

  // Left
  side = new box2d.PolyDef();
  points = [
    [-centerOffset.x, -centerOffset.y + eightball.PoolTable.s_bumperThickness * 2.5],
    [-centerOffset.x + eightball.PoolTable.s_bumperThickness * 2, -centerOffset.y + eightball.PoolTable.s_bumperThickness * 4.5],
    [-centerOffset.x + eightball.PoolTable.s_bumperThickness * 2, centerOffset.y - eightball.PoolTable.s_bumperThickness * 4.5],
    [-centerOffset.x, centerOffset.y - eightball.PoolTable.s_bumperThickness * 2.5]];
  side.SetVertices(points);
  table.AddShape(side);

  // Right
  side = new box2d.PolyDef();
  points = new goog.math.Matrix(points).multiply(eightball.PoolTable.s_matrixFlipHorizontal).toArray().reverse();
  side.SetVertices(points);
  table.AddShape(side);

  // top left
  points = [
    [-centerOffset.x + eightball.PoolTable.s_bumperThickness * 2.3, -centerOffset.y],
    [-centerOffset.x + eightball.PoolTable.s_bumperThickness * 4.5, -centerOffset.y + eightball.PoolTable.s_bumperThickness * 2],
    [-eightball.PoolTable.s_bumperThickness * 2.3, -centerOffset.y + eightball.PoolTable.s_bumperThickness * 2],
    [-eightball.PoolTable.s_bumperThickness * 1.5, -centerOffset.y]].reverse();

  side = new box2d.PolyDef();
  side.SetVertices(points);
  table.AddShape(side);

  // top right
  side = new box2d.PolyDef();
  points = new goog.math.Matrix(points).multiply(eightball.PoolTable.s_matrixFlipHorizontal).toArray().reverse();
  side.SetVertices(points);
  table.AddShape(side);

  // bottom right
  side = new box2d.PolyDef();
  points = new goog.math.Matrix(points).multiply(eightball.PoolTable.s_matrixFlipVertical).toArray();
  side.SetVertices(points);
  table.AddShape(side);

  // bottom left
  side = new box2d.PolyDef();
  points = new goog.math.Matrix(points).multiply(eightball.PoolTable.s_matrixFlipHorizontal).toArray().reverse();
  side.SetVertices(points);
  table.AddShape(side);

  table.userData = [eightball.PoolTable.s_bodyTypes.TABLE];
  return world.CreateBody(table);
};

/**
 @private
 @param {!box2d.World} world
 @param {!box2d.Vec2} centerOffset
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
 @param {!box2d.World} world
 @param {number} x
 @param {number} y
 */
eightball.PoolTable._createPocket = function(world, x, y) {
  var pocketSd = new box2d.CircleDef();
  pocketSd.radius = 7;

  var pocketBd = new box2d.BodyDef();
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
  BALL_HIT: 'ballHit',
  CUESTICK_HIT_START: 'CUESTICK_HIT_START',
  CUESTICK_HIT_STOP: 'CUESTICK_HIT_STOP'
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
  WHITE: 'rgb(232,208,176)',
  BOMBSHELL: 'rgb(40,37,29)',
  TIMER: 'rgb(178,55,17)'
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
