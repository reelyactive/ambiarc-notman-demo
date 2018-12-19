/**
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */


DEFAULT_EVENT_INTERVAL_MILLISECONDS = 2000;


angular.module('reelyactive.examples', [])

  .factory('examples', function examplesFactory($interval, $timeout) {

    var eventCallbacks = {};
    var backgroundUrl;

    // Office event generator
    function generateOfficeEvents() {
      var devices = [
        { id: "000000000001",
          url: "https://www.reelyactive.com/stories/people/daphne/" },
        { id: "000000000002",
          url: "https://www.reelyactive.com/stories/people/deshawn/" },
        { id: "000000000003",
          url: "https://www.reelyactive.com/stories/people/eric/" },
        { id: "000000000004",
          url: "https://www.reelyactive.com/stories/people/jeffrey/" },
        { id: "000000000005",
          url: "https://www.reelyactive.com/stories/people/karim/" },
        { id: "000000000006",
          url: "https://www.reelyactive.com/stories/people/kim/" },
        { id: "000000000007",
          url: "https://www.reelyactive.com/stories/people/kyle/" },
        { id: "000000000008",
          url: "https://www.reelyactive.com/stories/people/maggie/" },
        { id: "000000000009",
          url: "https://www.reelyactive.com/stories/people/monique/" },
        { id: "00000000000a",
          url: "https://www.reelyactive.com/stories/people/philippe/" },
        { id: "00000000000b",
          url: "https://www.reelyactive.com/stories/people/terrance/" },
        { id: "00000000000c",
          url: "https://www.reelyactive.com/stories/people/tina/" }
      ];
      var receivers = [
        { id: "001bc50940810000",
          url: "https://www.reelyactive.com/stories/office/kitchen/",
          directory: 'office:kitchen' },
        { id: "001bc50940810001",
          url: "https://www.reelyactive.com/stories/office/conferenceroom/",
          directory: 'office:conferenceroom' },
        { id: "001bc50940810002",
          url: "https://www.reelyactive.com/stories/office/hotdesking/",
          directory: 'office:hotdesking' }
      ];
      for(var cEvent = 0; cEvent < devices.length; cEvent++) {
        $timeout(handleEventCallback, cEvent, false, 'appearance',
                 createEvent(devices, receivers));
      }
      $interval(function() {
        var event = createEvent(devices, receivers);
        handleEventCallback('appearance', event);
      }, DEFAULT_EVENT_INTERVAL_MILLISECONDS);
    }

    // Hospital event generator (staff only)
    function generateHospitalStaffEvents() {
      var devices = [
        { id: "000000000001",
          url: "https://www.reelyactive.com/stories/hospital/staff/darryl/" },
        { id: "000000000002",
          url: "https://www.reelyactive.com/stories/hospital/staff/devin/" },
        { id: "000000000003",
          url: "https://www.reelyactive.com/stories/hospital/staff/nancy/" },
        { id: "000000000004",
          url: "https://www.reelyactive.com/stories/hospital/staff/natasha/" },
        { id: "000000000005",
          url: "https://www.reelyactive.com/stories/hospital/staff/nathalie/" },
        { id: "000000000006",
          url: "https://www.reelyactive.com/stories/hospital/staff/nina/" },
        { id: "000000000007",
          url: "https://www.reelyactive.com/stories/hospital/staff/ophelia/" },
        { id: "000000000008",
          url: "https://www.reelyactive.com/stories/hospital/staff/sam/" },
        { id: "000000000009",
          url: "https://www.reelyactive.com/stories/hospital/staff/simon/" }
      ];
      var receivers = [
        { id: "001bc50940810000",
          url: "https://www.reelyactive.com/stories/hospital/waitingroom/",
          directory: 'hospital:waitingroom' },
        { id: "001bc50940810001",
          url: "https://www.reelyactive.com/stories/hospital/operatingroom/",
          directory: 'hospital:operatingroom' },
        { id: "001bc50940810002",
          url: "https://www.reelyactive.com/stories/hospital/recovery/",
          directory: 'hospital:recovery' }
      ];
      for(var cEvent = 0; cEvent < devices.length; cEvent++) {
        $timeout(handleEventCallback, cEvent, false, 'appearance',
                 createEvent(devices, receivers));
      }
      $interval(function() {
        var event = createEvent(devices, receivers);
        handleEventCallback('appearance', event);
      }, DEFAULT_EVENT_INTERVAL_MILLISECONDS);
    }

    // Hospital event generator (assets only)
    function generateHospitalAssetEvents() {
      var devices = [
        { id: "000000000001",
          url: "https://www.reelyactive.com/stories/hospital/assets/hospitalbed/" },
        { id: "000000000002",
          url: "https://www.reelyactive.com/stories/hospital/assets/oxygentank/" },
        { id: "00000000003",
          url: "https://www.reelyactive.com/stories/hospital/assets/wheelchair/" }
      ];
      var receivers = [
        { id: "001bc50940810000",
          url: "https://www.reelyactive.com/stories/hospital/equipmentroom/",
          directory: 'hospital:equipmentroom' },
        { id: "001bc50940810001",
          url: "https://www.reelyactive.com/stories/hospital/recovery/",
          directory: 'hospital:recovery' },
        { id: "001bc50940810002",
          url: "https://www.reelyactive.com/stories/hospital/waitingroom/",
          directory: 'hospital:waitingroom' }
      ];
      for(var cEvent = 0; cEvent < devices.length; cEvent++) {
        $timeout(handleEventCallback, cEvent, false, 'appearance',
                 createEvent(devices, receivers));
      }
      $interval(function() {
        var event = createEvent(devices, receivers);
        handleEventCallback('appearance', event);
      }, DEFAULT_EVENT_INTERVAL_MILLISECONDS);
    }

    // Create event
    function createEvent(devices, receivers) {
      var device = devices[Math.floor(Math.random() * devices.length)];
      var receiver = receivers[Math.floor(Math.random() * receivers.length)];
      if(device.hasOwnProperty('receivers')) {
        var receiverIndex = Math.floor(Math.random() * device.receivers.length);
        receiver = receivers[device.receivers[receiverIndex]];
      }
      return {
        deviceId: device.id,
        deviceUrl: device.url,
        deviceTags: [ 'track' ],
        receiverId: receiver.id,
        receiverUrl: receiver.url,
        receiverDirectory: receiver.directory,
        rssi: 150,
        sessionId: '7265656c-0000-4000-8048-' + device.id,
        time: new Date().getTime()
      };
    }

    // Handle any registered callback for the given event type
    function handleEventCallback(type, event) {
      var callback = eventCallbacks[type];
      if(callback) {
        callback(event);
      }
    }

    // Start the given event generator
    var generateEvents = function(example) {
      switch(example) {
        case 'hospital-staff':
          generateHospitalStaffEvents();
          break;
        case 'hospital-assets':
          generateHospitalAssetEvents();
          break;
        case 'office':
        default:
          generateOfficeEvents();
      }
    }

    // Register a callback for the given event type
    var setEventCallback = function(event, callback) {
      if(callback && (typeof callback === 'function')) { 
        eventCallbacks[event] = callback;
      }
    }

    return {
      generate: generateEvents,
      on: setEventCallback
    }
  });
