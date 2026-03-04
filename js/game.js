// ===== v1.1.0 游戏状态 =====

const game = {
    state: 'playing',  // v1.1.0: 直接开始，无需开始界面
    running: true,
    gameOver: false,
    lastTime: 0,
    enemies: [],
    spawnTimer: 0,
    // v1.2.7: 怪物生成冷却控制 - 基础间隔3秒，最小1.5秒
    spawnInterval: 3000,
    minSpawnInterval: 1500,
    killCount: 0,
    startTime: 0,  // v1.2.7: 记录开局时间
    // v1.2.7: 音效系统
    soundEnabled: true,
    
    // v1.2.7: 根据游戏进度调整生成间隔
    getAdjustedSpawnInterval() {
        const elapsed = (Date.now() - this.startTime) / 1000; // 秒
        // 随着时间推移，生成间隔逐渐缩短，最小1.5秒
        const reduction = Math.min(elapsed * 50, this.spawnInterval - this.minSpawnInterval);
        return this.spawnInterval - reduction;
    },
    
    // v1.2.7: 播放音效
    playSound(type) {
        if (!this.soundEnabled || !window.AudioContext) return;
        
        // 简化音效：使用Web Audio API生成简单音效
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            switch(type) {
                case 'attack':
                    oscillator.frequency.value = 440;
                    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                    oscillator.start(audioCtx.currentTime);
                    oscillator.stop(audioCtx.currentTime + 0.1);
                    break;
                case 'hit':
                    oscillator.frequency.value = 220;
                    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                    oscillator.start(audioCtx.currentTime);
                    oscillator.stop(audioCtx.currentTime + 0.15);
                    break;
                case 'levelup':
                    oscillator.frequency.value = 523;
                    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                    oscillator.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1);
                    oscillator.frequency.setValueAtTime(784, audioCtx.currentTime + 0.2);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                    oscillator.start(audioCtx.currentTime);
                    oscillator.stop(audioCtx.currentTime + 0.3);
                    break;
            }
        } catch(e) {
            // 忽略音效播放错误
        }
    },
    
    // v1.0.8: 重新开始
    restart() {
        this.state = 'playing';
        this.gameOver = false;
        this.enemies = [];
        this.killCount = 0;
        this.spawnTimer = 0;
        this.damageNumbers = [];
        player.x = 100;
        player.hp = player.maxHp;
        player.exp = 0;
        player.level = 1;
        player.isMoving = true;
        this.lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    },
    
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
