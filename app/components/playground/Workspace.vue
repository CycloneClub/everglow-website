<script setup lang="ts">
import HlslPreview from './hlsl-preview/HlslPreview.vue'

const i18n = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const sidebarVisible = ref(false)
const workspaces = [
  {
    id: 'scene',
    name: 'Scene',
    description: 'Three.js scene preview',
    icon: 'lucide:box',
  },
  {
    id: 'hlsl-preview',
    name: 'HLSL Preview',
    description: 'C# geometry and WebGL2 shaders',
    icon: 'lucide:code-2',
  },
]
const activeWorkspaceId = computed(() => {
  const workspaceId = route.params.workspace
  return workspaces.some(workspace => workspace.id === workspaceId)
    ? workspaceId
    : 'scene'
})

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}

const goBack = () => {
  navigateTo(localePath('/playground'))
}

const selectWorkspace = (workspaceId: string) => {
  navigateTo(localePath(`/playground/${workspaceId}`))
}

useHead({
  title: i18n.t('head.subtitles.playground'),
})
</script>

<template>
  <section
    class="playground-workspace"
    aria-label="Playground workspace"
  >
    <aside
      id="workspace-sidebar"
      :class="['workspace-sidebar', { 'is-collapsed': !sidebarVisible }]"
      aria-label="Workspace selector"
    >
      <div class="workspace-sidebar__header">
        <div v-show="sidebarVisible">
          <p class="workspace-sidebar__eyebrow">
            PLAYGROUND
          </p>
          <h1>Workspaces</h1>
        </div>
        <button
          type="button"
          class="workspace-sidebar__close"
          :aria-label="
            sidebarVisible
              ? 'Collapse workspace sidebar'
              : 'Expand workspace sidebar'
          "
          @click="toggleSidebar"
        >
          <Icon
            :name="
              sidebarVisible
                ? 'lucide:panel-left-close'
                : 'lucide:panel-left-open'
            "
          />
        </button>
      </div>

      <nav
        class="workspace-list"
        aria-label="Available workspaces"
      >
        <button
          v-for="workspace in workspaces"
          :key="workspace.id"
          type="button"
          :class="[
            'workspace-list__item',
            { 'is-active': workspace.id === activeWorkspaceId },
          ]"
          :aria-label="`${workspace.name} workspace`"
          :aria-current="
            workspace.id === activeWorkspaceId ? 'page' : undefined
          "
          :title="workspace.name"
          @click="selectWorkspace(workspace.id)"
        >
          <Icon :name="workspace.icon" />
          <span v-show="sidebarVisible">
            <strong class="workspace-list__text">{{
              workspace.name
            }}</strong>
            <small class="workspace-list__text">{{
              workspace.description
            }}</small>
          </span>
        </button>
      </nav>
    </aside>

    <div class="workspace-shell">
      <header class="workspace-toolbar">
        <button
          type="button"
          class="workspace-toolbar__back"
          aria-label="Go to Playground home"
          @click="goBack"
        >
          <Icon name="lucide:arrow-left" />
        </button>
        <div class="workspace-toolbar__title">
          <Icon
            :name="
              workspaces.find(
                (workspace) => workspace.id === activeWorkspaceId,
              )?.icon ?? 'lucide:box'
            "
          />
          <span>{{
            workspaces.find(
              (workspace) => workspace.id === activeWorkspaceId,
            )?.name
          }}</span>
        </div>
      </header>

      <div class="canvas-container">
        <template v-if="activeWorkspaceId === 'scene'">
          <TresCanvas
            preset="realistic"
            :tone-mapping-exposure="0.3"
            shadows
          >
            <TresPerspectiveCamera
              :position="[30, 30, 100]"
              :fov="55"
              :look-at="[0, 0, 0]"
            />

            <OrbitControls />
            <PlaygroundSceneBox />
            <PlaygroundSceneSky />
            <PlaygroundSceneWater />
          </TresCanvas>
        </template>
        <HlslPreview v-else />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .playground-workspace {
    --sidebar-width: min(20rem, calc(100vw - 3.5rem));
    --sidebar-collapsed-width: 5.5rem;

    position: fixed;
    inset: 0;
    display: flex;
    overflow: hidden;
    background: #111827;
    color: #e5e7eb;
  }

  .workspace-sidebar {
    position: relative;
    z-index: 2;
    flex: 0 0 var(--sidebar-width);
    width: var(--sidebar-width);
    display: flex;
    flex-direction: column;
    background: #172033;
    border-right: 1px solid rgb(148 163 184 / 18%);
    box-shadow: 0 0 2rem rgb(0 0 0 / 24%);
    transition:
      width 180ms ease,
      flex-basis 180ms ease;

    &.is-collapsed {
      flex-basis: var(--sidebar-collapsed-width);
      width: var(--sidebar-collapsed-width);
    }
  }

  .workspace-sidebar__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1.25rem;
    border-bottom: 1px solid rgb(148 163 184 / 18%);

    .workspace-sidebar.is-collapsed & {
      justify-content: center;
      padding: 0.625rem;
    }

    h1,
    p {
      margin: 0;
    }

    h1 {
      font-size: 1.125rem;
    }
  }

  .workspace-sidebar__eyebrow {
    margin-bottom: 0.25rem !important;
    color: #94a3b8;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.12em;
  }

  .workspace-sidebar__close,
  .workspace-toolbar__menu,
  .workspace-toolbar__back {
    display: inline-grid;
    width: 2.25rem;
    height: 2.25rem;
    place-items: center;
    padding: 0;
    color: inherit;
    background: transparent;
    border: 0;
    border-radius: 0.375rem;
    cursor: pointer;

    &:hover {
      background: rgb(148 163 184 / 14%);
    }

    &:focus-visible {
      outline: 2px solid #7dd3fc;
      outline-offset: -2px;
    }
  }

  .workspace-list {
    display: grid;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .workspace-list__item {
    width: 100%;
    height: 4rem;
    display: flex;
    gap: 0.75rem;
    align-items: center;
    padding: 0.75rem;
    color: #cbd5e1;
    text-align: left;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 150ms ease, border-color 150ms ease,
      color 150ms ease;

    &:hover {
      background: rgb(148 163 184 / 10%);
    }

    &.is-active {
      color: #f8fafc;
      background: #243047;
      border-color: rgb(125 211 252 / 42%);
    }

    :deep(svg) {
      width: 1.125rem;
      height: 1.125rem;
      color: #94a3b8;

      .workspace-list__item.is-active & {
        color: #7dd3fc;
      }
    }

    span {
      min-width: 0;
      display: grid;
      gap: 0.125rem;
    }

    small {
      color: #94a3b8;
    }

    .workspace-sidebar.is-collapsed & {
      justify-content: center;
      padding: 0;
    }
  }

  .workspace-list__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .workspace-shell {
    width: 100%;
    display: grid;
    grid-template-rows: 3.5rem minmax(0, 1fr);
  }

  .workspace-toolbar {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    padding: 0 0.75rem;
    background: #172033;
    border-bottom: 1px solid rgb(148 163 184 / 18%);
  }

  .workspace-toolbar__title {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    font-size: 0.9375rem;
    font-weight: 600;

    :deep(svg) {
      color: #7dd3fc;
    }
  }

  .canvas-container {
    min-width: 0;
    min-height: 0;
    background: #dbeafe;
  }

  @media (prefers-reduced-motion: reduce) {
    .workspace-sidebar {
      transition: none;
    }
  }
</style>
