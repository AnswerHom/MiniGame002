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
    
    // v1.5.6: 背包界面
    drawBackpackUI();
    
    // v1.8.0: 技能按钮
    drawSkillButton();
    
    // v1.8.0: 技能界面
    drawSkillPanelUI();
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


// ===== v1.0.5 基础配置 =====
// 包含：canvas初始化、基础配置

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CONFIG = { width: 800, height: 450, groundY: 380, cameraOffset: 0, distanceScale: 10 };  // v1.2.3: 10px = 1米
canvas.width = CONFIG.width;
canvas.height = CONFIG.height;

const BATTLE_STATES = {
    ADVANCE: 'advance',
    COMBAT: 'combat',
    VICTORY: 'victory'
};

// 境界系统
const REALMS = [
    { name: '练气', minLevel: 1 },
    { name: '筑基', minLevel: 5 },
    { name: '金丹', minLevel: 10 },
    { name: '元婴', minLevel: 15 },
    { name: '化神', minLevel: 20 },
    { name: '炼虚', minLevel: 25 },
    { name: '合体', minLevel: 30 },
    { name: '大乘', minLevel: 35 },
    { name: '渡劫', minLevel: 40 },
    { name: '飞升', minLevel: 50 }
];

const REALM_COLORS = {
    '练气': '#888888',
    '筑基': '#4ade80',
    '金丹': '#fbbf24',
    '元婴': '#f97316',
    '化神': '#ef4444',
    '炼虚': '#ec4899',
    '合体': '#8b5cf6',
    '大乘': '#3b82f6',
    '渡劫': '#06b6d4',
    '飞升': '#fbbf24'
};

function getRealm(level) {
    for (let i = REALMS.length - 1; i >= 0; i--) {
        if (level >= REALMS[i].minLevel) return REALMS[i];
    }
    return REALMS[0];
}
