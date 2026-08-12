<script setup lang="ts">
	import type { CsharpProgram } from './csharp/runner';
	import {
		VERTEX_FLOATS,
		Vector2,
		type DrawCommand,
	} from './csharp/runtime';

	type ShaderProgramSource = {
		vertex: string;
		fragment: string;
		paramNames?: string[];
	};

	const emit = defineEmits<{
		ready: [];
		frameError: [message: string];
	}>();

	const canvas = ref<HTMLCanvasElement>();
	let gl: WebGL2RenderingContext | null = null;
	let program: WebGLProgram | null = null;
	let vao: WebGLVertexArrayObject | null = null;
	let buffer: WebGLBuffer | null = null;
	let whiteTexture: WebGLTexture | null = null;
	let csharpProgram: CsharpProgram | null = null;
	let shaderParams: Record<string, number> = {};
	let paramLocations = new Map<string, WebGLUniformLocation | null>();
	const textures = new Map<string, WebGLTexture>();
	let frameId = 0;
	let startedAt = performance.now();
	let lastError: string | null = null;
	const mouse = { x: 0,
y: 0,
down: 0 };
	let uniforms: Record<string, WebGLUniformLocation | null> = {};

	const createShader = (type: number, source: string) => {
		const shader = gl?.createShader(type);
		if (!shader || !gl) return { shader: null,
log: 'Failed to create shader' };
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		const log = gl.getShaderInfoLog(shader) ?? '';
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			gl.deleteShader(shader);
			return { shader: null,
log: log || 'Shader compile failed' };
		}
		return { shader,
log };
	};

	const compileShaders = (source: ShaderProgramSource): string | null => {
		if (!gl) return 'WebGL2 is not available in this browser';
		const vertex = createShader(gl.VERTEX_SHADER, source.vertex);
		if (!vertex.shader) return `Vertex compile error:\n${vertex.log}`;
		const fragment = createShader(gl.FRAGMENT_SHADER, source.fragment);
		if (!fragment.shader) {
			gl.deleteShader(vertex.shader);
			return `Fragment compile error:\n${fragment.log}`;
		}
		const nextProgram = gl.createProgram();
		if (!nextProgram) return 'Failed to create shader program';
		gl.attachShader(nextProgram, vertex.shader);
		gl.attachShader(nextProgram, fragment.shader);
		gl.bindAttribLocation(nextProgram, 0, 'aPosition');
		gl.bindAttribLocation(nextProgram, 1, 'aColor');
		gl.bindAttribLocation(nextProgram, 2, 'aTexCoord');
		gl.linkProgram(nextProgram);
		gl.deleteShader(vertex.shader);
		gl.deleteShader(fragment.shader);
		const log = gl.getProgramInfoLog(nextProgram) ?? '';
		if (!gl.getProgramParameter(nextProgram, gl.LINK_STATUS)) {
			gl.deleteProgram(nextProgram);
			return `Program link error:\n${log || 'Link failed'}`;
		}
		if (program) gl.deleteProgram(program);
		program = nextProgram;
		uniforms = {
			iTime: gl.getUniformLocation(program, 'iTime'),
			iResolution: gl.getUniformLocation(program, 'iResolution'),
			iMouse: gl.getUniformLocation(program, 'iMouse'),
			iChannel0: gl.getUniformLocation(program, 'iChannel0'),
		};
		paramLocations = new Map(
			(source.paramNames ?? []).map((name) => [
				name,
				gl!.getUniformLocation(program!, name),
			]),
		);
		startedAt = performance.now();
		return null;
	};

	const setTexture = (
		name: string,
		image: HTMLImageElement | ImageBitmap | null,
	) => {
		if (!gl || !image) return;
		let texture = textures.get(name);
		if (!texture) {
			texture = gl.createTexture()!;
			textures.set(name, texture);
		}
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		try {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			if (gl.getError() !== gl.NO_ERROR) throw new Error('Invalid texture');
		} catch {
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				1,
				1,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				new Uint8Array([255, 255, 255, 255]),
			);
		}
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	};

	const drawCommands = (commands: DrawCommand[]) => {
		if (!gl || !program || !buffer || !vao) return;
		gl.useProgram(program);
		gl.bindVertexArray(vao);
		for (const command of commands) {
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, command.data, gl.DYNAMIC_DRAW);
			const texture = command.textureName
				? textures.get(command.textureName) ?? whiteTexture
				: whiteTexture;
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture ?? null);
			gl.uniform1i(uniforms.iChannel0, 0);
			gl.drawArrays(
				command.mode === 'triangle-strip' ? gl.TRIANGLE_STRIP : gl.TRIANGLES,
				0,
				command.vertexCount,
			);
		}
		gl.bindVertexArray(null);
	};

	const render = () => {
		if (!gl || !canvas.value) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const width = Math.max(1, Math.floor(canvas.value.clientWidth * dpr));
		const height = Math.max(1, Math.floor(canvas.value.clientHeight * dpr));
		if (canvas.value.width !== width || canvas.value.height !== height) {
			canvas.value.width = width;
			canvas.value.height = height;
		}
		gl.viewport(0, 0, width, height);
		gl.clearColor(0.06, 0.07, 0.09, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		if (program && csharpProgram) {
			gl.useProgram(program);
			const time = (performance.now() - startedAt) / 1000;
			gl.uniform1f(uniforms.iTime, time);
			gl.uniform2f(uniforms.iResolution, width, height);
			gl.uniform4f(uniforms.iMouse, mouse.x, mouse.y, mouse.down, 0);
			for (const [name, location] of paramLocations) {
				if (location && typeof shaderParams[name] === 'number') {
					gl.uniform1f(location, shaderParams[name]!);
				}
			}
			try {
				drawCommands(
					csharpProgram.runFrame({
						iTime: time,
						iResolution: new Vector2(width, height),
						iMouse: { ...mouse },
					}),
				);
				if (lastError) emit('frameError', '');
				lastError = null;
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				if (lastError !== message) emit('frameError', message);
				lastError = message;
			}
		}
		frameId = requestAnimationFrame(render);
	};

	onMounted(() => {
		if (!canvas.value) return;
		gl = canvas.value.getContext('webgl2', { antialias: true,
alpha: false });
		if (!gl) {
			emit('ready');
			return;
		}
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		buffer = gl.createBuffer();
		vao = gl.createVertexArray();
		whiteTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, whiteTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.bindVertexArray(vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		const stride = VERTEX_FLOATS * 4;
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
		gl.enableVertexAttribArray(1);
		gl.vertexAttribPointer(1, 4, gl.FLOAT, false, stride, 2 * 4);
		gl.enableVertexAttribArray(2);
		gl.vertexAttribPointer(2, 3, gl.FLOAT, false, stride, 6 * 4);
		gl.bindVertexArray(null);
		const updateMouse = (event: PointerEvent) => {
			const rect = canvas.value!.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			mouse.x = (event.clientX - rect.left) * dpr;
			mouse.y = (rect.height - (event.clientY - rect.top)) * dpr;
		};
		canvas.value.addEventListener('pointermove', updateMouse);
		canvas.value.addEventListener('pointerdown', (event) => {
			mouse.down = 1;
			updateMouse(event);
		});
		window.addEventListener('pointerup', () => (mouse.down = 0));
		render();
		emit('ready');
	});

	onBeforeUnmount(() => {
		cancelAnimationFrame(frameId);
		if (!gl) return;
		if (program) gl.deleteProgram(program);
		if (vao) gl.deleteVertexArray(vao);
		if (buffer) gl.deleteBuffer(buffer);
		if (whiteTexture) gl.deleteTexture(whiteTexture);
		for (const texture of textures.values()) gl.deleteTexture(texture);
	});

	defineExpose({
		compileShaders,
		setProgram: (nextProgram: CsharpProgram | null) => {
			csharpProgram = nextProgram;
			startedAt = performance.now();
		},
		setShaderParams: (params: Record<string, number>) =>
			(shaderParams = { ...shaderParams,
...params }),
		setTexture,
		renameTexture: (oldName: string, newName: string) => {
			const texture = textures.get(oldName);
			if (!texture || oldName === newName) return;
			textures.delete(oldName);
			textures.set(newName, texture);
		},
		removeTexture: (name: string) => {
			const texture = textures.get(name);
			if (texture && gl) gl.deleteTexture(texture);
			textures.delete(name);
		},
	});
</script>

<template>
	<canvas ref="canvas" class="hlsl-preview__canvas" aria-label="HLSL shader preview" />
</template>
