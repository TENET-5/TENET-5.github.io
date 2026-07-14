/**
 * PRISM STUDIO ENGINE
 * High-performance WebGL-based art engine with kinetic mouse smoothing,
 * shader brushes, and Multi-Framebuffer Compositing (Layer Discipline).
 */

class PrismStudioEngine {
    constructor() {
        this.canvas = document.getElementById('prism-canvas');
        this.gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: false, alpha: true, antialias: true });
        
        if (!this.gl) {
            console.error('WebGL not supported, falling back to experimental-webgl');
            this.gl = this.canvas.getContext('experimental-webgl', { preserveDrawingBuffer: false, alpha: true, antialias: true });
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
        
        this.activeLayerIndex = 0; // 0=Underpainting, 1=Glaze, 2=Final
        
        // Kinetic Smoothing (LERP & Bezier)
        this.points = []; 
        this.lastX = 0;
        this.lastY = 0;
        this.velocity = 0;
        
        // Render Targets (FBOs)
        this.layers = [];
        this.programs = {};
        // Binding input
        this.bindEvents();
        this.initLirilTutorial();
        this.initHotkeys();
    }

    initLirilTutorial() {
        const btn = document.getElementById('btn-dismiss-liril');
        const overlay = document.getElementById('liril-hologram');
        if (btn && overlay) {
            btn.addEventListener('click', () => {
                overlay.classList.remove('active');
            });
        }
    }

    initHotkeys() {
        window.addEventListener('keydown', (e) => {
            const sizeSlider = document.getElementById('paint-load'); // actually there's no brush size slider yet, just buttons.
            if (e.key === 'e' || e.key === 'E') {
                document.querySelector('[data-tool="eraser"]').click();
            } else if (e.key === 'm' || e.key === 'M') {
                // Future palette knife trigger
            }
        });
    }

    init() {
        this.initShaders();
        this.initBuffers();
        this.resize(); // calls initFBOs implicitly if size changes
        this.bindEvents();
        this.clearCanvas();
        
        window.addEventListener('resize', () => this.resize());
        
        // Render loop for compositing
        requestAnimationFrame(() => this.render());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // Handle Retina/High-DPI
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        
        this.initFBOs(this.canvas.width, this.canvas.height);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        
        // Trigger a composite redraw
        this.needsComposite = true;
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
        // Vertex Shader (Common for brushes & composite)
        const vsSource = `
            attribute vec2 a_position;
            uniform vec2 u_resolution;
            varying vec2 v_texCoord;
            void main() {
                vec2 zeroToOne = a_position / u_resolution;
                v_texCoord = zeroToOne; // For compositing
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                gl_PointSize = 1.0;
            }
        `;

        // Fragment Shader (Brush Physics)
        const fsBrush = `
            precision mediump float;
            uniform vec4 u_color;
            uniform float u_size;
            uniform vec2 u_center;
            uniform int u_tool_type; // 0=Pencil, 1=Watercolor, 2=Oil, 3=Eraser
            uniform float u_velocity;
            uniform float u_grain;
            uniform float u_water;
            uniform float u_load;
            uniform sampler2D u_stampTex;
            uniform sampler2D u_scratchTex;
            uniform vec2 u_velocity_vec;
            
            float rand(vec2 co){
                return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
            }

            float canvasTooth(vec2 coord, float scale) {
                float nX = sin(coord.x * scale);
                float nY = sin(coord.y * scale);
                return (nX * nY) * 0.5 + 0.5;
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
                    // Pencil
                    float noise = rand(coord) * 0.5 + 0.5;
                    float alpha = (1.0 - smoothstep(u_size * 0.8, u_size, dist)) * noise;
                    float velAlpha = clamp(1.0 - (u_velocity * 0.05), 0.2, 1.0);
                    if (tooth < (1.0 - u_load)) discard;
                    color.a *= alpha * velAlpha * 0.8 * tooth;
                } 
                else if (u_tool_type == 1) {
                    // Watercolor
                    float alpha = 1.0 - smoothstep(0.0, u_size * (1.0 + u_water), dist);
                    float settling = 1.0 - tooth; 
                    color.a *= pow(alpha, 1.5) * 0.15 * (0.5 + 0.5 * settling);
                }
                else if (u_tool_type == 2) {
                    // Oil: Thick Impasto Height Maps
                    float noise = rand(coord * 0.1);
                    float bristle = smoothstep(0.4, 0.6, sin(coord.x * 2.0 + noise * 5.0) * sin(coord.y * 2.0));
                    float heightMap = rand(coord * 0.5) * 0.5 + 0.5; // High freq noise for bump
                    float alpha = 1.0 - smoothstep(u_size * 0.9, u_size, dist);
                    color.rgb *= (0.8 + 0.2 * bristle);
                    // Output thick physical volume
                    color.a *= alpha * u_load * (0.5 + 0.5 * heightMap);
                }
                else if (u_tool_type == 3) {
                    // Eraser: outputs an alpha mask that glBlendFunc will subtract
                    float alpha = 1.0 - smoothstep(u_size * 0.8, u_size, dist);
                    color = vec4(1.0, 1.0, 1.0, alpha * u_load);
                }
                else if (u_tool_type == 4) {
                    // Alcohol Marker: Multiply blend
                    float alpha = 1.0 - smoothstep(u_size * 0.5, u_size, dist);
                    color.rgb *= 1.5; // Saturated dye
                    color.a *= alpha * u_load * 0.3;
                }
                else if (u_tool_type == 5) {
                    // Typography Stamp: sample the generated letter texture
                    // coord is absolute, we need to map the stamp to the brush center
                    vec2 stampCoord = (coord - u_center + vec2(u_size)) / (u_size * 2.0);
                    // Flip Y for WebGL
                    stampCoord.y = 1.0 - stampCoord.y;
                    if (stampCoord.x < 0.0 || stampCoord.x > 1.0 || stampCoord.y < 0.0 || stampCoord.y > 1.0) discard;
                    
                    vec4 stampSample = texture2D(u_stampTex, stampCoord);
                    float alpha = stampSample.a * u_load;
                    color.a *= alpha;
                }
                else if (u_tool_type == 6) {
                    // Palette Knife (Right Click Smudge) - Displace existing pixels
                    // Read the scratch texture, offset by velocity
                    vec2 uv = coord / u_resolution;
                    float influence = 1.0 - smoothstep(0.0, u_size, dist);
                    vec2 offset = (u_velocity_vec * influence * 0.05) / u_resolution;
                    
                    vec4 smeared = texture2D(u_scratchTex, uv - offset);
                    // Output the smeared pixels directly (using ZERO, SRC_COLOR blend mode)
                    color = smeared;
                }
                
                // Premultiply alpha for correct WebGL blending in FBO
                if (u_tool_type != 3 && u_tool_type != 4 && u_tool_type != 6) {
                    color.rgb *= color.a;
                }
                gl_FragColor = color;
            }
        `;

        // Fragment Shader (Compositing Layers with Physical Lighting)
        const fsComposite = `
            precision mediump float;
            varying vec2 v_texCoord;
            uniform sampler2D u_layer0; // Underpainting
            uniform sampler2D u_layer1; // Glaze
            uniform sampler2D u_layer2; // Final Pass
            uniform vec2 u_resolution;

            // Standard Alpha Blending (Front over Back)
            vec4 blend(vec4 front, vec4 back) {
                // Since FBOs store premultiplied alpha
                float outA = front.a + back.a * (1.0 - front.a);
                if (outA == 0.0) return vec4(0.0);
                vec3 outRGB = front.rgb + back.rgb * (1.0 - front.a);
                return vec4(outRGB, outA);
            }

            // Alpha thickness determines height map
            float getThickness(vec2 uv) {
                vec4 c0 = texture2D(u_layer0, uv);
                vec4 c1 = texture2D(u_layer1, uv);
                vec4 c2 = texture2D(u_layer2, uv);
                return blend(c2, blend(c1, c0)).a;
            }

            void main() {
                vec2 uv = v_texCoord;
                // WebGL Y is flipped relative to textures drawn in FBOs
                uv.y = 1.0 - uv.y;
                
                vec4 c0 = texture2D(u_layer0, uv);
                vec4 c1 = texture2D(u_layer1, uv);
                vec4 c2 = texture2D(u_layer2, uv);
                
                vec4 finalOut = blend(c2, blend(c1, c0));
                
                // Bump Mapping / Impasto Lighting
                vec2 texel = 1.0 / u_resolution;
                
                // Sample neighbors for height map gradient
                float hL = getThickness(uv + vec2(-texel.x, 0.0));
                float hR = getThickness(uv + vec2(texel.x, 0.0));
                float hU = getThickness(uv + vec2(0.0, -texel.y)); // Flipped Y sampling
                float hD = getThickness(uv + vec2(0.0, texel.y));
                float hC = finalOut.a;
                
                // Calculate Normal Vector
                vec3 normal = normalize(vec3((hL - hR) * 1.5, (hD - hU) * 1.5, 0.1));
                
                // Directional Lighting
                vec3 lightDir = normalize(vec3(0.5, 0.5, 1.0));
                float diff = max(dot(normal, lightDir), 0.0);
                
                // Specular Highlight (Wet Paint)
                vec3 viewDir = vec3(0.0, 0.0, 1.0);
                vec3 halfDir = normalize(lightDir + viewDir);
                float spec = pow(max(dot(normal, halfDir), 0.0), 32.0) * hC; // Only shine thick paint
                
                // Ambient Occlusion
                float ao = clamp(0.7 + 0.3 * hC, 0.0, 1.0);
                
                // Apply Lighting Model
                vec3 litColor = finalOut.rgb * (0.8 * ao + 0.3 * diff);
                litColor += vec3(1.0, 0.95, 0.9) * spec * 0.5; // Golden specular
                
                gl_FragColor = vec4(litColor, finalOut.a);
            }
        `;

        this.programs.brush = this.createProgram(vsSource, fsBrush);
        this.programs.composite = this.createProgram(vsSource, fsComposite);
    }

    initBuffers() {
        this.positionBuffer = this.gl.createBuffer();
    }

    initFBOs(width, height) {
        const gl = this.gl;
        
        // Clean up old FBOs if they exist
        if (this.layers.length > 0) {
            this.layers.forEach(layer => {
                gl.deleteTexture(layer.texture);
                gl.deleteFramebuffer(layer.fbo);
            });
            this.layers = [];
        }

        // Create 3 layers: Underpainting, Glaze, Final
        for (let i = 0; i < 3; i++) {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

            this.layers.push({ texture, fbo });
        }
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
        // Scratch Texture for smudging
        if (this.scratchTexture) gl.deleteTexture(this.scratchTexture);
        this.scratchTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.scratchTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        // Typography Stamp Texture Setup
        if (!this.stampCanvas) {
            this.stampCanvas = document.createElement('canvas');
            this.stampCanvas.width = 128;
            this.stampCanvas.height = 128;
            this.stampCtx = this.stampCanvas.getContext('2d');
            this.stampTexture = gl.createTexture();
        }
    }

    // --- Kinetic Smoothing & Drawing ---
    bindEvents() {
        window.addEventListener('contextmenu', e => e.preventDefault()); // Disable native right click
        this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        window.addEventListener('pointerup', () => this.onPointerUp());
        
        // Dynamic Cursor Element
        this.cursorElement = document.getElementById('dynamic-cursor');
        
        this.canvas.addEventListener('pointerenter', () => {
            if (this.cursorElement) this.cursorElement.style.display = 'block';
        });
        
        this.canvas.addEventListener('pointerleave', () => {
            if (this.cursorElement && !this.isDrawing) this.cursorElement.style.display = 'none';
        });
        
        window.addEventListener('pointermove', (e) => {
            this.onPointerMove(e);
            
            // Update Cursor Position & Size
            if (this.cursorElement && (e.target === this.canvas || this.isDrawing)) {
                this.cursorElement.style.display = 'block';
                this.cursorElement.style.left = `${e.clientX}px`;
                this.cursorElement.style.top = `${e.clientY}px`;
                
                const pressure = e.pressure !== undefined && e.pressure > 0 ? e.pressure : 0.5;
                const visualSize = this.brushSize * 2 * (0.5 + pressure);
                this.cursorElement.style.width = `${visualSize}px`;
                this.cursorElement.style.height = `${visualSize}px`;
            } else if (this.cursorElement) {
                this.cursorElement.style.display = 'none';
            }
        });
        
        // Tool Selection
        document.querySelectorAll('.tool-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-item').forEach(b => b.classList.remove('active'));
                const target = e.currentTarget;
                target.classList.add('active');
                this.currentTool = target.dataset.tool;
                
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

        // Layer Discipline Selection
        document.querySelectorAll('.layer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.activeLayerIndex = parseInt(e.currentTarget.dataset.layer);
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

        // Overrides
        const btnClear = document.getElementById('btn-clear');
        if (btnClear) btnClear.addEventListener('click', () => this.clearCanvas());

        const btnExport = document.getElementById('btn-export');
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                // Force a composite to main canvas just before export
                this.compositeLayers();
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
        
        // UI Sync setup
        const sizeSlider = document.getElementById('brush-size');
        if (sizeSlider) {
            sizeSlider.addEventListener('input', (e) => {
                this.brushSize = parseFloat(e.target.value);
                // Show cursor preview briefly
                if (this.cursorElement) {
                    this.cursorElement.style.display = 'block';
                    this.cursorElement.style.width = `${this.brushSize * 2}px`;
                    this.cursorElement.style.height = `${this.brushSize * 2}px`;
                    clearTimeout(this.cursorTimeout);
                    this.cursorTimeout = setTimeout(() => {
                        if (!this.isDrawing) this.cursorElement.style.display = 'none';
                    }, 1000);
                }
            });
        }
        const loadSlider = document.getElementById('paint-load');
        if (loadSlider) loadSlider.addEventListener('input', (e) => this.paintLoad = parseFloat(e.target.value) / 100.0);
        
        const waterSlider = document.getElementById('water-amount');
        if (waterSlider) waterSlider.addEventListener('input', (e) => this.waterAmount = parseFloat(e.target.value) / 100.0);
        
        const grainSelect = document.getElementById('canvas-grain');
        if (grainSelect) grainSelect.addEventListener('change', e => {
            const val = e.target.value;
            this.canvasGrain = val === 'fine' ? 4.0 : val === 'rough' ? 1.0 : 2.0;
        });
        
        // --- Mixing Palette Setup ---
        this.mixingCanvas = document.getElementById('mixing-canvas');
        if (this.mixingCanvas) {
            this.mixingCtx = this.mixingCanvas.getContext('2d', { willReadFrequently: true });
            this.mixingIsDrawing = false;
            
            // Initial size based on CSS
            setTimeout(() => {
                const rect = this.mixingCanvas.parentElement.getBoundingClientRect();
                this.mixingCanvas.width = rect.width - 20; // account for padding
                this.mixingCanvas.height = 150;
                
                // Fill with base wood tone so mix mode works (simulated)
                this.mixingCtx.fillStyle = '#5c3a21';
                this.mixingCtx.fillRect(0, 0, this.mixingCanvas.width, this.mixingCanvas.height);
            }, 100);
            
            this.mixingCanvas.addEventListener('pointerdown', (e) => {
                if (e.button !== 0) return;
                this.mixingIsDrawing = true;
                this.mixingCtx.beginPath();
                this.mixingCtx.moveTo(e.offsetX, e.offsetY);
                // Subtle ripple on the canvas container
                this.mixingCanvas.parentElement.style.transform = 'scale(0.99)';
            });
            
            this.mixingCanvas.addEventListener('pointermove', (e) => {
                if (!this.mixingIsDrawing) return;
                this.mixingCtx.lineWidth = this.brushSize * ((e.pressure || 0.5) * 1.5);
                this.mixingCtx.lineCap = 'round';
                this.mixingCtx.lineJoin = 'round';
                
                const c = this.currentColor;
                this.mixingCtx.strokeStyle = `rgba(${c[0]*255}, ${c[1]*255}, ${c[2]*255}, ${Math.min(1.0, this.paintLoad * 2)})`;
                
                this.mixingCtx.lineTo(e.offsetX, e.offsetY);
                this.mixingCtx.stroke();
            });
            
            window.addEventListener('pointerup', () => {
                this.mixingIsDrawing = false;
                if (this.mixingCanvas) this.mixingCanvas.parentElement.style.transform = 'none';
            });
        }
    }

    onPointerDown(e) {
        if (e.button !== 0 && e.button !== 2) return; // Allow primary and secondary
        this.isDrawing = true;
        this.isSmudging = (e.button === 2); // Right click is Palette Knife / Smudge
        this.points = [];
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.velocity = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        const pressure = e.pressure !== undefined && e.pressure > 0 ? e.pressure : 0.5;
        this.addPoint(e.clientX, e.clientY, pressure);
    }

    onPointerMove(e) {
        if (!this.isDrawing) return;
        
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;
        this.velocityX = dx;
        this.velocityY = dy;
        this.velocity = Math.sqrt(dx*dx + dy*dy);
        const pressure = e.pressure !== undefined && e.pressure > 0 ? e.pressure : 0.5;
        
        this.addPoint(e.clientX, e.clientY, pressure);
        
        if (this.points.length >= 3) {
            const p0 = this.points[this.points.length - 3];
            const p1 = this.points[this.points.length - 2];
            const p2 = this.points[this.points.length - 1];
            
            // Adaptive Step Distance Interpolation
            const dpr = window.devicePixelRatio || 1;
            const baseBrushSize = this.brushSize * dpr;
            const stepDistance = Math.max(1.0, baseBrushSize * 0.15); // Smooth overlapping
            
            const dist = Math.sqrt(Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2));
            const steps = Math.max(1, Math.floor(dist / stepDistance));
            
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const xt = Math.pow(1-t, 2)*p0.x + 2*(1-t)*t*p1.x + Math.pow(t, 2)*p2.x;
                const yt = Math.pow(1-t, 2)*p0.y + 2*(1-t)*t*p1.y + Math.pow(t, 2)*p2.y;
                const pt = Math.pow(1-t, 2)*p0.p + 2*(1-t)*t*p1.p + Math.pow(t, 2)*p2.p;
                
                this.drawStamp(xt, yt, this.velocity, pt);
            }
        } else {
            this.drawStamp(e.clientX, e.clientY, this.velocity, pressure);
        }

        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.needsComposite = true; // Signal render loop to update screen
    }

    onPointerUp() {
        this.isDrawing = false;
        this.points = [];
    }

    addPoint(x, y, p) {
        this.points.push({x, y, p});
    }

    // --- WebGL Rendering ---
    drawStamp(x, y, velocity, pressure = 0.5) {
        const gl = this.gl;
        
        // 1. Bind the target FBO layer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.layers[this.activeLayerIndex].fbo);
        
        // 2. Setup shader
        const program = this.programs.brush;
        gl.useProgram(program);

        const dpr = window.devicePixelRatio || 1;
        x *= dpr;
        y *= dpr;
        
        // Stylus Pressure affects size (50% to 150%)
        let size = this.brushSize * dpr * (0.5 + pressure);
        
        // Stylus Pressure affects paint load
        let currentLoad = Math.min(1.0, this.paintLoad * (0.5 + pressure));
        
        let toolType = 0;
        if (this.isSmudging) {
            toolType = 6;
            // Smudge: Copy FBO to scratch, sample scratch, write to FBO
            gl.bindTexture(gl.TEXTURE_2D, this.scratchTexture);
            gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, this.canvas.width, this.canvas.height, 0);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.scratchTexture);
            gl.uniform1i(gl.getUniformLocation(program, "u_scratchTex"), 1);
            gl.uniform2f(gl.getUniformLocation(program, "u_velocity_vec"), this.velocityX || 0, -(this.velocityY || 0)); // flip Y
            
            // Opaque override (completely replace pixel with smeared pixel)
            gl.blendFunc(gl.ONE, gl.ZERO);
        } else if (this.currentTool === 'pencil') {
            toolType = 0;
            // Standard Premultiplied Alpha
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        } else if (this.currentTool === 'watercolor') {
            toolType = 1;
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        } else if (this.currentTool === 'oil') {
            toolType = 2;
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            size *= 1.5; 
        } else if (this.currentTool === 'eraser') {
            toolType = 3;
            // Erase: Subtract alpha from destination
            gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
        } else if (this.currentTool === 'marker') {
            toolType = 4;
            // Multiply blend
            gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
        } else if (this.currentTool === 'stamp') {
            toolType = 5;
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            
            // Generate letter texture on the fly
            const letterInput = document.getElementById('stamp-letter');
            const letter = letterInput ? letterInput.value : 'A';
            this.stampCtx.clearRect(0, 0, 128, 128);
            this.stampCtx.fillStyle = 'rgba(255,255,255,1.0)'; // Pure white mask
            this.stampCtx.font = 'bold 100px Inter, sans-serif';
            this.stampCtx.textAlign = 'center';
            this.stampCtx.textBaseline = 'middle';
            this.stampCtx.fillText(letter, 64, 64);
            
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.stampTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.stampCanvas);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.uniform1i(gl.getUniformLocation(program, "u_stampTex"), 0);
        }

        gl.enable(gl.BLEND);

        // 3. Draw Quad
        const positionLocation = gl.getAttribLocation(program, "a_position");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        
        const x1 = x - size * 2; 
        const x2 = x + size * 2;
        const y1 = y - size * 2;
        const y2 = y + size * 2;
        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,  x2, y1,  x1, y2,
            x1, y2,  x2, y1,  x2, y2,
        ]), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), this.canvas.width, this.canvas.height);
        gl.uniform4fv(gl.getUniformLocation(program, "u_color"), this.currentColor);
        gl.uniform1f(gl.getUniformLocation(program, "u_size"), size);
        gl.uniform2f(gl.getUniformLocation(program, "u_center"), x, this.canvas.height - y); // WebGL Y flipped
        gl.uniform1i(gl.getUniformLocation(program, "u_tool_type"), toolType);
        gl.uniform1f(gl.getUniformLocation(program, "u_velocity"), velocity);
        gl.uniform1f(gl.getUniformLocation(program, "u_grain"), this.canvasGrain);
        gl.uniform1f(gl.getUniformLocation(program, "u_water"), this.waterAmount);
        gl.uniform1f(gl.getUniformLocation(program, "u_load"), currentLoad);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        // Unbind
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    compositeLayers() {
        const gl = this.gl;
        const program = this.programs.composite;
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(program);
        
        // Full screen quad
        const positionLocation = gl.getAttribLocation(program, "a_position");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0, 0,  this.canvas.width, 0,  0, this.canvas.height,
            0, this.canvas.height,  this.canvas.width, 0,  this.canvas.width, this.canvas.height,
        ]), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), this.canvas.width, this.canvas.height);

        // Bind the 3 layer textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.layers[0].texture);
        gl.uniform1i(gl.getUniformLocation(program, "u_layer0"), 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.layers[1].texture);
        gl.uniform1i(gl.getUniformLocation(program, "u_layer1"), 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.layers[2].texture);
        gl.uniform1i(gl.getUniformLocation(program, "u_layer2"), 2);

        // Compositor handles blending mathematically, no gl.BLEND needed for final push to screen
        gl.disable(gl.BLEND);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    clearCanvas() {
        const gl = this.gl;
        // Clear all layers
        this.layers.forEach(layer => {
            gl.bindFramebuffer(gl.FRAMEBUFFER, layer.fbo);
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        });
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.needsComposite = true;
    }

    render() {
        if (this.needsComposite) {
            this.compositeLayers();
            this.needsComposite = false;
        }
        requestAnimationFrame(() => this.render());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.prismStudio = new PrismStudioEngine();
});
