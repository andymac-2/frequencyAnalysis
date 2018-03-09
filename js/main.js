'use strict'

window.onload = function (){

  var aCtx = new AudioContext ();
  var cCtx = document.getElementById ("display");

  var fd = new frequencyDrawing (aCtx, cCtx);
};

var frequencyDrawing = function (audioCtx, canvas) {
    this.aCtx = audioCtx;
    this.canvas = canvas;

    this.cCtx = this.canvas.getContext('2d');


    this.analyser = this.aCtx.createAnalyser();
    this.analyser.fftSize = Math.pow(2, 13);

    this.freqBuffer = new Float32Array(this.analyser.frequencyBinCount);

    var constraints = {audio:true};

    navigator.mediaDevices.getUserMedia (constraints)
        .then(stream => {
            var source = this.aCtx.createMediaStreamSource (stream);
            source.connect (this.analyser);

            this.drawFrame.bind(this)();
        })
        .catch(function (err){
            console.log('The following gUM error occured: ' + err);
        });
};
frequencyDrawing.prototype.NOTES_IN_OCTAVE = 12;
frequencyDrawing.prototype.CONCERT_PITCH = 440;
frequencyDrawing.prototype.OCTAVE_RATIO = 2;
frequencyDrawing.prototype.drawFrame = function () {
    requestAnimationFrame(this.drawFrame.bind(this));

    var width = this.canvas.width;
    var height = this.canvas.height;

    var ctx = this.cCtx;

    this.analyser.getFloatFrequencyData(this.freqBuffer);

    var length = this.analyser.frequencyBinCount;
    var k = width/Math.log(length);

    var octaveWidth = Math.log(this.OCTAVE_RATIO) * k;
    var referenceBar = Math.log(this.CONCERT_PITCH) * k;

    ctx.clearRect (0, 0, width, height);

    ctx.strokeStyle = 'rgb(150,50,50)';

    ctx.beginPath();
    ctx.setLineDash([1]);
    ctx.moveTo(0, 0);

    var incrementer = 1;

    for (var i = 1; i < length; i+= incrementer) {
        var l = Math.log(i);
        var barHeight = Math.abs(this.freqBuffer[i]);
        ctx.lineTo(l*k, barHeight);

        if (l > incrementer * 1.5) {
            incrementer ++;
        }
    }

    ctx.stroke();

    ctx.strokeStyle = 'rgb(200,200,200)';
    ctx.setLineDash([6, 2]);

    for (i = -48; i < 40; i++) {
        var x = referenceBar + (octaveWidth * i / this.NOTES_IN_OCTAVE);

        ctx.beginPath();
        ctx.moveTo (x, 0);
        ctx.lineTo (x, height);
        ctx.stroke();
    }

    ctx.strokeStyle = 'rgb(50,50,50)';
    ctx.setLineDash([1]);

    for (i = -4; i <= 4; i++) {
        x = referenceBar + (octaveWidth * i);

        ctx.beginPath();
        ctx.moveTo (x, 0);
        ctx.lineTo (x, height);
        ctx.stroke();
    }
};
