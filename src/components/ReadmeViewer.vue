<script setup>
import { ref, watch } from 'vue';
import api from '@/api/index.js'

const props = defineProps({
  repo: {
    type: Object,
    required: false
  }
});

const readme = ref('');

watch(() => props.repo, async (newRepo) => {
  readme.value = '';
  if (newRepo != null) {
    readme.value = await api.getReadme(newRepo.name);
  }
}, { immediate: true });
</script>

<template>
  <div class="readme-viewer">
    <div class="readme-content">
      <pre>{{ readme }}</pre>
    </div>
  </div>
</template>

<style scoped>
.readme-viewer {
  flex: 1;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  min-width: 500px;
  background-color: #1f1f1f;
  scrollbar-width: thin;
  scrollbar-color: #404040 #1f1f1f;
}

.readme-content {
  max-width: 800px;
  margin: 0 auto;
  color: #e1e1e1;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
}
</style>