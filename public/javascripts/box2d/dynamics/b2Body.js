/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

goog.provide('b2Body');
goog.require('b2Mat22');
goog.require('b2Vec2');
goog.require('b2Math');
goog.require('b2MassData');
goog.require('b2ShapeFactory');

// A rigid body. Internal computation are done in terms
// of the center of mass position. The center of mass may
// be offset from the body's origin.
/** 
 @constructor 
 @param {!b2BodyDef} bd
 @param {!b2World} world
 */
b2Body = function(bd, world) {
  /**
   @private
   @type {!b2Mat22}
   */
  this.sMat0 = new b2Mat22();
  /**
   @private
   @type {!b2Vec2}
   */
  this.m_position = new b2Vec2();
  this.m_position.SetV(bd.position);
  /**
   @private
   @type {!b2Vec2}
   */
  this.m_position0 = new b2Vec2();
  this.m_position0.SetV(this.m_position);

  var i = 0;
  var sd;
  var massData;

  /**
   @private
   @type {number}
   */
  this.m_flags = 0;
  /**
   @private
   @type {number}
   */
  this.m_rotation = bd.rotation;
  this.m_R = new b2Mat22(0);
  this.m_R.Set(this.m_rotation);
  this.m_rotation0 = this.m_rotation;
  this.m_world = world;

  this.m_linearDamping = b2Math.b2Clamp(1.0 - bd.linearDamping, 0.0, 1.0);
  this.m_angularDamping = b2Math.b2Clamp(1.0 - bd.angularDamping, 0.0, 1.0);

  /**
   @private
   @type {!b2Vec2}
   */
  this.m_force = new b2Vec2(0.0, 0.0);
  /**
   @private
   @type {number}
   */
  this.m_torque = 0.0;

  /**
   @private
   @type {number}
   */
  this.m_mass = 0.0;

  var massDatas = new Array(b2Settings.b2_maxShapesPerBody);
  for (i = 0; i < b2Settings.b2_maxShapesPerBody; i++) {
    massDatas[i] = new b2MassData();
  }

  // Compute the shape mass properties, the bodies total mass and COM.
  this.m_shapeCount = 0;
  this.m_center = new b2Vec2(0.0, 0.0);
  for (i = 0; i < b2Settings.b2_maxShapesPerBody; ++i) {
    sd = bd.shapes[i];
    if (sd == null) break;
    massData = massDatas[i];
    sd.ComputeMass(massData);
    this.m_mass += massData.mass;
    //this.m_center += massData->mass * (sd->localPosition + massData->center);
    this.m_center.x += massData.mass * (sd.localPosition.x + massData.center.x);
    this.m_center.y += massData.mass * (sd.localPosition.y + massData.center.y);
    ++this.m_shapeCount;
  }

  // Compute center of mass, and shift the origin to the COM.
  if (this.m_mass > 0.0) {
    this.m_center.Multiply(1.0 / this.m_mass);
    this.m_position.Add(b2Math.b2MulMV(this.m_R, this.m_center));
  } else {
    this.m_flags |= b2Body.e_staticFlag;
  }

  // Compute the moment of inertia.
  this.m_I = 0.0;
  for (i = 0; i < this.m_shapeCount; ++i) {
    sd = bd.shapes[i];
    massData = massDatas[i];
    this.m_I += massData.I;
    var r = b2Math.SubtractVV(b2Math.AddVV(sd.localPosition, massData.center), this.m_center);
    this.m_I += massData.mass * b2Math.b2Dot(r, r);
  }

  if (this.m_mass > 0.0) {
    this.m_invMass = 1.0 / this.m_mass;
  } else {
    this.m_invMass = 0.0;
  }

  if (this.m_I > 0.0 && bd.preventRotation == false) {
    this.m_invI = 1.0 / this.m_I;
  } else {
    this.m_I = 0.0;
    this.m_invI = 0.0;
  }

  // Compute the center of mass velocity.
  /**
   @private
   @type {!b2Vec2}
   */
  this.m_linearVelocity = b2Math.AddVV(bd.linearVelocity, b2Math.b2CrossFV(bd.angularVelocity, this.m_center));
  this.m_angularVelocity = bd.angularVelocity;

  this.m_jointList = null;
  this.m_contactList = null;
  this.m_prev = null;
  this.m_next = null;

  // Create the shapes.
  this.m_shapeList = null;
  for (i = 0; i < this.m_shapeCount; ++i) {
    sd = bd.shapes[i];
    var shape = b2ShapeFactory.Create(sd, this, this.m_center);
    shape.m_next = this.m_shapeList;
    this.m_shapeList = shape;
  }

  this.m_sleepTime = 0.0;
  if (bd.allowSleep) {
    this.m_flags |= b2Body.e_allowSleepFlag;
  }
  if (bd.isSleeping) {
    this.m_flags |= b2Body.e_sleepFlag;
  }

  if ((this.m_flags & b2Body.e_sleepFlag) || this.m_invMass == 0.0) {
    this.m_linearVelocity.Set(0.0, 0.0);
    this.m_angularVelocity = 0.0;
  }

  this.m_userData = bd.userData;
};

// Set the position of the body's origin and rotation (radians).
// This breaks any contacts and wakes the other bodies.
b2Body.prototype.SetOriginPosition = function(position, rotation) {
  if (this.IsFrozen()) {
    return;
  }

  this.m_rotation = rotation;
  this.m_R.Set(this.m_rotation);
  this.m_position = b2Math.AddVV(position, b2Math.b2MulMV(this.m_R, this.m_center));

  this.m_position0.SetV(this.m_position);
  this.m_rotation0 = this.m_rotation;

  for (var s = this.m_shapeList; s != null; s = s.m_next) {
    s.Synchronize(this.m_position, this.m_R, this.m_position, this.m_R);
  }

  this.m_world.m_broadPhase.Commit();
};

// Get the position of the body's origin. The body's origin does not
// necessarily coincide with the center of mass. It depends on how the
// shapes are created.
b2Body.prototype.GetOriginPosition = function() {
  return b2Math.SubtractVV(this.m_position, b2Math.b2MulMV(this.m_R, this.m_center));
};

// Set the position of the body's center of mass and rotation (radians).
// This breaks any contacts and wakes the other bodies.
b2Body.prototype.SetCenterPosition = function(position, rotation) {
  if (this.IsFrozen()) {
    return;
  }

  this.m_rotation = rotation;
  this.m_R.Set(this.m_rotation);
  this.m_position.SetV(position);

  this.m_position0.SetV(this.m_position);
  this.m_rotation0 = this.m_rotation;

  for (var s = this.m_shapeList; s != null; s = s.m_next) {
    s.Synchronize(this.m_position, this.m_R, this.m_position, this.m_R);
  }

  this.m_world.m_broadPhase.Commit();
};

// Get the position of the body's center of mass. The body's center of mass
// does not necessarily coincide with the body's origin. It depends on how the
// shapes are created.
b2Body.prototype.GetCenterPosition = function() {
  return this.m_position;
};

// Get the rotation in radians.
b2Body.prototype.GetRotation = function() {
  return this.m_rotation;
};

b2Body.prototype.GetRotationMatrix = function() {
  return this.m_R;
};

// Set/Get the angular velocity.
b2Body.prototype.SetAngularVelocity = function(w) {
  this.m_angularVelocity = w;
};
b2Body.prototype.GetAngularVelocity = function() {
  return this.m_angularVelocity;
};

// Apply a force at a world point. Additive.
b2Body.prototype.ApplyForce = function(force, point) {
  if (this.IsSleeping() == false) {
    this.m_force.Add(force);
    this.m_torque += b2Math.b2CrossVV(b2Math.SubtractVV(point, this.m_position), force);
  }
};

// Apply a torque. Additive.
b2Body.prototype.ApplyTorque = function(torque) {
  if (this.IsSleeping() == false) {
    this.m_torque += torque;
  }
};

// Apply an impulse at a point. This immediately modifies the velocity.
b2Body.prototype.ApplyImpulse = function(impulse, point) {
  if (this.IsSleeping() == false) {
    this.m_linearVelocity.Add(b2Math.MulFV(this.m_invMass, impulse));
    this.m_angularVelocity += (this.m_invI * b2Math.b2CrossVV(b2Math.SubtractVV(point, this.m_position), impulse));
  }
};

b2Body.prototype.GetMass = function() {
  return this.m_mass;
};

b2Body.prototype.GetInertia = function() {
  return this.m_I;
};

// Get the world coordinates of a point give the local coordinates
// relative to the body's center of mass.
b2Body.prototype.GetWorldPoint = function(localPoint) {
  return b2Math.AddVV(this.m_position, b2Math.b2MulMV(this.m_R, localPoint));
};

// Get the world coordinates of a vector given the local coordinates.
b2Body.prototype.GetWorldVector = function(localVector) {
  return b2Math.b2MulMV(this.m_R, localVector);
};

// Returns a local point relative to the center of mass given a world point.
b2Body.prototype.GetLocalPoint = function(worldPoint) {
  return b2Math.b2MulTMV(this.m_R, b2Math.SubtractVV(worldPoint, this.m_position));
};

// Returns a local vector given a world vector.
b2Body.prototype.GetLocalVector = function(worldVector) {
  return b2Math.b2MulTMV(this.m_R, worldVector);
};

// Is this body static (immovable)?
b2Body.prototype.IsStatic = function() {
  return (this.m_flags & b2Body.e_staticFlag) == b2Body.e_staticFlag;
};

b2Body.prototype.IsFrozen = function() {
  return (this.m_flags & b2Body.e_frozenFlag) == b2Body.e_frozenFlag;
};

// Is this body sleeping (not simulating).
b2Body.prototype.IsSleeping = function() {
  return (this.m_flags & b2Body.e_sleepFlag) == b2Body.e_sleepFlag;
};

// You can disable sleeping on this particular body.
b2Body.prototype.AllowSleeping = function(flag) {
  if (flag) {
    this.m_flags |= b2Body.e_allowSleepFlag;
  } else {
    this.m_flags &= ~b2Body.e_allowSleepFlag;
    this.WakeUp();
  }
};

// Wake up this body so it will begin simulating.
b2Body.prototype.WakeUp = function() {
  this.m_flags &= ~b2Body.e_sleepFlag;
  this.m_sleepTime = 0.0;
};

// Get the list of all shapes attached to this body.
b2Body.prototype.GetShapeList = function() {
  return this.m_shapeList;
};

b2Body.prototype.GetContactList = function() {
  return this.m_contactList;
};

b2Body.prototype.GetJointList = function() {
  return this.m_jointList;
};

// Get the next body in the world's body list.
b2Body.prototype.GetNext = function() {
  return this.m_next;
};

b2Body.prototype.GetUserData = function() {
  return this.m_userData;
};

// does not support destructors
/*~b2Body(){
  b2Shape* s = this.m_shapeList;
  while (s)
  {
    b2Shape* s0 = s;
    s = s->this.m_next;

    b2Shape::this.Destroy(s0);
  }
}*/

b2Body.prototype.Destroy = function() {
  var s = this.m_shapeList;
  while (s) {
    var s0 = s;
    s = s.m_next;

    b2Shape.Destroy(s0);
  }
};

b2Body.prototype.SynchronizeShapes = function() {
  //b2Mat22 R0(this.m_rotation0);
  this.sMat0.Set(this.m_rotation0);
  for (var s = this.m_shapeList; s != null; s = s.m_next) {
    s.Synchronize(this.m_position0, this.sMat0, this.m_position, this.m_R);
  }
};

b2Body.prototype.QuickSyncShapes = function() {
  for (var s = this.m_shapeList; s != null; s = s.m_next) {
    s.QuickSync(this.m_position, this.m_R);
  }
};

// This is used to prevent connected bodies from colliding.
// It may lie, depending on the collideConnected flag.
b2Body.prototype.IsConnected = function(other) {
  for (var jn = this.m_jointList; jn != null; jn = jn.next) {
    if (jn.other == other) return jn.joint.m_collideConnected == false;
  }

  return false;
};

b2Body.prototype.Freeze = function() {
  this.m_flags |= b2Body.e_frozenFlag;
  this.m_linearVelocity.SetZero();
  this.m_angularVelocity = 0.0;

  for (var s = this.m_shapeList; s != null; s = s.m_next) {
    s.DestroyProxy();
  }
};

/**
 @param {!b2Vec2} v
 */
b2Body.prototype.SetLinearVelocity = function(v) {
  this.m_linearVelocity.SetV(v);
};
/**
 @return {!b2Vec2}
 */
b2Body.prototype.GetLinearVelocity = function() {
  return this.m_linearVelocity;
};

/**
 @const
 @type {number}
 */
b2Body.e_staticFlag = 0x0001;
/**
 @const
 @type {number}
 */
b2Body.e_frozenFlag = 0x0002;
/**
 @const
 @type {number}
 */
b2Body.e_islandFlag = 0x0004;
/**
 @const
 @type {number}
 */
b2Body.e_sleepFlag = 0x0008;
/**
 @const
 @type {number}
 */
b2Body.e_allowSleepFlag = 0x0010;
/**
 @const
 @type {number}
 */
b2Body.e_destroyFlag = 0x0020;
