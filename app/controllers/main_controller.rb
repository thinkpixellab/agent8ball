class MainController < ApplicationController
  def raw
  end

  def handle404
    render :status => 404
  end
end
