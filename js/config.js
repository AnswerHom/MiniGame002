// ===== v1.0.5 基础配置 =====
// 包含：canvas初始化、基础配置

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CONFIG = { width: 800, height: 450, groundY: 380, cameraOffset: 0, distanceScale: 10 };  // v1.2.3: 10px = 1米
canvas.width = CONFIG.width;
canvas.height = CONFIG.height;

const BATTLE_STATES = {
    ADVANCE: 'advance',
    COMBAT: 'combat',
    VICTORY: 'victory'
};

// 境界系统
const REALMS = [
    { name: '练气', minLevel: 1 },
    { name: '筑基', minLevel: 5 },
    { name: '金丹', minLevel: 10 },
    { name: '元婴', minLevel: 15 },
    { name: '化神', minLevel: 20 },
    { name: '炼虚', minLevel: 25 },
    { name: '合体', minLevel: 30 },
    { name: '大乘', minLevel: 35 },
    { name: '渡劫', minLevel: 40 },
    { name: '飞升', minLevel: 50 }
];

const REALM_COLORS = {
    '练气': '#888888',
    '筑基': '#4ade80',
    '金丹': '#fbbf24',
    '元婴': '#f97316',
    '化神': '#ef4444',
    '炼虚': '#ec4899',
    '合体': '#8b5cf6',
    '大乘': '#3b82f6',
    '渡劫': '#06b6d4',
    '飞升': '#fbbf24'
};

function getRealm(level) {
    for (let i = REALMS.length - 1; i >= 0; i--) {
        if (level >= REALMS[i].minLevel) return REALMS[i];
    }
    return REALMS[0];
}
