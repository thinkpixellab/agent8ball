#!/usr/bin/env python

import os
from _tools.ClosureShared import Closure

js_path = "javascripts"
closure_path = os.path.join(js_path, 'closure-library','closure')
application_js_path = os.path.join(js_path, 'application.js')
js_dirs = map(lambda dir: os.path.join(js_path, dir), ['box2d','eightball','helpers'])
closure_dependencies = js_dirs + [application_js_path]

# deps
calcdeps_py_path = os.path.join(closure_path, "bin", "calcdeps.py")
deps_js_path = os.path.join(js_path, "deps.js")

# compile
compiled_js_path = os.path.join(js_path, "compiled.js")
jar_path = os.path.join('_tools', 'closure_compiler', 'compiler.jar')
extern_dir = os.path.join(js_path, 'externs')

closure = Closure(
  closure_path = closure_path,
  application_js_path = application_js_path,
  closure_dependencies = js_dirs + [application_js_path],
  calcdeps_py_path = calcdeps_py_path,
  deps_js_path = os.path.join(js_path, "deps.js"),
  compiled_js_path = os.path.join(js_path, "compiled.js"),
  extern_dir = os.path.join(js_path, 'externs')
)

closure.build()
