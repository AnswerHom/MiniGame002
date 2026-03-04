// ===== UI界面模块 =====
// 包含：UI绘制函数

// UI绘制函数 - 在 draw() 中调用
function drawUI() {
    const realm = player.getRealm();
    
    // 经验条
    const expPercent = player.exp / player.requiredExp;
    ctx.fillStyle = '#333'; ctx.fillRect(20, 20, 160, 16);
    ctx.fillStyle = '#ffd700'; ctx.fillRect(20, 20, 160 * expPercent, 16);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(20, 20, 160, 16);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Microsoft YaHei'; ctx.textAlign = 'left';
    ctx.fillText('Lv.' + player.level, 24, 32); ctx.textAlign = 'right';
    ctx.fillText(player.exp + '/' + player.requiredExp, 176, 32);
    
    // 血条
    const hpPercent = Math.max(0, player.hp) / player.maxHp;
    ctx.fillStyle = '#333'; ctx.fillRect(20, 40, 160, 12);
    ctx.fillStyle = hpPercent > 0.3 ? '#44ff44' : '#ff4444'; ctx.fillRect(20, 40, 160 * Math.max(0, hpPercent), 12);
    ctx.strokeStyle = '#fff'; ctx.strokeRect(20, 40, 160, 12);
    ctx.fillStyle = '#fff'; ctx.font = '10px Microsoft YaHei'; ctx.textAlign = 'center';
    ctx.fillText(Math.max(0, player.hp) + '/' + player.maxHp, 100, 49);
    
    // 攻击力
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Microsoft YaHei'; ctx.textAlign = 'left';
    ctx.fillText('攻击: ' + player.attack, 190, 32);
    
    // 防御力
    ctx.fillStyle = '#88ff88'; ctx.font = '10px Microsoft YaHei';
    ctx.fillText('防御: ' + player.defense, 190, 44);
    
    // 暴击率
    const critPercent = Math.floor(player.getCritRate() * 100);
    ctx.fillStyle = '#ff6666'; ctx.font = '10px Microsoft YaHei';
    ctx.fillText('暴击: ' + critPercent + '%', 190, 56);
    
    // 境界
    ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 12px Microsoft YaHei'; ctx.textAlign = 'right';
    ctx.fillText('境界: ' + realm.name, CONFIG.width - 20, 25);
    
    // 距离
    ctx.fillStyle = '#00ffff'; ctx.font = '11px Microsoft YaHei';
    ctx.fillText('距离: ' + game.distance + 'm', CONFIG.width - 20, 42);
    
    // 战斗状态
    if (game.battleState === BATTLE_STATES.COMBAT) {
        ctx.fillStyle = '#ff6600'; ctx.font = 'bold 12px Microsoft YaHei'; ctx.textAlign = 'right';
        ctx.fillText('⚔️ 战斗中', CONFIG.width - 20, 56);
    } else if (game.battleState === BATTLE_STATES.VICTORY) {
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 12px Microsoft YaHei'; ctx.textAlign = 'right';
        ctx.fillText('🎉 胜利', CONFIG.width - 20, 56);
    }
    
    // 击杀数
    ctx.fillStyle = '#ff6666'; ctx.font = '11px Microsoft YaHei';
    ctx.fillText('击杀: ' + game.killCount, CONFIG.width - 80, 25);
    
    // 连杀
    if (game.comboCount >= 3) {
        ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 12px Microsoft YaHei';
        ctx.fillText('连杀: ' + game.comboCount, CONFIG.width - 80, 42);
    }
    
    // 技能点
    ctx.fillStyle = '#00ffff'; ctx.font = 'bold 11px Microsoft YaHei'; ctx.textAlign = 'left';
    ctx.fillText('💎 技能点: ' + game.skillPoints, 20, 70);
    
    // 金币
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px Microsoft YaHei';
    ctx.fillText('💰 金币: ' + game.gold, 120, 70);
}
