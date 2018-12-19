/**
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */


DEFAULT_SOCKET_URL = 'https://pareto.reelyactive.com/';
DEFAULT_MIN_SESSION_DURATION = 4000;
DEFAULT_MAX_SESSION_DURATION = 86400000;
DEFAULT_BEAVER_OPTIONS = {
  disappearanceMilliseconds: 60000,
  retainEventProperties: [ 'event', 'time', 'deviceId', 'deviceTags',
                           'deviceUrl', 'rssi', 'receiverTags',
                           'receiverDirectory', 'receiverUrl', 'sessionId',
                           'sessionDuration', 'isPerson', 'passedFilters' ],
  maintainDirectories: true,
  observeOnlyFiltered: true,
  filters: {
    minSessionDuration: DEFAULT_MIN_SESSION_DURATION,
    maxSessionDuration: DEFAULT_MAX_SESSION_DURATION
  }
};
NUMBER_OF_DIRECTORIES = 3;
BUILDING_ID = 'B00001';
HEATMAP_FLOOR_ID = 'L003';
HEATMAP_RADIUS = 10;
HEATMAP_CREATION_DELAY_MILLISECONDS = 1000;
OCCUPANCY_FLOOR_ID = 'L002';
OCCUPANCY_OFFSET = 3;
PEOPLE_ASSETS_FLOOR_ID = 'L001';
PEOPLE_ASSETS_OFFSET = 6;
TRACKING_FLOOR_ID = 'L004';
TRACKING_OFFSET = 9;
MAX_NAME_LENGTH = 16;
LOADING_NAME = 'Fetching...';
LOADING_IMAGE = 'images/loading.jpg';


/**
 * discover-ambiarc Module
 * All of the JavaScript specific to the discover-ambiarc app is contained
 * inside this angular module.  The only external dependencies are:
 * - beaver, cormorant, ambiarc, examples (reelyActive)
 */
angular.module('discover-ambiarc', [ 'reelyactive.beaver',
                                     'reelyactive.cormorant',
                                     'reelyactive.ambiarc',
                                     'reelyactive.examples' ])

  /**
   * Config
   * Enable HTML5 mode.
   */
  .config(function($locationProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  })


  /**
   * MapCtrl Controller
   * Handles the manipulation of all variables accessed by the HTML view.
   */
  .controller('MapCtrl', function($scope, $location, $timeout, beaver,
                                  cormorant, ambiarcService, examples) {
    const token = $location.search().token;
    const example = $location.search().example;
    const options = { query: { token: token } };
    var socket;
    var ambiarc;
    var stories = cormorant.getStories();
    var devices = beaver.getDevices();
    var directories = beaver.getDirectories();
    var directoryNames = [];
    var trackedDeviceId;
    var isHeatmapCreated = false;
    var baseUrl = $location.protocol() + '://' + $location.host() + ':' +
                  $location.port() + $location.path();

    // Variables accessible in the HTML scope
    $scope.url = DEFAULT_SOCKET_URL;
    $scope.trackedDevices = [];
    $scope.trackedDeviceId;
    $scope.bubbleImage = LOADING_IMAGE;
    $scope.bubbleTitle = LOADING_NAME;
    $scope.showBubble = false;
    $scope.mapLoaded = false;

    ambiarcService.load(function(ambiarcInstance) {
      ambiarc = ambiarcInstance;

      ambiarcService.onMapLoaded({}, function() {
        $scope.mapLoaded = true;

        ambiarcService.buildPOIs(function(pois) {
          $scope.pois = pois;
        });
      });

      ambiarc.registerForEvent(ambiarc.eventLabel.MapLabelSelected,
                               updatePeopleAssetsBubble);

      $scope.showHeatmap = function() {
        cleanupPreviousMode();
        $scope.isHeatmap = true;
        isHeatmapCreated = false;
        ambiarc.focusOnFloor(BUILDING_ID, HEATMAP_FLOOR_ID);
      };

      $scope.showOccupancy = function() {
        cleanupPreviousMode();
        $scope.isOccupancy = true;
        ambiarc.focusOnFloor(BUILDING_ID, OCCUPANCY_FLOOR_ID);
      };

      $scope.showPeopleAssets = function() {
        cleanupPreviousMode();
        $scope.isPeopleAssets = true;
        ambiarc.focusOnFloor(BUILDING_ID, PEOPLE_ASSETS_FLOOR_ID);
      };

      $scope.showTracking = function() {
        cleanupPreviousMode();
        $scope.isTracking = true;
        ambiarc.focusOnFloor(BUILDING_ID, TRACKING_FLOOR_ID);
      };

      $scope.updateTrackedDevice = function(device) {
        trackedDeviceId = device.deviceId;
        $scope.bubbleImage = device.image;
        $scope.bubbleTitle = device.name;
        $scope.bubbleSubtitle = 'is being tracked';
        $scope.showBubble = true;
        updateTracking(trackedDeviceId,
                       devices[trackedDeviceId].event.receiverDirectory);
      };

      function cleanupPreviousMode() {
        if($scope.isHeatmap) {
          ambiarc.destroyHeatmap();
        }
        $scope.isHeatmap = false;
        $scope.isOccupancy = false;
        $scope.isPeopleAssets = false;
        $scope.isTracking = false;
        $scope.showBubble = false;
      }

      $scope.$apply();
    });

    // Connect to WebSocket if token provided
    if(token) {
      socket = io.connect(DEFAULT_SOCKET_URL, options);
      socket.on('connect', function() {
        console.log('discover-ambiarc connected to', DEFAULT_SOCKET_URL);
      });
    }

    // Generate example if token absent
    else {
      examples.generate(example);
      socket = examples;
    }

    beaver.listen(socket, DEFAULT_BEAVER_OPTIONS);
    beaver.on('appearance', handleEvent);
    beaver.on('displacement', handleEvent);
    beaver.on('disappearance', handleEvent);

    // Handle the event
    function handleEvent(event) {
      if(event.deviceTags && Array.isArray(event.deviceTags) &&
         (event.deviceTags.indexOf('track') >= 0)) {
        updateTrackedDevices(event.deviceId, event.deviceUrl);
      }
      if($scope.pois && (directoryNames.length < NUMBER_OF_DIRECTORIES) &&
         (directoryNames.indexOf(event.receiverDirectory) < 0)) {
        addDirectory(event.receiverDirectory, event.receiverUrl);
      }
      if($scope.isHeatmap) {
        ambiarc.getCurrentFloor(function(currentFloor) {
          if(currentFloor.id === HEATMAP_FLOOR_ID) {
            if(isHeatmapCreated) {
              ambiarc.updateHeatmap(generateHeatmapPoints());
            }
            else {
              $timeout(function() {
                ambiarc.createHeatmap(generateHeatmapPoints());
                isHeatmapCreated = true;
              }, HEATMAP_CREATION_DELAY_MILLISECONDS);
            }
          }
        });
      }
      if($scope.isOccupancy) {
        updateOccupancy();
      }
      if($scope.isPeopleAssets) {
        updatePeopleAssets();
      }
      if($scope.isTracking) {
        updateTracking(event.deviceId, event.receiverDirectory);
      }
    }

    // Update tracked devices, fetching story if required
    function updateTrackedDevices(deviceId, url) {
      if(stories.hasOwnProperty(url)) {
        var isAlreadyTracked = false;
        for(var cDevice = 0; cDevice < $scope.trackedDevices.length;
            cDevice++) {
          var device = $scope.trackedDevices[cDevice];
          if(!devices.hasOwnProperty(device.deviceId)) {
            $scope.trackedDevices.splice(cDevice, 1);
          }
          else if(device.deviceId === deviceId) {
            isAlreadyTracked = true;
          }
        }
        if(!isAlreadyTracked) {
          var name = getStoryName(stories[url], MAX_NAME_LENGTH);
          var image = getStoryImage(stories[url]);
          $scope.trackedDevices.push( { deviceId: deviceId, name: name,
                                        image: image } );
        }
      }
      else {
        cormorant.getStory(url, function(story, url) { });
      }
    }

    // Add directory, fetching story and updating map labels
    function addDirectory(directoryName, url) {
      directoryNames.push(directoryName);
      beaver.addDirectoryProperty(directoryName, 'isOccupied', false);
      cormorant.getStory(url, function(story, url) {
        var name = getStoryName(story, MAX_NAME_LENGTH);
        var image = getStoryImage(story);
        beaver.addDirectoryProperty(directoryName, 'name', name);
        beaver.addDirectoryProperty(directoryName, 'image', image);
      });

      for(var cPoi = (directoryNames.length - 1); cPoi < $scope.pois.length;
          cPoi += NUMBER_OF_DIRECTORIES) {
        var mapLabelId = $scope.pois[cPoi].id;
        var mapLabelInfo = ambiarc.poiList[mapLabelId];
        mapLabelInfo.label = directoryName;
        ambiarc.updateMapLabel(mapLabelId, mapLabelInfo.type, mapLabelInfo);
      }
    }

    // Generate heatmap points
    function generateHeatmapPoints() {
      var heatmapPoints = [];
      var maxOccupants = 1;

      for(var cDirectory = 0; cDirectory < directoryNames.length;
          cDirectory++) {
        var directory = directories[directoryNames[cDirectory]];
        if(directory.numberOfOccupants > maxOccupants) {
          maxOccupants = directory.numberOfOccupants;
        }
      }
      for(var cDirectory = 0; cDirectory < directoryNames.length;
          cDirectory++) {
        var directory = directories[directoryNames[cDirectory]];
        var intensity = directory.numberOfOccupants / maxOccupants;
        var mapLabelId = $scope.pois[cDirectory].id;
        heatmapPoints.push({
          latitude: ambiarc.poiList[mapLabelId].latitude,
          longitude: ambiarc.poiList[mapLabelId].longitude,
          intensity: Math.min(1, intensity),
          radius: HEATMAP_RADIUS
        });
      }
      return heatmapPoints;
    }

    // Update occupancy
    function updateOccupancy() {
      for(var cDirectory = 0; cDirectory < directoryNames.length;
          cDirectory++) {
        var directoryName = directoryNames[cDirectory];
        var directory = directories[directoryName];
        var mapLabelId = $scope.pois[cDirectory + OCCUPANCY_OFFSET].id;
        var mapLabelInfo = ambiarc.poiList[mapLabelId];

        if(directory.numberOfOccupants > 0) {
          mapLabelInfo.partialPath = baseUrl + 'images/occupied.png';
          mapLabelInfo.tooltipTitle = 'Occupied';
          mapLabelInfo.tooltipBody = 'Number of occupants: ' +
                                     directory.numberOfOccupants;
          if(!directory.isOccupied && directory.hasOwnProperty('image')) {
            $scope.bubbleImage = directory.image;
            $scope.bubbleTitle = directory.name;
            $scope.bubbleSubtitle = 'is now occupied';
            $scope.showBubble = true;
            beaver.addDirectoryProperty(directoryName, 'isOccupied', true);
            ambiarc.focusOnMapLabel(mapLabelId);
          }
        }
        else {
          mapLabelInfo.partialPath = baseUrl + 'images/available.png';
          mapLabelInfo.tooltipTitle = 'Vacant';
          mapLabelInfo.tooltipBody = 'No occupants detected';
          if(directory.isOccupied && directory.hasOwnProperty('image')) {
            $scope.bubbleImage = directory.image;
            $scope.bubbleTitle = directory.name;
            $scope.bubbleSubtitle = 'is now vacant';
            $scope.showBubble = true;
            beaver.addDirectoryProperty(directoryName, 'isOccupied', false);
            ambiarc.focusOnMapLabel(mapLabelId);
          }
        }
        ambiarc.updateMapLabel(mapLabelId, ambiarc.mapLabel.IconWithText,
                               mapLabelInfo);
      }
    }

    // Update the people/assets
    function updatePeopleAssets() {
      for(var cDirectory = 0; cDirectory < directoryNames.length;
          cDirectory++) {
        var directoryName = directoryNames[cDirectory];
        var directory = directories[directoryName];
        var mapLabelId = $scope.pois[cDirectory + PEOPLE_ASSETS_OFFSET].id;
        var mapLabelInfo = ambiarc.poiList[mapLabelId];
        var list = "";

        for(deviceId in devices) {
          var event = devices[deviceId].event;
          if((event.receiverDirectory === directoryName) &&
             event.deviceTags && Array.isArray(event.deviceTags) &&
             (event.deviceTags.indexOf('track') >= 0) &&
             stories.hasOwnProperty(event.deviceUrl)) {
            list += getStoryName(stories[event.deviceUrl], MAX_NAME_LENGTH) +
                    '\r\n';
          }
        }
        mapLabelInfo.tooltipBody = list;
        ambiarc.updateMapLabel(mapLabelId, ambiarc.mapLabel.IconWithText,
                               mapLabelInfo);
      }
    }

    // Update the people/assets bubble
    function updatePeopleAssetsBubble(event) {
      for(var cDirectory = 0; cDirectory < directoryNames.length;
          cDirectory++) {
        var directory = directories[directoryNames[cDirectory]];
        var mapLabelId = $scope.pois[cDirectory + PEOPLE_ASSETS_OFFSET].id;
        if(mapLabelId === event.detail) {
          $scope.bubbleImage = directory.image;
          $scope.bubbleTitle = directory.name;
          $scope.bubbleSubtitle = 'is selected';
          $scope.showBubble = true;
        }
      }
    }

    // Update tracking
    function updateTracking(deviceId, directoryName) {
      if(deviceId !== trackedDeviceId) {
        return;
      }
      for(var cDirectory = 0; cDirectory < directoryNames.length;
          cDirectory++) {
        var directory = directories[directoryNames[cDirectory]];
        var mapLabelId = $scope.pois[cDirectory + TRACKING_OFFSET].id;
        var mapLabelInfo = ambiarc.poiList[mapLabelId];
        var mapLabelType = ambiarc.mapLabel.Text;

        if(directoryName === directoryNames[cDirectory]) {
          mapLabelType = ambiarc.mapLabel.IconWithText;
          ambiarc.focusOnMapLabel(mapLabelId);
        }
        ambiarc.updateMapLabel(mapLabelId, mapLabelType, mapLabelInfo);
      }
    }

    // Get the most pertinent name from the given story
    function getStoryName(story, maxLength) {
      var name = null;

      if(isStandardStoryFormat(story)) {
        if(story['@graph'][0]['schema:givenName'] ||
           story['@graph'][0]['schema:familyName']) {
           name = (story['@graph'][0]['schema:givenName'] || '') + ' ' +
                  (story['@graph'][0]['schema:familyName'] || '');
        }
        else {
          name = story['@graph'][0]['schema:name'] || null;
        }
      }
      if(name && maxLength && name.length > maxLength) {
        name = name.substr(0, maxLength - 1) + '\u2026';
      }

      return name;
    }

    // Get the most pertinent image from the given story
    function getStoryImage(story) {
      if(isStandardStoryFormat(story)) {
        return story['@graph'][0]['schema:image'] ||
               story['@graph'][0]['schema:logo'];
      }
      return null;
    }

    // Is the given story in the standard format?
    function isStandardStoryFormat(story) {
      if(story && 
         story.hasOwnProperty('@graph') &&
         Array.isArray(story['@graph'])) {
        return true;
      }
      return false;
    }

  })

  // Controls controller
  .controller('ControlsCtrl', function($scope, ambiarcService) {

    ambiarcService.load(function(ambiarc) {
      $('#controls-section').fadeIn();

      $scope.zoomIn = function() {
        ambiarc.zoomCamera(0.2, 0.5);
      };
      $scope.zoomOut = function() {
        ambiarc.zoomCamera(-0.2, 0.5);
      };
      $scope.rotateLeft = function() {
        ambiarc.rotateCamera(30, 0.5);
      };
      $scope.rotateRight = function() {
        ambiarc.rotateCamera(-30, 0.5);
      };
    });

  });
