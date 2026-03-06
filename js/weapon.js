// v2.5.0: 武器系统扩展 - 三种武器类型与特殊效果

// 武器配置

// 武器特效管理器
const WeaponEffectManager = {
    // 剑：连击效果
    combo: {
        count: 0,
        maxCombo: 5,
        comboDamageBonus: 0.05,  // 每层连击+5%伤害
        timeout: 3000,  // 3秒未攻击连击清零
        
        // 计算连击伤害加成
        getDamageBonus() {
            return 1 + this.count * this.comboDamageBonus;
        },
        
        // 攻击命中时调用
        onHit() {
            this.count = Math.min(this.count + 1, this.maxCombo);
        },
        
        // 更新（检查超时）
        update(dt) {
            // 超时逻辑在 player.update 中处理
        },
        
        // 重置
        reset() {
            this.count = 0;
        }
    },
    
    // 刀：吸血效果
    lifesteal: {
        rate: 0.1,        // 10%吸血
        eliteRate: 0.15,  // 精英/首领15%
        
        // 造成伤害时调用
        onDamage(damage, enemy) {
            const isElite = enemy.type && enemy.isBoss;
            const healRate = isElite ? this.eliteRate : this.rate;
            const heal = Math.floor(damage * healRate);
            if (heal > 0 && player.hp < player.maxHp) {
                player.hp = Math.min(player.hp + heal, player.maxHp);
                // 显示治疗效果
                if (game.showMessage) {
                    game.showMessage('+' + heal, '#44ff44');
                }
            }
        }
    },
    
    // 枪：穿透效果
    pierce: {
        maxPierce: 3,         // 最多穿透3个敌人
        damageFalloff: 0.8,   // 后续敌人伤害衰减80%
        
        // 获取穿透伤害
        getPierceDamage(baseDamage, pierceIndex) {
            if (pierceIndex === 0) return baseDamage;
            return Math.floor(baseDamage * Math.pow(this.damageFalloff, pierceIndex));
        }
    }
};

// 武器切换函数
function switchWeapon(type) {
    if (WEAPON_SYSTEM[type]) {
        player.weaponType = type;
        player.attack = WEAPON_SYSTEM[type].baseAttack;
        player.weapon = { name: WEAPON_SYSTEM[type].name, attackBonus: 0 };
        // 重置连击
        WeaponEffectManager.combo.reset();
    }
}

// 武器攻击效果处理
function handleWeaponEffect(effect, damage, enemy, enemies) {
    switch(effect) {
        case 'combo':
            WeaponEffectManager.combo.onHit();
            return WeaponEffectManager.combo.getDamageBonus();
            
        case 'lifesteal':
            WeaponEffectManager.lifesteal.onDamage(damage, enemy);
            return 1;
            
        case 'pierce':
            // 穿透逻辑在敌人遍历中处理
            return 1;
            
        default:
            return 1;
    }
}

// 武器特殊效果更新（每帧调用）
function updateWeaponEffects(dt) {
    // 检查连击超时
    // 在 player.update 中处理
}

// 获取当前武器特效描述
function getWeaponEffectDescription() {
    const weapon = WEAPON_SYSTEM[player.weaponType];
    return weapon ? weapon.description : '';
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.WEAPON_SYSTEM = WEAPON_SYSTEM;
    window.WeaponEffectManager = WeaponEffectManager;
    window.switchWeapon = switchWeapon;
    window.handleWeaponEffect = handleWeaponEffect;
    window.getWeaponEffectDescription = getWeaponEffectDescription;
}
