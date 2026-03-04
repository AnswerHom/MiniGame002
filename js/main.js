// ===== 键盘控制 =====
const keys = {
    left: false,
    right: false,
    attack: false
};

document.addEventListener('keydown', (e) => {
    if (game.state === 'start') {
        // 按任意键开始游戏
        game.state = 'playing';
        startGame();
        return;
    }
    
    if (game.state === 'gameover') {
        // 按任意键重新开始
        game.restart();
        return;
    }
    
    switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
            keys.left = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            keys.right = true;
            break;
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
            keys.attack = true;
            player.manualAttack = true;
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
            keys.left = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            keys.right = false;
            break;
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
            keys.attack = false;
            player.manualAttack = false;
            break;
    }
});

// ===== 游戏主循环 =====

function update(dt) {
    if (game.gameOver) return;
    
    // v1.0.8: 键盘控制移动
    if (keys.left) {
        player.x -= player.speed * dt;
        if (player.x < 100) player.x = 100; // 限制左边界
    }
    if (keys.right) {
        player.x += player.speed * dt;
    }
    
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
    
    // v1.0.8: 开始界面
    if (game.state === 'start') {
        // 背景
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
        
        // 标题
        ctx.fillStyle = '#38b2ac';
        ctx.font = 'bold 56px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('修仙推图', CONFIG.width / 2, CONFIG.height / 2 - 60);
        
        // 副标题
        ctx.fillStyle = '#a0aec0';
        ctx.font = '24px Microsoft YaHei';
        ctx.fillText('MiniGame002 v1.0.8', CONFIG.width / 2, CONFIG.height / 2 - 10);
        
        // 操作说明
        ctx.fillStyle = '#718096';
        ctx.font = '18px Microsoft YaHei';
        ctx.fillText('← → 或 A D 移动', CONFIG.width / 2, CONFIG.height / 2 + 50);
        ctx.fillText('空格或 W 攻击', CONFIG.width / 2, CONFIG.height / 2 + 80);
        
        // 开始提示
        ctx.fillStyle = '#fff';
        ctx.font = '28px Microsoft YaHei';
        const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillText('点击或按任意键开始', CONFIG.width / 2, CONFIG.height / 2 + 140);
        ctx.globalAlpha = 1.0;
        
        requestAnimationFrame(() => draw());
        return;
    }
    
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
        ctx.fillText('游戏结束', CONFIG.width / 2, CONFIG.height / 2 - 40);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Microsoft YaHei';
        ctx.fillText('等级: Lv.' + player.level, CONFIG.width / 2, CONFIG.height / 2 + 10);
        ctx.fillText('击杀: ' + game.killCount, CONFIG.width / 2, CONFIG.height / 2 + 45);
        
        // v1.0.8: 重新开始提示
        ctx.fillStyle = '#a0aec0';
        ctx.font = '20px Microsoft YaHei';
        const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillText('点击或按任意键重新开始', CONFIG.width / 2, CONFIG.height / 2 + 100);
        ctx.globalAlpha = 1.0;
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
