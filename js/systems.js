// systems.js - 系统配置分离
// 从 game.js 提取的所有配置数据

// ===== 武器配置 =====
const WEAPONS = {
    剑: { name: '剑', range: 80, attackSpeed: 1.0, baseAttack: 10, attackMult: 1.0, speedMult: 1.0, color: '#C0C0C0', icon: '🗡️' },
    刀: { name: '刀', range: 70, attackSpeed: 0.8, baseAttack: 15, attackMult: 1.5, speedMult: 0.8, color: '#1a1a1a', icon: '⚔️' },
    长枪: { name: '长枪', range: 120, attackSpeed: 1.2, baseAttack: 12, attackMult: 1.2, speedMult: 1.2, color: '#FFD700', icon: '🔱' }
};

// 怒气技能
const RAGE_SKILLS = {
    '剑意·万剑归宗': { name: '剑意·万剑归宗', weapon: '剑', damage: 50, range: 'screen', icon: '🗡️✨' },
    '刀意·裂空斩': { name: '刀意·裂空斩', weapon: '刀', damage: 100, range: 'line', icon: '⚔️💥' },
    '枪意·龙枪突刺': { name: '枪意·龙枪突刺', weapon: '长枪', damage: 80, range: 'rect', icon: '🔱🐉' }
};

// ===== 装备品质 =====
const EQUIP_QUALITY = {
    凡品: { color: '#ffffff', mult: 1.0 },
    精品: { color: '#00ff00', mult: 1.5 },
    极品: { color: '#0088ff', mult: 2.0 },
    仙品: { color: '#ff00ff', mult: 3.0 }
};

// 装备颜色映射
const EQUIP_COLORS = {
    '凡品': '#ffffff',
    '精品': '#00ff00',
    '极品': '#0088ff',
    '仙品': '#ff00ff'
};

// ===== v1.1.0 境界突破配置 =====
const REALM_BREAKTHROUGH = {
    筑基: { requiredLevel: 5, guardian: '阴魂', guardianMult: 1 },
    金丹: { requiredLevel: 10, guardian: '妖狼', guardianMult: 2 },
    元婴: { requiredLevel: 15, guardian: '毒蛛', guardianMult: 2.5 },
    化神: { requiredLevel: 20, guardian: '僵尸', guardianMult: 3 },
    炼虚: { requiredLevel: 25, guardian: '阴魂', guardianMult: 4 },
    合体: { requiredLevel: 30, guardian: '妖狼', guardianMult: 5 },
    大乘: { requiredLevel: 35, guardian: '毒蛛', guardianMult: 6 },
    渡劫: { requiredLevel: 40, guardian: '僵尸', guardianMult: 8 }
};

// ===== v1.2.0 炼丹系统 - 药材数据库 =====
const HERBS = {
    '止血草': { level: 1, name: '止血草', icon: '🌿', color: '#44ff44' },
    '灵气花': { level: 2, name: '灵气花', icon: '🌸', color: '#ff88ff' },
    '凝元果': { level: 3, name: '凝元果', icon: '🍎', color: '#ffaa00' },
    '千年灵芝': { level: 4, name: '千年灵芝', icon: '🍄', color: '#aa44ff' },
    '九天雪莲': { level: 5, name: '九天雪莲', icon: '❄️', color: '#88ffff' }
};

// 丹方配方
const RECIPES = {
    '止血丹': { name: '止血丹', ingredients: { '止血草': 2 }, effect: 'heal', value: 50, icon: '💊' },
    '聚气丹': { name: '聚气丹', ingredients: { '灵气花': 2 }, effect: 'exp', value: 10, icon: '✨' },
    '培元丹': { name: '培元丹', ingredients: { '凝元果': 2 }, effect: 'attack', value: 5, icon: '⚔️' },
    '筑基丹': { name: '筑基丹', ingredients: { '千年灵芝': 1 }, effect: 'breakthrough', value: 0.5, icon: '🧘' },
    '升仙丹': { name: '升仙丹', ingredients: { '九天雪莲': 1 }, effect: 'revive', value: 1, icon: '🌟' }
};

// ===== v1.2.0 灵宠系统 - 灵宠数据库 =====
const PETS = {
    '小狐狸': { name: '小狐狸', quality: '普通', icon: '🦊', skill: 'attackBuff', skillName: '攻击辅助', attackBonus: 5, defenseBonus: 0, speedBonus: 0, catchRate: 0.8 },
    '青蛇': { name: '青蛇', quality: '优秀', icon: '🐍', skill: 'slow', skillName: '减速敌人', attackBonus: 3, defenseBonus: 2, speedBonus: 0, catchRate: 0.5 },
    '雷鹰': { name: '雷鹰', quality: '稀有', icon: '🦅', skill: 'lightning', skillName: '闪电攻击', attackBonus: 8, defenseBonus: 1, speedBonus: 5, catchRate: 0.3 },
    '仙鹤': { name: '仙鹤', quality: '稀有', icon: '🦢', skill: 'speed', skillName: '移动加速', attackBonus: 2, defenseBonus: 3, speedBonus: 10, catchRate: 0.3 },
    '白虎': { name: '白虎', quality: '传说', icon: '🐯', skill: 'battle', skillName: '战斗助战', attackBonus: 15, defenseBonus: 5, speedBonus: 3, catchRate: 0.1 }
};

const PET_QUALITY_COLORS = {
    '普通': '#ffffff',
    '优秀': '#00ff00',
    '稀有': '#0088ff',
    '传说': '#ff00ff'
};

// ===== v1.3.0 仙侣系统 - 仙侣数据库 =====
const COMPANIONS = {
    '素女': { name: '素女', quality: '普通', icon: '👩', skill: 'lifeBonus', skillName: '生命加成', lifeBonus: 50, attackBonus: 0, realmRequired: '筑基', description: '普通仙侣，生命加成' },
    '剑仙': { name: '剑仙', quality: '优秀', icon: '🗡️', skill: 'attackBonus', skillName: '攻击加成', lifeBonus: 0, attackBonus: 15, realmRequired: '金丹', description: '优秀仙侣，攻击加成' },
    '琴姬': { name: '琴姬', quality: '稀有', icon: '🎵', skill: 'expBonus', skillName: '经验加成', lifeBonus: 20, attackBonus: 10, realmRequired: '元婴', description: '稀有仙侣，经验加成' },
    '散人': { name: '散人', quality: '传说', icon: '🧘', skill: 'allBonus', skillName: '全属性加成', lifeBonus: 100, attackBonus: 30, realmRequired: '化神', description: '传说仙侣，全属性加成' }
};

const COMPANION_QUALITY_COLORS = {
    '普通': '#ffffff',
    '优秀': '#00ff00',
    '稀有': '#0088ff',
    '传说': '#ff00ff'
};

// ===== v1.4.0 宗门系统配置 =====
const SECTIONS = {
    '青云宗': { name: '青云宗', icon: '🏛️', bonus: 'attack', bonusValue: 0.10, description: '攻击加成+10%', requiredRealm: '筑基' },
    '玄冰宫': { name: '玄冰宫', icon: '❄️', bonus: 'defense', bonusValue: 0.10, description: '防御加成+10%', requiredRealm: '金丹' },
    '天机阁': { name: '天机阁', icon: '📚', bonus: 'exp', bonusValue: 0.15, description: '经验加成+15%', requiredRealm: '元婴' },
    '万兽山': { name: '万兽山', icon: '🦁', bonus: 'pet', bonusValue: 0.10, description: '灵宠强化+10%', requiredRealm: '金丹' }
};

const SECTION_TASKS = {
    '击杀怪物': { name: '击杀怪物', target: 10, reward: 50, icon: '⚔️' },
    '采集药材': { name: '采集药材', target: 5, reward: 30, icon: '🌿' },
    '挑战副本': { name: '挑战副本', target: 1, reward: 100, icon: '🏰' }
};

// ===== v1.4.0 坐骑系统配置 =====
const MOUNTS = {
    '灵鹿': { name: '灵鹿', quality: '普通', icon: '🦌', speedBonus: 0.20, attackBonus: 0, unlockLevel: 25 },
    '云鹤': { name: '云鹤', quality: '优秀', icon: '🦢', speedBonus: 0.30, attackBonus: 5, unlockLevel: 30 },
    '麒麟': { name: '麒麟', quality: '稀有', icon: '🦓', speedBonus: 0.40, attackBonus: 10, unlockLevel: 35 },
    '鲲鹏': { name: '鲲鹏', quality: '传说', icon: '🐦', speedBonus: 0.50, attackBonus: 0.15, unlockLevel: 40 }
};

const MOUNT_QUALITY_COLORS = {
    '普通': '#ffffff',
    '优秀': '#00ff00',
    '稀有': '#0088ff',
    '传说': '#ff00ff'
};

// ===== v1.4.0 符文系统配置 =====
const RUNES = {
    '力量符文': { name: '力量符文', quality: '普通', icon: '💪', stat: 'attack', statValue: 0.05 },
    '坚固符文': { name: '坚固符文', quality: '普通', icon: '🛡️', stat: 'defense', statValue: 0.05 },
    '敏捷符文': { name: '敏捷符文', quality: '普通', icon: '⚡', stat: 'speed', statValue: 0.05 },
    '暴击符文': { name: '暴击符文', quality: '稀有', icon: '💥', stat: 'critRate', statValue: 0.03 },
    '生命符文': { name: '生命符文', quality: '稀有', icon: '❤️', stat: 'maxHp', statValue: 0.10 },
    '神圣符文': { name: '神圣符文', quality: '传说', icon: '✨', stat: 'skillDamage', statValue: 0.15 },
    '防御符文': { name: '防御符文', quality: '普通', icon: '🛡️', stat: 'defense', statValue: 0.05 },
    '速度符文': { name: '速度符文', quality: '普通', icon: '🏃', stat: 'speed', statValue: 0.05 },
    '吸血符文': { name: '吸血符文', quality: '稀有', icon: '🩸', stat: 'lifesteal', statValue: 0.05 },
    '免伤符文': { name: '免伤符文', quality: '稀有', icon: '🛡️', stat: 'damageReduction', statValue: 0.08 }
};

const RUNE_QUALITY_COLORS = {
    '普通': '#ffffff',
    '稀有': '#0088ff',
    '传说': '#ff00ff'
};

// ===== v1.4.0 连携系统配置 =====
const COMBO_SKILLS = {
    5: { name: '连携技·小', damageMult: 0.5, color: '#ffff00', text: '连击!' },
    10: { name: '连携技·中', damageMult: 1.0, color: '#ff8800', text: '连击!!' },
    20: { name: '连携技·大', damageMult: 2.0, color: '#ff00ff', text: '连击!!!' }
};

// ===== v1.7.0 主动技能系统 =====
const ACTIVE_SKILLS = {
    '御剑术': { 
        name: '御剑术', 
        icon: '🗡️', 
        cooldown: 5, 
        damage: 1.5, 
        range: 300,
        description: '远程飞剑伤害',
        unlockLevel: 1
    },
    '剑气斩': { 
        name: '剑气斩', 
        icon: '⚔️', 
       , 
        cooldown: 8, 
        damage: 2.0, 
        knockback: 100, 
        description: '范围伤害+击退',
        unlockLevel: 5
    },
    '护体光环': { 
        name: '护体光环', 
        icon: '🛡️', 
        cooldown: 12, 
        duration: 3, 
        reflectDamage: 0.5,
        description: '3秒内免伤+反伤',
        unlockLevel: 10
    },
    '疾风步': { 
        name: '疾风步', 
        icon: '💨', 
        cooldown: 10, 
        dashDistance: 200, 
        speedBonus: 1.5,
        duration: 3,
        description: '瞬间位移+加速3秒',
        unlockLevel: 3
    }
};

// 被动技能
const SKILLS = {
    御剑术: { unlockLevel: 5, cooldown: 5, damage: 1.5, name: '御剑术', icon: '🗡️' },
    剑气斩: { unlockLevel: 10, cooldown: 8, damage: 2.0, name: '剑气斩', icon: '⚔️' },
    护体神光: { unlockLevel: 15, cooldown: 15, duration: 3, name: '护体神光', icon: '🛡️' }
};

// ===== 怪物类型配置 =====
const ENEMY_TYPES = {
    阴魂: { minLevel: 1, hp: 20, attack: 5, exp: 20, speed: 50, color: '#7b2d8e', special: null },
    妖狼: { minLevel: 3, hp: 35, attack: 8, exp: 35, speed: 60, color: '#8B4513', special: 'pack' },
    毒蛛: { minLevel: 5, hp: 45, attack: 12, exp: 45, speed: 45, color: '#2E8B57', special: 'poison' },
    僵尸: { minLevel: 8, hp: 80, attack: 15, exp: 80, speed: 30, color: '#556B2F', special: 'regen' },
    鬼火: { minLevel: 10, hp: 30, attack: 20, exp: 50, speed: 80, color: '#00CED1', special: 'phase' },
    兽灵: { minLevel: 12, hp: 100, attack: 25, exp: 100, speed: 55, color: '#FF4500', special: 'frenzy' },
    骨魔: { minLevel: 15, hp: 150, attack: 30, exp: 150, speed: 35, color: '#F5F5DC', special: 'armor' },
    血魔: { minLevel: 18, hp: 200, attack: 35, exp: 200, speed: 50, color: '#DC143C', special: 'drain' },
    魔狼: { minLevel: 20, hp: 180, attack: 40, exp: 180, speed: 70, color: '#4B0082', special: 'pack' },
    魔兽: { minLevel: 25, hp: 300, attack: 50, exp: 300, speed: 45, color: '#8B0000', special: 'smash' }
};

// ===== 境界配置 =====
const REALMS = [
    { name: '凡人', minLevel: 1, hpMult: 1.0, attackMult: 1.0, defenseMult: 1.0, speedMult: 1.0, color: '#ffffff' },
    { name: '筑基', minLevel: 5, hpMult: 1.5, attackMult: 1.3, defenseMult: 1.2, speedMult: 1.1, color: '#00ff00' },
    { name: '金丹', minLevel: 10, hpMult: 2.0, attackMult: 1.6, defenseMult: 1.5, speedMult: 1.2, color: '#0088ff' },
    { name: '元婴', minLevel: 15, hpMult: 2.5, attackMult: 2.0, defenseMult: 1.8, speedMult: 1.3, color: '#ff00ff' },
    { name: '化神', minLevel: 20, hpMult: 3.0, attackMult: 2.5, defenseMult: 2.2, speedMult: 1.4, color: '#ff8800' },
    { name: '炼虚', minLevel: 25, hpMult: 3.5, attackMult: 3.0, defenseMult: 2.5, speedMult: 1.5, color: '#ffff00' },
    { name: '合体', minLevel: 30, hpMult: 4.0, attackMult: 3.5, defenseMult: 3.0, speedMult: 1.6, color: '#00ffff' },
    { name: '大乘', minLevel: 35, hpMult: 5.0, attackMult: 4.0, defenseMult: 3.5, speedMult: 1.8, color: '#ff0000' },
    { name: '渡劫', minLevel: 40, hpMult: 6.0, attackMult: 5.0, defenseMult: 4.0, speedMult: 2.0, color: '#ffd700' }
];

// ===== 场景配置 =====
const SCENES = {
    '竹林': { 
        name: '竹林', 
        background: '#1a472a', 
        groundColor: '#2d5a3d', 
        enemyType: ['阴魂', '妖狼'], 
        music: 'bamboo',
        special: 'calm'
    },
    '荒地': { 
        name: '荒地', 
        background: '#3d2d1a', 
        groundColor: '#5a4a2d', 
        enemyType: ['阴魂', '毒蛛'], 
        music: 'wasteland',
        special: 'dangerous'
    },
    '古墓': { 
        name: '古墓', 
        background: '#1a1a2d', 
        groundColor: '#2d2d4a', 
        enemyType: ['僵尸', '鬼火'], 
        music: 'dungeon',
        special: 'scary'
    },
    '山谷': { 
        name: '山谷', 
        background: '#2d1a3d', 
        groundColor: '#4a2d5a', 
        enemyType: ['骨魔', '血魔'], 
        music: 'valley',
        special: 'treasure'
    },
    '深渊': { 
        name: '深渊', 
        background: '#0a0a15', 
        groundColor: '#15152d', 
        enemyType: ['魔狼', '魔兽'], 
        music: 'abyss',
        special: 'ultimate'
    }
};
