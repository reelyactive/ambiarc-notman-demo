(function() {
  var setup = function Ambiarc() {
    this.messageQueue = [];
    this.eventLabel = {
      FloorSelectorEnabled: "FloorSelectorEnabled",
      FloorSelectorDisabled: "FloorSelectorDisabled",
      FloorSelected: "FloorSelected",
      FloorSelectorFloorFocusChanged: "FloorSelectorFloorFocusChanged",
      MapLabelSelected: "MapLabelSelected",
      BuildingSelected: "BuildingSelected",
      CameraMotionStarted: "CameraMotionStarted",
      CameraMotionCompleted: "CameraMotionCompleted",
      CameraRotateStarted: "CameraRotateStarted",
      CameraRotateCompleted: "CameraRotateCompleted",
      CameraZoomStarted: "CameraZoomStarted",
      CameraZoomCompleted: "CameraZoomCompleted",
      BuildingExitCompleted: "BuildingExitCompleted",
      ActionIgnored: "ActionIgnored",
      AmbiarcAppInitialized: "AmbiarcAppInitialized",
      RightMouseDown: "RightMouseDown",
      StartedLoadingMap: "StartedLoadingMap",
      FinishedLoadingMap: "FinishedLoadingMap",
      StartedEnteringOverheadCamera: "StartedEnteringOverheadCamera",
      CompletedEnteringOverheadCamera: "CompletedEnteringOverheadCamera",
      StartedExitingOverheadCamera: "StartedExitingOverheadCamera",
      CompletedExitingOverheadCamera: "CompletedExitingOverheadCamera",
      FocusAndZoomTransitionStarted: "FocusAndZoomTransitionStarted",
      FocusAndZoomTransitionCompleted: "FocusAndZoomTransitionCompleted",
      NavigationIconSelected: "NavigationIconSelected"
    };
    this.mapLabel = {
      Icon: "Icon",
      Text: "Text",
      IconWithText: "IconWithText"
    };
    this.mapTheme = {
      dark: "dark",
      light: "light"
    };
    this.coordType = {
      gps: "gps",
      world: "world"
    };
    this.navigationFilters = {
      CombineRotations: "CombineRotations",
      RemoveShortPaths: "RemoveShortPaths",
      Simplify: "Simplify",
      RemoveFinalTurn: "RemoveFinalTurn"
    };
    this.getMapPositionAtCursor = function(coordType, callback) {
      this.messageQueue.push(callback);
      gameInstance.SendMessage("Ambiarc", "GetMapPositionAtCursor", coordType);
    };
    this.createMapLabel = function(mapLabelType, maplLabelInfo, idCallback) {
      this.messageQueue.push(idCallback);
      var json = JSON.stringify({
        mapLabelType: mapLabelType,
        mapLabelInfo: maplLabelInfo
      });
      gameInstance.SendMessage("Ambiarc", "JS_CreateMapLabel", json);
    };
    this.getBuildingLabelID = function(buildingId, cb) {
      this.messageQueue.push(cb);
      gameInstance.SendMessage("Ambiarc", "GetBuildingLabelID", buildingId);
    };

    this.getCanvasPositionAtWorldPosition = function(
      latitude,
      longitude,
      callback
    ) {
      this.messageQueue.push(callback);
      var json = JSON.stringify({
        latitude: latitude,
        longitude: longitude
      });
      gameInstance.SendMessage("Ambiarc", "GetScreenPositionAtPoint", json);
    };

    this.getCanvasPositionAtWorldPositionIndoor = function(
      latitude,
      longitude,
      buildingID,
      floorID,
      callback
    ) {
      this.messageQueue.push(callback);
      var json = JSON.stringify({
        latitude: latitude,
        longitude: longitude,
        floorId: floorID,
        buildingId: buildingID
      });
      gameInstance.SendMessage("Ambiarc", "GetScreenPositionAtPoint", json);
    };

    this.getCurrentNormalizedZoomLevel = function(callback) {
      this.messageQueue.push(callback);
      gameInstance.SendMessage("Ambiarc", "GetCurrentNormalizedZoomLevel");
    };

    this.updateMapLabel = function(mapLabelId, mapLabelType, mapLabelInfo) {
      var json = JSON.stringify({
        mapLabelId: mapLabelId,
        mapLabelType: mapLabelType,
        mapLabelInfo: mapLabelInfo
      });
      gameInstance.SendMessage("Ambiarc", "JS_UpdateMapLabel", json);
    };
    this.getDirections = function(
      startingBuilding,
      startingLevel,
      startingLatitude,
      startingLongitude,
      endingBuilding,
      endingLevel,
      endingLatitude,
      endingLongitude,
      filters,
      cb
    ) {
      this.messageQueue.push(cb);
      var json = JSON.stringify({
        startingBuildingId: startingBuilding,
        startingLevelId: startingLevel,
        startingLat: startingLatitude,
        startingLon: startingLongitude,
        endingBuildingId: endingBuilding,
        endingLevelId: endingLevel,
        endingLat: endingLatitude,
        endingLon: endingLongitude,
        filters: filters.join("|")
      });
      gameInstance.SendMessage("Ambiarc", "GetDirections", json);
    };
    this.clearDirections = function() {
      gameInstance.SendMessage("Ambiarc", "ClearDirections");
    };
    this.UpdateHandicapLevel = function(handicapLevel) {
      gameInstance.SendMessage(
        "Ambiarc",
        "JS_UpdateHandicapLevel",
        handicapLevel
      );
    };
    this.SmoothUpdateMapLabelPosition = function(
      mapLabelId,
      latitude,
      longitude,
      duration
    ) {
      var json = JSON.stringify({
        mapLabelId: mapLabelId,
        latitude: latitude,
        longitude: longitude,
        duration: duration
      });
      gameInstance.SendMessage(
        "Ambiarc",
        "JS_SmoothUpdateMapLabelPosition",
        json
      );
    };

    this.StopTrackingMapLabel = function() {
      gameInstance.SendMessage("Ambiarc", "StopTrackingMapLabel");
    };

    this.TrackMapLabel = function(mapLabelId, height, followSpeed) {
      var json = JSON.stringify({
        mapLabelId: mapLabelId,
        height: height,
        followSpeed: followSpeed
      });
      gameInstance.SendMessage("Ambiarc", "JS_StartTrackingMapLabel", json);
    };

    this.destroyMapLabel = function(mapLabelId) {
      gameInstance.SendMessage("Ambiarc", "DestroyMapLabel", mapLabelId);
    };
    this.showMapLabel = function(mapLabelId, immediate) {
      var json = JSON.stringify({
        mapLabelId: mapLabelId,
        immediate: immediate
      });
      gameInstance.SendMessage("Ambiarc", "JS_ShowMapLabel", json);
    };
    this.hideMapLabel = function(mapLabelId, immediate) {
      var json = JSON.stringify({
        mapLabelId: mapLabelId,
        immediate: immediate
      });
      gameInstance.SendMessage("Ambiarc", "JS_HideMapLabel", json);
    };
    this.showMapCallout = function(mapCallout, idCallback) {
      this.messageQueue.push(idCallback);
      var json = JSON.stringify(mapCallout);
      gameInstance.SendMessage("Ambiarc", "JS_ShowMapCallout", mapCallout);
    };
    this.dismissMapCallout = function(mapLabelId) {
      gameInstance.SendMessage("Ambiarc", "JS_DismissMapCallout", mapLabelId);
    };
    this.focusOnMapLabel = function(mapLabelId, cameraMotionId) {
      var json = JSON.stringify({
        mapLabelId: mapLabelId,
        cameraMotionId: cameraMotionId
      });
      gameInstance.SendMessage("Ambiarc", "JS_FocusOnMapLabel", json);
    };
    this.focusOnFloor = function(
      buildingId,
      floorId,
      cameraMotionId,
      requireFloorFocus,
      instant
    ) {
      var json = JSON.stringify({
        buildingId: buildingId,
        floorId: floorId,
        cameraMotionId: cameraMotionId,
        requireFloorFocus: requireFloorFocus,
        instant: instant
      });
      gameInstance.SendMessage("Ambiarc", "JS_FocusOnFloor", json);
    };
    this.viewFloorSelector = function(buildingId, cameraMotionId) {
      var json = JSON.stringify({
        buildingId: buildingId,
        cameraMotionId: cameraMotionId
      });
      gameInstance.SendMessage("Ambiarc", "JS_ViewFloorSelector", json);
    };
    this.getAllBuildings = function(cb) {
      this.messageQueue.push(cb);
      gameInstance.SendMessage("Ambiarc", "GetAllBuildings");
    };
    this.getAllFloors = function(buildingId, cb) {
      this.messageQueue.push(cb);
      gameInstance.SendMessage("Ambiarc", "GetAllFloors", buildingId);
    };
    this.getCurrentFloor = function(cb) {
      this.messageQueue.push(cb);
      gameInstance.SendMessage("Ambiarc", "GetCurrentFloor");
    };
    this.setColorByCategory = function(category, color) {
      var json = JSON.stringify({
        category: category,
        colorHex: color
      });
      gameInstance.SendMessage("Ambiarc", "JS_SetColorByCategory", json);
    };
    this.setLightColor = function(skyColor, equatorColor, groundColor) {
      var json = JSON.stringify({
        skyColor: skyColor,
        equatorColor: equatorColor,
        groundColor: groundColor
      });
      gameInstance.SendMessage("Ambiarc", "JS_SetLightColor", json);
    };
    this.setSkyColor = function(topColor, bottomColor) {
      var json = JSON.stringify({
        topColor: topColor,
        bottomColor: bottomColor
      });
      gameInstance.SendMessage("Ambiarc", "JS_SetSkyColor", json);
    };
    this.setMapTheme = function(theme) {
      var jsonColorTheme;
      if (theme === this.mapTheme.dark) {
        jsonColorTheme = JSON.stringify(window.AmbiarcThemes.darkTheme);
      } else if (theme === this.mapTheme.light) {
        jsonColorTheme = JSON.stringify(window.AmbiarcThemes.lightTheme);
      }
      gameInstance.SendMessage(
        "Ambiarc",
        "JS_SetColorsByTheme",
        jsonColorTheme
      );
    };
    this.setGPSCoordinatesOrigin = function(latitude, longitude) {
      var json = JSON.stringify({
        latitude: latitude,
        longitude: longitude
      });
      gameInstance.SendMessage("Ambiarc", "JS_SetGPSCoordinatesOrigin", json);
    };
    this.createHeatmap = function(heatmapPoints) {
      var json = JSON.stringify(heatmapPoints);
      gameInstance.SendMessage("Ambiarc", "JS_CreateHeatmap", json);
    };
    this.updateHeatmap = function(heatmapPoints) {
      var json = JSON.stringify(heatmapPoints);
      gameInstance.SendMessage("Ambiarc", "JS_UpdateHeatmap", json);
    };
    this.destroyHeatmap = function() {
      gameInstance.SendMessage("Ambiarc", "DestroyHeatmap");
    };
    this.addRaindrop = function(
      latitude,
      longitude,
      buildingId,
      levelId,
      color,
      duration
    ) {
      var unityColor = {
        x: color.r,
        y: color.g,
        z: color.b
      };

      var json = JSON.stringify({
        latitude: latitude,
        longitude: longitude,
        buildingId: buildingId,
        levelId: levelId,
        duration: duration,
        color: unityColor
      });

      gameInstance.SendMessage("Ambiarc", "JS_AddRaindrop", json);
    };
    this.rotateCamera = function(rotationAmountInDegrees, duration) {
      var json = JSON.stringify({
        degrees: rotationAmountInDegrees,
        duration: duration
      });
      gameInstance.SendMessage("Ambiarc", "JS_TweenRotateCamera", json);
    };
    this.zoomCamera = function(normalizedZoomIncrement, duration) {
      var json = JSON.stringify({
        zoomIncrement: normalizedZoomIncrement,
        duration: duration
      });
      gameInstance.SendMessage("Ambiarc", "JS_TweenZoomCamera", json);
    };
    this.exitBuilding = function(cameraMotionId) {
      gameInstance.SendMessage("Ambiarc", "JS_ExitBuilding", cameraMotionId);
    };
    this.registerForEvent = function(eventLabel, cb) {
      var validLabel = this.eventLabel.hasOwnProperty(eventLabel);
      if (validLabel === false) {
        throw "Invalid label. Please use Ambiarc.eventLabel to choose the event to register to.";
      }
      document.addEventListener(eventLabel, cb);
    };
    this.unregisterEvent = function(eventLabel, cb) {
      document.removeEventListener(eventLabel, cb);
    };
    this.setMapAssetBundleURL = function(url) {
      gameInstance.SendMessage("Ambiarc", "SetMapAssetBundleURL", url);
    };
    this.loadMap = function(map) {
      gameInstance.SendMessage("Ambiarc", "LoadMap", map);
    };
    this.hideLoadingScreen = function() {
      gameInstance.SendMessage("Ambiarc", "HideLoadingScreen");
    };
    this.loadEmbeddedPOIs = function() {
      gameInstance.SendMessage("Ambiarc", "LoadEmbeddedPOIs");
    };
    this.focusOnLatLonAndZoomToHeight = function(
      buildingId,
      floorId,
      lat,
      lon,
      heightAboveFloor
    ) {
      var json = JSON.stringify({
        buildingId: buildingId,
        floorId: floorId,
        lat: lat,
        lon: lon,
        heightAboveFloor: heightAboveFloor
      });
      gameInstance.SendMessage("Ambiarc", "FocusOnLatLonAndZoomToHeight", json);
    };

    this.hideMapLabelGroup = function(mapLabelIds, immediate) {
      var json = JSON.stringify({
        mapLabelIds: mapLabelIds,
        immediate: immediate
      });
      gameInstance.SendMessage("Ambiarc", "HideMapLabels", json);
    };
    this.showMapLabelGroup = function(mapLabelIds, immediate) {
      var json = JSON.stringify({
        mapLabelIds: mapLabelIds,
        immediate: immediate
      });
      gameInstance.SendMessage("Ambiarc", "ShowMapLabels", json);
    };
    this.EnableAutoShowPOIsOnFloorEnter = function() {
      gameInstance.SendMessage("Ambiarc", "EnableAutoShowPOIsOnFloorEnter");
    };
    this.DisableAutoShowPOIsOnFloorEnter = function() {
      gameInstance.SendMessage("Ambiarc", "DisableAutoShowPOIsOnFloorEnter");
    };

    this.ShowTooltipForMapLabel = function(mapLabelId) {
      var json = JSON.stringify({
        mapLabelId: mapLabelId
      });
      gameInstance.SendMessage("Ambiarc", "JS_ShowTooltipForMapLabel", json);
    };

    this.setCameraRotation = function(degrees, duration) {
      var json = JSON.stringify({
        degrees: degrees,
        duration: duration
      });
      gameInstance.SendMessage("Ambiarc", "SetCameraRotation", json);
    };

    this.getCameraRotation = function(callback) {
      this.messageQueue.push(callback);
      gameInstance.SendMessage("Ambiarc", "GetCameraRotation");
    };

    this.EnterOverheadCamera = function() {
      gameInstance.SendMessage("Ambiarc", "EnterOverheadCamera");
    };

    this.ExitOverheadCamera = function() {
      gameInstance.SendMessage("Ambiarc", "ExitOverheadCamera");
    };

    this.loadRemoteMapLabels = function(url, options) {
      return fetch(url, options)
        .then(res => res.json())
        .then(out => {
          return new Promise(function(resolve, reject) {
            out.features.forEach(function(element) {
              element.properties.latitude = element.geometry.coordinates[1];
              element.properties.longitude = element.geometry.coordinates[0];
              window.Ambiarc.createMapLabel(
                element.properties.type,
                element.properties,
                function(id) {
                  element.properties.mapLabelId = id;
                }
              );
            });
            resolve(out.features);
          });
        })
        .catch(err => {
          throw err;
        });
    };
  };
  window.Ambiarc = new setup();
})(window);

$(document).ready(function() {
  parent.iframeLoaded();
});
