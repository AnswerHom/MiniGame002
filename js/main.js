// ===== v1.3.5 游戏主循环 =====

function update(dt) {
    // v1.3.5: 暂停时不更新游戏
    if (game.gameOver || game.paused) {
        // v1.3.9: 暂停时也更新购买确认提示
        game.updatePurchaseConfirm(dt);
        return;
    }
    
    // 伤害数字更新
    game.updateDamageNumbers(dt);
    
    // v1.2.8: 暴击特效更新
    game.updateCritEffects(dt);
    
    // v1.2.8: 升级特效更新
    game.updateLevelUpEffects(dt);
    
    // v1.4.0: 敌人死亡动画更新
    game.updateDeathEffects(dt);
    
    // v1.3.6: 增益效果更新
    game.updatePowerups(dt);
    
    // v1.3.9: 购买确认提示更新
    game.updatePurchaseConfirm(dt);
    
    // 玩家更新
    player.update(dt);
    
    // v1.2.7: 怪物生成 - v1.3.6: 暂停时停止生成
    if (!game.paused) {
        game.spawnTimer += dt * 1000;
        const currentInterval = game.getAdjustedSpawnInterval();
        if (game.spawnTimer >= currentInterval) {
            spawnEnemy();
            game.spawnTimer = 0;
        }
    }
    
    // 怪物更新
    game.enemies.forEach(enemy => enemy.update(dt));
    
    // 玩家自动攻击：如果攻击范围内有敌人就攻击，否则移动
    let hasEnemyInRange = false;
    game.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        const dist = Math.abs(player.x - enemy.x);
        if (dist < player.attackRange) {
            player.attackTarget(enemy);
            hasEnemyInRange = true;
        }
    });
    
    // 玩家根据是否有敌人在攻击范围内决定是否移动
    player.isMoving = !hasEnemyInRange;
    
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
    
    // v1.2.8: 绘制暴击特效
    game.drawCritEffects();
    
    // v1.2.8: 绘制升级特效
    game.drawLevelUpEffects();
    
    // v1.4.0: 绘制敌人死亡动画
    game.drawDeathEffects();
    
    // 绘制UI
    drawUI();
    
    // v1.3.9: 绘制购买确认提示
    game.drawPurchaseConfirm();
    
    // 游戏结束
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 48px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', CONFIG.width / 2, CONFIG.height / 2 - 60);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Microsoft YaHei';
        ctx.fillText('等级: Lv.' + player.level, CONFIG.width / 2, CONFIG.height / 2 - 10);
        ctx.fillText('击杀: ' + game.killCount, CONFIG.width / 2, CONFIG.height / 2 + 30);
        // v1.3.5: 金币显示
        ctx.fillText('金币: ' + game.gold, CONFIG.width / 2, CONFIG.height / 2 + 70);
        // v1.3.5: 再来一局按钮
        drawRestartButton();
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
    // v1.2.7: 玩家初始位置优化 - 从x=50开始
    player.x = 50;
    player.hp = player.maxHp;
    player.exp = 0;
    player.level = 1;
    player.isMoving = true;
    // v1.2.7: 记录开局时间用于生成冷却控制
    game.startTime = Date.now();
    requestAnimationFrame(gameLoop);
}

// v1.2.2: 点击重新开始 - v1.3.6: 统一使用handleClick
const gameCanvas = document.getElementById('gameCanvas');
gameCanvas.addEventListener('click', function(e) {
    handleClick(e);
});

// v1.2.8: 键盘交互时也初始化AudioContext
document.addEventListener('keydown', function() {
    game.initAudio();
});

// v1.3.5: 暂停功能 - ESC键 - v1.3.9: 商店快捷键 B键
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !game.gameOver) {
        game.paused = !game.paused;
        if (!game.paused) {
            // 恢复游戏时重置lastTime防止时间跳跃
            game.lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        }
    }
    // v1.3.9: 商店快捷键 B键
    if ((e.key === 'b' || e.key === 'B') && !game.gameOver) {
        game.showShop = !game.showShop;
    }
});

// v1.3.5: 绘制重启按钮
function drawRestartButton() {
    const btnWidth = 160;
    const btnHeight = 50;
    const btnX = CONFIG.width / 2 - btnWidth / 2;
    const btnY = CONFIG.height / 2 + 100;
    
    // 按钮背景
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
    
    // 按钮边框
    ctx.strokeStyle = '#45a049';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);
    
    // 按钮文字
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('再来一局', CONFIG.width / 2, btnY + 32);
    ctx.textAlign = 'left';
}

// v1.3.5: 触屏支持 - v1.3.6: 统一使用handleClick
gameCanvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    
    // 获取触屏坐标
    const touch = e.touches[0];
    const rect = gameCanvas.getBoundingClientRect();
    
    // 复用点击处理逻辑
    handleClick({
        clientX: touch.clientX,
        clientY: touch.clientY
    });
}, { passive: false });

// v1.3.5: 处理点击/触屏事件 - v1.3.6: 合并统一处理
function handleClick(e) {
    // v1.2.8: 首次交互时初始化AudioContext
    game.initAudio();
    
    // 获取坐标
    const rect = gameCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // 如果暂停中，点击继续游戏
    if (game.paused) {
        game.paused = false;
        game.lastTime = performance.now();
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // 如果帮助界面显示中，点击关闭
    if (game.showHelp) {
        game.showHelp = false;
        return;
    }
    
    // v1.3.6: 商店界面显示中，点击关闭
    if (game.showShop) {
        game.showShop = false;
        return;
    }
    
    // 音效开关按钮 (x: width-50, y: 50)
    if (clickX >= CONFIG.width - 50 && clickX <= CONFIG.width - 20 && clickY >= 50 && clickY <= 80) {
        game.soundEnabled = !game.soundEnabled;
        return;
    }
    
    // 帮助按钮 (x: width-50, y: 90)
    if (clickX >= CONFIG.width - 50 && clickX <= CONFIG.width - 20 && clickY >= 90 && clickY <= 120) {
        game.showHelp = true;
        return;
    }
    
    // v1.3.5: 暂停按钮 (x: width-50, y: 130)
    if (clickX >= CONFIG.width - 50 && clickX <= CONFIG.width - 20 && clickY >= 130 && clickY <= 160) {
        game.paused = !game.paused;
        if (!game.paused) {
            game.lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        }
        return;
    }
    
    // v1.3.6: 商店按钮 (x: width-50, y: 170) - v1.3.7: 暂停时禁止打开商店
    if (clickX >= CONFIG.width - 50 && clickX <= CONFIG.width - 20 && clickY >= 170 && clickY <= 200) {
        if (!game.paused) {
            game.showShop = !game.showShop;
        }
        return;
    }
    
    // v1.3.5: 游戏结束时的再来一局按钮
    if (game.gameOver) {
        const btnWidth = 160;
        const btnHeight = 50;
        const btnX = CONFIG.width / 2 - btnWidth / 2;
        const btnY = CONFIG.height / 2 + 100;
        
        if (clickX >= btnX && clickX <= btnX + btnWidth && clickY >= btnY && clickY <= btnY + btnHeight) {
            game.restart();
            return;
        }
    }
    
    // v1.3.6: 商店物品购买
    if (game.showShop && !game.gameOver && !game.paused) {
        const shopItems = getShopItems();
        const itemWidth = 140;
        const itemHeight = 60;
        const centerX = CONFIG.width / 2;
        const centerY = CONFIG.height / 2;
        const startX = centerX - 200;
        const startY = centerY - 60;
        
        shopItems.forEach((item, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            const itemX = startX + col * (itemWidth + 20);
            const itemY = startY + row * (itemHeight + 20);
            
            if (clickX >= itemX && clickX <= itemX + itemWidth && clickY >= itemY && clickY <= itemY + itemHeight) {
                purchaseItem(item);
            }
        });
    }
    
    if (game.gameOver) {
        game.restart();
    }
}

window.onload = startGame;
