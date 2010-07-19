var initId = 0;
var world = createWorld();
var ctx;
var canvasWidth;
var canvasHeight;

function setupWorld(did) {
  if (!did) did = 0;
  world = createWorld();
  initId += did;
  initId %= demos.InitWorlds.length;
  if (initId < 0) initId = demos.InitWorlds.length + initId;
  demos.InitWorlds[initId](world);
}

function setupPrevWorld() { setupWorld(-1); }

function step(cnt) {
  var stepping = false;
  var timeStep = 1.0/60;
  var iteration = 1;
  world.Step(timeStep, iteration);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawWorld(world, ctx);
  setTimeout('step(' + (cnt || 0) + ')', 10);
}

Event.observe(window, 'load', function() {
  var demoElementName = 'demo_canvas';
  var canvasElm = $(demoElementName);
  if(canvasElm){

    setupWorld();
    ctx = canvasElm.getContext('2d');

    canvasWidth = canvasElm.getLayout().get('width');
    canvasHeight = canvasElm.getLayout().get('height');

    Event.observe(demoElementName, 'click', function(e) {

      if (Math.random() < 0.5) 
        demos.top.createBall(world, e.offsetX, e.offsetY);
      else 
        createBox(world, e.offsetX, e.offsetY, 10, 10, false);
    });
    Event.observe(demoElementName, 'contextmenu', function(e) {
      if (e.preventDefault) e.preventDefault();
      setupPrevWorld();
      return false;
    });
    step();
  }
});
