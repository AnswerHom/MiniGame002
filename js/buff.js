// ===== v1.3.5 BUFF 系统 =====

// BUFF 类型配置
const BUFF_TYPES = {
    // 增益 BUFF
    attackUp: { name: '攻击提升', type: 'buff', duration: 30000, effect: { attack: 1.5 } },
    defenseUp: { name: '防御提升', type: 'buff', duration: 30000, effect: { defense: 1.5 } },
    speedUp: { name: '速度提升', type: 'buff', duration: 20000, effect: { speed: 1.3 } },
    invincible: { name: '无敌', type: 'buff', duration: 5000, effect: { immune: true } },
    
    // 减益 BUFF
    poison: { name: '中毒', type: 'debuff', duration: 10000, effect: { dot: 5 }, interval: 1000 },
    slow: { name: '减速', type: 'debuff', duration: 15000, effect: { speed: 0.5 } },
    weak: { name: '虚弱', type: 'debuff', duration: 20000, effect: { attack: 0.5 } },
};

// BUFF 类
class Buff {
    constructor(type, target) {
        const config = BUFF_TYPES[type];
        if (!config) {
            console.error('未知的 BUFF 类型:', type);
            return;
        }
        
        this.type = type;
        this.name = config.name;
        this.buffType = config.type;  // 'buff' 或 'debuff'
        this.duration = config.duration;
        this.effect = config.effect;
        this.interval = config.interval || null;  // 持续伤害间隔
        
        this.target = target;
        this.remainingTime = this.duration;
        this.lastTickTime = 0;
        this.stackCount = 1;
        this.maxStack = 3;  // 最大叠加层数
        this.active = true;
        
        // 应用初始效果
        this.applyEffect();
    }
    
    // 应用 BUFF 效果
    applyEffect() {
        if (!this.target) return;
        
        const effect = this.effect;
        
        if (effect.attack) {
            this.target.attack = Math.floor(this.target.attack * effect.attack);
        }
        if (effect.defense) {
            this.target.defense = this.target.defense || 0;
            this.target.defense = Math.floor(this.target.defense * effect.defense);
        }
        if (effect.speed) {
            this.target.speed = Math.floor(this.target.speed * effect.speed);
        }
    }
    
    // 移除 BUFF 效果
    removeEffect() {
        if (!this.target) return;
        
        const effect = this.effect;
        
        // 攻击/速度加成需要还原（简化处理，实际应记录原始值）
        // 这里只做标记，实际移除由 update 处理
        this.target.removeBuff(this);
    }
    
    // 更新 BUFF 状态
    update(dt) {
        if (!this.active) return false;
        
        this.remainingTime -= dt * 1000;
        
        // 处理持续伤害/治疗
        if (this.interval) {
            const now = Date.now();
            if (now - this.lastTickTime >= this.interval) {
                this.onTick();
                this.lastTickTime = now;
            }
        }
        
        // BUFF 结束
        if (this.remainingTime <= 0) {
            this.active = false;
            return false;
        }
        
        return true;
    }
    
    // 每次触发效果（持续伤害等）
    onTick() {
        if (!this.target) return;
        
        // 中毒扣血
        if (this.type === 'poison' && this.target.takeDamage) {
            this.target.takeDamage(this.effect.dot);
        }
    }
    
    // 叠加 BUFF
    stack() {
        if (this.stackCount < this.maxStack) {
            this.stackCount++;
            this.remainingTime = this.duration;  // 刷新持续时间
            // 效果叠加可以在这里处理
        }
    }
}

// 目标 BUFF 管理器
const BuffManager = {
    // 为目标添加 BUFF
    addBuff(target, buffType) {
        if (!target.buffs) {
            target.buffs = [];
        }
        
        // 检查是否已有相同类型 BUFF
        const existingBuff = target.buffs.find(b => b.type === buffType && b.active);
        if (existingBuff) {
            existingBuff.stack();
            return existingBuff;
        }
        
        // 创建新 BUFF
        const buff = new Buff(buffType, target);
        target.buffs.push(buff);
        return buff;
    },
    
    // 移除 BUFF
    removeBuff(target, buffType) {
        if (!target.buffs) return;
        
        const index = target.buffs.findIndex(b => b.type === buffType);
        if (index !== -1) {
            target.buffs[index].active = false;
            target.buffs.splice(index, 1);
        }
    },
    
    // 更新所有 BUFF
    update(target, dt) {
        if (!target.buffs) return;
        
        target.buffs = target.buffs.filter(buff => buff.update(dt));
    },
    
    // 清除所有 BUFF
    clear(target) {
        if (!target.buffs) return;
        
        target.buffs.forEach(buff => buff.active = false);
        target.buffs = [];
    },
    
    // 检查是否有某类型 BUFF
    hasBuff(target, buffType) {
        if (!target.buffs) return false;
        return target.buffs.some(b => b.type === buffType && b.active);
    },
};

// 导出（用于 HTML 引用）
if (typeof window !== 'undefined') {
    window.BUFF_TYPES = BUFF_TYPES;
    window.Buff = Buff;
    window.BuffManager = BuffManager;
}
