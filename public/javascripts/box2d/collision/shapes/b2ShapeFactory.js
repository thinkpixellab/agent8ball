
goog.provide('b2ShapeFactory');

goog.require('b2CircleShape');
goog.require('b2PolyShape');
goog.require('b2Shape');

/**
 @param {b2ShapeDef} def
 @param {b2Body} body
 @param {b2Vec2} center
 */
b2ShapeFactory.Create = function(def, body, center) {
  switch (def.type) {
  case b2Shape.e_circleShape:
    {
      //void* mem = body->m_world->m_blockAllocator.Allocate(sizeof(b2CircleShape));
      return new b2CircleShape(def, body, center);
    }

  case b2Shape.e_boxShape:
  case b2Shape.e_polyShape:
    {
      //void* mem = body->m_world->m_blockAllocator.Allocate(sizeof(b2PolyShape));
      return new b2PolyShape(def, body, center);
    }
  }

  //b2Settings.b2Assert(false);
  return null;
};
