// ===== v1.0.0 玩家模块 =====

const player = {
    x: 100,
    y: CONFIG.groundY,
    width: 40,
    height: 60,
    level: 1,
    hp: 100,
    maxHp: 100,
    attack: 10,
    speed: 150,
    attackCooldown: 0,
    attackRange: 60,
    exp: 0,
    requiredExp: 100,
    attacking: false,
    attackFrame: 0,
    color: '#00d4ff',

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
        
        // 移动
        this.x += this.speed * dt;
        
        // 更新相机
        CONFIG.cameraOffset = this.x - 150;
    },

    attack(enemy) {
        if (this.attackCooldown <= 0) {
            this.attacking = true;
            this.attackFrame = 0;
            this.attackCooldown = 1;
            
            // 伤害计算
            const damage = this.attack;
            enemy.takeDamage(damage);
        }
    },

    takeDamage(damage) {
        this.hp -= damage;
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

    draw() {
        const screenX = this.x - CONFIG.cameraOffset;
        
        // 身体
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX, this.y - this.height, this.width, this.height);
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.fillRect(screenX + 25, this.y - 50, 8, 8);
        
        // 血条
        ctx.fillStyle = '#333';
        ctx.fillRect(screenX, this.y - this.height - 15, this.width, 6);
        ctx.fillStyle = '#44ff44';
        ctx.fillRect(screenX, this.y - this.height - 15, this.width * (this.hp / this.maxHp), 6);
        
        // 攻击动画
        if (this.attacking) {
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(screenX + this.width, this.y - this.height / 2 - 5, 30, 10);
        }
    }
};
