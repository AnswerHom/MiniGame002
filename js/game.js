// ===== v1.4.3 游戏状态 =====

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
    
    // v1.4.3: 伤害统计
    totalDamage: 0,
    totalGoldEarned: 0,  // v1.4.3: 金币获取统计
    
    // v1.4.3: 连杀系统
    killStreak: 0,
    lastKillTime: 0,
    killStreakTimeout: 2000,  // 2秒内击杀算连杀
    
    // v1.4.3: 屏幕震动
    screenShake: {
        active: false,
        intensity: 0,
        duration: 0,
        timer: 0,
        offsetX: 0,
        offsetY: 0
    },
    
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
    
    // v1.4.3: 触发屏幕震动
    // 振幅5px，持续0.1秒
    triggerScreenShake(intensity = 5, duration = 0.1) {
        this.screenShake.active = true;
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
        this.screenShake.timer = duration;
    },
    
    // v1.4.3: 更新屏幕震动
    updateScreenShake(dt) {
        if (this.screenShake.active) {
            this.screenShake.timer -= dt;
            if (this.screenShake.timer <= 0) {
                this.screenShake.active = false;
                this.screenShake.offsetX = 0;
                this.screenShake.offsetY = 0;
            } else {
                // 随机偏移
                const progress = 1 - (this.screenShake.timer / this.screenShake.duration);
                const currentIntensity = this.screenShake.intensity * (1 - progress);
                this.screenShake.offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
                this.screenShake.offsetY = (Math.random() - 0.5) * 2 * currentIntensity;
            }
        }
    },
    
    // v1.4.3: 连杀系统 - 记录击杀
    recordKill() {
        const now = Date.now();
        if (now - this.lastKillTime < this.killStreakTimeout) {
            this.killStreak++;
        } else {
            this.killStreak = 1;
        }
        this.lastKillTime = now;
    },
    
    // v1.4.3: 更新连杀状态（超时重置）
    updateKillStreak() {
        const now = Date.now();
        if (this.killStreak > 0 && now - this.lastKillTime >= this.killStreakTimeout) {
            this.killStreak = 0;
        }
    },
    
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
    
    // v1.4.0: 重新开始 - v1.3.7: 游戏结束后状态重置 - v1.4.3: 添加统计重置
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
        
        // v1.4.3: 重置统计
        this.totalDamage = 0;
        this.totalGoldEarned = 0;
        this.killStreak = 0;
        this.lastKillTime = 0;
        
        player.x = 100;
        player.hp = player.maxHp;
        player.exp = 0;
        player.level = 1;
        player.isMoving = true;
        this.lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    },
    
    // v1.4.0: 暴击视觉反馈 - 红色+更大字号
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
    
    // v1.0.2: 更新伤害数字 - v1.4.0: 暴击用红色+更大字号
    updateDamageNumbers(dt) {
        this.damageNumbers = this.damageNumbers.filter(dn => {
            dn.y += dn.vy * dt;
            dn.life -= dt;
            return dn.life > 0;
        });
    },
    
    // v1.0.2: 绘制伤害数字 - v1.4.0: 暴击显示为红色+更大字号
    drawDamageNumbers() {
        this.damageNumbers.forEach(dn => {
            const screenX = dn.x - CONFIG.cameraOffset;
            // v1.4.0: 暴击使用红色和更大字号
            ctx.font = dn.isCrit ? 'bold 22px Microsoft YaHei' : '14px Microsoft YaHei';
            ctx.textAlign = 'center';
            // v1.4.0: 暴击伤害显示为红色
            ctx.fillStyle = dn.isCrit ? '#ff3333' : '#fff';
            ctx.globalAlpha = dn.life;
            ctx.fillText(dn.damage, screenX, dn.y);
            ctx.globalAlpha = 1.0;
        });
    },
    
    // v1.4.3: 绘制连杀数 - v1.4.4: 添加倒计时显示
    drawKillStreak() {
        if (this.killStreak >= 2) {
            // 连杀文字显示在玩家上方
            const screenX = player.x - CONFIG.cameraOffset;
            const screenY = player.y - player.height - 40;
            
            // 计算剩余时间
            const remainingTime = Math.max(0, (this.killStreakTimeout - (Date.now() - this.lastKillTime)) / 1000);
            
            // 发光效果
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 10;
            
            // 连杀文字
            ctx.font = 'bold 24px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffd700';
            ctx.fillText(this.killStreak + '连杀!', screenX + 16, screenY);
            
            // v1.4.4: 倒计时显示
            if (remainingTime > 0) {
                ctx.font = '14px Microsoft YaHei';
                ctx.fillStyle = '#aaa';
                ctx.fillText(remainingTime.toFixed(1) + 's', screenX + 16, screenY + 18);
            }
            
            // 重置阴影
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
        }
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
    
    // v1.4.4: 打击火花效果
    hitEffects: [],
    
    addHitEffect(x, y, isCrit) {
        this.hitEffects.push({
            x: x,
            y: y,
            life: 0.3,
            isCrit: isCrit,
            particles: Array.from({length: isCrit ? 12 : 6}, () => ({
                angle: Math.random() * Math.PI * 2,
                speed: 30 + Math.random() * 60,
                size: isCrit ? 3 + Math.random() * 3 : 2 + Math.random() * 2
            }))
        });
    },
    
    updateHitEffects(dt) {
        this.hitEffects = this.hitEffects.filter(effect => {
            effect.life -= dt;
            effect.particles.forEach(p => {
                p.x = effect.x + Math.cos(p.angle) * p.speed * (0.3 - effect.life);
                p.y = effect.y + Math.sin(p.angle) * p.speed * (0.3 - effect.life) - 20 * dt;
            });
            return effect.life > 0;
        });
    },
    
    drawHitEffects() {
        this.hitEffects.forEach(effect => {
            const screenX = effect.x - CONFIG.cameraOffset;
            ctx.globalAlpha = effect.life * 3;
            ctx.fillStyle = effect.isCrit ? '#ffd700' : '#fff';
            effect.particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x - CONFIG.cameraOffset, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;
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
    
    // v1.4.0: 敌人死亡动画系统
    deathEffects: [],
    
    addDeathEffect(enemy) {
        this.deathEffects.push({
            x: enemy.x,
            y: enemy.y - enemy.height / 2,
            width: enemy.width,
            height: enemy.height,
            type: enemy.type,
            realmColor: enemy.realmColor,
            life: 0.3,  // v1.4.0: 0.3秒淡出
            maxLife: 0.3
        });
    },
    
    updateDeathEffects(dt) {
        this.deathEffects = this.deathEffects.filter(effect => {
            effect.life -= dt;
            return effect.life > 0;
        });
    },
    
    drawDeathEffects() {
        this.deathEffects.forEach(effect => {
            const screenX = effect.x - CONFIG.cameraOffset;
            const progress = 1 - (effect.life / effect.maxLife);
            
            // v1.4.0: 淡出效果
            ctx.globalAlpha = effect.life / effect.maxLife;
            
            // 绘制简化的死亡形态（淡出）
            ctx.fillStyle = effect.realmColor;
            ctx.beginPath();
            ctx.arc(screenX + effect.width/2, effect.y - effect.height/2, 
                    (effect.width/2) * (1 + progress * 0.5), 0, Math.PI * 2);
            ctx.fill();
            
            // 粒子飞散效果
            ctx.fillStyle = effect.realmColor;
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const dist = progress * 30;
                const px = screenX + effect.width/2 + Math.cos(angle) * dist;
                const py = effect.y + Math.sin(angle) * dist;
                ctx.beginPath();
                ctx.arc(px, py, 3 * (1 - progress), 0, Math.PI * 2);
                ctx.fill();
            }
            
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
    },
    
    // v1.4.3: 记录造成的伤害
    recordDamage(damage) {
        this.totalDamage += damage;
    },
    
    // v1.4.3: 记录获取的金币
    recordGold(amount) {
        this.gold += amount;
        this.totalGoldEarned += amount;
    }
};
