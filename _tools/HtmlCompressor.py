import os
import shutil
from Shared import *

current_file_dir = os.path.relpath(os.path.dirname(__file__))

html_compressor_jar_path = os.path.join(current_file_dir, 'htmlcompressor-0.9.1.jar')
html_compressor_args = ['java', '-jar', html_compressor_jar_path]

yui_compressor_jar_path = os.path.join(current_file_dir, 'yuicompressor-2.4.2.jar')
yui_compressor_args = ['java', '-jar', yui_compressor_jar_path]

def concat(source_files, destination_file):
  # create a tmp file
  tmp_file_path = get_tmp_file_name(destination_file)
  
  destination = open(tmp_file_path,'wb')
  
  # append, append, append
  for source_file in source_files:
    shutil.copyfileobj(open(source_file,'rb'), destination)
  
  destination.close();
  
  # move to destination file
  os.rename(tmp_file_path, destination_file)

class CssCompressor:
  def __init__(self, sources, target):
    self.sources = sources
    self.target = target
  
  def compress(self):
    
    # concat
    self.concat_source = "css_all.css"
    concat(self.sources, "css_all.css")
    
    #compress
    run_command(self.get_compress_args)
  
  def get_compress_args(self):
    args = yui_compressor_args[:]
    args += ['--verbose']
    
    tmp_file_path = get_tmp_file_name(self.target)
    args += ["-o", tmp_file_path]
    args += [self.concat_source]
    return args, tmp_file_path, self.target

class HtmlCompressor:
  def __init__(self, source, target):
    self.source = source
    self.target = target
  
  def compress(self):
    run_command(self.get_compress_args)
  
  def get_compress_args(self):
    args = html_compressor_args[:]
    args += ['--remove-intertag-spaces']
    
    tmp_file_path = get_tmp_file_name(self.target)
    args += ["-o", tmp_file_path]
    args += [self.source]
    return args, tmp_file_path, self.target
