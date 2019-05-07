// Simulated data for testing
setInterval(function() {
  if(!focusBuildingId || !focusFloorId) { return; }
  let colour = { r: 1, g: 0.4118, b: 0 };
  ambiarc.addRaindrop(45.51199, -73.57038, focusBuildingId, focusFloorId,
                      colour, 4);
}, 2000);

setInterval(function() {
  if(!focusBuildingId || !focusFloorId) { return; }
  let colour = { r: 1, g: 0.4118, b: 0 };
  ambiarc.addRaindrop(45.51209, -73.57034, focusBuildingId, focusFloorId,
                      colour, 4);
}, 2400);

setInterval(function() {
  if(!focusBuildingId || !focusFloorId) { return; }
  let colour = { r: 1, g: 0.4118, b: 0 };
  ambiarc.addRaindrop(45.51191, -73.57041, focusBuildingId, focusFloorId,
                      colour, 4);
}, 1600);
