require 'tempfile'

module Util
  def self.get_js_dir(dir)
    full_dir = File.join(Rails.root, 'public','javascripts', dir)
    files_yaml = File.join(full_dir, '_files.yaml')
    data = YAML.load(File.read(files_yaml))
    files = data[:files]
    files.collect!{ |file| File.join(dir,file) }
  end

end
