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

// ===== v2.1.0 灵气系统配置 =====
const SPIRIT_SYSTEM = {
    // 境界与灵气需求对应
    realmSpiritRequired: {
        '练气': 0,
        '筑基': 1000,
        '金丹': 3000,
        '元婴': 8000,
        '化神': 20000,
        '炼虚': 50000,
        '合体': 100000,
        '大乘': 200000,
        '渡劫': 400000,
        '飞升': 0  // 满级
    },
    // 境界与灵气获取倍率
    realmSpiritMultiplier: {
        '练气': 1.0,
        '筑基': 1.2,
        '金丹': 1.5,
        '元婴': 2.0,
        '化神': 2.5,
        '炼虚': 3.0,
        '合体': 3.5,
        '大乘': 4.0,
        '渡劫': 5.0,
        '飞升': 1.0
    },
    // 境界与属性加成
    realmAttributeBonus: {
        '练气': { hp: 1.0, attack: 1.0, speed: 1.0 },
        '筑基': { hp: 1.2, attack: 1.15, speed: 1.05 },
        '金丹': { hp: 1.5, attack: 1.35, speed: 1.1 },
        '元婴': { hp: 2.0, attack: 1.6, speed: 1.15 },
        '化神': { hp: 2.8, attack: 2.0, speed: 1.2 },
        '炼虚': { hp: 3.5, attack: 2.5, speed: 1.25 },
        '合体': { hp: 4.5, attack: 3.0, speed: 1.3 },
        '大乘': { hp: 5.5, attack: 3.5, speed: 1.35 },
        '渡劫': { hp: 7.0, attack: 4.5, speed: 1.4 },
        '飞升': { hp: 10.0, attack: 6.0, speed: 1.5 }
    },
    // 灵气掉落配置
    spiritDrop: {
        normal: { min: 10, max: 20 },
        elite: { min: 30, max: 50 },
        boss: { min: 100, max: 200 }
    }
};

// 境界等级映射（用于突破判断）
const REALM_LEVEL_MAP = {
    '练气': 1,
    '筑基': 2,
    '金丹': 3,
    '元婴': 4,
    '化神': 5,
    '炼虚': 6,
    '合体': 7,
    '大乘': 8,
    '渡劫': 9,
    '飞升': 10
};
