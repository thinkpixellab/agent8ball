function preload(images) {
  if (document.images) {
    var i = 0;
    var imageArray = new Array();
    imageArray = images.split(',');

    var imageObj = new Image();
    for (i = 0; i < imageArray.length; i++) {
      imageObj.src = imageArray[i];
    }
  }
}
