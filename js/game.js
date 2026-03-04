// ===== v1.0.2 游戏状态 =====

const game = {
    running: true,
    gameOver: false,
    lastTime: 0,
    enemies: [],
    spawnTimer: 0,
    spawnInterval: 3000,
    killCount: 0,
    // v1.0.2: 伤害数字
    damageNumbers: [],
    
    // v1.0.2: 添加伤害数字
    addDamageNumber(x, y, damage, isCrit) {
        this.damageNumbers.push({
            x: x,
            y: y,
            damage: damage,
            isCrit: isCrit,
            life: 1.0,  // 1秒生命周期
            vy: -30     // 向上飘动速度
        });
    },
    
    // v1.0.2: 更新伤害数字
    updateDamageNumbers(dt) {
        this.damageNumbers = this.damageNumbers.filter(dn => {
            dn.y += dn.vy * dt;
            dn.life -= dt;
            return dn.life > 0;
        });
    },
    
    // v1.0.2: 绘制伤害数字
    drawDamageNumbers() {
        this.damageNumbers.forEach(dn => {
            const screenX = dn.x - CONFIG.cameraOffset;
            ctx.font = dn.isCrit ? 'bold 18px Microsoft YaHei' : '14px Microsoft YaHei';
            ctx.textAlign = 'center';
            // v1.0.2: 暴击伤害显示为金色
            ctx.fillStyle = dn.isCrit ? '#ffd700' : '#fff';
            ctx.globalAlpha = dn.life;
            ctx.fillText(dn.damage, screenX, dn.y);
            ctx.globalAlpha = 1.0;
        });
    }
};
