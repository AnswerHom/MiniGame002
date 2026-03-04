// ===== v1.2.4 怪物模块 =====

// v1.2.4: 怪物属性（含攻击距离、动画）
const ENEMY_TYPES = {
    // 阴魂：白色半透明鬼火，淡淡光晕，圆形
    阴魂: { hp: 20, attack: 5, exp: 10, speed: 20, attackDistance: 40, color: '#e2e8f0', size: 25, realmColor: '#718096' },
    // 妖狼：灰色毛皮，四足奔跑形态
    妖狼: { hp: 30, attack: 8, exp: 15, speed: 50, attackDistance: 50, color: '#718096', size: 35, realmColor: '#718096' },
    // 毒蛛：黑色背甲，红色斑点，8条腿
    毒蛛: { hp: 25, attack: 10, exp: 12, speed: 25, attackDistance: 35, color: '#1a202c', size: 30, realmColor: '#1a202c' },
    // 僵尸：灰绿色皮肤，双臂平伸
    僵尸: { hp: 40, attack: 12, exp: 20, speed: 20, attackDistance: 45, color: '#68d391', size: 40, realmColor: '#68d391' }
};

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
        this.hp = config.hp;
        this.maxHp = config.hp;
        this.attack = config.attack;
        this.exp = config.exp;
        this.speed = config.speed;
        this.attackDistance = config.attackDistance;  // v1.2.3: 怪物攻击距离
        this.baseColor = config.color;
        this.size = config.size;
        this.alive = true;
        this.attackCooldown = 0;
        this.hitFlash = 0;  // v1.0.2: 受击闪烁
        
        // v1.2.4: 动画相关
        this.animTime = Math.random() * Math.PI * 2;  // 随机初始相位
        this.isAttacking = false;
        this.attackAnimTime = 0;
        
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
        if (Math.abs(dist) < this.attackDistance && this.attackCooldown <= 0) {
            this.attackPlayer();
            return;
        }
        
        // 怪物向玩家移动
        if (dist > 0 && dist < 300) this.x += this.speed * dt;
    }

    attackPlayer() {
        this.attackCooldown = 1;
        this.isAttacking = true;
        this.attackAnimTime = 0.3;  // v1.2.4: 攻击动画持续0.3秒
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
        }
        
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
}

function spawnEnemy() {
    const types = Object.keys(ENEMY_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    game.enemies.push(new Enemy(player.x + 200 + Math.random() * 200, type));
}
