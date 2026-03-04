// ===== v1.0.0 UI模块 =====

function drawUI() {
    ctx.font = '14px Microsoft YaHei';
    ctx.textAlign = 'left';
    
    // 等级
    ctx.fillStyle = '#fff';
    ctx.fillText('等级: Lv.' + player.level, 20, 25);
    
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
    
    // 距离
    ctx.fillStyle = '#00ffff';
    ctx.fillText('距离: ' + Math.floor(player.x / 10) + 'm', 20, 80);
}
