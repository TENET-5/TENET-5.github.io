/**
 * PRISM STUDIO ENGINE
 * High-performance WebGL-based art engine with kinetic mouse smoothing and shader brushes.
 */

class PrismStudioEngine {
    constructor() {
        this.canvas = document.getElementById('prism-canvas');
        this.gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true, alpha: true, antialias: true });
        
        if (!this.gl) {
            console.error('WebGL not supported, falling back to experimental-webgl');
            this.gl = this.canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true, alpha: true, antialias: true });
        }

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // State
        this.isDrawing = false;
        this.currentTool = 'pencil';
        this.currentColor = [0.1, 0.1, 0.1, 1.0]; // normalized
        this.brushSize = 10.0;
        this.waterAmount = 0.5;
        this.paintLoad = 1.0;
        this.canvasGrain = 2.0; // 1=Fine, 2=Medium, 3=Rough
        
        // Kinetic Smoothing (LERP & Bezier)
        this.points = []; // Stores recent points for spline calculation
        this.lastX = 0;
        this.lastY = 0;
        this.velocity = 0;
        
        // Shaders
        this.programs = {};
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.initShaders();
        this.initBuffers();
        this.bindEvents();
        this.clearCanvas();
        
        // Render loop
        requestAnimationFrame(() => this.render());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    // --- WebGL Setup ---
    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    createProgram(vsSource, fsSource) {
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fsSource);
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program link error:', this.gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    initShaders() {
        // Vertex Shader (Common for brushes)
        const vsSource = `
            attribute vec2 a_position;
            uniform vec2 u_resolution;
            void main() {
                // Convert pixels to 0.0 to 1.0
                vec2 zeroToOne = a_position / u_resolution;
                // Convert to 0.0 to 2.0
                vec2 zeroToTwo = zeroToOne * 2.0;
                // Convert to -1.0 to +1.0 (clipspace)
                vec2 clipSpace = zeroToTwo - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                gl_PointSize = 1.0;
            }
        `;

        // Fragment Shader (Brush Physics & Canvas Tooth)
        const fsSource = `
            precision mediump float;
            uniform vec4 u_color;
            uniform float u_size;
            uniform vec2 u_center;
            uniform int u_tool_type; // 0=Pencil, 1=Watercolor, 2=Oil
            uniform float u_velocity;
            uniform float u_grain;
            uniform float u_water;
            uniform float u_load;
            
            // Random noise function for texture
            float rand(vec2 co){
                return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
            }

            // Procedural Canvas Tooth
            float canvasTooth(vec2 coord, float scale) {
                float nX = sin(coord.x * scale);
                float nY = sin(coord.y * scale);
                return (nX * nY) * 0.5 + 0.5; // 0.0 to 1.0
            }

            void main() {
                vec2 coord = gl_FragCoord.xy;
                float dist = distance(coord, u_center);
                
                if (dist > u_size) {
                    discard;
                }
                
                vec4 color = u_color;
                float tooth = canvasTooth(coord, u_grain * 0.1);
                
                if (u_tool_type == 0) {
                    // Pencil: skips over canvas valleys if lightly pressed
                    float noise = rand(coord) * 0.5 + 0.5;
                    float alpha = (1.0 - smoothstep(u_size * 0.8, u_size, dist)) * noise;
                    // Fast movement = lighter stroke
                    float velAlpha = clamp(1.0 - (u_velocity * 0.05), 0.2, 1.0);
                    
                    // Tooth interaction: only deposit on peaks unless load is high
                    if (tooth < (1.0 - u_load)) discard;
                    
                    color.a *= alpha * velAlpha * 0.8 * tooth;
                } 
                else if (u_tool_type == 1) {
                    // Watercolor: Capillary action, bleeds into valleys
                    float alpha = 1.0 - smoothstep(0.0, u_size * (1.0 + u_water), dist);
                    // Pigment settles in the valleys of the canvas
                    float settling = 1.0 - tooth; 
                    color.a *= pow(alpha, 1.5) * 0.15 * (0.5 + 0.5 * settling);
                    
                    // Approximate subtractive mixing via darken/multiply
                    // (WebGL handles this via blendFuncSeparate)
                }
                else if (u_tool_type == 2) {
                    // Oil: Thick, covers tooth, uses bristle texture
                    float noise = rand(coord * 0.1);
                    float bristle = smoothstep(0.4, 0.6, sin(coord.x * 2.0 + noise * 5.0) * sin(coord.y * 2.0));
                    float alpha = 1.0 - smoothstep(u_size * 0.9, u_size, dist);
                    color.rgb *= (0.8 + 0.2 * bristle); // texture shading
                    
                    // High load = opaque, covers tooth completely
                    color.a *= alpha * u_load;
                }
                
                gl_FragColor = color;
            }
        `;

        this.programs.brush = this.createProgram(vsSource, fsSource);
    }

    initBuffers() {
        this.positionBuffer = this.gl.createBuffer();
    }

    // --- Kinetic Smoothing & Drawing ---
    bindEvents() {
        this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        this.canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
        window.addEventListener('pointerup', () => this.onPointerUp());
        
        const gl = this.gl;
        
        // Tool Selection
        document.querySelectorAll('.tool-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-item').forEach(b => b.classList.remove('active'));
                const target = e.currentTarget;
                target.classList.add('active');
                this.currentTool = target.dataset.tool;
                
                // Pull pre-configured physical settings
                if (target.dataset.size) {
                    this.brushSize = parseFloat(target.dataset.size);
                    const sizeSlider = document.getElementById('brush-size');
                    if (sizeSlider) sizeSlider.value = this.brushSize;
                }
                if (target.dataset.load) {
                    this.paintLoad = parseFloat(target.dataset.load) / 100.0;
                    const loadSlider = document.getElementById('paint-load');
                    if (loadSlider) loadSlider.value = target.dataset.load;
                }
                if (target.dataset.water) {
                    this.waterAmount = parseFloat(target.dataset.water) / 100.0;
                    const waterSlider = document.getElementById('water-amount');
                    if (waterSlider) waterSlider.value = target.dataset.water;
                }
            });
        });

        // Layer Discipline
        document.querySelectorAll('.layer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                // In a full implementation, this swaps backing 2D buffers into WebGL
            });
        });

        // Color Selection
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const rgb = e.currentTarget.dataset.color.split(',');
                this.currentColor = [
                    parseInt(rgb[0]) / 255.0,
                    parseInt(rgb[1]) / 255.0,
                    parseInt(rgb[2]) / 255.0,
                    1.0
                ];
            });
        });

        const sizeSlider = document.getElementById('brush-size');
        if (sizeSlider) {
            sizeSlider.addEventListener('input', (e) => {
                this.brushSize = parseFloat(e.target.value);
            });
        }
        
        const waterSlider = document.getElementById('water-amount');
        if (waterSlider) {
            waterSlider.addEventListener('input', (e) => {
                this.waterAmount = parseFloat(e.target.value) / 100.0;
            });
        }
        
        const loadSlider = document.getElementById('paint-load');
        if (loadSlider) {
            loadSlider.addEventListener('input', (e) => {
                this.paintLoad = parseFloat(e.target.value) / 100.0;
            });
        }
        
        const grainSelect = document.getElementById('canvas-grain');
        if (grainSelect) {
            grainSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === 'fine') this.canvasGrain = 4.0;
                else if (val === 'rough') this.canvasGrain = 1.0;
                else this.canvasGrain = 2.0; // medium
            });
        }

        const btnClear = document.getElementById('btn-clear');
        if (btnClear) btnClear.addEventListener('click', () => this.clearCanvas());

        const btnExport = document.getElementById('btn-export');
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                // 4K Export Logic
                const dataURL = this.canvas.toDataURL('image/png', 1.0);
                const link = document.createElement('a');
                link.download = 'prism_studio_masterpiece_4k.png';
                link.href = dataURL;
                link.click();
            });
        }

        const btnAtmosphere = document.getElementById('btn-atmosphere');
        if (btnAtmosphere) {
            btnAtmosphere.addEventListener('click', () => {
                document.getElementById('studio-atmosphere').classList.toggle('golden');
            });
        }
    }

    hexToRgb(hex) {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;
        return [r, g, b, 1.0];
    }

    setColor(hex) {
        this.currentColor = this.hexToRgb(hex);
    }

    onPointerDown(e) {
        this.isDrawing = true;
        this.points = [];
        this.addPoint(e.clientX, e.clientY);
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.velocity = 0;
    }

    onPointerMove(e) {
        if (!this.isDrawing) return;
        
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;
        this.velocity = Math.sqrt(dx*dx + dy*dy);
        
        this.addPoint(e.clientX, e.clientY);
        
        // If we have enough points, calculate quadratic bezier spline
        if (this.points.length >= 3) {
            const p0 = this.points[this.points.length - 3];
            const p1 = this.points[this.points.length - 2];
            const p2 = this.points[this.points.length - 1];
            
            // Generate points along the curve
            const steps = Math.max(5, Math.floor(this.velocity));
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const xt = Math.pow(1-t, 2)*p0.x + 2*(1-t)*t*p1.x + Math.pow(t, 2)*p2.x;
                const yt = Math.pow(1-t, 2)*p0.y + 2*(1-t)*t*p1.y + Math.pow(t, 2)*p2.y;
                
                this.drawStamp(xt, yt, this.velocity);
            }
        } else {
            this.drawStamp(e.clientX, e.clientY, this.velocity);
        }

        this.lastX = e.clientX;
        this.lastY = e.clientY;
    }

    onPointerUp() {
        this.isDrawing = false;
        this.points = [];
    }

    addPoint(x, y) {
        this.points.push({x, y});
    }

    // --- WebGL Rendering ---
    drawStamp(x, y, velocity) {
        const gl = this.gl;
        const program = this.programs.brush;
        gl.useProgram(program);

        // Adjust for retina
        x *= window.devicePixelRatio;
        y *= window.devicePixelRatio;
        let size = this.brushSize * window.devicePixelRatio;
        
        // Tool specific blending
        let toolType = 0;
        if (this.currentTool === 'pencil') {
            toolType = 0;
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        } else if (this.currentTool === 'watercolor') {
            toolType = 1;
            // Multiply blend equivalent for watercolor
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        } else if (this.currentTool === 'oil') {
            toolType = 2;
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            size *= 1.5; // Oil brush is thicker
        }

        gl.enable(gl.BLEND);

        // Setup attributes/uniforms
        const positionLocation = gl.getAttribLocation(program, "a_position");
        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        const colorLocation = gl.getUniformLocation(program, "u_color");
        const sizeLocation = gl.getUniformLocation(program, "u_size");
        const centerLocation = gl.getUniformLocation(program, "u_center");
        const toolTypeLocation = gl.getUniformLocation(program, "u_tool_type");
        const velocityLocation = gl.getUniformLocation(program, "u_velocity");
        const grainLocation = gl.getUniformLocation(program, "u_grain");
        const waterLocation = gl.getUniformLocation(program, "u_water");
        const loadLocation = gl.getUniformLocation(program, "u_load");

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        
        // Draw a quad covering the stamp bounds to run the fragment shader
        const x1 = x - size * 2; // Expand quad slightly to cover fluid bleed
        const x2 = x + size * 2;
        const y1 = y - size * 2;
        const y2 = y + size * 2;
        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2,
        ]), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform4fv(colorLocation, this.currentColor);
        gl.uniform1f(sizeLocation, size);
        gl.uniform2f(centerLocation, x, gl.canvas.height - y); // WebGL Y is flipped
        gl.uniform1i(toolTypeLocation, toolType);
        gl.uniform1f(velocityLocation, velocity);
        gl.uniform1f(grainLocation, this.canvasGrain);
        gl.uniform1f(waterLocation, this.waterAmount);
        gl.uniform1f(loadLocation, this.paintLoad);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    clearCanvas() {
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    render() {
        // Animation frame loop for continuous effects if needed
        requestAnimationFrame(() => this.render());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.prismStudio = new PrismStudioEngine();
});
