class MainController < ApplicationController
  def raw
  end
  
  def compiled
  end
  
  def handle404
    render :status => 404
  end
end
