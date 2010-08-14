#!/usr/bin/env python

import os
from _tools.ClosureShared import Closure

js_path = "javascripts"
closure_path = os.path.join(js_path, 'closure-library','closure')
application_js_path = os.path.join(js_path, 'application.js')
js_dirs = map(lambda dir: os.path.join(js_path, dir), ['box2d','eightball','helpers'])

closure = Closure(
  application_js_path = application_js_path,
  closure_dependencies = js_dirs + [application_js_path],
  deps_js_path = os.path.join(js_path, "deps.js"),
  compiled_js_path = os.path.join(js_path, "compiled.js"),
  extern_dir = os.path.join(js_path, 'externs')
)

closure.build()
