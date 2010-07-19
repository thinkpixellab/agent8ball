function createWorld() {
  function setupBalls(world){
    var ballRadius = poolTable.ballDiameter * 2;

    for(var col=0;col<5;col++){

      var ballCount = col+1;
      var x = 1.5 * poolTable.width + col * ballRadius * Math.sqrt(3);
      var yStart = 2 * poolTable.bumperThickness + poolTable.height - col * ballRadius;

      for(var row=0;row<ballCount;row++){
        createBall(world, x, yStart + row * ballRadius*2, ballRadius);
      }

    }
  }

  function createTable(world) {
    var sideLeft = new b2BoxDef();
    sideLeft.extents.Set(poolTable.bumperThickness, poolTable.height);
    sideLeft.localPosition.Set(poolTable.bumperThickness, poolTable.height+poolTable.bumperThickness*2);

    var sideRight = new b2BoxDef();
    sideRight.extents.Set(poolTable.bumperThickness, poolTable.height);
    sideRight.localPosition.Set(poolTable.width*2+poolTable.bumperThickness*3, poolTable.height+poolTable.bumperThickness*2);

    var sideTop = new b2BoxDef();
    sideTop.extents.Set(poolTable.width, poolTable.bumperThickness);
    sideTop.localPosition.Set(poolTable.width+poolTable.bumperThickness*2, poolTable.bumperThickness)

    var sideBottom = new b2BoxDef();
    sideBottom.extents.Set(poolTable.width, poolTable.bumperThickness);
    sideBottom.localPosition.Set(poolTable.width+poolTable.bumperThickness*2, poolTable.height*2+poolTable.bumperThickness*3)

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
