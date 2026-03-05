// ===== v1.2.9 怪物模块 =====

// v1.2.9: 怪物属性（含攻击距离、动画、安全距离）
const ENEMY_TYPES = {
    // 阴魂：白色半透明鬼火，淡淡光晕，圆形
    阴魂: { hp: 20, attack: 5, exp: 10, speed: 20, attackDistance: 40, stopDistance: 60, color: '#e2e8f0', size: 25, realmColor: '#718096' },
    // 妖狼：灰色毛皮，四足奔跑形态
    妖狼: { hp: 30, attack: 8, exp: 15, speed: 50, attackDistance: 50, stopDistance: 70, color: '#718096', size: 35, realmColor: '#718096' },
    // 毒蛛：黑色背甲，红色斑点，8条腿
    毒蛛: { hp: 25, attack: 10, exp: 12, speed: 25, attackDistance: 35, stopDistance: 55, color: '#1a202c', size: 30, realmColor: '#1a202c' },
    // 僵尸：灰绿色皮肤，双臂平伸
    僵尸: { hp: 40, attack: 12, exp: 20, speed: 20, attackDistance: 45, stopDistance: 65, color: '#68d391', size: 40, realmColor: '#68d391' },
    // v1.2.9: 新增怪物
    // 蝴蝶精：彩色翅膀，速度快，血量低
    蝴蝶精: { hp: 15, attack: 4, exp: 8, speed: 60, attackDistance: 30, stopDistance: 50, color: '#f9a8d4', size: 20, realmColor: '#f9a8d4' },
    // 毒蛇：绿色身体，三角形头部
    毒蛇: { hp: 25, attack: 15, exp: 15, speed: 35, attackDistance: 25, stopDistance: 45, color: '#22c55e', size: 35, realmColor: '#22c55e' },
    // 骷髅兵：白色骨架
    骷髅: { hp: 45, attack: 14, exp: 22, speed: 25, attackDistance: 40, stopDistance: 60, color: '#f5f5f4', size: 38, realmColor: '#f5f5f4' },
    // 蝙蝠：黑色翅膀倒挂
    蝙蝠: { hp: 18, attack: 6, exp: 10, speed: 40, attackDistance: 35, stopDistance: 55, color: '#1a1a1a', size: 28, realmColor: '#1a1a1a' },
    // 魔藤：紫色藤蔓，地面生长
    魔藤: { hp: 35, attack: 18, exp: 18, speed: 15, attackDistance: 20, stopDistance: 40, color: '#805ad5', size: 32, realmColor: '#805ad5' },
    // 冰魔：蓝白色寒冰形态
    冰魔: { hp: 50, attack: 10, exp: 25, speed: 18, attackDistance: 50, stopDistance: 75, color: '#63b3ed', size: 42, realmColor: '#63b3ed' }
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
            // v1.2.7: 怪物死亡音效
            game.playSound('hit');
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
    drawSkeleton(screenX, screenY, floatOffset) {
        // 行走摇摆动画
        const bodySway = Math.sin(this.animTime * 2) * 2;
        
        // 头部（骷髅头）
        ctx.fillStyle = this.baseColor;
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
        
        // 手臂 - 持武器前伸
        ctx.fillRect(screenX + this.size/2 - 15, screenY - 20 + floatOffset, 12, 4);
        // 武器（骨剑）
        ctx.fillStyle = '#d4d4d4';
        ctx.fillRect(screenX - 5, screenY - 30 + floatOffset, 4, 20);
        
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
}

function spawnEnemy() {
    const types = Object.keys(ENEMY_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    
    // v1.2.6: 开局时在玩家附近生成怪物，后续怪物从屏幕右侧生成
    let spawnX;
    if (game.enemies.length === 0) {
        // 第一个怪物在玩家前方100-300像素生成
        spawnX = player.x + 100 + Math.random() * 200;
    } else {
        // 后续怪物从屏幕右侧外生成
        spawnX = player.x + CONFIG.width + Math.random() * 200;
    }
    
    game.enemies.push(new Enemy(spawnX, type));
}
