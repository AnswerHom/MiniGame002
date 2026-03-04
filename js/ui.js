// ===== v1.0.0 UI模块 =====

function drawUI() {
    // 等级
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Lv.' + player.level, 20, 25);
    
    // 血条背景
    ctx.fillStyle = '#333';
    ctx.fillRect(20, 35, 100, 10);
    // 血条
    ctx.fillStyle = player.hp > 30 ? '#44ff44' : '#ff4444';
    ctx.fillRect(20, 35, 100 * Math.max(0, player.hp / player.maxHp), 10);
    
    // 攻击
    ctx.fillStyle = '#fff';
    ctx.fillText('ATK: ' + player.attack, 130, 25);
    
    // 击杀
    ctx.fillStyle = '#ff6666';
    ctx.fillText('Kills: ' + game.killCount, 130, 40);
    
    // 距离
    ctx.fillStyle = '#00ffff';
    ctx.fillText('Dist: ' + Math.floor(player.x / 10) + 'm', 20, 60);
}
