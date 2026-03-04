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
    
    // 攻击
    ctx.fillStyle = '#ffd700';
    ctx.fillText('攻击: ' + player.attack, 20, 60);
    
    // 击杀
    ctx.fillStyle = '#ff6666';
    ctx.fillText('击杀: ' + game.killCount, 130, 60);
    
    // 距离 (v1.2.2: 100px = 1米)
    ctx.fillStyle = '#00ffff';
    ctx.fillText('距离: ' + Math.floor(player.x / 100) + 'm', 20, 80);
    
    // 场景名称
    const scene = getScene(player.x);
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'right';
    ctx.fillText(scene.name, CONFIG.width - 20, 25);
    ctx.textAlign = 'left';
}
