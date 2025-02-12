<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api/index.js'
import { useTagStore } from '@/store/tag.js'
import draggable from 'vuedraggable';

const tagStore = useTagStore();
const user = ref({});
const selectedMenu = ref('all');
const tags = computed(() => tagStore.tags);
const showAddTag = ref(false);
const newTagName = ref('');
const editingTag = ref(null);
const sortMode = ref(false);

// Menu collapse states
const isTagsExpanded = ref(true);
const isLanguageExpanded = ref(false);

// Language menu data
const languages = ref([]);

const fetchUser = async () => {
  user.value = await api.getUser();
}

const fetchTags = async () => {
  await tagStore.fetchTags();
}

const fetchLanguages = async () => {
  languages.value = await api.getLanguages();
}

const emit = defineEmits(['menuSelect']);

const handleMenuSelect = (menu, tag = null) => {
  selectedMenu.value = tag ? `tag-${tag}` : menu;
  emit('menuSelect', { type: tag ? 'tag' : 'menu', value: tag || menu });
};

const handleLanguageSelect = (language) => {
  selectedMenu.value = `lang-${language}`;
  emit('menuSelect', { type: 'language', value: language });
};

const startEditTag = (tag) => {
  editingTag.value = { name: tag, newName: tag };
};

const addTag = async () => {
  if (newTagName.value.trim()) {
    await tagStore.addTag(newTagName.value.trim());
    await fetchTags();
    newTagName.value = '';
    showAddTag.value = false;
  }
};

const saveEditTag = async (oldTag) => {
  const index = tags.value.indexOf(oldTag);
  const newTag = editingTag.value.newName.trim();
  if (index !== -1 && newTag) {
    await tagStore.editTag(oldTag, newTag);
    await fetchTags();
  }
  editingTag.value = null;
};

const deleteTag = async (tagToDelete) => {
  if (confirm(`是否确定删除 "${tagToDelete}" ?`)) {
    const index = tags.value.indexOf(tagToDelete);
    if (index !== -1) {
      await tagStore.deleteTag(tagToDelete);
      await fetchTags();
      if (selectedMenu.value === `tag-${tagToDelete}`) {
        handleMenuSelect('all');
      }
    }
  }
};

const toggleSortMode = () => {
  sortMode.value = !sortMode.value;
};

const init = async () => {
  await fetchUser();
  await fetchTags();
  await fetchLanguages();
}

onMounted(init);
</script>

<template>
  <div class="left-panel">
    <!-- Fixed Header -->
    <div class="fixed-header">
      <div class="user-info">
        <img :src="user.avatar" alt="User avatar" class="avatar">
        <h3>{{ user.name }}</h3>
        <p>{{ user.bio }}</p>
      </div>
    </div>

    <!-- Scrollable Menu -->
    <div class="menu-container">
      <div class="menu">
        <div class="menu-item" :class="{ active: selectedMenu === 'all' }" @click="handleMenuSelect('all')">
          All Repos
        </div>
        <div class="menu-item" :class="{ active: selectedMenu === 'untagged' }" @click="handleMenuSelect('untagged')">
          Untagged
        </div>

        <!-- Tags Section -->
        <div class="tags-section">
          <div class="tags-header" @click="isTagsExpanded = !isTagsExpanded">
            <div class="header-content">
              <span>My Tags</span>
              <span class="expand-icon">{{ isTagsExpanded ? '▼' : '▶' }}</span>
            </div>
            <div class="tag-buttons" v-if="isTagsExpanded">
              <button class="header-btn" @click.stop="showAddTag = true" v-if="!showAddTag">+</button>
              <button class="header-btn sort-btn" :class="{ active: sortMode }" @click.stop="toggleSortMode"
                title="Toggle sort mode">⋮⋮</button>
            </div>
          </div>

          <div v-show="isTagsExpanded">
            <!-- Add Tag Form -->
            <div v-if="showAddTag" class="tag-form">
              <input v-model="newTagName" placeholder="New tag name" @keyup.enter="addTag" class="tag-input">
              <div class="tag-form-buttons">
                <button @click="addTag" class="save-btn">Save</button>
                <button @click="showAddTag = false" class="cancel-btn">Cancel</button>
              </div>
            </div>

            <!-- Tags List -->
            <draggable v-model="tags" class="tags-list" :animation="200" item-key="tag"
              :handle="sortMode ? '.drag-handle' : null" :disabled="!sortMode">
              <template #item="{ element: tag }">
                <div class="tag-item" @click="handleMenuSelect('tag', tag)"
                  :class="{ active: selectedMenu === `tag-${tag}` }">
                  <!-- View Mode -->
                  <div v-if="editingTag?.name !== tag" class="tag-content">
                    <span v-if="sortMode" class="drag-handle">⋮</span>
                    <span class="tag-name">{{ tag }}</span>
                    <div class="tag-actions">
                      <button @click="startEditTag(tag)" class="edit-btn">✎</button>
                      <button @click="deleteTag(tag)" class="delete-btn">×</button>
                    </div>
                  </div>

                  <!-- Edit Mode -->
                  <div v-else class="tag-edit-form">
                    <input v-model="editingTag.newName" @keyup.enter="saveEditTag(tag)" class="tag-input">
                    <div class="tag-form-buttons">
                      <button @click="saveEditTag(tag)" class="save-btn">Save</button>
                      <button @click="editingTag = null" class="cancel-btn">Cancel</button>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>

        <!-- Language Section -->
        <div class="menu-section">
          <div class="menu-header" @click="isLanguageExpanded = !isLanguageExpanded">
            <span>Language</span>
            <span class="expand-icon">{{ isLanguageExpanded ? '▼' : '▶' }}</span>
          </div>

          <div class="submenu" v-show="isLanguageExpanded">
            <div v-for="lang in languages" :key="lang.name" class="submenu-item"
              :class="{ active: selectedMenu === `lang-${lang.name}` }" @click="handleLanguageSelect(lang.name)">
              <div class="lang-icon" :style="{ backgroundColor: lang.color }"></div>
              <span class="lang-name">{{ lang.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed Footer -->
    <div class="fixed-footer">
      <div class="logout">
        <button @click="() => api.logout()">Logout</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.left-panel {
  flex: 0 0 250px;
  width: 250px;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid #2d2d2d;
  background-color: #1f1f1f;
}

.fixed-header {
  flex-shrink: 0;
  padding: 20px;
  border-bottom: 1px solid #2d2d2d;
}

.menu-container {
  flex-grow: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #404040 #1f1f1f;
}

/* Webkit scrollbar styles */
.menu-container::-webkit-scrollbar {
  width: 6px;
}

.menu-container::-webkit-scrollbar-track {
  background: #1f1f1f;
}

.menu-container::-webkit-scrollbar-thumb {
  background-color: #404040;
  border-radius: 3px;
}

.menu-container::-webkit-scrollbar-thumb:hover {
  background-color: #4a4a4a;
}

.menu {
  padding: 20px;
}

.fixed-footer {
  flex-shrink: 0;
  padding: 20px;
  border-top: 1px solid #2d2d2d;
}

.user-info {
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.menu-item,
.tag-item {
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 5px;
  color: #e1e1e1;

}

.menu-item:hover,
.tag-item:hover {
  background-color: #2d2d2d;
}

.active {
  background-color: #363636;
}

/* Language Menu Styles */
.menu-section {
  margin-top: 20px;
}

.menu-header {
  font-weight: bold;
  padding: 10px;
  color: #888;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.menu-header:hover {
  color: #e1e1e1;
}

.expand-icon {
  font-size: 12px;
}

.submenu {
  padding-left: 20px;
}

.submenu-item {
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 4px;
  margin-bottom: 2px;
}

.submenu-item:hover {
  background-color: #2d2d2d;
}

.lang-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.lang-name {
  color: #e1e1e1;
}

/* Tags Section Styles */
.tags-section {
  margin-top: 20px;
}

.tags-header {
  font-weight: bold;
  padding: 10px;
  color: #888;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.tags-header:hover {
  color: #e1e1e1;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-buttons {
  display: flex;
  gap: 5px;
}

.header-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
  padding: 0 5px;
}

.header-btn:hover {
  color: #e1e1e1;
}

.sort-btn {
  font-size: 14px;
}

.sort-btn.active {
  color: #4CAF50;
}

.tags-list {
  padding-left: 20px;
}

.tag-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 20px;
}

.drag-handle {
  cursor: move;
  color: #888;
  margin-right: 8px;
  font-size: 16px;
}

.drag-handle:hover {
  color: #e1e1e1;
}

.tag-name {
  flex-grow: 1;
  cursor: pointer;
}

.tag-actions {
  display: none;
  gap: 5px;
}

.tag-item:hover .tag-actions {
  display: flex;
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 2px 5px;
}

.edit-btn:hover,
.delete-btn:hover {
  color: #e1e1e1;
}

.tag-form,
.tag-edit-form {
  padding: 10px;
  background-color: #252525;
  border-radius: 4px;
  margin-bottom: 5px;
}

.tag-input {
  width: 100%;
  padding: 5px;
  margin-bottom: 5px;
  background-color: #1a1a1a;
  border: 1px solid #2d2d2d;
  color: #e1e1e1;
  border-radius: 4px;
}

.tag-form-buttons {
  display: flex;
  gap: 5px;
}

.save-btn,
.cancel-btn {
  padding: 3px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.save-btn {
  background-color: #4CAF50;
  color: white;
}

.cancel-btn {
  background-color: #666;
  color: white;
}

.save-btn:hover {
  background-color: #45a049;
}

.cancel-btn:hover {
  background-color: #555;
}

.logout {
  width: 100%;
}

.logout button {
  width: 100%;
  padding: 10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout button:hover {
  background-color: #c82333;
}
</style>