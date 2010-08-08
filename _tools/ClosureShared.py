#!/usr/bin/env python

import sys
import os
import fnmatch

def make_deps(calcdeps_py_path, deps_js_path, closure_path, js_dirs):
  
  command = ['python']
  command += [calcdeps_py_path]
  
  command += ["--output_file", deps_js_path]
  command += ["--d", closure_path]
  command += ["-o", "deps"]
  
  for js_dir in js_dirs:
    command += ["-p", js_dir]
  
  return command

def get_closure_base(jar_path):
  return ["java", "-jar", jar_path]

def get_closure_inputs(closure_path, js_files, extern_files):
  command_inputs = []
  
  for file in get_goog_js_files(closure_path):
    command_inputs += ["--js", file]
  
  for file in js_files:
    command_inputs += ["--js", file]
  
  for file in extern_files:
    command_inputs += ["--externs", file]
  
  command_inputs += ["--manage_closure_dependencies", "true"]
  return command_inputs

def get_goog_js_files(closure_path):
  files = []
  # add js files in goog dir, without files in demos
  for file in find_files(closure_path, '*.js'):
    if(file.find('demos') == -1):
      files.append(file)
  return files

def get_command_with_inputs(jar_path, closure_path, js_files, extern_files):
  return get_closure_base(jar_path) + get_closure_inputs(closure_path, js_files, extern_files)

def compile(jar_path, closure_path, js_files, extern_files, compiled_js_path, debug=False):
  command = get_command_with_inputs(jar_path, closure_path, js_files, extern_files)
  
  command += ["--compilation_level", "ADVANCED_OPTIMIZATIONS"] # SIMPLE_OPTIMIZATIONS
  command += ["--summary_detail_level", "3"]
  command += ["--warning_level", "VERBOSE"]
  # make sure everything is in a good order
  command += ["--jscomp_dev_mode", "EVERY_PASS"]
  command += ["--js_output_file", compiled_js_path]
  
  if(debug):
    # debug makes var names readable, but was causing weirdness..
    command += ["--debug", "true"]
    command += ["--formatting", "PRETTY_PRINT"]
    command += ["--formatting", "PRINT_INPUT_DELIMITER"]
  
  return command

def find_files(directory, pattern):
    for root, dirs, files in os.walk(directory):
        for basename in files:
            if fnmatch.fnmatch(basename, pattern):
                filename = os.path.join(root, basename)
                yield filename

def print_help(jar_path):
  command = get_closure_base(jar_path)
  command.append("--help")
  return command
