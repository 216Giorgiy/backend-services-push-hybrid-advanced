(function (global) {
    'use strict';

    var app = global.app = global.app || {};

    var onAndroidPushReceived = function (e) {
        var message = e.message;
        var dateCreated = app.formatDate(e.payload.customData.dateCreated);

        kendoConsole.log(message + '; ' + dateCreated);
    };

    var onIosPushReceived = function (e) {
        var message = e.alert;
        var dateCreated = app.formatDate(e.dateCreated);

        kendoConsole.log(message + '; ' + dateCreated);
    };

    var pushSettings = {
        android: {
            senderID: app.androidProjectNumber
        },
        iOS: {
            badge: "true",
            sound: "true",
            alert: "true"
        },
        notificationCallbackAndroid: onAndroidPushReceived,
        notificationCallbackIOS: onIosPushReceived,
    };

    app.enablePushNotifications = function () {
        var devicePlatform = device.platform; // get the device platform from the Cordova API
        kendoConsole.log("Initializing push notifications for " + devicePlatform + '...');
        
        var currentDevice = app.everlive.push.currentDevice(app.constants.EMULATOR_MODE);
        
		var customDeviceParameters = {
            "LastLoginDate": new Date()
        };
       
        currentDevice.enableNotifications(pushSettings)
            .then(
                function (initResult) {
                    // kendoConsole.log(initResult.token);
                    kendoConsole.log("The device is succcessfully initialized for push notifications.");
                    kendoConsole.log("Push token received!");
                    kendoConsole.log("Verifying device registration...");

                    return currentDevice.getRegistration();
                },
                function (err) {
                    kendoConsole.log("Failed to initialize the device for push notifications.", true);
                    kendoConsole.log("Error : " + (err.message), true);
                }
        ).then(
            function (registration) {
                // var registrationObject = registration.result;
                kendoConsole.log("Your device is already registered in Telerik Backend Services.");
                kendoConsole.log("Updating the device registration...");

                everlive.push.currentDevice()
                    .updateRegistration(customDeviceParameters)
                    .then(function () {
                        kendoConsole.log("Successfully updated the device registration.");
                    }, function (err) {
                        kendoConsole.log('Failed to update the device registration: ' + err.message, true);
                    });
            },
            function (err) {
                if (err.code === 801) {
                    kendoConsole.log("Your device is not registered in Backend Services.");
                    kendoConsole.log("Registering the device in Backend Services...");
                    
                    currentDevice.register(customDeviceParameters).then(function (regData) {
                        var regDate = app.formatDate(regData.result.CreatedAt);
                        var regId = regData.result.Id;
                        
                        kendoConsole.log("Device Id: " + regId);
                 	   kendoConsole.log("Your device is successfully registered in Backend Services.");
                        
                    }, function (err) {
                        kendoConsole.log("Failed to register the device: " + err.message, true);
                    });
                } else {
                    kendoConsole.log("Failed to retrieve the device registration!", true);
                }
            }
        );
    };
})(window);
