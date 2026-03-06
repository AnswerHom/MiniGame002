// ===== v1.6.0 UI模块 =====

function drawUI() {
    // v1.6.0: 使用布局规范，四角定位
    const statusPos = getStatusPanelPos();
    const combatPos = getStatsPanelPos();
    
    ctx.font = '14px Microsoft YaHei';
    ctx.textAlign = 'left';
    
    // ===== 左上角状态栏 =====
    // 境界显示
    const realm = getRealm(player.level);
    const realmColor = REALM_COLORS[realm.name] || '#ffffff';
    ctx.fillStyle = realmColor;
    ctx.fillText('境界: ' + realm.name, statusPos.x, statusPos.y + 10);
    
    // 等级
    ctx.fillStyle = '#fff';
    ctx.fillText('Lv.' + player.level, statusPos.x + 80, statusPos.y + 10);
    
    // 血条背景
    ctx.fillStyle = '#333';
    ctx.fillRect(statusPos.x, statusPos.y + 18, 100, 8);
    // 血条 - 颜色渐变（绿到红）
    const hpPercent = Math.max(0, player.hp / player.maxHp);
    let hpColor;
    if (hpPercent > 0.6) {
        hpColor = '#44ff44';
    } else if (hpPercent > 0.3) {
        hpColor = '#ffaa00';
    } else {
        hpColor = '#ff4444';
    }
    ctx.fillStyle = hpColor;
    ctx.fillRect(statusPos.x, statusPos.y + 18, 100 * hpPercent, 8);
    // 血量数值
    ctx.fillStyle = '#fff';
    ctx.font = '11px Microsoft YaHei';
    ctx.fillText(player.hp + '/' + player.maxHp, statusPos.x + 102, statusPos.y + 25);
    ctx.font = '14px Microsoft YaHei';
    
    // 攻击力
    ctx.fillStyle = '#ffd700';
    let attackText = '攻击: ' + player.attack;
    if (game.activePowerups.doubleAttack) {
        const originalAttack = Math.floor(player.attack / 2);
        attackText = '攻击: ' + originalAttack + '→' + player.attack;
        ctx.fillStyle = '#00ff00';
    }
    if (player.initialEquipment && player.initialEquipment.weapon) {
        const equip = player.initialEquipment.weapon;
        attackText += ' [' + equip.name + '+' + equip.attackBonus + ']';
    }
    ctx.fillText(attackText, statusPos.x, statusPos.y + 42);
    
    // 距离
    ctx.fillStyle = '#00ffff';
    ctx.fillText('距离: ' + Math.floor(player.x / 10) + '米', statusPos.x, statusPos.y + 58);
    
    // v2.1.0: 灵气条显示
    drawSpiritBar(statusPos);
    
    // ===== 右上角战斗信息 =====
    // 击杀数
    ctx.fillStyle = '#ff6666';
    ctx.fillText('击杀: ' + game.killCount, combatPos.x, combatPos.y + 10);
    
    // 伤害统计
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('伤害: ' + game.totalDamage, combatPos.x, combatPos.y + 26);
    
    // 金币
    ctx.fillStyle = '#ffd700';
    ctx.fillText('💰 ' + game.gold, combatPos.x, combatPos.y + 42);
    
    // 累计金币
    ctx.fillStyle = '#ffd700';
    ctx.fillText('累计: ' + game.totalGoldEarned, combatPos.x, combatPos.y + 58);
    
    // 关卡进度
    const wave = Math.floor(player.x / 1000) + 1;
    ctx.fillStyle = '#a855f7';
    ctx.fillText('第 ' + wave + ' 波', combatPos.x, combatPos.y + 74);
    
    // 场景名称（右上角顶部）
    const scene = getScene(player.x);
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'right';
    ctx.fillText(scene.name, CONFIG.width - UI_SAFE_ZONE.right, statusPos.y + 10);
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
    
    // v1.3.6: 商店按钮
    drawShopButton();
    
    // v1.3.6: 商店界面
    drawShopUI();
    
    // v1.5.6: 背包按钮
    drawBackpackButton();
    
    // v2.7.0: 属性按钮
    drawStatsButton();
    
    // v2.7.0: 属性面板
    drawStatsPanel();
    
    // v1.5.6: 背包界面
    drawBackpackUI();
    
    // v1.8.0: 技能按钮
    drawSkillButton();
    
    // v1.8.0: 技能界面
    drawSkillPanelUI();
    
    // v2.1.0: 突破提示弹窗
    drawBreakthroughPrompt();
    
    // v2.3.0: 灵兽按钮
    drawBeastButton();
    
    // v2.3.0: 灵兽仓库界面
    drawBeastWarehouseUI();
    
    // v2.3.0: 灵兽栏界面
    drawBeastArenaUI();
    
    // v2.3.0: 孵化进度条
    beastSystem.drawHatchProgress();
}

// v1.3.4: 绘制音效开关按钮 - v1.5.2: 使用布局规范，按钮尺寸≥44px - v1.6.0: 优化位置
function drawSoundButton() {
    const btnPos = getRightButtonsStartPos();
    const btnX = btnPos.x;
    const btnY = btnPos.y;
    const btnSize = UI_INTERACTION.minButtonSize;  // 44px
    
    // 按钮背景
    ctx.fillStyle = game.soundEnabled ? '#4a5568' : '#2d3748';
    ctx.fillRect(btnX, btnY, btnSize, btnSize);
    
    // 按钮边框
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnSize, btnSize);
    
    // 音效图标
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(game.soundEnabled ? '🔊' : '🔇', btnX + btnSize/2, btnY + btnSize/2 + 6);
    ctx.textAlign = 'left';
    
    // 记录按钮区域供点击检测
    game.uiButtons = game.uiButtons || {};
    game.uiButtons.sound = { x: btnX, y: btnY, width: btnSize, height: btnSize, bgColor: '#4a5568', icon: game.soundEnabled ? '🔊' : '🔇' };
}

// v1.3.4: 绘制帮助按钮 - v1.5.2: 使用布局规范，按钮尺寸≥44px，间距≥20px - v1.6.0: 优化位置
function drawHelpButton() {
    const btnPos = getRightButtonsStartPos();
    const btnX = btnPos.x;
    const btnY = btnPos.y + UI_INTERACTION.minButtonSize + UI_INTERACTION.buttonSpacing;
    const btnSize = UI_INTERACTION.minButtonSize;  // 44px
    
    // 按钮背景
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(btnX, btnY, btnSize, btnSize);
    
    // 按钮边框
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnSize, btnSize);
    
    // 帮助图标
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('?', btnX + btnSize/2, btnY + btnSize/2 + 6);
    ctx.textAlign = 'left';
    
    // 记录按钮区域供点击检测
    game.uiButtons = game.uiButtons || {};
    game.uiButtons.help = { x: btnX, y: btnY, width: btnSize, height: btnSize, bgColor: '#4a5568', text: '?' };
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

// v1.3.5: 绘制暂停按钮 - v1.5.2: 使用布局规范，按钮尺寸≥44px，间距≥20px - v1.6.0: 优化位置
function drawPauseButton() {
    const btnPos = getRightButtonsStartPos();
    const btnX = btnPos.x;
    const btnY = btnPos.y + (UI_INTERACTION.minButtonSize + UI_INTERACTION.buttonSpacing) * 2;
    const btnSize = UI_INTERACTION.minButtonSize;  // 44px
    
    // 按钮背景
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(btnX, btnY, btnSize, btnSize);
    
    // 按钮边框
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnSize, btnSize);
    
    // 暂停图标
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⏸', btnX + btnSize/2, btnY + btnSize/2 + 6);
    ctx.textAlign = 'left';
    
    // 记录按钮区域供点击检测
    game.uiButtons = game.uiButtons || {};
    game.uiButtons.pause = { x: btnX, y: btnY, width: btnSize, height: btnSize, bgColor: '#4a5568', icon: '⏸' };
}

// v1.3.5: 绘制暂停覆盖层 - v1.3.9: 显示已激活增益
function drawPauseOverlay() {
    if (!game.paused) return;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('已暂停', CONFIG.width / 2, CONFIG.height / 2 - 80);
    
    ctx.font = '20px Microsoft YaHei';
    ctx.fillText('按 ESC 继续', CONFIG.width / 2, CONFIG.height / 2 - 30);
    
    // v1.3.9: 暂停时显示已激活增益
    const activePowerups = Object.keys(game.activePowerups);
    if (activePowerups.length > 0) {
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 22px Microsoft YaHei';
        ctx.fillText('🎯 当前激活增益:', CONFIG.width / 2, CONFIG.height / 2 + 20);
        
        const shopItems = getShopItems();
        let yOffset = 55;
        activePowerups.forEach(powerup => {
            const remaining = Math.ceil(game.activePowerups[powerup]);
            const item = shopItems.find(i => i.id === powerup);
            if (item) {
                ctx.fillStyle = '#ffd700';
                ctx.font = '18px Microsoft YaHei';
                ctx.fillText('• ' + item.name + ': ' + remaining + '秒', CONFIG.width / 2, CONFIG.height / 2 + yOffset);
                yOffset += 30;
            }
        });
    } else {
        ctx.fillStyle = '#888';
        ctx.font = '18px Microsoft YaHei';
        ctx.fillText('(无激活增益)', CONFIG.width / 2, CONFIG.height / 2 + 60);
    }
    
    ctx.textAlign = 'left';
}


// ===== 境界系统 =====
// 境界配置已移至 config.js

// v2.1.0: 绘制灵气条
function drawSpiritBar(statusPos) {
    const required = player.getRequiredSpirit();
    if (required <= 0) return;  // 满境界不需要显示
    
    const barX = statusPos.x;
    const barY = statusPos.y + 68;
    const barWidth = 100;
    const barHeight = 8;
    
    // 灵气条背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // 灵气条边框
    ctx.strokeStyle = '#4a4a6a';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // 灵气条进度
    const spiritPercent = Math.min(1, player.spirit / required);
    const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
    gradient.addColorStop(0, '#00ffff');
    gradient.addColorStop(1, '#0088ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(barX + 1, barY + 1, (barWidth - 2) * spiritPercent, barHeight - 2);
    
    // 灵气数值显示
    ctx.fillStyle = '#00ffff';
    ctx.font = '11px Microsoft YaHei';
    ctx.fillText(player.spirit + '/' + required, barX + barWidth + 5, barY + 7);
    
    // 突破提示（灵气满时）
    if (player.spirit >= required) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 12px Microsoft YaHei';
        ctx.fillText('可突破!', barX + barWidth + 5, barY + 7);
    }
}

// v2.1.0: 绘制突破提示弹窗
function drawBreakthroughPrompt() {
    if (!game.showBreakthroughPrompt) return;
    
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    // 弹窗背景
    const boxWidth = 300;
    const boxHeight = 150;
    const boxX = (CONFIG.width - boxWidth) / 2;
    const boxY = (CONFIG.height - boxHeight) / 2;
    
    // 渐变背景
    const gradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
    gradient.addColorStop(0, '#2d1f4e');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    // 边框
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
    // 标题
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 24px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 境界突破', CONFIG.width / 2, boxY + 40);
    
    // 提示文字
    ctx.fillStyle = '#fff';
    ctx.font = '16px Microsoft YaHei';
    ctx.fillText('灵气已满，可以突破境界!', CONFIG.width / 2, boxY + 75);
    
    // 按钮提示
    ctx.fillStyle = '#00ffff';
    ctx.font = '14px Microsoft YaHei';
    ctx.fillText('点击任意位置突破', CONFIG.width / 2, boxY + 110);
    
    ctx.textAlign = 'left';
}

// ===== v2.3.0 灵兽系统 UI =====

// v2.3.0: 绘制灵兽按钮
function drawBeastButton() {
    const btnPos = getRightButtonsStartPos();
    const btnX = btnPos.x;
    // 计算位置：音效(0) + 帮助(1) + 暂停(2) + 商店(3) + 背包(4) + 技能(5) + 灵兽(6)
    const btnY = btnPos.y + (UI_INTERACTION.minButtonSize + UI_INTERACTION.buttonSpacing) * 6;
    const btnSize = UI_INTERACTION.minButtonSize;
    
    // 按钮背景
    ctx.fillStyle = beastSystem.showWarehouse || beastSystem.showBeastArena ? '#6b46c1' : '#4a5568';
    ctx.fillRect(btnX, btnY, btnSize, btnSize);
    
    // 按钮边框
    ctx.strokeStyle = '#9f7aea';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnSize, btnSize);
    
    // 灵兽图标
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🐾', btnX + btnSize/2, btnY + btnSize/2 + 6);
    ctx.textAlign = 'left';
    
    // 记录按钮区域
    game.uiButtons = game.uiButtons || {};
    game.uiButtons.beast = { x: btnX, y: btnY, width: btnSize, height: btnSize, bgColor: '#4a5568', icon: '🐾' };
}

// v2.3.0: 绘制灵兽仓库界面
function drawBeastWarehouseUI() {
    if (!beastSystem.showWarehouse) return;
    
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    // 界面背景
    const panelWidth = 360;
    const panelHeight = 380;
    const panelX = (CONFIG.width - panelWidth) / 2;
    const panelY = (CONFIG.height - panelHeight) / 2;
    
    // 背景
    const gradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
    gradient.addColorStop(0, '#2d1f4e');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // 边框
    ctx.strokeStyle = '#9f7aea';
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // 标题
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('🐾 灵兽仓库', CONFIG.width / 2, panelY + 30);
    
    // 关闭按钮
    const closeBtnX = panelX + panelWidth - 40;
    const closeBtnY = panelY + 10;
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 18px Microsoft YaHei';
    ctx.fillText('✕', closeBtnX, closeBtnY + 20);
    
    // 显示灵兽蛋列表
    const eggs = beastSystem.getEggs();
    const startY = panelY + 60;
    const itemHeight = 60;
    
    if (eggs.length === 0) {
        ctx.fillStyle = '#aaa';
        ctx.font = '16px Microsoft YaHei';
        ctx.fillText('暂无灵兽蛋', CONFIG.width / 2, startY + 40);
    } else {
        ctx.fillStyle = '#ccc';
        ctx.font = '14px Microsoft YaHei';
        ctx.textAlign = 'left';
        ctx.fillText('点击蛋进行孵化', panelX + 15, startY);
        ctx.textAlign = 'center';
        
        // 绘制灵兽蛋列表
        for (let i = 0; i < eggs.length && i < 4; i++) {
            const egg = eggs[i];
            const itemY = startY + 25 + i * itemHeight;
            
            // 蛋图标
            drawBeastEggIcon(panelX + 40, itemY + 25, 20, egg.quality);
            
            // 蛋信息
            ctx.fillStyle = egg.color;
            ctx.font = 'bold 14px Microsoft YaHei';
            ctx.textAlign = 'left';
            ctx.fillText(egg.quality + ' ' + egg.realm + '灵兽蛋', panelX + 70, itemY + 20);
            
            // 孵化时间
            ctx.fillStyle = '#aaa';
            ctx.font = '12px Microsoft YaHei';
            ctx.fillText('孵化时间: ' + egg.hatchTime + '秒', panelX + 70, itemY + 38);
            
            // 记录点击区域
            game.uiButtons = game.uiButtons || {};
            game.uiButtons['beastEgg_' + egg.id] = { 
                x: panelX + 15, 
                y: itemY, 
                width: panelWidth - 30, 
                height: itemHeight - 5,
                type: 'beastEgg',
                eggId: egg.id
            };
        }
    }
    
    // 切换到灵兽栏按钮
    const arenaBtnX = panelX + 20;
    const arenaBtnY = panelY + panelHeight - 50;
    const arenaBtnW = 140;
    const arenaBtnH = 35;
    
    ctx.fillStyle = '#6b46c1';
    ctx.fillRect(arenaBtnX, arenaBtnY, arenaBtnW, arenaBtnH);
    ctx.strokeStyle = '#9f7aea';
    ctx.lineWidth = 2;
    ctx.strokeRect(arenaBtnX, arenaBtnY, arenaBtnW, arenaBtnH);
    
    ctx.fillStyle = '#fff';
    ctx.font = '14px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('🐾 灵兽栏', arenaBtnX + arenaBtnW/2, arenaBtnY + 23);
    
    game.uiButtons = game.uiButtons || {};
    game.uiButtons.beastArena = { x: arenaBtnX, y: arenaBtnY, width: arenaBtnW, height: arenaBtnH };
    
    ctx.textAlign = 'left';
}

// v2.3.0: 绘制灵兽栏界面
function drawBeastArenaUI() {
    if (!beastSystem.showBeastArena) return;
    
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    // 界面背景
    const panelWidth = 360;
    const panelHeight = 380;
    const panelX = (CONFIG.width - panelWidth) / 2;
    const panelY = (CONFIG.height - panelHeight) / 2;
    
    // 背景
    const gradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
    gradient.addColorStop(0, '#2d1f4e');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // 边框
    ctx.strokeStyle = '#9f7aea';
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // 标题
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('🐾 灵兽栏', CONFIG.width / 2, panelY + 30);
    
    // 关闭按钮
    const closeBtnX = panelX + panelWidth - 40;
    const closeBtnY = panelY + 10;
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 18px Microsoft YaHei';
    ctx.fillText('✕', closeBtnX, closeBtnY + 20);
    
    // 显示灵兽列表
    const beasts = beastSystem.getBeasts();
    const startY = panelY + 60;
    const itemHeight = 70;
    
    if (beasts.length === 0) {
        ctx.fillStyle = '#aaa';
        ctx.font = '16px Microsoft YaHei';
        ctx.fillText('暂无灵兽', CONFIG.width / 2, startY + 40);
        ctx.fillText('击败怪物掉落灵兽蛋后孵化', CONFIG.width / 2, startY + 70);
    } else {
        // 绘制灵兽列表
        for (let i = 0; i < beasts.length && i < 4; i++) {
            const beast = beasts[i];
            const itemY = startY + i * itemHeight;
            const isActive = beastSystem.activeBeast && beastSystem.activeBeast.id === beast.id;
            
            // 选中背景
            if (isActive) {
                ctx.fillStyle = 'rgba(159, 122, 234, 0.3)';
                ctx.fillRect(panelX + 10, itemY, panelWidth - 20, itemHeight - 5);
            }
            
            // 灵兽图标
            drawBeastIcon(panelX + 40, itemY + 30, 18, beast);
            
            // 灵兽信息
            ctx.fillStyle = beast.color;
            ctx.font = 'bold 14px Microsoft YaHei';
            ctx.textAlign = 'left';
            ctx.fillText(beast.name + ' [' + beast.quality + ']', panelX + 70, itemY + 20);
            
            // 属性
            ctx.fillStyle = '#ccc';
            ctx.font = '12px Microsoft YaHei';
            ctx.fillText('攻击: ' + beast.attack + ' | 血量: ' + beast.hp, panelX + 70, itemY + 38);
            
            // 境界
            ctx.fillStyle = '#888';
            ctx.fillText('境界: ' + beast.realm, panelX + 70, itemY + 54);
            
            // 伙伴标识
            if (isActive) {
                ctx.fillStyle = '#ffd700';
                ctx.font = 'bold 12px Microsoft YaHei';
                ctx.fillText('✓ 伙伴', panelX + 250, itemY + 30);
            }
            
            // 记录点击区域
            game.uiButtons = game.uiButtons || {};
            game.uiButtons['beast_' + beast.id] = { 
                x: panelX + 15, 
                y: itemY, 
                width: panelWidth - 30, 
                height: itemHeight - 5,
                type: 'beast',
                beastId: beast.id
            };
        }
    }
    
    // 切换到仓库按钮
    const warehouseBtnX = panelX + 20;
    const warehouseBtnY = panelY + panelHeight - 50;
    const warehouseBtnW = 140;
    const warehouseBtnH = 35;
    
    ctx.fillStyle = '#6b46c1';
    ctx.fillRect(warehouseBtnX, warehouseBtnY, warehouseBtnW, warehouseBtnH);
    ctx.strokeStyle = '#9f7aea';
    ctx.lineWidth = 2;
    ctx.strokeRect(warehouseBtnX, warehouseBtnY, warehouseBtnW, warehouseBtnH);
    
    ctx.fillStyle = '#fff';
    ctx.font = '14px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('🥚 灵兽仓库', warehouseBtnX + warehouseBtnW/2, warehouseBtnY + 23);
    
    game.uiButtons = game.uiButtons || {};
    game.uiButtons.beastWarehouse = { x: warehouseBtnX, y: warehouseBtnY, width: warehouseBtnW, height: warehouseBtnH };
    
    ctx.textAlign = 'left';
}
