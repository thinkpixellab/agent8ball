from Shared import *

current_file_dir = os.path.relpath(os.path.dirname(__file__))
html_compressor_jar_path = os.path.join(current_file_dir, 'htmlcompressor-0.9.1.jar')

class HtmlCompressor:
  def __init__(self, source, target):
    self.source = source
    self.target = target
  
  def compress(self):
    run_command(self.get_compress_args)

  def get_compress_args(self):
    args = get_compressor_base_argrs()
    args += ['--remove-intertag-spaces']

    tmp_file_path = get_tmp_file_name(self.target)
    args += ["-o", tmp_file_path]
    args += [self.source]
    return args, tmp_file_path, self.target

def get_compressor_base_argrs():
  return ['java', '-jar', html_compressor_jar_path]

