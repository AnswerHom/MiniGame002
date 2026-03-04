// ===== 游戏主循环 =====

function update(dt) {
    if (game.gameOver) return;
    
    // 伤害数字更新
    game.updateDamageNumbers(dt);
    
    // 玩家更新
    player.update(dt);
    
    // 怪物生成
    game.spawnTimer += dt * 1000;
    if (game.spawnTimer >= game.spawnInterval) {
        spawnEnemy();
        game.spawnTimer = 0;
    }
    
    // 怪物更新
    game.enemies.forEach(enemy => enemy.update(dt));
    
    // 检测攻击
    game.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        const dist = Math.abs(player.x - enemy.x);
        if (dist < player.attackRange) {
            player.attackTarget(enemy);
        }
    });
    
    // 清理死亡怪物
    game.enemies = game.enemies.filter(e => e.alive);
    
    // 升级检测
    if (player.exp >= player.requiredExp) {
        player.levelUp();
    }
}

function draw() {
    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);
    
    drawBackground();
    
    // 绘制怪物
    game.enemies.forEach(enemy => enemy.draw());
    
    // 绘制玩家
    player.draw();
    
    // 绘制伤害数字
    game.drawDamageNumbers();
    
    // 绘制UI
    drawUI();
    
    // 游戏结束
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 48px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', CONFIG.width / 2, CONFIG.height / 2);
        ctx.fillStyle = '#fff';
        ctx.font = '20px Microsoft YaHei';
        ctx.fillText('等级: Lv.' + player.level, CONFIG.width / 2, CONFIG.height / 2 + 40);
        ctx.fillText('击杀: ' + game.killCount, CONFIG.width / 2, CONFIG.height / 2 + 70);
    }
}

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - game.lastTime) / 1000, 0.1);
    game.lastTime = timestamp;
    
    update(dt);
    draw();
    
    if (!game.gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    game.lastTime = performance.now();
    game.enemies = [];
    game.killCount = 0;
    game.spawnTimer = 0;
    game.gameOver = false;
    game.damageNumbers = [];
    player.x = 100;
    player.hp = player.maxHp;
    player.exp = 0;
    player.level = 1;
    requestAnimationFrame(gameLoop);
}

window.onload = startGame;
