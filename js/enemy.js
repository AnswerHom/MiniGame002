// ===== v1.4.3 怪物模块 =====
// v1.3.2: 修复怪物AI逻辑 - attackDistance >= stopDistance

// v1.4.3: 怪物属性配置 - 包含成长系数
// 公式：怪物属性 = 基础值 × (1 + 成长系数 × 进度)
// 进度 = 已移动距离 ÷ 1000（每移动1000像素为1级）
const ENEMY_TYPES = {
    // 阴魂：白色半透明鬼火，淡淡光晕，圆形
    // 初始HP：15, HP成长：0.05, 初始攻击：5, 攻击成长：0.03
    阴魂: { hp: 10, hpGrowth: 0.05, attack: 3, attackGrowth: 0.03, exp: 10, speed: 20, attackDistance: 60, stopDistance: 60, color: '#e2e8f0', size: 25, realmColor: '#718096' },
    // 妖狼：灰色毛皮，四足奔跑形态
    // 初始HP：25, HP成长：0.06, 初始攻击：8, 攻击成长：0.04
    妖狼: { hp: 25, hpGrowth: 0.06, attack: 8, attackGrowth: 0.04, exp: 15, speed: 50, attackDistance: 70, stopDistance: 70, color: '#718096', size: 35, realmColor: '#718096' },
    // 毒蛛：黑色背甲，红色斑点，8条腿
    // 初始HP：20, HP成长：0.05, 初始攻击：10, 攻击成长：0.03
    毒蛛: { hp: 20, hpGrowth: 0.05, attack: 10, attackGrowth: 0.03, exp: 12, speed: 25, attackDistance: 55, stopDistance: 55, color: '#1a202c', size: 30, realmColor: '#1a202c' },
    // 僵尸：灰绿色皮肤，双臂平伸
    // 初始HP：35, HP成长：0.07, 初始攻击：12, 攻击成长：0.04
    僵尸: { hp: 35, hpGrowth: 0.07, attack: 12, attackGrowth: 0.04, exp: 20, speed: 20, attackDistance: 65, stopDistance: 65, color: '#68d391', size: 40, realmColor: '#68d391' },
    // v1.2.9: 新增怪物
    // 蝴蝶精：彩色翅膀，速度快，血量低
    // 初始HP：12, HP成长：0.04, 初始攻击：4, 攻击成长：0.02
    蝴蝶精: { hp: 8, hpGrowth: 0.04, attack: 2, attackGrowth: 0.02, exp: 8, speed: 60, attackDistance: 50, stopDistance: 50, color: '#f9a8d4', size: 20, realmColor: '#f9a8d4' },
    // 毒蛇：绿色身体，三角形头部
    // 初始HP：20, HP成长：0.05, 初始攻击：12, 攻击成长：0.04
    毒蛇: { hp: 20, hpGrowth: 0.05, attack: 12, attackGrowth: 0.04, exp: 15, speed: 35, attackDistance: 45, stopDistance: 45, color: '#22c55e', size: 35, realmColor: '#22c55e' },
    // 骷髅兵：白色骨架
    // 初始HP：40, HP成长：0.08, 初始攻击：14, 攻击成长：0.05
    骷髅: { hp: 40, hpGrowth: 0.08, attack: 14, attackGrowth: 0.05, exp: 22, speed: 25, attackDistance: 60, stopDistance: 60, color: '#f5f5f4', size: 38, realmColor: '#f5f5f4' },
    // 蝙蝠：黑色翅膀倒挂
    // 初始HP：15, HP成长：0.04, 初始攻击：6, 攻击成长：0.03
    蝙蝠: { hp: 10, hpGrowth: 0.04, attack: 4, attackGrowth: 0.03, exp: 10, speed: 40, attackDistance: 55, stopDistance: 55, color: '#1a1a1a', size: 28, realmColor: '#1a1a1a' },
    // 魔藤：紫色藤蔓，地面生长
    // 初始HP：30, HP成长：0.06, 初始攻击：15, 攻击成长：0.05
    魔藤: { hp: 30, hpGrowth: 0.06, attack: 15, attackGrowth: 0.05, exp: 18, speed: 15, attackDistance: 40, stopDistance: 40, color: '#805ad5', size: 32, realmColor: '#805ad5' },
    // 冰魔：蓝白色寒冰形态
    // 初始HP：45, HP成长：0.09, 初始攻击：10, 攻击成长：0.04
    冰魔: { hp: 45, hpGrowth: 0.09, attack: 10, attackGrowth: 0.04, exp: 25, speed: 18, attackDistance: 75, stopDistance: 75, color: '#63b3ed', size: 42, realmColor: '#63b3ed' },
    
    // v1.4.4: Boss怪物 - 每10波出现一次
    // 远古巨魔：大体型，高血量，高攻击
    远古巨魔: { hp: 200, hpGrowth: 0.15, attack: 30, attackGrowth: 0.08, exp: 100, speed: 15, attackDistance: 80, stopDistance: 80, color: '#8b0000', size: 80, realmColor: '#ff0000', isBoss: true },
    
    // v1.5.3: 新增怪物类型
    // 野猪精：练气期，皮厚移动慢，褐色身体，獠牙
    野猪精: { hp: 80, hpGrowth: 0.06, attack: 15, attackGrowth: 0.04, exp: 30, speed: 25, attackDistance: 65, stopDistance: 65, color: '#8B4513', size: 40, realmColor: '#8B4513', tusks: true },
    // 灰狼：练气期，速度快，灰色毛皮
    灰狼: { hp: 60, hpGrowth: 0.05, attack: 20, attackGrowth: 0.04, exp: 35, speed: 55, attackDistance: 70, stopDistance: 70, color: '#808080', size: 38, realmColor: '#808080', ears: true },
    // 蛇妖：筑基期，有毒性攻击，绿色身体
    蛇妖: { hp: 120, hpGrowth: 0.08, attack: 25, attackGrowth: 0.05, exp: 60, speed: 30, attackDistance: 50, stopDistance: 50, color: '#228B22', size: 45, realmColor: '#228B22', tongue: true, poisonous: true },
    // 僵尸：筑基期，高血量，灰绿色皮肤（旧版僵尸保留但修改属性）
    僵尸: { hp: 150, hpGrowth: 0.09, attack: 30, attackGrowth: 0.06, exp: 80, speed: 18, attackDistance: 65, stopDistance: 65, color: '#9CA3AF', size: 42, realmColor: '#9CA3AF' },
    // 山贼：筑基期，攻击高，土匪造型
    山贼: { hp: 100, hpGrowth: 0.07, attack: 35, attackGrowth: 0.05, exp: 70, speed: 35, attackDistance: 75, stopDistance: 75, color: '#92400E', size: 40, realmColor: '#92400E', weapon: true }
};

// v1.4.3: 境界难度系数
const REALM_MULTIPLIERS = {
    '练气': { hp: 1.0, attack: 1.0 },
    '筑基': { hp: 1.3, attack: 1.2 },
    '金丹': { hp: 1.6, attack: 1.4 }
};

// v1.5.7: 怪物视野和追击距离配置（10像素=1米）
// 怪物视野：200px = 20米（发现主角的距离）
// 追击距离：250px = 25米（开始追击的距离）
const MONSTER_VIEW_DISTANCE = 200;   // 20米 - 怪物视野
const MONSTER_CHASE_DISTANCE = 250;  // 25米 - 追击距离

// v1.2.4: 境界颜色区分 - 练气：灰色 | 筑基：绿色 | 金丹：蓝色
const ENEMY_REALM_COLORS = {
    '练气': '#888888',
    '筑基': '#4ade80',
    '金丹': '#3b82f6'
};

// v1.0.2: 境界颜色区分

class Enemy {
    constructor(x, type, realm = '练气') {
        const config = ENEMY_TYPES[type] || ENEMY_TYPES['阴魂'];
        this.x = x;
        this.y = CONFIG.groundY;
        this.width = config.size;
        this.height = config.size;
        this.type = type;
        this.realm = realm;
        
        // v1.4.3: 计算怪物属性成长
        // 进度 = 已移动距离 ÷ 1000（每移动1000像素为1级）
        const progress = player.x / 1000;
        
        // 基础属性应用成长公式
        const baseHp = config.hp * (1 + config.hpGrowth * progress);
        const baseAttack = config.attack * (1 + config.attackGrowth * progress);
        
        // 应用境界系数
        const realmMult = REALM_MULTIPLIERS[realm] || REALM_MULTIPLIERS['练气'];
        
        this.hp = Math.floor(baseHp * realmMult.hp);
        this.maxHp = this.hp;
        this.attack = Math.floor(baseAttack * realmMult.attack);
        
        this.exp = config.exp;
        this.speed = config.speed;
        this.attackDistance = config.attackDistance;  // v1.2.3: 怪物攻击距离
        this.stopDistance = config.stopDistance || config.attackDistance + 20;  // v1.2.9: 安全距离（停止距离）
        this.baseColor = config.color;
        this.size = config.size;
        this.alive = true;
        this.attackCooldown = 0;
        this.hitFlash = 0;  // v1.0.2: 受击闪烁
        
        // v1.2.4: 动画相关
        this.animTime = Math.random() * Math.PI * 2;  // 随机初始相位
        this.isAttacking = false;
        this.attackAnimTime = 0;
        
        // v1.2.6: 方向属性初始化，防止draw()在update()之前调用时direction为undefined
        this.direction = 1;
        
        // v1.2.4: 境界颜色 - 练气灰色 | 筑基绿色 | 金丹蓝色
        this.realmColor = ENEMY_REALM_COLORS[realm] || ENEMY_REALM_COLORS['练气'];
    }

    update(dt) {
        if (!this.alive) return;
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.hitFlash > 0) this.hitFlash -= dt;
        
        // v1.2.4: 更新动画时间
        this.animTime += dt * 3;
        if (this.attackAnimTime > 0) this.attackAnimTime -= dt;
        
        const dist = player.x - this.x;
        
        // 怪物朝向玩家（玩家在右边朝右，玩家在左边朝左）
        this.direction = dist > 0 ? 1 : -1;
        
        // 怪物进入自己的攻击距离后停止并攻击玩家
        // v1.2.9: 优先检查安全距离，在安全距离外停止移动，只有进入攻击距离才攻击
        const absDist = Math.abs(dist);
        
        // 如果在攻击距离内，攻击玩家
        if (absDist < this.attackDistance && this.attackCooldown <= 0) {
            this.attackPlayer();
            return;
        }
        
        // v1.2.9: 如果在安全距离和攻击距离之间（不在攻击范围内），停止移动等待
        if (absDist >= this.attackDistance && absDist < this.stopDistance) {
            return;  // 在安全距离和攻击距离之间时，保持距离等待
        }
        
        // v1.3.1: 如果已在攻击距离内但冷却时间未到，继续等待攻击（不移动）
        if (absDist < this.attackDistance && this.attackCooldown > 0) {
            return;  // 在攻击距离内但冷却未好，保持位置等待
        }
        
        // 怪物向玩家移动（玩家在右边则向右，在左边则向左）
        // v1.2.9: 只有在安全距离之外才移动
        if (absDist >= this.stopDistance) {
            if (dist > 0) {
                this.x += this.speed * dt;
            } else if (dist < 0) {
                this.x -= this.speed * dt;
            }
        }
    }

    attackPlayer() {
        // v1.3.6: 无敌模式
        if (game.activePowerups.invincible) {
            return;
        }
        this.attackCooldown = 1;
        this.isAttacking = true;
        // v1.5.8: 攻击动画持续0.45秒（前摇0.15s + 挥动0.2s + 收招0.1s）
        this.attackAnimTime = 0.45;
        const died = player.takeDamage(this.attack);
        if (died) {
            game.gameOver = true;
        } else {
            // v1.5.8: 攻击命中时屏幕轻微震动（振幅3px，持续0.1秒）
            game.triggerScreenShake(3, 0.1);
        }
    }

    takeDamage(damage) {
        this.hp -= damage;
        this.hitFlash = 0.1;
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
            player.exp += this.exp;
            game.killCount++;
            
            // v3.0.0: 物品掉落
            if (typeof ItemManager !== 'undefined') {
                ItemManager.dropItem(this);
            }
            
            // v1.4.3: 记录连杀
            game.recordKill();
            
            // v1.4.3: 击杀反馈增强 - 屏幕震动（振幅5px，持续0.1秒）
            // v1.4.6: BOSS战斗时减少震动幅度（更平缓）
            const shakeIntensity = this.isBoss ? 2 : 5;
            game.triggerScreenShake(shakeIntensity, 0.1);
            
            // v1.4.0: 金币掉落平衡调整 - 根据怪物境界和等级调整
            // 练气: 1-4金币, 筑基: 2-6金币, 金丹: 3-8金币
            let baseGold = 1;
            let maxGold = 4;
            if (this.realm === '筑基') {
                baseGold = 2;
                maxGold = 6;
            } else if (this.realm === '金丹') {
                baseGold = 3;
                maxGold = 8;
            }
            let goldDrop = Math.floor(baseGold + Math.random() * (maxGold - baseGold + 1));
            // v1.3.6: 金币加成支持
            if (game.activePowerups.quickGold) {
                goldDrop *= 2;
            }
            // v1.4.3: 使用recordGold记录金币获取统计
            game.recordGold(goldDrop);
            // v1.4.6: 金币获取视觉反馈 - 飘字效果
            game.addDamageNumber(this.x + this.width / 2, this.y - this.height, '+' + goldDrop + '💰', false, true);
            
            // v1.7.0: 装备掉落
            const equipDrop = generateEquipmentDrop(this.type, this.level || 1);
            if (equipDrop) {
                if (addItemToBackpack(equipDrop)) {
                    // 显示装备掉落提示
                    const rarityColor = RARITY_COLORS[equipDrop.rarity] || '#ffffff';
                    game.addDamageNumber(this.x + this.width / 2, this.y - this.height - 20, equipDrop.icon + ' ' + equipDrop.name, false, false, rarityColor);
                    game.showMessage('获得装备: ' + equipDrop.name, rarityColor);
                }
            }
            
            // v2.1.0: 灵气掉落
            const spiritConfig = this.isBoss ? SPIRIT_SYSTEM.spiritDrop.boss : 
                               (this.isElite ? SPIRIT_SYSTEM.spiritDrop.elite : SPIRIT_SYSTEM.spiritDrop.normal);
            const spiritDrop = Math.floor(spiritConfig.min + Math.random() * (spiritConfig.max - spiritConfig.min + 1));
            const actualSpirit = player.addSpirit(spiritDrop);
            
            // 灵气获取视觉反馈 - 飘字效果
            const realmName = player.getRealmName();
            const multiplier = SPIRIT_SYSTEM.realmSpiritMultiplier[realmName] || 1.0;
            if (multiplier > 1) {
                game.addDamageNumber(this.x + this.width / 2, this.y - this.height - 40, '+' + actualSpirit + '灵气', false, false, '#00ffff', true);
            } else {
                game.addDamageNumber(this.x + this.width / 2, this.y - this.height - 40, '+' + actualSpirit + '灵气', false, false, '#00ffff', true);
            }
            
            // v2.3.0: 灵兽蛋掉落
            const eggDrop = beastSystem.dropEgg(this.realm);
            if (eggDrop) {
                game.addDamageNumber(this.x + this.width / 2, this.y - this.height - 60, '🥚 灵兽蛋', false, false, eggDrop.color);
            }
            
            // v1.2.7: 怪物死亡音效
            game.playSound('hit');
            // v1.4.0: 添加死亡动画
            game.addDeathEffect(this);
            return true;
        }
        // v1.2.7: 受击音效
        game.playSound('hit');
        return false;
    }

    // v1.0.2: 小怪形象落地
    draw() {
        if (!this.alive) return;
        const screenX = this.x - CONFIG.cameraOffset;
        const screenY = this.y;
        
        // v1.2.4: 计算浮动偏移（移动时上下浮动）
        const floatOffset = Math.sin(this.animTime) * 3;
        
        // v1.2.4: 受击闪烁
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // v1.2.4: 境界光晕
        ctx.fillStyle = this.realmColor + '40';  // 半透明光晕
        ctx.beginPath();
        ctx.arc(screenX + this.size/2, screenY - this.size/2 + floatOffset, this.size * 0.9, 0, Math.PI * 2);
        ctx.fill();
        
        // v1.2.5: 根据朝向翻转绘制
        ctx.save();
        if (this.direction === -1) {
            ctx.translate(screenX + this.size/2, screenY - this.size/2);
            ctx.scale(-1, 1);
            ctx.translate(-(screenX + this.size/2), -(screenY - this.size/2));
        }
        
        switch(this.type) {
            case '阴魂':
                this.drawGhost(screenX, screenY, floatOffset);
                break;
            case '妖狼':
                this.drawWolf(screenX, screenY, floatOffset);
                break;
            case '毒蛛':
                this.drawSpider(screenX, screenY, floatOffset);
                break;
            case '僵尸':
                this.drawZombie(screenX, screenY, floatOffset);
                break;
            case '蝴蝶精':  // v1.2.9: 新增
                this.drawButterfly(screenX, screenY, floatOffset);
                break;
            case '毒蛇':  // v1.2.9: 新增
                this.drawSnake(screenX, screenY, floatOffset);
                break;
            case '骷髅':  // v1.2.9: 新增
                this.drawSkeleton(screenX, screenY, floatOffset);
                break;
            case '蝙蝠':  // v1.2.9: 新增
                this.drawBat(screenX, screenY, floatOffset);
                break;
            case '魔藤':  // v1.2.9: 新增
                this.drawVine(screenX, screenY, floatOffset);
                break;
            case '冰魔':  // v1.2.9: 新增
                this.drawIceDevil(screenX, screenY, floatOffset);
                break;
            case '远古巨魔':  // v1.4.4: Boss
                this.drawBoss(screenX, screenY, floatOffset);
                break;
            // v1.5.3: 新增怪物类型
            case '野猪精':
                this.drawBoar(screenX, screenY, floatOffset);
                break;
            case '灰狼':
                this.drawGreyWolf(screenX, screenY, floatOffset);
                break;
            case '蛇妖':
                this.drawSnakeDemon(screenX, screenY, floatOffset);
                break;
            case '僵尸':
                this.drawZombieV2(screenX, screenY, floatOffset);
                break;
            case '山贼':
                this.drawBandit(screenX, screenY, floatOffset);
                break;
        }
        
        ctx.restore();
        
        // 血条
        ctx.fillStyle = '#333';
        ctx.fillRect(screenX, screenY - this.height - 10, this.width, 4);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(screenX, screenY - this.height - 10, this.width * (this.hp / this.maxHp), 4);
        
        ctx.globalAlpha = 1.0;
    }
    
    // v1.0.2: 阴魂 - 白色半透明鬼火，淡淡光晕，圆形
    // v1.2.4: 添加浮动动画和攻击动画
    drawGhost(screenX, screenY, floatOffset) {
        // v1.2.4: 淡淡蓝光特效
        ctx.fillStyle = 'rgba(147, 197, 253, 0.4)';
        ctx.beginPath();
        ctx.arc(screenX + this.size/2, screenY - this.size/2 + floatOffset, this.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // 主体
        ctx.fillStyle = this.baseColor;
        ctx.beginPath();
        ctx.arc(screenX + this.size/2, screenY - this.size/2 + floatOffset, this.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // v1.2.4: 攻击动画 - 变大
        const attackScale = this.attackAnimTime > 0 ? 1.2 : 1;
        ctx.beginPath();
        ctx.arc(screenX + this.size/2, screenY - this.size/2 + floatOffset, (this.size/2) * attackScale, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#000';
        ctx.fillRect(screenX + 8, screenY - 15 + floatOffset, 3, 3);
        ctx.fillRect(screenX + 14, screenY - 15 + floatOffset, 3, 3);
    }
    
    // v1.0.2: 妖狼 - 灰色毛皮，四足奔跑形态
    // v1.2.4: 添加浮动动画和攻击动画
    drawWolf(screenX, screenY, floatOffset) {
        // v1.2.4: 攻击动画 - 身体前倾
        const attackLean = this.attackAnimTime > 0 ? 5 : 0;
        
        // 身体
        ctx.fillStyle = this.baseColor;
        ctx.fillRect(screenX, screenY - 20 + floatOffset, this.size, 20);
        
        // 头部
        ctx.fillRect(screenX + this.size - 10 + attackLean, screenY - 25 + floatOffset, 15, 15);
        
        // 四足 - 奔跑动画
        const legAnim = Math.sin(this.animTime * 2) * 3;
        ctx.fillRect(screenX + 2 + legAnim, screenY - 5 + floatOffset, 6, 8);
        ctx.fillRect(screenX + this.size - 12 - legAnim, screenY - 5 + floatOffset, 6, 8);
        
        // 尾巴
        ctx.fillRect(screenX - 8 - legAnim, screenY - 18 + floatOffset, 10, 4);
        
        // v1.2.4: 绿色眼睛光点
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(screenX + this.size - 5 + attackLean, screenY - 22 + floatOffset, 3, 3);
    }
    
    // v1.0.2: 毒蛛 - 黑色背甲，红色斑点，8条腿
    // v1.2.4: 添加浮动动画和攻击动画
    drawSpider(screenX, screenY, floatOffset) {
        // v1.2.4: 攻击动画 - 身体下压
        const attackSquish = this.attackAnimTime > 0 ? 5 : 0;
        
        // 身体
        ctx.fillStyle = this.baseColor;
        ctx.beginPath();
        ctx.ellipse(screenX + this.size/2, screenY - this.size/2 + floatOffset + attackSquish, this.size/2, (this.size/2.5) - attackSquish * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 红色斑点
        ctx.fillStyle = '#e53e3e';
        ctx.beginPath();
        ctx.arc(screenX + this.size/2, screenY - this.size/2 + floatOffset + attackSquish, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 8条腿 - 摆动动画
        const legSwing = Math.sin(this.animTime * 2) * 4;
        ctx.strokeStyle = this.baseColor;
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            // 左侧腿
            ctx.beginPath();
            ctx.moveTo(screenX + 5, screenY - this.size/2 + floatOffset + attackSquish);
            ctx.lineTo(screenX - 8 - legSwing, screenY - this.size/2 - 8 + i * 6 + floatOffset);
            ctx.stroke();
            // 右侧腿
            ctx.beginPath();
            ctx.moveTo(screenX + this.size - 5, screenY - this.size/2 + floatOffset + attackSquish);
            ctx.lineTo(screenX + this.size + 8 + legSwing, screenY - this.size/2 - 8 + i * 6 + floatOffset);
            ctx.stroke();
        }
        
        // 眼睛
        ctx.fillStyle = '#f00';
        ctx.fillRect(screenX + 8, screenY - this.size - 2 + floatOffset, 3, 3);
        ctx.fillRect(screenX + 14, screenY - this.size - 2 + floatOffset, 3, 3);
    }
    
    // v1.0.2: 僵尸 - 灰绿色皮肤，双臂平伸
    // v1.2.4: 添加浮动动画和攻击动画
    drawZombie(screenX, screenY, floatOffset) {
        // v1.2.4: 攻击动画 - 双臂前伸
        const armExtend = this.attackAnimTime > 0 ? 8 : 0;
        
        // 身体
        ctx.fillStyle = this.baseColor;
        ctx.fillRect(screenX + 5, screenY - 30 + floatOffset, this.size - 10, 30);
        
        // 头部
        ctx.beginPath();
        ctx.arc(screenX + this.size/2, screenY - 35 + floatOffset, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // v1.2.4: 眼眶深黑
        ctx.fillStyle = '#000';
        ctx.fillRect(screenX + 10, screenY - 38 + floatOffset, 4, 4);
        ctx.fillRect(screenX + 18, screenY - 38 + floatOffset, 4, 4);
        
        // 双臂平伸 - 攻击时前伸
        ctx.fillStyle = this.baseColor;
        ctx.fillRect(screenX - 8 - armExtend, screenY - 25 + floatOffset, 15 + armExtend, 6);
        ctx.fillRect(screenX + this.size - 5, screenY - 25 + floatOffset, 15 + armExtend, 6);
    }
    
    // v1.2.9: 蝴蝶精 - 彩色翅膀，速度快
    drawButterfly(screenX, screenY, floatOffset) {
        // 翅膀摆动动画
        const wingFlap = Math.sin(this.animTime * 8) * 0.5;
        
        // 左侧翅膀
        ctx.fillStyle = '#f472b6';  // 粉色
        ctx.beginPath();
        ctx.ellipse(screenX + 5, screenY - 15 + floatOffset, 8 + wingFlap * 3, 6, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fbbf24';  // 黄色
        ctx.beginPath();
        ctx.ellipse(screenX + 3, screenY - 22 + floatOffset, 5, 4, -0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 右侧翅膀
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.ellipse(screenX + 15, screenY - 15 + floatOffset, 8 + wingFlap * 3, 6, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.ellipse(screenX + 17, screenY - 22 + floatOffset, 5, 4, 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 身体
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(screenX + 10, screenY - 15 + floatOffset, 3, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 触角
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX + 8, screenY - 23 + floatOffset);
        ctx.quadraticCurveTo(screenX + 5, screenY - 28 + floatOffset, screenX + 7, screenY - 30 + floatOffset);
        ctx.moveTo(screenX + 12, screenY - 23 + floatOffset);
        ctx.quadraticCurveTo(screenX + 15, screenY - 28 + floatOffset, screenX + 13, screenY - 30 + floatOffset);
        ctx.stroke();
    }
    
    // v1.2.9: 毒蛇 - 绿色身体，三角形头部
    drawSnake(screenX, screenY, floatOffset) {
        // 身体弯曲动画
        const bodyWave = Math.sin(this.animTime * 3) * 3;
        
        // 身体（蛇形）
        ctx.fillStyle = this.baseColor;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - 10 + floatOffset);
        ctx.quadraticCurveTo(screenX + 10, screenY - 15 + floatOffset + bodyWave, screenX + 20, screenY - 10 + floatOffset);
        ctx.quadraticCurveTo(screenX + 30, screenY - 5 + floatOffset - bodyWave, screenX + 35, screenY - 10 + floatOffset);
        ctx.lineWidth = 6;
        ctx.strokeStyle = this.baseColor;
        ctx.stroke();
        
        // 头部（三角形）
        ctx.fillStyle = '#15803d';  // 深绿色头部
        ctx.beginPath();
        ctx.moveTo(screenX + 35, screenY - 10 + floatOffset);
        ctx.lineTo(screenX + 42, screenY - 15 + floatOffset);
        ctx.lineTo(screenX + 42, screenY - 5 + floatOffset);
        ctx.closePath();
        ctx.fill();
        
        // 眼睛（蛇眼）
        ctx.fillStyle = '#facc15';  // 黄色眼睛
        ctx.beginPath();
        ctx.arc(screenX + 38, screenY - 12 + floatOffset, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 舌头
        ctx.strokeStyle = '#e53e3e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX + 42, screenY - 10 + floatOffset);
        ctx.lineTo(screenX + 48, screenY - 12 + floatOffset);
        ctx.lineTo(screenX + 52, screenY - 8 + floatOffset);
        ctx.stroke();
    }
    
    // v1.2.9: 骷髅兵 - 白色骨架
    // v1.5.8: 添加三段式攻击动画（、前摇0.15s、挥动0.2s、收招0.1s）
    drawSkeleton(screenX, screenY, floatOffset) {
        // 行走摇摆动画
        const bodySway = Math.sin(this.animTime * 2) * 2;
        
        // v1.5.8: 三段式攻击动画
        // 阶段：前摇(0-0.15s) → 挥动(0.15-0.35s) → 收招(0.35-0.45s)
        let attackPhase = 0;
        let armSwing = 0;
        let bodyLean = 0;
        let armRaise = 0;
        
        if (this.attackAnimTime > 0) {
            const totalTime = 0.45; // 总时长0.45秒
            const timeProgress = 1 - (this.attackAnimTime / totalTime);
            
            if (timeProgress < 0.33) {
                // 前摇阶段：双臂抬起，身体后仰15度
                attackPhase = 1;
                armRaise = (timeProgress / 0.33) * 10;
                bodyLean = (timeProgress / 0.33) * 8;
            } else if (timeProgress < 0.78) {
                // 挥动阶段：双臂前伸30度，身体前倾10度
                attackPhase = 2;
                const swingProgress = (timeProgress - 0.33) / 0.45;
                armSwing = Math.sin(swingProgress * Math.PI) * 15;
                bodyLean = -5;
            } else {
                // 收招阶段：双臂收回，身体恢复直立
                attackPhase = 3;
                const recoverProgress = (timeProgress - 0.78) / 0.22;
                armSwing = (1 - recoverProgress) * 8;
                bodyLean = (1 - recoverProgress) * -3;
            }
        }
        
        // v1.5.8: 攻击时红色残影效果
        if (this.attackAnimTime > 0 && attackPhase === 2) {
            // 绘制红色残影（攻击挥动阶段）
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#ff0000';
            // 残影1
            ctx.beginPath();
            ctx.arc(screenX + this.size/2 - 3, screenY - 35 + floatOffset, 12, 0, Math.PI * 2);
            ctx.fill();
            // 残影2
            ctx.beginPath();
            ctx.arc(screenX + this.size/2 + 3, screenY - 35 + floatOffset, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
        
        // 头部（骷髅头）- 身体后仰/前倾
        ctx.fillStyle = this.baseColor;
        ctx.save();
        ctx.translate(screenX + this.size/2, screenY - 35 + floatOffset);
        ctx.rotate(bodyLean * Math.PI / 180);
        ctx.translate(-(screenX + this.size/2), -(screenY - 35 + floatOffset));
        
        ctx.beginPath();
        ctx.arc(screenX + this.size/2, screenY - 35 + floatOffset, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼窝
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(screenX + this.size/2 - 4, screenY - 36 + floatOffset, 3, 0, Math.PI * 2);
        ctx.arc(screenX + this.size/2 + 4, screenY - 36 + floatOffset, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 脊柱
        ctx.fillStyle = this.baseColor;
        ctx.fillRect(screenX + this.size/2 - 3, screenY - 25 + floatOffset, 6, 20);
        
        // 肋骨
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(screenX + this.size/2 - 8, screenY - 22 + i * 6 + floatOffset, 16, 3);
        }
        
        // v1.5.8: 手臂 - 攻击时前伸/抬起
        ctx.fillStyle = this.baseColor;
        // 左手臂 - 攻击时抬起并前伸
        const leftArmX = screenX + this.size/2 - 15 - armSwing;
        const leftArmY = screenY - 20 + floatOffset - armRaise;
        ctx.fillRect(leftArmX, leftArmY, 12 + armSwing * 0.5, 4);
        
        // 右手臂 - 攻击时抬起并前伸
        const rightArmX = screenX + this.size/2 + 3;
        const rightArmY = screenY - 20 + floatOffset - armRaise;
        ctx.fillRect(rightArmX, rightArmY, 12 + armSwing * 0.5, 4);
        
        // 武器（骨剑）- 攻击时挥动
        ctx.fillStyle = '#d4d4d4';
        const swordX = screenX - 5 - armSwing * 1.5;
        const swordY = screenY - 30 + floatOffset - armRaise * 0.5;
        ctx.fillRect(swordX, swordY, 4, 20);
        
        ctx.restore();
        
        // 腿部
        const legSway = Math.sin(this.animTime * 4) * 3;
        ctx.fillStyle = this.baseColor;
        ctx.fillRect(screenX + 8 + legSway, screenY - 5 + floatOffset, 5, 10);
        ctx.fillRect(screenX + 18 - legSway, screenY - 5 + floatOffset, 5, 10);
    }
    
    // v1.2.9: 蝙蝠 - 黑色翅膀倒挂
    drawBat(screenX, screenY, floatOffset) {
        // 翅膀扇动动画
        const wingFlap = Math.sin(this.animTime * 6) * 0.4;
        
        // 身体
        ctx.fillStyle = this.baseColor;
        ctx.beginPath();
        ctx.ellipse(screenX + this.size/2, screenY - this.size/2 + floatOffset, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 左翅膀
        ctx.fillStyle = '#2d2d2d';
        ctx.beginPath();
        ctx.moveTo(screenX + 5, screenY - this.size/2 + floatOffset);
        ctx.quadraticCurveTo(screenX - 10, screenY - this.size + floatOffset - wingFlap * 20, screenX + 5, screenY - this.size + 5 + floatOffset);
        ctx.quadraticCurveTo(screenX + 10, screenY - this.size/2 + floatOffset - wingFlap * 10, screenX + 5, screenY - this.size/2 + floatOffset);
        ctx.fill();
        
        // 右翅膀
        ctx.beginPath();
        ctx.moveTo(screenX + this.size - 5, screenY - this.size/2 + floatOffset);
        ctx.quadraticCurveTo(screenX + this.size + 10, screenY - this.size + floatOffset - wingFlap * 20, screenX + this.size - 5, screenY - this.size + 5 + floatOffset);
        ctx.quadraticCurveTo(screenX + this.size - 10, screenY - this.size/2 + floatOffset - wingFlap * 10, screenX + this.size - 5, screenY - this.size/2 + floatOffset);
        ctx.fill();
        
        // 耳朵
        ctx.fillStyle = this.baseColor;
        ctx.beginPath();
        ctx.moveTo(screenX + 6, screenY - this.size/2 - 5 + floatOffset);
        ctx.lineTo(screenX + 4, screenY - this.size - 5 + floatOffset);
        ctx.lineTo(screenX + 8, screenY - this.size/2 - 3 + floatOffset);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(screenX + this.size - 6, screenY - this.size/2 - 5 + floatOffset);
        ctx.lineTo(screenX + this.size - 4, screenY - this.size - 5 + floatOffset);
        ctx.lineTo(screenX + this.size - 8, screenY - this.size/2 - 3 + floatOffset);
        ctx.fill();
        
        // 红色眼睛
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(screenX + this.size/2 - 3, screenY - this.size/2 - 2 + floatOffset, 2, 0, Math.PI * 2);
        ctx.arc(screenX + this.size/2 + 3, screenY - this.size/2 - 2 + floatOffset, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // v1.2.9: 魔藤 - 紫色藤蔓，地面生长
    drawVine(screenX, screenY, floatOffset) {
        // 藤蔓摇摆动画
        const vineSway = Math.sin(this.animTime * 2) * 3;
        
        // 主藤蔓（从地面升起）
        ctx.strokeStyle = this.baseColor;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(screenX + this.size/2, screenY);
        ctx.quadraticCurveTo(
            screenX + this.size/2 + vineSway, 
            screenY - this.size/2 + floatOffset,
            screenX + this.size/2 - vineSway, 
            screenY - this.size + floatOffset
        );
        ctx.stroke();
        
        // 藤蔓分支
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(screenX + this.size/2, screenY - this.size/2 + floatOffset);
        ctx.quadraticCurveTo(
            screenX + this.size/2 + 10, 
            screenY - this.size/2 - 5 + floatOffset,
            screenX + this.size - 5, 
            screenY - this.size + floatOffset
        );
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(screenX + this.size/2, screenY - this.size/2 + floatOffset);
        ctx.quadraticCurveTo(
            screenX + this.size/2 - 10, 
            screenY - this.size/2 - 5 + floatOffset,
            screenX + 5, 
            screenY - this.size + floatOffset
        );
        ctx.stroke();
        
        // 叶子
        ctx.fillStyle = '#6b46c1';
        ctx.beginPath();
        ctx.ellipse(screenX + this.size/2 - 8, screenY - this.size/2 + floatOffset, 5, 3, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(screenX + this.size/2 + 8, screenY - this.size/2 + floatOffset, 5, 3, 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 花朵（深紫色）
        ctx.fillStyle = '#553c9a';
        ctx.beginPath();
        ctx.arc(screenX + this.size/2, screenY - this.size + floatOffset, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // v1.2.9: 冰魔 - 蓝白色寒冰形态
    drawIceDevil(screenX, screenY, floatOffset) {
        // 冰晶浮动动画
        const crystalFloat = Math.sin(this.animTime * 2) * 2;
        
        // 身体（冰晶形态）
        ctx.fillStyle = this.baseColor;
        ctx.beginPath();
        ctx.moveTo(screenX + this.size/2, screenY - this.size + floatOffset);  // 顶部
        ctx.lineTo(screenX + this.size - 5, screenY - this.size/2 + floatOffset);  // 右侧
        ctx.lineTo(screenX + this.size/2, screenY - 5 + floatOffset);  // 底部
        ctx.lineTo(screenX + 5, screenY - this.size/2 + floatOffset);  // 左侧
        ctx.closePath();
        ctx.fill();
        
        // 冰晶光芒
        ctx.fillStyle = '#bee3f8';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(screenX + this.size/2, screenY - this.size + floatOffset - crystalFloat);
        ctx.lineTo(screenX + this.size - 10, screenY - this.size/2 + floatOffset);
        ctx.lineTo(screenX + this.size/2, screenY - 10 + floatOffset);
        ctx.lineTo(screenX + 10, screenY - this.size/2 + floatOffset);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // 冰晶尖刺
        ctx.fillStyle = '#90cdf4';
        ctx.beginPath();
        ctx.moveTo(screenX + this.size/2 - 3, screenY - this.size + floatOffset);
        ctx.lineTo(screenX + this.size/2, screenY - this.size - 8 + floatOffset);
        ctx.lineTo(screenX + this.size/2 + 3, screenY - this.size + floatOffset);
        ctx.fill();
        
        // 眼睛（冰蓝色发光）
        ctx.fillStyle = '#00bfff';
        ctx.beginPath();
        ctx.arc(screenX + this.size/2 - 5, screenY - this.size/2 - 5 + floatOffset, 3, 0, Math.PI * 2);
        ctx.arc(screenX + this.size/2 + 5, screenY - this.size/2 - 5 + floatOffset, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 冰晶粒子效果
        ctx.fillStyle = '#e0f2fe';
        for (let i = 0; i < 3; i++) {
            const px = screenX + this.size/2 + Math.cos(this.animTime + i * 2) * 12;
            const py = screenY - this.size/2 + floatOffset + Math.sin(this.animTime + i * 2) * 8;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // v1.4.4: Boss绘制方法 - 远古巨魔
    drawBoss(screenX, screenY, floatOffset) {
        // 呼吸动画
        const breathe = Math.sin(this.animTime * 2) * 2;
        
        // Boss光晕效果
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 20;
        
        // 身体（巨大红色）
        ctx.fillStyle = '#8b0000';
        ctx.beginPath();
        ctx.arc(screenX + this.size/2, screenY - this.size/2 + floatOffset, this.size/2 + breathe, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛（发光红眼）
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(screenX + this.size/2 - 10, screenY - this.size/2 - 5 + floatOffset, 6, 0, Math.PI * 2);
        ctx.arc(screenX + this.size/2 + 10, screenY - this.size/2 - 5 + floatOffset, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // 牙齿
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(screenX + this.size/2 - 15, screenY - 10 + floatOffset);
        ctx.lineTo(screenX + this.size/2 - 10, screenY - 20 + floatOffset);
        ctx.lineTo(screenX + this.size/2 - 5, screenY - 10 + floatOffset);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(screenX + this.size/2 + 5, screenY - 10 + floatOffset);
        ctx.lineTo(screenX + this.size/2 + 10, screenY - 20 + floatOffset);
        ctx.lineTo(screenX + this.size/2 + 15, screenY - 10 + floatOffset);
        ctx.fill();
        
        // 角
        ctx.fillStyle = '#4a0000';
        ctx.beginPath();
        ctx.moveTo(screenX + this.size/2 - 15, screenY - this.size/2 + floatOffset);
        ctx.lineTo(screenX + this.size/2 - 25, screenY - this.size - 10 + floatOffset);
        ctx.lineTo(screenX + this.size/2 - 5, screenY - this.size/2 + floatOffset);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(screenX + this.size/2 + 15, screenY - this.size/2 + floatOffset);
        ctx.lineTo(screenX + this.size/2 + 25, screenY - this.size - 10 + floatOffset);
        ctx.lineTo(screenX + this.size/2 + 5, screenY - this.size/2 + floatOffset);
        ctx.fill();
        
        // 重置阴影
        ctx.shadowBlur = 0;
    }
}

function spawnEnemy() {
    // v1.4.4: 计算当前波次
    const wave = Math.floor(player.x / 1000) + 1;
    
    // v1.4.4: 每10波生成一个Boss
    const isBossWave = wave % 10 === 0;
    
    let type;
    if (isBossWave) {
        // Boss波次，生成Boss
        type = '远古巨魔';
    } else {
        // 随机普通怪物
        const types = Object.keys(ENEMY_TYPES).filter(t => !ENEMY_TYPES[t].isBoss);
        type = types[Math.floor(Math.random() * types.length)];
    }
    
    // v1.2.6: 开局时在玩家附近生成怪物，后续怪物从屏幕右侧生成
    let spawnX;
    if (game.enemies.length === 0) {
        // 第一个怪物在玩家前方100-300像素生成
        spawnX = player.x + 100 + Math.random() * 200;
    } else {
        // 后续怪物从屏幕右侧外生成
        spawnX = player.x + CONFIG.width + Math.random() * 200;
    }
    
    const enemy = new Enemy(spawnX, type);
    
    // v1.4.4: Boss特殊标记
    if (isBossWave) {
        enemy.isBoss = true;
    }
    
    game.enemies.push(enemy);
}

// v1.5.3: 野猪精 - 褐色身体，獠牙，皮厚移动慢
Enemy.prototype.drawBoar = function(screenX, screenY, floatOffset) {
    // 攻击动画 - 冲锋
    const attackCharge = this.attackAnimTime > 0 ? 8 : 0;
    
    // 身体 - 椭圆形
    ctx.fillStyle = this.baseColor;
    ctx.beginPath();
    ctx.ellipse(screenX + this.size/2, screenY - this.size/2 + floatOffset, this.size/2, this.size/2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 背部深色条纹
    ctx.fillStyle = '#5D3A1A';
    ctx.fillRect(screenX + 8, screenY - this.size + floatOffset + 5, this.size - 16, 6);
    
    // 头部
    ctx.fillStyle = this.baseColor;
    ctx.beginPath();
    ctx.ellipse(screenX + this.size - 8, screenY - this.size/2 - 5 + floatOffset, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 獠牙
    ctx.fillStyle = '#F5DEB3';
    ctx.beginPath();
    ctx.moveTo(screenX + this.size - 15, screenY - this.size/2 + floatOffset);
    ctx.lineTo(screenX + this.size - 25, screenY - this.size/2 - 8 + floatOffset);
    ctx.lineTo(screenX + this.size - 18, screenY - this.size/2 + floatOffset);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(screenX + this.size - 15, screenY - this.size/2 + floatOffset + 4);
    ctx.lineTo(screenX + this.size - 25, screenY - this.size/2 + floatOffset + 12);
    ctx.lineTo(screenX + this.size - 18, screenY - this.size/2 + floatOffset + 4);
    ctx.fill();
    
    // 眼睛 - 红色
    ctx.fillStyle = '#DC143C';
    ctx.beginPath();
    ctx.arc(screenX + this.size - 10, screenY - this.size/2 - 8 + floatOffset, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // 腿 - 短粗
    ctx.fillStyle = this.baseColor;
    ctx.fillRect(screenX + 8 + attackCharge, screenY - 8 + floatOffset, 8, 10);
    ctx.fillRect(screenX + this.size - 18 + attackCharge, screenY - 8 + floatOffset, 8, 10);
    
    // 尾巴 - 小卷
    ctx.fillStyle = '#5D3A1A';
    ctx.beginPath();
    ctx.arc(screenX + 5, screenY - this.size/2 + floatOffset - 5, 4, 0, Math.PI * 2);
    ctx.fill();
};

// v1.5.3: 灰狼 - 灰色毛皮，速度快，耳朵
Enemy.prototype.drawGreyWolf = function(screenX, screenY, floatOffset) {
    // 攻击动画 - 扑咬
    const attackLunge = this.attackAnimTime > 0 ? 10 : 0;
    
    // 身体 - 纺锤形
    ctx.fillStyle = this.baseColor;
    ctx.beginPath();
    ctx.ellipse(screenX + this.size/2, screenY - this.size/2 + floatOffset, this.size/2 + 5, this.size/3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 背部深色毛皮
    ctx.fillStyle = '#696969';
    ctx.fillRect(screenX + 5, screenY - this.size + floatOffset + 8, this.size - 10, 5);
    
    // 头部 - 三角形
    ctx.fillStyle = this.baseColor;
    ctx.beginPath();
    ctx.moveTo(screenX + this.size - 5 + attackLunge, screenY - this.size/2 - 10 + floatOffset);
    ctx.lineTo(screenX + this.size + 15 + attackLunge, screenY - this.size/2 + floatOffset);
    ctx.lineTo(screenX + this.size - 5 + attackLunge, screenY - this.size/2 + 10 + floatOffset);
    ctx.closePath();
    ctx.fill();
    
    // 耳朵 - 三角形立耳
    ctx.fillStyle = this.baseColor;
    ctx.beginPath();
    ctx.moveTo(screenX + this.size - 5, screenY - this.size/2 - 15 + floatOffset);
    ctx.lineTo(screenX + this.size - 12, screenY - this.size/2 - 25 + floatOffset);
    ctx.lineTo(screenX + this.size + 2, screenY - this.size/2 - 15 + floatOffset);
    ctx.fill();
    
    // 眼睛 - 黄色发光
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(screenX + this.size + 5 + attackLunge, screenY - this.size/2 - 5 + floatOffset, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(screenX + this.size + 6 + attackLunge, screenY - this.size/2 - 5 + floatOffset, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 腿 - 奔跑动画
    const legRun = Math.sin(this.animTime * 3) * 6;
    ctx.fillStyle = this.baseColor;
    ctx.fillRect(screenX + 5, screenY - 8 + floatOffset + legRun, 6, 12);
    ctx.fillRect(screenX + this.size - 15, screenY - 8 + floatOffset - legRun, 6, 12);
    
    // 尾巴 - 蓬松
    ctx.fillStyle = this.baseColor;
    ctx.beginPath();
    ctx.ellipse(screenX + 3, screenY - this.size/2 - 5 + floatOffset, 10, 5, -0.5, 0, Math.PI * 2);
    ctx.fill();
};

// v1.5.3: 蛇妖 - 绿色身体，有毒性攻击，蛇信
Enemy.prototype.drawSnakeDemon = function(screenX, screenY, floatOffset) {
    // 攻击动画 - 毒液喷射
    const attackBite = this.attackAnimTime > 0 ? 12 : 0;
    
    // 身体 - 蛇形盘绕
    ctx.fillStyle = this.baseColor;
    ctx.beginPath();
    // 盘绕的身体
    ctx.ellipse(screenX + this.size/2, screenY - 15 + floatOffset, this.size/2.5, this.size/3, 0, 0, Math.PI * 2);
    ctx.fill();
    // 蛇身波浪
    const wave = Math.sin(this.animTime * 2) * 3;
    ctx.beginPath();
    ctx.moveTo(screenX + 8, screenY - 20 + floatOffset);
    ctx.quadraticCurveTo(screenX + this.size/2 + wave, screenY - 30 + floatOffset, screenX + this.size - 8, screenY - 20 + floatOffset);
    ctx.lineWidth = 8;
    ctx.strokeStyle = this.baseColor;
    ctx.stroke();
    
    // 头部 - 三角形
    ctx.fillStyle = this.baseColor;
    ctx.beginPath();
    ctx.moveTo(screenX + this.size/2 + attackBite, screenY - this.size - 5 + floatOffset);
    ctx.lineTo(screenX + this.size/2 + 15 + attackBite, screenY - this.size/2 + floatOffset);
    ctx.lineTo(screenX + this.size/2 + attackBite, screenY - this.size/2 + 15 + floatOffset);
    ctx.closePath();
    ctx.fill();
    
    // 眼睛 - 蛇眼（竖瞳）
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(screenX + this.size/2 + 5 + attackBite, screenY - this.size - 10 + floatOffset, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(screenX + this.size/2 + 5 + attackBite, screenY - this.size - 10 + floatOffset, 1.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 蛇信 - 分叉
    ctx.strokeStyle = '#32CD32';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(screenX + this.size/2 + 15 + attackBite, screenY - this.size/2 + 8 + floatOffset);
    ctx.lineTo(screenX + this.size/2 + 22 + attackBite, screenY - this.size/2 + 12 + floatOffset);
    ctx.moveTo(screenX + this.size/2 + 15 + attackBite, screenY - this.size/2 + 8 + floatOffset);
    ctx.lineTo(screenX + this.size/2 + 22 + attackBite, screenY - this.size/2 + 16 + floatOffset);
    ctx.stroke();
    
    // 毒液效果（攻击时）
    if (this.attackAnimTime > 0) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(screenX + this.size/2 + 25 + attackBite, screenY - this.size/2 + 14 + floatOffset, 6, 0, Math.PI * 2);
        ctx.fill();
    }
};

// v1.5.3: 僵尸V2 - 筑基期，高血量，灰白色皮肤
Enemy.prototype.drawZombieV2 = function(screenX, screenY, floatOffset) {
    // 攻击动画 - 双臂前伸
    const armExtend = this.attackAnimTime > 0 ? 10 : 0;
    
    // 身体 - 僵硬直立
    ctx.fillStyle = this.baseColor;
    ctx.fillRect(screenX + 8, screenY - 35 + floatOffset, this.size - 16, 30);
    
    // 衣服残片
    ctx.fillStyle = '#4B5563';
    ctx.fillRect(screenX + 10, screenY - 30 + floatOffset, this.size - 20, 8);
    ctx.fillRect(screenX + 12, screenY - 18 + floatOffset, this.size - 24, 6);
    
    // 头部 - 方正
    ctx.fillStyle = this.baseColor;
    ctx.fillRect(screenX + 10, screenY - 48 + floatOffset, this.size - 20, 15);
    
    // 眼睛 - 空洞
    ctx.fillStyle = '#000';
    ctx.fillRect(screenX + 12, screenY - 44 + floatOffset, 5, 5);
    ctx.fillRect(screenX + this.size - 17, screenY - 44 + floatOffset, 5, 5);
    
    // 嘴巴 - 獠牙外露
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(screenX + 14, screenY - 37 + floatOffset, 8, 4);
    
    // 手臂 - 平伸
    ctx.fillStyle = this.baseColor;
    ctx.fillRect(screenX - 5 - armExtend, screenY - 32 + floatOffset, 18, 6);
    ctx.fillRect(screenX + this.size - 13 + armExtend, screenY - 32 + floatOffset, 18, 6);
    
    // 腿
    ctx.fillStyle = this.baseColor;
    ctx.fillRect(screenX + 10, screenY - 8 + floatOffset, 8, 12);
    ctx.fillRect(screenX + this.size - 18, screenY - 8 + floatOffset, 8, 12);
};

// v1.5.3: 山贼 - 筑基期，攻击高，土匪造型
Enemy.prototype.drawBandit = function(screenX, screenY, floatOffset) {
    // 攻击动画 - 挥刀
    const attackSwing = this.attackAnimTime > 0 ? 15 : 0;
    
    // 身体 - 劲装
    ctx.fillStyle = this.baseColor;
    ctx.fillRect(screenX + 10, screenY - 35 + floatOffset, this.size - 20, 30);
    
    // 腰带
    ctx.fillStyle = '#78350F';
    ctx.fillRect(screenX + 8, screenY - 20 + floatOffset, this.size - 16, 5);
    
    // 头部 - 头巾
    ctx.fillStyle = '#92400E';
    ctx.fillRect(screenX + 8, screenY - 48 + floatOffset, this.size - 16, 12);
    // 头巾飘带
    const ribbonWave = Math.sin(this.animTime * 2) * 3;
    ctx.fillRect(screenX + this.size - 5, screenY - 45 + floatOffset, 8, 3);
    ctx.fillRect(screenX + this.size - 8 + ribbonWave, screenY - 42 + floatOffset, 12, 2);
    
    // 眼睛 - 凶恶
    ctx.fillStyle = '#000';
    ctx.fillRect(screenX + 12, screenY - 40 + floatOffset, 5, 4);
    ctx.fillRect(screenX + this.size - 17, screenY - 40 + floatOffset, 5, 4);
    // 眉毛 - 凶眉
    ctx.fillRect(screenX + 11, screenY - 42 + floatOffset, 7, 2);
    ctx.fillRect(screenX + this.size - 18, screenY - 42 + floatOffset, 7, 2);
    
    // 武器 - 刀
    ctx.fillStyle = '#A1A1AA';
    ctx.save();
    ctx.translate(screenX + this.size - 5 + attackSwing, screenY - 25 + floatOffset);
    ctx.rotate(attackSwing * 0.03);
    ctx.fillRect(0, -2, 25, 4);  // 刀身
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-3, -3, 5, 6);  // 刀柄
    ctx.restore();
    
    // 腿
    ctx.fillStyle = '#4B5563';
    ctx.fillRect(screenX + 10, screenY - 8 + floatOffset, 8, 12);
    ctx.fillRect(screenX + this.size - 18, screenY - 8 + floatOffset, 8, 12);
};
