goog.provide('b2JointFactory');

goog.require('b2RevoluteJoint');
goog.require('b2PrismaticJoint');
goog.require('b2MouseJoint');
goog.require('b2DistanceJoint');
goog.require('b2PulleyJoint');
goog.require('b2GearJoint');

b2JointFactory.Create = function(def, allocator) {
  var joint = null;

  switch (def.type) {
  case b2Joint.e_distanceJoint:
    {
      //void* mem = allocator->Allocate(sizeof(b2DistanceJoint));
      joint = new b2DistanceJoint(def);
    }
    break;

  case b2Joint.e_mouseJoint:
    {
      //void* mem = allocator->Allocate(sizeof(b2MouseJoint));
      joint = new b2MouseJoint(def);
    }
    break;

  case b2Joint.e_prismaticJoint:
    {
      //void* mem = allocator->Allocate(sizeof(b2PrismaticJoint));
      joint = new b2PrismaticJoint(def);
    }
    break;

  case b2Joint.e_revoluteJoint:
    {
      //void* mem = allocator->Allocate(sizeof(b2RevoluteJoint));
      joint = new b2RevoluteJoint(def);
    }
    break;

  case b2Joint.e_pulleyJoint:
    {
      //void* mem = allocator->Allocate(sizeof(b2PulleyJoint));
      joint = new b2PulleyJoint(def);
    }
    break;

  case b2Joint.e_gearJoint:
    {
      //void* mem = allocator->Allocate(sizeof(b2GearJoint));
      joint = new b2GearJoint(def);
    }
    break;

  default:
    //b2Settings.b2Assert(false);
    break;
  }

  return joint;
};
b2JointFactory.Destroy = function(joint, allocator) {
  /*joint->~b2Joint();
    switch (joint.m_type)
    {
    case b2Joint.e_distanceJoint:
      allocator->Free(joint, sizeof(b2DistanceJoint));
      break;

    case b2Joint.e_mouseJoint:
      allocator->Free(joint, sizeof(b2MouseJoint));
      break;

    case b2Joint.e_prismaticJoint:
      allocator->Free(joint, sizeof(b2PrismaticJoint));
      break;

    case b2Joint.e_revoluteJoint:
      allocator->Free(joint, sizeof(b2RevoluteJoint));
      break;

    case b2Joint.e_pulleyJoint:
      allocator->Free(joint, sizeof(b2PulleyJoint));
      break;

    case b2Joint.e_gearJoint:
      allocator->Free(joint, sizeof(b2GearJoint));
      break;

    default:
      b2Assert(false);
      break;
    }*/
};
