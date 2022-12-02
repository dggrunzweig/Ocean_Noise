var gui = new dat.GUI();

// Gui Variables
var frequency_lp = {f_lp:1000};
var frequency_hp = {f_hp:1000};
var gain = {g:-9};
var echo_feedback = {f:0.5};

gui.add(frequency_lp, 'f_lp', 100, 20000).onChange(setLPFrequency);
gui.add(frequency_hp, 'f_hp', 100, 20000).onChange(setHPFrequency);
gui.add(gain, 'g', -60, 0).onChange(setGain);
gui.add(echo_feedback, 'f', 0, 0.9).onChange(setEchoFeedback);

let audioCtx;
let noise_module_1;
let noise_module_2;
let echo_module_1;
let echo_module_2;
let panning_module_1;
let panning_module_2;
  
window.addEventListener('click',function() {
       Initialize();
}
);

function Initialize() {
        //
        // Noise_1 -> Echo_1 -> Pan 1 -> output
        // Noise_2 -> Echo_2 -> Pan 2 -> output
        //
        //
        //
        if (!audioCtx) {
                // initialize context and modules
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                noise_module_1 = new NoiseModule(audioCtx, frequency_lp.f_lp, frequency_hp.f_hp, gain.g);
                noise_module_2 = new NoiseModule(audioCtx, 700, 50, gain.g);
                noise_module_1.setVolumeLFOFrequency(0.12);
                echo_module_1 = new Delay(audioCtx, 0.3, 0.5);
                echo_module_2 = new Delay(audioCtx, 0.35, 0.5);
                panning_module_1 = new StereoPannerNode(audioCtx);
                panning_module_2 = new StereoPannerNode(audioCtx);
                panning_module_1.pan.setValueAtTime(-0.5, audioCtx.currentTime);
                panning_module_2.pan.setValueAtTime(0.5, audioCtx.currentTime);

                noise_module_1.output.connect(echo_module_1.input);
                echo_module_1.output.connect(panning_module_1).connect(audioCtx.destination);
                noise_module_2.output.connect(echo_module_2.input);
                echo_module_2.output.connect(panning_module_2).connect(audioCtx.destination);

        }
}

function setLPFrequency() {
        noise_module_1.setLPFrequency(frequency_lp.f_lp);
}

function setHPFrequency() {
        noise_module_1.setHPFrequency(frequency_hp.f_hp);
}

function setGain() {
        noise_module_1.setGain(gain.g);
        noise_module_2.setGain(gain.g);
}

function setEchoFeedback() {
        echo_module_1.updateFeedback(echo_feedback.f);
}