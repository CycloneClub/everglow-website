<script lang="ts" setup>
defineProps<{
  description: string
}>()
</script>

<template>
  <div
    style="width: 100%; height: 100%; display: flex; position: relative; overflow: hidden; background-color: #070b1e;"
  >
    <img
      src="/images/og/home-background.png"
      alt=""
      :width="1200"
      :height="630"
      style="position: absolute; top: 0; left: 0; width: 1200px; height: 630px;"
    >
    <div
      style="position: absolute; top: 0; left: 0; width: 1200px; height: 630px; display: flex; background-image: radial-gradient(ellipse at 50% 50%, rgba(7, 11, 30, 0.3), rgba(7, 11, 30, 0) 62%);"
    />
    <div
      style="position: absolute; top: 0; left: 0; width: 1200px; height: 630px; display: flex; flex-direction: column; align-items: center; justify-content: center;"
    >
      <img
        src="/images/hero/menu/logo.png"
        alt="流光无际 Everglow"
        :width="438"
        :height="294"
        style="width: 438px; height: 294px;"
      >
      <p
        style="margin: 30px 0 0; color: #edf0ff; font-size: 26px; text-align: center;"
      >
        {{ description }}
      </p>
    </div>
    <div
      style="position: absolute; bottom: 32px; left: 0; width: 1200px; display: flex; justify-content: center; color: #aebcdd; font-size: 18px; font-weight: 700; letter-spacing: 3px;"
    >
      everglowmod.com
    </div>
  </div>
</template>
