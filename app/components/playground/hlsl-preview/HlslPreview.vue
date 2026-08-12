<script setup lang="ts">
import type { CsharpProgram } from './csharp/runner'
import { compileCsharp } from './csharp/runner'
import { AssetStore } from './csharp/runtime'
import { DEFAULT_CSHARP } from './csharp/defaults'
import { DEFAULT_FRAGMENT_HLSL, DEFAULT_VERTEX_HLSL } from './defaults'
import { paramsToRecord, parseParamAnnotations } from './parse-params'
import {
  type DemoParam,
  type SnapshotTexture,
  type TextureItem,
  WHITE_PIXEL_DATA_URL,
  fileToDataUrl,
  loadImageFromDataUrl,
  loadSnapshot,
  saveSnapshot,
} from './snapshot'
import { transpileHlslToGlsl } from './transpile'
import HlslPreviewCanvas from './HlslPreviewCanvas.vue'
import HlslPreviewEditor from './HlslPreviewEditor.vue'

type PreviewCanvasHandle = {
  compileShaders: (source: {
    vertex: string
    fragment: string
    paramNames: string[]
  }) => string | null
  setProgram: (program: CsharpProgram | null) => void
  setShaderParams: (params: Record<string, number>) => void
  setTexture: (
    name: string,
    image: HTMLImageElement | ImageBitmap | null,
  ) => void
  renameTexture: (oldName: string, newName: string) => void
  removeTexture: (name: string) => void
}

const AUTO_COMPILE_DEBOUNCE_MS = 650
const DEFAULT_TEXTURE_NAMES = ['Ring']
const canvas = ref<PreviewCanvasHandle>()
const assets = new AssetStore()
let program: CsharpProgram | null = null
let booted = false
let canvasReady = false
let snapshotReady = false
let autoCompileEnabled = false
let debounceTimer: ReturnType<typeof setTimeout> | undefined

const csharpSource = ref(DEFAULT_CSHARP)
const vertexSource = ref(DEFAULT_VERTEX_HLSL)
const fragmentSource = ref(DEFAULT_FRAGMENT_HLSL)
const csParams = ref(paramsFromSource(DEFAULT_CSHARP))
const vsParams = ref(paramsFromSource(DEFAULT_VERTEX_HLSL))
const psParams = ref(paramsFromSource(DEFAULT_FRAGMENT_HLSL))
const textures = ref<TextureItem[]>(makeDefaultTextureItems())
const originalTextureNames = new Map(
  textures.value.map(texture => [texture.id, texture.name]),
)
const error = ref<string | null>(null)
const status = ref('Ready')
const lastSavedAt = ref<string | null>(null)

function paramsFromSource (source: string): DemoParam[] {
  return parseParamAnnotations(source).map(param => ({
    id: param.name,
    label: param.name,
    value: param.value,
    min: param.min,
    max: param.max,
    step: param.step,
  }))
}

function mergeParsedParams (
  parsed: ReturnType<typeof parseParamAnnotations>,
  previous: DemoParam[],
): DemoParam[] {
  const previousValues = new Map(
    previous.map(param => [param.id, param.value]),
  )
  return parsed.map(param => ({
    id: param.name,
    label: param.name,
    value: previousValues.get(param.name) ?? param.value,
    min: param.min,
    max: param.max,
    step: param.step,
  }))
}

function makeDefaultTextureItems (): SnapshotTexture[] {
  return DEFAULT_TEXTURE_NAMES.map(name => ({
    id: `default-${name}`,
    name,
    fileName: '(placeholder white)',
    dataUrl: WHITE_PIXEL_DATA_URL,
  }))
}

function applyTexturesToGpu (items: TextureItem[]) {
  return Promise.all(
    items
      .filter((item): item is SnapshotTexture => Boolean(item.dataUrl))
      .map(async (item) => {
        try {
          return {
            name: item.name,
            image: await loadImageFromDataUrl(item.dataUrl),
          }
        } catch {
          return null
        }
      }),
  ).then((decoded) => {
    for (const name of assets.list()) {
      assets.unregister(name)
      canvas.value?.removeTexture(name)
    }
    for (const item of decoded) {
      if (!item) { continue }
      assets.register(item.name)
      canvas.value?.setTexture(item.name, item.image)
    }
  })
}

function save (options?: { silent?: boolean }) {
  const result = saveSnapshot({
    csharpSource: csharpSource.value,
    vertexSource: vertexSource.value,
    fragmentSource: fragmentSource.value,
    csParams: csParams.value,
    vsParams: vsParams.value,
    psParams: psParams.value,
    textures: textures.value.filter(
      (item): item is SnapshotTexture => typeof item.dataUrl === 'string',
    ),
  })
  if (result.ok === false) {
    if (!options?.silent) {
      error.value = `Save failed: ${result.error}`
      status.value = 'Save failed'
    }
    return false
  }
  lastSavedAt.value = result.savedAt
  if (!options?.silent) { status.value = 'Saved' }
  return true
}

function compile (options?: { autoSave?: boolean }) {
  const vertex = transpileHlslToGlsl(vertexSource.value, 'vertex')
  if (vertex.ok === false) { return fail(vertex.error, 'HLSL transpile failed') }
  const fragment = transpileHlslToGlsl(fragmentSource.value, 'fragment')
  if (fragment.ok === false) { return fail(fragment.error, 'HLSL transpile failed') }
  const nextCs = mergeParsedParams(
    parseParamAnnotations(csharpSource.value),
    csParams.value,
  )
  const nextVs = mergeParsedParams(vertex.params, vsParams.value)
  const nextPs = mergeParsedParams(fragment.params, psParams.value)
  csParams.value = nextCs
  vsParams.value = nextVs
  psParams.value = nextPs
  const shaderError = canvas.value?.compileShaders({
    vertex: vertex.glsl,
    fragment: fragment.glsl,
    paramNames: [...vertex.params, ...fragment.params].map(
      param => param.name,
    ),
  })
  if (shaderError) { return fail(shaderError, 'Shader compile failed') }
  canvas.value?.setShaderParams({
    ...paramsToRecord(nextVs),
    ...paramsToRecord(nextPs),
  })
  const compiled = compileCsharp(
    csharpSource.value,
    assets,
    paramsToRecord(nextCs),
  )
  if (compiled.ok === false) {
    canvas.value?.setProgram(null)
    program = null
    return fail(compiled.error, 'C# transpile failed')
  }
  program = compiled.program
  canvas.value?.setProgram(program)
  error.value = null
  status.value = 'Running'
  if (options?.autoSave !== false) { save({ silent: true }) }
  return true
}

function fail (message: string, nextStatus: string) {
  error.value = message
  status.value = nextStatus
  return false
}

function applyLiveParams () {
  program?.setParams(paramsToRecord(csParams.value))
  canvas.value?.setShaderParams({
    ...paramsToRecord(vsParams.value),
    ...paramsToRecord(psParams.value),
  })
  save({ silent: true })
}

function reset () {
  const defaults = makeDefaultTextureItems()
  csharpSource.value = DEFAULT_CSHARP
  vertexSource.value = DEFAULT_VERTEX_HLSL
  fragmentSource.value = DEFAULT_FRAGMENT_HLSL
  csParams.value = paramsFromSource(DEFAULT_CSHARP)
  vsParams.value = paramsFromSource(DEFAULT_VERTEX_HLSL)
  psParams.value = paramsFromSource(DEFAULT_FRAGMENT_HLSL)
  textures.value = defaults
  originalTextureNames.clear()
  for (const texture of defaults) { originalTextureNames.set(texture.id, texture.name) }
  void applyTexturesToGpu(defaults).then(() => {
    error.value = null
    compile({ autoSave: true })
  })
}

function uniqueTextureName (base: string) {
  const names = textures.value.map(item => item.name)
  if (!names.includes(base)) { return base }
  let index = 2
  while (names.includes(`${base}_${index}`)) { index++ }
  return `${base}_${index}`
}

async function addTexture (event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) { return }
  try {
    const dataUrl = await fileToDataUrl(file)
    const image = await loadImageFromDataUrl(dataUrl)
    const name = uniqueTextureName(
      file.name.replace(/\.[^.]+$/, '').replace(/\W/g, '_') || 'Texture',
    )
    assets.register(name)
    canvas.value?.setTexture(name, image)
    const item = {
      id: crypto.randomUUID(),
      name,
      fileName: file.name,
      dataUrl,
    }
    textures.value.push(item)
    originalTextureNames.set(item.id, item.name)
    save({ silent: true })
  } catch (nextError) {
    error.value =
      nextError instanceof Error
        ? nextError.message
        : 'Texture import failed'
    status.value = 'Texture import failed'
  }
}

function renameTexture (item: TextureItem) {
  const nextName = item.name.trim()
  const oldName = originalTextureNames.get(item.id) ?? nextName
  if (!/^[_A-Z]\w*$/i.test(nextName)) {
    item.name = oldName
    error.value = 'Texture name must be a valid identifier'
    return
  }
  const duplicate = textures.value.some(
    texture => texture !== item && texture.name === nextName,
  )
  if (duplicate) {
    item.name = oldName
    error.value = `Textures.${nextName} already exists`
    return
  }
  canvas.value?.renameTexture(oldName, nextName)
  assets.rename(oldName, nextName)
  originalTextureNames.set(item.id, nextName)
  error.value = null
  save({ silent: true })
}

function removeTexture (item: TextureItem) {
  assets.unregister(item.name)
  canvas.value?.removeTexture(item.name)
  textures.value = textures.value.filter(texture => texture.id !== item.id)
  originalTextureNames.delete(item.id)
  save({ silent: true })
}

function tryBoot () {
  if (booted || !canvasReady || !snapshotReady) { return }
  booted = true
  void applyTexturesToGpu(textures.value).then(() => {
    compile({ autoSave: false })
    autoCompileEnabled = true
  })
}

function onCanvasReady () {
  canvasReady = true
  tryBoot()
}

function onFrameError (message: string) {
  if (!message) {
    error.value = null
    status.value = 'Running'
    return
  }
  error.value = `C# runtime: ${message}`
  status.value = 'Runtime error'
}

function formatSavedAt (value: string) {
  return new Date(value).toLocaleString()
}

watch([csharpSource, vertexSource, fragmentSource], () => {
  if (!autoCompileEnabled) { return }
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(
    () => compile({ autoSave: true }),
    AUTO_COMPILE_DEBOUNCE_MS,
  )
})

onMounted(() => {
  const snapshot = loadSnapshot()
  if (snapshot) {
    csharpSource.value = snapshot.csharpSource
    vertexSource.value = snapshot.vertexSource
    fragmentSource.value = snapshot.fragmentSource
    csParams.value = snapshot.csParams
    vsParams.value = snapshot.vsParams
    psParams.value = snapshot.psParams
    textures.value = snapshot.textures
    for (const texture of snapshot.textures) {
      originalTextureNames.set(texture.id, texture.name)
    }
    lastSavedAt.value = snapshot.savedAt
  }
  snapshotReady = true
  tryBoot()
  window.addEventListener('keydown', onKeyDown, true)
})

function onKeyDown (event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    save()
  }
}

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
  window.removeEventListener('keydown', onKeyDown, true)
})
</script>

<template>
  <section class="hlsl-preview">
    <header class="hlsl-preview__header">
      <div>
        <h1>HLSL Preview</h1>
        <p>
          C# geometry + HLSL VS/PS with <code>@param</code> sliders. Snapshots
          are stored locally.
        </p>
      </div>
      <div class="hlsl-preview__actions">
        <button
          class="hlsl-preview__button hlsl-preview__button--primary"
          type="button"
          @click="compile()"
        >
          <Icon name="lucide:play" /> Compile &amp; Run
        </button>
        <button
          class="hlsl-preview__button"
          type="button"
          title="Save snapshot (Ctrl+S)"
          @click="save()"
        >
          <Icon name="lucide:save" /> Save
        </button>
        <button
          class="hlsl-preview__button"
          type="button"
          @click="reset"
        >
          <Icon name="lucide:rotate-ccw" /> Reset
        </button>
        <span :class="['hlsl-preview__status', { 'is-error': error }]">{{ status
        }}<template v-if="lastSavedAt">
          · saved {{ formatSavedAt(lastSavedAt) }}</template></span>
      </div>
    </header>

    <div class="hlsl-preview__preview-row">
      <div class="hlsl-preview__stage">
        <HlslPreviewCanvas
          ref="canvas"
          @ready="onCanvasReady"
          @frame-error="onFrameError"
        />
        <pre
          v-if="error"
          class="hlsl-preview__error"
        >{{ error }}</pre>
      </div>
      <section class="hlsl-textures">
        <div class="hlsl-textures__header">
          <strong>Textures</strong><label class="hlsl-preview__button"><Icon name="lucide:plus" /> Import<input
            type="file"
            accept="image/*"
            @change="addTexture"
          ></label>
        </div>
        <p class="hlsl-textures__hint">
          Use <code>Textures.Name</code> in C#.
        </p>
        <p
          v-if="!textures.length"
          class="hlsl-textures__hint"
        >
          No textures imported yet.
        </p>
        <ul v-else>
          <li
            v-for="texture in textures"
            :key="texture.id"
          >
            <input
              v-model="texture.name"
              aria-label="Texture name"
              @change="renameTexture(texture)"
            >
            <span>{{ texture.fileName }}</span>
            <button
              type="button"
              :aria-label="`Remove ${texture.name}`"
              @click="removeTexture(texture)"
            >
              <Icon name="lucide:trash-2" />
            </button>
          </li>
        </ul>
      </section>
    </div>

    <div class="hlsl-preview__board">
      <div class="hlsl-preview__editors">
        <HlslPreviewEditor
          v-model="csharpSource"
          language="csharp"
          label="C# — geometry / Draw(time)"
        />
        <HlslPreviewEditor
          v-model="vertexSource"
          language="hlsl"
          label="VS — vertex shader"
        />
        <HlslPreviewEditor
          v-model="fragmentSource"
          language="hlsl"
          label="PS — pixel / fragment shader"
        />
      </div>
      <div class="hlsl-preview__params">
        <section
          v-for="panel in [
            { title: 'C# params', values: csParams },
            { title: 'VS params', values: vsParams },
            { title: 'PS params', values: psParams },
          ]"
          :key="panel.title"
          class="hlsl-params"
        >
          <h2>{{ panel.title }}</h2>
          <p v-if="!panel.values.length">
            No <code>@param</code> annotations.
          </p>
          <label
            v-for="param in panel.values"
            :key="param.id"
          >
            <span>{{ param.label }} <output>{{ param.value }}</output></span>
            <input
              v-model.number="param.value"
              type="range"
              :min="param.min"
              :max="param.max"
              :step="param.step"
              @input="applyLiveParams"
            >
          </label>
        </section>
      </div>
    </div>

    <details class="hlsl-preview__dialect">
      <summary>Dialect &amp; builtins</summary>
      <ul>
        <li>
          Save manually with <code>Ctrl+S</code>; successful compilations and
          slider/texture changes auto-save.
        </li>
        <li>
          Declare values with
          <code>// @param name = default min=… max=… step=…</code>.
        </li>
        <li>
          Use <code>Textures.Name</code> in geometry code and
          <code>tex2D(iChannel0, uv)</code> in HLSL.
        </li>
      </ul>
    </details>
  </section>
</template>

<style lang="scss" scoped>
  .hlsl-preview {
    height: 100%;
    min-height: 0;
    overflow: auto;
    padding: 1.25rem;
    color: #e2e8f0;
    background: #0f172a;
  }
  .hlsl-preview__header {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  .hlsl-preview h1,
  .hlsl-preview h2,
  .hlsl-preview p {
    margin: 0;
  }
  .hlsl-preview h1 {
    font-size: 1.25rem;
  }
  .hlsl-preview p {
    margin-top: 0.4rem;
    color: #94a3b8;
  }
  .hlsl-preview__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: flex-end;
  }
  .hlsl-preview__button {
    display: inline-flex;
    gap: 0.4rem;
    align-items: center;
    padding: 0.5rem 0.7rem;
    color: #dbeafe;
    background: #1e293b;
    border: 1px solid #475569;
    border-radius: 0.4rem;
    cursor: pointer;
  }
  .hlsl-preview__button:hover {
    background: #334155;
  }
  .hlsl-preview__button--primary {
    color: #082f49;
    background: #7dd3fc;
    border-color: #7dd3fc;
  }
  .hlsl-preview__button--primary:hover {
    background: #bae6fd;
  }
  .hlsl-preview__status {
    color: #86efac;
    font-size: 0.75rem;
  }
  .hlsl-preview__status.is-error {
    color: #fca5a5;
  }
  .hlsl-preview__preview-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(15rem, 22rem);
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .hlsl-preview__stage {
    position: relative;
    min-height: 20rem;
    overflow: hidden;
    background: #111827;
    border: 1px solid #334155;
    border-radius: 0.5rem;
  }
  .hlsl-preview__canvas {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 20rem;
  }
  .hlsl-preview__error {
    position: absolute;
    right: 0.75rem;
    bottom: 0.75rem;
    left: 0.75rem;
    max-height: 40%;
    margin: 0;
    padding: 0.75rem;
    overflow: auto;
    color: #fecaca;
    white-space: pre-wrap;
    background: rgb(69 10 10 / 92%);
    border: 1px solid #ef4444;
    border-radius: 0.35rem;
  }
  .hlsl-textures,
  .hlsl-params {
    padding: 0.85rem;
    background: #172033;
    border: 1px solid #334155;
    border-radius: 0.5rem;
  }
  .hlsl-textures__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .hlsl-textures input[type='file'] {
    display: none;
  }
  .hlsl-textures__hint {
    font-size: 0.75rem;
  }
  .hlsl-textures ul {
    display: grid;
    gap: 0.5rem;
    padding: 0;
    margin-top: 0.75rem;
  }
  .hlsl-textures li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 0.5rem;
    align-items: center;
    list-style: none;
  }
  .hlsl-textures li input {
    min-width: 0;
    padding: 0.35rem;
    color: #e2e8f0;
    background: #0f172a;
    border: 1px solid #475569;
    border-radius: 0.25rem;
  }
  .hlsl-textures li span {
    max-width: 6rem;
    overflow: hidden;
    color: #94a3b8;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hlsl-textures li button {
    color: #fca5a5;
    background: transparent;
    border: 0;
    cursor: pointer;
  }
  .hlsl-preview__board {
    display: grid;
    gap: 1rem;
  }
  .hlsl-preview__editors,
  .hlsl-preview__params {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }
  .hlsl-params {
    min-height: 8rem;
  }
  .hlsl-params h2 {
    font-size: 0.85rem;
  }
  .hlsl-params > label {
    display: grid;
    gap: 0.25rem;
    margin-top: 0.75rem;
    font-size: 0.75rem;
  }
  .hlsl-params label span {
    display: flex;
    justify-content: space-between;
  }
  .hlsl-params output {
    color: #7dd3fc;
  }
  .hlsl-params input {
    width: 100%;
  }
  .hlsl-preview__dialect {
    margin-top: 1rem;
    color: #94a3b8;
  }
  .hlsl-preview__dialect summary {
    cursor: pointer;
  }
  .hlsl-preview__dialect ul {
    padding-left: 1.25rem;
  }
  .hlsl-preview code {
    color: #7dd3fc;
  }
  @media (max-width: 1000px) {
    .hlsl-preview__preview-row {
      grid-template-columns: 1fr;
    }
    .hlsl-preview__editors,
    .hlsl-preview__params {
      grid-template-columns: 1fr;
    }
    .hlsl-preview__header {
      flex-direction: column;
    }
    .hlsl-preview__actions {
      justify-content: flex-start;
    }
  }
</style>
