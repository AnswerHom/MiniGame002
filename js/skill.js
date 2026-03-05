// ===== v1.8.0 技能系统 =====

// 技能类型
const SKILL_TYPES = {
    ACTIVE: 'active',
    PASSIVE: 'passive'
};

// 技能图标映射
const SKILL_ICONS = {
    // 主动技能
    swordSlash: '⚔️',
    shield: '🛡️',
    sprint: '🏃',
    // 被动技能
    battleWill: '💪',
    vitality: '❤️',
    expBoost: '📈'
};

// 技能定义
function getSkillDefinitions() {
    return [
        // ===== 主动技能 =====
        {
            id: 'skill_sword_slash',
            name: '剑斩',
            type: SKILL_TYPES.ACTIVE,
            icon: '⚔️',
            level: 1,
            maxLevel: 5,
            unlockLevel: 1,
            cooldown: 5,  // 冷却时间(秒)
            effect: {
                atkBonus: 10,  // 攻击力加成
                duration: 0  // 持续时间(0表示瞬发)
            },
            upgradeCost: { exp: 100, gold: 50 },
            desc: '快速斩击，造成额外伤害',
            effectDesc: function(level) {
                return '额外伤害: ' + (10 + level * 5);
            }
        },
        {
            id: 'skill_shield',
            name: '护盾',
            type: SKILL_TYPES.ACTIVE,
            icon: '🛡️',
            level: 1,
            maxLevel: 5,
            unlockLevel: 3,
            cooldown: 10,
            effect: {
                defBonus: 20,  // 防御力加成
                duration: 5  // 持续时间(秒)
            },
            upgradeCost: { exp: 150, gold: 80 },
            desc: '短时间内提升防御力',
            effectDesc: function(level) {
                return '防御+' + (20 + level * 10) + ', 持续' + (5 + level) + '秒';
            }
        },
        {
            id: 'skill_sprint',
            name: '疾跑',
            type: SKILL_TYPES.ACTIVE,
            icon: '🏃',
            level: 1,
            maxLevel: 5,
            unlockLevel: 5,
            cooldown: 15,
            effect: {
                speedBonus: 50,  // 速度加成
                duration: 3  // 持续时间(秒)
            },
            upgradeCost: { exp: 200, gold: 100 },
            desc: '短时间内提升移动速度',
            effectDesc: function(level) {
                return '速度+' + (50 + level * 20) + ', 持续' + (3 + level * 0.5).toFixed(1) + '秒';
            }
        },
        
        // ===== 被动技能 =====
        {
            id: 'skill_battle_will',
            name: '战斗意志',
            type: SKILL_TYPES.PASSIVE,
            icon: '💪',
            level: 1,
            maxLevel: 5,
            unlockLevel: 2,
            cooldown: 0,
            effect: {
                critRateBonus: 0.02  // 暴击率加成
            },
            upgradeCost: { exp: 120, gold: 60 },
            desc: '提升暴击率',
            effectDesc: function(level) {
                return '暴击率+' + ((2 + level) * 100).toFixed(0) + '%';
            }
        },
        {
            id: 'skill_vitality',
            name: '体力增强',
            type: SKILL_TYPES.PASSIVE,
            icon: '❤️',
            level: 1,
            maxLevel: 5,
            unlockLevel: 4,
            cooldown: 0,
            effect: {
                maxHpBonus: 20  // 最大生命值加成
            },
            upgradeCost: { exp: 180, gold: 90 },
            desc: '提升最大生命值',
            effectDesc: function(level) {
                return '最大HP+' + (20 + level * 10);
            }
        },
        {
            id: 'skill_exp_boost',
            name: '修炼加速',
            type: SKILL_TYPES.PASSIVE,
            icon: '📈',
            level: 1,
            maxLevel: 5,
            unlockLevel: 6,
            cooldown: 0,
            effect: {
                expBonus: 0.1  // 经验加成比例
            },
            upgradeCost: { exp: 250, gold: 120 },
            desc: '获得更多经验值',
            effectDesc: function(level) {
                return '经验获取+' + ((10 + level * 5)) + '%';
            }
        }
    ];
}

// 玩家技能数据
const playerSkills = {
    learned: [],           // 已学习的技能ID列表
    skillLevels: {},       // 技能等级 { skillId: level }
    activeSkills: {},      // 当前激活的主动技能 { skillId: true }
    skillPoints: 0,        // 技能点(预留)
    
    // 主动技能当前冷却
    cooldowns: {}          // { skillId: remainingTime }
};

// 技能效果状态
const skillEffects = {
    // 持续效果 { skillId: { endTime, effect } }
    activeEffects: []
};

// 初始化技能系统
function initSkills() {
    // 初始已学习一个技能
    playerSkills.learned = ['skill_sword_slash'];
    playerSkills.skillLevels = { skill_sword_slash: 1 };
    playerSkills.activeSkills = { skill_sword_slash: true };
    playerSkills.cooldowns = {};
}

// 检查技能是否可以学习
function canLearnSkill(skillId) {
    const skill = getSkillDefinitions().find(s => s.id === skillId);
    if (!skill) return false;
    
    // 已学习
    if (playerSkills.learned.includes(skillId)) return false;
    
    // 等级足够
    if (player.level < skill.unlockLevel) return false;
    
    return true;
}

// 学习技能
function learnSkill(skillId) {
    const skill = getSkillDefinitions().find(s => s.id === skillId);
    if (!skill) return false;
    
    if (!canLearnSkill(skillId)) return false;
    
    playerSkills.learned.push(skillId);
    playerSkills.skillLevels[skillId] = 1;
    
    // 被动技能自动激活
    if (skill.type === SKILL_TYPES.PASSIVE) {
        applyPassiveSkill(skillId);
    }
    
    game.showMessage('学会技能: ' + skill.name, '#00ff00');
    return true;
}

// 检查技能是否可以升级
function canUpgradeSkill(skillId) {
    const skill = getSkillDefinitions().find(s => s.id === skillId);
    if (!skill) return false;
    
    // 已学习
    if (!playerSkills.learned.includes(skillId)) return false;
    
    const currentLevel = playerSkills.skillLevels[skillId] || 1;
    if (currentLevel >= skill.maxLevel) return false;
    
    // 资源足够
    const upgradeExp = skill.upgradeCost.exp * currentLevel;
    const upgradeGold = skill.upgradeCost.gold * currentLevel;
    
    if (player.exp < upgradeExp || game.gold < upgradeGold) return false;
    
    return true;
}

// 升级技能
function upgradeSkill(skillId) {
    const skill = getSkillDefinitions().find(s => s.id === skillId);
    if (!skill) return false;
    
    if (!canUpgradeSkill(skillId)) return false;
    
    const currentLevel = playerSkills.skillLevels[skillId] || 1;
    const upgradeExp = skill.upgradeCost.exp * currentLevel;
    const upgradeGold = skill.upgradeCost.gold * currentLevel;
    
    // 消耗资源
    player.exp -= upgradeExp;
    game.gold -= upgradeGold;
    
    // 升级
    playerSkills.skillLevels[skillId] = currentLevel + 1;
    
    // 重新应用被动技能效果
    if (skill.type === SKILL_TYPES.PASSIVE) {
        applyPassiveSkill(skillId);
    }
    
    game.showMessage('技能升级: ' + skill.name + ' Lv.' + (currentLevel + 1), '#ffd700');
    return true;
}

// 激活/关闭主动技能
function toggleActiveSkill(skillId) {
    const skill = getSkillDefinitions().find(s => s.id === skillId);
    if (!skill || skill.type !== SKILL_TYPES.ACTIVE) return false;
    
    if (!playerSkills.learned.includes(skillId)) return false;
    
    if (playerSkills.activeSkills[skillId]) {
        delete playerSkills.activeSkills[skillId];
        game.showMessage('技能已收起: ' + skill.name, '#aaa');
    } else {
        playerSkills.activeSkills[skillId] = true;
        game.showMessage('技能已装备: ' + skill.name, '#00ff00');
    }
    return true;
}

// 使用主动技能
function useActiveSkill(skillId) {
    const skill = getSkillDefinitions().find(s => s.id === skillId);
    if (!skill || skill.type !== SKILL_TYPES.ACTIVE) return false;
    
    // 检查是否已学习
    if (!playerSkills.learned.includes(skillId)) return false;
    
    // 检查是否激活
    if (!playerSkills.activeSkills[skillId]) {
        game.showMessage('请先装备该技能', '#ffaa00');
        return false;
    }
    
    // 检查冷却
    if (playerSkills.cooldowns[skillId] > 0) {
        game.showMessage('技能冷却中: ' + playerSkills.cooldowns[skillId].toFixed(1) + '秒', '#ff6666');
        return false;
    }
    
    // 获取技能等级
    const level = playerSkills.skillLevels[skillId] || 1;
    
    // 应用技能效果
    if (skill.effect.duration === 0) {
        // 瞬发技能 - 立即造成伤害
        const extraAtk = skill.effect.atkBonus + level * 5;
        player.attack += extraAtk;
        game.showMessage(skill.name + '! 伤害+' + extraAtk, '#ff6666');
        
        // 立即恢复攻击力的瞬时加成（下一击有效）
        setTimeout(() => {
            player.attack -= extraAtk;
        }, 100);
    } else {
        // 持续效果技能
        const effect = {
            skillId: skillId,
            endTime: game.gameTime + skill.effect.duration + level * 0.5,
            effect: { ...skill.effect },
            level: level
        };
        effect.effect.atkBonus = (skill.effect.atkBonus || 0) + level * 5;
        effect.effect.defBonus = (skill.effect.defBonus || 0) + level * 10;
        effect.effect.speedBonus = (skill.effect.speedBonus || 0) + level * 20;
        
        skillEffects.activeEffects.push(effect);
        
        let effectMsg = skill.name + '! ';
        if (effect.effect.atkBonus) effectMsg += '攻击+' + effect.effect.atkBonus + ' ';
        if (effect.effect.defBonus) effectMsg += '防御+' + effect.effect.defBonus + ' ';
        if (effect.effect.speedBonus) effectMsg += '速度+' + effect.effect.speedBonus + ' ';
        game.showMessage(effectMsg, '#00ffff');
    }
    
    // 开始冷却
    playerSkills.cooldowns[skillId] = skill.cooldown;
    
    return true;
}

// 应用被动技能效果
function applyPassiveSkill(skillId) {
    const skill = getSkillDefinitions().find(s => s.id === skillId);
    if (!skill || skill.type !== SKILL_TYPES.PASSIVE) return false;
    
    const level = playerSkills.skillLevels[skillId] || 1;
    
    // 应用效果
    if (skill.effect.critRateBonus) {
        player.critRate += skill.effect.critRateBonus * level;
    }
    if (skill.effect.maxHpBonus) {
        const hpBonus = skill.effect.maxHpBonus * level;
        player.maxHp += hpBonus;
        player.hp += hpBonus;
    }
    if (skill.effect.expBonus) {
        game.expBonus += skill.effect.expBonus * level;
    }
    
    return true;
}

// 重新计算所有被动技能效果
function recalculatePassiveSkills() {
    // 重置被动技能效果
    player.critRate = 0.05;  // 基础暴击率
    player.maxHp = 100 + (player.level - 1) * 10;  // 基础最大HP
    if (player.hp > player.maxHp) player.hp = player.maxHp;
    game.expBonus = 0;
    
    // 重新应用所有被动技能
    playerSkills.learned.forEach(skillId => {
        const skill = getSkillDefinitions().find(s => s.id === skillId);
        if (skill && skill.type === SKILL_TYPES.PASSIVE) {
            applyPassiveSkill(skillId);
        }
    });
}

// 更新技能系统(dt: 秒)
function updateSkills(dt) {
    // 更新冷却
    Object.keys(playerSkills.cooldowns).forEach(skillId => {
        if (playerSkills.cooldowns[skillId] > 0) {
            playerSkills.cooldowns[skillId] -= dt;
            if (playerSkills.cooldowns[skillId] < 0) {
                playerSkills.cooldowns[skillId] = 0;
            }
        }
    });
    
    // 更新持续效果
    skillEffects.activeEffects = skillEffects.activeEffects.filter(effect => {
        if (game.gameTime >= effect.endTime) {
            // 效果结束
            if (effect.effect.defBonus) {
                player.def = (player.def || 0) - effect.effect.defBonus;
            }
            if (effect.effect.speedBonus) {
                player.speed -= effect.effect.speedBonus;
            }
            return false;
        }
        
        // 持续应用效果
        if (effect.effect.defBonus) {
            player.def = effect.effect.defBonus;
        }
        if (effect.effect.speedBonus) {
            player.speed = 80 + effect.effect.speedBonus;
        }
        
        return true;
    });
}

// 获取可解锁的技能列表
function getUnlockableSkills() {
    return getSkillDefinitions().filter(skill => {
        return !playerSkills.learned.includes(skill.id) && player.level >= skill.unlockLevel;
    });
}

// 获取已学习的技能列表
function getLearnedSkills() {
    return getSkillDefinitions().filter(skill => {
        return playerSkills.learned.includes(skill.id);
    });
}

// 获取技能显示状态
function getSkillsDisplayState() {
    return {
        learned: playerSkills.learned,
        skillLevels: playerSkills.skillLevels,
        activeSkills: playerSkills.activeSkills,
        cooldowns: playerSkills.cooldowns,
        activeEffects: skillEffects.activeEffects
    };
}
