'use strict';
var five = require('johnny-five');
var PiIO = require('pi-io');
var Q = require('q');
var servoInstance = null;

/**
 * Gong class
 *
 * @constructor
 */
function Gong() {
  if (!servoInstance) {
    servoInstance = this;

    this.pin = 'GPIO27';
    this.upTime = 3000;
    this.gongActive = false;
    this.board = null;
    this.servo = null;
    this.animation = null;
  }
  return servoInstance;
}

/**
 * Initialize Raspberry Pi and servo
 */
Gong.prototype.initialize = function () {
  var deferred = Q.defer();

  // Check to see if we already have a board and servo instance
  if (this.board && this.servo) {
    deferred.resolve();
  }
  else {
    // Create new board using Pi IO Plugin
    this.board = new five.Board({
      io: new PiIO(),
      repl: false
    });

    // Once board is ready, create new servo instance
    this.board.ready(function() {
      this.servo = new five.Servo({
        pin: this.pin,
        type: 'standard'
      });

      deferred.resolve();
    }.bind(this));
  }

  return deferred.promise;
};

/**
 * Ring the gong!
 */
Gong.prototype.ring = function () {
  // If gong is active, do not ring
  if(this.active) return;

  this.initialize()
  .then(function() {
    // Set gong status to active
    this.active = true;

    // Create animation
    var animation = new five.Animation(this.servo);

    // Add animation segment: Move gong arm up over 3 seconds
    animation.enqueue({
      duration: this.upTime,
      keyFrames: [{ degrees: 180 }]
    });

    // Add animation segment: Move gong arm down quickly
    animation.enqueue({
      duration: 0,
      keyFrames: [{ degrees: 0 }],
      oncomplete: function() {
        // Set gong status to false
        this.active = false;
      }.bind(this);
    });

    // Play the animation
    animation.play();

  }.bind(this));
};

module.exports = Gong;
