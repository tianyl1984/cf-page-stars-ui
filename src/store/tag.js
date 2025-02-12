import { defineStore } from 'pinia';
import api from '@/api/index.js'

export const useTagStore = defineStore('sharedtags', {
    state: () => ({
        tags: [],
        allRepos: [],
        filteredRepos: [],
    }),
    actions: {
        async fetchTags() {
            const data = await api.getTags();
            this.tags = data;
            // console.log('tag.js', this.tags)
        },
        async addTag(newTagName) {
            await api.addTag(newTagName);
            await this.fetchTags();
        },
        async deleteTag(tagName) {
            await api.deleteTag(tagName);
            await this.fetchTags();
        },
        async editTag(oldTag, newTag) {
            await api.editTag(oldTag, newTag);
            await this.fetchTags();
        },
        async _loadAllRepos() {
            if (this.allRepos.length == 0) {
                const repos = await api.getAllRepos();
                this.allRepos = repos;
            }
        },
        async filterRepo(type, value) {
            await this._loadAllRepos();
            if (type === 'all') {
                this.filteredRepos = this.allRepos;
                return;
            }
            if (type === 'untagged') {
                this.filteredRepos = this.allRepos.filter(repo => repo.tags.length === 0);
                return;
            }
            if (type === 'tag') {
                this.filteredRepos = this.allRepos.filter(repo => repo.tags.includes(value));
                return;
            }
            if (type === 'language') {
                this.filteredRepos = this.allRepos.filter(repo => repo.language === value);
                return;
            }
        },
        async repoAddTag(repo, tag) {
            if (!repo.tags.includes(tag)) {
                repo.tags.push(tag);
                await api.addRepoTag(repo, tag);
            }
        },
        async repoDeleteTag(repo, tag) {
            repo.tags.remove(tag);
            await api.deleteRepoTag(repo, tag);
        },
        async loadData() {
            await this.fetchTags();
            await this._loadAllRepos();
        },
    },
});

