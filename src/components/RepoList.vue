<script setup>
import { ref, watch, onMounted,onUnmounted, computed } from 'vue';
import { useTagStore } from '@/store/tag.js'

const props = defineProps({
  selectedMenu: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['repoSelect']);
const tagStore = useTagStore();

const filteredRepos = computed(() => tagStore.filteredRepos);
const tags = computed(() => tagStore.tags);
const showTagMenu = ref(null);
const newTagName = ref('');
const selectedRepo = ref({});

watch(() => props.selectedMenu, async (newMenu) => {
  if (newMenu.type === 'menu') {
    if (newMenu.value === 'all') {
      await tagStore.filterRepo('all');
    } else if (newMenu.value === 'untagged') {
      await tagStore.filterRepo('untagged');
    }
  } else if (newMenu.type === 'tag') {
    await tagStore.filterRepo('tag', newMenu.value);
  } else if (newMenu.type === 'language') {
    await tagStore.filterRepo('language', newMenu.value);
  }
}, { immediate: true });

const toggleTagMenu = (repoName, event) => {
  event.stopPropagation();
  showTagMenu.value = showTagMenu.value === repoName ? null : repoName;
};

const addTag = async (repo, tag, event) => {
  await tagStore.repoAddTag(repo, tag);
  showTagMenu.value = null;
};

const removeTag = async (repo, tag, event) => {
  await tagStore.repoDeleteTag(repo, tag);
  showTagMenu.value = null;
};

const addNewTag = async (repo, event) => {
  const tag = newTagName.value.trim();
  await tagStore.addTag(tag);
  newTagName.value = '';
};

async function fetchTags() {
  await tagStore.fetchTags();
  // tags = tagStore.tags;
}

const handleClickOutside = (event) => {
  showTagMenu.value = null;
  // const tagMenu = document.querySelector('.tag-menu');
  // const tagMenuBtn = document.querySelector('.tag-menu-btn');
  // if (showTagMenu.value && 
  //     tagMenu && 
  //     !tagMenu.contains(event.target) && 
  //     !tagMenuBtn.contains(event.target)) {
    
  // }
};

const handleRepoSelect = (repo) => {
  selectedRepo.value = repo;
  emit('repoSelect', repo);
};

const init = async () => {
  window.addEventListener('click', handleClickOutside);
  await fetchTags();
}

onMounted(init);
onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
})
</script>

<template>
  <div class="repo-list">
    <div v-for="repo in filteredRepos" :key="repo.name" class="repo-item" :class="{ 'repo-selected': repo.name === selectedRepo.name }" @click="handleRepoSelect(repo)">
      <div class="repo-header">
        <h3>{{ repo.name }}</h3>
        <button class="tag-menu-btn" @click="toggleTagMenu(repo.name, $event)" title="Manage tags">
          +
        </button>
        <!-- Tag Menu -->
        <div v-if="showTagMenu === repo.name" class="tag-menu" @click.stop>
          <div class="tag-menu-header">
            <input v-model="newTagName" placeholder="Add new tag" class="new-tag-input"
              @keyup.enter="addNewTag(repo, $event)">
            <button class="add-tag-btn" @click="addNewTag(repo, $event)" :disabled="!newTagName.trim()">
              Add
            </button>
          </div>
          <div class="available-tags">
            <div v-for="tag in tags" :key="tag" class="tag-menu-item"
              :class="{ 'tag-selected': repo.tags.includes(tag) }"
              @click="repo.tags.includes(tag) ? removeTag(repo, tag, $event) : addTag(repo, tag, $event)">
              <span>{{ tag }}</span>
              <span class="tag-action">{{ repo.tags.includes(tag) ? '✕' : '+' }}</span>
            </div>
          </div>
        </div>
      </div>
      <p>{{ repo.description }}</p>
      <div class="repo-meta">
        <span>⭐ {{ repo.startCnt }}</span>
        <span>{{ repo.language }}</span>
      </div>
      <div class="repo-tags" v-if="repo.topics.length">
        <span v-for="topic in repo.topics" :key="topic" class="tag">
          {{ topic }}
        </span>
      </div>
      <div class="repo-tags" v-if="repo.tags.length">
        <span v-for="tag in repo.tags" :key="tag" class="tag">
          {{ tag }}
          <button class="remove-tag-btn" @click="removeTag(repo, tag, $event)" title="Remove tag">
            ×
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.repo-list {
  flex: 0 0 400px;
  width: 400px;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid #2d2d2d;
  background-color: #1f1f1f;
  scrollbar-width: thin;
  scrollbar-color: #404040 #1f1f1f;
}

.repo-item {
  padding: 20px;
  border: 1px solid #2d2d2d;
  border-radius: 4px;
  margin-bottom: 15px;
  cursor: pointer;
  background-color: #252525;
  position: relative;
}

.repo-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 3px 0 0 3px;
  transition: background-color 0.2s ease;
}

.repo-item:hover {
  background-color: #2d2d2d;
}

.repo-item:hover {
  background-color: #2d2d2d;
}

.repo-item:hover::before {
  background-color: #404040;
}

.repo-selected {
  background-color: #2d2d2d;
}

.repo-selected::before {
  background-color: #4CAF50 !important;
}

.repo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
}

.tag-menu-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 20px;
  cursor: pointer;
  padding: 0 5px;
}

.tag-menu-btn:hover {
  color: #e1e1e1;
}

.tag-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 4px;
  padding: 10px;
  z-index: 1000;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tag-menu-header {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.new-tag-input {
  flex-grow: 1;
  background-color: #1a1a1a;
  border: 1px solid #404040;
  color: #e1e1e1;
  padding: 4px 8px;
  border-radius: 4px;
}

.add-tag-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.add-tag-btn:disabled {
  background-color: #2d2d2d;
  cursor: not-allowed;
}

.available-tags {
  max-height: 200px;
  overflow-y: auto;
}

.tag-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 2px;
}

.tag-menu-item:hover {
  background-color: #363636;
}

.tag-selected {
  background-color: #404040;
}

.tag-action {
  color: #888;
}

.repo-meta {
  margin-top: 10px;
  color: #888;
}

.repo-meta span {
  margin-right: 15px;
}

.repo-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background-color: #363636;
  color: #e1e1e1;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 14px;
  padding: 0 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-tag-btn:hover {
  color: #e1e1e1;
}
</style>