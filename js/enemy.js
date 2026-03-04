const ENEMY_TYPES = {
    阴魂: { minLevel: 1, hp: 20, attack: 5, exp: 20, speed: 50, color: '#7b2d8e', special: null },
    妖狼: { minLevel: 5, hp: 30, attack: 10, exp: 35, speed: 80, color: '#8B4513', special: 'fast' },
    毒蛛: { minLevel: 10, hp: 25, attack: 8, exp: 30, speed: 40, color: '#2E8B57', special: 'slow' },
    僵尸: { minLevel: 15, hp: 50, attack: 12, exp: 50, speed: 30, color: '#4A5D23', special: 'tank' },
    // v1.10.1 怪物形态 - 鬼魂类
    游魂: { minLevel: 1, hp: 15, attack: 4, exp: 15, speed: 60, color: '#ffffff', special: null, form: 'ghost', formDetail: '游魂' },
    恶灵: { minLevel: 3, hp: 25, attack: 7, exp: 25, speed: 55, color: '#4a5568', special: null, form: 'ghost', formDetail: '恶灵' },
    厉鬼: { minLevel: 8, hp: 35, attack: 12, exp: 40, speed: 50, color: '#1a202c', special: 'elite', form: 'ghost', formDetail: '厉鬼' },
    // v1.10.1 怪物形态 - 兽类
    苍狼: { minLevel: 5, hp: 25, attack: 8, exp: 30, speed: 90, color: '#6b7280', special: 'fast', form: 'beast', formDetail: '苍狼' },
    猛虎: { minLevel: 10, hp: 45, attack: 15, exp: 50, speed: 70, color: '#d69e2e', special: 'elite', form: 'beast', formDetail: '猛虎' },
    獠牙猪: { minLevel: 12, hp: 55, attack: 18, exp: 60, speed: 45, color: '#1a1a1a', special: 'tank', form: 'beast', formDetail: '獠牙猪' },
    // v1.10.1 怪物形态 - 虫类
    毒蛛: { minLevel: 10, hp: 25, attack: 8, exp: 30, speed: 40, color: '#2E8B57', special: 'slow', form: 'bug', formDetail: '毒蛛' },
    蜈蚣: { minLevel: 12, hp: 35, attack: 12, exp: 40, speed: 55, color: '#8B0000', special: null, form: 'bug', formDetail: '蜈蚣' },
    蝎子: { minLevel: 15, hp: 40, attack: 15, exp: 50, speed: 35, color: '#4b0082', special: 'elite', form: 'bug', formDetail: '蝎子' },
    // v1.10.1 怪物形态 - 尸类
    僵尸: { minLevel: 15, hp: 50, attack: 12, exp: 50, speed: 30, color: '#68d391', special: 'tank', form: 'undead', formDetail: '僵尸' },
    跳尸: { minLevel: 18, hp: 60, attack: 15, exp: 60, speed: 50, color: '#2f855a', special: 'fast', form: 'undead', formDetail: '跳尸' },
    铜甲尸: { minLevel: 20, hp: 80, attack: 20, exp: 80, speed: 25, color: '#b7791f', special: 'eliteTank', form: 'undead', formDetail: '铜甲尸' },
    // v1.7.0 精英怪物
    精英阴魂: { minLevel: 1, hp: 40, attack: 10, exp: 40, speed: 60, color: '#9b4dbe', special: 'elite', elite: true },
    精英妖狼: { minLevel: 5, hp: 60, attack: 20, exp: 70, speed: 90, color: '#ab6513', special: 'eliteFast', elite: true },
    精英毒蛛: { minLevel: 10, hp: 50, attack: 16, exp: 60, speed: 50, color: '#3E9B67', special: 'eliteSlow', elite: true },
    精英僵尸: { minLevel: 15, hp: 100, attack: 24, exp: 100, speed: 35, color: '#5A6D33', special: 'eliteTank', elite: true }
};

class Enemy {
    constructor(x, type) {
        this.x = x; this.y = CONFIG.groundY; this.type = type;
        const config = ENEMY_TYPES[type];
        this.width = type === '妖狼' ? 50 : 40;
        this.height = type === '僵尸' ? 55 : (type === '毒蛛' ? 35 : 50);
        this.hp = config.hp; this.maxHp = config.hp; this.attack = config.attack;
        this.exp = config.exp; this.color = config.color; this.speed = config.speed; this.special = config.special;
        this.attackCooldown = 0; this.attackRange = 30; this.damageFlash = 0;
        this.alive = true; this.attackFrame = 0; this.attacking = false;
        
        // v1.10.1 怪物形态属性
        this.form = config.form || null;
        this.formDetail = config.formDetail || type;
        
        // v1.11.0 战斗表现 - 受伤闪白计时器
        this.hitFlashTimer = 0;
        
        // v1.11.0 战斗表现 - 死亡光芒消散计时器
        this.deathGlowTimer = 0;
        this.dissolving = false;
        
        // v1.10.1 根据形态调整大小
        if (this.form === 'ghost') {
            if (this.formDetail === '游魂') { this.width = 30; this.height = 40; }
            else if (this.formDetail === '恶灵') { this.width = 40; this.height = 55; }
            else if (this.formDetail === '厉鬼') { this.width = 45; this.height = 60; }
        } else if (this.form === 'beast') {
            if (this.formDetail === '苍狼') { this.width = 45; this.height = 40; }
            else if (this.formDetail === '猛虎') { this.width = 55; this.height = 50; }
            else if (this.formDetail === '獠牙猪') { this.width = 60; this.height = 55; }
        } else if (this.form === 'bug') {
            if (this.formDetail === '毒蛛') { this.width = 40; this.height = 35; }
            else if (this.formDetail === '蜈蚣') { this.width = 50; this.height = 20; }
            else if (this.formDetail === '蝎子') { this.width = 45; this.height = 30; }
        } else if (this.form === 'undead') {
            if (this.formDetail === '僵尸') { this.width = 40; this.height = 55; }
            else if (this.formDetail === '跳尸') { this.width = 40; this.height = 55; }
            else if (this.formDetail === '铜甲尸') { this.width = 50; this.height = 60; }
        }
        
        // v1.10.1 境界对应怪物颜色调整（根据玩家境界）
        this.realmGlow = this.getRealmGlow();
    }
    
    // v1.10.1 获取境界光晕颜色
    getRealmGlow() {
        const realm = player.getRealm();
        const realmGlowColors = {
            '筑基': 'rgba(0, 255, 0, 0.3)',
            '金丹': 'rgba(0, 100, 255, 0.3)',
            '元婴': 'rgba(0, 255, 255, 0.3)',
            '化神': 'rgba(255, 255, 0, 0.3)',
            '炼虚': 'rgba(255, 165, 0, 0.3)',
            '合体': 'rgba(255, 0, 0, 0.3)',
            '大乘': 'rgba(128, 0, 128, 0.3)',
            '渡劫': 'rgba(147, 112, 219, 0.3)',
            '飞升': 'rainbow'
        };
        return realmGlowColors[realm.name] || null;
    }
    
    takeDamage(damage, isCrit = false) {
        this.hp -= damage; 
        // v1.11.0 战斗表现 - 受伤闪白效果
        this.hitFlashTimer = 0.15;
        this.damageFlash = 0.2;
        
        const textColor = isCrit ? '#ff0000' : '#ff4444';
        const text = isCrit ? '-' + Math.floor(damage) + '!' : '-' + Math.floor(damage);
        createFloatingText(this.x + this.width/2, this.y - this.height, text, textColor);
        
        // 暴击时额外粒子效果
        if (isCrit) {
            for (let i = 0; i < 10; i++) {
                createParticle(this.x + this.width/2, this.y - this.height/2, '#ffff00', 4);
            }
            // v1.11.0 暴击时更大范围特效
            for (let i = 0; i < 8; i++) {
                createParticle(this.x + this.width/2, this.y - this.height/2, '#ff6600', 5);
            }
        }
        
        // v1.11.0 打击特效 - 命中时增加粒子爆发
        const hitParticles = isCrit ? 12 : 6;
        for (let i = 0; i < hitParticles; i++) {
            createParticle(
                this.x + this.width/2 + (Math.random() - 0.5) * 20, 
                this.y - this.height/2 + (Math.random() - 0.5) * 20, 
                isCrit ? '#ffaa00' : '#ffffff', 
                isCrit ? 4 : 2
            );
        }
        
        // v1.11.0 击退效果
        const knockback = isCrit ? 15 : 8;
        this.x -= knockback;
        
        if (this.hp <= 0) this.die();
    }
    
    die() {
        // v1.11.0 战斗表现 - 死亡化作光芒消散
        this.dissolving = true;
        this.deathGlowTimer = 0.5;  // 0.5秒消散时间
        
        this.alive = false;
        game.expOrbs.push(new ExpOrb(this.x + this.width/2, this.y - this.height/2, this.exp));
        game.killCount++; game.comboCount++; game.comboTimer = 2;  // v1.7.0: 2秒连击窗口
        
        // v1.7.0 击杀获得技能点 (每5个击杀获得1点)
        if (game.killCount % 5 === 0) {
            game.skillPoints++;
            createFloatingText(player.x, player.y - 120, '💎 获得1技能点!', '#00ffff');
        }
        
        // v1.7.0 金币掉落 - v1.8.0 改为金币对象支持自动拾取
        const goldDrop = Math.floor(this.exp / 4);
        if (goldDrop > 0) {
            // 创建金币对象
            game.goldCoins.push(new GoldCoin(this.x + this.width/2, this.y - this.height/2, goldDrop));
            createFloatingText(this.x + this.width/2, this.y - this.height - 40, '💰 +' + goldDrop, '#ffd700');
        }
        
        // v1.7.0 精英怪死亡减速周围敌人
        if (this.elite) {
            game.enemies.forEach(enemy => {
                if (enemy.alive && enemy !== this) {
                    const dist = Math.abs(enemy.x - this.x);
                    if (dist < 150) {
                        enemy.slowed = true;
                        enemy.slowTimer = 2;
                    }
                }
            });
            createFloatingText(this.x, this.y - this.height - 60, '💥 减速光环!', '#ff00ff');
        }
        
        // v1.7.0 增强死亡粒子效果
        for (let i = 0; i < (this.elite ? 30 : 15); i++) {
            createParticle(this.x + this.width/2, this.y - this.height/2, this.elite ? '#ff00ff' : this.color, this.elite ? 8 : 5);
        }
        
        // v1.11.0 战斗表现 - 死亡化作光芒消散特效
        const glowColor = this.elite ? '#ff00ff' : (this.color || '#ffffff');
        for (let i = 0; i < 15; i++) {
            createParticle(
                this.x + this.width/2 + (Math.random() - 0.5) * 30,
                this.y - this.height/2 + (Math.random() - 0.5) * 30,
                glowColor,
                4 + Math.random() * 4
            );
        }
        // 精英怪死亡有特殊动画
        if (this.elite) {
            for (let i = 0; i < 20; i++) {
                createParticle(
                    this.x + this.width/2 + (Math.random() - 0.5) * 40,
                    this.y - this.height/2 + (Math.random() - 0.5) * 40,
                    '#ffd700',
                    5 + Math.random() * 5
                );
            }
        }
        
        // v1.4.0 连携系统 - 检查是否触发连携技
        checkComboSkill();
        
        // 击杀获得怒气
        player.addRage(10);
        
        // 尝试掉落装备
        tryDropEquipment(this);
        
        // v1.4.0 符文掉落 - BOSS战利品
        if (this.isBoss || Math.random() < 0.05) {
            tryDropRune(this);
        }
        
        // 副本中击杀
        if (game.dungeon) {
            game.dungeonEnemiesRemaining--;
            if (game.dungeonEnemiesRemaining <= 0) {
                completeDungeon.call(this);
            }
        }
        
        // 境界突破守护者死亡
        if (game.guardian === this) {
            game.guardianDefeated = true;
            game.realmBreakthrough = false;
            const realm = getRealm(player.level);
            createFloatingText(player.x, this.y - 80, '突破成功! 境界:' + realm.name, '#ff00ff');
            createParticle(this.x, this.y - 30, '#ff00ff', 30);
            player.realmBreakthroughPending = false;
            game.guardian = null;
        }
        
        // 慢动作效果
        game.slowMotion = 0.1;
        
        // 击杀屏幕震动
        game.screenShake = 0.15; game.screenShakeIntensity = 8;
        
        let comboReward = 0;
        if (game.comboCount >= 10) comboReward = game.comboRewards[10];
        else if (game.comboCount >= 5) comboReward = game.comboRewards[5];
        else if (game.comboCount >= 3) comboReward = game.comboRewards[3];
        if (comboReward > 0) { 
            player.addExp(comboReward); 
            createFloatingText(this.x, this.y - this.height - 20, game.comboCount + '连杀! +' + comboReward, '#ff00ff');
            // v1.8.0 连击音效
            playSound('combo');
        }
        for (let i = 0; i < 15; i++) createParticle(this.x + this.width/2, this.y - this.height/2, this.color, 6);
    }
    
    update(dt) {
        if (!this.alive) {
            // v1.11.0 战斗表现 - 死亡消散动画更新
            if (this.dissolving) {
                this.deathGlowTimer -= dt;
                if (this.deathGlowTimer <= 0) {
                    this.dissolving = false;  // 完全消失
                }
            }
            return;
        }
        
        // v1.11.0 战斗表现 - 受伤闪白计时器
        if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
        if (this.damageFlash > 0) this.damageFlash -= dt;
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.attacking) { this.attackFrame += dt * 8; if (this.attackFrame >= 1) this.attacking = false; }
        const dist = player.x - this.x;
        // 怪物从右侧过来时会接近玩家（无论在左侧还是右侧都要靠近）
        if (Math.abs(dist) < 600) this.x += this.speed * Math.sign(dist) * dt;
        // 玩家攻击怪物 - 无论怪物在左还是在右
        if (Math.abs(dist) < player.attackRange + player.width/2 && this.attackCooldown <= 0) {
            this.attacking = true; this.attackFrame = 0; this.attackCooldown = this.special === 'fast' ? 0.8 : 1.5;
            
            // v1.7.0 护体光环反伤检测
            if (player.shieldReflecting) {
                const damage = this.attack;
                const reflectDamage = damage * 0.5;
                this.takeDamage(reflectDamage);
                createFloatingText(this.x, this.y - this.height - 20, '反伤 ' + Math.floor(reflectDamage), '#00ffff');
                createParticle(this.x + this.width/2, this.y - this.height/2, '#00ffff', 10);
                game.screenShake = 0.1; game.screenShakeIntensity = 3;
            } else if (player.takeDamage()) {
                // 防御力减伤
                let damage = player.defense > 0 ? Math.max(1, this.attack - player.defense * 0.5) : this.attack;
                player.hp -= damage;
                createFloatingText(player.x, player.y - player.height, '-' + Math.floor(damage), '#ff0000');
                createParticle(player.x + player.width/2, player.y - player.height/2, '#ff0000', 5);
                if (this.special === 'slow' && !player.slowed) { player.slowed = true; player.slowTimer = 3; createFloatingText(player.x, player.y - player.height - 20, '减速!', '#00ff00'); }
            } else { createFloatingText(player.x, player.y - player.height, '闪避!', '#00ffff'); }
        }
    }
    
    draw() {
        if (!this.alive) {
            // v1.11.0 战斗表现 - 死亡化作光芒消散动画
            if (this.dissolving) {
                const screenX = this.x - CONFIG.cameraOffset;
                const alpha = Math.max(0, this.deathGlowTimer / 0.5);
                const glowColor = this.elite ? '#ff00ff' : (this.color || '#ffffff');
                
                ctx.save();
                ctx.globalAlpha = alpha * 0.5;
                // 绘制消散光晕
                const gradient = ctx.createRadialGradient(
                    screenX + this.width/2, this.y - this.height/2, 0,
                    screenX + this.width/2, this.y - this.height/2, this.width
                );
                gradient.addColorStop(0, glowColor);
                gradient.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(screenX + this.width/2, this.y - this.height/2, this.width, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            return;
        }
        
        const screenX = this.x - CONFIG.cameraOffset;
        
        // v1.11.0 战斗表现 - 受伤闪白效果
        let drawColor = this.color;
        if (this.hitFlashTimer > 0) {
            drawColor = '#ffffff';
        } else if (this.damageFlash > 0) {
            drawColor = '#ffffff';
        }
        ctx.fillStyle = drawColor;
        
        // v1.10.1 境界光晕效果
        if (this.realmGlow && this.realmGlow !== 'rainbow') {
            ctx.save();
            ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.003) * 0.1;
            ctx.fillStyle = this.realmGlow;
            ctx.beginPath();
            ctx.arc(screenX + this.width/2, this.y - this.height/2, this.width * 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else if (this.realmGlow === 'rainbow') {
            // 飞升境界 - 彩虹光晕
            ctx.save();
            const gradient = ctx.createRadialGradient(
                screenX + this.width/2, this.y - this.height/2, 0,
                screenX + this.width/2, this.y - this.height/2, this.width
            );
            gradient.addColorStop(0, 'rgba(255,0,0,0.4)');
            gradient.addColorStop(0.33, 'rgba(255,255,0,0.4)');
            gradient.addColorStop(0.66, 'rgba(0,255,0,0.4)');
            gradient.addColorStop(1, 'rgba(0,0,255,0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenX + this.width/2, this.y - this.height/2, this.width, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // v1.10.1 根据形态绘制不同怪物
        if (this.form === 'ghost') {
            this.drawGhost(screenX);
        } else if (this.form === 'beast') {
            this.drawBeast(screenX);
        } else if (this.form === 'bug') {
            this.drawBug(screenX);
        } else if (this.form === 'undead') {
            this.drawUndead(screenX);
        } else {
            // 原有怪物绘制（向后兼容）
            this.drawOriginalMonster(screenX);
        }
        
        const hpPercent = this.hp / this.maxHp;
        ctx.fillStyle = '#333'; ctx.fillRect(screenX, this.y - this.height - 15, this.width, 5);
        ctx.fillStyle = hpPercent > 0.5 ? '#44ff44' : '#ff4444'; ctx.fillRect(screenX, this.y - this.height - 15, this.width * hpPercent, 5);
    }
    
    // v1.10.1 绘制鬼魂类怪物
    drawGhost(screenX) {
        ctx.fillStyle = this.damageFlash > 0 ? '#ffffff' : this.color;
        
        if (this.formDetail === '游魂') {
            // 白色半透明圆形鬼火，飘忽不定
            ctx.globalAlpha = 0.7 + Math.sin(Date.now() * 0.005) * 0.2;
            ctx.beginPath();
            ctx.arc(screenX + this.width/2, this.y - this.height/2, 15, 0, Math.PI * 2);
            ctx.fill();
            // 蓝光
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#0088ff';
            ctx.beginPath();
            ctx.arc(screenX + this.width/2, this.y - this.height/2, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            // 眼睛
            ctx.fillStyle = '#ffff00';
            ctx.beginPath(); ctx.arc(screenX + this.width/2 - 5, this.y - this.height/2 - 3, 2, 0, Math.PI * 2);
            ctx.arc(screenX + this.width/2 + 5, this.y - this.height/2 - 3, 2, 0, Math.PI * 2); ctx.fill();
        } else if (this.formDetail === '恶灵') {
            // 青灰色实体，长发遮面
            ctx.fillRect(screenX + 5, this.y - this.height + 10, 30, 40);
            // 黑色长发
            ctx.fillStyle = '#000000';
            ctx.fillRect(screenX, this.y - this.height + 5, 40, 35);
            // 眼睛
            ctx.fillStyle = '#ff0000';
            ctx.beginPath(); ctx.arc(screenX + 12, this.y - this.height + 18, 2, 0, Math.PI * 2);
            ctx.arc(screenX + 28, this.y - this.height + 18, 2, 0, Math.PI * 2); ctx.fill();
            // 血滴
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(screenX + 10, this.y - 10, 3, 8);
            ctx.fillRect(screenX + 28, this.y - 8, 3, 6);
        } else if (this.formDetail === '厉鬼') {
            // 红色眼睛，周身黑气缠绕
            ctx.fillStyle = '#1a202c';
            ctx.beginPath();
            ctx.arc(screenX + this.width/2, this.y - this.height/2, 20, 0, Math.PI * 2);
            ctx.fill();
            // 黑色气场
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(screenX + this.width/2, this.y - this.height/2, 28, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            // 红色眼睛
            ctx.fillStyle = '#ff0000';
            ctx.beginPath(); ctx.arc(screenX + 12, this.y - this.height/2 - 5, 4, 0, Math.PI * 2);
            ctx.arc(screenX + 28, this.y - this.height/2 - 5, 4, 0, Math.PI * 2); ctx.fill();
            // 血色光晕
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(screenX + this.width/2, this.y - this.height/2, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            // 獠牙
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(screenX + 10, this.y - this.height/2 + 10);
            ctx.lineTo(screenX + 13, this.y - this.height/2 + 18);
            ctx.lineTo(screenX + 16, this.y - this.height/2 + 10);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(screenX + 24, this.y - this.height/2 + 10);
            ctx.lineTo(screenX + 27, this.y - this.height/2 + 18);
            ctx.lineTo(screenX + 30, this.y - this.height/2 + 10);
            ctx.fill();
        }
    }
    
    // v1.10.1 绘制兽类怪物
    drawBeast(screenX) {
        ctx.fillStyle = this.damageFlash > 0 ? '#ffffff' : this.color;
        
        if (this.formDetail === '苍狼') {
            // 灰色身体
            ctx.fillRect(screenX, this.y - 30, 45, 30);
            // 蓬松尾巴
            ctx.fillRect(screenX - 10, this.y - 25, 15, 8);
            // 腿
            ctx.fillRect(screenX + 5, this.y - 10, 6, 10);
            ctx.fillRect(screenX + 35, this.y - 10, 6, 10);
            // 绿眼睛
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(screenX + 30, this.y - 28, 5, 4);
        } else if (this.formDetail === '猛虎') {
            // 黄色身体
            ctx.fillStyle = '#d69e2e';
            ctx.fillRect(screenX, this.y - 40, 55, 40);
            // 黑色条纹
            ctx.fillStyle = '#000000';
            ctx.fillRect(screenX + 10, this.y - 40, 4, 20);
            ctx.fillRect(screenX + 25, this.y - 40, 4, 25);
            ctx.fillRect(screenX + 40, this.y - 40, 4, 20);
            // 腿
            ctx.fillRect(screenX + 5, this.y - 10, 8, 10);
            ctx.fillRect(screenX + 42, this.y - 10, 8, 10);
            // "王"字纹
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 10px Arial';
            ctx.fillText('王', screenX + 25, this.y - 25);
            // 威严眼神
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(screenX + 35, this.y - 38, 6, 4);
        } else if (this.formDetail === '獠牙猪') {
            // 黑色身体
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(screenX, this.y - 45, 60, 45);
            // 巨型獠牙
            ctx.fillStyle = '#ffffcc';
            ctx.beginPath();
            ctx.moveTo(screenX + 5, this.y - 35);
            ctx.quadraticCurveTo(screenX - 5, this.y - 45, screenX, this.y - 30);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(screenX + 55, this.y - 35);
            ctx.quadraticCurveTo(screenX + 65, this.y - 45, screenX + 60, this.y - 30);
            ctx.fill();
            // 腿
            ctx.fillRect(screenX + 10, this.y - 10, 8, 10);
            ctx.fillRect(screenX + 42, this.y - 10, 8, 10);
        }
    }
    
    // v1.10.1 绘制虫类怪物
    drawBug(screenX) {
        ctx.fillStyle = this.damageFlash > 0 ? '#ffffff' : this.color;
        
        if (this.formDetail === '毒蛛') {
            // 黑色背甲
            ctx.beginPath();
            ctx.ellipse(screenX + this.width/2, this.y - this.height/2, 18, 15, 0, 0, Math.PI * 2);
            ctx.fill();
            // 红色腹部斑点
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.ellipse(screenX + this.width/2, this.y - this.height/2 + 5, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            // 8条细长腿
            ctx.fillStyle = '#000000';
            for (let i = 0; i < 4; i++) {
                ctx.fillRect(screenX + i * 10 - 2, this.y - this.height - 5, 3, 18);
                ctx.fillRect(screenX + this.width - i * 10 - 1, this.y - this.height - 5, 3, 18);
            }
            // 紫色毒纹
            ctx.fillStyle = '#9400d3';
            ctx.fillRect(screenX + 10, this.y - this.height/2 - 5, 20, 3);
            // 眼睛
            ctx.fillStyle = '#ff0000';
            ctx.beginPath(); ctx.arc(screenX + 12, this.y - this.height + 8, 2, 0, Math.PI * 2);
            ctx.arc(screenX + 28, this.y - this.height + 8, 2, 0, Math.PI * 2); ctx.fill();
        } else if (this.formDetail === '蜈蚣') {
            // 红褐色多节身体
            ctx.fillStyle = '#8B0000';
            for (let i = 0; i < 8; i++) {
                ctx.fillRect(screenX + i * 6, this.y - this.height/2 - 5, 5, 12);
            }
            // 头部红色毒颚
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(screenX + 2, this.y - this.height/2, 5, 0, Math.PI * 2);
            ctx.fill();
            // 足
            ctx.fillStyle = '#5a0000';
            for (let i = 0; i < 8; i++) {
                ctx.fillRect(screenX + i * 6 + 2, this.y - this.height/2 + 8, 4, 3);
                ctx.fillRect(screenX + i * 6 + 2, this.y - this.height/2 - 8, 4, 3);
            }
        } else if (this.formDetail === '蝎子') {
            // 深紫色扁平身体
            ctx.fillStyle = '#4b0082';
            ctx.beginPath();
            ctx.ellipse(screenX + this.width/2, this.y - this.height/2, 20, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            // 大螯肢
            ctx.fillRect(screenX - 8, this.y - this.height/2 - 8, 12, 6);
            ctx.fillRect(screenX + this.width - 4, this.y - this.height/2 - 8, 12, 6);
            // 弯曲毒尾
            ctx.fillStyle = '#9400d3';
            ctx.beginPath();
            ctx.moveTo(screenX + this.width/2, this.y - this.height);
            ctx.quadraticCurveTo(screenX + this.width/2 + 10, this.y - this.height - 15, screenX + this.width/2 + 5, this.y - this.height - 25);
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#9400d3';
            ctx.stroke();
            // 发光毒针
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(screenX + this.width/2 + 5, this.y - this.height - 25, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // v1.10.1 绘制尸类怪物
    drawUndead(screenX) {
        ctx.fillStyle = this.damageFlash > 0 ? '#ffffff' : this.color;
        
        if (this.formDetail === '僵尸') {
            // 灰绿色皮肤
            ctx.fillStyle = '#68d391';
            ctx.fillRect(screenX + 10, this.y - this.height, 20, 50);
            // 双臂平伸
            ctx.fillRect(screenX - 5, this.y - 35, 20, 8);
            ctx.fillRect(screenX + 25, this.y - 35, 20, 8);
            // 服装褴褛效果
            ctx.fillStyle = '#555555';
            ctx.fillRect(screenX + 10, this.y - 20, 20, 3);
            ctx.fillRect(screenX + 12, this.y - 30, 16, 3);
            // 眼眶深黑
            ctx.fillStyle = '#000000';
            ctx.fillRect(screenX + 12, this.y - this.height + 8, 5, 5);
            ctx.fillRect(screenX + 23, this.y - this.height + 8, 5, 5);
        } else if (this.formDetail === '跳尸') {
            // 深绿色腐烂身体
            ctx.fillStyle = '#2f855a';
            ctx.fillRect(screenX + 10, this.y - this.height, 20, 50);
            // 双臂前伸
            ctx.fillRect(screenX - 10, this.y - 40, 25, 8);
            ctx.fillRect(screenX + 25, this.y - 40, 25, 8);
            // 跳跃姿态 - 腿弯曲
            ctx.fillRect(screenX + 5, this.y - 10, 12, 10);
            ctx.fillRect(screenX + 23, this.y - 10, 12, 10);
            // 血迹
            ctx.fillStyle = '#8B0000';
            ctx.fillRect(screenX + 15, this.y - this.height + 15, 4, 8);
            ctx.fillRect(screenX + 25, this.y - 35, 3, 6);
            // 眼睛
            ctx.fillStyle = '#ffff00';
            ctx.beginPath(); ctx.arc(screenX + 15, this.y - this.height + 8, 2, 0, Math.PI * 2);
            ctx.arc(screenX + 25, this.y - this.height + 8, 2, 0, Math.PI * 2); ctx.fill();
        } else if (this.formDetail === '铜甲尸') {
            // 青铜色盔甲
            ctx.fillStyle = '#b7791f';
            ctx.fillRect(screenX + 5, this.y - this.height, 40, 55);
            // 盔甲细节
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(screenX + 10, this.y - this.height + 5, 30, 3);
            ctx.fillRect(screenX + 10, this.y - this.height + 25, 30, 3);
            ctx.fillRect(screenX + 10, this.y - this.height + 45, 30, 3);
            // 盾牌
            ctx.fillStyle = '#cd853f';
            ctx.fillRect(screenX - 15, this.y - 45, 12, 35);
            // 金属反光
            ctx.fillStyle = '#daa520';
            ctx.fillRect(screenX + 15, this.y - this.height + 10, 5, 10);
        }
    }
    
    // 向后兼容：原有怪物绘制
    drawOriginalMonster(screenX) {
        if (this.type === '阴魂') {
            ctx.beginPath(); ctx.moveTo(screenX, this.y - this.height);
            ctx.quadraticCurveTo(screenX + this.width/2, this.y - this.height - 20, screenX + this.width, this.y - this.height);
            ctx.lineTo(screenX + this.width - 5, this.y); ctx.lineTo(screenX + this.width/2, this.y - 10);
            ctx.lineTo(screenX + 5, this.y); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ffff00'; ctx.beginPath(); ctx.arc(screenX + 12, this.y - this.height + 15, 4, 0, Math.PI * 2);
            ctx.arc(screenX + this.width - 12, this.y - this.height + 15, 4, 0, Math.PI * 2); ctx.fill();
        } else if (this.type === '妖狼') {
            ctx.fillRect(screenX, this.y - 30, this.width, 30);
            ctx.fillRect(screenX + this.width - 15, this.y - 40, 15, 15);
            ctx.fillRect(screenX + 5, this.y - 10, 8, 10); ctx.fillRect(screenX + this.width - 13, this.y - 10, 8, 10);
            ctx.fillStyle = '#ff0000'; ctx.fillRect(screenX + this.width - 10, this.y - 35, 3, 3);
        } else if (this.type === '毒蛛') {
            ctx.beginPath(); ctx.ellipse(screenX + this.width/2, this.y - this.height/2, this.width/2, this.height/2, 0, 0, Math.PI * 2); ctx.fill();
            for (let i = 0; i < 4; i++) { ctx.fillRect(screenX + i * 10 - 5, this.y - this.height - 5, 3, 15); ctx.fillRect(screenX + this.width - i * 10 - 3, this.y - this.height - 5, 3, 15); }
            ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(screenX + this.width/2 - 5, this.y - this.height + 10, 3, 0, Math.PI * 2); ctx.arc(screenX + this.width/2 + 5, this.y - this.height + 10, 3, 0, Math.PI * 2); ctx.fill();
        } else if (this.type === '僵尸') {
            ctx.fillRect(screenX + 10, this.y - this.height, 20, this.height);
            ctx.fillRect(screenX + 12, this.y - this.height - 12, 16, 12);
            ctx.fillRect(screenX, this.y - 35, 12, 8); ctx.fillRect(screenX + 28, this.y - 35, 12, 8);
            ctx.fillStyle = '#00ff00'; ctx.fillRect(screenX + 14, this.y - this.height - 8, 3, 3); ctx.fillRect(screenX + 23, this.y - this.height - 8, 3, 3);
        }
    }
}

