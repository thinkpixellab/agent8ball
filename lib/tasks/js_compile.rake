require File.expand_path('../../../config/application', __FILE__)
require 'rake'
require 'util'

module JsCompile
  def self.make_defs
    js_path = File.join(Rails.root, 'public', 'javascripts')
    closure_path = File.join(js_path, 'closure-library','closure')

    calcdeps_path = File.join(closure_path,'bin','calcdeps.py')

    sys_command = "python #{calcdeps_path}"

    sys_command << " -d #{closure_path} -o deps"

    app_path = File.join(js_path, 'application.js')
    sys_command << " -i #{app_path}"

    output_path = File.join(js_path, 'deps.js')

    ['box2d','eightball','helpers'].each do |files_dir|
      sys_command << " -p #{File.join(js_path, files_dir)}"
    end

    sys_command << " --output_file=#{output_path}"

    #python path-to-closure-library/closure/bin/calcdeps.py -i path-to-your-src/requirements.js -o deps -d path-to-closure-library/closure/ -p path-to-your-src/ --output_file=path-to-your-src/deps.js

    puts sys_command
    `#{sys_command}`
  end

  def self.work
    dir = 'box2d'

    prototype_lite_path = File.join(Rails.root, 'public','javascripts','prototype_lite.js')
    goog_base_path = File.join(Rails.root, 'public','javascripts','closure-library','closure','goog','base.js')

    js_dir = File.join(Rails.root, 'public','javascripts')
    files = Util.get_js_dir(dir)
    files.collect!{ |file_name| File.join(js_dir, file_name)}

    compile(dir, files, [goog_base_path, prototype_lite_path])
  end

  def self.compile(output_prefix, js_file_paths, dependencies = [])
    compiler_jar_path = File.join(Rails.root, 'vendor/jars/closure_compiler/compiler.jar')
    compiled_output_path = File.join(Rails.root, 'tmp/js_concat/', "#{output_prefix}_#{Time.now.strftime('%Y%m%d-%H%M%S')}.js")

    sys_command = "java -jar #{compiler_jar_path}"

    js_file_paths.each do |file|
      sys_command << " --js #{file}"
    end

    dependencies.each do |file|
      sys_command << " --externs #{file}"
    end

    sys_command << " --js_output_file #{compiled_output_path} --compilation_level ADVANCED_OPTIMIZATIONS --summary_detail_level 3 --debug true --warning_level VERBOSE --manage_closure_dependencies true"

    # look at tree
    # sys_command << "  --js_output_file #{compiled_output_path}.tree --compilation_level ADVANCED_OPTIMIZATIONS --print_tree true"

    # easy way to see help
    # sys_command = "java -jar #{compiler_jar_path} --help"

    puts sys_command.inspect
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
  JsCompile.make_defs
end
