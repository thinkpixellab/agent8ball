// uses jQuery methods: delay, fadeOut, stop
goog.provide('pixelLab.KeyBinding');

goog.require('goog.dom');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.style');

/**
 @constructor
 @param {boolean=} opt_skipStyles
 */
pixelLab.KeyBinding = function(opt_skipStyles) {
  this.m_keyHandler = new goog.events.KeyHandler(document);

  this.m_map = {};

  this.m_useStyles = !opt_skipStyles;

  goog.events.listen(this.m_keyHandler, goog.events.KeyHandler.EventType.KEY, goog.bind(this._handleKey, this));
};

pixelLab.KeyBinding.prototype.add = function(keyCode, description, action) {
  if (goog.array.contains(pixelLab.KeyBinding.c_reservedKeyCodes, keyCode)) {
    throw new Error("The specified keyCode is reserved - " + keyCode);
  }

  this.m_map[keyCode] = {
    'description': description,
    'action': action
  };
};

pixelLab.KeyBinding.prototype._handleKey = function(event) {
  if (! (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey)) {
    var entry = this.m_map[event.keyCode];
    if (entry) {
      entry['action'].call();
      event.stopPropagation();
      this._alert(entry['description']);
    }
  } else {
    if (! (event.ctrlKey || event.altKey || event.metaKey)) {
      if (event.keyCode == goog.events.KeyCodes.QUESTION_MARK || event.keyCode == goog.events.KeyCodes.SLASH) {
        event.stopPropagation();
        this._alert("HELP!!");
      }
    }
  }
};

pixelLab.KeyBinding.prototype._alert = function(message) {
  var div = document.getElementById(pixelLab.KeyBinding.c_alertDivId);
  if (div) {
    jQuery(div).stop(true, true).show();
  } else {
    div = document.createElement('div');
    goog.dom.setProperties(div, {
      'id': pixelLab.KeyBinding.c_alertDivId
    });
  }
  if (this.m_useStyles) {
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
  }
  document.body.appendChild(div);

  goog.dom.setTextContent(div, message);
  jQuery(div).delay(1000).fadeOut(500);
};

/*
 @const
 @type {string}
*/
pixelLab.KeyBinding.c_alertDivId = "KeyBindingAlertDiv";

pixelLab.KeyBinding.c_reservedKeyCodes = [goog.events.KeyCodes.QUESTION_MARK, goog.events.KeyCodes.SLASH];
