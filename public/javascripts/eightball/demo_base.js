function createWorld() {
  function setupBalls(world){
    var ballRadius = 12;

    for(var col=0;col<5;col++){

      var ballCount = col+1;
      var x = 1.5 * tableWidth + col * ballRadius * Math.sqrt(3);
      var yStart = 2 * tableBumperThickness + tableHeight - col * ballRadius;

      for(var row=0;row<ballCount;row++){
        createBall(world, x, yStart + row * ballRadius*2, ballRadius);
      }

    }
  }

  function createTable(world) {
    var sideLeft = new b2BoxDef();
    sideLeft.extents.Set(tableBumperThickness, tableHeight);
    sideLeft.localPosition.Set(tableBumperThickness, tableHeight+tableBumperThickness*2);

    var sideRight = new b2BoxDef();
    sideRight.extents.Set(tableBumperThickness, tableHeight);
    sideRight.localPosition.Set(tableWidth*2+tableBumperThickness*3, tableHeight+tableBumperThickness*2);

    var sideTop = new b2BoxDef();
    sideTop.extents.Set(tableWidth, tableBumperThickness);
    sideTop.localPosition.Set(tableWidth+tableBumperThickness*2, tableBumperThickness)

    var sideBottom = new b2BoxDef();
    sideBottom.extents.Set(tableWidth, tableBumperThickness);
    sideBottom.localPosition.Set(tableWidth+tableBumperThickness*2, tableHeight*2+tableBumperThickness*3)

    var table = new b2BodyDef();
    table.AddShape(sideLeft);
    table.AddShape(sideRight);
    table.AddShape(sideTop);
    table.AddShape(sideBottom);

    return world.CreateBody(table);
  }

  var worldAABB = new b2AABB();
  worldAABB.minVertex.Set(-1000, -1000);
  worldAABB.maxVertex.Set(1000, 1000);
  var gravity = new b2Vec2(0, 0);
  var doSleep = true;
  var world = new b2World(worldAABB, gravity, doSleep);

  createTable(world);
  setupBalls(world);

  return world;
}
