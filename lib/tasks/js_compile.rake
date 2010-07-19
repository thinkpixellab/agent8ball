require File.expand_path('../../../config/application', __FILE__)
require 'rake'
require 'util'

module JsCompile
  def self.work
    dir = 'eightball'
    tmp_file = Util.create_temp_file('js_concat')

    prototype_dir = File.join(Rails.root, 'public','javascripts','prototype-1.7rc2.js')

    concat(dir, tmp_file)
    compile(tmp_file, [prototype_dir])
  end

  def self.concat(dir, temp_file)
    js_dir = File.join(Rails.root, 'public','javascripts')
    files = Util.get_js_dir(dir)
    files.collect!{ |file_name| File.join(js_dir, file_name)}

    files.each do |file_name|
      File.open(file_name) do |file|
        temp_file << file.read
        temp_file.flush
      end
    end

    temp_file.rewind
  end

  def self.compile(concat_tmp_file, dependencies = [])
    compiler_jar_path = File.join(Rails.root, 'vendor/jars/closure_compiler/compiler.jar')
    compiled_output_path = concat_tmp_file.path + "_compiled.js"

    sys_command =
    "java -jar #{compiler_jar_path} --js #{concat_tmp_file.path} --js_output_file #{compiled_output_path} --compilation_level SIMPLE_OPTIMIZATIONS --summary_detail_level 3"

    dependencies.each do |file|
      sys_command << " --externs #{file}"
    end

    `#{sys_command}`
  end

end

namespace :js do
  desc 'Concat and compile the local javascript'
  task :compile do
    JsCompile.work
  end
end

if(__FILE__ == $0)
  JsCompile.work
end