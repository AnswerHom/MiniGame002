// MiniGame002 - 游戏主逻辑 v1.11.0
// v1.11.0: 怪物形象完整实现 + 战斗表现优化
// v1.10.1: 怪物形象细节化 - 让程序能画出具体怪物（文档已更新）
// v1.10.0: UI优化 + 怪物形象丰富化
// v1.7.0: 技能系统雏形 + 战斗爽感提升
// v1.6.1: 战斗体验优化 - 自动前进/自动停下战斗/自动继续推进
// v1.6.0: 打击感优化 + 音效系统 + Boss战体验
// v1.5.0: 战斗状态机 + 战斗场景分离 + 战斗节奏优化 + UI界面重构
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

// 境界加成配置
const REALM_BONUS = {
    '筑基': 1.0, '金丹': 1.2, '元婴': 1.5, '化神': 2.0,
    '炼虚': 2.5, '合体': 3.0, '大乘': 4.0, '渡劫': 5.0, '飞升': 6.0
};

// 装备等级颜色
const EQUIP_COLORS = {
    '凡品': '#ffffff',
    '精品': '#00ff00',
    '极品': '#0088ff',
    '仙品': '#ff00ff'
};

// 装备类型定义
const EQUIP_TYPES = {
    '武器': { slot: 'weapon', stat: 'attack', statName: '攻击', icon: '⚔️' },
    '防具': { slot: 'armor', stat: 'defense', statName: '防御', icon: '🛡️' },
    '饰品': { slot: 'accessory', stat: 'critRate', statName: '暴击', icon: '💍' }
};

// 装备数据库
const EQUIP_DATABASE = {
    '武器': {
        '凡品': [
            { name: '铁剑', attack: 5 },
            { name: '木剑', attack: 3 }
        ],
        '精品': [
            { name: '精钢剑', attack: 12 },
            { name: '玄铁剑', attack: 15 }
        ],
        '极品': [
            { name: '青虹剑', attack: 25 },
            { name: '赤焰剑', attack: 28 }
        ],
        '仙品': [
            { name: '倚天剑', attack: 50 },
            { name: '屠龙刀', attack: 55 }
        ]
    },
    '防具': {
        '凡品': [
            { name: '粗布衣', defense: 3 },
            { name: '麻衣', defense: 2 }
        ],
        '精品': [
            { name: '铁甲', defense: 8 },
            { name: '皮甲', defense: 6 }
        ],
        '极品': [
            { name: '锁子甲', defense: 15 },
            { name: '鳞甲', defense: 18 }
        ],
        '仙品': [
            { name: '天蚕丝甲', defense: 35 },
            { name: '金缕衣', defense: 40 }
        ]
    },
    '饰品': {
        '凡品': [
            { name: '粗糙戒指', critRate: 0.01 },
            { name: '普通项链', critRate: 0.01 }
        ],
        '精品': [
            { name: '精金戒指', critRate: 0.03 },
            { name: '翡翠项链', critRate: 0.03 }
        ],
        '极品': [
            { name: '暴击戒指', critRate: 0.06 },
            { name: '敏捷项链', critRate: 0.05 }
        ],
        '仙品': [
            { name: '捆仙绳', critRate: 0.12 },
            { name: '定风珠', critRate: 0.10 }
        ]
    }
};

// 副本配置
const DUNGEONS = {
    '阴魂洞': { 
        name: '阴魂洞', difficulty: 1, 
        enemies: ['阴魂'], enemyCount: 10, 
        rewardExp: 500, rewardEquip: '仙品',
        description: '击败10只阴魂'
    },
    '妖狼谷': { 
        name: '妖狼谷', difficulty: 2, 
        enemies: ['妖狼'], enemyCount: 5, 
        rewardExp: 800, rewardEquip: '仙品',
        description: '击败5只妖狼'
    },
    '万蛛巢': { 
        name: '万蛛巢', difficulty: 3, 
        enemies: ['毒蛛'], enemyCount: 3, 
        rewardExp: 1200, rewardEquip: '仙品',
        description: '击败3只毒蛛'
    },
    '僵尸陵': { 
        name: '僵尸陵', difficulty: 3, 
        enemies: ['僵尸'], enemyCount: 2, 
        rewardExp: 1500, rewardEquip: '仙品',
        description: '击败2只僵尸'
    }
};

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

// v1.5.0 战斗状态机
const BATTLE_STATES = {
    ADVANCE: 'advance',    // 推进状态：主角自动前进
    COMBAT: 'combat',      // 战斗状态：与怪物战斗
    VICTORY: 'victory'     // 战斗胜利：继续推进
};

