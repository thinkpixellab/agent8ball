module MainHelper
  def game_js(debug = false)
    items = []

    asset_js = "var preloadAssets = #{assets_hash.to_json};"
    items << content_tag('script', asset_js, {'type' => Mime::JS}, escape = false)

    if debug
      items << content_tag('script', '', {'type' => Mime::JS, 'src' => '/javascripts/closure-library/closure/goog/base.js'})
      items << javascript_include_tag('deps', 'loader')
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
    assets[:audios] = audios.inject(Hash.new) do |h,i|
      entry = { File.basename(i,File.extname(i)) => audio_path(i) }
      entry.merge(h)
    end

    assets
  end

end
