const BASE_URL = 'http://127.0.0.1';

const TAG_DATA = {};
let ALL_STAR_REPO = [];

async function getUser() {
    const resp = await fetch(`${BASE_URL}/api/user`);
    const data = await resp.json();
    _checkResp(data);
    return data;
}

async function getTags() {
    await _loadTagRepo();
    return [...TAG_DATA.tags];
}

async function addTag(tagName) {
    await _loadTagRepo();
    if (TAG_DATA.tags.includes(tagName)) {
        return false;
    }
    TAG_DATA.tags.push(tagName);
    await _saveTagRepo();
    return true;
}

async function deleteTag(tagName) {
    await _loadTagRepo();
    const idx = TAG_DATA.tags.indexOf(tagName);
    if (idx == -1) {
        return;
    }
    TAG_DATA.tags.splice(idx, 1);
    delete TAG_DATA.tag_repos[tagName];
    await _saveTagRepo();
}

async function editTag(oldTag, newTag) {
    if (oldTag == newTag) {
        return;
    }
    await _loadTagRepo();
    const idx = TAG_DATA.tags.indexOf(oldTag);
    if (idx == -1) {
        return;
    }
    if (TAG_DATA.tags.includes(newTag)) {
        // 如果已经存在，则删除旧的，合并新的
        const old = TAG_DATA.tag_repos[oldTag] || [];
        const news = TAG_DATA.tag_repos[newTag] || [];
        news.push(...old);
        TAG_DATA.tag_repos[newTag] = news;
        TAG_DATA.tags.splice(idx, 1);
    } else {
        TAG_DATA.tag_repos[newTag] = TAG_DATA.tag_repos[oldTag];
        TAG_DATA.tags[idx] = newTag;
    }
    if (!TAG_DATA.tag_repos[newTag] || TAG_DATA.tag_repos[newTag].length == 0) {
        delete TAG_DATA.tag_repos[newTag];
    }
    delete TAG_DATA.tag_repos[oldTag];
    await _saveTagRepo();
}

async function _loadTagRepo() {
    await _tryToLock('_loadTagRepo');
    try {
        if (TAG_DATA.tags) {
            return;
        }
        const resp = await fetch(`${BASE_URL}/api/getTagRepo`);
        const data = await resp.json();
        _checkResp(data);
        TAG_DATA.tags = data.tags || [];
        TAG_DATA.tag_repos = data.tag_repos || {};
    } finally {
        await _releaseLock('_loadTagRepo');
    }
}

async function _loadAllStarRepo() {
    await _tryToLock('_loadAllStarRepo');
    try {
        if (ALL_STAR_REPO.length > 0) {
            return;
        }
        const resp = await fetch(`${BASE_URL}/api/getAllStarRepo`);
        const data = await resp.json();
        _checkResp(data);
        ALL_STAR_REPO = data;
    } finally {
        await _releaseLock('_loadAllStarRepo');
    }
}

const LOCK = {};

async function _tryToLock(key) {
    while (LOCK[key]) {
        console.log(`wait to get lock:${key}`);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    LOCK[key] = true;
}

async function _releaseLock(key) {
    delete LOCK[key];
}

async function _saveTagRepo() {
    console.log(TAG_DATA);
}

async function getLanguages() {
    await _loadAllStarRepo();
    const names = [...new Set(ALL_STAR_REPO.map(item => item.language))];
    return names.map(item => {
        return {
            name: item,
            color: _getRandomColor()
        };
    });
}

function _getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

async function getAllRepos() {
    await _loadTagRepo();
    await _loadAllStarRepo();
    // 接口返回格式，需要追加 tags
    // {
    //     name: 'aaa/bbb',
    //     description: '',
    //     startCnt: 11,
    //     language: 'java',
    //     topics: ['xml', 'json']
    // }
    for (const repo of ALL_STAR_REPO) {
        repo.tags = [];
        for (const tag of TAG_DATA.tags) {
            const repos = TAG_DATA.tag_repos[tag] || [];
            if (repos.includes(repo.name)) {
                repo.tags.push(tag);
            }
        }
    }
    return ALL_STAR_REPO;
}

async function addRepoTag(repo, tag) {
    const repos = TAG_DATA.tag_repos[tag] || [];
    if (!repos.includes(repo.name)) {
        repos.push(repo.name);
    }
    TAG_DATA.tag_repos[tag] = repos;
    await _saveTagRepo();
}

async function deleteRepoTag(repo, tag) {
    const repos = TAG_DATA.tag_repos[tag] || [];
    repos.remove(repo.name);
    if (repos.length === 0) {
        delete TAG_DATA.tag_repos[tag];
    }
    await _saveTagRepo();
}

async function getReadme(repoName) {
    const resp = await fetch(`${BASE_URL}/api/readme?repoName=${repoName}`);
    const data = await resp.json();
    _checkResp(data);
    return data.html;
}

function _checkResp(data) {
    if (data.error) {
        if (data.error == 302) {
            window.location.href = data.location;
        }
    }
}

export default {
    getUser,
    getTags,
    getLanguages,
    addTag,
    deleteTag,
    editTag,
    getAllRepos,
    addRepoTag,
    deleteRepoTag,
    getReadme,
}