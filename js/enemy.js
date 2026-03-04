// ===== v1.0.2 怪物模块 =====

// v1.0.2: 小怪属性修正（速度单位：px/秒）
const ENEMY_TYPES = {
    // 阴魂：白色半透明鬼火，淡淡光晕，圆形
    阴魂: { hp: 20, attack: 5, exp: 10, speed: 50, color: '#e2e8f0', size: 25, realmColor: '#718096' },
    // 妖狼：灰色毛皮，四足奔跑形态
    妖狼: { hp: 30, attack: 8, exp: 15, speed: 80, color: '#718096', size: 35, realmColor: '#718096' },
    // 毒蛛：黑色背甲，红色斑点，8条腿
    毒蛛: { hp: 25, attack: 10, exp: 12, speed: 40, color: '#1a202c', size: 30, realmColor: '#1a202c' },
    // 僵尸：灰绿色皮肤，双臂平伸
    僵尸: { hp: 40, attack: 12, exp: 20, speed: 30, color: '#68d391', size: 40, realmColor: '#68d391' }
};

// v1.0.2: 境界颜色区分
const REALM_COLORS = {
    练气: '#718096',
    筑基: '#48bb78',
    金丹: '#4299e1',
    元婴: '#9f7aea'
};

class Enemy {
    constructor(x, type, realm = '练气') {
        const config = ENEMY_TYPES[type] || ENEMY_TYPES['阴魂'];
        this.x = x;
        this.y = CONFIG.groundY;
        this.width = config.size;
        this.height = config.size;
        this.type = type;
        this.realm = realm;
        this.hp = config.hp;
        this.maxHp = config.hp;
        this.attack = config.attack;
        this.exp = config.exp;
        this.speed = config.speed;
        this.baseColor = config.color;
        this.size = config.size;
        this.alive = true;
        this.attackCooldown = 0;
        this.hitFlash = 0;  // v1.0.2: 受击闪烁
        
        // v1.0.2: 境界颜色
        this.realmColor = REALM_COLORS[realm] || REALM_COLORS['练气'];
    }

    update(dt) {
        if (!this.alive) return;
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.hitFlash > 0) this.hitFlash -= dt;
        
        const dist = player.x - this.x;
        
        // v1.0.2: 战斗逻辑 - 主角在攻击范围内时停下
        if (dist > 0 && dist < player.attackRange) {
            player.isMoving = false;
            return;
        } else {
            player.isMoving = true;
        }
        
        if (dist > 0 && dist < 300) this.x += this.speed * dt;
        
        if (Math.abs(dist) < player.attackRange && this.attackCooldown <= 0) {
            this.attackPlayer();
        }
    }

    attackPlayer() {
        this.attackCooldown = 1;
        const died = player.takeDamage(this.attack);
        if (died) game.gameOver = true;
    }

    takeDamage(damage) {
        this.hp -= damage;
        this.hitFlash = 0.1;
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
            player.exp += this.exp;
            game.killCount++;
            return true;
        }
        return false;
    }

    // v1.0.2: 小怪形象落地
    draw() {
        if (!this.alive) return;
        const screenX = this.x - CONFIG.cameraOffset;
        const screenY = this.y;
        
        // v1.0.2: 受击闪烁
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.5;
        }
        
        switch(this.type) {
            case '阴魂':
                this.drawGhost(screenX, screenY);
                break;
            case '妖狼':
                this.drawWolf(screenX, screenY);
                break;
            case '毒蛛':
                this.drawSpider(screenX, screenY);
                break;
            case '僵尸':
                this.drawZombie(screenX, screenY);
                break;
        }
        
        // 血条
        ctx.fillStyle = '#333';
        ctx.fillRect(screenX, screenY - this.height - 10, this.width, 4);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(screenX, screenY - this.height - 10, this.width * (this.hp / this.maxHp), 4);
        
        ctx.globalAlpha = 1.0;
    }
    
    // v1.0.2: 阴魂 - 白色半透明鬼火，淡淡光晕，圆形
    drawGhost(screenX, screenY) {
        // 光晕
        ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
        ctx.beginPath();
        ctx.arc(screenX + this.size/2, screenY - this.size/2, this.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // 主体
        ctx.fillStyle = this.baseColor;
        ctx.beginPath();
        ctx.arc(screenX + this.size/2, screenY - this.size/2, this.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#000';
        ctx.fillRect(screenX + 8, screenY - 15, 3, 3);
        ctx.fillRect(screenX + 14, screenY - 15, 3, 3);
    }
    
    // v1.0.2: 妖狼 - 灰色毛皮，四足奔跑形态
    drawWolf(screenX, screenY) {
        // 身体
        ctx.fillStyle = this.baseColor;
        ctx.fillRect(screenX, screenY - 20, this.size, 20);
        
        // 头部
        ctx.fillRect(screenX + this.size - 10, screenY - 25, 15, 15);
        
        // 四足
        ctx.fillRect(screenX + 2, screenY - 5, 6, 8);
        ctx.fillRect(screenX + this.size - 12, screenY - 5, 6, 8);
        
        // 尾巴
        ctx.fillRect(screenX - 8, screenY - 18, 10, 4);
        
        // 眼睛
        ctx.fillStyle = '#f00';
        ctx.fillRect(screenX + this.size - 5, screenY - 22, 3, 3);
    }
    
    // v1.0.2: 毒蛛 - 黑色背甲，红色斑点，8条腿
    drawSpider(screenX, screenY) {
        // 身体
        ctx.fillStyle = this.baseColor;
        ctx.beginPath();
        ctx.ellipse(screenX + this.size/2, screenY - this.size/2, this.size/2, this.size/2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 红色斑点
        ctx.fillStyle = '#e53e3e';
        ctx.beginPath();
        ctx.arc(screenX + this.size/2, screenY - this.size/2, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 8条腿
        ctx.strokeStyle = this.baseColor;
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            // 左侧腿
            ctx.beginPath();
            ctx.moveTo(screenX + 5, screenY - this.size/2);
            ctx.lineTo(screenX - 8, screenY - this.size/2 - 8 + i * 6);
            ctx.stroke();
            // 右侧腿
            ctx.beginPath();
            ctx.moveTo(screenX + this.size - 5, screenY - this.size/2);
            ctx.lineTo(screenX + this.size + 8, screenY - this.size/2 - 8 + i * 6);
            ctx.stroke();
        }
        
        // 眼睛
        ctx.fillStyle = '#f00';
        ctx.fillRect(screenX + 8, screenY - this.size - 2, 3, 3);
        ctx.fillRect(screenX + 14, screenY - this.size - 2, 3, 3);
    }
    
    // v1.0.2: 僵尸 - 灰绿色皮肤，双臂平伸
    drawZombie(screenX, screenY) {
        // 身体
        ctx.fillStyle = this.baseColor;
        ctx.fillRect(screenX + 5, screenY - 30, this.size - 10, 30);
        
        // 头部
        ctx.beginPath();
        ctx.arc(screenX + this.size/2, screenY - 35, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // 双臂平伸
        ctx.fillRect(screenX - 8, screenY - 25, 15, 6);
        ctx.fillRect(screenX + this.size - 5, screenY - 25, 15, 6);
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.fillRect(screenX + 10, screenY - 38, 4, 4);
        ctx.fillRect(screenX + 18, screenY - 38, 4, 4);
    }
}

function spawnEnemy() {
    const types = Object.keys(ENEMY_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    game.enemies.push(new Enemy(player.x + 200 + Math.random() * 200, type));
}
