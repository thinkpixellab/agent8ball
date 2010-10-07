class MainController < ApplicationController
  def handle404
    render :status => 404
  end
end
