/** @param {Object} config */
export default function squareParticles(config) {
    'use strict';
    var gl;
    var _particles = [];
    var playing = true;

    function parseConfig() {
        var _windowSize = window.innerHeight + window.innerWidth;
        if (!config) config = {};

        if (config.count == null)
            config.count = _windowSize < 1200 ? Math.round(_windowSize / 7) : 
                Math.round(_windowSize / 9);

        if (config.min_size == null)
            config.min_size = 2;

        if (config.aging == null)
            config.aging = true;

        if (config.color == null){
            config.color = function() {
                return [
                    (1 - Math.random()) / 100,
                    0,
                    (1 - Math.random()) / 1000,
                ];
            };
        }

        if (config.canvas == null){
            config.canvas = document.querySelector('canvas');
        } else if (config.canvas.constructor == String){
            config.canvas = document.querySelector(config.canvas);
        }

        config.max_size = config.max_size || Math.round(_windowSize / 400);
        config.max_speed = config.max_speed || 5;
        config.min_speed = config.min_speed || 0.5;
        config.collision = config.collision || false;
    }

    function resizeCanvas() {
        config.canvas.width = config.canvas.clientWidth;
        config.canvas.height = config.canvas.clientHeight;
    }

    function initialSetup() {
        parseConfig();
        if (!config.canvas)
            throw 'Canvas element not found !';

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        gl = config.canvas.getContext('webgl') ||
                         config.canvas.getContext('experimental-webgl');
        if (!gl)
            throw 'Your browser doesnt support WebGL';

        gl.viewport(0,0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.enable(gl.SCISSOR_TEST);
    }

    function render() {
        for(var i = 0; i < config.count; i++){
            _particles.push(new Particle());
        }
        renderParticles();
    }

    function renderParticles(){
        for(var i = 0; i < _particles.length; i++)
            _particles[i].draw();
        config.collision && setTimeout(calculateCollisions, 0);
        playing && requestAnimationFrame(renderParticles);
    }

    // Inelastic Collision
    function _iCol(p, o){
        var v_a = p.pSpeed;
        var m_a = p.pSize;

        var v_b = o.pSpeed;
        var m_b = o.pSize;

        var ab = m_a + m_b;
        var bb0 = m_b*v_b[0];
        var bb1 = m_b*v_b[1];
        var aa0 = m_a*v_a[0];
        var aa1 = m_a*v_a[1];

        p.pSpeed = [
            // v_a_x
            (m_b*(v_b[0] - v_a[0]) + aa0 + bb0) / (ab),
            // v_a_y
            (m_b*(v_b[1] - v_a[1]) + aa1 + bb1) / (ab)
        ];
        o.pSpeed = [
            // v_b_x
            (m_a*(v_a[0] - v_b[0]) + bb0 + aa0) / (ab),
            // v_b_y
            (m_a*(v_a[1] - v_b[1]) + bb1 + aa1) / (ab)
        ];
    }

    function calculateCollisions(){
        for(var i = 0; i < _particles.length-1; i++){
            var p = _particles[i];

            for(var j = i+1; j < _particles.length; j++){
                var o = _particles[j];

                var pCenter = p.center();
                var oCenter = o.center();
                if( Math.abs(pCenter[0] - oCenter[0]) < p.pSize &&
                    Math.abs(pCenter[1] - oCenter[1]) < p.pSize){
                    _iCol(p, o);
                }
            }
        }
    }

    /**
    * @constructor
    */
    function Particle() {
        this.reset = function reset() {
            if (config.max_age)
                this.max_age = typeof config.max_age == 'function' ?
                    config.max_age() : config.max_age;

            this.age = 0;
            this.rgb = typeof config.color == 'function' ? 
                config.color() : config.color;

            this.pos = [
                0 + Math.random()*gl.drawingBufferWidth,
                gl.drawingBufferHeight - Math.random()*gl.drawingBufferHeight
            ];
            this.pSize = config.min_size + 
              (config.max_size - config.min_size)*Math.random();

            this.pSpeed = [
                (config.min_speed + (config.max_speed - config.min_speed)*Math.random()) 
                  * Math.sign(Math.random() - 0.5),
                (config.min_speed + (config.max_speed - config.min_speed)*Math.random()) 
                  * Math.sign(Math.random() - 0.5)
            ];
        };

        this.draw = function draw() {
            var color = this.getColor();

            gl.scissor(this.pos[0], this.pos[1], this.pSize, this.pSize);
            gl.clearColor(color[0], color[1], color[2], 1);
            gl.clear(gl.COLOR_BUFFER_BIT);

            this.pos[0] += this.pSpeed[0];
            this.pos[1] -= this.pSpeed[1];
            config.aging && this.age++;

            if (this.pos[1] < 0 || this.pos[1] > gl.drawingBufferHeight ||
                this.pos[0] < 0 || this.pos[0] > gl.drawingBufferWidth || 
                (config.max_age && this.age > this.max_age)) {
                this.reset();
            }
        };

        // We could use getters but Closure Compiler doesnt fully
        // support them.
        this.getColor = function() {
            var _this = this;
            return this.rgb.map(function(x) {
                return x*_this.age;
            });            
        };

        this.center = function() {
            return [
                this.pos[0] + (this.pSize/2),
                this.pos[1] + (this.pSize/2),
            ];  
        };
        this.reset();
    }

    function resume(){
        playing = true;
        renderParticles();
    }

    initialSetup();
    render();

    return {
        'stop': function() {
            playing = false;
        },
        'resume': resume,
    };
}