// a line to make the builder happy
goog.provide('eightball.Cookies');

goog.require('goog.net.cookies');

/*
  @param {string} name
  @param {string=} opt_value
*/
eightball.Cookies.set = function(name, opt_value) {
  if (opt_value === undefined) {
    goog.net.cookies.remove(name);
  }
  else {
    goog.net.cookies.set(name, opt_value, 60 * 60 * 24 * 365 * 10);
  }
  eightball.Cookies._clean();
};

/**
 @private
*/
eightball.Cookies._clean = function() {
  goog.array.forEach(goog.net.cookies.getKeys(), function(cookieName,i,a) {
    if (!goog.object.containsValue(eightball.Cookies.Keys, cookieName)) {
      goog.net.cookies.remove(cookieName);
    }
  });
};

/**
 @const
 @enum {string}
 */
eightball.Cookies.Keys = {
  SOUND_EFFECTS: 's',
  MUSIC: 'm',
  HIGH_SCORE: 'h'
};

/**
 @const
 @enum {string|undefined}
 */
eightball.Cookies.CookieOnOffEnum = {
  ON: undefined,
  OFF: '0'
};
