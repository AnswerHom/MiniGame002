// v2.7.0: 主角属性面板

// 属性面板状态
let showStatsPanel = false;
let statsPanelAnimation = 0;  // 0-1 动画进度

// 绘制属性按钮
function drawStatsButton() {
    // 使用与 getButtonArea 一致的位置计算
    const btnPos = {
        x: CONFIG.width - UI_SAFE_ZONE.right - UI_INTERACTION.minButtonSize,
        y: UI_SAFE_ZONE.top + 5 + 100 + (UI_INTERACTION.minButtonSize + UI_INTERACTION.buttonSpacing) * 7
    };
    const btnX = btnPos.x;
    const btnY = btnPos.y;
    const btnSize = UI_INTERACTION.minButtonSize;
    
    // 按钮背景
    ctx.fillStyle = showStatsPanel ? '#4CAF50' : '#4a5568';
    ctx.fillRect(btnX, btnY, btnSize, btnSize);
    
    // 边框
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnSize, btnSize);
    
    // 图标
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📊', btnX + btnSize/2, btnY + 20);
    ctx.textAlign = 'left';
}

// 绘制属性面板
function drawStatsPanel() {
    if (!showStatsPanel && statsPanelAnimation <= 0) return;
    
    // 动画进度
    const progress = showStatsPanel ? Math.min(1, statsPanelAnimation) : Math.max(0, 1 - statsPanelAnimation);
    const scale = 0.8 + 0.2 * progress;
    const alpha = progress;
    
    // 遮罩
    ctx.globalAlpha = alpha * 0.7;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    ctx.globalAlpha = 1;
    
    // 面板
    const panelWidth = 300;
    const panelHeight = 400;
    const panelX = (CONFIG.width - panelWidth) / 2;
    const panelY = (CONFIG.height - panelHeight) / 2;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(CONFIG.width / 2, CONFIG.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-CONFIG.width / 2, -CONFIG.height / 2);
    
    // 面板背景
    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 10);
    ctx.fill();
    ctx.stroke();
    
    // 标题
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 20px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('📊 主角属性', CONFIG.width / 2, panelY + 30);
    
    // 属性列表
    ctx.textAlign = 'left';
    ctx.font = '16px Microsoft YaHei';
    let y = panelY + 60;
    const lineHeight = 30;
    const labelX = panelX + 20;
    const valueX = panelX + 150;
    
    // 等级
    ctx.fillStyle = '#aaa';
    ctx.fillText('等级', labelX, y);
    ctx.fillStyle = '#fff';
    ctx.fillText('Lv.' + player.level, valueX, y);
    y += lineHeight;
    
    // 经验
    ctx.fillStyle = '#aaa';
    ctx.fillText('经验', labelX, y);
    ctx.fillStyle = '#4CAF50';
    ctx.fillText(player.exp + '/' + player.requiredExp, valueX, y);
    y += lineHeight;
    
    // 生命
    ctx.fillStyle = '#aaa';
    ctx.fillText('生命', labelX, y);
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText(player.hp + '/' + player.maxHp, valueX, y);
    y += lineHeight;
    
    // 攻击力
    ctx.fillStyle = '#aaa';
    ctx.fillText('攻击力', labelX, y);
    ctx.fillStyle = '#ffd700';
    const totalAttack = player.attack + (player.initialEquipment?.weapon?.attackBonus || 0);
    ctx.fillText('' + totalAttack, valueX, y);
    y += lineHeight;
    
    // 防御力
    ctx.fillStyle = '#aaa';
    ctx.fillText('防御力', labelX, y);
    ctx.fillStyle = '#63b3ed';
    ctx.fillText('' + player.defense, valueX, y);
    y += lineHeight;
    
    // 暴击率
    ctx.fillStyle = '#aaa';
    ctx.fillText('暴击率', labelX, y);
    ctx.fillStyle = '#f472b6';
    ctx.fillText((player.critRate * 100).toFixed(0) + '%', valueX, y);
    y += lineHeight;
    
    // 移动速度
    ctx.fillStyle = '#aaa';
    ctx.fillText('移动速度', labelX, y);
    ctx.fillStyle = '#68d391';
    ctx.fillText('' + player.speed, valueX, y);
    y += lineHeight;
    
    // 武器类型
    ctx.fillStyle = '#aaa';
    ctx.fillText('武器类型', labelX, y);
    ctx.fillStyle = '#a78bfa';
    const weapon = WEAPON_SYSTEM[player.weaponType];
    ctx.fillText(weapon ? weapon.name : '剑', valueX, y);
    y += lineHeight;
    
    // 武器特效
    ctx.fillStyle = '#aaa';
    ctx.fillText('武器特效', labelX, y);
    ctx.fillStyle = '#fb923c';
    if (weapon && weapon.effect === 'combo') ctx.fillText('连击+' + (WeaponEffectManager.combo.count * 5) + '%', valueX, y);
    else if (weapon && weapon.effect === 'lifesteal') ctx.fillText('吸血+10%', valueX, y);
    else if (weapon && weapon.effect === 'pierce') ctx.fillText('穿透3人', valueX, y);
    else ctx.fillText('无', valueX, y);
    y += lineHeight;
    
    // 境界
    const realm = getRealm(player.level);
    ctx.fillStyle = '#aaa';
    ctx.fillText('境界', labelX, y);
    ctx.fillStyle = REALM_COLORS[realm.name] || '#fff';
    ctx.fillText(realm.name, valueX, y);
    
    // 关闭提示
    ctx.fillStyle = '#666';
    ctx.font = '14px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('点击任意位置关闭', CONFIG.width / 2, panelY + panelHeight - 20);
    
    ctx.restore();
}

// 更新属性面板动画
function updateStatsPanel(dt) {
    if (showStatsPanel && statsPanelAnimation < 1) {
        statsPanelAnimation += dt * 5;  // 0.2秒
    } else if (!showStatsPanel && statsPanelAnimation > 0) {
        statsPanelAnimation -= dt * 6.67;  // 0.15秒
    }
}

// 处理属性面板点击
function handleStatsPanelClick(clickX, clickY) {
    if (showStatsPanel) {
        const panelWidth = 300;
        const panelHeight = 400;
        const panelX = (CONFIG.width - panelWidth) / 2;
        const panelY = (CONFIG.height - panelHeight) / 2;
        
        // 点击遮罩关闭
        if (clickX < panelX || clickX > panelX + panelWidth || clickY < panelY || clickY > panelY + panelHeight) {
            showStatsPanel = false;
            return true;
        }
    }
    return false;
}

// 切换属性面板
function toggleStatsPanel() {
    showStatsPanel = !showStatsPanel;
}
