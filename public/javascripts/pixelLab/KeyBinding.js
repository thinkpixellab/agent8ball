// uses jQuery methods: delay, fadeOut, stop
goog.provide('pixelLab.KeyBinding');

goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.dom');
goog.require('goog.style');

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
    entry['action'].call();
    event.stopPropagation();
    pixelLab.KeyBinding._alert(entry['description']);
  }
};

pixelLab.KeyBinding._alert = function(message) {
  var div = document.getElementById(pixelLab.KeyBinding.c_alertDivId);
  if (div) {
    $(div).stop(true, true);
  }
  div = document.createElement('div');
  goog.dom.setProperties(div, {
    'id': pixelLab.KeyBinding.c_alertDivId
  });
  goog.style.setStyle(div, {
    'z-index': 99,
    'position': 'fixed',
    'right': '10px',
    'top': '10px',
    'background': 'black',
    'color': 'white',
    'padding': '15px',
    'font-size': '40px',
    'font-family': 'monospace'
  });
  document.body.appendChild(div);

  goog.dom.setTextContent(div, message);
  $(div).delay(1000).fadeOut(500);
};

/*
 @const
 @type {string}
*/
pixelLab.KeyBinding.c_alertDivId = "KeyBindingAlertDiv";
