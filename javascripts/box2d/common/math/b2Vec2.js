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

goog.provide('b2Vec2');

// b2Vec2 has no constructor so that it
// can be placed in a union.
/**
 @constructor
 @param {number=} x_
 @param {number=} y_
*/
var b2Vec2 = function(x_, y_) {

  if(x_ === undefined){
    x_ = 0;
  }
  /** @type {number} */
  this.x = x_;

  if(y_ === undefined){
    y_ = 0;
  }
  /** @type {number} */
  this.y = y_;
};

b2Vec2.prototype.SetZero = function() {
  this.x = 0.0;
  this.y = 0.0;
};

/** @param {number} x_
 @param {number} y_ */
b2Vec2.prototype.Set = function(x_, y_) {
  this.x = x_;
  this.y = y_;
};

/** @param {b2Vec2} v */
b2Vec2.prototype.SetV = function(v) {
  this.x = v.x;
  this.y = v.y;
};

/** @return {b2Vec2} */
b2Vec2.prototype.Negative = function() {
  return new b2Vec2(-this.x, -this.y);
};

/** @return {b2Vec2} */
b2Vec2.prototype.Copy = function() {
  return new b2Vec2(this.x, this.y);
};

/** @param {b2Vec2} v */
b2Vec2.prototype.Add = function(v) {
  this.x += v.x;
  this.y += v.y;
};

/** @param {b2Vec2} v */
b2Vec2.prototype.Subtract = function(v) {
  this.x -= v.x;
  this.y -= v.y;
};

/** @param {number} a */
b2Vec2.prototype.Multiply = function(a) {
  this.x *= a;
  this.y *= a;
};

/** @param {b2Mat22} A */
b2Vec2.prototype.MulM = function(A) {
  var tX = this.x;
  this.x = A.col1.x * tX + A.col2.x * this.y;
  this.y = A.col1.y * tX + A.col2.y * this.y;
};

/** @param {b2Mat22} A */
b2Vec2.prototype.MulTM = function(A) {
  var tX = b2Math.b2Dot(this, A.col1);
  this.y = b2Math.b2Dot(this, A.col2);
  this.x = tX;
};

/** @param {number} s */
b2Vec2.prototype.CrossVF = function(s) {
  var tX = this.x;
  this.x = s * this.y;
  this.y = -s * tX;
};

/** @param {number} s */
b2Vec2.prototype.CrossFV = function(s) {
  var tX = this.x;
  this.x = -s * this.y;
  this.y = s * tX;
};

/** @param {b2Vec2} b */
b2Vec2.prototype.MinV = function(b) {
  this.x = this.x < b.x ? this.x : b.x;
  this.y = this.y < b.y ? this.y : b.y;
};

/** @param {b2Vec2} b */
b2Vec2.prototype.MaxV = function(b) {
  this.x = this.x > b.x ? this.x : b.x;
  this.y = this.y > b.y ? this.y : b.y;
};

b2Vec2.prototype.Abs = function() {
  this.x = Math.abs(this.x);
  this.y = Math.abs(this.y);
};

/** @return {number} */
b2Vec2.prototype.Length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

/** @return {number} */
b2Vec2.prototype.Normalize = function() {
  var length = this.Length();
  if (length < Number.MIN_VALUE) {
    return 0.0;
  }
  var invLength = 1.0 / length;
  this.x *= invLength;
  this.y *= invLength;

  return length;
};

/** @return {boolean} */
b2Vec2.prototype.IsValid = function() {
  return b2Math.b2IsValid(this.x) && b2Math.b2IsValid(this.y);
};

/**
 @param {number} x_
 @param {number} y_
 @return {b2Vec2} */
b2Vec2.Make = function(x_, y_) {
  return new b2Vec2(x_, y_);
};
