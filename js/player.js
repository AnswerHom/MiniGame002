// v1.1.0: 玩家模块 - Q版水墨风形象
// v1.5.1: 武器动画优化

const player = {
    x: 100,
    y: CONFIG.groundY,
    width: 32,   // v1.1.0: 宽度32px
    height: 48,  // v1.1.0: 高度48px，头身比1:1.5
    level: 1,
    hp: 100,
    maxHp: 100,
    attack: 10,
    baseAttack: 10,  // v1.4.3: 基础攻击力（不含装备）
    defense: 0,  // v2.6.0: 防御力
    speed: 80,   // v1.2.3: 80px/秒（固定值）
    attackCooldown: 0,
    attackInterval: 1.2,  // 攻击间隔（秒）
    attackRange: 70,  // v1.5.9: 7米 (10px=1m)，确保能攻击到停在6米的怪物
    viewDistance: 300,  // v1.5.7: 30米 - 主角视野范围
    critRate: 0.05,
    critDamage: 2.0,
    exp: 0,
    requiredExp: 100,
    attacking: false,
    attackFrame: 0,
    hitFlash: 0,
    isMoving: true,
    
    // v1.4.3: 暴击闪烁效果
    critFlash: 0,
    
    // v1.4.3: 初始装备 - 攻击力+2
    initialEquipment: {
        weapon: { name: '新手剑', attackBonus: 2 }
    },
    
    // v1.5.1: 武器类型 (sword/blade/spear)
    weaponType: 'sword',
    
    // v1.2.0: Q版水墨风配色（修正后与需求文档一致）
    // v1.5.3: 仙侠风格优化 - 精致像素风
    robeColor: '#f0f5f9',      // 月白色长袍
    robeAccentColor: '#81e6d9', // 淡青色衣领袖口
    hairColor: '#1a202c',      // 墨黑头发
    hairAccentColor: '#fc8181', // 红色发带
    weaponColor: '#c0c0c0',    // 银色剑身
    weaponAccentColor: '#fc8181', // 红色剑穗
    
    // v1.5.3: 仙侠风格配置
    xianxiaStyle: true,        // 启用仙侠风格
    robeDetail: true,          // 衣服细节
    ribbon: true,              // 飘带效果
    hairDetail: true,          // 精细头发
    
    // v2.1.0: 灵气修炼系统
    spirit: 0,           // 当前灵气值
    maxSpirit: 0,        // 当前境界突破所需灵气
    
    // v1.5.3: 攻击动画参数
    attackAnimation: {
        windUp: 0.15,          // 前摇时间(秒)
        strike: 0.1,            // 攻击时间(秒)
        followThrough: 0.1,    // 后摇时间(秒)
        total: 0.35            // 总时长
    },
    
    // v1.1.0: 动画相关
    idleTime: 0,               // 待机时间
    idleFloatOffset: 0,        // 浮动偏移量
    
    // v1.3.9: debuff视觉效果
    poisonEffect: 0,            // 中毒效果计时器
    slowEffect: 0,             // 减速效果计时器
    
    getRealm() {
        return getRealm(this.level);
    },
    
    // v2.1.0: 获取当前境界名称
    getRealmName() {
        return this.getRealm().name;
    },
    
    // v2.1.0: 获取当前境界等级
    getRealmLevel() {
        return REALM_LEVEL_MAP[this.getRealmName()] || 1;
    },
    
    // v2.1.0: 获取突破所需灵气
    getRequiredSpirit() {
        const realmName = this.getRealmName();
        return SPIRIT_SYSTEM.realmSpiritRequired[realmName] || 0;
    },
    
    // v2.1.0: 添加灵气
    addSpirit(amount) {
        const realmName = this.getRealmName();
        const multiplier = SPIRIT_SYSTEM.realmSpiritMultiplier[realmName] || 1.0;
        const actualAmount = Math.floor(amount * multiplier);
        
        this.spirit += actualAmount;
        
        // 检查是否可以突破
        this.checkBreakthrough();
        
        return actualAmount;
    },
    
    // v2.1.0: 检查是否可以突破
    checkBreakthrough() {
        const required = this.getRequiredSpirit();
        if (required > 0 && this.spirit >= required) {
            // 可以突破，显示提示
            game.showBreakthroughPrompt = true;
        }
    },
    
    // v2.1.0: 执行境界突破
    breakthrough() {
        const required = this.getRequiredSpirit();
        const currentRealmLevel = this.getRealmLevel();
        
        if (required > 0 && this.spirit >= required) {
            // 消耗灵气
            this.spirit -= required;
            
            // 提升境界（境界系统已通过等级提升，这里主要是触发特效）
            game.addBreakthroughEffect(this.x, this.y - this.height);
            game.playSound('levelup');
            
            // 显示突破成功提示
            const newRealm = REALMS[currentRealmLevel] ? REALMS[currentRealmLevel].name : this.getRealmName();
            game.showMessage('境界突破成功！突破至 ' + newRealm, '#ffd700');
            
            // 重新计算属性加成
            this.applyRealmBonus();
            
            // 隐藏突破提示
            game.showBreakthroughPrompt = false;
            
            return true;
        }
        return false;
    },
    
    // v2.1.0: 应用境界属性加成
    applyRealmBonus() {
        const realmName = this.getRealmName();
        const bonus = SPIRIT_SYSTEM.realmAttributeBonus[realmName] || { hp: 1.0, attack: 1.0, speed: 1.0 };
        
        // 保存基础值
        const baseHp = 100;
        const baseAttack = 10;
        
        // 应用加成
        this.maxHp = Math.floor(baseHp * bonus.hp * (1 + (this.level - 1) * 0.2));
        this.hp = this.maxHp;
        this.attack = Math.floor(baseAttack * bonus.attack * (1 + (this.level - 1) * 0.15));
        this.speed = Math.floor(80 * bonus.speed);
    },

    update(dt) {
        // 冷却
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }
        if (this.attacking) {
            this.attackFrame += dt * 8; // v1.4.4: 攻击动画速度
            
            // v1.4.4: 更新攻击阶段
            if (this.attackFrame < 0.4) {
                this.attackPhase = 'windup';  // 前摇
            } else if (this.attackFrame < 0.7) {
                this.attackPhase = 'swing';  // 挥动
            } else {
                this.attackPhase = 'followthrough';  // 收招
            }
            
            if (this.attackFrame >= 1) {
                this.attacking = false;
                this.attackPhase = null;
            }
        }
        if (this.hitFlash > 0) {
            this.hitFlash -= dt;
        }
        
        // v1.1.0: 玩家自动持续向右移动
        if (this.isMoving) {
            this.x += this.speed * dt;
        }
        
        // v1.1.0: 待机动画 - 轻微上下浮动
        this.idleTime += dt;
        this.idleFloatOffset = Math.sin(this.idleTime * 2) * 2; // 2px浮动
        
        // v1.3.9: 更新debuff视觉效果计时器
        if (this.poisonEffect > 0) this.poisonEffect -= dt;
        if (this.slowEffect > 0) this.slowEffect -= dt;
        
        // v1.4.3: 更新暴击闪烁效果
        if (this.critFlash > 0) this.critFlash -= dt;
        
        // v1.3.9: 检测debuff状态并更新视觉效果
        if (this.buffs) {
            this.buffs.forEach(buff => {
                if (buff.active) {
                    if (buff.type === 'poison') this.poisonEffect = 0.5;
                    if (buff.type === 'slow') this.slowEffect = 0.5;
                }
            });
        }
        
        // 更新相机
        CONFIG.cameraOffset = this.x - 150;
    },

    // v1.1.0: 暴击系统 - v1.4.3: 添加暴击闪烁和伤害统计
    attackTarget(enemy) {
        if (this.attackCooldown <= 0) {
            this.attacking = true;
            this.attackFrame = 0;
            this.attackPhase = 'windup';  // v1.4.4: 攻击阶段 - 前摇
            this.attackCooldown = this.attackInterval;
            this.attackHit = false;  // v1.4.4: 标记是否已命中
            
            const isCrit = Math.random() < this.critRate;
            let damageMult = isCrit ? this.critDamage : 1.0;
            
            // v2.5.0: 武器特效处理
            const weapon = WEAPON_SYSTEM[this.weaponType] || WEAPON_SYSTEM.sword;
            if (weapon.effect === 'combo' && handleWeaponEffect) {
                damageMult *= handleWeaponEffect('combo', 0, enemy, game.enemies);
            }
            
            let damage = Math.floor(this.attack * damageMult);
            
            // v2.5.0: 枪的穿透效果 - 对多个敌人造成伤害
            if (weapon.effect === 'pierce' && game.enemies) {
                // 按距离排序敌人
                const sortedEnemies = game.enemies
                    .filter(e => e.alive && Math.abs(e.x - enemy.x) < 100)
                    .sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x));
                
                sortedEnemies.forEach((e, index) => {
                    const pierceDamage = WeaponEffectManager.pierce.getPierceDamage(damage, index);
                    game.addDamageNumber(e.x, e.y - e.height, pierceDamage, isCrit);
                    e.takeDamage(pierceDamage);
                    game.recordDamage(pierceDamage);
                    if (index === 0) game.addHitEffect(e.x, e.y - e.height / 2, isCrit);
                });
            } else {
                game.addDamageNumber(enemy.x, enemy.y - enemy.height, damage, isCrit);
                enemy.takeDamage(damage);
                game.recordDamage(damage);
                game.addHitEffect(enemy.x, enemy.y - enemy.height / 2, isCrit);
            }
            
            // v2.5.0: 刀的吸血效果
            if (weapon.effect === 'lifesteal') {
                WeaponEffectManager.lifesteal.onDamage(damage, enemy);
            }
            
            // v1.2.8: 暴击时添加特效
            if (isCrit) {
                game.addCritEffect(enemy.x, enemy.y - enemy.height / 2);
                // v1.4.3: 暴击时玩家角色短暂闪烁（0.2秒内闪烁2次）
                this.critFlash = 0.2;
            }
            
            // v1.2.7: 攻击音效
            game.playSound('attack');
        }
    },

    takeDamage(damage) {
        // v1.3.9: Bug修复 - 无敌模式不减伤
        if (game.activePowerups.invincible) {
            return false;
        }
        // v2.6.0: 防御力减伤
        const actualDamage = Math.max(1, damage - this.defense);
        this.hp -= actualDamage;
        this.hitFlash = 0.2;
        if (this.hp <= 0) {
            this.hp = 0;
            return true;
        }
        return false;
    },

    levelUp() {
        this.level++;
        this.exp -= this.requiredExp;
        // v2.6.0: 新的成长公式
        // 生命值：100 × 1.2^(等级-1)
        // 攻击力：10 + (等级-1) × 2 + (等级-1)^0.5
        // 防御力：等级-1
        // 升级经验：100 × 1.5^(等级-1)
        const baseHp = 100;
        const baseAttack = 10;
        this.maxHp = Math.floor(baseHp * Math.pow(1.2, this.level - 1));
        this.hp = this.maxHp;
        this.attack = Math.floor(baseAttack + (this.level - 1) * 2 + Math.sqrt(this.level - 1));
        this.defense = this.level - 1;
        this.requiredExp = Math.floor(100 * Math.pow(1.5, this.level - 1));
        
        // v1.2.7: 升级音效
        game.playSound('levelup');
        // v1.2.8: 升级特效
        game.addLevelUpEffect(this.x, this.y - this.height);
    },

    // v1.1.0: Q版水墨风角色造型
    draw() {
        const screenX = this.x - CONFIG.cameraOffset;
        const screenY = this.y + this.idleFloatOffset; // v1.1.0: 浮动效果
        
        // v1.3.9: 减速debuff视觉效果 - 蓝色拖尾/冰霜效果
        if (this.slowEffect > 0) {
            const time = Date.now() / 100;
            // 蓝色冰霜光环
            const gradient = ctx.createRadialGradient(
                screenX + 16, screenY - 24, 0,
                screenX + 16, screenY - 24, 40
            );
            gradient.addColorStop(0, 'rgba(100, 200, 255, 0.3)');
            gradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.15)');
            gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenX + 16, screenY - 24, 40, 0, Math.PI * 2);
            ctx.fill();
            
            // 冰霜粒子效果
            for (let i = 0; i < 5; i++) {
                const angle = (time + i * 1.2) % (Math.PI * 2);
                const radius = 25 + Math.sin(time * 2 + i) * 5;
                const px = screenX + 16 + Math.cos(angle) * radius;
                const py = screenY - 24 + Math.sin(angle) * radius;
                ctx.fillStyle = 'rgba(150, 220, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // v1.3.9: 中毒debuff视觉效果 - 绿色粒子/身体发绿
        if (this.poisonEffect > 0) {
            const time = Date.now() / 100;
            // 绿色毒气环绕
            for (let i = 0; i < 8; i++) {
                const angle = (time * 0.5 + i * Math.PI / 4) % (Math.PI * 2);
                const radius = 20 + Math.sin(time + i) * 8;
                const px = screenX + 16 + Math.cos(angle) * radius;
                const py = screenY - 30 + Math.sin(angle) * radius - 10;
                ctx.fillStyle = `rgba(50, 255, 50, ${0.4 + Math.sin(time * 2 + i) * 0.2})`;
                ctx.beginPath();
                ctx.arc(px, py, 3 + Math.sin(time + i) * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // v1.3.7: 无敌模式视觉效果 - 金色光环
        if (game.activePowerups.invincible) {
            const time = Date.now() / 100;
            const haloRadius = 35 + Math.sin(time) * 5;
            
            // 外层光环
            const gradient = ctx.createRadialGradient(
                screenX + 16, screenY - 30, 0,
                screenX + 16, screenY - 30, haloRadius
            );
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
            gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenX + 16, screenY - 30, haloRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // 闪烁效果
            if (Math.floor(time) % 2 === 0) {
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(screenX + 16, screenY - 30, 30, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        // 受击闪烁效果
        if (this.hitFlash > 0 && Math.floor(this.hitFlash * 20) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // v1.4.3: 暴击闪烁效果 - 0.2秒内闪烁2次（白色高亮）
        if (this.critFlash > 0 && Math.floor(this.critFlash * 10) % 2 === 0) {
            ctx.globalAlpha = 0.7;
        }
        
        // v1.1.0: 月白色长袍身体（圆润Q版）
        ctx.fillStyle = this.robeColor;
        ctx.beginPath();
        ctx.ellipse(screenX + 16, screenY - 24, 16, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // v1.1.0: 淡青色衣领袖口
        ctx.fillStyle = this.robeAccentColor;
        ctx.beginPath();
        ctx.ellipse(screenX + 16, screenY - 38, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // v1.1.0: 墨黑头发（Q版娃娃头）
        // v1.5.3: 仙侠风格 - 精细头发设计
        ctx.fillStyle = this.hairColor;
        ctx.beginPath();
        ctx.arc(screenX + 16, screenY - 42, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // v1.5.3: 仙侠风格 - 增加刘海细节
        if (this.hairDetail) {
            ctx.fillRect(screenX + 8, screenY - 50, 4, 8);
            ctx.fillRect(screenX + 14, screenY - 52, 4, 8);
            ctx.fillRect(screenX + 20, screenY - 50, 4, 8);
            // 侧面发丝
            ctx.fillRect(screenX + 4, screenY - 44, 3, 10);
            ctx.fillRect(screenX + 25, screenY - 44, 3, 10);
        }
        
        // v1.1.0: 红色发带
        // v1.5.3: 仙侠风格 - 更精致的发带
        ctx.fillStyle = this.hairAccentColor;
        ctx.fillRect(screenX + 4, screenY - 48, 24, 4);
        // 发带飘带 - 动态效果
        const ribbonWave = Math.sin(this.idleTime * 3) * 3;
        ctx.beginPath();
        ctx.moveTo(screenX + 4, screenY - 44);
        ctx.quadraticCurveTo(screenX - 4 + ribbonWave, screenY - 38, screenX + 2, screenY - 30);
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.hairAccentColor;
        ctx.stroke();
        
        // v1.5.3: 仙侠风格 - 飘带效果
        if (this.ribbon) {
            // 衣服飘带1 - 左侧
            ctx.strokeStyle = this.robeAccentColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(screenX + 8, screenY - 30);
            const ribbon1Wave = Math.sin(this.idleTime * 2.5) * 5;
            ctx.quadraticCurveTo(screenX - 5 + ribbon1Wave, screenY - 15, screenX + 2, screenY - 5);
            ctx.stroke();
            
            // 衣服飘带2 - 右侧
            ctx.beginPath();
            ctx.moveTo(screenX + 24, screenY - 30);
            const ribbon2Wave = Math.sin(this.idleTime * 2.5 + 1) * 5;
            ctx.quadraticCurveTo(screenX + 37 - ribbon2Wave, screenY - 15, screenX + 30, screenY - 5);
            ctx.stroke();
        }
        
        // v1.5.3: 仙侠风格 - 衣服细节
        if (this.robeDetail) {
            // 衣服纹理 - 竖条纹
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(screenX + 10 + i * 6, screenY - 40);
                ctx.lineTo(screenX + 10 + i * 6, screenY - 10);
                ctx.stroke();
            }
            // 腰部装饰
            ctx.fillStyle = this.robeAccentColor;
            ctx.fillRect(screenX + 10, screenY - 28, 12, 3);
        }
        
        // 眼睛（Q版大眼）
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(screenX + 12, screenY - 42, 3, 0, Math.PI * 2);
        ctx.arc(screenX + 20, screenY - 42, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛高光
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(screenX + 13, screenY - 43, 1, 0, Math.PI * 2);
        ctx.arc(screenX + 21, screenY - 43, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // v1.1.0: 武器 - 剑（银色剑身+红色剑穗）
        // v1.5.1: 添加闲置时武器微动效果
        const weaponSway = this.attacking ? 0 : Math.sin(this.idleTime * WEAPON_ANIMATION.idleSwaySpeed) * WEAPON_ANIMATION.idleSwayAmount;
        
        // 绘制武器（带微动效果）
        ctx.save();
        ctx.translate(screenX + 16, screenY - 24); // 手部位置
        ctx.rotate(weaponSway * Math.PI / 180);
        
        // 剑柄
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(12, 4, 6, 4);
        // 剑穗
        ctx.fillStyle = this.weaponAccentColor;
        ctx.beginPath();
        ctx.moveTo(14, 8);
        ctx.quadraticCurveTo(19, 14, 16, 20);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 剑身
        ctx.fillStyle = this.weaponColor;
        ctx.fillRect(14, -16, 3, 18);
        // 剑刃光芒
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.6;
        ctx.fillRect(15, -15, 1, 16);
        ctx.globalAlpha = 1.0;
        
        ctx.restore();
        
        // v1.1.0: 攻击动画 - v1.4.4: 三段式攻击（windup前摇-swing挥动-followthrough收招）
        if (this.attacking) {
            // v1.4.4: 根据攻击阶段计算角度
            let swingAngle;
            let bodyTilt = 0;
            let weaponOffsetX = 0;
            let weaponOffsetY = 0;
            
            if (this.attackPhase === 'windup') {
                // 前摇阶段：身体后仰，武器后拉
                const progress = this.attackFrame / 0.4;  // 0-0.4
                swingAngle = -progress * Math.PI / 4;  // 后拉45度
                bodyTilt = -progress * 0.1;
                weaponOffsetX = -progress * 10;
                weaponOffsetY = -progress * 5;
            } else if (this.attackPhase === 'swing') {
                // 挥动阶段：武器快速前挥，身体前倾
                const progress = (this.attackFrame - 0.4) / 0.3;  // 0.4-0.7
                swingAngle = -Math.PI / 4 + progress * Math.PI * 0.7;  // -45度到+90度
                bodyTilt = progress * 0.15;
                weaponOffsetX = progress * 15;
                weaponOffsetY = progress * 8;
            } else {
                // 收招阶段：武器回弹，身体恢复
                const progress = (this.attackFrame - 0.7) / 0.3;  // 0.7-1.0
                swingAngle = Math.PI * 0.35 - progress * Math.PI / 4;  // 90度回到45度
                bodyTilt = 0.15 - progress * 0.15;
                weaponOffsetX = 15 - progress * 8;
                weaponOffsetY = 8 - progress * 8;
            }
            
            // v1.4.4: 身体倾斜
            ctx.save();
            ctx.translate(screenX + 16, screenY - 24);
            ctx.rotate(bodyTilt);
            ctx.translate(-(screenX + 16), -(screenY - 24));
            
            // v1.5.1: 根据武器类型添加特殊效果
            const weaponConfig = WEAPON_TYPES[this.weaponType] || WEAPON_TYPES.sword;
            
            // 残影效果
            ctx.globalAlpha = 0.3;
            for (let i = 1; i <= 3; i++) {
                ctx.save();
                ctx.translate(screenX + 16 + weaponOffsetX, screenY - 30 + weaponOffsetY);
                ctx.rotate(swingAngle - i * 0.1);
                
                // v1.5.1: 刀类武器旋转效果
                if (this.weaponType === 'blade' && this.attackPhase === 'swing') {
                    ctx.rotate(Math.sin(Date.now() / 50) * weaponConfig.rotationAngle * Math.PI / 180);
                }
                
                ctx.fillStyle = '#fff';
                
                // v1.5.1: 不同武器类型绘制不同形状
                if (this.weaponType === 'spear') {
                    // 枪 - 细长形状
                    ctx.fillRect(10, -0.5, 35, 1);
                } else if (this.weaponType === 'blade') {
                    // 刀 - 宽扁形状
                    ctx.fillRect(8, -2, 28, 4);
                } else {
                    // 剑 - 默认
                    ctx.fillRect(10, -1, 25, 3);
                }
                ctx.restore();
            }
            ctx.globalAlpha = 1.0;
            
            // v1.4.4: 剑光效果
            this.drawAttackEffect(screenX, screenY, swingAngle, weaponOffsetX, weaponOffsetY);
            
            // 实际剑挥动
            ctx.save();
            ctx.translate(screenX + 16 + weaponOffsetX, screenY - 30 + weaponOffsetY);
            ctx.rotate(swingAngle);
            
            // v1.5.1: 刀类武器旋转效果
            if (this.weaponType === 'blade' && this.attackPhase === 'swing') {
                ctx.rotate(Math.sin(Date.now() / 50) * weaponConfig.rotationAngle * Math.PI / 180);
            }
            
            // v1.5.1: 枪类武器震动效果
            let vibrationOffset = 0;
            if (this.weaponType === 'spear' && this.attackPhase === 'swing') {
                vibrationOffset = Math.sin(Date.now() / 30) * weaponConfig.vibrationAmount;
            }
            
            // v1.5.1: 根据武器类型绘制不同形状
            if (this.weaponType === 'spear') {
                // 枪 - 细长戳刺
                ctx.fillStyle = this.weaponColor;
                ctx.fillRect(10 + vibrationOffset, -0.5, 38, 2);
                // 枪尖
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = 0.7;
                ctx.fillRect(46 + vibrationOffset, -1, 4, 2);
                ctx.globalAlpha = 1.0;
            } else if (this.weaponType === 'blade') {
                // 刀 - 宽扁有弧度
                ctx.fillStyle = this.weaponColor;
                ctx.fillRect(8, -2, 30, 4);
                ctx.fillStyle = '#666';
                ctx.fillRect(10, -1, 26, 2);
                // 刀刃
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = 0.7;
                ctx.fillRect(12, -1.5, 24, 1);
                ctx.globalAlpha = 1.0;
            } else {
                // 剑 - 默认
                ctx.fillStyle = this.weaponColor;
                ctx.fillRect(10, -1.5, 28, 3);
                // 剑刃
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = 0.7;
                ctx.fillRect(12, -0.5, 24, 1);
                ctx.globalAlpha = 1.0;
            }
            ctx.restore();
            
            ctx.restore();  // 身体倾斜恢复
        }
        
        // 血条
        ctx.fillStyle = '#333';
        ctx.fillRect(screenX + 4, screenY - this.height - 12, 24, 5);
        ctx.fillStyle = '#44ff44';
        ctx.fillRect(screenX + 4, screenY - this.height - 12, 24 * (this.hp / this.maxHp), 5);
        
        ctx.globalAlpha = 1.0;
    },
    
    // v1.4.4: 攻击特效 - 剑光效果和打击火花
    drawAttackEffect(screenX, screenY, swingAngle, weaponOffsetX, weaponOffsetY) {
        // 只有在挥动阶段才显示剑光
        if (this.attackPhase !== 'swing') return;
        
        // 剑光线条
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenX + 35 + weaponOffsetX, screenY - 30 + weaponOffsetY);
        ctx.lineTo(screenX + 60 + weaponOffsetX, screenY - 30 + weaponOffsetY);
        ctx.stroke();
        
        // 剑光扩散效果
        const gradient = ctx.createLinearGradient(screenX + 35, screenY - 38, screenX + 65, screenY - 22);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(screenX + 35 + weaponOffsetX, screenY - 38 + weaponOffsetY);
        ctx.lineTo(screenX + 65 + weaponOffsetX, screenY - 30 + weaponOffsetY);
        ctx.lineTo(screenX + 35 + weaponOffsetX, screenY - 22 + weaponOffsetY);
        ctx.closePath();
        ctx.fill();
    }
};
