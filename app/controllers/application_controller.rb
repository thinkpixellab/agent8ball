class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :right_domain

  private
    def right_domain
      if request.subdomain.present? && !%(beta).include?(request.subdomain)
        redirect_to 'http://agent8ball.com', :status => :moved_permanently
      end
    end
end
