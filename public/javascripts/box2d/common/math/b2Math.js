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

var b2Math = {
  b2IsValid: function(x) {
    return isFinite(x);
  },
  b2Dot: function(a, b) {
    return a.x * b.x + a.y * b.y;
  },
  b2CrossVV: function(a, b) {
    return a.x * b.y - a.y * b.x;
  },
  b2CrossVF: function(a, s) {
    var v = new b2Vec2(s * a.y, -s * a.x);
    return v;
  },
  b2CrossFV: function(s, a) {
    var v = new b2Vec2(-s * a.y, s * a.x);
    return v;
  },
  b2MulMV: function(A, v) {
    var u = new b2Vec2(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
    return u;
  },
  b2MulTMV: function(A, v) {
    var u = new b2Vec2(b2Math.b2Dot(v, A.col1), b2Math.b2Dot(v, A.col2));
    return u;
  },
  AddVV: function(a, b) {
    var v = new b2Vec2(a.x + b.x, a.y + b.y);
    return v;
  },
  SubtractVV: function(a, b) {
    var v = new b2Vec2(a.x - b.x, a.y - b.y);
    return v;
  },
  MulFV: function(s, a) {
    var v = new b2Vec2(s * a.x, s * a.y);
    return v;
  },
  AddMM: function(A, B) {
    var C = new b2Mat22(0, b2Math.AddVV(A.col1, B.col1), b2Math.AddVV(A.col2, B.col2));
    return C;
  },
  b2MulMM: function(A, B) {
    var C = new b2Mat22(0, b2Math.b2MulMV(A, B.col1), b2Math.b2MulMV(A, B.col2));
    return C;
  },
  b2MulTMM: function(A, B) {
    var c1 = new b2Vec2(b2Math.b2Dot(A.col1, B.col1), b2Math.b2Dot(A.col2, B.col1));
    var c2 = new b2Vec2(b2Math.b2Dot(A.col1, B.col2), b2Math.b2Dot(A.col2, B.col2));
    var C = new b2Mat22(0, c1, c2);
    return C;
  },
  b2Abs: function(a) {
    return a > 0.0 ? a : -a;
  },
  b2AbsV: function(a) {
    var b = new b2Vec2(b2Math.b2Abs(a.x), b2Math.b2Abs(a.y));
    return b;
  },
  b2AbsM: function(A) {
    var B = new b2Mat22(0, b2Math.b2AbsV(A.col1), b2Math.b2AbsV(A.col2));
    return B;
  },
  b2Min: function(a, b) {
    return a < b ? a : b;
  },
  b2MinV: function(a, b) {
    var c = new b2Vec2(b2Math.b2Min(a.x, b.x), b2Math.b2Min(a.y, b.y));
    return c;
  },
  b2Max: function(a, b) {
    return a > b ? a : b;
  },
  b2MaxV: function(a, b) {
    var c = new b2Vec2(b2Math.b2Max(a.x, b.x), b2Math.b2Max(a.y, b.y));
    return c;
  },
  b2Clamp: function(a, low, high) {
    return b2Math.b2Max(low, b2Math.b2Min(a, high));
  },
  b2ClampV: function(a, low, high) {
    return b2Math.b2MaxV(low, b2Math.b2MinV(a, high));
  },
  b2Swap: function(a, b) {
    var tmp = a[0];
    a[0] = b[0];
    b[0] = tmp;
  },
  b2Random: function() {
    return Math.random() * 2 - 1;
  },
  b2NextPowerOfTwo: function(x) {
    x |= (x >> 1) & 0x7FFFFFFF;
    x |= (x >> 2) & 0x3FFFFFFF;
    x |= (x >> 4) & 0x0FFFFFFF;
    x |= (x >> 8) & 0x00FFFFFF;
    x |= (x >> 16) & 0x0000FFFF;
    return x + 1;
  },
  b2IsPowerOfTwo: function(x) {
    var result = x > 0 && (x & (x - 1)) == 0;
    return result;
  }
};
