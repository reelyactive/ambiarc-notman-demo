/**
 * Copyright reelyActive 2019
 * We believe in an open Internet of Things
 */


// Constant definitions
const DEFAULT_SOCKET_URL = 'https://notman.hyloco.info/';
const RAINDROP_COLOUR = { r: 1, g: 0.4118, b: 0 };
const RAINDROP_DURATION = 4;


// Non-disappearance events
beaver.on([ 0, 1, 2, 3 ], function(raddec) {
  if(ambiarc && focusBuildingId && focusFloorId && !isCameraMoving) {
    createRaindrop(raddec);
  }
});

// Create the raindrop, if on the focus floor
function createRaindrop(raddec) {
  let strongestReceiverId = raddec.rssiSignature[0].receiverId;
  let raddecFloorId;
  let lat;
  let lon;

  switch(strongestReceiverId) {
    case '001bc509408100df':
      raddecFloorId = 'L003';
      lat = 45.51192;
      lon = -73.57042;
      break;
    case '001bc5094081010c':
      raddecFloorId = 'L003';
      lat = 45.51210;
      lon = -73.57034;
      break;
    case '001bc509408100dc':
      raddecFloorId = 'L002';
      lat = 45.51193;
      lon = -73.57042;
      break;
    case '001bc509408100dd':
      raddecFloorId = 'L002';
      lat = 45.51201;
      lon = -73.57038;
      break;
    case '001bc509408100de':
      raddecFloorId = 'L002';
      lat = 45.51210;
      lon = -73.57034;
      break;
    case '001bc509408100d9':
      raddecFloorId = 'L001';
      lat = 45.51193;
      lon = -73.57042;
      break;
    case '001bc509408100da':
      raddecFloorId = 'L001';
      lat = 45.51201;
      lon = -73.57038;
      break;
    case '001bc509408100db':
      raddecFloorId = 'L001';
      lat = 45.51210;
      lon = -73.57034;
      break;
  }

  if(raddecFloorId === focusFloorId) {
    ambiarc.addRaindrop(lat, lon, focusBuildingId, raddecFloorId,
                        RAINDROP_COLOUR, RAINDROP_DURATION);
  }
}


let socket = io.connect(DEFAULT_SOCKET_URL);
beaver.listen(socket, true);
