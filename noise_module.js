class NoiseModule {
    CreateNoiseSource(source) {
        // Stereo
        let channels = 2;

        // Create an empty two second stereo buffer at the
        // sample rate of the AudioContext
        const frameCount = audioCtx.sampleRate * 2.0;

        // create a buffer
        const buffer = new AudioBuffer({
            numberOfChannels: channels,
            length: frameCount,
            sampleRate: audioCtx.sampleRate,
            });

        // Fill the buffer with white noise;
        // just random values between -1.0 and 1.0
        for (let channel = 0; channel < channels; channel++) {
            // This gives us the actual array that contains the data
            const nowBuffering = buffer.getChannelData(channel);
            for (let i = 0; i < frameCount; i++) {
                    // Math.random() is in [0; 1.0]
                    // audio needs to be in [-1.0; 1.0]
                    nowBuffering[i] = Math.random() * 2 - 1;
            }
        }

        // Set the buffer in the AudioBufferSourceNode
        source.buffer = buffer;
    }

    constructor(audio_context, lp_fc, hp_fc, gain_dB) {
        this.context = audio_context;
        this.noise_buffer_source = audio_context.createBufferSource();
        this.low_pass_filter = audio_context.createBiquadFilter();
        this.high_pass_filter = audio_context.createBiquadFilter();
        this.modulated_gain = audio_context.createGain();
        this.volume_lfo = audio_context.createOscillator();
        this.volume_lfo_depth = audio_context.createGain();
        this.hp_lfo = audio_context.createOscillator();
        this.hp_lfo_depth = audio_context.createGain();
        this.lp_lfo = audio_context.createOscillator();
        this.lp_lfo_depth = audio_context.createGain();
        this.output = audio_context.createGain();

        // initialize LP filter
        this.low_pass_filter.type = "lowpass";
        this.low_pass_filter.frequency.setValueAtTime(lp_fc, audio_context.currentTime);
        
        // initialize HP filter
        this.high_pass_filter.type = "highpass";
        this.high_pass_filter.frequency.setValueAtTime(hp_fc, audio_context.currentTime);

        // initialize gain
        this.modulated_gain.gain.setValueAtTime(1.0, audio_context.currentTime);

        // initialize output gain
        let gain_scalar = Math.pow(10, gain_dB/20);
        this.output.gain.setValueAtTime(gain_scalar, audio_context.currentTime);

        // initialize volume lfo
        this.volume_lfo.frequency.setValueAtTime(0.1, audio_context.currentTime);
        this.volume_lfo.type = "sine";
        this.volume_lfo_depth.gain.setValueAtTime(0.5, audio_context.currentTime);
        this.volume_lfo.connect(this.volume_lfo_depth).connect(this.modulated_gain);
        this.volume_lfo.start();

        // initialize LP LFO
        this.lp_lfo.frequency.setValueAtTime(0.15, audio_context.currentTime);
        this.lp_lfo.type = "triangle";
        this.lp_lfo_depth.gain.setValueAtTime(500, audio_context.currentTime);
        this.lp_lfo.connect(this.lp_lfo_depth).connect(this.low_pass_filter.frequency);
        this.lp_lfo.start();

        // initialize HP LFO
        this.hp_lfo.frequency.setValueAtTime(0.15, audio_context.currentTime);
        this.hp_lfo.type = "triangle";
        this.hp_lfo_depth.gain.setValueAtTime(500, audio_context.currentTime);
        this.hp_lfo.connect(this.hp_lfo_depth).connect(this.high_pass_filter.frequency);
        this.hp_lfo.start();

        // initialize noise buffer
        this.CreateNoiseSource(this.noise_buffer_source);
        this.noise_buffer_source.loop = true;
        this.noise_buffer_source.start();
        
        // signal chain
        this.noise_buffer_source.connect(this.low_pass_filter).connect(this.high_pass_filter).connect(this.modulated_gain).connect(this.output);
    }

    setLPFrequency(frequency_hz) {
        this.low_pass_filter.frequency.setValueAtTime(frequency_hz, this.context.currentTime);
    }

    setHPFrequency(frequency_hz) {
        this.high_pass_filter.frequency.setValueAtTime(frequency_hz, this.context.currentTime);
    }

    setLPLFOFrequency(frequency_hz) {
        this.lp_lfo.frequency.setValueAtTime(frequency_hz, this.context.currentTime);
    }

    setVolumeLFOFrequency(frequency_hz) {
        this.volume_lfo.frequency.setValueAtTime(frequency_hz, this.context.currentTime);
    }

    setGain(gain_db) {
        let gain_scalar = Math.pow(10, gain_db/20);
        this.output.gain.setValueAtTime(gain_scalar, this.context.currentTime);
    }
}