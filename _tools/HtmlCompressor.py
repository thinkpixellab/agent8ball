import os
import shutil
from xml.dom import minidom
from Shared import *
import HtmlPost

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
  remove_if_exists(destination_file)
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
  def __init__(self, source_html, target_html, target_js, target_css):
    self.source = source_html
    self.target_js = target_js
    self.target_css = target_css
    self.target = target_html
  
  def compress(self):
    dom = minidom.parse(self.source)
    
    # find css
    css_elements = HtmlPost.getCSSElementsFromDom(dom)
    css_files = map(lambda e: e.getAttribute('href'), css_elements)
    for element in css_elements:
      # remove originals
      element.parentNode.removeChild(element)
    # concat, compress
    concat(css_files, self.target_css)
    
    css_element = dom.createElement('link')
    css_element.setAttribute('rel', 'stylesheet')
    css_element.setAttribute('type', 'text/css')
    css_element.setAttribute('href', self.target_css)
    
    # find js
    script_elements = HtmlPost.getScriptElementsFromDom(dom)
    # remove originals
    # remove all script references that are compiled
    for element in script_elements:
      HtmlPost.process_script_element(element)
    
    # concat, compress
    script_elements_w_src = filter(lambda e: e.hasAttribute('src'), script_elements)
    source_files = map(lambda e: e.getAttribute('src'), script_elements_w_src)
    concat(source_files, self.target_js)
    
    compiledElement = dom.createElement('script')
    compiledElement.setAttribute('src', self.target_js)
    
    head = dom.getElementsByTagName('head')[0]
    # append compressed css
    head.appendChild(css_element)
    # append compiled js
    head.appendChild(compiledElement)
    
    # write changed file to temp file
    
    self._tmp = get_tmp_file_name(self.source)
    writeXmlSansInstructions(dom, self._tmp)
    
    # compress html
    run_command(self.get_compress_args)
    HtmlPost.ensureHtmlElementsFromFile(self.target)
    remove_if_exists(self._tmp)
  
  
  def get_compress_args(self):
    args = html_compressor_args[:]
    args += ['--remove-intertag-spaces']
    
    tmp = get_tmp_file_name(self.source)
    args += ["-o", tmp]
    args += [self._tmp]
    return args, tmp, self.target
