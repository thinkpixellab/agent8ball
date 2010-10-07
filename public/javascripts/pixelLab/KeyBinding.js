goog.provide('pixelLab.KeyBinding');
goog.provide('pixelLab.KeyBindingEvent');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.KeyboardShortcutHandler');
goog.require('goog.ui.KeyboardShortcutHandler.EventType');

/**
 @constructor
 @extends {goog.events.EventTarget}
 @param {boolean=} opt_skipStyles
 */
pixelLab.KeyBinding = function(opt_skipStyles) {
  goog.events.EventTarget.call(this);
  this.m_shortcutHandler = new goog.ui.KeyboardShortcutHandler(document);
  this.m_map = [];

  this.m_useStyles = !opt_skipStyles;

  goog.events.listen(
      this.m_shortcutHandler,
      goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED,
      goog.bind(this._handleKey, this));
};
goog.inherits(pixelLab.KeyBinding, goog.events.EventTarget);

/**
 @param {!string} keybinding
 @param {!string} description
 @param {function():void} action
 */
pixelLab.KeyBinding.prototype.add = function(keybinding, description, action) {
  var indexStr = this.m_map.length.toString();
  this.m_shortcutHandler.registerShortcut(indexStr, keybinding);
  this.m_map.push({
    'shortcut': keybinding,
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
  var result = entry['action'].call();
  event.stopPropagation();
  var description = result || entry['description'];
  this.dispatchEvent(new pixelLab.KeyBindingEvent(entry['shortcut'], description));
};

/*
 @const
 @type {!string}
*/
pixelLab.KeyBinding.TYPE = 'KeyBindingEvent';

/**
 @constructor
 @extends {goog.events.Event}
*/
pixelLab.KeyBindingEvent = function(keybinding, description) {
  goog.events.Event.call(this, pixelLab.KeyBinding.TYPE);
  this.keybinding = keybinding;
  this.description = description;
};
goog.inherits(pixelLab.KeyBindingEvent, goog.events.Event);
