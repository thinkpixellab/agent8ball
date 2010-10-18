#!/usr/bin/env python

import os
import sys
import glob
from _tools.Closure import Closure
import _tools.HtmlPost
from _tools.HtmlCompressor import HtmlCompressor, CssCompressor

js_path = os.path.join('public', 'javascripts')

closure_path = os.path.join(js_path, 'closure-library','closure')

externs = os.path.join(js_path, 'externs', '*.js')
externs = glob.glob(externs)

loader_js_path = os.path.join(js_path, 'loader.js')
deps_path = os.path.join(js_path, 'deps.js')

application_js_path = os.path.join(js_path, 'application.js')
compiled_path = os.path.join(js_path, "compiled.js")

js_dirs = map(lambda x: os.path.join(js_path, x), ['box2d','eightball','pixelLab'])

Closure(
  closure_path = closure_path,
  application_js_path = loader_js_path,
  closure_dependencies = js_dirs + [loader_js_path, application_js_path],
  deps_js_path = deps_path,
  compiled_js_path = compiled_path,
  extern_files = externs,
).deps_and_compile(debug = False)
