#!/usr/bin/env python

from _tools.fixjsstyle import *

fix_js_style('public/javascripts', ['deps.js', 'compiled.js', 'jquery-1.4.3.min.js'], ['closure-library', 'externs'])
