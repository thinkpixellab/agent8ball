goog.provide('b2ContactFactory');

goog.require('b2CircleContact');
goog.require('b2PolyAndCircleContact');
goog.require('b2PolyContact');

b2ContactFactory.Create = function(shape1, shape2, allocator) {
  if (b2ContactFactory.s_initialized == false) {
    b2ContactFactory._InitializeRegisters();
    b2ContactFactory.s_initialized = true;
  }

  var type1 = shape1.m_type;
  var type2 = shape2.m_type;

  //b2Settings.b2Assert(b2Shape.e_unknownShape < type1 && type1 < b2Shape.e_shapeTypeCount);
  //b2Settings.b2Assert(b2Shape.e_unknownShape < type2 && type2 < b2Shape.e_shapeTypeCount);
  var createFcn = b2ContactFactory.s_registers[type1][type2].createFcn;
  if (createFcn) {
    if (b2ContactFactory.s_registers[type1][type2].primary) {
      return createFcn(shape1, shape2, allocator);
    } else {
      var c = createFcn(shape2, shape1, allocator);
      for (var i = 0; i < c.GetManifoldCount(); ++i) {
        var m = c.GetManifolds()[i];
        m.normal = m.normal.Negative();
      }
      return c;
    }
  } else {
    return null;
  }
};

b2ContactFactory.Destroy = function(contact, allocator) {
  if (contact.GetManifoldCount() > 0) {
    contact.m_shape1.m_body.WakeUp();
    contact.m_shape2.m_body.WakeUp();
  }

  var type1 = contact.m_shape1.m_type;
  var type2 = contact.m_shape2.m_type;

  //b2Settings.b2Assert(b2Shape.e_unknownShape < type1 && type1 < b2Shape.e_shapeTypeCount);
  //b2Settings.b2Assert(b2Shape.e_unknownShape < type2 && type2 < b2Shape.e_shapeTypeCount);
  var destroyFcn = b2ContactFactory.s_registers[type1][type2].destroyFcn;
  destroyFcn(contact, allocator);
};

/**
 @private
 */
b2ContactFactory._InitializeRegisters = function() {
  b2ContactFactory.s_registers = new Array(b2Shape.e_shapeTypeCount);
  for (var i = 0; i < b2Shape.e_shapeTypeCount; i++) {
    b2ContactFactory.s_registers[i] = new Array(b2Shape.e_shapeTypeCount);
    for (var j = 0; j < b2Shape.e_shapeTypeCount; j++) {
      b2ContactFactory.s_registers[i][j] = new b2ContactRegister();
    }
  }

  b2ContactFactory._AddType(b2CircleContact.Create, b2CircleContact.Destroy, b2Shape.e_circleShape, b2Shape.e_circleShape);
  b2ContactFactory._AddType(b2PolyAndCircleContact.Create, b2PolyAndCircleContact.Destroy, b2Shape.e_polyShape, b2Shape.e_circleShape);
  b2ContactFactory._AddType(b2PolyContact.Create, b2PolyContact.Destroy, b2Shape.e_polyShape, b2Shape.e_polyShape);

};

/**
 @private
 */
b2ContactFactory._AddType = function(createFcn, destroyFcn, type1, type2) {
  //b2Settings.b2Assert(b2Shape.e_unknownShape < type1 && type1 < b2Shape.e_shapeTypeCount);
  //b2Settings.b2Assert(b2Shape.e_unknownShape < type2 && type2 < b2Shape.e_shapeTypeCount);
  b2ContactFactory.s_registers[type1][type2].createFcn = createFcn;
  b2ContactFactory.s_registers[type1][type2].destroyFcn = destroyFcn;
  b2ContactFactory.s_registers[type1][type2].primary = true;

  if (type1 != type2) {
    b2ContactFactory.s_registers[type2][type1].createFcn = createFcn;
    b2ContactFactory.s_registers[type2][type1].destroyFcn = destroyFcn;
    b2ContactFactory.s_registers[type2][type1].primary = false;
  }
};

b2ContactFactory.s_registers = null;
b2ContactFactory.s_initialized = false;
