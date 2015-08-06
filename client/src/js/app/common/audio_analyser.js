var AudioAnalyser = function() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    var offlineContext = null;
    var audioContext = null;
    var isPlaying = false;
    var sourceNode = null;
    var analyser = null;
    var theBuffer = null;
    var DEBUGCANVAS = null;
    var mediaStreamSource = null;
    var detectorElem,
        canvasElem,
        waveCanvas,
        pitchElem,
        noteElem,
        detuneElem,
        detuneAmount;

    audioContext = new AudioContext();
    offlineContext = new window.OfflineAudioContext(1, 2, 44100);


    var _sonoSound;
    var _sonoAnalyzer;
    var _fftData = [];

    function _setupPitch() {
        sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = theBuffer;
        sourceNode.loop = true;

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        sourceNode.connect(analyser);
        analyser.connect(audioContext.destination);
        sourceNode.start(0);
        isPlaying = true;
        isLiveInput = false;
    }


    var rafID = null;
    var tracks = null;
    var buflen = 1024;
    var buf = new Float32Array(buflen);

    var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    var MIN_SAMPLES = 0; // will be initialized when AudioContext is created.

    function _autoCorrelate(buf, sampleRate) {
        var SIZE = buf.length;
        var MAX_SAMPLES = Math.floor(SIZE / 2);
        var best_offset = -1;
        var best_correlation = 0;
        var rms = 0;
        var foundGoodCorrelation = false;
        var correlations = new Array(MAX_SAMPLES);

        for (var i = 0; i < SIZE; i++) {
            var val = buf[i];
            rms += val * val;
        }
        rms = Math.sqrt(rms / SIZE);
        if (rms < 0.01) // not enough signal
            return -1;

        var lastCorrelation = 1;
        for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
            var correlation = 0;

            for (var i = 0; i < MAX_SAMPLES; i++) {
                correlation += Math.abs((buf[i]) - (buf[i + offset]));
            }
            correlation = 1 - (correlation / MAX_SAMPLES);
            correlations[offset] = correlation; // store it, for the tweaking we need to do below.
            if ((correlation > 0.9) && (correlation > lastCorrelation)) {
                foundGoodCorrelation = true;
                if (correlation > best_correlation) {
                    best_correlation = correlation;
                    best_offset = offset;
                }
            } else if (foundGoodCorrelation) {
                // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
                // Now we need to tweak the offset - by interpolating between the values to the left and right of the
                // best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
                // we need to do a curve fit on correlations[] around best_offset in order to better determine precise
                // (anti-aliased) offset.

                // we know best_offset >=1, 
                // since foundGoodCorrelation cannot go to true until the second pass (offset=1), and 
                // we can't drop into this clause until the following pass (else if).
                var shift = (correlations[best_offset + 1] - correlations[best_offset - 1]) / correlations[best_offset];
                return sampleRate / (best_offset + (8 * shift));
            }
            lastCorrelation = correlation;
        }
        if (best_correlation > 0.01) {
            // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
            return sampleRate / best_offset;
        }
        return -1;
        //  var best_frequency = sampleRate/best_offset;
    }

    function _noteFromPitch(frequency) {
        var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
        return Math.round(noteNum) + 69;
    }


    function getPitch() {
        if(!_sonoAnalyzer){
            return undefined;
        }
        //var n = undefined;
        _sonoAnalyzer.getFloatTimeDomainData(buf);
        var ac = _autoCorrelate(buf, audioContext.sampleRate);
        if (ac !== -1) {
            pitch = ac;
            var note = _noteFromPitch(pitch);
            //n = noteStrings[note % 12];
        }else{
            return undefined;
        }
        return _map(note % 12, 0, 11, 0, 1);
    }

    function getFFT() {
        _fftData.length = 0;
        var magnitude, percent;
        var freqByteData = _sonoAnalyzer.getFrequencies();
        var groupL = Math.floor((freqByteData.length - 1) / 3);
        var totalIn = 0;
        var totalP = 0;
        for (var i = 0, l = freqByteData.length; i < l; i++) {
            magnitude = freqByteData[i];
            percent = magnitude / 128;
            totalP += percent;
            totalIn += percent;

            if (i % groupL === 0) {
                _fftData.push(Math.max(_map(totalP / groupL, 0.001, 0.55, 0, 1),0));
                totalP = 0;
            }
        }
        _fftData.push(totalIn / freqByteData.length);
        return _fftData;
    }

    function setupSono(url) {
        _sonoSound = sono.createSound(url);
        _sonoSound.loop = true;
        _sonoSound.play();
        _sonoAnalyzer = _sonoSound.effect.analyser({
            fftSize: 2048,
            smoothingTimeConstant: 0.7,
            float: false
        });
    }

    function addTrack(url) {
        setupSono(url);
    }

    function fadeUp(){
        _sonoSound.fade(1, 10);
        setTimeout(function(){
            _sonoSound.play();
        }, 10000);
    }

    function fadeDown(){
        _sonoSound.fade(0, 10);
        setTimeout(function(){
            _sonoSound.stop();
        }, 10000);
    }

    function _map(v, a, b, x, y) {
        return (v === a) ? x : (v - a) * (y - x) / (b - a) + x;
    }

    return {
        fadeDown: fadeDown,
        addTrack: addTrack,
        fadeDown: fadeDown,
        fadeUp: fadeUp,
        getPitch: getPitch,
        getFFT: getFFT
    }
}

module.exports = AudioAnalyser;