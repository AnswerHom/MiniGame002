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

// ===== v1.1.0 新增系统 =====

const EQUIP_QUALITY = {
    凡品: { color: '#ffffff', mult: 1.0 },
    精品: { color: '#00ff00', mult: 1.5 },
    极品: { color: '#0088ff', mult: 2.0 },
    仙品: { color: '#ff00ff', mult: 3.0 }
};

// v1.1.0 境界突破配置
const REALM_BREAKTHROUGH = {
    筑基: { requiredLevel: 5, guardian: '阴魂', guardianMult: 1 },
    金丹: { requiredLevel: 10, guardian: '妖狼', guardianMult: 2 },
    元婴: { requiredLevel: 15, guardian: '毒蛛', guardianMult: 2.5 },
    化神: { requiredLevel: 20, guardian: '僵尸', guardianMult: 3 },
    炼虚: { requiredLevel: 25, guardian: '阴魂', guardianMult: 4 },
    合体: { requiredLevel: 30, guardian: '妖狼', guardianMult: 5 },
    大乘: { requiredLevel: 35, guardian: '毒蛛', guardianMult: 6 },
    渡劫: { requiredLevel: 40, guardian: '僵尸', guardianMult: 8 }
};

// ===== v1.2.0 炼丹系统 =====

// 药材数据库
const HERBS = {
    '止血草': { level: 1, name: '止血草', icon: '🌿', color: '#44ff44' },
    '灵气花': { level: 2, name: '灵气花', icon: '🌸', color: '#ff88ff' },
    '凝元果': { level: 3, name: '凝元果', icon: '🍎', color: '#ffaa00' },
    '千年灵芝': { level: 4, name: '千年灵芝', icon: '🍄', color: '#aa44ff' },
    '九天雪莲': { level: 5, name: '九天雪莲', icon: '❄️', color: '#88ffff' }
};

// 丹方配方
const RECIPES = {
    '止血丹': { name: '止血丹', ingredients: { '止血草': 2 }, effect: 'heal', value: 50, icon: '💊' },
    '聚气丹': { name: '聚气丹', ingredients: { '灵气花': 2 }, effect: 'exp', value: 10, icon: '✨' },
    '培元丹': { name: '培元丹', ingredients: { '凝元果': 2 }, effect: 'attack', value: 5, icon: '⚔️' },
    '筑基丹': { name: '筑基丹', ingredients: { '千年灵芝': 1 }, effect: 'breakthrough', value: 0.5, icon: '🧘' },
    '升仙丹': { name: '升仙丹', ingredients: { '九天雪莲': 1 }, effect: 'revive', value: 1, icon: '🌟' }
};

// ===== v1.2.0 灵宠系统 =====

// 灵宠数据库
const PETS = {
    '小狐狸': { name: '小狐狸', quality: '普通', icon: '🦊', skill: 'attackBuff', skillName: '攻击辅助', attackBonus: 5, defenseBonus: 0, speedBonus: 0, catchRate: 0.8 },
    '青蛇': { name: '青蛇', quality: '优秀', icon: '🐍', skill: 'slow', skillName: '减速敌人', attackBonus: 3, defenseBonus: 2, speedBonus: 0, catchRate: 0.5 },
    '雷鹰': { name: '雷鹰', quality: '稀有', icon: '🦅', skill: 'lightning', skillName: '闪电攻击', attackBonus: 8, defenseBonus: 1, speedBonus: 5, catchRate: 0.3 },
    '仙鹤': { name: '仙鹤', quality: '稀有', icon: '🦢', skill: 'speed', skillName: '移动加速', attackBonus: 2, defenseBonus: 3, speedBonus: 10, catchRate: 0.3 },
    '白虎': { name: '白虎', quality: '传说', icon: '🐯', skill: 'battle', skillName: '战斗助战', attackBonus: 15, defenseBonus: 5, speedBonus: 3, catchRate: 0.1 }
};

const PET_QUALITY_COLORS = {
    '普通': '#ffffff',
    '优秀': '#00ff00',
    '稀有': '#0088ff',
    '传说': '#ff00ff'
};

// ===== v1.3.0 仙侣系统 =====

// 仙侣数据库
const COMPANIONS = {
    '素女': { name: '素女', quality: '普通', icon: '👩', skill: 'lifeBonus', skillName: '生命加成', lifeBonus: 50, attackBonus: 0, realmRequired: '筑基', description: '普通仙侣，生命加成' },
    '剑仙': { name: '剑仙', quality: '优秀', icon: '🗡️', skill: 'attackBonus', skillName: '攻击加成', lifeBonus: 0, attackBonus: 15, realmRequired: '金丹', description: '优秀仙侣，攻击加成' },
    '琴姬': { name: '琴姬', quality: '稀有', icon: '🎵', skill: 'expBonus', skillName: '经验加成', lifeBonus: 20, attackBonus: 10, realmRequired: '元婴', description: '稀有仙侣，经验加成' },
    '散人': { name: '散人', quality: '传说', icon: '🧘', skill: 'allBonus', skillName: '全属性加成', lifeBonus: 100, attackBonus: 30, realmRequired: '化神', description: '传说仙侣，全属性加成' }
};

const COMPANION_QUALITY_COLORS = {
    '普通': '#ffffff',
    '优秀': '#00ff00',
    '稀有': '#0088ff',
    '传说': '#ff00ff'
};

// ===== v1.4.0 宗门系统配置 =====
const SECTIONS = {
    '青云宗': { name: '青云宗', icon: '🏛️', bonus: 'attack', bonusValue: 0.10, description: '攻击加成+10%', requiredRealm: '筑基' },
    '玄冰宫': { name: '玄冰宫', icon: '❄️', bonus: 'defense', bonusValue: 0.10, description: '防御加成+10%', requiredRealm: '金丹' },
    '天机阁': { name: '天机阁', icon: '📚', bonus: 'exp', bonusValue: 0.15, description: '经验加成+15%', requiredRealm: '元婴' },
    '万兽山': { name: '万兽山', icon: '🦁', bonus: 'pet', bonusValue: 0.10, description: '灵宠强化+10%', requiredRealm: '金丹' }
};

const SECTION_TASKS = {
    '击杀怪物': { name: '击杀怪物', target: 10, reward: 50, icon: '⚔️' },
    '采集药材': { name: '采集药材', target: 5, reward: 30, icon: '🌿' },
    '挑战副本': { name: '挑战副本', target: 1, reward: 100, icon: '🏰' }
};

// ===== v1.4.0 坐骑系统配置 =====
const MOUNTS = {
    '灵鹿': { name: '灵鹿', quality: '普通', icon: '🦌', speedBonus: 0.20, attackBonus: 0, unlockLevel: 25 },
    '云鹤': { name: '云鹤', quality: '优秀', icon: '🦢', speedBonus: 0.30, attackBonus: 5, unlockLevel: 30 },
    '麒麟': { name: '麒麟', quality: '稀有', icon: '🦓', speedBonus: 0.40, attackBonus: 10, unlockLevel: 35 },
    '鲲鹏': { name: '鲲鹏', quality: '传说', icon: '🐦', speedBonus: 0.50, attackBonus: 0.15, unlockLevel: 40 }
};

const MOUNT_QUALITY_COLORS = {
    '普通': '#ffffff',
    '优秀': '#00ff00',
    '稀有': '#0088ff',
    '传说': '#ff00ff'
};

// ===== v1.4.0 符文系统配置 =====
const RUNES = {
    // v1.4.0 原有符文
    '力量符文': { name: '力量符文', quality: '普通', icon: '💪', stat: 'attack', statValue: 0.05 },
    '坚固符文': { name: '坚固符文', quality: '普通', icon: '🛡️', stat: 'defense', statValue: 0.05 },
    '敏捷符文': { name: '敏捷符文', quality: '普通', icon: '⚡', stat: 'speed', statValue: 0.05 },
    '暴击符文': { name: '暴击符文', quality: '稀有', icon: '💥', stat: 'critRate', statValue: 0.03 },
    '生命符文': { name: '生命符文', quality: '稀有', icon: '❤️', stat: 'maxHp', statValue: 0.10 },
    '神圣符文': { name: '神圣符文', quality: '传说', icon: '✨', stat: 'skillDamage', statValue: 0.15 },
    // v1.9.0 新增符文
    '防御符文': { name: '防御符文', quality: '普通', icon: '🛡️', stat: 'defense', statValue: 0.05 },
    '速度符文': { name: '速度符文', quality: '普通', icon: '🏃', stat: 'speed', statValue: 0.05 },
    '吸血符文': { name: '吸血符文', quality: '稀有', icon: '🩸', stat: 'lifesteal', statValue: 0.05 },
    '免伤符文': { name: '免伤符文', quality: '稀有', icon: '🛡️', stat: 'damageReduction', statValue: 0.08 }
};

const RUNE_QUALITY_COLORS = {
    '普通': '#ffffff',
    '稀有': '#0088ff',
    '传说': '#ff00ff'
};

// ===== v1.4.0 连携系统配置 =====
const COMBO_SKILLS = {
    5: { name: '连携技·小', damageMult: 0.5, color: '#ffff00', text: '连击!' },
    10: { name: '连携技·中', damageMult: 1.0, color: '#ff8800', text: '连击!!' },
    20: { name: '连携技·大', damageMult: 2.0, color: '#ff00ff', text: '连击!!!' }
};

for (let i = 0; i < 8; i++) game.clouds.push({ x: Math.random() * 2000, y: 50 + Math.random() * 150, width: 100 + Math.random() * 150, speed: 10 + Math.random() * 20, opacity: 0.1 + Math.random() * 0.2 });
for (let i = 0; i < 50; i++) game.stars.push({ x: Math.random() * CONFIG.width, y: Math.random() * (CONFIG.groundY - 100), size: 1 + Math.random() * 2, twinkle: Math.random() * Math.PI * 2, speed: 1 + Math.random() * 3 });
for (let i = 0; i < 30; i++) game.grass.push({ x: i * 60 + Math.random() * 30, height: 8 + Math.random() * 12, sway: Math.random() * Math.PI * 2 });

// v1.7.0 主动技能系统
const ACTIVE_SKILLS = {
    '御剑术': { 
        name: '御剑术', 
        icon: '🗡️', 
        cooldown: 5, 
        damage: 1.5, 
        range: 300,
        description: '远程飞剑伤害',
        unlockLevel: 1
    },
    '剑气斩': { 
        name: '剑气斩', 
        icon: '⚔️', 
        cooldown: 8, 
        damage: 2.0, 
        knockback: 100, 
        description: '范围伤害+击退',
        unlockLevel: 5
    },
    '护体光环': { 
        name: '护体光环', 
        icon: '🛡️', 
        cooldown: 12, 
        duration: 3, 
        reflectDamage: 0.5,
        description: '3秒内免伤+反伤',
        unlockLevel: 10
    },
    '疾风步': { 
        name: '疾风步', 
        icon: '💨', 
        cooldown: 10, 
        dashDistance: 200, 
        speedBonus: 1.5,
        duration: 3,
        description: '瞬间位移+加速3秒',
        unlockLevel: 3
    }
};

const SKILLS = {
    御剑术: { unlockLevel: 5, cooldown: 5, damage: 1.5, name: '御剑术', icon: '🗡️' },
    剑气斩: { unlockLevel: 10, cooldown: 8, damage: 2.0, name: '剑气斩', icon: '⚔️' },
    护体神光: { unlockLevel: 15, cooldown: 15, duration: 3, name: '护体神光', icon: '🛡️' }
};


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

// v1.8.0 金币类 - 支持自动拾取
class GoldCoin {
    constructor(x, y, value) { 
        this.x = x; 
        this.y = y; 
        this.value = value; 
        this.radius = 6; 
        this.collected = false; 
        this.floatOffset = Math.random() * Math.PI * 2;
        this.startX = x;  // 记录初始位置用于动画
    }
    update(dt) {
        this.floatOffset += dt * 4;
        
        // v1.8.0 金币自动拾取 - 距离玩家100像素内自动飞向玩家
        const dx = player.x + player.width/2 - this.x, dy = (player.y - player.height/2) - this.y, dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) { 
            // 加速飞向玩家
            this.x += dx * 8 * dt; 
            this.y += dy * 8 * dt; 
        }
        
        // 拾取距离
        if (dist < 25) { 
            this.collected = true; 
            game.gold += this.value; 
            createFloatingText(player.x, player.y - 60, '💰 +' + this.value, '#ffd700');
            // v1.8.0 拾取金币音效
            playSound('coin');
        }
    }
    draw() {
        const screenX = this.x - CONFIG.cameraOffset, floatY = Math.sin(this.floatOffset) * 3;
        
        // 金币光晕
        const gradient = ctx.createRadialGradient(screenX, this.y + floatY, 0, screenX, this.y + floatY, this.radius * 2.5);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)'); gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(screenX, this.y + floatY, this.radius * 2.5, 0, Math.PI * 2); ctx.fill();
        
        // 金币主体
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.arc(screenX, this.y + floatY, this.radius, 0, Math.PI * 2); ctx.fill();
        
        // 金币图案
        ctx.fillStyle = '#ffaa00';
        ctx.font = '8px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('$', screenX, this.y + floatY + 3);
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
