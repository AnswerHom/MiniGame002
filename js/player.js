// v1.1.0: 玩家模块 - Q版水墨风形象

const player = {
    x: 100,
    y: CONFIG.groundY,
    width: 32,   // v1.1.0: 宽度32px
    height: 48,  // v1.1.0: 高度48px，头身比1:1.5
    level: 1,
    hp: 100,
    maxHp: 100,
    attack: 10,
    speed: 80,   // v1.2.3: 80px/秒（固定值）
    attackCooldown: 0,
    attackRange: 80,
    attackInterval: 1.2,
    critRate: 0.05,
    critDamage: 2.0,
    exp: 0,
    requiredExp: 100,
    attacking: false,
    attackFrame: 0,
    hitFlash: 0,
    isMoving: true,
    
    // v1.2.0: Q版水墨风配色（修正后与需求文档一致）
    robeColor: '#f0f5f9',      // 月白色长袍
    robeAccentColor: '#81e6d9', // 淡青色衣领袖口
    hairColor: '#1a202c',      // 墨黑头发
    hairAccentColor: '#fc8181', // 红色发带
    weaponColor: '#c0c0c0',    // 银色剑身
    weaponAccentColor: '#fc8181', // 红色剑穗
    
    // v1.1.0: 动画相关
    idleTime: 0,               // 待机时间
    idleFloatOffset: 0,        // 浮动偏移量
    
    getRealm() {
        return getRealm(this.level);
    },

    update(dt) {
        // 冷却
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }
        if (this.attacking) {
            this.attackFrame += dt * 15; // v1.1.0: 加快攻击动画速度
            if (this.attackFrame >= 1) {
                this.attacking = false;
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
        
        // 更新相机
        CONFIG.cameraOffset = this.x - 150;
    },

    // v1.1.0: 暴击系统
    attackTarget(enemy) {
        if (this.attackCooldown <= 0) {
            this.attacking = true;
            this.attackFrame = 0;
            this.attackCooldown = this.attackInterval;
            
            const isCrit = Math.random() < this.critRate;
            const damageMult = isCrit ? this.critDamage : 1.0;
            const damage = Math.floor(this.attack * damageMult);
            
            game.addDamageNumber(enemy.x, enemy.y - enemy.height, damage, isCrit);
            
            // v1.2.8: 暴击时添加特效
            if (isCrit) {
                game.addCritEffect(enemy.x, enemy.y - enemy.height / 2);
            }
            
            enemy.takeDamage(damage);
            
            // v1.2.7: 攻击音效
            game.playSound('attack');
        }
    },

    takeDamage(damage) {
        this.hp -= damage;
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
        this.requiredExp = Math.floor(this.requiredExp * 1.5);
        this.maxHp = Math.floor(this.maxHp * 1.2);
        this.hp = this.maxHp;
        this.attack = Math.floor(this.attack * 1.15);
        // v1.2.7: 升级音效
        game.playSound('levelup');
        // v1.2.8: 升级特效
        game.addLevelUpEffect(this.x, this.y - this.height);
    },

    // v1.1.0: Q版水墨风角色造型
    draw() {
        const screenX = this.x - CONFIG.cameraOffset;
        const screenY = this.y + this.idleFloatOffset; // v1.1.0: 浮动效果
        
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
        ctx.fillStyle = this.hairColor;
        ctx.beginPath();
        ctx.arc(screenX + 16, screenY - 42, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // v1.1.0: 红色发带
        ctx.fillStyle = this.hairAccentColor;
        ctx.fillRect(screenX + 4, screenY - 48, 24, 4);
        // 发带飘带
        ctx.beginPath();
        ctx.moveTo(screenX + 4, screenY - 44);
        ctx.quadraticCurveTo(screenX - 2, screenY - 38, screenX + 2, screenY - 32);
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.hairAccentColor;
        ctx.stroke();
        
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
        // 剑柄
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(screenX + 28, screenY - 28, 6, 4);
        // 剑穗
        ctx.fillStyle = this.weaponAccentColor;
        ctx.beginPath();
        ctx.moveTo(screenX + 30, screenY - 24);
        ctx.quadraticCurveTo(screenX + 35, screenY - 18, screenX + 32, screenY - 12);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 剑身
        ctx.fillStyle = this.weaponColor;
        ctx.fillRect(screenX + 30, screenY - 44, 3, 18);
        // 剑刃光芒
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.6;
        ctx.fillRect(screenX + 31, screenY - 43, 1, 16);
        ctx.globalAlpha = 1.0;
        
        // v1.1.0: 攻击动画 - 武器挥动+淡白色残影
        if (this.attacking) {
            const swingAngle = this.attackFrame * Math.PI / 2;
            
            // 残影效果
            ctx.globalAlpha = 0.3;
            for (let i = 1; i <= 3; i++) {
                ctx.save();
                ctx.translate(screenX + 16, screenY - 30);
                ctx.rotate(swingAngle - i * 0.15);
                ctx.fillStyle = '#fff';
                ctx.fillRect(10, -1, 25, 3);
                ctx.restore();
            }
            ctx.globalAlpha = 1.0;
            
            // 实际剑挥动
            ctx.save();
            ctx.translate(screenX + 16, screenY - 30);
            ctx.rotate(swingAngle);
            // 剑
            ctx.fillStyle = this.weaponColor;
            ctx.fillRect(10, -1.5, 28, 3);
            // 剑刃
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.7;
            ctx.fillRect(12, -0.5, 24, 1);
            ctx.globalAlpha = 1.0;
            ctx.restore();
        }
        
        // 血条
        ctx.fillStyle = '#333';
        ctx.fillRect(screenX + 4, screenY - this.height - 12, 24, 5);
        ctx.fillStyle = '#44ff44';
        ctx.fillRect(screenX + 4, screenY - this.height - 12, 24 * (this.hp / this.maxHp), 5);
        
        ctx.globalAlpha = 1.0;
    }
};
