// ===== v1.0.5 UI模块 =====

function drawUI() {
    ctx.font = '14px Microsoft YaHei';
    ctx.textAlign = 'left';
    
    // 境界显示 (v1.0.5新增)
    const realm = getRealm(player.level);
    const realmColor = REALM_COLORS[realm.name] || '#ffffff';
    ctx.fillStyle = realmColor;
    ctx.fillText('境界: ' + realm.name, 20, 25);
    
    // 等级
    ctx.fillStyle = '#fff';
    ctx.fillText('等级: Lv.' + player.level, 120, 25);
    
    // 血条背景
    ctx.fillStyle = '#333';
    ctx.fillRect(20, 35, 100, 10);
    // 血条
    ctx.fillStyle = player.hp > 30 ? '#44ff44' : '#ff4444';
    ctx.fillRect(20, 35, 100 * Math.max(0, player.hp / player.maxHp), 10);
    // 血量
    ctx.fillStyle = '#fff';
    ctx.fillText(player.hp + '/' + player.maxHp, 130, 44);
    
    // 攻击 - v1.3.7: 显示攻击力增益
    ctx.fillStyle = '#ffd700';
    let attackText = '攻击: ' + player.attack;
    // v1.3.7: 如果有攻击力增益，显示原始攻击力
    if (game.activePowerups.doubleAttack) {
        const originalAttack = Math.floor(player.attack / 2);
        attackText = '攻击: ' + originalAttack + '→' + player.attack;
        // v1.3.7: 攻击力增益高亮显示
        ctx.fillStyle = '#00ff00';
    }
    ctx.fillText(attackText, 20, 60);
    
    // 击杀
    ctx.fillStyle = '#ff6666';
    ctx.fillText('击杀: ' + game.killCount, 130, 60);
    
    // 距离 (v1.2.2: 100px = 1米)
    ctx.fillStyle = '#00ffff';
    ctx.fillText('距离: ' + Math.floor(player.x / 100) + 'm', 20, 80);
    
    // v1.3.5: 金币显示
    ctx.fillStyle = '#ffd700';
    ctx.fillText('💰 ' + game.gold, 130, 80);
    
    // 场景名称
    const scene = getScene(player.x);
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'right';
    ctx.fillText(scene.name, CONFIG.width - 20, 25);
    ctx.textAlign = 'left';
    
    // v1.3.4: 音效开关按钮
    drawSoundButton();
    
    // v1.3.4: 帮助按钮
    drawHelpButton();
    
    // v1.3.4: 帮助信息
    drawHelpInfo();
    
    // v1.3.5: 暂停按钮
    drawPauseButton();
    
    // v1.3.5: 暂停覆盖层
    drawPauseOverlay();
}

// v1.3.4: 绘制音效开关按钮
function drawSoundButton() {
    const btnX = CONFIG.width - 50;
    const btnY = 50;
    const btnSize = 30;
    
    // 按钮背景
    ctx.fillStyle = game.soundEnabled ? '#4a5568' : '#2d3748';
    ctx.fillRect(btnX, btnY, btnSize, btnSize);
    
    // 按钮边框
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnSize, btnSize);
    
    // 音效图标
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(game.soundEnabled ? '🔊' : '🔇', btnX + btnSize/2, btnY + 20);
    ctx.textAlign = 'left';
}

// v1.3.4: 绘制帮助按钮
function drawHelpButton() {
    const btnX = CONFIG.width - 50;
    const btnY = 90;
    const btnSize = 30;
    
    // 按钮背景
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(btnX, btnY, btnSize, btnSize);
    
    // 按钮边框
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnSize, btnSize);
    
    // 帮助图标
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('?', btnX + btnSize/2, btnY + 20);
    ctx.textAlign = 'left';
}

// v1.3.4: 绘制帮助信息
function drawHelpInfo() {
    if (!game.showHelp) return;
    
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    // 帮助内容
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    
    const centerX = CONFIG.width / 2;
    let y = 80;
    
    ctx.font = 'bold 24px Microsoft YaHei';
    ctx.fillText('游戏帮助', centerX, y);
    y += 40;
    
    ctx.font = '16px Microsoft YaHei';
    ctx.textAlign = 'left';
    const lines = [
        '• 这是一款自动挂机游戏',
        '• 角色会自动向右移动并战斗',
        '• 击败怪物获得经验和金币',
        '• 升级提升属性，境界越高怪物越强',
        '• 点击右上角按钮开关音效/帮助',
        '• 按ESC或点击暂停按钮暂停游戏',
        '• 支持触屏操作',
        '• 游戏结束后点击再来一局',
    ];
    
    lines.forEach(line => {
        ctx.fillText(line, centerX - 150, y);
        y += 30;
    });
    
    ctx.textAlign = 'center';
    ctx.fillStyle = '#aaa';
    ctx.fillText('点击任意位置关闭', centerX, y + 20);
    ctx.textAlign = 'left';
}

// v1.3.5: 绘制金币显示
function drawGoldDisplay() {
    ctx.fillStyle = '#ffd700';
    ctx.font = '16px Microsoft YaHei';
    ctx.textAlign = 'left';
    ctx.fillText('💰 ' + game.gold, 20, 100);
    ctx.textAlign = 'left';
}

// v1.3.5: 绘制暂停按钮（已移除重复定义）
function drawPauseButton() {
    const btnX = CONFIG.width - 50;
    const btnY = 130;
    const btnSize = 30;
    
    // 按钮背景
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(btnX, btnY, btnSize, btnSize);
    
    // 按钮边框
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnSize, btnSize);
    
    // 暂停图标
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⏸', btnX + btnSize/2, btnY + 20);
    ctx.textAlign = 'left';
}

// v1.3.5: 绘制暂停覆盖层（已移除重复定义）
function drawPauseOverlay() {
    if (!game.paused) return;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('已暂停', CONFIG.width / 2, CONFIG.height / 2 - 20);
    
    ctx.font = '20px Microsoft YaHei';
    ctx.fillText('按 ESC 继续', CONFIG.width / 2, CONFIG.height / 2 + 30);
    ctx.textAlign = 'left';
}

