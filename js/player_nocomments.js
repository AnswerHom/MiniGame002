


const player = {
    x: 100,
    y: CONFIG.groundY,
    width: 32,   
    height: 48,  
    level: 1,
    hp: 100,
    maxHp: 100,
    attack: 10,
    baseAttack: 10,  
    speed: 80,   
    attackCooldown: 0,
    attackRange: 80,
    attackInterval: 1.2,
    critRate: 0.05,
    critDamage: 2.0,
    exp: 0,
    requiredExp: 100,
    attacking: false,
    attackFrame: 0,
    hitFlash: 0,
    isMoving: true,
    
    
    critFlash: 0,
    
    
    initialEquipment: {
        weapon: { name: '新手剑', attackBonus: 2 }
    },
    
    
    weaponType: 'sword',
    
    
    
    robeColor: '#f0f5f9',      
    robeAccentColor: '#81e6d9', 
    hairColor: '#1a202c',      
    hairAccentColor: '#fc8181', 
    weaponColor: '#c0c0c0',    
    weaponAccentColor: '#fc8181', 
    
    
    xianxiaStyle: true,        
    robeDetail: true,          
    ribbon: true,              
    hairDetail: true,          
    
    
    attackAnimation: {
        windUp: 0.15,          
        strike: 0.1,            
        followThrough: 0.1,    
        total: 0.35            
    }
    
    
    idleTime: 0,               
    idleFloatOffset: 0,        
    
    
    poisonEffect: 0,            
    slowEffect: 0,             
    
    getRealm() {
        return getRealm(this.level);
    },

    update(dt) {
        
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }
        if (this.attacking) {
            this.attackFrame += dt * 8; 
            
            
            if (this.attackFrame < 0.4) {
                this.attackPhase = 'windup';  
            } else if (this.attackFrame < 0.7) {
                this.attackPhase = 'swing';  
            } else {
                this.attackPhase = 'followthrough';  
            }
            
            if (this.attackFrame >= 1) {
                this.attacking = false;
                this.attackPhase = null;
            }
        }
        if (this.hitFlash > 0) {
            this.hitFlash -= dt;
        }
        
        
        if (this.isMoving) {
            this.x += this.speed * dt;
        }
        
        
        this.idleTime += dt;
        this.idleFloatOffset = Math.sin(this.idleTime * 2) * 2; 
        
        
        if (this.poisonEffect > 0) this.poisonEffect -= dt;
        if (this.slowEffect > 0) this.slowEffect -= dt;
        
        
        if (this.critFlash > 0) this.critFlash -= dt;
        
        
        if (this.buffs) {
            this.buffs.forEach(buff => {
                if (buff.active) {
                    if (buff.type === 'poison') this.poisonEffect = 0.5;
                    if (buff.type === 'slow') this.slowEffect = 0.5;
                }
            });
        }
        
        
        CONFIG.cameraOffset = this.x - 150;
    },

    
    attackTarget(enemy) {
        if (this.attackCooldown <= 0) {
            this.attacking = true;
            this.attackFrame = 0;
            this.attackPhase = 'windup';  
            this.attackCooldown = this.attackInterval;
            this.attackHit = false;  
            
            const isCrit = Math.random() < this.critRate;
            const damageMult = isCrit ? this.critDamage : 1.0;
            const damage = Math.floor(this.attack * damageMult);
            
            game.addDamageNumber(enemy.x, enemy.y - enemy.height, damage, isCrit);
            
            
            if (isCrit) {
                game.addCritEffect(enemy.x, enemy.y - enemy.height / 2);
                
                this.critFlash = 0.2;
            }
            
            enemy.takeDamage(damage);
            
            
            game.addHitEffect(enemy.x, enemy.y - enemy.height / 2, isCrit);
            
            
            game.recordDamage(damage);
            
            
            game.playSound('attack');
        }
    },

    takeDamage(damage) {
        
        if (game.activePowerups.invincible) {
            return false;
        }
        this.hp -= damage;
        this.hitFlash = 0.2;
        if (this.hp <= 0) {
            this.hp = 0;
            return true;
        }
        return false;
    },

    levelUp() {
        this.level++;
        this.exp -= this.requiredExp;
        this.requiredExp = Math.floor(this.requiredExp * 1.5);
        this.maxHp = Math.floor(this.maxHp * 1.2);
        this.hp = this.maxHp;
        this.attack = Math.floor(this.attack * 1.15);
        
        game.playSound('levelup');
        
        game.addLevelUpEffect(this.x, this.y - this.height);
    },

    
    draw() {
        const screenX = this.x - CONFIG.cameraOffset;
        const screenY = this.y + this.idleFloatOffset; 
        
        
        if (this.slowEffect > 0) {
            const time = Date.now() / 100;
            
            const gradient = ctx.createRadialGradient(
                screenX + 16, screenY - 24, 0,
                screenX + 16, screenY - 24, 40
            );
            gradient.addColorStop(0, 'rgba(100, 200, 255, 0.3)');
            gradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.15)');
            gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenX + 16, screenY - 24, 40, 0, Math.PI * 2);
            ctx.fill();
            
            
            for (let i = 0; i < 5; i++) {
                const angle = (time + i * 1.2) % (Math.PI * 2);
                const radius = 25 + Math.sin(time * 2 + i) * 5;
                const px = screenX + 16 + Math.cos(angle) * radius;
                const py = screenY - 24 + Math.sin(angle) * radius;
                ctx.fillStyle = 'rgba(150, 220, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        
        if (this.poisonEffect > 0) {
            const time = Date.now() / 100;
            
            for (let i = 0; i < 8; i++) {
                const angle = (time * 0.5 + i * Math.PI / 4) % (Math.PI * 2);
                const radius = 20 + Math.sin(time + i) * 8;
                const px = screenX + 16 + Math.cos(angle) * radius;
                const py = screenY - 30 + Math.sin(angle) * radius - 10;
                ctx.fillStyle = `rgba(50, 255, 50, ${0.4 + Math.sin(time * 2 + i) * 0.2})`;
                ctx.beginPath();
                ctx.arc(px, py, 3 + Math.sin(time + i) * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        
        if (game.activePowerups.invincible) {
            const time = Date.now() / 100;
            const haloRadius = 35 + Math.sin(time) * 5;
            
            
            const gradient = ctx.createRadialGradient(
                screenX + 16, screenY - 30, 0,
                screenX + 16, screenY - 30, haloRadius
            );
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
            gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenX + 16, screenY - 30, haloRadius, 0, Math.PI * 2);
            ctx.fill();
            
            
            if (Math.floor(time) % 2 === 0) {
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(screenX + 16, screenY - 30, 30, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        
        if (this.hitFlash > 0 && Math.floor(this.hitFlash * 20) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        
        if (this.critFlash > 0 && Math.floor(this.critFlash * 10) % 2 === 0) {
            ctx.globalAlpha = 0.7;
        }
        
        
        ctx.fillStyle = this.robeColor;
        ctx.beginPath();
        ctx.ellipse(screenX + 16, screenY - 24, 16, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        
        ctx.fillStyle = this.robeAccentColor;
        ctx.beginPath();
        ctx.ellipse(screenX + 16, screenY - 38, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        
        
        ctx.fillStyle = this.hairColor;
        ctx.beginPath();
        ctx.arc(screenX + 16, screenY - 42, 12, 0, Math.PI * 2);
        ctx.fill();
        
        
        if (this.hairDetail) {
            ctx.fillRect(screenX + 8, screenY - 50, 4, 8);
            ctx.fillRect(screenX + 14, screenY - 52, 4, 8);
            ctx.fillRect(screenX + 20, screenY - 50, 4, 8);
            
            ctx.fillRect(screenX + 4, screenY - 44, 3, 10);
            ctx.fillRect(screenX + 25, screenY - 44, 3, 10);
        }
        
        
        
        ctx.fillStyle = this.hairAccentColor;
        ctx.fillRect(screenX + 4, screenY - 48, 24, 4);
        
        const ribbonWave = Math.sin(this.idleTime * 3) * 3;
        ctx.beginPath();
        ctx.moveTo(screenX + 4, screenY - 44);
        ctx.quadraticCurveTo(screenX - 4 + ribbonWave, screenY - 38, screenX + 2, screenY - 30);
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.hairAccentColor;
        ctx.stroke();
        
        
        if (this.ribbon) {
            
            ctx.strokeStyle = this.robeAccentColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(screenX + 8, screenY - 30);
            const ribbon1Wave = Math.sin(this.idleTime * 2.5) * 5;
            ctx.quadraticCurveTo(screenX - 5 + ribbon1Wave, screenY - 15, screenX + 2, screenY - 5);
            ctx.stroke();
            
            
            ctx.beginPath();
            ctx.moveTo(screenX + 24, screenY - 30);
            const ribbon2Wave = Math.sin(this.idleTime * 2.5 + 1) * 5;
            ctx.quadraticCurveTo(screenX + 37 - ribbon2Wave, screenY - 15, screenX + 30, screenY - 5);
            ctx.stroke();
        }
        
        
        if (this.robeDetail) {
            
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(screenX + 10 + i * 6, screenY - 40);
                ctx.lineTo(screenX + 10 + i * 6, screenY - 10);
                ctx.stroke();
            }
            
            ctx.fillStyle = this.robeAccentColor;
            ctx.fillRect(screenX + 10, screenY - 28, 12, 3);
        }
        
        
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(screenX + 12, screenY - 42, 3, 0, Math.PI * 2);
        ctx.arc(screenX + 20, screenY - 42, 3, 0, Math.PI * 2);
        ctx.fill();
        
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(screenX + 13, screenY - 43, 1, 0, Math.PI * 2);
        ctx.arc(screenX + 21, screenY - 43, 1, 0, Math.PI * 2);
        ctx.fill();
        
        
        
        const weaponSway = this.attacking ? 0 : Math.sin(this.idleTime * WEAPON_ANIMATION.idleSwaySpeed) * WEAPON_ANIMATION.idleSwayAmount;
        
        
        ctx.save();
        ctx.translate(screenX + 16, screenY - 24); 
        ctx.rotate(weaponSway * Math.PI / 180);
        
        
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(12, 4, 6, 4);
        
        ctx.fillStyle = this.weaponAccentColor;
        ctx.beginPath();
        ctx.moveTo(14, 8);
        ctx.quadraticCurveTo(19, 14, 16, 20);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        
        ctx.fillStyle = this.weaponColor;
        ctx.fillRect(14, -16, 3, 18);
        
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.6;
        ctx.fillRect(15, -15, 1, 16);
        ctx.globalAlpha = 1.0;
        
        ctx.restore();
        
        
        if (this.attacking) {
            
            let swingAngle;
            let bodyTilt = 0;
            let weaponOffsetX = 0;
            let weaponOffsetY = 0;
            
            if (this.attackPhase === 'windup') {
                
                const progress = this.attackFrame / 0.4;  
                swingAngle = -progress * Math.PI / 4;  
                bodyTilt = -progress * 0.1;
                weaponOffsetX = -progress * 10;
                weaponOffsetY = -progress * 5;
            } else if (this.attackPhase === 'swing') {
                
                const progress = (this.attackFrame - 0.4) / 0.3;  
                swingAngle = -Math.PI / 4 + progress * Math.PI * 0.7;  
                bodyTilt = progress * 0.15;
                weaponOffsetX = progress * 15;
                weaponOffsetY = progress * 8;
            } else {
                
                const progress = (this.attackFrame - 0.7) / 0.3;  
                swingAngle = Math.PI * 0.35 - progress * Math.PI / 4;  
                bodyTilt = 0.15 - progress * 0.15;
                weaponOffsetX = 15 - progress * 8;
                weaponOffsetY = 8 - progress * 8;
            }
            
            
            ctx.save();
            ctx.translate(screenX + 16, screenY - 24);
            ctx.rotate(bodyTilt);
            ctx.translate(-(screenX + 16), -(screenY - 24));
            
            
            const weaponConfig = WEAPON_TYPES[this.weaponType] || WEAPON_TYPES.sword;
            
            
            ctx.globalAlpha = 0.3;
            for (let i = 1; i <= 3; i++) {
                ctx.save();
                ctx.translate(screenX + 16 + weaponOffsetX, screenY - 30 + weaponOffsetY);
                ctx.rotate(swingAngle - i * 0.1);
                
                
                if (this.weaponType === 'blade' && this.attackPhase === 'swing') {
                    ctx.rotate(Math.sin(Date.now() / 50) * weaponConfig.rotationAngle * Math.PI / 180);
                }
                
                ctx.fillStyle = '#fff';
                
                
                if (this.weaponType === 'spear') {
                    
                    ctx.fillRect(10, -0.5, 35, 1);
                } else if (this.weaponType === 'blade') {
                    
                    ctx.fillRect(8, -2, 28, 4);
                } else {
                    
                    ctx.fillRect(10, -1, 25, 3);
                }
                ctx.restore();
            }
            ctx.globalAlpha = 1.0;
            
            
            this.drawAttackEffect(screenX, screenY, swingAngle, weaponOffsetX, weaponOffsetY);
            
            
            ctx.save();
            ctx.translate(screenX + 16 + weaponOffsetX, screenY - 30 + weaponOffsetY);
            ctx.rotate(swingAngle);
            
            
            if (this.weaponType === 'blade' && this.attackPhase === 'swing') {
                ctx.rotate(Math.sin(Date.now() / 50) * weaponConfig.rotationAngle * Math.PI / 180);
            }
            
            
            let vibrationOffset = 0;
            if (this.weaponType === 'spear' && this.attackPhase === 'swing') {
                vibrationOffset = Math.sin(Date.now() / 30) * weaponConfig.vibrationAmount;
            }
            
            
            if (this.weaponType === 'spear') {
                
                ctx.fillStyle = this.weaponColor;
                ctx.fillRect(10 + vibrationOffset, -0.5, 38, 2);
                
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = 0.7;
                ctx.fillRect(46 + vibrationOffset, -1, 4, 2);
                ctx.globalAlpha = 1.0;
            } else if (this.weaponType === 'blade') {
                
                ctx.fillStyle = this.weaponColor;
                ctx.fillRect(8, -2, 30, 4);
                ctx.fillStyle = '#666';
                ctx.fillRect(10, -1, 26, 2);
                
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = 0.7;
                ctx.fillRect(12, -1.5, 24, 1);
                ctx.globalAlpha = 1.0;
            } else {
                
                ctx.fillStyle = this.weaponColor;
                ctx.fillRect(10, -1.5, 28, 3);
                
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = 0.7;
                ctx.fillRect(12, -0.5, 24, 1);
                ctx.globalAlpha = 1.0;
            }
            ctx.restore();
            
            ctx.restore();  
        }
        
        
        ctx.fillStyle = '#333';
        ctx.fillRect(screenX + 4, screenY - this.height - 12, 24, 5);
        ctx.fillStyle = '#44ff44';
        ctx.fillRect(screenX + 4, screenY - this.height - 12, 24 * (this.hp / this.maxHp), 5);
        
        ctx.globalAlpha = 1.0;
    },
    
    
    drawAttackEffect(screenX, screenY, swingAngle, weaponOffsetX, weaponOffsetY) {
        
        if (this.attackPhase !== 'swing') return;
        
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenX + 35 + weaponOffsetX, screenY - 30 + weaponOffsetY);
        ctx.lineTo(screenX + 60 + weaponOffsetX, screenY - 30 + weaponOffsetY);
        ctx.stroke();
        
        
        const gradient = ctx.createLinearGradient(screenX + 35, screenY - 38, screenX + 65, screenY - 22);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(screenX + 35 + weaponOffsetX, screenY - 38 + weaponOffsetY);
        ctx.lineTo(screenX + 65 + weaponOffsetX, screenY - 30 + weaponOffsetY);
        ctx.lineTo(screenX + 35 + weaponOffsetX, screenY - 22 + weaponOffsetY);
        ctx.closePath();
        ctx.fill();
    }
};
