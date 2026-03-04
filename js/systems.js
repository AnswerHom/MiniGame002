// ===== 系统配置数据 =====

// 武器数据
const WEAPONS = {
    // 剑系
    ironSword: { name: '铁剑', type: 'sword', attack: 10, price: 0, icon: '⚔️', rarity: 1 },
    steelSword: { name: '钢剑', type: 'sword', attack: 25, price: 100, icon: '⚔️', rarity: 2 },
    jadeSword: { name: '玉剑', type: 'sword', attack: 50, price: 500, icon: '⚔️', rarity: 3 },
    spiritualSword: { name: '灵剑', type: 'sword', attack: 100, price: 2000, icon: '⚔️', rarity: 4 },
    immortalSword: { name: '仙剑', type: 'sword', attack: 250, price: 8000, icon: '⚔️', rarity: 5 },
    celestialSword: { name: '天剑', type: 'sword', attack: 600, price: 30000, icon: '⚔️', rarity: 6 },
    // 刀系
    ironBlade: { name: '铁刀', type: 'blade', attack: 12, price: 0, icon: '🔪', rarity: 1 },
    steelBlade: { name: '钢刀', type: 'blade', attack: 28, price: 120, icon: '🔪', rarity: 2 },
    // 枪系
    ironSpear: { name: '铁枪', type: 'spear', attack: 15, price: 0, icon: '🔱', rarity: 1 },
    // 弓系
    ironBow: { name: '铁弓', type: 'bow', attack: 18, price: 0, icon: '🏹', rarity: 1 },
};

// 怒气技能
const RAGE_SKILLS = {
    // 攻击型
    slash: { name: '斩击', icon: '💥', damage: 1.5, cost: 30, duration: 0.5 },
    // 防御型
    shield: { name: '护盾', icon: '🛡️', defense: 50, cost: 40, duration: 3 },
    // 移动型
    dash: { name: '冲刺', icon: '💨', distance: 200, cost: 20 },
    // 爆发型
    explosion: { name: '爆发', icon: '💣', damage: 2.0, cost: 50, radius: 100 },
};

// 连击技能
const COMBO_SKILLS = {
    doubleStrike: { name: '二重击', icon: '⚔️', hits: 2, damage: 0.6 },
    tripleStrike: { name: '三连击', icon: '⚔️⚔️', hits: 3, damage: 0.5 },
    quadStrike: { name: '四连击', icon: '⚔️⚔️⚔️', hits: 4, damage: 0.45 },
    pentaStrike: { name: '五连击', icon: '⚔️⚔️⚔️⚔️', hits: 5, damage: 0.4 },
};

// 主动技能
const ACTIVE_SKILLS = {
    // 武器技能
    swordSlash: { name: '剑斩', icon: '⚔️', damage: 2.0, cooldown: 5, manaCost: 20, unlockLevel: 5, description: '挥剑造成200%伤害' },
    bladeStorm: { name: '刀刃风暴', icon: '🌀', damage: 1.5, cooldown: 8, manaCost: 30, unlockLevel: 10, description: '旋转刀刃造成范围伤害' },
    spearThrust: { name: '枪刺', icon: '🔱', damage: 2.5, cooldown: 6, manaCost: 25, unlockLevel: 8, description: '强力刺击造成250%伤害' },
    arrowRain: { name: '箭雨', icon: '🏹', damage: 1.2, cooldown: 10, manaCost: 40, unlockLevel: 12, description: '天降箭雨覆盖范围敌人' },
    
    // 通用技能
    heal: { name: '治疗', icon: '💚', damage: -0.5, cooldown: 15, manaCost: 30, unlockLevel: 3, description: '恢复50%最大生命值' },
    shield: { name: '护盾', icon: '🛡️', defense: 100, cooldown: 12, manaCost: 25, unlockLevel: 5, description: '获得护盾吸收伤害' },
    teleport: { name: '瞬移', icon: '✨', distance: 300, cooldown: 8, manaCost: 20, unlockLevel: 7, description: '瞬间移动到指定方向' },
    
    // 元素技能
    fireball: { name: '火球', icon: '🔥', damage: 2.5, cooldown: 6, manaCost: 35, unlockLevel: 10, description: '发射火球造成250%伤害' },
    iceBurst: { name: '冰爆', icon: '❄️', damage: 2.0, cooldown: 7, manaCost: 30, unlockLevel: 12, description: '冰冻周围敌人' },
    thunderStrike: { name: '雷击', icon: '⚡', damage: 3.0, cooldown: 10, manaCost: 50, unlockLevel: 15, description: '召唤雷电造成300%伤害' },
};

// 被动技能
const SKILLS = {
    // 战斗系
    powerStrike: { name: '重击', icon: '💪', stat: 'attack', value: 10, type: 'passive', cooldown: 0, unlockLevel: 1, maxLevel: 10 },
    ironBody: { name: '铁身', icon: '🛡️', stat: 'defense', value: 5, type: 'passive', cooldown: 0, unlockLevel: 1, maxLevel: 10 },
    criticalEye: { name: '暴击眼', icon: '👁️', stat: 'critRate', value: 0.02, type: 'passive', cooldown: 0, unlockLevel: 3, maxLevel: 5 },
    swiftStrike: { name: '速击', icon: '⚡', stat: 'attackSpeed', value: 0.1, type: 'passive', cooldown: 0, unlockLevel: 5, maxLevel: 5 },
    
    // 元素系
    fireMastery: { name: '火精通', icon: '🔥', stat: 'fireDamage', value: 0.1, type: 'passive', cooldown: 0, unlockLevel: 8, maxLevel: 3 },
    iceMastery: { name: '冰精通', icon: '❄️', stat: 'iceDamage', value: 0.1, type: 'passive', cooldown: 0, unlockLevel: 8, maxLevel: 3 },
    thunderMastery: { name: '雷精通', icon: '⚡', stat: 'thunderDamage', value: 0.1, type: 'passive', cooldown: 0, unlockLevel: 8, maxLevel: 3 },
    
    // 生存系
    lifeBoost: { name: '生命提升', icon: '❤️', stat: 'maxHp', value: 50, type: 'passive', cooldown: 0, unlockLevel: 2, maxLevel: 10 },
    regen: { name: '回复', icon: '💚', stat: 'hpRegen', value: 1, type: 'passive', cooldown: 0, unlockLevel: 4, maxLevel: 5 },
    dodge: { name: '闪避', icon: '💨', stat: 'dodge', value: 0.02, type: 'passive', cooldown: 0, unlockLevel: 6, maxLevel: 5 },
    
    // 资源系
    goldFinder: { name: '探金', icon: '💰', stat: 'goldDrop', value: 0.1, type: 'passive', cooldown: 0, unlockLevel: 5, maxLevel: 5 },
    expBoost: { name: '经验提升', icon: '📚', stat: 'expGain', value: 0.1, type: 'passive', cooldown: 0, unlockLevel: 7, maxLevel: 5 },
};

// 装备数据
const EQUIPMENT = {
    // 头盔
    ironHelmet: { name: '铁头盔', type: 'helmet', defense: 5, hp: 20, price: 50, icon: '⛑️', rarity: 1 },
    steelHelmet: { name: '钢头盔', type: 'helmet', defense: 15, hp: 50, price: 200, icon: '⛑️', rarity: 2 },
    // 护甲
    leatherArmor: { name: '皮甲', type: 'armor', defense: 10, hp: 30, price: 80, icon: '👕', rarity: 1 },
    ironArmor: { name: '铁甲', type: 'armor', defense: 25, hp: 80, price: 300, icon: '🛡️', rarity: 2 },
    // 鞋子
    leatherBoots: { name: '皮靴', type: 'boots', defense: 5, speed: 5, price: 50, icon: '👢', rarity: 1 },
    // 戒指
    silverRing: { name: '银戒指', type: 'ring', attack: 10, price: 150, icon: '💍', rarity: 2 },
};

// 消耗品数据
const CONSUMABLES = {
    healthPotion: { name: '生命药水', icon: '❤️', effect: 'heal', value: 50, price: 10 },
    manaPotion: { name: '法力药水', icon: '💙', effect: 'mana', value: 30, price: 15 },
    speedPotion: { name: '加速药水', icon: '⚡', effect: 'speed', value: 30, duration: 60, price: 20 },
    attackPotion: { name: '攻击药水', icon: '⚔️', effect: 'attack', value: 20, duration: 60, price: 25 },
};

// 境界数据
const REALMS = {
    1: { name: '炼体期', expMultiplier: 1.0, hpMultiplier: 1.0, attackMultiplier: 1.0 },
    10: { name: '炼气期', expMultiplier: 1.2, hpMultiplier: 1.2, attackMultiplier: 1.2 },
    20: { name: '筑基期', expMultiplier: 1.5, hpMultiplier: 1.5, attackMultiplier: 1.5 },
    30: { name: '金丹期', expMultiplier: 2.0, hpMultiplier: 2.0, attackMultiplier: 2.0 },
    40: { name: '元婴期', expMultiplier: 2.5, hpMultiplier: 2.5, attackMultiplier: 2.5 },
    50: { name: '化神期', expMultiplier: 3.0, hpMultiplier: 3.0, attackMultiplier: 3.0 },
};

// 掉落表
const DROP_TABLES = {
    basic: { gold: { min: 1, max: 5 }, exp: { min: 5, max: 15 } },
    common: { gold: { min: 5, max: 15 }, exp: { min: 15, max: 30 } },
    elite: { gold: { min: 20, max: 50 }, exp: { min: 50, max: 100 }, itemChance: 0.3 },
    boss: { gold: { min: 100, max: 300 }, exp: { min: 200, max: 500 }, itemChance: 0.8 },
};

// 导出供外部使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WEAPONS, RAGE_SKILLS, COMBO_SKILLS, ACTIVE_SKILLS, SKILLS, EQUIPMENT, CONSUMABLES, REALMS, DROP_TABLES };
}
