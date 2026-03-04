// ===== v1.0.2 玩家模块 =====

const player = {
    x: 100,
    y: CONFIG.groundY,
    width: 40,
    height: 40,  // v1.0.2: 简约小人形，站立高度约40px
    level: 1,
    hp: 100,
    maxHp: 100,
    attack: 10,
    speed: 120,  // v1.0.2: 2px/帧 @60fps = 120px/秒
    attackCooldown: 0,
    attackRange: 80,  // v1.0.2: 60px → 80px
    attackInterval: 1.2,  // v1.0.2: 攻击间隔1.2秒
    critRate: 0.05,  // v1.0.2: 5%暴击率
    critDamage: 2.0,  // v1.0.2: 200%暴击伤害
    exp: 0,
    requiredExp: 100,
    attacking: false,
    attackFrame: 0,
    hitFlash: 0,  // v1.0.2: 受击闪烁计时
    isMoving: true,  // v1.0.2: 是否移动
    // v1.0.2: 美术形象
    robeColor: '#38b2ac',  // 青色长袍
    hairColor: '#1a202c',  // 深黑色发型

    getRealm() {
        return getRealm(this.level);
    },

    update(dt) {
        // 冷却
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }
        if (this.attacking) {
            this.attackFrame += dt * 10;
            if (this.attackFrame >= 1) {
                this.attacking = false;
            }
        }
        // v1.0.2: 受击闪烁计时
        if (this.hitFlash > 0) {
            this.hitFlash -= dt;
        }
        
        // v1.0.2: 战斗逻辑 - 遇怪停下（在main.js中检查）
        if (this.isMoving) {
            this.x += this.speed * dt;
        }
        
        // 更新相机
        CONFIG.cameraOffset = this.x - 150;
    },

    // v1.0.2: 暴击系统
    attackTarget(enemy) {
        if (this.attackCooldown <= 0) {
            this.attacking = true;
            this.attackFrame = 0;
            this.attackCooldown = this.attackInterval;
            
            // v1.0.2: 暴击判定
            const isCrit = Math.random() < this.critRate;
            const damageMult = isCrit ? this.critDamage : 1.0;
            const damage = Math.floor(this.attack * damageMult);
            
            // v1.0.2: 伤害数字（暴击显示）
            game.addDamageNumber(enemy.x, enemy.y - enemy.height, damage, isCrit);
            
            enemy.takeDamage(damage);
        }
    },

    takeDamage(damage) {
        this.hp -= damage;
        this.hitFlash = 0.2;  // v1.0.2: 受击闪烁0.2秒
        if (this.hp <= 0) {
            this.hp = 0;
            return true; // 死亡
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
    },

    // v1.0.2: 美术形象落地
    draw() {
        const screenX = this.x - CONFIG.cameraOffset;
        const screenY = this.y;
        
        // v1.0.2: 受击闪烁效果
        if (this.hitFlash > 0 && Math.floor(this.hitFlash * 20) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // v1.0.2: 青色长袍身体
        ctx.fillStyle = this.robeColor;
        ctx.fillRect(screenX, screenY - this.height, this.width, this.height);
        
        // v1.0.2: 深黑色发型 - 束发道士头
        ctx.fillStyle = this.hairColor;
        ctx.fillRect(screenX + 5, screenY - this.height - 12, 30, 14);
        // 发髻
        ctx.beginPath();
        ctx.arc(screenX + 20, screenY - this.height - 10, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.fillRect(screenX + 25, screenY - 35, 6, 6);
        
        // v1.0.2: 武器 - 利剑，背负身后
        ctx.fillStyle = '#888';
        // 剑柄
        ctx.fillRect(screenX - 5, screenY - 30, 8, 4);
        // 剑身
        ctx.fillRect(screenX - 8, screenY - 45, 4, 18);
        
        // 血条
        ctx.fillStyle = '#333';
        ctx.fillRect(screenX, screenY - this.height - 20, this.width, 6);
        ctx.fillStyle = '#44ff44';
        ctx.fillRect(screenX, screenY - this.height - 20, this.width * (this.hp / this.maxHp), 6);
        
        // v1.0.2: 攻击动画 - 挥剑动作（向右挥动）
        if (this.attacking) {
            ctx.fillStyle = '#ff6600';
            // 剑挥动
            const swingAngle = this.attackFrame * Math.PI / 2;
            ctx.save();
            ctx.translate(screenX + this.width, screenY - 25);
            ctx.rotate(swingAngle);
            ctx.fillRect(0, -2, 35, 4);
            ctx.restore();
        }
        
        ctx.globalAlpha = 1.0;
    }
};
