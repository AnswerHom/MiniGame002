// MiniGame002 - 游戏主逻辑 v1.0.1
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏配置
const CONFIG = {
    width: 800,
    height: 450,
    groundY: 380,
    cameraOffset: 0
};

canvas.width = CONFIG.width;
canvas.height = CONFIG.height;

// 境界系统
const REALMS = [
    { name: '筑基', minLevel: 1 },
    { name: '金丹', minLevel: 5 },
    { name: '元婴', minLevel: 10 },
    { name: '化神', minLevel: 15 },
    { name: '炼虚', minLevel: 20 },
    { name: '合体', minLevel: 25 },
    { name: '大乘', minLevel: 30 },
    { name: '渡劫', minLevel: 35 }
];

function getRealm(level) {
    for (let i = REALMS.length - 1; i >= 0; i--) {
        if (level >= REALMS[i].minLevel) {
            return REALMS[i];
        }
    }
    return REALMS[0];
}

// 游戏状态
const game = {
    running: true,
    gameOver: false,
    cameraX: 0,
    lastTime: 0,
    enemies: [],
    expOrbs: [],
    particles: [],
    spawnTimer: 0,
    spawnInterval: 2000,
    groundY: CONFIG.groundY,
    distance: 0,
    clouds: [],
    stars: [],
    grass: []
};

// 初始化云雾
for (let i = 0; i < 8; i++) {
    game.clouds.push({
        x: Math.random() * 2000,
        y: 50 + Math.random() * 150,
        width: 100 + Math.random() * 150,
        speed: 10 + Math.random() * 20,
        opacity: 0.1 + Math.random() * 0.2
    });
}

// 初始化星星
for (let i = 0; i < 50; i++) {
    game.stars.push({
        x: Math.random() * CONFIG.width,
        y: Math.random() * (CONFIG.groundY - 100),
        size: 1 + Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2,
        speed: 1 + Math.random() * 3
    });
}

// 初始化灵草
for (let i = 0; i < 30; i++) {
    game.grass.push({
        x: i * 60 + Math.random() * 30,
        height: 8 + Math.random() * 12,
        sway: Math.random() * Math.PI * 2
    });
}

// 玩家
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
    attackSpeed: 1.0,
    attackCooldown: 0,
    attackRange: 80,
    exp: 0,
    requiredExp: 100,
    direction: 1,
    attacking: false,
    attackFrame: 0,
    color: '#00d4ff',
    // 闪避状态
    dodgeTimer: 0,
    isDodging: false,
    
    // 获取当前境界
    getRealm() {
        return getRealm(this.level);
    },
    
    // 升级
    levelUp() {
        this.level++;
        this.maxHp = 100 + (this.level - 1) * 20;
        this.hp = this.maxHp;
        this.attack += 2;
        this.requiredExp = 100 * this.level;
        createParticle(this.x, this.y - 30, 'gold', 20);
        createFloatingText(this.x, this.y - 50, `升级! Lv.${this.level}`, '#ffd700');
        
        // 境界突破提示
        const realm = this.getRealm();
        if (this.level > 1 && (this.level - 1) % 5 === 0) {
            createFloatingText(this.x, this.y - 70, `突破! ${realm.name}`, '#ff00ff');
        }
    },
    
    // 升级公式
    addExp(amount) {
        this.exp += amount;
        if (this.exp >= this.requiredExp) {
            this.exp -= this.requiredExp;
            this.levelUp();
        }
    },
    
    // 受伤触发闪避
    takeDamage() {
        if (this.isDodging) return false;
        
        this.isDodging = true;
        this.dodgeTimer = 0.5; // 0.5秒无敌
        return true;
    },
    
    // 攻击
    attackTarget(target) {
        if (this.attackCooldown <= 0) {
            this.attacking = true;
            this.attackFrame = 0;
            this.attackCooldown = 1 / this.attackSpeed;
            
            // 造成伤害
            const damage = this.attack;
            target.takeDamage(damage);
            
            // 攻击特效
            for (let i = 0; i < 5; i++) {
                createParticle(
                    target.x + target.width / 2,
                    target.y + target.height / 2,
                    '#fff', 3
                );
            }
        }
    },
    
    // 移动
    update(dt) {
        // 自动向右移动
        this.x += this.speed * dt;
        
        // 更新前行距离
        game.distance = Math.floor((this.x - 100) / 10);
        
        // 更新相机跟随
        CONFIG.cameraOffset = this.x - 150;
        
        // 闪避计时
        if (this.isDodging) {
            this.dodgeTimer -= dt;
            if (this.dodgeTimer <= 0) {
                this.isDodging = false;
            }
        }
        
        // 攻击冷却
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }
        
        // 攻击动画
        if (this.attacking) {
            this.attackFrame += dt * 10;
            if (this.attackFrame >= 1) {
                this.attacking = false;
            }
        }
    },
    
    // 绘制
    draw() {
        const screenX = this.x - CONFIG.cameraOffset;
        
        // 闪避状态半透明效果
        if (this.isDodging) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.3;
        }
        
        // 身体
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX, this.y - this.height, this.width, this.height);
        
        // 剑
        ctx.save();
        if (this.attacking) {
            // 攻击姿态
            ctx.translate(screenX + this.width, this.y - this.height / 2);
            ctx.rotate(-0.5 + this.attackFrame * 1.5);
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(0, -3, 40, 6);
            // 剑柄
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(-5, -3, 10, 6);
        } else {
            // 站立姿态 - 剑扛在肩上
            ctx.translate(screenX + this.width / 2, this.y - this.height / 2);
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(15, -20, 6, 30);
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(12, -3, 10, 6);
        }
        ctx.restore();
        
        ctx.globalAlpha = 1;
    },
    
    // 获取屏幕坐标
    getScreenX() {
        return this.x - CONFIG.cameraOffset;
    }
};

// 怪物类
class Enemy {
    constructor(x) {
        this.x = x;
        this.y = CONFIG.groundY;
        this.width = 40;
        this.height = 50;
        this.hp = 20;
        this.maxHp = 20;
        this.attack = 5;
        this.exp = 20;
        this.color = '#7b2d8e';
        this.type = '阴魂';
        this.attackCooldown = 0;
        this.attackRange = 30;
        this.damageFlash = 0;
        this.alive = true;
        this.attackFrame = 0;
        this.attacking = false;
    }
    
    takeDamage(damage) {
        this.hp -= damage;
        this.damageFlash = 0.2;
        
        // 伤害数字
        createFloatingText(this.x + this.width/2, this.y - this.height, `-${damage}`, '#ff4444');
        
        if (this.hp <= 0) {
            this.die();
        }
    }
    
    die() {
        this.alive = false;
        // 掉落经验球
        game.expOrbs.push(new ExpOrb(this.x + this.width/2, this.y - this.height/2, this.exp));
        // 死亡特效
        for (let i = 0; i < 10; i++) {
            createParticle(this.x + this.width/2, this.y - this.height/2, '#7b2d8e', 5);
        }
    }
    
    update(dt) {
        if (!this.alive) return;
        
        // 伤害闪烁计时
        if (this.damageFlash > 0) {
            this.damageFlash -= dt;
        }
        
        // 攻击冷却
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }
        
        // 攻击动画
        if (this.attacking) {
            this.attackFrame += dt * 8;
            if (this.attackFrame >= 1) {
                this.attacking = false;
            }
        }
        
        // 与玩家距离
        const dist = player.x - this.x;
        
        // 靠近玩家
        if (dist > 0 && dist < 300) {
            this.x += 50 * dt;
        }
        
        // 攻击玩家
        if (dist > 0 && dist < this.attackRange + player.width/2) {
            if (this.attackCooldown <= 0) {
                this.attacking = true;
                this.attackFrame = 0;
                this.attackCooldown = 1.5;
                
                // 只有玩家不在闪避状态时才扣血
                if (player.takeDamage()) {
                    player.hp -= this.attack;
                    createFloatingText(player.x, player.y - player.height, `-${this.attack}`, '#ff0000');
                    createParticle(player.x + player.width/2, player.y - player.height/2, '#ff0000', 5);
                } else {
                    createFloatingText(player.x, player.y - player.height, '闪避!', '#00ffff');
                }
            }
        }
    }
    
    draw() {
        if (!this.alive) return;
        
        const screenX = this.x - CONFIG.cameraOffset;
        
        // 身体（阴魂形态）
        ctx.fillStyle = this.damageFlash > 0 ? '#ffffff' : this.color;
        
        // 阴魂形状 - 上宽下窄
        ctx.beginPath();
        ctx.moveTo(screenX, this.y - this.height);
        ctx.quadraticCurveTo(screenX + this.width/2, this.y - this.height - 20, screenX + this.width, this.y - this.height);
        ctx.lineTo(screenX + this.width - 5, this.y);
        ctx.lineTo(screenX + this.width/2, this.y - 10);
        ctx.lineTo(screenX + 5, this.y);
        ctx.closePath();
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(screenX + 12, this.y - this.height + 15, 4, 0, Math.PI * 2);
        ctx.arc(screenX + this.width - 12, this.y - this.height + 15, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 血条
        const hpPercent = this.hp / this.maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(screenX, this.y - this.height - 15, this.width, 5);
        ctx.fillStyle = hpPercent > 0.5 ? '#44ff44' : '#ff4444';
        ctx.fillRect(screenX, this.y - this.height - 15, this.width * hpPercent, 5);
    }
}

// 经验球
class ExpOrb {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.radius = 8;
        this.collected = false;
        this.floatOffset = Math.random() * Math.PI * 2;
    }
    
    update(dt) {
        // 浮动动画
        this.floatOffset += dt * 3;
        
        // 吸引向玩家
        const dx = player.x + player.width/2 - this.x;
        const dy = (player.y - player.height/2) - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 100) {
            this.x += dx * 5 * dt;
            this.y += dy * 5 * dt;
        }
        
        // 收集
        if (dist < 20) {
            this.collected = true;
            player.addExp(this.value);
            createFloatingText(player.x, player.y - 60, `+${this.value} EXP`, '#ffd700');
        }
    }
    
    draw() {
        const screenX = this.x - CONFIG.cameraOffset;
        const floatY = Math.sin(this.floatOffset) * 3;
        
        // 光晕
        const gradient = ctx.createRadialGradient(screenX, this.y + floatY, 0, screenX, this.y + floatY, this.radius * 2);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, this.y + floatY, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 核心
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(screenX, this.y + floatY, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 粒子效果
class Particle {
    constructor(x, y, color, size) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 200;
        this.vy = (Math.random() - 0.5) * 200 - 100;
        this.color = color;
        this.size = size;
        this.life = 1;
        this.decay = 2;
    }
    
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 300 * dt; // 重力
        this.life -= this.decay * dt;
    }
    
    draw() {
        const screenX = this.x - CONFIG.cameraOffset;
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// 浮动文字
class FloatingText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 1;
        this.vy = -50;
    }
    
    update(dt) {
        this.y += this.vy * dt;
        this.life -= dt;
    }
    
    draw() {
        const screenX = this.x - CONFIG.cameraOffset;
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.font = 'bold 16px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, screenX, this.y);
        ctx.globalAlpha = 1;
    }
}

// 创建粒子
function createParticle(x, y, color, size) {
    game.particles.push(new Particle(x, y, color, size));
}

// 创建浮动文字
function createFloatingText(x, y, text, color) {
    game.particles.push(new FloatingText(x, y, text, color));
}

// 生成怪物
function spawnEnemy() {
    const x = player.x + 400 + Math.random() * 200;
    game.enemies.push(new Enemy(x));
}

// 更新游戏
function update(dt) {
    if (game.gameOver) return;
    
    // 玩家更新
    player.update(dt);
    
    // 相机限制
    if (CONFIG.cameraOffset < 0) CONFIG.cameraOffset = 0;
    
    // 怪物生成
    game.spawnTimer += dt * 1000;
    if (game.spawnTimer >= game.spawnInterval) {
        spawnEnemy();
        game.spawnTimer = 0;
    }
    
    // 怪物更新
    game.enemies.forEach(enemy => enemy.update(dt));
    
    // 玩家攻击范围内的敌人
    game.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        const dist = Math.abs((player.x + player.width/2) - (enemy.x + enemy.width/2));
        if (dist < player.attackRange) {
            player.attackTarget(enemy);
        }
    });
    
    // 清理死亡怪物
    game.enemies = game.enemies.filter(e => e.alive);
    
    // 经验球更新
    game.expOrbs.forEach(orb => orb.update(dt));
    game.expOrbs = game.expOrbs.filter(orb => !orb.collected);
    
    // 粒子更新
    game.particles.forEach(p => p.update(dt));
    game.particles = game.particles.filter(p => p.life > 0);
    
    // 云雾更新
    game.clouds.forEach(cloud => {
        cloud.x += cloud.speed * dt;
        if (cloud.x > player.x + CONFIG.width) {
            cloud.x = player.x - cloud.width;
        }
    });
    
    // 星星闪烁
    game.stars.forEach(star => {
        star.twinkle += star.speed * dt;
    });
    
    // 灵草摇摆
    game.grass.forEach(grass => {
        grass.sway += dt * 2;
    });
    
    // 游戏结束检测
    if (player.hp <= 0) {
        player.hp = 0;
        game.gameOver = true;
    }
}

// 绘制背景
function drawBackground() {
    // 深紫色修仙风格天空
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
    gradient.addColorStop(0, '#1a0a2e');
    gradient.addColorStop(0.4, '#2d1b4e');
    gradient.addColorStop(0.7, '#1a3a5c');
    gradient.addColorStop(1, '#0f2027');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    // 星星
    game.stars.forEach(star => {
        const alpha = 0.3 + Math.sin(star.twinkle) * 0.3;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    // 云雾
    game.clouds.forEach(cloud => {
        const screenX = cloud.x - CONFIG.cameraOffset * 0.2;
        ctx.globalAlpha = cloud.opacity;
        ctx.fillStyle = '#4a3f6b';
        ctx.beginPath();
        ctx.ellipse(screenX, cloud.y, cloud.width / 2, 30, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    // 仙剑宗风格山脉
    ctx.fillStyle = '#1a2a3a';
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.groundY - 50);
    for (let i = 0; i <= CONFIG.width; i += 50) {
        const offset = Math.sin((i + CONFIG.cameraOffset * 0.3) * 0.01) * 40;
        ctx.lineTo(i, CONFIG.groundY - 90 + offset);
    }
    ctx.lineTo(CONFIG.width, CONFIG.groundY);
    ctx.lineTo(0, CONFIG.groundY);
    ctx.closePath();
    ctx.fill();
    
    // 山脉细节
    ctx.fillStyle = '#15253a';
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.groundY - 30);
    for (let i = 0; i <= CONFIG.width; i += 30) {
        const offset = Math.sin((i + CONFIG.cameraOffset * 0.5) * 0.02) * 25;
        ctx.lineTo(i, CONFIG.groundY - 60 + offset);
    }
    ctx.lineTo(CONFIG.width, CONFIG.groundY);
    ctx.lineTo(0, CONFIG.groundY);
    ctx.closePath();
    ctx.fill();
    
    // 地面
    ctx.fillStyle = '#1a2f25';
    ctx.fillRect(0, CONFIG.groundY, CONFIG.width, CONFIG.height - CONFIG.groundY);
    
    // 灵草
    game.grass.forEach(grass => {
        const screenX = ((grass.x - CONFIG.cameraOffset) % (CONFIG.width + 200)) - 100;
        if (screenX > -20 && screenX < CONFIG.width + 20) {
            const sway = Math.sin(grass.sway) * 3;
            ctx.fillStyle = '#2d4a3a';
            ctx.beginPath();
            ctx.moveTo(screenX, CONFIG.groundY);
            ctx.quadraticCurveTo(
                screenX + sway, 
                CONFIG.groundY - grass.height / 2, 
                screenX + sway * 1.5, 
                CONFIG.groundY - grass.height
            );
            ctx.lineTo(screenX + sway * 1.5 + 2, CONFIG.groundY - grass.height + 2);
            ctx.quadraticCurveTo(
                screenX + sway + 1, 
                CONFIG.groundY - grass.height / 2, 
                screenX + 3, 
                CONFIG.groundY
            );
            ctx.fill();
        }
    });
}

// 绘制UI
function drawUI() {
    // 经验条
    const expPercent = player.exp / player.requiredExp;
    ctx.fillStyle = '#333';
    ctx.fillRect(20, 20, 200, 20);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(20, 20, 200 * expPercent, 20);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 200, 20);
    
    // 等级文字
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Microsoft YaHei';
    ctx.textAlign = 'left';
    ctx.fillText(`Lv.${player.level}`, 25, 35);
    
    // 经验文字
    ctx.textAlign = 'right';
    ctx.fillText(`${player.exp}/${player.requiredExp}`, 215, 35);
    
    // 血条
    const hpPercent = Math.max(0, player.hp) / player.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(20, 45, 200, 15);
    ctx.fillStyle = hpPercent > 0.3 ? '#44ff44' : '#ff4444';
    ctx.fillRect(20, 45, 200 * hpPercent, 15);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(20, 45, 200, 15);
    
    // 血量文字
    ctx.fillStyle = '#fff';
    ctx.font = '12px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.max(0, player.hp)}/${player.maxHp}`, 120, 56);
    
    // 攻击力
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Microsoft YaHei';
    ctx.textAlign = 'left';
    ctx.fillText(`攻击: ${player.attack}`, 230, 35);
    
    // 右上角境界显示
    const realm = player.getRealm();
    ctx.fillStyle = '#ff00ff';
    ctx.font = 'bold 16px Microsoft YaHei';
    ctx.textAlign = 'right';
    ctx.fillText(`境界: ${realm.name}`, CONFIG.width - 20, 30);
    
    // 距离显示
    ctx.fillStyle = '#00ffff';
    ctx.font = '14px Microsoft YaHei';
    ctx.fillText(`距离: ${game.distance}m`, CONFIG.width - 20, 50);
    
    // 闪避状态提示
    if (player.isDodging) {
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 20px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('闪避中!', CONFIG.width / 2, 50);
    }
    
    // 游戏结束
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
        
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 48px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', CONFIG.width/2, CONFIG.height/2 - 20);
        
        ctx.fillStyle = '#fff';
        ctx.font = '20px Microsoft YaHei';
        ctx.fillText(`最终等级: Lv.${player.level}  ${realm.name}`, CONFIG.width/2, CONFIG.height/2 + 20);
        ctx.fillText(`前行距离: ${game.distance}m`, CONFIG.width/2, CONFIG.height/2 + 50);
        ctx.fillText(`重新刷新页面重新开始`, CONFIG.width/2, CONFIG.height/2 + 80);
    }
}

// 绘制游戏
function draw() {
    drawBackground();
    
    // 绘制经验球
    game.expOrbs.forEach(orb => orb.draw());
    
    // 绘制怪物
    game.enemies.forEach(enemy => enemy.draw());
    
    // 绘制玩家
    player.draw();
    
    // 绘制粒子
    game.particles.forEach(p => p.draw());
    
    // 绘制UI
    drawUI();
}

// 游戏主循环
function gameLoop(timestamp) {
    const dt = Math.min((timestamp - game.lastTime) / 1000, 0.1);
    game.lastTime = timestamp;
    
    update(dt);
    draw();
    
    if (game.running) {
        requestAnimationFrame(gameLoop);
    }
}

// 启动游戏
function startGame() {
    game.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// 页面加载完成后启动
window.onload = startGame;
