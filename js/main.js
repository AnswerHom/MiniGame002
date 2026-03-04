// ===== 游戏主入口 =====
// 包含：游戏循环、初始化、更新逻辑

// 初始化游戏
function initGame() {
    // 初始化云朵
    for (let i = 0; i < 10; i++) {
        game.clouds.push({
            x: Math.random() * CONFIG.width,
            y: Math.random() * (CONFIG.groundY - 100),
            width: 60 + Math.random() * 40,
            speed: 10 + Math.random() * 20,
            opacity: 0.3 + Math.random() * 0.3
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
    // 初始化草地
    for (let i = 0; i < 30; i++) {
        game.grass.push({
            x: Math.random() * CONFIG.width,
            height: 20 + Math.random() * 30,
            sway: Math.random() * Math.PI * 2
        });
    }
}

// 更新游戏状态
function update(dt) {
    if (game.gameOver) return;
    
    // 屏幕震动衰减
    if (game.screenShake > 0) {
        game.screenShake -= dt;
    }
    
    // 慢动作衰减
    if (game.slowMotion > 0) {
        game.slowMotion -= dt;
    }
    
    const actualDt = game.slowMotion > 0 ? dt * 0.1 : dt;
    
    // 更新玩家
    player.update(actualDt);
    
    // 更新相机
    if (CONFIG.cameraOffset < 0) CONFIG.cameraOffset = 0;
    
    // 连击计时器
    if (game.comboTimer > 0) { 
        game.comboTimer -= actualDt; 
        if (game.comboTimer <= 0) game.comboCount = 0; 
    }
    
    // 生成怪物
    const aliveEnemies = game.enemies.filter(e => e.alive);
    if (aliveEnemies.length < 5) {
        game.spawnTimer += actualDt * 1000;
        if (game.spawnTimer >= game.spawnInterval) { 
            spawnEnemy(); 
            game.spawnTimer = 0; 
        }
    }
    
    // 更新所有实体
    game.enemies.forEach(enemy => enemy.update(actualDt));
    game.enemies.forEach(enemy => { 
        if (!enemy.alive) return; 
        const dist = Math.abs((player.x + player.width/2) - (enemy.x + enemy.width/2)); 
        if (dist < player.attackRange) player.attackTarget(enemy); 
    });
    game.enemies = game.enemies.filter(e => e.alive);
    
    game.expOrbs.forEach(orb => orb.update(actualDt)); 
    game.expOrbs = game.expOrbs.filter(orb => !orb.collected);
    game.goldCoins.forEach(coin => coin.update(actualDt)); 
    game.goldCoins = game.goldCoins.filter(coin => !coin.collected);
    game.particles.forEach(p => p.update(actualDt)); 
    game.particles = game.particles.filter(p => p.life > 0);
    game.projectiles.forEach(p => p.update(actualDt)); 
    game.projectiles = game.projectiles.filter(p => p.alive);
    game.clouds.forEach(cloud => { 
        cloud.x += cloud.speed * actualDt; 
        if (cloud.x > player.x + CONFIG.width) cloud.x = player.x - cloud.width; 
    });
    game.stars.forEach(star => star.twinkle += star.speed * actualDt);
    game.grass.forEach(grass => grass.sway += actualDt * 2);
    
    // 更新战斗状态
    updateBattleState(actualDt);
    
    // 自动存档
    if (!game.autoSaveTimer) game.autoSaveTimer = 0;
    game.autoSaveTimer += actualDt;
    if (game.autoSaveTimer >= 30) { autoSave(); game.autoSaveTimer = 0; }
    
    // 玩家升级检测
    if (player.exp >= player.requiredExp) {
        player.levelUp();
    }
    
    // 境界突破
    if (player.realmBreakthroughPending && game.guardianDefeated) {
        const realm = getRealm(player.level);
        createFloatingText(player.x, player.y - 80, '突破成功! 境界:' + realm.name, '#ff00ff');
        player.realmBreakthroughPending = false;
        game.guardianDefeated = false;
    }
    
    // 存档UI显示计时
    if (game.showSaveUI) {
        if (!game.saveUITimer) game.saveUITimer = 0;
        game.saveUITimer += dt;
        if (game.saveUITimer > 5) {
            game.showSaveUI = false;
            game.saveUITimer = 0;
        }
    }
}

// 绘制游戏画面
function draw() {
    // 屏幕震动效果
    ctx.save();
    if (game.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * game.screenShakeIntensity;
        const shakeY = (Math.random() - 0.5) * game.screenShakeIntensity;
        ctx.translate(shakeX, shakeY);
    }
    
    drawBackground();
    
    // 绘制经验球
    game.expOrbs.forEach(orb => orb.draw());
    // 绘制金币
    game.goldCoins.forEach(coin => coin.draw());
    // 绘制怪物
    game.enemies.forEach(enemy => enemy.draw());
    // 绘制弹道
    game.projectiles.forEach(p => p.draw());
    // 绘制玩家
    player.draw();
    // 绘制粒子
    game.particles.forEach(p => p.draw());
    
    // 绘制UI
    drawUI();
    
    ctx.restore();
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

// 开始游戏
function startGame() {
    initGame();
    game.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// 页面加载完成后开始游戏
window.onload = startGame;
