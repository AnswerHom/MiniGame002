// MiniGame002 - 游戏主逻辑 v1.0.3
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CONFIG = { width: 800, height: 450, groundY: 380, cameraOffset: 0 };
canvas.width = CONFIG.width;
canvas.height = CONFIG.height;

const REALMS = [
    { name: '筑基', minLevel: 1 }, { name: '金丹', minLevel: 5 },
    { name: '元婴', minLevel: 10 }, { name: '化神', minLevel: 15 },
    { name: '炼虚', minLevel: 20 }, { name: '合体', minLevel: 25 },
    { name: '大乘', minLevel: 30 }, { name: '渡劫', minLevel: 35 }
];

function getRealm(level) {
    for (let i = REALMS.length - 1; i >= 0; i--) {
        if (level >= REALMS[i].minLevel) return REALMS[i];
    }
    return REALMS[0];
}

const SCENES = [
    { name: '山野之路', bgColor: ['#1a0a2e', '#2d1b4e', '#1a3a5c'], groundColor: '#1a2f25' },
    { name: '幽林深处', bgColor: ['#0a1a0a', '#1a2d1a', '#1a3a2a'], groundColor: '#1a2a1a' },
    { name: '古墓遗迹', bgColor: ['#1a1a1a', '#2a2a2a', '#1a2a2a'], groundColor: '#2a2a2a' }
];

function getScene(distance) {
    return SCENES[Math.floor(distance / 1000) % 3];
}

const game = {
    running: true, gameOver: false, cameraX: 0, lastTime: 0,
    enemies: [], expOrbs: [], particles: [], projectiles: [],
    spawnTimer: 0, spawnInterval: 2000, groundY: CONFIG.groundY, distance: 0,
    clouds: [], stars: [], grass: [], killCount: 0, comboCount: 0, comboTimer: 0,
    comboRewards: { 3: 10, 5: 25, 10: 50 },
    screenShake: 0, screenShakeIntensity: 0,
    slowMotion: 0
};

// 兵器系统
const WEAPONS = {
    剑: { name: '剑', range: 80, attackSpeed: 1.0, baseAttack: 10, attackMult: 1.0, speedMult: 1.0, color: '#C0C0C0', icon: '🗡️' },
    刀: { name: '刀', range: 70, attackSpeed: 0.8, baseAttack: 15, attackMult: 1.5, speedMult: 0.8, color: '#1a1a1a', icon: '⚔️' },
    长枪: { name: '长枪', range: 120, attackSpeed: 1.2, baseAttack: 12, attackMult: 1.2, speedMult: 1.2, color: '#FFD700', icon: '🔱' }
};

// 怒气技能
const RAGE_SKILLS = {
    剑意·万剑归宗: { name: '剑意·万剑归宗', weapon: '剑', damage: 50, range: 'screen', icon: '🗡️✨' },
    刀意·裂空斩: { name: '刀意·裂空斩', weapon: '刀', damage: 100, range: 'line', icon: '⚔️💥' },
    枪意·龙枪突刺: { name: '枪意·龙枪突刺', weapon: '长枪', damage: 80, range: 'rect', icon: '🔱🐉' }
};

for (let i = 0; i < 8; i++) game.clouds.push({ x: Math.random() * 2000, y: 50 + Math.random() * 150, width: 100 + Math.random() * 150, speed: 10 + Math.random() * 20, opacity: 0.1 + Math.random() * 0.2 });
for (let i = 0; i < 50; i++) game.stars.push({ x: Math.random() * CONFIG.width, y: Math.random() * (CONFIG.groundY - 100), size: 1 + Math.random() * 2, twinkle: Math.random() * Math.PI * 2, speed: 1 + Math.random() * 3 });
for (let i = 0; i < 30; i++) game.grass.push({ x: i * 60 + Math.random() * 30, height: 8 + Math.random() * 12, sway: Math.random() * Math.PI * 2 });

const SKILLS = {
    御剑术: { unlockLevel: 5, cooldown: 5, damage: 1.5, name: '御剑术', icon: '🗡️' },
    剑气斩: { unlockLevel: 10, cooldown: 8, damage: 2.0, name: '剑气斩', icon: '⚔️' },
    护体神光: { unlockLevel: 15, cooldown: 15, duration: 3, name: '护体神光', icon: '🛡️' }
};

const player = {
    x: 100, y: CONFIG.groundY, width: 40, height: 60, level: 1, hp: 100, maxHp: 100,
    attack: 10, speed: 150, attackSpeed: 1.0, attackCooldown: 0, attackRange: 80,
    exp: 0, requiredExp: 100, direction: 1, attacking: false, attackFrame: 0, color: '#00d4ff',
    dodgeTimer: 0, isDodging: false,
    // 兵器系统
    weapon: '剑', rage: 0, maxRage: 100,
    // 暴击系统
    critRate: 0.05, critDamage: 2.0,
    skills: { 御剑术: { unlocked: false, cooldownTimer: 0 }, 剑气斩: { unlocked: false, cooldownTimer: 0 }, 护体神光: { unlocked: false, cooldownTimer: 0, active: false, activeTimer: 0 } },
    slowed: false, slowTimer: 0,
    
    getRealm() { return getRealm(this.level); },
    
    switchWeapon(weaponName) {
        if (WEAPONS[weaponName]) {
            this.weapon = weaponName;
            const w = WEAPONS[weaponName];
            this.attackRange = w.range;
            this.attackSpeed = w.baseAttack * w.speedMult / w.baseAttack * w.speedMult;
            this.updateAttackFromWeapon();
            createFloatingText(this.x, this.y - 80, '切换' + w.icon + w.name, '#00ff00');
        }
    },
    
    updateAttackFromWeapon() {
        const w = WEAPONS[this.weapon];
        let baseAttack;
        if (this.level < 5) baseAttack = 10 + (this.level - 1) * 2;
        else if (this.level < 10) baseAttack = 18 + (this.level - 5) * 3;
        else if (this.level < 15) baseAttack = 28 + (this.level - 10) * 4;
        else baseAttack = 38 + (this.level - 15) * 5;
        this.attack = Math.floor(baseAttack * w.attackMult);
    },
    
    addRage(amount) {
        this.rage = Math.min(this.maxRage, this.rage + amount);
    },
    
    useRageSkill() {
        if (this.rage < this.maxRage) return;
        const weaponSkill = RAGE_SKILLS[this.weapon + '意·' + (this.weapon === '剑' ? '万剑归宗' : this.weapon === '刀' ? '裂空斩' : '龙枪突刺')];
        const skillName = this.weapon + '意·' + (this.weapon === '剑' ? '万剑归宗' : this.weapon === '刀' ? '裂空斩' : '龙枪突刺');
        
        if (this.weapon === '剑') {
            // 万剑归宗 - 清扫屏幕内所有怪物
            for (let i = 0; i < 20; i++) {
                game.projectiles.push(new Projectile(
                    this.x + this.width,
                    this.y - this.height/2 + (Math.random() - 0.5) * 80,
                    600 + Math.random() * 200,
                    skillName.includes('万剑归宗') ? 50 : 0,
                    'rage'
                ));
            }
            game.screenShake = 0.3; game.screenShakeIntensity = 10;
        } else if (this.weapon === '刀') {
            // 裂空斩 - 巨大刀气
            for (let i = 0; i < 5; i++) {
                game.projectiles.push(new Projectile(
                    this.x + this.width,
                    this.y - this.height/2 + (i - 2) * 20,
                    500,
                    100,
                    'rage'
                ));
            }
            game.screenShake = 0.5; game.screenShakeIntensity = 15;
        } else if (this.weapon === '长枪') {
            // 龙枪突刺
            this.x += 200;
            game.enemies.forEach(enemy => {
                if (enemy.x > this.x - 200 && enemy.x < this.x + 100) {
                    enemy.takeDamage(80);
                }
            });
            game.screenShake = 0.2; game.screenShakeIntensity = 8;
        }
        
        this.rage = 0;
        createFloatingText(this.x, this.y - 100, skillName + '!', '#ff6600');
        for (let i = 0; i < 30; i++) createParticle(this.x + this.width/2, this.y - this.height/2, '#ff6600', 8);
    },
    
    getCritRate() {
        return this.critRate + (this.level - 1) * 0.01;
    },
    
    checkSkillUnlock() {
        if (this.level >= 5) this.skills.御剑术.unlocked = true;
        if (this.level >= 10) this.skills.剑气斩.unlocked = true;
        if (this.level >= 15) this.skills.护体神光.unlocked = true;
    },
    
    levelUp() {
        this.level++;
        if (this.level < 5) { this.maxHp = 100 + (this.level - 1) * 20; }
        else if (this.level < 10) { this.maxHp = 180 + (this.level - 5) * 25; }
        else if (this.level < 15) { this.maxHp = 280 + (this.level - 10) * 30; }
        else { this.maxHp = 380 + (this.level - 15) * 35; }
        this.hp = this.maxHp;
        this.requiredExp = 100 * this.level;
        this.updateAttackFromWeapon();
        this.checkSkillUnlock();
        createParticle(this.x, this.y - 30, 'gold', 20);
        createFloatingText(this.x, this.y - 50, '升级! Lv.' + this.level, '#ffd700');
        const realm = this.getRealm();
        if (this.level > 1 && (this.level - 1) % 5 === 0) createFloatingText(this.x, this.y - 70, '突破! ' + realm.name, '#ff00ff');
    },
    
    addExp(amount) {
        this.exp += amount;
        if (this.exp >= this.requiredExp) { this.exp -= this.requiredExp; this.levelUp(); }
    },
    
    takeDamage() {
        if (this.skills.护体神光.active || this.isDodging) return false;
        this.isDodging = true; this.dodgeTimer = 0.5; return true;
    },
    
    useSkill(skillName) {
        const skill = this.skills[skillName];
        if (!skill || !skill.unlocked || skill.cooldownTimer > 0) return;
        const skillData = SKILLS[skillName];
        
        if (skillName === '御剑术') {
            game.projectiles.push(new Projectile(this.x + this.width, this.y - this.height / 2, 400, this.attack * skillData.damage, 'sword'));
            skill.cooldownTimer = skillData.cooldown;
            createFloatingText(this.x, this.y - 80, '御剑术!', '#00ffff');
        } else if (skillName === '剑气斩') {
            this.x += 50;
            createParticle(this.x + 100, this.y - 30, '#ffd700', 30);
            game.enemies.forEach(enemy => { if (enemy.x > this.x && enemy.x < this.x + 200) enemy.takeDamage(this.attack * skillData.damage); });
            for (let i = 0; i < 20; i++) createParticle(this.x + 50 + Math.random() * 100, this.y - this.height/2 + (Math.random() - 0.5) * 60, '#ffd700', 4);
            skill.cooldownTimer = skillData.cooldown;
            createFloatingText(this.x, this.y - 80, '剑气斩!', '#ffd700');
        } else if (skillName === '护体神光') {
            skill.active = true; skill.activeTimer = skillData.duration;
            skill.cooldownTimer = skillData.cooldown;
            createFloatingText(this.x, this.y - 80, '护体神光!', '#ffd700');
        }
    },
    
    attackTarget(target) {
        if (this.attackCooldown <= 0) {
            this.attacking = true; this.attackFrame = 0; this.attackCooldown = 1 / this.attackSpeed;
            
            // 暴击判定
            const isCrit = Math.random() < this.getCritRate();
            const damage = isCrit ? this.attack * this.critDamage : this.attack;
            
            target.takeDamage(damage, isCrit);
            
            // 打击特效增强
            const particleCount = isCrit ? 15 : 8;
            for (let i = 0; i < particleCount; i++) {
                createParticle(target.x + target.width / 2, target.y + target.height / 2, isCrit ? '#ff0000' : '#fff', isCrit ? 6 : 3);
            }
            
            // 暴击屏幕震动
            if (isCrit) {
                game.screenShake = 0.1; game.screenShakeIntensity = 5;
            }
        }
    },
    
    update(dt) {
        let currentSpeed = this.speed;
        if (this.slowed) { currentSpeed *= 0.7; this.slowTimer -= dt; if (this.slowTimer <= 0) this.slowed = false; }
        this.x += currentSpeed * dt;
        game.distance = Math.floor((this.x - 100) / 10);
        CONFIG.cameraOffset = this.x - 150;
        if (this.isDodging) { this.dodgeTimer -= dt; if (this.dodgeTimer <= 0) this.isDodging = false; }
        Object.keys(this.skills).forEach(skillName => {
            const skill = this.skills[skillName];
            if (skill.cooldownTimer > 0) skill.cooldownTimer -= dt;
            if (skill.active) { skill.activeTimer -= dt; if (skill.activeTimer <= 0) skill.active = false; }
        });
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.attacking) { this.attackFrame += dt * 10; if (this.attackFrame >= 1) this.attacking = false; }
    },
    
    draw() {
        const screenX = this.x - CONFIG.cameraOffset;
        const w = WEAPONS[this.weapon];
        
        if (this.skills.护体神光.active) {
            ctx.save(); ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;
            ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(screenX + this.width/2, this.y - this.height/2, 50, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
        if (this.isDodging) ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.3;
        ctx.fillStyle = this.color; ctx.fillRect(screenX, this.y - this.height, this.width, this.height);
        ctx.save();
        
        const weaponColor = w.color;
        
        if (this.attacking) {
            ctx.translate(screenX + this.width, this.y - this.height / 2); ctx.rotate(-0.5 + this.attackFrame * 1.5);
            // 根据兵器显示不同攻击形态
            if (this.weapon === '剑') {
                ctx.fillStyle = weaponColor; ctx.fillRect(0, -4, 45, 8);
                ctx.fillStyle = '#8b4513'; ctx.fillRect(-5, -4, 10, 8);
            } else if (this.weapon === '刀') {
                ctx.fillStyle = weaponColor; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(50, 0); ctx.lineTo(0, 10); ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#8b4513'; ctx.fillRect(-8, -6, 12, 12);
            } else if (this.weapon === '长枪') {
                ctx.fillStyle = weaponColor; ctx.fillRect(0, -3, 70, 6);
                ctx.fillStyle = '#8b4513'; ctx.fillRect(-5, -5, 10, 10);
            }
        } else {
            ctx.translate(screenX + this.width / 2, this.y - this.height / 2);
            // 根据兵器显示不同持武器形态
            if (this.weapon === '剑') {
                ctx.fillStyle = weaponColor; ctx.fillRect(15, -25, 5, 35);
                ctx.fillStyle = '#8b4513'; ctx.fillRect(12, -3, 10, 6);
            } else if (this.weapon === '刀') {
                ctx.fillStyle = weaponColor; ctx.fillRect(18, -20, 8, 25);
                ctx.fillStyle = '#8b4513'; ctx.fillRect(15, -3, 10, 6);
            } else if (this.weapon === '长枪') {
                ctx.fillStyle = weaponColor; ctx.fillRect(20, -35, 4, 50);
                ctx.fillStyle = '#8b4513'; ctx.fillRect(12, -3, 10, 6);
            }
        }
        ctx.restore(); ctx.globalAlpha = 1;
    }
};
player.checkSkillUnlock();
player.updateAttackFromWeapon();

const ENEMY_TYPES = {
    阴魂: { minLevel: 1, hp: 20, attack: 5, exp: 20, speed: 50, color: '#7b2d8e', special: null },
    妖狼: { minLevel: 5, hp: 30, attack: 10, exp: 35, speed: 80, color: '#8B4513', special: 'fast' },
    毒蛛: { minLevel: 10, hp: 25, attack: 8, exp: 30, speed: 40, color: '#2E8B57', special: 'slow' },
    僵尸: { minLevel: 15, hp: 50, attack: 12, exp: 50, speed: 30, color: '#4A5D23', special: 'tank' }
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
    }
    
    takeDamage(damage, isCrit = false) {
        this.hp -= damage; this.damageFlash = 0.2;
        const textColor = isCrit ? '#ff0000' : '#ff4444';
        const text = isCrit ? '-' + Math.floor(damage) + '!' : '-' + Math.floor(damage);
        createFloatingText(this.x + this.width/2, this.y - this.height, text, textColor);
        
        // 暴击时额外粒子效果
        if (isCrit) {
            for (let i = 0; i < 10; i++) {
                createParticle(this.x + this.width/2, this.y - this.height/2, '#ffff00', 4);
            }
        }
        
        if (this.hp <= 0) this.die();
    }
    
    die() {
        this.alive = false;
        game.expOrbs.push(new ExpOrb(this.x + this.width/2, this.y - this.height/2, this.exp));
        game.killCount++; game.comboCount++; game.comboTimer = 5;
        
        // 击杀获得怒气
        player.addRage(10);
        
        // 慢动作效果
        game.slowMotion = 0.1;
        
        // 击杀屏幕震动
        game.screenShake = 0.15; game.screenShakeIntensity = 8;
        
        let comboReward = 0;
        if (game.comboCount >= 10) comboReward = game.comboRewards[10];
        else if (game.comboCount >= 5) comboReward = game.comboRewards[5];
        else if (game.comboCount >= 3) comboReward = game.comboRewards[3];
        if (comboReward > 0) { player.addExp(comboReward); createFloatingText(this.x, this.y - this.height - 20, game.comboCount + '连杀! +' + comboReward, '#ff00ff'); }
        for (let i = 0; i < 15; i++) createParticle(this.x + this.width/2, this.y - this.height/2, this.color, 6);
    }
    
    update(dt) {
        if (!this.alive) return;
        if (this.damageFlash > 0) this.damageFlash -= dt;
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.attacking) { this.attackFrame += dt * 8; if (this.attackFrame >= 1) this.attacking = false; }
        const dist = player.x - this.x;
        if (dist > 0 && dist < 300) this.x += this.speed * dt;
        if (dist > 0 && dist < this.attackRange + player.width/2 && this.attackCooldown <= 0) {
            this.attacking = true; this.attackFrame = 0; this.attackCooldown = this.special === 'fast' ? 0.8 : 1.5;
            if (player.takeDamage()) {
                player.hp -= this.attack;
                createFloatingText(player.x, player.y - player.height, '-' + this.attack, '#ff0000');
                createParticle(player.x + player.width/2, player.y - player.height/2, '#ff0000', 5);
                if (this.special === 'slow' && !player.slowed) { player.slowed = true; player.slowTimer = 3; createFloatingText(player.x, player.y - player.height - 20, '减速!', '#00ff00'); }
            } else { createFloatingText(player.x, player.y - player.height, '闪避!', '#00ffff'); }
        }
    }
    
    draw() {
        if (!this.alive) return;
        const screenX = this.x - CONFIG.cameraOffset;
        ctx.fillStyle = this.damageFlash > 0 ? '#ffffff' : this.color;
        
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
        
        const hpPercent = this.hp / this.maxHp;
        ctx.fillStyle = '#333'; ctx.fillRect(screenX, this.y - this.height - 15, this.width, 5);
        ctx.fillStyle = hpPercent > 0.5 ? '#44ff44' : '#ff4444'; ctx.fillRect(screenX, this.y - this.height - 15, this.width * hpPercent, 5);
    }
}

class Projectile {
    constructor(x, y, speed, damage, type) {
        this.x = x; this.y = y; this.speed = speed; this.damage = damage; this.type = type;
        this.width = type === 'rage' ? 50 : 30;
        this.height = type === 'rage' ? 15 : 8;
        this.alive = true; this.trail = [];
    }
    
    update(dt) {
        this.x += this.speed * dt;
        this.trail.push({ x: this.x, y: this.y, life: 1 });
        this.trail.forEach(t => t.life -= dt * 3);
        this.trail = this.trail.filter(t => t.life > 0);
        
        game.enemies.forEach(enemy => { 
            if (!enemy.alive) return; 
            if (this.x > enemy.x && this.x < enemy.x + enemy.width && this.y > enemy.y - enemy.height && this.y < enemy.y) { 
                enemy.takeDamage(this.damage); 
                if (this.type !== 'rage') this.alive = false; 
            } 
        });
        if (this.x > player.x + 800) this.alive = false;
    }
    
    draw() {
        const screenX = this.x - CONFIG.cameraOffset;
        let color = '#00ffff';
        if (this.type === 'rage') color = '#ff6600';
        
        this.trail.forEach(t => { 
            const tsx = t.x - CONFIG.cameraOffset; 
            ctx.globalAlpha = t.life; 
            ctx.fillStyle = color; 
            const tw = this.type === 'rage' ? 30 : 20;
            ctx.fillRect(tsx, t.y - 2, tw, 4); 
        });
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = color; 
        if (this.type === 'rage') {
            // 怒气技能弹道 - 更大的特效
            ctx.fillRect(screenX, this.y - this.height/2, this.width, this.height);
            ctx.beginPath(); ctx.moveTo(screenX + this.width, this.y - this.height/2); ctx.lineTo(screenX + this.width + 15, this.y); ctx.lineTo(screenX + this.width, this.y + this.height/2); ctx.closePath(); ctx.fill();
        } else {
            ctx.fillRect(screenX, this.y - this.height/2, this.width, this.height);
            ctx.beginPath(); ctx.moveTo(screenX + this.width, this.y - this.height/2); ctx.lineTo(screenX + this.width + 10, this.y); ctx.lineTo(screenX + this.width, this.y + this.height/2); ctx.closePath(); ctx.fill();
        }
    }
}

class ExpOrb {
    constructor(x, y, value) { this.x = x; this.y = y; this.value = value; this.radius = 8; this.collected = false; this.floatOffset = Math.random() * Math.PI * 2; }
    update(dt) {
        this.floatOffset += dt * 3;
        const dx = player.x + player.width/2 - this.x, dy = (player.y - player.height/2) - this.y, dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) { this.x += dx * 5 * dt; this.y += dy * 5 * dt; }
        if (dist < 20) { this.collected = true; player.addExp(this.value); createFloatingText(player.x, player.y - 60, '+' + this.value + ' EXP', '#ffd700'); }
    }
    draw() {
        const screenX = this.x - CONFIG.cameraOffset, floatY = Math.sin(this.floatOffset) * 3;
        const gradient = ctx.createRadialGradient(screenX, this.y + floatY, 0, screenX, this.y + floatY, this.radius * 2);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)'); gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(screenX, this.y + floatY, this.radius * 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(screenX, this.y + floatY, this.radius, 0, Math.PI * 2); ctx.fill();
    }
}

class Particle {
    constructor(x, y, color, size) { this.x = x; this.y = y; this.vx = (Math.random() - 0.5) * 200; this.vy = (Math.random() - 0.5) * 200 - 100; this.color = color; this.size = size; this.life = 1; this.decay = 2; }
    update(dt) { this.x += this.vx * dt; this.y += this.vy * dt; this.vy += 300 * dt; this.life -= this.decay * dt; }
    draw() { const screenX = this.x - CONFIG.cameraOffset; ctx.globalAlpha = Math.max(0, this.life); ctx.fillStyle = this.color; ctx.fillRect(screenX - this.size/2, this.y - this.size/2, this.size, this.size); ctx.globalAlpha = 1; }
}

class FloatingText {
    constructor(x, y, text, color) { this.x = x; this.y = y; this.text = text; this.color = color; this.life = 1; this.vy = -50; }
    update(dt) { this.y += this.vy * dt; this.life -= dt; }
    draw() { const screenX = this.x - CONFIG.cameraOffset; ctx.globalAlpha = Math.max(0, this.life); ctx.fillStyle = this.color; ctx.font = 'bold 16px Microsoft YaHei'; ctx.textAlign = 'center'; ctx.fillText(this.text, screenX, this.y); ctx.globalAlpha = 1; }
}

function createParticle(x, y, color, size) { game.particles.push(new Particle(x, y, color, size)); }
function createFloatingText(x, y, text, color) { game.particles.push(new FloatingText(x, y, text, color)); }

function spawnEnemy() {
    const x = player.x + 400 + Math.random() * 200;
    const availableTypes = [];
    if (player.level >= 1) availableTypes.push('阴魂');
    if (player.level >= 5) availableTypes.push('妖狼');
    if (player.level >= 10) availableTypes.push('毒蛛');
    if (player.level >= 15) availableTypes.push('僵尸');
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    game.enemies.push(new Enemy(x, type));
}

function update(dt) {
    if (game.gameOver) return;
    
    // 慢动作处理
    let actualDt = dt;
    if (game.slowMotion > 0) {
        actualDt = dt * 0.3;
        game.slowMotion -= dt;
    }
    
    // 屏幕震动衰减
    if (game.screenShake > 0) {
        game.screenShake -= dt;
    }
    
    player.update(actualDt);
    if (CONFIG.cameraOffset < 0) CONFIG.cameraOffset = 0;
    if (game.comboTimer > 0) { game.comboTimer -= actualDt; if (game.comboTimer <= 0) game.comboCount = 0; }
    game.spawnTimer += actualDt * 1000;
    if (game.spawnTimer >= game.spawnInterval) { spawnEnemy(); game.spawnTimer = 0; }
    game.enemies.forEach(enemy => enemy.update(actualDt));
    game.enemies.forEach(enemy => { if (!enemy.alive) return; const dist = Math.abs((player.x + player.width/2) - (enemy.x + enemy.width/2)); if (dist < player.attackRange) player.attackTarget(enemy); });
    game.enemies = game.enemies.filter(e => e.alive);
    game.expOrbs.forEach(orb => orb.update(actualDt)); game.expOrbs = game.expOrbs.filter(orb => !orb.collected);
    game.particles.forEach(p => p.update(actualDt)); game.particles = game.particles.filter(p => p.life > 0);
    game.projectiles.forEach(p => p.update(actualDt)); game.projectiles = game.projectiles.filter(p => p.alive);
    game.clouds.forEach(cloud => { cloud.x += cloud.speed * actualDt; if (cloud.x > player.x + CONFIG.width) cloud.x = player.x - cloud.width; });
    game.stars.forEach(star => star.twinkle += star.speed * actualDt);
    game.grass.forEach(grass => grass.sway += actualDt * 2);
    if (player.hp <= 0) { player.hp = 0; game.gameOver = true; }
}

function drawBackground() {
    const scene = getScene(game.distance);
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
    gradient.addColorStop(0, scene.bgColor[0]); gradient.addColorStop(0.5, scene.bgColor[1]); gradient.addColorStop(1, scene.bgColor[2]);
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    if (scene.name === '山野之路') {
        game.stars.forEach(star => { ctx.globalAlpha = 0.3 + Math.sin(star.twinkle) * 0.3; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill(); });
        ctx.globalAlpha = 1;
        game.clouds.forEach(cloud => { const screenX = cloud.x - CONFIG.cameraOffset * 0.2; ctx.globalAlpha = cloud.opacity; ctx.fillStyle = '#4a3f6b'; ctx.beginPath(); ctx.ellipse(screenX, cloud.y, cloud.width / 2, 30, 0, 0, Math.PI * 2); ctx.fill(); });
        ctx.globalAlpha = 1;
    }
    
    ctx.fillStyle = scene.name === '古墓遗迹' ? '#2a2a2a' : '#1a2a3a';
    ctx.beginPath(); ctx.moveTo(0, CONFIG.groundY - 50);
    for (let i = 0; i <= CONFIG.width; i += 50) { const offset = Math.sin((i + CONFIG.cameraOffset * 0.3) * 0.01) * 40; ctx.lineTo(i, CONFIG.groundY - 90 + offset); }
    ctx.lineTo(CONFIG.width, CONFIG.groundY); ctx.lineTo(0, CONFIG.groundY); ctx.closePath(); ctx.fill();
    
    ctx.fillStyle = scene.groundColor; ctx.fillRect(0, CONFIG.groundY, CONFIG.width, CONFIG.height - CONFIG.groundY);
    
    if (scene.name === '幽林深处') {
        game.grass.forEach(grass => {
            const screenX = ((grass.x - CONFIG.cameraOffset) % (CONFIG.width + 200)) - 100;
            if (screenX > -20 && screenX < CONFIG.width + 20) {
                const sway = Math.sin(grass.sway) * 3;
                ctx.fillStyle = '#2d5a2d';
                ctx.beginPath(); ctx.moveTo(screenX, CONFIG.groundY);
                ctx.quadraticCurveTo(screenX + sway, CONFIG.groundY - grass.height / 2, screenX + sway * 1.5, CONFIG.groundY - grass.height);
                ctx.quadraticCurveTo(screenX + sway + 1, CONFIG.groundY - grass.height / 2, screenX + 3, CONFIG.groundY); ctx.fill();
            }
        });
    }
}

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
    
    // 攻击力（显示兵器攻击力）
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Microsoft YaHei'; ctx.textAlign = 'left';
    ctx.fillText('攻击: ' + player.attack, 190, 32);
    
    // 暴击率
    const critPercent = Math.floor(player.getCritRate() * 100);
    ctx.fillStyle = '#ff6666'; ctx.font = '10px Microsoft YaHei';
    ctx.fillText('暴击: ' + critPercent + '%', 190, 44);
    
    // 境界
    ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 12px Microsoft YaHei'; ctx.textAlign = 'right';
    ctx.fillText('境界: ' + realm.name, CONFIG.width - 20, 25);
    
    // 距离
    ctx.fillStyle = '#00ffff'; ctx.font = '11px Microsoft YaHei';
    ctx.fillText('距离: ' + game.distance + 'm', CONFIG.width - 20, 42);
    
    // 击杀数
    ctx.fillStyle = '#ff6666'; ctx.font = '11px Microsoft YaHei';
    ctx.fillText('击杀: ' + game.killCount, CONFIG.width - 80, 25);
    
    // 连杀
    if (game.comboCount >= 3) {
        ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 12px Microsoft YaHei';
        ctx.fillText('连杀: ' + game.comboCount, CONFIG.width - 80, 42);
    }
    
    // 技能UI
    let skillX = 20;
    Object.keys(SKILLS).forEach((skillName, index) => {
        const skill = player.skills[skillName];
        const skillData = SKILLS[skillName];
        
        ctx.fillStyle = skill.unlocked ? (skill.cooldownTimer > 0 ? '#555' : '#333') : '#222';
        ctx.beginPath(); ctx.arc(skillX + 20, CONFIG.height - 35, 18, 0, Math.PI * 2); ctx.fill();
        
        if (skill.unlocked) {
            ctx.fillStyle = '#fff'; ctx.font = '16px Microsoft YaHei'; ctx.textAlign = 'center';
            ctx.fillText(skillData.icon, skillX + 20, CONFIG.height - 30);
            
            if (skill.cooldownTimer > 0) {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.beginPath(); ctx.arc(skillX + 20, CONFIG.height - 35, 18, -Math.PI/2, -Math.PI/2 + (skill.cooldownTimer / skillData.cooldown) * Math.PI * 2); ctx.fill();
            }
            
            if (!skill.unlocked) {
                ctx.fillStyle = '#666'; ctx.font = '10px Microsoft YaHei';
                ctx.fillText('Lv.' + skillData.unlockLevel, skillX + 20, CONFIG.height - 15);
            }
        } else {
            ctx.fillStyle = '#444'; ctx.font = 'bold 14px Microsoft YaHei'; ctx.textAlign = 'center';
            ctx.fillText('?', skillX + 20, CONFIG.height - 30);
            ctx.fillStyle = '#444'; ctx.font = '9px Microsoft YaHei';
            ctx.fillText('Lv.' + skillData.unlockLevel, skillX + 20, CONFIG.height - 15);
        }
        
        skillX += 50;
    });
    
    // 技能提示
    ctx.fillStyle = '#888'; ctx.font = '10px Microsoft YaHei'; ctx.textAlign = 'left';
    ctx.fillText('按空格释放技能', 20, CONFIG.height - 8);
    
    // ===== 兵器切换UI =====
    let weaponX = 100;
    Object.keys(WEAPONS).forEach((weaponName, index) => {
        const w = WEAPONS[weaponName];
        const isSelected = player.weapon === weaponName;
        
        ctx.fillStyle = isSelected ? '#444' : '#222';
        ctx.strokeStyle = isSelected ? '#00ff00' : '#555';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath(); ctx.arc(weaponX + 15, CONFIG.height - 35, 16, 0, Math.PI * 2); 
        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = isSelected ? '#fff' : '#888';
        ctx.font = '14px Microsoft YaHei'; ctx.textAlign = 'center';
        ctx.fillText(w.icon, weaponX + 15, CONFIG.height - 30);
        
        ctx.fillStyle = isSelected ? '#00ff00' : '#666';
        ctx.font = '9px Microsoft YaHei';
        ctx.fillText(index + 1, weaponX + 15, CONFIG.height - 12);
        
        weaponX += 40;
    });
    
    // ===== 怒气条UI =====
    const ragePercent = player.rage / player.maxRage;
    ctx.fillStyle = '#333'; ctx.fillRect(20, 56, 160, 10);
    ctx.fillStyle = player.rage >= player.maxRage ? '#ff6600' : '#ff4444';
    ctx.fillRect(20, 56, 160 * ragePercent, 10);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(20, 56, 160, 10);
    ctx.fillStyle = player.rage >= player.maxRage ? '#ff6600' : '#fff';
    ctx.font = '9px Microsoft YaHei'; ctx.textAlign = 'right';
    ctx.fillText('怒气: ' + player.rage + '/' + player.maxRage, 176, 64);
    
    // 怒气满时提示
    if (player.rage >= player.maxRage) {
        ctx.fillStyle = '#ff6600'; ctx.font = 'bold 10px Microsoft YaHei'; ctx.textAlign = 'left';
        const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillText('按Q释放怒气技能!', 20, 80);
        ctx.globalAlpha = 1;
    }
    
    // 闪避状态
    if (player.isDodging) {
        ctx.fillStyle = '#00ffff'; ctx.font = 'bold 16px Microsoft YaHei'; ctx.textAlign = 'center';
        ctx.fillText('闪避中!', CONFIG.width / 2, 70);
    }
    
    // 游戏结束
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
        
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 48px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', CONFIG.width/2, CONFIG.height/2 - 20);
        
        ctx.fillStyle = '#fff';
        ctx.font = '20px Microsoft YaHei';
        ctx.fillText('最终等级: Lv.' + player.level + ' ' + realm.name, CONFIG.width/2, CONFIG.height/2 + 20);
        ctx.fillText('前行距离: ' + game.distance + 'm', CONFIG.width/2, CONFIG.height/2 + 50);
        ctx.fillText('击杀总数: ' + game.killCount, CONFIG.width/2, CONFIG.height/2 + 80);
        ctx.fillText('重新刷新页面重新开始', CONFIG.width/2, CONFIG.height/2 + 110);
    }
}

function draw() {
    // 屏幕震动效果
    ctx.save();
    if (game.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * game.screenShakeIntensity;
        const shakeY = (Math.random() - 0.5) * game.screenShakeIntensity;
        ctx.translate(shakeX, shakeY);
    }
    
    drawBackground();
    
    game.expOrbs.forEach(orb => orb.draw());
    game.enemies.forEach(enemy => enemy.draw());
    game.projectiles.forEach(p => p.draw());
    player.draw();
    game.particles.forEach(p => p.draw());
    drawUI();
    
    ctx.restore();
}

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - game.lastTime) / 1000, 0.1);
    game.lastTime = timestamp;
    
    update(dt);
    draw();
    
    if (game.running) {
        requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    game.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// 键盘事件
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        // 优先释放已解锁且不在冷却的技能
        if (player.skills.护体神光.unlocked && player.skills.护体神光.cooldownTimer <= 0) {
            player.useSkill('护体神光');
        } else if (player.skills.剑气斩.unlocked && player.skills.剑气斩.cooldownTimer <= 0) {
            player.useSkill('剑气斩');
        } else if (player.skills.御剑术.unlocked && player.skills.御剑术.cooldownTimer <= 0) {
            player.useSkill('御剑术');
        }
    }
    
    // 兵器切换 1/2/3
    if (e.code === 'Digit1' || e.key === '1') {
        player.switchWeapon('剑');
    } else if (e.code === 'Digit2' || e.key === '2') {
        player.switchWeapon('刀');
    } else if (e.code === 'Digit3' || e.key === '3') {
        player.switchWeapon('长枪');
    }
    
    // 怒气技能 Q
    if (e.code === 'KeyQ' || e.key === 'q' || e.key === 'Q') {
        if (player.rage >= player.maxRage) {
            player.useRageSkill();
        }
    }
});

window.onload = startGame;