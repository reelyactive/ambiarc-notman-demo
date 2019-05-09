/**
 * Copyright reelyActive 2018-2019
 * We believe in an open Internet of Things
 */


const DEFAULT_MAP_LABEL_FILE = 'map/geodata.json';
const DEFAULT_EXTERIOR_NAME = { floorName: "Exterior" };
const EXTERIOR_KEY_ID = 'EXT';
const TOP_COLOUR = "#033851";
const BOTTOM_COLOUR = "#83bbd3";
const ZOOM_INCREMENT = 0.2;
const ZOOM_DURATION = 0.5;
const ROTATE_DEGREES = 30;
const ROTATE_DURATION = 0.5;


var ambiarc;
var focusBuildingId;
var focusFloorId;
var isCameraMoving = false;


// Ambiarc iframe loaded: initiate all map functionality
var iframeLoaded = function() {
  $("#ambiarcIframe")[0].contentWindow.document.addEventListener(
                                         'AmbiarcAppInitialized', function() {
    ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;

    var url = window.location.protocol + '//' + window.location.hostname +
              (window.location.port ? ':'+window.location.port: '') +
              window.location.pathname;

    ambiarc.setMapAssetBundleURL(url);
    ambiarc.loadMap(config.mapName);
    ambiarc.registerForEvent(ambiarc.eventLabel.FinishedLoadingMap,
                             handleMapLoaded);

    $('#controls-section').fadeIn();
  });
};


// Map loaded: complete all initialisations
function handleMapLoaded() {
  ambiarc.setSkyColor(TOP_COLOUR, BOTTOM_COLOUR);
  ambiarc.setMapTheme(ambiarc.mapTheme.light);
  ambiarc.hideLoadingScreen();

  establishHierarchy(function(hierarchy) {
    let building = hierarchy[0];
    focusBuildingId = hierarchy[0].id;
    initiateFloorSelector(building);
  });

  initiateControls();
  initiateMapEventHandlers();
}


// Initiate the floor selector
function initiateFloorSelector(building) {
  let floorSelect = document.querySelector('#floorSelector');

  building.floors.forEach(function(element, index) {
    let option = document.createElement('a');
    let floorId = element.id;
    option.text = element.floorName;
    option.setAttribute('class', 'dropdown-item');
    floorSelect.appendChild(option);

    option.addEventListener('click', function() {
      ambiarc.focusOnFloor(focusBuildingId, floorId);
    });
  });
}


// Initiate the map controls
function initiateControls() {
  let zoomIn = document.querySelector('#zoom-in');
  let zoomOut = document.querySelector('#zoom-out');
  let rotateLeft = document.querySelector('#rotate-left');
  let rotateRight = document.querySelector('#rotate-right');

  zoomIn.addEventListener('mousedown', function() {
    ambiarc.zoomCamera(ZOOM_INCREMENT, ZOOM_DURATION);
  });
  zoomOut.addEventListener('mousedown', function() {
    ambiarc.zoomCamera(-ZOOM_INCREMENT, ZOOM_DURATION);
  });
  rotateLeft.addEventListener('mousedown', function() {
    ambiarc.rotateCamera(ROTATE_DEGREES, ROTATE_DURATION);
  });
  rotateRight.addEventListener('mousedown', function() {
    ambiarc.rotateCamera(-ROTATE_DEGREES, ROTATE_DURATION);
  });
}


// Initiate map event handlers
function initiateMapEventHandlers() {

  // Floor selected: update focus floor
  ambiarc.registerForEvent(ambiarc.eventLabel.FloorSelected, function(event) {
    focusBuildingId = event.detail.buildingId;
    focusFloorId = event.detail.floorId;
  });

  // Camera motion started
  ambiarc.registerForEvent(ambiarc.eventLabel.CameraMotionStarted,
                           function(event) { isCameraMoving = true; });

  // Camera motion completed
  ambiarc.registerForEvent(ambiarc.eventLabel.CameraMotionCompleted,
                           function(event) { isCameraMoving = false; });
}


// Establish the hierarchy of buildings and floors
function establishHierarchy(callback) {
  ambiarc.getAllBuildings(function(buildings) {
    let hierarchy = [];
    for(var cBuilding = 0; cBuilding < buildings.length; cBuilding++) {
      let buildingId = buildings[cBuilding];
      let exteriorKey = buildingId + '::' + EXTERIOR_KEY_ID;
      let exteriorName = config.floorsNameHolders[exteriorKey] ||
                         DEFAULT_EXTERIOR_NAME;
      let building = { id: buildingId,
                       floors: [ { floorName: exteriorName, id: null } ] };

      ambiarc.getAllFloors(buildingId, function(floors) {
        for(let cFloor = 0; cFloor < floors.length; cFloor++) {
          let floorId = floors[cFloor].id;
          let floorKey = buildingId + '::' + floorId;
          let floorName = config.floorsNameHolders[floorKey] ||
                          floors[cFloor].positionName;
          floors[cFloor].floorName = floorName;
          building.floors.push(floors[cFloor]);
        }
      });  
      hierarchy.push(building);        
    }
    return callback(hierarchy);
  });
}
