class MainController < ApplicationController
  include ActionView::Helpers::AssetTagHelper

  def raw
  end

  def compiled
  end

  def handle404
    render :status => 404
  end

  def assets
    assets = {}

    # images
    images = Dir.glob(File.join(Rails.root,'public','images','*'))
    images.map!{ |f| File.basename(f) }
    images = images.inject(Hash.new) do |h,i|
      entry = { File.basename(i,File.extname(i)) => tag_helper.image_path(i) }
      entry.merge(h)
    end
    assets[:images] = images

    # audios
    audios = Dir.glob(File.join(Rails.root,'public','audios','*'))
    audios.map!{ |f| File.basename(f) }
    assets[:audios] = audios.inject(Hash.new) do |h,i|
      entry = { File.basename(i,File.extname(i)) => tag_helper.audio_path(i) }
      entry.merge(h)
    end

    render :js => "var preloadAssets = #{assets.to_json}"
  end

  private
    def map_assets(type)
      map = Dir.glob(File.join(Rails.root,'public',type,'*'))
      map.map!{ |f| File.basename(f) }
      map.inject(Hash.new) do |h,i|
        entry = { File.basename(i,File.extname(i)) => tag_helper.audio_path(i) }
        entry.merge(h)
      end
    end
end
