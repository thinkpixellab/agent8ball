class ApplicationController < ActionController::Base
  protect_from_forgery

  def tag_helper
    @taghelper ||= TagHelper.new(self, self.config)
  end

  class TagHelper
    def initialize(controller, config)
      @controller = controller
      @config = config
    end

    def controller
      @controller
    end

    def config
      @config
    end

    include ActionView::Helpers::TagHelper
    include ActionView::Helpers::AssetTagHelper
  end
end
