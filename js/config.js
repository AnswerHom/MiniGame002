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
