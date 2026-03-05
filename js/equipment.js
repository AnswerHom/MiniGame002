// ===== v1.7.0 装备系统 =====

// 装备类型
const EQUIP_TYPES = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    ACCESSORY: 'accessory'
};

// 装备稀有度
const EQUIP_RARITY = {
    COMMON: 'common',     // 普通 - 白色
    RARE: 'rare',         // 稀有 - 绿色
    EPIC: 'epic',         // 史诗 - 紫色
    LEGENDARY: 'legendary' // 传奇 - 橙色
};

// 装备稀有度颜色
const RARITY_COLORS = {
    common: '#ffffff',
    rare: '#4ade80',
    epic: '#a855f7',
    legendary: '#f97316'
};

// 装备掉落概率
const RARITY_DROP_RATES = {
    common: 0.60,    // 60%
    rare: 0.25,      // 25%
    epic: 0.12,      // 12%
    legendary: 0.03  // 3%
};

// 装备定义 - 按稀有度和类型
function getEquipmentDefinitions() {
    return {
        // 武器
        weapon: {
            common: [
                { id: 'weapon_001', name: '铁剑', type: EQUIP_TYPES.WEAPON, rarity: EQUIP_RARITY.COMMON, icon: '⚔️', attrs: { atk: 5 }, desc: '普通的铁剑', dropLevel: 1 },
                { id: 'weapon_002', name: '钢剑', type: EQUIP_TYPES.WEAPON, rarity: EQUIP_RARITY.COMMON, icon: '⚔️', attrs: { atk: 8 }, desc: '精炼钢剑', dropLevel: 2 },
                { id: 'weapon_003', name: '长剑', type: EQUIP_TYPES.WEAPON, rarity: EQUIP_RARITY.COMMON, icon: '⚔️', attrs: { atk: 12 }, desc: '标准长剑', dropLevel: 3 }
            ],
            rare: [
                { id: 'weapon_004', name: '玄铁剑', type: EQUIP_TYPES.WEAPON, rarity: EQUIP_RARITY.RARE, icon: '⚔️', attrs: { atk: 18 }, desc: '玄铁打造', dropLevel: 2 },
                { id: 'weapon_005', name: '青锋剑', type: EQUIP_TYPES.WEAPON, rarity: EQUIP_RARITY.RARE, icon: '⚔️', attrs: { atk: 25 }, desc: '青锋剑客之物', dropLevel: 3 },
                { id: 'weapon_006', name: '寒冰剑', type: EQUIP_TYPES.WEAPON, rarity: EQUIP_RARITY.RARE, icon: '⚔️', attrs: { atk: 30 }, desc: '寒冰之力', dropLevel: 4 }
            ],
            epic: [
                { id: 'weapon_007', name: '烈焰剑', type: EQUIP_TYPES.WEAPON, rarity: EQUIP_RARITY.EPIC, icon: '🔥', attrs: { atk: 45 }, desc: '火焰之力', dropLevel: 4 },
                { id: 'weapon_008', name: '天雷剑', type: EQUIP_TYPES.WEAPON, rarity: EQUIP_RARITY.EPIC, icon: '⚡', attrs: { atk: 55 }, desc: '天雷之力', dropLevel: 5 }
            ],
            legendary: [
                { id: 'weapon_009', name: '轩辕剑', type: EQUIP_TYPES.WEAPON, rarity: EQUIP_RARITY.LEGENDARY, icon: '✨', attrs: { atk: 80 }, desc: '上古神器', dropLevel: 5 },
                { id: 'weapon_010', name: '太阿剑', type: EQUIP_TYPES.WEAPON, rarity: EQUIP_RARITY.LEGENDARY, icon: '🌟', attrs: { atk: 100 }, desc: '镇国神器', dropLevel: 5 }
            ]
        },
        // 防具
        armor: {
            common: [
                { id: 'armor_001', name: '布衣', type: EQUIP_TYPES.ARMOR, rarity: EQUIP_RARITY.COMMON, icon: '👕', attrs: { def: 3 }, desc: '普通布衣', dropLevel: 1 },
                { id: 'armor_002', name: '皮甲', type: EQUIP_TYPES.ARMOR, rarity: EQUIP_RARITY.COMMON, icon: '🛡️', attrs: { def: 5 }, desc: '皮质护甲', dropLevel: 2 },
                { id: 'armor_003', name: '轻甲', type: EQUIP_TYPES.ARMOR, rarity: EQUIP_RARITY.COMMON, icon: '🛡️', attrs: { def: 8 }, desc: '轻便护甲', dropLevel: 3 }
            ],
            rare: [
                { id: 'armor_004', name: '铁甲', type: EQUIP_TYPES.ARMOR, rarity: EQUIP_RARITY.RARE, icon: '🛡️', attrs: { def: 12 }, desc: '精铁护甲', dropLevel: 2 },
                { id: 'armor_005', name: '锁甲', type: EQUIP_TYPES.ARMOR, rarity: EQUIP_RARITY.RARE, icon: '🛡️', attrs: { def: 18 }, desc: '锁子甲', dropLevel: 3 },
                { id: 'armor_006', name: '皮靴', type: EQUIP_TYPES.ARMOR, rarity: EQUIP_RARITY.RARE, icon: '👢', attrs: { def: 8, spd: 5 }, desc: '增加移动速度', dropLevel: 2 }
            ],
            epic: [
                { id: 'armor_007', name: '灵甲', type: EQUIP_TYPES.ARMOR, rarity: EQUIP_RARITY.EPIC, icon: '💎', attrs: { def: 30 }, desc: '蕴含灵气', dropLevel: 4 },
                { id: 'armor_008', name: '风靴', type: EQUIP_TYPES.ARMOR, rarity: EQUIP_RARITY.EPIC, icon: '🌪️', attrs: { def: 15, spd: 15 }, desc: '风之力量', dropLevel: 4 }
            ],
            legendary: [
                { id: 'armor_009', name: '玄天甲', type: EQUIP_TYPES.ARMOR, rarity: EQUIP_RARITY.LEGENDARY, icon: '🛡️', attrs: { def: 50 }, desc: '玄天护甲', dropLevel: 5 },
                { id: 'armor_010', name: '踏云靴', type: EQUIP_TYPES.ARMOR, rarity: EQUIP_RARITY.LEGENDARY, icon: '☁️', attrs: { def: 20, spd: 30 }, desc: '腾云驾雾', dropLevel: 5 }
            ]
        },
        // 饰品
        accessory: {
            common: [
                { id: 'acc_001', name: '项链', type: EQUIP_TYPES.ACCESSORY, rarity: EQUIP_RARITY.COMMON, icon: '📿', attrs: { crit: 0.02 }, desc: '普通项链', dropLevel: 1 },
                { id: 'acc_002', name: '戒指', type: EQUIP_TYPES.ACCESSORY, rarity: EQUIP_RARITY.COMMON, icon: '💍', attrs: { crit: 0.03 }, desc: '普通戒指', dropLevel: 2 }
            ],
            rare: [
                { id: 'acc_003', name: '玉佩', type: EQUIP_TYPES.ACCESSORY, rarity: EQUIP_RARITY.RARE, icon: '🧿', attrs: { crit: 0.05, critDmg: 0.1 }, desc: '增加暴击', dropLevel: 3 },
                { id: 'acc_004', name: '护符', type: EQUIP_TYPES.ACCESSORY, rarity: EQUIP_RARITY.RARE, icon: '🧿', attrs: { crit: 0.08 }, desc: '幸运护符', dropLevel: 3 }
            ],
            epic: [
                { id: 'acc_005', name: '灵犀佩', type: EQUIP_TYPES.ACCESSORY, rarity: EQUIP_RARITY.EPIC, icon: '💠', attrs: { crit: 0.10, critDmg: 0.2 }, desc: '心灵感应', dropLevel: 4 }
            ],
            legendary: [
                { id: 'acc_006', name: '聚宝盆', type: EQUIP_TYPES.ACCESSORY, rarity: EQUIP_RARITY.LEGENDARY, icon: '🏆', attrs: { goldBonus: 0.2 }, desc: '增加金币获取', dropLevel: 5 }
            ]
        }
    };
}

// 玩家装备数据
const playerEquipment = {
    weapon: null,     // 当前穿戴的武器
    armor: null,      // 当前穿戴的防具
    accessory: null   // 当前穿戴的饰品
};

// 掉落装备的怪物类型映射
const MONSTER_EQUIP_DROP = {
    // 野猪精 - 掉落武器
    'enemy_001': { types: ['weapon'], minLevel: 1 },
    // 灰狼 - 掉落防具
    'enemy_002': { types: ['armor'], minLevel: 1 },
    // 蛇妖 - 掉落饰品
    'enemy_003': { types: ['accessory'], minLevel: 2 },
    // 僵尸 - 掉落武器
    'enemy_004': { types: ['weapon'], minLevel: 2 },
    // 山贼 - 掉落防具
    'enemy_005': { types: ['armor', 'accessory'], minLevel: 2 },
    // 默认掉落
    'default': { types: ['weapon', 'armor', 'accessory'], minLevel: 1 }
};

// 根据稀有度随机获取装备
function getRandomRarity() {
    const rand = Math.random();
    let cumulative = 0;
    for (const [rarity, rate] of Object.entries(RARITY_DROP_RATES)) {
        cumulative += rate;
        if (rand < cumulative) {
            return rarity;
        }
        // 处理边界情况
        if (rand <= cumulative) return rarity;
    }
    return EQUIP_RARITY.COMMON;
}

// 生成装备掉落
function generateEquipmentDrop(monsterType, monsterLevel) {
    const equipDefs = getEquipmentDefinitions();
    const dropConfig = MONSTER_EQUIP_DROP[monsterType] || MONSTER_EQUIP_DROP['default'];
    
    // 随机选择装备类型
    const equipType = dropConfig.types[Math.floor(Math.random() * dropConfig.types.length)];
    
    // 根据怪物等级和掉落概率决定是否掉落装备
    // 基础掉落率 30%，每级 +5%，最高 60%
    const dropRate = Math.min(0.6, 0.3 + monsterLevel * 0.05);
    if (Math.random() > dropRate) {
        return null; // 不掉落装备
    }
    
    // 随机稀有度（根据等级限制）
    let rarity = getRandomRarity();
    
    // 根据怪物等级限制稀有度
    const maxRarityByLevel = [
        { level: 1, max: EQUIP_RARITY.COMMON },
        { level: 2, max: EQUIP_RARITY.RARE },
        { level: 3, max: EQUIP_RARITY.EPIC },
        { level: 4, max: EQUIP_RARITY.EPIC },
        { level: 5, max: EQUIP_RARITY.LEGENDARY }
    ];
    
    let maxRarity = EQUIP_RARITY.COMMON;
    for (const limit of maxRarityByLevel) {
        if (monsterLevel >= limit.level) {
            maxRarity = limit.max;
        }
    }
    
    // 限制稀有度
    const rarityOrder = [EQUIP_RARITY.COMMON, EQUIP_RARITY.RARE, EQUIP_RARITY.EPIC, EQUIP_RARITY.LEGENDARY];
    if (rarityOrder.indexOf(rarity) > rarityOrder.indexOf(maxRarity)) {
        rarity = maxRarity;
    }
    
    // 获取该类型和稀有度的装备列表
    const equipList = equipDefs[equipType]?.[rarity];
    if (!equipList || equipList.length === 0) {
        return null;
    }
    
    // 随机选择一件装备
    const equipTemplate = equipList[Math.floor(Math.random() * equipList.length)];
    
    // 创建装备实例
    const equip = {
        ...equipTemplate,
        uid: 'equip_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        index: backpack.items.length  // 分配背包索引
    };
    
    return equip;
}

// 穿戴装备
function equipItem(equip) {
    if (!equip) return false;
    
    let success = false;
    const oldEquip = playerEquipment[equip.type];
    
    // 卸下旧装备
    if (oldEquip) {
        // 旧装备放回背包
        addItemToBackpack({ ...oldEquip });
    }
    
    // 穿戴新装备
    playerEquipment[equip.type] = equip;
    
    // 更新玩家属性
    updatePlayerEquipmentStats();
    
    return true;
}

// 卸下装备
function unequipItem(equipType) {
    const equip = playerEquipment[equipType];
    if (!equip) return false;
    
    // 添加到背包
    addItemToBackpack({ ...equip });
    
    // 清除装备
    playerEquipment[equipType] = null;
    
    // 更新玩家属性
    updatePlayerEquipmentStats();
    
    return true;
}

// 更新玩家装备属性
function updatePlayerEquipmentStats() {
    // 重置为基础值
    player.attack = player.baseAttack;
    player.critRate = 0.05;
    player.critDamage = 2.0;
    
    // 应用装备加成
    for (const [type, equip] of Object.entries(playerEquipment)) {
        if (equip && equip.attrs) {
            if (equip.attrs.atk) {
                player.attack += equip.attrs.atk;
            }
            if (equip.attrs.def) {
                // 防御力可以后续扩展
            }
            if (equip.attrs.spd) {
                player.speed += equip.attrs.spd;
            }
            if (equip.attrs.crit) {
                player.critRate += equip.attrs.crit;
            }
            if (equip.attrs.critDmg) {
                player.critDamage += equip.attrs.critDmg;
            }
        }
    }
    
    // 限制暴击率最大值
    player.critRate = Math.min(0.8, player.critRate);
}

// 添加物品到背包
function addItemToBackpack(item) {
    if (backpack.items.length >= backpack.capacity) {
        // 背包满
        game.showMessage('背包已满！', '#ff4444');
        return false;
    }
    
    // 分配索引
    item.index = backpack.items.length;
    backpack.items.push(item);
    
    return true;
}

// 检查背包是否有空间
function hasBackpackSpace() {
    return backpack.items.length < backpack.capacity;
}

// 获取玩家当前装备信息
function getPlayerEquipmentInfo() {
    return {
        weapon: playerEquipment.weapon,
        armor: playerEquipment.armor,
        accessory: playerEquipment.accessory,
        totalAtkBonus: calculateTotalAtkBonus()
    };
}

// 计算总攻击力加成
function calculateTotalAtkBonus() {
    let bonus = 0;
    if (playerEquipment.weapon?.attrs?.atk) {
        bonus += playerEquipment.weapon.attrs.atk;
    }
    return bonus;
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EQUIP_TYPES,
        EQUIP_RARITY,
        RARITY_COLORS,
        RARITY_DROP_RATES,
        playerEquipment,
        getEquipmentDefinitions,
        generateEquipmentDrop,
        equipItem,
        unequipItem,
        updatePlayerEquipmentStats,
        addItemToBackpack,
        hasBackpackSpace,
        getPlayerEquipmentInfo,
        calculateTotalAtkBonus
    };
}
