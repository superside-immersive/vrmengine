// Reduced-build compatibility shim for legacy motion-control loaders.
// The original fingerpose library is quarantined in _quarantine/js/phase-h/.
(function (global) {
  if (global.fp) return;

  class GestureDescription {
    constructor(name) {
      this.name = name;
      this.curls = [];
      this.directions = [];
    }

    addCurl(finger, curl, confidence) {
      this.curls.push({ finger, curl, confidence });
      return this;
    }

    addDirection(finger, direction, confidence) {
      this.directions.push({ finger, direction, confidence });
      return this;
    }
  }

  class GestureEstimator {
    constructor(gestures) {
      this.gestures = gestures || [];
    }

    estimate() {
      return {
        poseData: [],
        gestures: [],
      };
    }
  }

  const builtinGestures = {
    VictoryGesture: new GestureDescription('VictoryGesture'),
    ThumbsUpGesture: new GestureDescription('ThumbsUpGesture'),
  };

  global.fp = {
    __reduced_build_shim__: true,
    GestureDescription,
    GestureEstimator,
    Gestures: builtinGestures,
    Finger: {
      Thumb: 'Thumb',
      Index: 'Index',
      Middle: 'Middle',
      Ring: 'Ring',
      Pinky: 'Pinky',
    },
    FingerCurl: {
      NoCurl: 'NoCurl',
      HalfCurl: 'HalfCurl',
      FullCurl: 'FullCurl',
    },
    FingerDirection: {
      VerticalUp: 'VerticalUp',
      VerticalDown: 'VerticalDown',
      HorizontalLeft: 'HorizontalLeft',
      HorizontalRight: 'HorizontalRight',
      DiagonalUpLeft: 'DiagonalUpLeft',
      DiagonalUpRight: 'DiagonalUpRight',
      DiagonalDownLeft: 'DiagonalDownLeft',
      DiagonalDownRight: 'DiagonalDownRight',
    },
  };
})(typeof self !== 'undefined' ? self : window);
