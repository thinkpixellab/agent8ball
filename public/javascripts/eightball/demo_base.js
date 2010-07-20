goog.require('goog.math.Matrix');



function createWorld() {
  function setupBalls(world) {
    var ballRadius = poolTable.ballDiameter * 2;

    for (var col = 0; col < 5; col++) {

      var ballCount = col + 1;
      var x = 0.5 * poolTable.width + col * ballRadius * Math.sqrt(3);
      var yStart = -col * ballRadius;

      for (var row = 0; row < ballCount; row++) {
        createBall(world, x, yStart + row * ballRadius * 2, ballRadius);
      }

    }
  }

  var matrixFlipHorizontal = new goog.math.Matrix([
    [-1, 0],
    [0, 1]]);

  var matrixFlipVertical = new goog.math.Matrix([
    [-1, 0],
    [0, -1]]);



  function createTable(world) {
    var table = new b2BodyDef();
    table.friction = 0.5;

    var side;
    var points;

    // Left
    side = new b2PolyDef();
    points = [
      [-centerOffset.x, -centerOffset.y + poolTable.bumperThickness * 2],
      [-centerOffset.x + poolTable.bumperThickness * 2, -centerOffset.y + poolTable.bumperThickness * 4],
      [-centerOffset.x + poolTable.bumperThickness * 2, centerOffset.y - poolTable.bumperThickness * 4],
      [-centerOffset.x, centerOffset.y - poolTable.bumperThickness * 2]];
    side.SetVertices(points);
    table.AddShape(side);

    // Right
    side = new b2PolyDef();
    points = new goog.math.Matrix(points).multiply(matrixFlipHorizontal).toArray().reverse();
    side.SetVertices(points);
    table.AddShape(side);

    // top left
    points = [
      [-centerOffset.x + poolTable.bumperThickness * 2, -centerOffset.y],
      [-centerOffset.x + poolTable.bumperThickness * 4, -centerOffset.y + poolTable.bumperThickness * 2],
      [-poolTable.bumperThickness * 2, -centerOffset.y + poolTable.bumperThickness * 2],
      [-poolTable.bumperThickness * 2, -centerOffset.y]].reverse();

    side = new b2PolyDef();
    side.SetVertices(points);
    table.AddShape(side);

    // top right
    side = new b2PolyDef();
    points = new goog.math.Matrix(points).multiply(matrixFlipHorizontal).toArray().reverse();
    side.SetVertices(points);
    table.AddShape(side);

    // bottom right
    side = new b2PolyDef();
    points = new goog.math.Matrix(points).multiply(matrixFlipVertical).toArray();
    side.SetVertices(points);
    table.AddShape(side);

    // bottom left
    side = new b2PolyDef();
    points = new goog.math.Matrix(points).multiply(matrixFlipHorizontal).toArray().reverse();
    side.SetVertices(points);
    table.AddShape(side);

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
