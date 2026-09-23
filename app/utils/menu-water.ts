/**
 * WebGL water surface for the hero's lake region, standing in for the
 * mod menu's RenderTarget reflection quad. The mirrored sky strip is
 * uploaded as a texture; the fragment shader ripples it with animated
 * sine distortion and adds flowing glints. Composited additively via
 * CSS `mix-blend-mode: plus-lighter` (feature-detected by the caller).
 */

export type WaterRegion = {
  /** Mirrored sky strip, top row = pixels just above the region top. */
  strip: HTMLCanvasElement
  /** Water rect in device px, y measured from the top. */
  x: number
  y: number
  w: number
  h: number
  /** Wavy waterline: two sine terms in region-normalized units, base = mean v of the waterline, invH = 1/height in design px. */
  wave: { a1: number, k1: number, p1: number, a2: number, k2: number, p2: number, base: number, invH: number }
}

export type MenuWater = {
  resize: (width: number, height: number, dpr: number) => void
  render: (region: WaterRegion, time: number) => void
}

const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D u_strip;
uniform vec4 u_rect;
uniform float u_height;
uniform float u_time;
uniform vec4 u_waveA; // amp1, freq1, phase1, amp2
uniform vec4 u_waveB; // freq2, phase2, waterline base v, 1/region height

void main() {
  float px = gl_FragCoord.x;
  float py = u_height - gl_FragCoord.y;
  if (px < u_rect.x || px > u_rect.x + u_rect.z || py < u_rect.y || py > u_rect.y + u_rect.w) {
    discard;
  }
  float u = (px - u_rect.x) / u_rect.z;
  float v = 1.0 - (py - u_rect.y) / u_rect.w;

  // Wavy waterline, shared with the carved water overlay: drives the
  // mirror mapping and the fade, while the strip's alpha confines the
  // reflection to the real water surface.
  float lineV = u_waveB.z - (u_waveA.x * sin(u_waveA.y * u + u_waveA.z) + u_waveA.w * sin(u_waveB.x * u + u_waveB.y));
  // 1 at the waterline, 0 at the bottom of the region.
  float prox = clamp(v / lineV, 0.0, 1.0);
  float depth = 1.0 - prox;

  // Layered swells whose phases wander horizontally and drift slowly,
  // so the surface reads as crossing waves, not uniform horizontal bands.
  float t = u_time;
  float wobble = sin(u * 9.0 + t * 0.6) * 1.6 + sin(u * 3.0 - t * 0.27) * 2.2;
  float ripple =
      sin(v * 40.0 + t * 2.0 + wobble)
    + 0.6 * sin(v * 88.0 - t * 3.1 + u * 6.0 + wobble * 0.5)
    + 0.35 * sin(v * 150.0 + t * 4.6 - u * 11.0);
  // Patchy amplitude: calm and lively patches drift across the surface.
  float envelope = 0.6 + 0.4 * sin(u * 5.0 + t * 0.5) * sin(v * 7.0 - t * 0.33);

  float su = u + ripple * 0.009 * depth * envelope;
  // Mirror around the wavy waterline; the strip's pivot is the mean waterline.
  float sv = clamp(v + 2.0 * (u_waveB.z - lineV) + sin(u * 18.0 + t * 1.2 + wobble) * 0.015 * depth, 0.0, 1.0);
  // The strip's alpha confines the reflection to the water surface.
  vec4 texel = texture2D(u_strip, vec2(su, sv));
  vec3 reflection = texel.rgb * texel.a;

  // Same vertex-color fade as the mod menu: 0.7 at the waterline to 0.2.
  float fade = mix(0.2, 0.7, prox);

  // Sparkles where swells cross, tinted cool.
  float cross = sin(u * 60.0 + t * 2.6 + wobble) * sin(v * 55.0 - t * 1.9);
  float glint = pow(max(0.0, cross), 14.0) * 0.12 * (0.35 + 0.65 * prox) * envelope * texel.a;

  // Let the strip melt into the water instead of ending on hard edges.
  float edge = smoothstep(0.0, 0.06, u) * smoothstep(1.0, 0.94, u) * smoothstep(0.0, 0.12, v);

  gl_FragColor = vec4((reflection * fade + vec3(0.55, 0.85, 1.0) * glint) * edge, 1.0);
}
`

export function createMenuWater (canvas: HTMLCanvasElement): MenuWater | undefined {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
  if (!gl) { return undefined }

  function compile (type: number, source: string) {
    const shader = gl!.createShader(type)!
    gl!.shaderSource(shader, source)
    gl!.compileShader(shader)
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
      throw new Error(gl!.getShaderInfoLog(shader) ?? 'shader compile failed')
    }
    return shader
  }

  let program: WebGLProgram
  try {
    program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? 'program link failed')
    }
  } catch {
    return undefined
  }

  gl.useProgram(program)
  const quad = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(program, 'a_pos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const uStrip = gl.getUniformLocation(program, 'u_strip')
  const uRect = gl.getUniformLocation(program, 'u_rect')
  const uHeight = gl.getUniformLocation(program, 'u_height')
  const uTime = gl.getUniformLocation(program, 'u_time')
  const uWaveA = gl.getUniformLocation(program, 'u_waveA')
  const uWaveB = gl.getUniformLocation(program, 'u_waveB')

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.uniform1i(uStrip, 0)

  return {
    resize (width, height, dpr) {
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
    },
    render (region, time) {
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, region.strip)
      gl.uniform4f(uRect, region.x, region.y, region.w, region.h)
      gl.uniform1f(uHeight, canvas.height)
      gl.uniform1f(uTime, time)
      const wave = region.wave
      gl.uniform4f(uWaveA, wave.a1, wave.k1, wave.p1, wave.a2)
      gl.uniform4f(uWaveB, wave.k2, wave.p2, wave.base, wave.invH)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    },
  }
}
