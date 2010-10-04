// uses jQuery methods: delay, fadeOut, stop
goog.provide('pixelLab.KeyBinding');

goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.ui.KeyboardShortcutHandler');
goog.require('goog.ui.KeyboardShortcutHandler.EventType');

/**
 @constructor
 @param {boolean=} opt_skipStyles
 */
pixelLab.KeyBinding = function(opt_skipStyles) {
  this.m_shortcutHandler = new goog.ui.KeyboardShortcutHandler(document);
  this.m_map = [];
  this.add('h', 'help!', goog.nullFunction);

  this.m_useStyles = !opt_skipStyles;

  goog.events.listen(
      this.m_shortcutHandler,
      goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED,
      goog.bind(this._handleKey, this));
};

/**
 @param {!string} keybinding
 @param {!string} description
 @param {function():void} action
 */
pixelLab.KeyBinding.prototype.add = function(keybinding, description, action) {
  var indexStr = this.m_map.length.toString();
  this.m_shortcutHandler.registerShortcut(indexStr, keybinding);
  this.m_map.push({
    'description': description,
    'action': action
  });
};

/*
  @privae
  @param {!goog.ui.KeyboardShortcutEvent} event
*/
pixelLab.KeyBinding.prototype._handleKey = function(event) {
  var number = new Number(event.identifier);
  var entry = this.m_map[number];
  entry['action'].call();
  event.stopPropagation();
  this._alert(entry['description']);
};

/*
  @privae
  @param {!message} message
*/
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
 @private
 @const
 @type {string}
*/
pixelLab.KeyBinding.c_alertDivId = 'KeyBindingAlertDiv';
