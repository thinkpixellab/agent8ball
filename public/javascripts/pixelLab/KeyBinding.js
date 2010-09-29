goog.provide('pixelLab.KeyBinding');

goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');

/**
 @constructor
 */
pixelLab.KeyBinding = function() {
  this.m_keyHandler = new goog.events.KeyHandler(document);

  this.m_map = {};

  goog.events.listen(this.m_keyHandler, goog.events.KeyHandler.EventType.KEY, goog.bind(this._handleKey, this));
};

pixelLab.KeyBinding.prototype.add = function(keyCode, description, action) {
  this.m_map[keyCode] = {
    'description': description,
    'action': action
  };
};

pixelLab.KeyBinding.prototype._handleKey = function(event) {
  var entry = this.m_map[event.keyCode];
  if (entry) {
    entry['action']();
  }
};
