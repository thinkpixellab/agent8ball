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

goog.provide('b2Contact');

goog.require('b2ContactNode');
goog.require('b2ContactRegister');

/**
 @constructor
 */
b2Contact = function(s1, s2) {
  // initialize instance variables for references
  this.m_node1 = new b2ContactNode();
  this.m_node2 = new b2ContactNode();
  //
  this.m_flags = 0;

  if (!s1 || !s2) {
    this.m_shape1 = null;
    this.m_shape2 = null;
    return;
  }

  this.m_shape1 = s1;
  this.m_shape2 = s2;

  this.m_manifoldCount = 0;

  this.m_friction = Math.sqrt(this.m_shape1.m_friction * this.m_shape2.m_friction);
  this.m_restitution = b2Math.b2Max(this.m_shape1.m_restitution, this.m_shape2.m_restitution);

  this.m_prev = null;
  this.m_next = null;

  this.m_node1.contact = null;
  this.m_node1.prev = null;
  this.m_node1.next = null;
  this.m_node1.other = null;

  this.m_node2.contact = null;
  this.m_node2.prev = null;
  this.m_node2.next = null;
  this.m_node2.other = null;
};

b2Contact.prototype = {
  GetManifolds: function() {
    return null;
  },
  GetManifoldCount: function() {
    return this.m_manifoldCount;
  },

  GetNext: function() {
    return this.m_next;
  },

  GetShape1: function() {
    return this.m_shape1;
  },

  GetShape2: function() {
    return this.m_shape2;
  },

  //--------------- Internals Below -------------------
  // this.m_flags
  // enum
  //virtual ~b2Contact() {}
  Evaluate: function() {},

  m_flags: 0,

  // World pool and list pointers.
  m_prev: null,
  m_next: null,

  // Nodes for connecting bodies.
  m_node1: new b2ContactNode(),
  m_node2: new b2ContactNode(),

  m_shape1: null,
  m_shape2: null,

  m_manifoldCount: 0,

  // Combined friction
  m_friction: null,
  m_restitution: null
};
b2Contact.e_islandFlag = 0x0001;
b2Contact.e_destroyFlag = 0x0002;
