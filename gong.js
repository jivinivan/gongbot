'use strict';

// Include required dependencies
var piblaster = require('pi-blaster.js');
var Q = require('q');

// Defaults
var servoTimePer60Degrees = 155; //milliseconds
var servo0 = 0.05;
var servo180 = 0.25;
var servoDegreePulse = (servo180-servo0) / 180;
var servoDegreeTime = servoTimePer60Degrees / 60; //milliseconds
var incrementDivisor = 0.001;
var pin = 18;


var _move = function(start, stop, delayCount, delayTime, granularity, direction, deferred) {

  // Go to next position
  var pwm;

  if(direction === 'up') {
    pwm = (parseFloat(start)+parseFloat(granularity));
    pwm = (pwm > stop) ? stop : pwm;
  }else{
    pwm = (parseFloat(start)-parseFloat(granularity));
    pwm = (pwm < stop) ? stop : pwm;
  }

  // Set position
  piblaster.setPwm(pin, pwm);
  console.log('moving to: '+pwm);

  // Wait for next position
  setTimeout(function(){
    if(pwm === stop) {
      deferred.resolve();
    }else{
      // Keep iterating if we haven't reached the iteration limit
      return _move(pwm, stop, delayCount, delayTime, granularity, direction, deferred);
    }
  },delayTime);
};

var gong = function(start, stop, time) {

  var degrees = Math.abs(start-stop) / servoDegreePulse; // total degrees of movement
  var degreeTime = time / degrees; // time per degree
  var extraTime = 2000 - (servoDegreeTime*degrees); // extra time past max servo speed
  var delayCount = Math.ceil( Math.abs(start-stop) / incrementDivisor ); // number of delays to use
  var delayTime = extraTime / delayCount; // delay time
  var granularity = Math.abs(start-stop) / delayCount;
  var direction = (start > stop) ? 'down' : 'up';
  var deferred = Q.defer();

  console.log('going '+direction);

  if(degreeTime > servoDegreeTime) {
    console.log('using delays');

    // Go to position 1
    piblaster.setPwm(pin, start);

    // Start delay sequence
    _move(start, stop, delayCount, delayTime, granularity, direction, deferred);
  }else{
    console.log('full speed ahead!');

    // Go to position 1
    piblaster.setPwm(pin, start);

    // Go to position 2
    piblaster.setPwm(pin, stop);

    // Calculate the time it will take for full speed position change
    var fullSpeedTime = (degrees*servoDegreeTime);
    setTimeout(function(){
      deferred.resolve();
    },fullSpeedTime);
  }

  return deferred.promise;
}

module.exports = {
  gong: gong
};
