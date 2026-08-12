<script setup lang="ts">
const localePath = useLocalePath()

await navigateTo(localePath('/playground/scene'), { replace: true })
</script>
