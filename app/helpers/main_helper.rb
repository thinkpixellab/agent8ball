module MainHelper
  def game_js(debug = false)
    items = []

    asset_js = "var preloadAssets = #{assets_hash.to_json};"
    items << content_tag('script', asset_js, {'type' => Mime::JS}, escape = false)

    if debug
      items << content_tag('script', '', {'type' => Mime::JS, 'src' => '/javascripts/closure/closure/goog/base.js'})
      items << javascript_include_tag('deps', 'eightball/loader')
    else
      items << javascript_include_tag('compiled')
    end
    items.join("\n").html_safe
  end

  private

  def assets_hash
    assets = {}

    # images
    images = Dir.glob(File.join(Rails.root,'public','images','*'))
    images.map!{ |f| File.basename(f) }
    images = images.inject(Hash.new) do |h,i|
      entry = { File.basename(i,File.extname(i)) => image_path(i) }
      entry.merge(h)
    end
    assets[:images] = images

    # audios
    audios = Dir.glob(File.join(Rails.root,'public','audios','*'))
    audios.map!{ |f| File.basename(f) }

    audios_hash = {}
    audios.each do |audio|
      ext = File.extname(audio)
      name = File.basename(audio, ext)
      ext = ext[1,100] # strip the first char and keeps up to the next 100. Assume extensions aren't that long
      path = audio_path(audio)
      unless audios_hash[name]
        audios_hash[name] = []
      end
      audios_hash[name] << [path, Mime::Type.lookup_by_extension(ext).to_s]
    end
    assets[:audios] = audios_hash

    assets
  end

end
