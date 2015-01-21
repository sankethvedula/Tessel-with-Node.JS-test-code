var tessel = require("tessel");
var pubnub = require("pubnub").init({
    publish_key: "pub-c-1b4c611a-ecc4-4105-9184-ad449d22c5b3",
    subscribe_key: "sub-c-ff908b60-9468-11e4-b395-02ee2ddab7fe"
});
var wifi = require('wifi-cc3000');

var rfidlib = require('rfid-pn532');
var accel = require('accel-mma84').use(tessel.port['C']);
var rfid = rfidlib.use(tessel.port['A']);


var wifiSettings = {
  ssid: "vaibhav's iPhone",
  password: '12345678',
  timeout: 40,
  security: 'wpa2'
};

checkConnection();

wifi.on('disconnect', function () {
  console.log('Disconnected.');
  checkConnection();
});

var led1 = tessel.led[0].output(1);

function checkConnection () {
  if (wifi.isConnected()) {
    console.log('Connected.');
    main();
  } else {
    console.log('Connecting...');
    wifi.connect(wifiSettings, function (err, res) {
      if(err) {
        console.log('Error connecting:', err);
      }
      console.log(res);
      checkConnection();
    });
  }
}

/*
rfid.on('ready', function (version) {
  console.log('Ready to read RFID card');

  rfid.on('data', function(card) {
    console.log('Getting RFID data')
    card_string = card.uid.toString('hex');
    console.log('UID:', card_string);
    pubnub.publish({
         channel : "tessel_rfid",
         message : card,
         callback: function(m){ console.log(m) }
    });

  });
});

rfid.on('error', function (err) {
  console.error(err);
});
*/

function main() {

  console.log("trying");

  pubnub.subscribe({channel: "tessel_rfid", message: function(m) {
    led1.toggle();
    console.log("Got data");
  }});
}


// Initialize the accelerometer.
accel.on('ready', function () {

    accel.setOutputRate(1.56, function rateSet() {
      accel.on('data', function (xyz) {
        console.log('slower x:', xyz[0].toFixed(2),
        'slower y:', xyz[1].toFixed(2),
        'slower z:', xyz[2].toFixed(2));

        accel_data = {msg_type:'accel',x: xyz[0].toFixed(2), y: xyz[1].toFixed(2),z:xyz[2].toFixed(2) }

        pubnub.publish({
         channel : "tessel_rfid",
         message : accel_data,
         callback: function(m){ console.log(m) }
         });
      });
    });



});

accel.on('error', function(err){
  console.log('Accelrometer DataError:', err);
});