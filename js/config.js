// ===== v1.0.4 背景系统配置 =====
// 三层背景结构：远景(0.2x)、中景(0.5x)、近景(1.0x)

// 远景配置
const BACKGROUND_LAYERS = {
    far: { speed: 0.2, name: '远景' },
    mid: { speed: 0.5, name: '中景' },
    near: { speed: 1.0, name: '近景' }
};

// 天空渐变配置
const SKY_THEMES = {
    day: { colors: ['#87ceeb', '#b8e0f0', '#e0f7fa'], name: '白天' },
    dusk: { colors: ['#ff7e5f', '#feb47b', '#ffcf9f'], name: '黄昏' },
    night: { colors: ['#0c1445', '#1a2a5c', '#2a3a6c'], name: '夜晚' }
};

// 云朵配置
const CLOUD_CONFIG = {
    minSize: 80,
    maxSize: 150,
    minInterval: 5000,
    maxInterval: 10000,
    speed: 30,
    opacity: 0.6,
    color: 'rgba(255,255,255,0.6)'
};

// 星星配置
const STAR_CONFIG = {
    count: 25,
    minSize: 2,
    maxSize: 4,
    colors: ['#ffffff', '#fffacd', '#e0ffff'],
    twinkleSpeed: 2
};

// 地面细节配置
const GROUND_DETAIL_CONFIG = {
    grassStripeHeight: 20,
    grassColors: ['#90cdf4', '#68d391'],
    flowerColors: ['#ffb6c1', '#ffd700', '#ff69b4'],
    flowerSize: 6,
    stoneColors: ['#696969', '#808080', '#a9a9a9'],
    stoneSize: { min: 10, max: 25 }
};

// 场景远景元素
const SCENE_BACKGROUNDS = {
    '山野之路': {
        sky: 'day',
        mountains: true,
        birds: true,
        trees: true
    },
    '幽林深处': {
        sky: 'dusk',
        mountains: false,
        birds: false,
        trees: true
    },
    '古墓遗迹': {
        sky: 'night',
        mountains: false,
        birds: false,
        trees: false
    }
};

// ===== 配置数据 =====
// 包含：canvas初始化、基础配置、场景配置

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CONFIG = { width: 800, height: 450, groundY: 380, cameraOffset: 0 };
canvas.width = CONFIG.width;
canvas.height = CONFIG.height;

const REALMS = [
    { name: '筑基', minLevel: 1 }, { name: '金丹', minLevel: 5 },
    { name: '元婴', minLevel: 10 }, { name: '化神', minLevel: 15 },
    { name: '炼虚', minLevel: 20 }, { name: '合体', minLevel: 25 },
    { name: '大乘', minLevel: 30 }, { name: '渡劫', minLevel: 35 },
    { name: '飞升', minLevel: 45 }
];

function getRealm(level) {
    for (let i = REALMS.length - 1; i >= 0; i--) {
        if (level >= REALMS[i].minLevel) return REALMS[i];
    }
    return REALMS[0];
}

const SCENES = [
    { name: '山野之路', bgColor: ['#1a0a2e', '#2d1b4e', '#1a3a5c'], groundColor: '#1a2f25' },
    { name: '幽林深处', bgColor: ['#0a1a0a', '#1a2d1a', '#1a3a2a'], groundColor: '#1a2a1a' },
    { name: '古墓遗迹', bgColor: ['#1a1a1a', '#2a2a2a', '#1a2a2a'], groundColor: '#2a2a2a' }
];

function getScene(distance) {
    return SCENES[Math.floor(distance / 1000) % 3];
}

const BATTLE_STATES = {
    ADVANCE: 'advance',
    COMBAT: 'combat',
    VICTORY: 'victory'
};
