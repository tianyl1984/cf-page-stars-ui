<script setup>
import { ref } from 'vue';
import LeftPanel from './components/LeftPanel.vue';
import RepoList from './components/RepoList.vue';
import ReadmeViewer from './components/ReadmeViewer.vue';
import Loading from './components/Loading.vue';

const selectedMenu = ref({ type: 'menu', value: 'all' });
const selectedRepo = ref(null);
const isLoading = ref(false);

const handleMenuSelect = (menu) => {
  selectedMenu.value = menu;
};

const handleRepoSelect = (repo) => {
  selectedRepo.value = repo;
};

</script>

<template>
  <div class="app-container">
    <LeftPanel @menu-select="handleMenuSelect" v-model:isLoading="isLoading"/>
    <RepoList :selected-menu="selectedMenu" @repo-select="handleRepoSelect" />
    <ReadmeViewer :repo="selectedRepo" />
    <Loading v-model:isLoading="isLoading" />
  </div>
</template>

<style>
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #1a1a1a;
}

/* Reset some default styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #e1e1e1;
  background-color: #1a1a1a;
}
</style>