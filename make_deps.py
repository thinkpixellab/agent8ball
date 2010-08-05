#!/usr/bin/env python

import sys
import os
import fnmatch
import subprocess
import logging
from _tools import ClosureShared

js_path = "javascripts"
closure_path = os.path.join(js_path, 'closure-library','closure')
application_js_path = os.path.join(js_path, 'application.js')
js_dirs = map(lambda dir: os.path.join(js_path, dir), ['box2d','eightball','helpers'])

# deps
calcdeps_py_path = os.path.join(closure_path, "bin", "calcdeps.py")
deps_js_path = os.path.join(js_path, "deps.js")

# compile
compiled_js_path = os.path.join(js_path, "compiled.js")
jar_path = os.path.join('_tools', 'closure_compiler', 'compiler.jar')
extern_dir = os.path.join(js_path, 'externs')

def make_deps():
  return ClosureShared.make_deps(calcdeps_py_path, deps_js_path, closure_path, application_js_path, js_dirs)

def compile(debug=False):
  js_files = get_js_files()
  
  extern_files = []
  for file in ClosureShared.find_files(extern_dir, '*.js'):
    extern_files.append(file)
  
  return ClosureShared.compile(jar_path, closure_path, js_files, extern_files, compiled_js_path, debug)

def get_js_files():
  files = []
  
  # add all js files in each of js_dirs
  for js_dir in js_dirs:
    for file in ClosureShared.find_files(js_dir, '*.js'):
      files.append(file)
  
  files.append(os.path.join(js_path, 'application.js'))
  return files

def print_help():
  return ClosureShared.print_help(jar_path)

def main():
  logging.basicConfig(format='%(message)s', level=logging.INFO)
  args = compile()
  logging.info('Running the following command: %s', ' '.join(args))
  proc = subprocess.Popen(args, stdout=subprocess.PIPE)
  (stdoutdata, stderrdata) = proc.communicate()
  if proc.returncode != 0:
    logging.error('JavaScript compilation failed.')
    sys.exit(1)
  else:
    sys.stdout.write(stdoutdata)

if __name__ == '__main__':
  main()