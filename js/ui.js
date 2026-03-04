// ===== v1.0.0 UI模块 =====

function drawUI() {
    const realm = player.getRealm();
    
    // 等级和经验
    ctx.fillStyle = '#333';
    ctx.fillRect(20, 20, 160, 16);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(20, 20, 160 * (player.exp / player.requiredExp), 16);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Microsoft YaHei';
    ctx.fillText('Lv.' + player.level, 24, 32);
    
    // 血条
    ctx.fillStyle = '#333';
    ctx.fillRect(20, 40, 160, 12);
    ctx.fillStyle = player.hp > 30 ? '#44ff44' : '#ff4444';
    ctx.fillRect(20, 40, 160 * (player.hp / player.maxHp), 12);
    ctx.fillStyle = '#fff';
    ctx.font = '10px Microsoft YaHei';
    ctx.fillText(player.hp + '/' + player.maxHp, 100, 49);
    
    // 属性
    ctx.fillStyle = '#fff';
    ctx.font = '12px Microsoft YaHei';
    ctx.fillText('攻击: ' + player.attack, 190, 30);
    ctx.fillStyle = '#ff00ff';
    ctx.fillText('境界: ' + realm.name, CONFIG.width - 80, 30);
    
    // 距离
    ctx.fillStyle = '#00ffff';
    ctx.fillText('距离: ' + Math.floor((player.x - 100) / 10) + 'm', CONFIG.width - 80, 50);
    
    // 击杀数
    ctx.fillStyle = '#ff6666';
    ctx.fillText('击杀: ' + game.killCount, CONFIG.width - 80, 70);
}
