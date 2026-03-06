// ===== v1.0.5 基础配置 =====
// 包含：canvas初始化、基础配置

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CONFIG = { width: 800, height: 450, groundY: 380, cameraOffset: 0, distanceScale: 10 };  // v1.2.3: 10px = 1米
canvas.width = CONFIG.width;
canvas.height = CONFIG.height;

// ===== v1.6.0 UI布局与交互规范 =====
const UI_SAFE_ZONE = {
    top: 15,       // 顶部安全边距（紧凑）
    bottom: 80,    // 底部安全边距（预留操作区）
    left: 15,      // 左侧安全边距
    right: 15      // 右侧安全边距
};

const UI_INTERACTION = {
    minButtonSize: 44,      // 最小按钮尺寸 44px
    buttonSpacing: 20,       // 按钮间距 20px（防误触）
    feedbackTime: 100,        // 反馈时间 100ms
    clickPadding: 10          // 点击区域扩展 padding
};

const UI_LAYERS = {
    SCENE: 0,        // 游戏场景、背景、血条
    MIDDLE: 10,      // 角色、怪物
    UI_BASE: 50,     // 基础UI信息（境界、等级等）
    UI_COMBAT: 60,   // 战斗信息（击杀、伤害等）
    UI_BUTTONS: 70,  // 交互按钮
    UI_POPUP: 100,    // 弹窗、遮罩
    UI_FEEDBACK: 110  // 飘字、反馈
};

// ===== 战斗状态 =====
const BATTLE_STATES = {
    ADVANCE: 'advance',
    COMBAT: 'combat',
    VICTORY: 'victory'
};

// ===== 境界系统 =====
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

function getRealm(level) {
    for (let i = REALMS.length - 1; i >= 0; i--) {
        if (level >= REALMS[i].minLevel) return REALMS[i];
    }
    return REALMS[0];
}

// ===== v2.1.0 灵气系统配置 =====
const SPIRIT_SYSTEM = {
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
        '飞升': 0
    },
    realmSpiritMultiplier: {
        '练气': 1.0, '筑基': 1.2, '金丹': 1.5, '元婴': 2.0, '化神': 2.5,
        '炼虚': 3.0, '合体': 3.5, '大乘': 4.0, '渡劫': 5.0, '飞升': 1.0
    },
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
    spiritDrop: {
        normal: { min: 10, max: 20 },
        elite: { min: 30, max: 50 },
        boss: { min: 100, max: 200 }
    }
};

// ===== v2.5.0 武器系统配置 =====
const WEAPON_SYSTEM = {
    sword: {
        name: '剑', baseAttack: 10, attackSpeed: 'medium',
        color: '#c0c0c0', accentColor: '#fc8181',
        effect: 'combo', description: '连击：连续攻击累积连击数，每层+5%伤害，最高5层(25%)'
    },
    blade: {
        name: '刀', baseAttack: 12, attackSpeed: 'fast',
        color: '#708090', accentColor: '#dc143c',
        effect: 'lifesteal', description: '吸血：攻击伤害的10%转化为自身生命'
    },
    spear: {
        name: '枪', baseAttack: 15, attackSpeed: 'slow',
        color: '#ffd700', accentColor: '#daa520',
        effect: 'pierce', description: '穿透：攻击可穿透一条直线上的多个敌人'
    }
};

// ===== v3.0.0 物品系统配置 =====
const ITEM_SYSTEM = {
    healthPotion: {
        small: { name: '初级血瓶', hp: 20, rarity: 1 },
        medium: { name: '中级血瓶', hp: 50, rarity: 2 },
        large: { name: '高级血瓶', hp: 100, rarity: 3 }
    },
    buff: {
        attackBoost: { name: '攻击强化', effect: 'attack', value: 0.5, duration: 30, rarity: 2 },
        defenseBoost: { name: '防御强化', effect: 'defense', value: 0.5, duration: 30, rarity: 2 },
        healthBlessing: { name: '生命祝福', effect: 'maxHp', value: 0.5, duration: 60, rarity: 3 },
        speedBoost: { name: '速度激发', effect: 'speed', value: 0.3, duration: 30, rarity: 2 }
    }
};

// ===== v1.5.7 距离系统配置 =====
const DISTANCE_CONFIG = {
    PIXELS_PER_METER: 10,
    PLAYER_VIEW: 300,           // 30米 - 主角视野
    PLAYER_ATTACK: 70,         // 7米 - 主角攻击距离
    MONSTER_VIEW: 200,         // 20米 - 怪物视野
    MONSTER_CHASE: 250,        // 25米 - 怪物追击距离
    MONSTER_ATTACK: 40         // 4米 - 怪物攻击距离
};
