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
    gold: 0,  // v1.3.5: 金币
    startTime: 0,  // v1.2.7: 记录开局时间
    // v1.2.7: 音效系统
    soundEnabled: true,
    // v1.2.8: AudioContext初始化（延迟到用户交互）
    audioCtx: null,
    audioInitialized: false,
    // v1.3.4: 帮助界面显示
    showHelp: false,
    
    // v1.3.5: 暂停状态
    paused: false,
    
    // v1.3.6: 金币商店系统
    showShop: false,
    activePowerups: {}, // 当前激活的增益
    
    // v1.3.9: 购买确认提示
    purchaseConfirm: null,
    
    // v1.2.7: 根据游戏进度调整生成间隔
    getAdjustedSpawnInterval() {
        const elapsed = (Date.now() - this.startTime) / 1000; // 秒
        // 随着时间推移，生成间隔逐渐缩短，最小1.5秒
        const reduction = Math.min(elapsed * 50, this.spawnInterval - this.minSpawnInterval);
        return this.spawnInterval - reduction;
    },
    
    // v1.2.8: 初始化AudioContext（用户首次交互时调用）
    initAudio() {
        if (this.audioInitialized) return;
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.audioInitialized = true;
        } catch(e) {
            console.warn('AudioContext initialization failed:', e);
        }
    },
    
    // v1.2.7: 播放音效
    playSound(type) {
        if (!this.soundEnabled || !window.AudioContext) return;
        
        // v1.2.8: 延迟初始化AudioContext
        if (!this.audioInitialized) {
            this.initAudio();
        }
        
        if (!this.audioCtx) return;
        
        // 简化音效：使用Web Audio API生成简单音效
        try {
            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            
            switch(type) {
                case 'attack':
                    oscillator.frequency.value = 440;
                    gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
                    oscillator.start(this.audioCtx.currentTime);
                    oscillator.stop(this.audioCtx.currentTime + 0.1);
                    break;
                case 'hit':
                    oscillator.frequency.value = 220;
                    gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
                    oscillator.start(this.audioCtx.currentTime);
                    oscillator.stop(this.audioCtx.currentTime + 0.15);
                    break;
                case 'levelup':
                    oscillator.frequency.value = 523;
                    gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
                    oscillator.frequency.setValueAtTime(659, this.audioCtx.currentTime + 0.1);
                    oscillator.frequency.setValueAtTime(784, this.audioCtx.currentTime + 0.2);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
                    oscillator.start(this.audioCtx.currentTime);
                    oscillator.stop(this.audioCtx.currentTime + 0.3);
                    break;
            }
        } catch(e) {
            // 忽略音效播放错误
        }
    },
    
    // v1.0.8: 重新开始 - v1.3.7: 游戏结束后状态重置
    restart() {
        // v1.3.7: 游戏结束时清除所有增益效果
        this.activePowerups = {};
        player.attack = 10; // 重置攻击力
        
        this.state = 'playing';
        this.gameOver = false;
        this.enemies = [];
        this.killCount = 0;
        this.gold = 0;  // v1.3.5: 重置金币
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
    
    // v1.0.2: 添加伤害数字 - v1.3.9: 伤害数字位置优化，稍偏上避免与怪物重叠
    addDamageNumber(x, y, damage, isCrit) {
        this.damageNumbers.push({
            x: x,
            y: y - 20,  // v1.3.9: 向上偏移20px
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
    },
    
    // v1.2.8: 暴击特效
    critEffects: [],
    
    addCritEffect(x, y) {
        this.critEffects.push({
            x: x,
            y: y,
            life: 0.5,
            particles: Array.from({length: 8}, () => ({
                angle: Math.random() * Math.PI * 2,
                speed: 50 + Math.random() * 100,
                size: 2 + Math.random() * 3
            }))
        });
    },
    
    updateCritEffects(dt) {
        this.critEffects = this.critEffects.filter(effect => {
            effect.life -= dt;
            effect.particles.forEach(p => {
                p.x = effect.x + Math.cos(p.angle) * p.speed * (0.5 - effect.life);
                p.y = effect.y + Math.sin(p.angle) * p.speed * (0.5 - effect.life) - 30 * dt;
            });
            return effect.life > 0;
        });
    },
    
    drawCritEffects() {
        this.critEffects.forEach(effect => {
            const screenX = effect.x - CONFIG.cameraOffset;
            ctx.globalAlpha = effect.life * 2;
            ctx.fillStyle = '#ffd700';
            effect.particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x - CONFIG.cameraOffset, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;
        });
    },
    
    // v1.2.8: 升级特效
    levelUpEffects: [],
    
    // v1.3.6: 更新增益效果
    updatePowerups(dt) {
        Object.keys(this.activePowerups).forEach(key => {
            if (this.activePowerups[key] > 0) {
                this.activePowerups[key] -= dt;
                if (this.activePowerups[key] <= 0) {
                    delete this.activePowerups[key];
                    // 增益结束时的处理
                    if (key === 'doubleAttack') {
                        player.attack = Math.floor(player.attack / 2);
                    }
                }
            }
        });
    },
    
    // v1.3.6: 激活增益
    activatePowerup(type, duration, multiplier = 2) {
        this.activePowerups[type] = duration;
        if (type === 'doubleAttack') {
            player.attack = Math.floor(player.attack * multiplier);
        }
    },
    
    addLevelUpEffect(x, y) {
        this.levelUpEffects.push({
            x: x,
            y: y,
            life: 1.5,
            rings: [0, 0.3, 0.6]
        });
    },
    
    updateLevelUpEffects(dt) {
        this.levelUpEffects = this.levelUpEffects.filter(effect => {
            effect.life -= dt;
            effect.rings = effect.rings.map(r => r + dt * 80);
            return effect.life > 0;
        });
    },
    
    drawLevelUpEffects() {
        this.levelUpEffects.forEach(effect => {
            const screenX = effect.x - CONFIG.cameraOffset;
            const progress = 1 - effect.life / 1.5;
            
            // 光柱
            ctx.globalAlpha = effect.life;
            const gradient = ctx.createLinearGradient(screenX, effect.y - 100, screenX, effect.y);
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0)');
            gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(screenX - 20, effect.y - 100, 40, 100);
            
            // 扩散光环
            effect.rings.forEach((radius, i) => {
                ctx.strokeStyle = `rgba(255, 215, 0, ${effect.life * (1 - i * 0.3)})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(screenX, effect.y, radius * 30, 0, Math.PI * 2);
                ctx.stroke();
            });
            
            // "升级!"文字
            ctx.font = 'bold 20px Microsoft YaHei';
            ctx.fillStyle = '#ffd700';
            ctx.textAlign = 'center';
            ctx.fillText('升级!', screenX, effect.y - 60 - progress * 20);
            
            ctx.globalAlpha = 1.0;
        });
    },
    
    // v1.3.9: 更新购买确认提示
    updatePurchaseConfirm(dt) {
        if (this.purchaseConfirm) {
            this.purchaseConfirm.timer -= dt;
            if (this.purchaseConfirm.timer <= 0) {
                this.purchaseConfirm = null;
            }
        }
    },
    
    // v1.3.9: 绘制购买确认提示
    drawPurchaseConfirm() {
        if (!this.purchaseConfirm) return;
        
        const centerX = CONFIG.width / 2;
        const centerY = CONFIG.height / 2;
        
        // 背景
        ctx.fillStyle = 'rgba(0, 200, 0, 0.8)';
        ctx.fillRect(centerX - 100, centerY - 30, 200, 60);
        
        // 文字
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('✓ 购买成功: ' + this.purchaseConfirm.itemName, centerX, centerY + 8);
        
        ctx.textAlign = 'left';
    }
};
