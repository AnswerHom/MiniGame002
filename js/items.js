// v3.0.0: 物品系统 - 回血道具与BUFF增益道具

// 物品配置
const ITEM_SYSTEM = {
    // 回血道具
    healthPotion: {
        small: { name: '初级血瓶', hp: 20, rarity: 1 },
        medium: { name: '中级血瓶', hp: 50, rarity: 2 },
        large: { name: '高级血瓶', hp: 100, rarity: 3 }
    },
    // BUFF增益道具
    buff: {
        attackBoost: { name: '攻击强化', effect: 'attack', value: 0.5, duration: 30, rarity: 2 },
        defenseBoost: { name: '防御强化', effect: 'defense', value: 0.5, duration: 30, rarity: 2 },
        healthBlessing: { name: '生命祝福', effect: 'maxHp', value: 0.5, duration: 60, rarity: 3 },
        speedBoost: { name: '速度激发', effect: 'speed', value: 0.3, duration: 30, rarity: 2 }
    }
};

// 物品管理器
const ItemManager = {
    // 掉落列表
    drops: [],
    
    // 怪物掉落物品
    dropItem(enemy) {
        // 根据怪物类型决定掉落概率
        const rand = Math.random();
        let dropChance = 0.1;  // 普通怪物10%
        
        if (enemy.isBoss) {
            dropChance = 0.8;  // Boss 80%
        } else if (enemy.isElite) {
            dropChance = 0.4;  // 精英40%
        }
        
        if (rand < dropChance) {
            // 随机选择掉落物品
            const itemTypes = ['healthPotion', 'buff'];
            const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            
            let item, rarity;
            if (type === 'healthPotion') {
                const potions = ['small', 'medium', 'large'];
                const potionType = potions[Math.floor(Math.random() * potions.length)];
                item = { ...ITEM_SYSTEM.healthPotion[potionType], type: 'healthPotion', subType: potionType };
                rarity = item.rarity;
            } else {
                const buffs = Object.keys(ITEM_SYSTEM.buff);
                const buffType = buffs[Math.floor(Math.random() * buffs.length)];
                item = { ...ITEM_SYSTEM.buff[buffType], type: 'buff', subType: buffType };
                rarity = item.rarity;
            }
            
            item.x = enemy.x;
            item.y = enemy.y - 20;
            this.drops.push(item);
            
            // 显示掉落提示
            if (game.showMessage) {
                game.showMessage('+' + item.name, '#4CAF50');
            }
        }
    },
    
    // 更新物品（漂浮效果）
    update(dt) {
        this.drops = this.drops.filter(drop => {
            drop.y += 20 * dt;
            drop.floatOffset = Math.sin(Date.now() / 200) * 3;
            return drop.y < CONFIG.height;
        });
    },
    
    // 绘制掉落物品
    draw() {
        this.drops.forEach(drop => {
            const screenX = drop.x - CONFIG.cameraOffset;
            const screenY = drop.y + (drop.floatOffset || 0);
            
            // 物品图标
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            if (drop.type === 'healthPotion') {
                ctx.fillText('🧪', screenX, screenY);
            } else {
                ctx.fillText('✨', screenX, screenY);
            }
            ctx.textAlign = 'left';
        });
    },
    
    // 玩家捡起物品
    pickup(drop) {
        if (drop.type === 'healthPotion') {
            // 使用回血道具
            const healAmount = drop.hp;
            player.hp = Math.min(player.hp + healAmount, player.maxHp);
            if (game.showMessage) {
                game.showMessage('+' + healAmount + 'HP', '#44ff44');
            }
        } else if (drop.type === 'buff') {
            // 使用BUFF增益道具
            this.applyBuff(drop);
        }
        
        // 从掉落列表移除
        const index = this.drops.indexOf(drop);
        if (index > -1) {
            this.drops.splice(index, 1);
        }
    },
    
    // 应用BUFF
    applyBuff(item) {
        const effect = item.effect;
        const value = item.value;
        const duration = item.duration;
        
        switch(effect) {
            case 'attack':
                player.attack = Math.floor(player.attack * (1 + value));
                setTimeout(() => {
                    player.attack = Math.floor(player.attack / (1 + value));
                }, duration * 1000);
                break;
            case 'defense':
                player.defense = Math.floor(player.defense * (1 + value));
                setTimeout(() => {
                    player.defense = Math.floor(player.defense / (1 + value));
                }, duration * 1000);
                break;
            case 'maxHp':
                const oldMaxHp = player.maxHp;
                player.maxHp = Math.floor(player.maxHp * (1 + value));
                player.hp = Math.min(player.hp + player.maxHp - oldMaxHp, player.maxHp);
                setTimeout(() => {
                    player.maxHp = oldMaxHp;
                    player.hp = Math.min(player.hp, player.maxHp);
                }, duration * 1000);
                break;
            case 'speed':
                player.speed = Math.floor(player.speed * (1 + value));
                setTimeout(() => {
                    player.speed = Math.floor(player.speed / (1 + value));
                }, duration * 1000);
                break;
        }
        
        if (game.showMessage) {
            game.showMessage(item.name + '!', '#ffd700');
        }
    },
    
    // 检查玩家是否捡起物品
    checkPickup() {
        this.drops.forEach(drop => {
            const dist = Math.abs(player.x - drop.x);
            if (dist < 30) {
                this.pickup(drop);
            }
        });
    }
};

// 导出
if (typeof window !== 'undefined') {
    window.ITEM_SYSTEM = ITEM_SYSTEM;
    window.ItemManager = ItemManager;
}
