<<<<<<< HEAD
// MiniGame002 v1.0.0 - 简单修仙推图游戏
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CONFIG = { width: 800, height: 450, groundY: 380 };
canvas.width = CONFIG.width;
canvas.height = CONFIG.height;

// 游戏状态
=======
>>>>>>> 16e6a1e169f02366c10fccb18f50dc9355d32d4b
const game = {
    running: true,
    gameOver: false,
    distance: 0,
    killCount: 0,
    lastTime: 0
};

<<<<<<< HEAD
// 主角
const player = {
    x: 100,
    y: CONFIG.groundY,
    width: 40,
    height: 60,
    hp: 100,
    maxHp: 100,
    attack: 10,
    attackCooldown: 0,
    attackSpeed: 1.0,
    attackRange: 80,
    weapon: '剑',
    color: '#00d4ff'
};

// 兵器
const WEAPONS = {
    '剑': { name: '剑', range: 80, attackSpeed: 1.0, attack: 10, color: '#C0C0C0' }
};

// 怪物
const enemies = [];

// 粒子效果
const particles = [];

// 浮动文字
const floatingTexts = [];

// 怪物类型
const ENEMY_TYPES = ['阴魂', '妖狼', '毒蛛', '僵尸'];

// 初始化
for (let i = 0; i < 5; i++) {
    spawnEnemy();
}

function spawnEnemy() {
    const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
    enemies.push({
        x: player.x + 400 + Math.random() * 200,
        y: CONFIG.groundY,
        width: 40,
        height: 50,
        hp: 20,
        maxHp: 20,
        attack: 5,
        type: type,
        color: getEnemyColor(type),
        attackCooldown: 0
    });
}

function getEnemyColor(type) {
    switch(type) {
        case '阴魂': return '#7b2d8e';
        case '妖狼': return '#8B4513';
        case '毒蛛': return '#2E8B57';
        case '僵尸': return '#4A5D23';
        default: return '#ff0000';
    }
}

// 创建粒子
function createParticle(x, y, color) {
    particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 100,
        vy: (Math.random() - 0.5) * 100 - 50,
        color: color,
        life: 1
    });
}

// 创建浮动文字
function createFloatingText(x, y, text, color) {
    floatingTexts.push({ x: x, y: y, text: text, color: color, life: 1 });
}

// 更新
function update(dt) {
    if (game.gameOver) return;
    
    // 主角自动向右走
    player.x += 80 * dt;
    game.distance = Math.floor((player.x - 100) / 10);
    
    // 主角攻击冷却
    if (player.attackCooldown > 0) {
        player.attackCooldown -= dt;
    }
    
    // 攻击范围内的怪物
    enemies.forEach(enemy => {
        const dist = enemy.x - (player.x + player.width);
        if (dist >= 0 && dist < player.attackRange && player.attackCooldown <= 0) {
            // 主角攻击
            enemy.hp -= player.attack;
            player.attackCooldown = 1 / player.attackSpeed;
            createFloatingText(enemy.x, enemy.y - 50, '-' + player.attack, '#ff4444');
            createParticle(enemy.x + enemy.width/2, enemy.y - enemy.height/2, '#fff');
            
            if (enemy.hp <= 0) {
                game.killCount++;
            }
        }
        
        // 怪物攻击主角
        if (enemy.attackCooldown > 0) {
            enemy.attackCooldown -= dt;
        }
        const distToPlayer = player.x - (enemy.x + enemy.width);
        if (distToPlayer >= -enemy.width && distToPlayer < 30 && enemy.attackCooldown <= 0) {
            player.hp -= enemy.attack;
            enemy.attackCooldown = 1.5;
            createFloatingText(player.x, player.y - 60, '-' + enemy.attack, '#ff0000');
            
            if (player.hp <= 0) {
                player.hp = 0;
                game.gameOver = true;
            }
        }
        
        // 怪物靠近主角
        if (enemy.x > player.x + 100) {
            enemy.x -= 30 * dt;
        }
    });
    
    // 清理死亡怪物并生成新的
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].hp <= 0) {
            enemies.splice(i, 1);
            spawnEnemy();
        }
    }
    
    // 更新粒子
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 200 * dt;
        p.life -= dt * 2;
        if (p.life <= 0) particles.splice(i, 1);
    }
    
    // 更新浮动文字
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        floatingTexts[i].y -= 30 * dt;
        floatingTexts[i].life -= dt;
        if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
    }
}

// 绘制背景
function drawBackground() {
    // 天空
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
    gradient.addColorStop(0, '#1a0a2e');
    gradient.addColorStop(0.5, '#2d1b4e');
    gradient.addColorStop(1, '#1a3a5c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    // 地面
    ctx.fillStyle = '#1a2f25';
    ctx.fillRect(0, CONFIG.groundY, CONFIG.width, CONFIG.height - CONFIG.groundY);
}

// 绘制UI
function drawUI() {
    // 血条
    const hpPercent = player.hp / player.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(20, 20, 160, 16);
    ctx.fillStyle = hpPercent > 0.3 ? '#44ff44' : '#ff4444';
    ctx.fillRect(20, 20, 160 * hpPercent, 16);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(20, 20, 160, 16);
    
    // 血量文字
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText(player.hp + '/' + player.maxHp, 100, 33);
    
    // 武器显示
    ctx.textAlign = 'left';
    ctx.fillStyle = '#C0C0C0';
    ctx.font = '14px Microsoft YaHei';
    ctx.fillText('武器: ' + player.weapon, 20, 50);
    
    // 距离
    ctx.fillStyle = '#00ffff';
    ctx.fillText('距离: ' + game.distance + 'm', CONFIG.width - 120, 30);
    
    // 击杀数
    ctx.fillStyle = '#ff6666';
    ctx.fillText('击杀: ' + game.killCount, CONFIG.width - 120, 50);
    
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
        ctx.fillText('前行距离: ' + game.distance + 'm', CONFIG.width/2, CONFIG.height/2 + 20);
        ctx.fillText('击杀总数: ' + game.killCount, CONFIG.width/2, CONFIG.height/2 + 50);
    }
}

// 绘制
function draw() {
    drawBackground();
    
    // 绘制主角
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y - player.height, player.width, player.height);
    
    // 绘制武器（剑）
    ctx.fillStyle = WEAPONS[player.weapon].color;
    ctx.fillRect(player.x + player.width, player.y - 35, 40, 6);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(player.x + player.width - 5, player.y - 37, 8, 10);
    
    // 绘制怪物
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y - enemy.height, enemy.width, enemy.height);
        
        // 怪物血条
        const hpPercent = enemy.hp / enemy.maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.x, enemy.y - enemy.height - 10, enemy.width, 4);
        ctx.fillStyle = '#44ff44';
        ctx.fillRect(enemy.x, enemy.y - enemy.height - 10, enemy.width * hpPercent, 4);
    });
    
    // 绘制粒子
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;
    
    // 绘制浮动文字
    floatingTexts.forEach(t => {
        ctx.globalAlpha = t.life;
        ctx.fillStyle = t.color;
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y);
    });
    ctx.globalAlpha = 1;
    
    drawUI();
}

// 游戏循环
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

window.onload = startGame;
=======
>>>>>>> 16e6a1e169f02366c10fccb18f50dc9355d32d4b
