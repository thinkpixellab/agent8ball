// a line to make the builder happy
goog.provide('eightball.Cookies');

goog.require('goog.net.cookies');

/*
  @param {String} name
  @param {String} value
*/
eightball.Cookies.set = function(name, value){
  goog.net.cookies.set(name, value, 60*60*24*365*10);
};
