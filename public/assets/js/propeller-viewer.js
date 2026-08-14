(() => {
  const viewers = document.querySelectorAll('[data-stl-viewer]');
  if (!viewers.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

  function parsePropellerMesh(buffer) {
    if (buffer.byteLength < 16) throw new Error('Invalid propeller mesh');

    const bytes = new Uint8Array(buffer, 0, 8);
    const signature = String.fromCharCode(...bytes);
    const view = new DataView(buffer);
    const vertexCount = view.getUint32(8, true);
    const indexCount = view.getUint32(12, true);
    const positionOffset = 16;
    const indexOffset = positionOffset + vertexCount * 3 * Int16Array.BYTES_PER_ELEMENT;
    const expectedLength = indexOffset + indexCount * Uint16Array.BYTES_PER_ELEMENT;

    if (signature !== 'P3DMESH1'
      || !vertexCount
      || !indexCount
      || indexCount % 3 !== 0
      || expectedLength !== buffer.byteLength) {
      throw new Error('Invalid propeller mesh geometry');
    }

    const positions = new Int16Array(buffer, positionOffset, vertexCount * 3);
    const indices = new Uint16Array(buffer, indexOffset, indexCount);
    const normals = new Float32Array(vertexCount * 3);

    for (let index = 0; index < indexCount; index += 3) {
      const a = indices[index] * 3;
      const b = indices[index + 1] * 3;
      const c = indices[index + 2] * 3;
      const abx = positions[b] - positions[a];
      const aby = positions[b + 1] - positions[a + 1];
      const abz = positions[b + 2] - positions[a + 2];
      const acx = positions[c] - positions[a];
      const acy = positions[c + 1] - positions[a + 1];
      const acz = positions[c + 2] - positions[a + 2];
      const nx = aby * acz - abz * acy;
      const ny = abz * acx - abx * acz;
      const nz = abx * acy - aby * acx;

      for (const vertex of [a, b, c]) {
        normals[vertex] += nx;
        normals[vertex + 1] += ny;
        normals[vertex + 2] += nz;
      }
    }

    for (let index = 0; index < normals.length; index += 3) {
      const length = Math.hypot(normals[index], normals[index + 1], normals[index + 2]) || 1;
      normals[index] /= length;
      normals[index + 1] /= length;
      normals[index + 2] /= length;
    }

    return { positions, normals, indices, indexCount };
  }

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message || 'Unable to compile WebGL shader');
    }
    return shader;
  }

  function createProgram(gl) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, `
      precision highp float;
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      uniform vec3 uRotation;
      uniform float uZoom;
      uniform float uAspect;
      varying vec3 vNormal;
      varying vec3 vPosition;

      mat3 rotateX(float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
      }

      mat3 rotateY(float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
      }

      mat3 rotateZ(float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0);
      }

      void main() {
        mat3 rotation = rotateZ(uRotation.z) * rotateY(uRotation.y) * rotateX(uRotation.x);
        vec3 position = rotation * aPosition;
        vec3 viewPosition = position - vec3(0.0, 0.0, 2.05 / uZoom);
        float focalLength = 2.75;
        float nearPlane = 0.1;
        float farPlane = 10.0;
        float depthA = (farPlane + nearPlane) / (nearPlane - farPlane);
        float depthB = (2.0 * farPlane * nearPlane) / (nearPlane - farPlane);

        vNormal = rotation * aNormal;
        vPosition = position;
        gl_Position = vec4(
          position.x * focalLength / uAspect,
          position.y * focalLength,
          depthA * viewPosition.z + depthB,
          -viewPosition.z
        );
      }
    `);

    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vec3 normal = normalize(vNormal);
        if (!gl_FrontFacing) normal = -normal;

        vec3 keyLight = normalize(vec3(-0.42, 0.72, 1.0));
        vec3 fillLight = normalize(vec3(0.86, -0.28, 0.46));
        vec3 viewDirection = normalize(vec3(0.0, 0.0, 2.6) - vPosition);
        float key = max(dot(normal, keyLight), 0.0);
        float fill = max(dot(normal, fillLight), 0.0);
        float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.2);
        float specular = pow(max(dot(normal, normalize(keyLight + viewDirection)), 0.0), 42.0);

        vec3 orange = vec3(0.941, 0.541, 0.306);
        vec3 teal = vec3(0.541, 0.714, 0.714);
        vec3 colour = orange * (0.28 + key * 0.72 + fill * 0.16);
        colour += teal * rim * 0.42;
        colour += vec3(1.0, 0.97, 0.9) * specular * 0.38;
        gl_FragColor = vec4(colour, 1.0);
      }
    `);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(message || 'Unable to link WebGL program');
    }

    return program;
  }

  async function initialiseViewer(viewer) {
    const stage = viewer.querySelector('[data-propeller-stage]');
    const canvas = viewer.querySelector('[data-propeller-canvas]');
    const status = viewer.querySelector('[data-propeller-status]');
    const controls = viewer.querySelectorAll('[data-propeller-action]');

    try {
      status.textContent = viewer.dataset.loading || status.textContent;
      const response = await fetch(viewer.dataset.model);
      if (!response.ok) throw new Error(`Unable to load 3D mesh (${response.status})`);
      const geometry = parsePropellerMesh(await response.arrayBuffer());
      const gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        depth: true,
        powerPreference: 'high-performance',
      });
      if (!gl) throw new Error('WebGL is unavailable');

      const program = createProgram(gl);
      const positionBuffer = gl.createBuffer();
      const normalBuffer = gl.createBuffer();
      const indexBuffer = gl.createBuffer();
      const positionLocation = gl.getAttribLocation(program, 'aPosition');
      const normalLocation = gl.getAttribLocation(program, 'aNormal');
      const rotationLocation = gl.getUniformLocation(program, 'uRotation');
      const zoomLocation = gl.getUniformLocation(program, 'uZoom');
      const aspectLocation = gl.getUniformLocation(program, 'uAspect');

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.disable(gl.CULL_FACE);
      gl.clearColor(0, 0, 0, 0);

      const initial = { x: -0.72, y: 0.12, z: -0.30, zoom: 1 };
      const state = { ...initial };
      let activePointer = null;
      let previousX = 0;
      let previousY = 0;
      let pauseUntil = 0;
      let previousFrame = 0;
      let frame = 0;
      let visible = true;

      const resizeCanvas = () => {
        const bounds = canvas.getBoundingClientRect();
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.round(bounds.width * pixelRatio));
        const height = Math.max(1, Math.round(bounds.height * pixelRatio));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        gl.viewport(0, 0, width, height);
        return width / height;
      };

      const draw = (time = performance.now()) => {
        frame = 0;
        if (!visible) return;

        if (!reducedMotion.matches && time > pauseUntil) {
          const elapsed = previousFrame ? Math.min(time - previousFrame, 40) : 0;
          state.z += elapsed * 0.00016;
        }
        previousFrame = time;

        const aspect = resizeCanvas();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.SHORT, true, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.enableVertexAttribArray(normalLocation);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        gl.uniform3f(rotationLocation, state.x, state.y, state.z);
        gl.uniform1f(zoomLocation, state.zoom);
        gl.uniform1f(aspectLocation, aspect);
        gl.drawElements(gl.TRIANGLES, geometry.indexCount, gl.UNSIGNED_SHORT, 0);

        if (!reducedMotion.matches) frame = window.requestAnimationFrame(draw);
      };

      const requestDraw = () => {
        if (!frame && visible) frame = window.requestAnimationFrame(draw);
      };

      const pauseRotation = () => {
        pauseUntil = performance.now() + 5000;
      };

      const resetView = () => {
        Object.assign(state, initial);
        pauseRotation();
        requestDraw();
      };

      const changeZoom = (amount) => {
        state.zoom = clamp(state.zoom + amount, 0.72, 1.36);
        pauseRotation();
        requestDraw();
      };

      stage.addEventListener('pointerdown', (event) => {
        if (event.button !== 0 || event.target.closest('button')) return;
        activePointer = event.pointerId;
        previousX = event.clientX;
        previousY = event.clientY;
        stage.setPointerCapture(activePointer);
        stage.classList.add('is-interacting');
        pauseRotation();
      });

      stage.addEventListener('pointermove', (event) => {
        if (event.pointerId !== activePointer) return;
        const deltaX = event.clientX - previousX;
        const deltaY = event.clientY - previousY;
        previousX = event.clientX;
        previousY = event.clientY;
        state.z += deltaX * 0.008;
        state.x = clamp(state.x + deltaY * 0.008, -1.38, 1.38);
        pauseRotation();
        requestDraw();
      });

      const releasePointer = (event) => {
        if (event.pointerId !== activePointer) return;
        activePointer = null;
        stage.classList.remove('is-interacting');
      };

      stage.addEventListener('pointerup', releasePointer);
      stage.addEventListener('pointercancel', releasePointer);

      stage.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        let handled = true;
        if (key === 'arrowleft') state.z -= 0.12;
        else if (key === 'arrowright') state.z += 0.12;
        else if (key === 'arrowup') state.x = clamp(state.x - 0.1, -1.38, 1.38);
        else if (key === 'arrowdown') state.x = clamp(state.x + 0.1, -1.38, 1.38);
        else if (key === '+' || key === '=') state.zoom = clamp(state.zoom + 0.08, 0.72, 1.36);
        else if (key === '-' || key === '_') state.zoom = clamp(state.zoom - 0.08, 0.72, 1.36);
        else if (key === 'r') Object.assign(state, initial);
        else handled = false;

        if (!handled) return;
        event.preventDefault();
        pauseRotation();
        requestDraw();
      });

      controls.forEach((button) => button.addEventListener('click', () => {
        const action = button.dataset.propellerAction;
        if (action === 'zoom-in') changeZoom(0.12);
        else if (action === 'zoom-out') changeZoom(-0.12);
        else resetView();
      }));

      if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(requestDraw);
        resizeObserver.observe(stage);
      } else {
        window.addEventListener('resize', requestDraw, { passive: true });
      }

      if ('IntersectionObserver' in window) {
        const visibilityObserver = new IntersectionObserver((entries) => {
          visible = entries[0]?.isIntersecting ?? true;
          previousFrame = 0;
          if (visible) requestDraw();
          else if (frame) {
            window.cancelAnimationFrame(frame);
            frame = 0;
          }
        }, { threshold: 0.01 });
        visibilityObserver.observe(viewer);
      }

      reducedMotion.addEventListener?.('change', requestDraw);
      controls.forEach((button) => {
        button.disabled = false;
      });
      viewer.classList.add('is-ready');
      requestDraw();
    } catch (error) {
      viewer.classList.add('has-error');
      status.textContent = viewer.dataset.error || status.textContent;
      controls.forEach((button) => {
        button.disabled = true;
      });
    }
  }

  viewers.forEach((viewer) => {
    if (!('IntersectionObserver' in window)) {
      initialiseViewer(viewer);
      return;
    }

    const loadObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      loadObserver.disconnect();
      initialiseViewer(viewer);
    }, { rootMargin: '320px 0px' });
    loadObserver.observe(viewer);
  });
})();
