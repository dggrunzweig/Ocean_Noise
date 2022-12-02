// define Delay class
class Delay {
    constructor(context, time, feedback = 0.3) {
      // create components and set default values
      this.context = context;
      this.input = this.context.createGain();
      this.output = this.context.createGain();
      this.delay = context.createDelay();
      this.delay.delayTime.value = time;
      this.dry = context.createGain();
      this.wet = context.createGain();
      this.feedback = context.createGain();
      this.feedback.gain.value = feedback;
      this.filter = context.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.value = 2000; // Freq. in Hz
      // create LFO and set values
      this.lfo = context.createOscillator();
      this.lfo.start(); // start the oscillator
      this.lfo.frequency.value = 0.5; // Freq. in Hz
      this.lfoGain = context.createGain();
      this.lfoGain.gain.value = 0.0005;
      // dry circuit connections
      this.input.connect(this.dry);
      this.dry.connect(this.output);
      // wet circuit connections
      this.input.connect(this.filter);
      this.filter.connect(this.delay);
      this.delay.connect(this.feedback);
      this.feedback.connect(this.filter);
      // LFO connections
      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.delay.delayTime); // modulates a parameter
      // connect to output
      this.delay.connect(this.wet);
      this.wet.connect(this.output);
    }
    updateDelayTime(time) {
      this.delay.delayTime.linearRampToValueAtTime(
        time,
        this.context.currentTime + 0.01
      );
    }
    updateFeedback(level) {
      this.feedback.gain.linearRampToValueAtTime(
        level,
        this.context.currentTime + 0.01
      );
    }
    updateFilterFreq(rangeValue) {
      // scales 0 - 1 between 100 and 10000 on an exponential scale
      // more useful than linear scaling
      const freq = Math.pow(10, rangeValue * 2 + 2);
      this.filter.frequency.linearRampToValueAtTime(
        freq,
        this.context.currentTime + 0.01
      );
    }
    updateDryWet(gain) {
      this.wet.gain.linearRampToValueAtTime(
        gain,
        this.context.currentTime + 0.01
      );
      this.dry.gain.linearRampToValueAtTime(
        1 - gain,
        this.context.currentTime + 0.01
      );
    }
    updateLfoFreq(freq) {
      this.lfo.frequency.linearRampToValueAtTime(
        freq,
        this.context.currentTime + 0.01
      );
    }
    updateLfoGain(gain) {
      this.lfoGain.gain.linearRampToValueAtTime(
        gain,
        this.context.currentTime + 0.01
      );
    }
  }