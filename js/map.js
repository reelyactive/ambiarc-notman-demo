/**
 * Copyright reelyActive 2018-2019
 * We believe in an open Internet of Things
 */


const DEFAULT_MAP_LABEL_FILE = 'map/geodata.json';
const DEFAULT_EXTERIOR_NAME = { floorName: "Exterior" };
const EXTERIOR_KEY_ID = 'EXT';


var ambiarc;
var focusBuildingId;
var focusFloorId;


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
  ambiarc.setSkyColor("#033851", "#0770a2");
  ambiarc.setLightColor("#a0a0a0", "#a0a0a0", "#a0a0a0");
  ambiarc.setMapTheme(ambiarc.mapTheme.light);
  ambiarc.hideLoadingScreen();

  let navigation = document.querySelector('#navigation');
  navigation.removeAttribute('hidden');

  establishHierarchy(function(hierarchy) {
    let building = hierarchy[0];
    focusBuildingId = hierarchy[0].id;
    let floorSelect = document.querySelector('#bldg-floor-select');

    building.floors.forEach(function(element, index) {
      let option = document.createElement('option');
      option.value = element.id;
      option.text = element.floorName;
      floorSelect.add(option, null);
    });

    floorSelect.addEventListener('change', function() {
      focusFloorId = floorSelect.value;
      ambiarc.focusOnFloor(focusBuildingId, focusFloorId);
    });
  });

  let zoomIn = document.querySelector('#zoom-in');
  let zoomOut = document.querySelector('#zoom-out');
  let rotateLeft = document.querySelector('#rotate-left');
  let rotateRight = document.querySelector('#rotate-right');

  zoomIn.addEventListener('mousedown', function() {
    ambiarc.zoomCamera(0.2, 0.5);
  });
  zoomOut.addEventListener('mousedown', function() {
    ambiarc.zoomCamera(-0.2, 0.5);
  });
  rotateLeft.addEventListener('mousedown', function() {
    ambiarc.rotateCamera(30, 0.5);
  });
  rotateRight.addEventListener('mousedown', function() {
    ambiarc.rotateCamera(-30, 0.5);
  });
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
