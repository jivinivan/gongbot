import piblaster from 'pi-blaster.js'
import Q from 'q'

// Settings
const servoTimePer60Degrees = 155 // milliseconds
const servo0 = 0.05
const servo180 = 0.25
const servoDegreePulse = (servo180-servo0) / 180
const servoDegreeTime = servoTimePer60Degrees / 60 //milliseconds
const incrementDivisor = 0.001
const pin = 18

const _move = (start, stop, delayCount, delayTime, granularity, direction, deferred) => {

  // Determin next position
  let pwm
  if(direction === 'up') {
    pwm = (parseFloat(start) + parseFloat(granularity))
    pwm = (pwm > stop) ? stop : pwm
  }else{
    pwm = (parseFloat(start) - parseFloat(granularity))
    pwm = (pwm < stop) ? stop : pwm
  }

  // Set next position
  piblaster.setPwm(pin, pwm)
  console.log('position', pwm)

  // Wait for servo to reach next position position
  setTimeout(() => {
    if (pwm === stop) {
      deferred.resolve()
    }
    else {
      // Keep iterating if we haven't reached the iteration limit
      return _move(pwm, stop, delayCount, delayTime, granularity, direction, deferred)
    }
  }, delayTime)
}

const gong = (start, stop, time) => {

  const degrees = Math.abs(start-stop) / servoDegreePulse // total degrees of movement
  const degreeTime = time / degrees // time per degree
  const extraTime = 2000 - (servoDegreeTime * degrees) // extra time past max servo speed
  const delayCount = Math.ceil( Math.abs(start-stop) / incrementDivisor ) // number of delays to use
  const delayTime = extraTime / delayCount // delay time
  const granularity = Math.abs(start-stop) / delayCount
  const direction = (start > stop) ? 'down' : 'up'
  const deferred = Q.defer()

  console.log('direction', direction)

  if(degreeTime > servoDegreeTime) {
    console.log('using delays')

    // Go to position 1
    piblaster.setPwm(pin, start)

    // Start delay sequence
    _move(start, stop, delayCount, delayTime, granularity, direction, deferred)
  }
  else {
    console.log('full speed ahead!')

    // Go to position 1
    piblaster.setPwm(pin, start)

    // Go to position 2
    piblaster.setPwm(pin, stop)

    // Calculate the time it will take for full speed position change
    var fullSpeedTime = (degrees * servoDegreeTime)
    setTimeout(() => {
      deferred.resolve()
    }, fullSpeedTime)
  }

  return deferred.promise
}

export default gong
