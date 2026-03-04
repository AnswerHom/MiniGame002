// MiniGame002 - 游戏主逻辑 v1.3.0
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CONFIG = { width: 800, height: 450, groundY: 380, cameraOffset: 0 };
canvas.width = CONFIG.width;
canvas.height = CONFIG.height;

const REALMS = [
    { name: '筑基', minLevel: 1 }, { name: '金丹', minLevel: 5 },
    { name: '元婴', minLevel: 10 }, { name: '化神', minLevel: 15 },
    { name: '炼虚', minLevel: 20 }, { name: '合体', minLevel: 25 },
    { name: '大乘', minLevel: 30 }, { name: '渡劫', minLevel: 35 },
    { name: '飞升', minLevel: 45 }
];

// 境界加成配置
const REALM_BONUS = {
    '筑基': 1.0, '金丹': 1.2, '元婴': 1.5, '化神': 2.0,
    '炼虚': 2.5, '合体': 3.0, '大乘': 4.0, '渡劫': 5.0, '飞升': 6.0
};

// 装备等级颜色
const EQUIP_COLORS = {
    '凡品': '#ffffff',
    '精品': '#00ff00',
    '极品': '#0088ff',
    '仙品': '#ff00ff'
};

// 装备类型定义
const EQUIP_TYPES = {
    '武器': { slot: 'weapon', stat: 'attack', statName: '攻击', icon: '⚔️' },
    '防具': { slot: 'armor', stat: 'defense', statName: '防御', icon: '🛡️' },
    '饰品': { slot: 'accessory', stat: 'critRate', statName: '暴击', icon: '💍' }
};

// 装备数据库
const EQUIP_DATABASE = {
    '武器': {
        '凡品': [
            { name: '铁剑', attack: 5 },
            { name: '木剑', attack: 3 }
        ],
        '精品': [
            { name: '精钢剑', attack: 12 },
            { name: '玄铁剑', attack: 15 }
        ],
        '极品': [
            { name: '青虹剑', attack: 25 },
            { name: '赤焰剑', attack: 28 }
        ],
        '仙品': [
            { name: '倚天剑', attack: 50 },
            { name: '屠龙刀', attack: 55 }
        ]
    },
    '防具': {
        '凡品': [
            { name: '粗布衣', defense: 3 },
            { name: '麻衣', defense: 2 }
        ],
        '精品': [
            { name: '铁甲', defense: 8 },
            { name: '皮甲', defense: 6 }
        ],
        '极品': [
            { name: '锁子甲', defense: 15 },
            { name: '鳞甲', defense: 18 }
        ],
        '仙品': [
            { name: '天蚕丝甲', defense: 35 },
            { name: '金缕衣', defense: 40 }
        ]
    },
    '饰品': {
        '凡品': [
            { name: '粗糙戒指', critRate: 0.01 },
            { name: '普通项链', critRate: 0.01 }
        ],
        '精品': [
            { name: '精金戒指', critRate: 0.03 },
            { name: '翡翠项链', critRate: 0.03 }
        ],
        '极品': [
            { name: '暴击戒指', critRate: 0.06 },
            { name: '敏捷项链', critRate: 0.05 }
        ],
        '仙品': [
            { name: '捆仙绳', critRate: 0.12 },
            { name: '定风珠', critRate: 0.10 }
        ]
    }
};

// 副本配置
const DUNGEONS = {
    '阴魂洞': { 
        name: '阴魂洞', difficulty: 1, 
        enemies: ['阴魂'], enemyCount: 10, 
        rewardExp: 500, rewardEquip: '仙品',
        description: '击败10只阴魂'
    },
    '妖狼谷': { 
        name: '妖狼谷', difficulty: 2, 
        enemies: ['妖狼'], enemyCount: 5, 
        rewardExp: 800, rewardEquip: '仙品',
        description: '击败5只妖狼'
    },
    '万蛛巢': { 
        name: '万蛛巢', difficulty: 3, 
        enemies: ['毒蛛'], enemyCount: 3, 
        rewardExp: 1200, rewardEquip: '仙品',
        description: '击败3只毒蛛'
    },
    '僵尸陵': { 
        name: '僵尸陵', difficulty: 3, 
        enemies: ['僵尸'], enemyCount: 2, 
        rewardExp: 1500, rewardEquip: '仙品',
        description: '击败2只僵尸'
    }
};

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
    slowMotion: 0,
    // v1.1.0 新增
    equipment: { 武器: null, 防具: null, 饰品: null },
    dungeon: null, dungeonTimer: 0, dungeonEnemiesRemaining: 0,
    dungeonEntrance: null,
    realmBreakthrough: false, guardian: null, guardianDefeated: false,
    // v1.2.0 炼丹系统
    herbs: { '止血草': 0, '灵气花': 0, '凝元果': 0, '千年灵芝': 0, '九天雪莲': 0 },
    alchemyOpen: false, selectedRecipe: null,
    // v1.2.0 灵宠系统
    pets: [], activePet: null, petSkillTimer: 0,
    wildPet: null, petCatchAttempt: 0,
    // v1.2.0 药材采集
    herbSpawns: [], herbSpawnTimer: 0,
    // v1.3.0 仙侣系统
    companionOpen: false, companion: null, companionSkillTimer: 0
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
    attack: 10, defense: 0, speed: 150, attackSpeed: 1.0, attackCooldown: 0, attackRange: 80,
    exp: 0, requiredExp: 100, direction: 1, attacking: false, attackFrame: 0, color: '#00d4ff',
    dodgeTimer: 0, isDodging: false,
    // 兵器系统
    weapon: '剑', rage: 0, maxRage: 100,
    // 暴击系统
    critRate: 0.05, critDamage: 2.0,
    // 装备系统 v1.1.0
    equipment: { 武器: null, 防具: null, 饰品: null },
    // 境界突破 v1.1.0
    realmBreakthroughPending: false,
    skills: { 御剑术: { unlocked: false, cooldownTimer: 0 }, 剑气斩: { unlocked: false, cooldownTimer: 0 }, 护体神光: { unlocked: false, cooldownTimer: 0, active: false, activeTimer: 0 } },
    slowed: false, slowTimer: 0,
    // v1.2.0 药材背包
    herbInventory: { '止血草': 3, '灵气花': 2, '凝元果': 0, '千年灵芝': 0, '九天雪莲': 0 },
    // v1.2.0 灵宠
    pets: [], activePet: null, permanentAttackBonus: 0,
    // v1.3.0 仙侣系统
    companion: null, companionSkillReady: true,
    
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
        let rate = this.critRate + (this.level - 1) * 0.01;
        // 饰品加成
        if (this.equipment.饰品 && this.equipment.饰品.stat === 'critRate') {
            rate += this.equipment.饰品.value * 0.01;
        }
        return rate;
    },
    
    getDefense() {
        let def = 0;
        if (this.equipment.防具) {
            def = this.equipment.防具.value;
        }
        return def;
    },
    
    // 装备装备
    equip(item) {
        const oldEquip = this.equipment[item.type];
        this.equipment[item.type] = item;
        this.recalcStats();
        createFloatingText(this.x, this.y - 80, '装备 ' + item.name, item.qualityColor);
    },
    
    recalcStats() {
        // 重新计算攻击力（含武器装备 + 灵宠加成 + 仙侣加成）
        const w = WEAPONS[this.weapon];
        let baseAttack;
        if (this.level < 5) baseAttack = 10 + (this.level - 1) * 2;
        else if (this.level < 10) baseAttack = 18 + (this.level - 5) * 3;
        else if (this.level < 15) baseAttack = 28 + (this.level - 10) * 4;
        else baseAttack = 38 + (this.level - 15) * 5;
        
        let attack = Math.floor(baseAttack * w.attackMult);
        if (this.equipment.武器) {
            attack += this.equipment.武器.value;
        }
        // v1.2.0 灵宠攻击加成
        if (this.activePet) {
            attack += this.activePet.attack * this.activePet.level;
        }
        // v1.3.0 仙侣攻击加成
        if (this.companion) {
            attack += this.companion.attackBonus;
        }
        this.attack = attack;
        
        // 防御力
        this.defense = this.getDefense();
        
        // v1.2.0 灵宠防御加成
        if (this.activePet) {
            this.defense += this.activePet.defense * this.activePet.level;
        }
        
        // 生命上限
        let maxHp;
        if (this.level < 5) maxHp = 100 + (this.level - 1) * 20;
        else if (this.level < 10) maxHp = 180 + (this.level - 5) * 25;
        else if (this.level < 15) maxHp = 280 + (this.level - 10) * 30;
        else maxHp = 380 + (this.level - 15) * 35;
        
        if (this.equipment.饰品 && this.equipment.饰品.stat === 'hp') {
            maxHp += this.equipment.饰品.value * 10;
        }
        // v1.3.0 仙侣生命加成
        if (this.companion) {
            maxHp += this.companion.lifeBonus;
        }
        this.maxHp = maxHp;
        
        // v1.2.0 灵宠速度加成
        let speed = 150;
        if (this.activePet) {
            speed += this.activePet.speed * this.activePet.level;
        }
        // v1.3.0 仙侣速度加成（如果有）
        // 仙侣不直接加成速度，但合体时可以触发技能
        this.speed = speed;
    },
    
    // v1.2.0 炼丹：使用丹药
    usePotion(potionName) {
        const recipe = RECIPES[potionName];
        if (!recipe) return false;
        
        // 检查材料
        for (let herb in recipe.ingredients) {
            if (!this.herbInventory[herb] || this.herbInventory[herb] < recipe.ingredients[herb]) {
                createFloatingText(this.x, this.y - 80, '材料不足!', '#ff4444');
                return false;
            }
        }
        
        // 消耗材料
        for (let herb in recipe.ingredients) {
            this.herbInventory[herb] -= recipe.ingredients[herb];
        }
        
        // 丹药效果
        if (recipe.effect === 'heal') {
            this.hp = Math.min(this.maxHp, this.hp + recipe.value);
            createFloatingText(this.x, this.y - 80, '+' + recipe.value + ' 生命!', '#44ff44');
        } else if (recipe.effect === 'exp') {
            this.addExp(recipe.value);
            createFloatingText(this.x, this.y - 80, '+' + recipe.value + ' 经验!', '#ffd700');
        } else if (recipe.effect === 'attack') {
            this.permanentAttackBonus += recipe.value;
            this.recalcStats();
            createFloatingText(this.x, this.y - 80, '+' + recipe.value + ' 永久攻击!', '#ff8800');
        } else if (recipe.effect === 'breakthrough') {
            this.realmBreakthroughPending = true;
            createFloatingText(this.x, this.y - 80, '突破丹有效!', '#ff00ff');
        } else if (recipe.effect === 'revive') {
            if (this.hp <= 0) {
                this.hp = this.maxHp;
                game.gameOver = false;
                createFloatingText(this.x, this.y - 80, '满血复活!', '#00ffff');
            } else {
                this.hp = this.maxHp;
                createFloatingText(this.x, this.y - 80, '生命全满!', '#44ff44');
            }
        }
        
        createParticle(this.x, this.y - 30, '#ffd700', 20);
        return true;
    },
    
    // v1.2.0 灵宠：捕捉灵宠
    catchPet(petName) {
        const petData = PETS[petName];
        if (!petData) return false;
        
        if (Math.random() < petData.catchRate) {
            const newPet = {
                name: petName,
                level: 1,
                exp: 0,
                requiredExp: 100,
                ...petData
            };
            this.pets.push(newPet);
            createFloatingText(this.x, this.y - 80, '捕捉 ' + petData.icon + petName + ' 成功!', PET_QUALITY_COLORS[petData.quality]);
            createParticle(this.x, this.y - 30, PET_QUALITY_COLORS[petData.quality], 20);
            return true;
        } else {
            createFloatingText(this.x, this.y - 80, '捕捉失败!', '#ff4444');
            return false;
        }
    },
    
    // v1.2.0 灵宠：装备灵宠
    equipPet(petIndex) {
        if (petIndex < 0 || petIndex >= this.pets.length) return;
        
        if (this.activePet === this.pets[petIndex]) {
            // 卸下
            this.activePet = null;
            createFloatingText(this.x, this.y - 80, '灵宠已卸下', '#aaaaaa');
        } else {
            // 装备
            this.activePet = this.pets[petIndex];
            createFloatingText(this.x, this.y - 80, '灵宠 ' + this.activePet.icon + this.activePet.name + ' 出战!', PET_QUALITY_COLORS[this.activePet.quality]);
        }
        this.recalcStats();
    },
    
    // v1.2.0 灵宠：升级
    petLevelUp(pet) {
        pet.level++;
        pet.exp = 0;
        pet.requiredExp = Math.floor(pet.requiredExp * 1.5);
        createFloatingText(this.x, this.y - 100, pet.icon + pet.name + ' 升级! Lv.' + pet.level, '#ffd700');
        this.recalcStats();
    },
    
    // v1.3.0 仙侣：绑定仙侣
    bindCompanion(companionName) {
        const compData = COMPANIONS[companionName];
        if (!compData) return false;
        
        const realm = this.getRealm();
        const realmIndex = REALMS.findIndex(r => r.name === realm.name);
        const requiredRealmIndex = REALMS.findIndex(r => r.name === compData.realmRequired);
        
        if (realmIndex < requiredRealmIndex) {
            createFloatingText(this.x, this.y - 80, '需要达到' + compData.realmRequired + '境界', '#ff8800');
            return false;
        }
        
        this.companion = {
            name: companionName,
            ...compData
        };
        this.recalcStats();
        createFloatingText(this.x, this.y - 100, '与 ' + compData.icon + companionName + ' 结为仙侣!', COMPANION_QUALITY_COLORS[compData.quality]);
        createParticle(this.x, this.y - 30, COMPANION_QUALITY_COLORS[compData.quality], 25);
        game.companionOpen = false;
        return true;
    },
    
    // v1.3.0 仙侣：解除绑定
    unbindCompanion() {
        if (!this.companion) {
            createFloatingText(this.x, this.y - 80, '没有仙侣', '#888');
            return;
        }
        const compName = this.companion.name;
        this.companion = null;
        this.recalcStats();
        createFloatingText(this.x, this.y - 80, '已与 ' + compName + ' 解除仙侣关系', '#aaaaaa');
    },
    
    // v1.3.0 仙侣：合体战斗触发
    activateCompanionSkill() {
        if (!this.companion || !this.companionSkillReady) return;
        
        // 仙侣技能效果
        if (this.companion.skill === 'lifeBonus') {
            // 生命加成 - 恢复生命
            this.hp = Math.min(this.maxHp, this.hp + this.companion.lifeBonus);
            createFloatingText(this.x, this.y - 100, this.companion.icon + '生命+"' + this.companion.lifeBonus + '"!', '#44ff44');
        } else if (this.companion.skill === 'attackBonus') {
            // 攻击加成 - 临时攻击力提升
            this.attack += this.companion.attackBonus;
            createFloatingText(this.x, this.y - 100, this.companion.icon + '攻击+"' + this.companion.attackBonus + '"!', '#ff8800');
            setTimeout(() => this.recalcStats(), 5000);
        } else if (this.companion.skill === 'expBonus') {
            // 经验加成 - 获得额外经验
            const bonusExp = 20;
            this.addExp(bonusExp);
            createFloatingText(this.x, this.y - 100, this.companion.icon + '经验+"' + bonusExp + '"!', '#ffd700');
        } else if (this.companion.skill === 'allBonus') {
            // 全属性加成
            this.hp = Math.min(this.maxHp, this.hp + 50);
            this.attack += 20;
            createFloatingText(this.x, this.y - 100, this.companion.icon + '全属性提升!', '#ff00ff');
            setTimeout(() => this.recalcStats(), 5000);
        }
        
        // 技能冷却
        this.companionSkillReady = false;
        setTimeout(() => { this.companionSkillReady = true; }, 10000);
    },
    
    // v1.3.0 仙侣：经验加成计算
    getExpBonus() {
        if (this.companion && this.companion.skill === 'expBonus') {
            return 1.5; // 50%经验加成
        }
        return 1.0;
    },
    
    // v1.3.0 灵宠：放生
    releasePet(petIndex) {
        if (petIndex < 0 || petIndex >= this.pets.length) return false;
        
        const pet = this.pets[petIndex];
        if (this.activePet === pet) {
            this.activePet = null;
        }
        this.pets.splice(petIndex, 1);
        createFloatingText(this.x, this.y - 80, '放生 ' + pet.icon + pet.name, '#aaaaaa');
        this.recalcStats();
        return true;
    },
    
    // 检查是否需要境界突破
    checkRealmBreakthrough() {
        const realm = getRealm(this.level);
        const nextRealm = REALMS[REALMS.indexOf(realm) + 1];
        if (!nextRealm) return;
        
        const btConfig = REALM_BREAKTHROUGH[nextRealm.name];
        if (btConfig && this.level >= btConfig.requiredLevel) {
            this.realmBreakthroughPending = true;
            createFloatingText(this.x, this.y - 100, '境界突破任务已解锁!', '#ff00ff');
        }
    },
    
    // 开始境界突破
    startRealmBreakthrough() {
        const realm = getRealm(this.level);
        const nextRealm = REALMS[REALMS.indexOf(realm) + 1];
        if (!nextRealm) return;
        
        const btConfig = REALM_BREAKTHROUGH[nextRealm.name];
        if (!btConfig) return;
        
        // 生成守护者
        const guardianType = btConfig.guardian;
        const config = ENEMY_TYPES[guardianType];
        const guardian = new Enemy(player.x + 300, guardianType);
        guardian.hp = config.hp * btConfig.guardianMult * 3;
        guardian.maxHp = guardian.hp;
        guardian.attack = config.attack * btConfig.guardianMult;
        
        game.guardian = guardian;
        game.realmBreakthrough = true;
        game.enemies.push(guardian);
        
        createFloatingText(this.x, this.y - 100, '突破开始! 击败' + guardianType + '!', '#ff00ff');
        createParticle(this.x, this.y - 50, '#ff00ff', 20);
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
        this.recalcStats();
        this.checkSkillUnlock();
        this.checkRealmBreakthrough();
        createParticle(this.x, this.y - 30, 'gold', 20);
        createFloatingText(this.x, this.y - 50, '升级! Lv.' + this.level, '#ffd700');
        const realm = this.getRealm();
        if (this.level > 1 && (this.level - 1) % 5 === 0) createFloatingText(this.x, this.y - 70, '突破! ' + realm.name, '#ff00ff');
    },
    
    addExp(amount) {
        // v1.3.0 仙侣经验加成
        const expMultiplier = this.getExpBonus();
        const finalAmount = Math.floor(amount * expMultiplier);
        this.exp += finalAmount;
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
        
        // 尝试掉落装备
        tryDropEquipment(this);
        
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
    // 副本中不生成普通怪物
    if (game.dungeon) return;
    
    const x = player.x + 400 + Math.random() * 200;
    const availableTypes = [];
    if (player.level >= 1) availableTypes.push('阴魂');
    if (player.level >= 5) availableTypes.push('妖狼');
    if (player.level >= 10) availableTypes.push('毒蛛');
    if (player.level >= 15) availableTypes.push('僵尸');
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    game.enemies.push(new Enemy(x, type));
    
    // 每1000米生成副本入口
    const newDistance = Math.floor((player.x - 100) / 10);
    if (newDistance > 0 && newDistance % 1000 === 0 && !game.dungeonEntrance) {
        game.dungeonEntrance = { x: player.x + 500, unlocked: false };
    }
}

// 装备掉落
function tryDropEquipment(enemy) {
    let dropChance = 0.1; // 10%基础掉落
    let quality = '凡品';
    
    // 精英/首领怪必掉装备
    if (enemy.type === '阴魂' && Math.random() < 0.3) {
        dropChance = 1; quality = '精品';
    }
    
    if (Math.random() < dropChance) {
        const types = ['武器', '防具', '饰品'];
        const equipType = types[Math.floor(Math.random() * types.length)];
        const q = EQUIP_QUALITY[quality];
        
        let stat, statName, value;
        if (equipType === '武器') {
            stat = 'attack'; statName = '攻击'; value = Math.floor(5 * q.mult + Math.random() * 5);
        } else if (equipType === '防具') {
            stat = 'defense'; statName = '防御'; value = Math.floor(3 * q.mult + Math.random() * 3);
        } else {
            const stats = ['critRate', 'hp'];
            stat = stats[Math.floor(Math.random() * stats.length)];
            statName = stat === 'critRate' ? '暴击' : '生命';
            value = stat === 'critRate' ? Math.floor(1 + Math.random() * 3) : Math.floor(2 + Math.random() * 3);
        }
        
        const item = {
            type: equipType,
            name: quality + statName + (Math.floor(Math.random() * 100) + 1),
            quality: quality,
            qualityColor: q.color,
            stat: stat,
            statName: statName,
            value: value
        };
        
        game.equipment[equipType] = item;
        player.recalcStats();
        
        createFloatingText(enemy.x, enemy.y - enemy.height - 30, '掉落' + item.name + '!', q.color);
        createParticle(enemy.x, enemy.y - enemy.height/2, q.color, 15);
    }
    
    // v1.2.0 药材掉落
    tryDropHerbs(enemy);
    
    // v1.2.0 灵宠掉落
    trySpawnWildPet(enemy);
}

// v1.2.0 药材掉落
function tryDropHerbs(enemy) {
    let herbType = null;
    let dropChance = 0.3;
    
    // 根据怪物类型掉落不同药材
    if (enemy.type === '阴魂') {
        if (Math.random() < 0.3) herbType = '止血草';
    } else if (enemy.type === '妖狼') {
        if (Math.random() < 0.25) herbType = '灵气花';
    } else if (enemy.type === '毒蛛') {
        if (Math.random() < 0.2) herbType = '凝元果';
    } else if (enemy.type === '僵尸') {
        if (Math.random() < 0.15) herbType = '千年灵芝';
    }
    
    if (herbType) {
        player.herbInventory[herbType] = (player.herbInventory[herbType] || 0) + 1;
        const herb = HERBS[herbType];
        createFloatingText(enemy.x, enemy.y - enemy.height - 45, '获得' + herb.icon + herbType + '!', herb.color);
        createParticle(enemy.x, enemy.y - enemy.height/2, herb.color, 10);
    }
}

// v1.2.0 野生灵宠生成
function trySpawnWildPet(enemy) {
    // 只有精英怪才有几率生成灵宠
    if (enemy.type !== '阴魂' && enemy.type !== '妖狼') return;
    
    // 5%几率生成野生灵宠
    if (Math.random() < 0.05 && !game.wildPet) {
        const petKeys = Object.keys(PETS);
        const petName = petKeys[Math.floor(Math.random() * petKeys.length)];
        const petData = PETS[petName];
        
        game.wildPet = {
            name: petName,
            x: enemy.x,
            y: CONFIG.groundY,
            ...petData,
            hp: 30,
            maxHp: 30
        };
        
        createFloatingText(enemy.x, enemy.y - enemy.height - 60, '发现野生' + petData.icon + petName + '!', PET_QUALITY_COLORS[petData.quality]);
    }
}

// 进入副本
function enterDungeon(dungeonKey) {
    const dungeon = DUNGEONS[dungeonKey];
    if (!dungeon) return;
    if (player.level < dungeon.minLevel) {
        createFloatingText(player.x, player.y - 80, '等级不足!', '#ff0000');
        return;
    }
    
    game.dungeon = dungeon;
    game.dungeonEnemiesRemaining = dungeon.count;
    game.dungeonTimer = 0;
    game.enemies = []; // 清除当前怪物
    
    // 生成副本怪物
    for (let i = 0; i < dungeon.count; i++) {
        const x = player.x + 300 + i * 150;
        const type = dungeon.enemies[Math.floor(Math.random() * dungeon.enemies.length)];
        const enemy = new Enemy(x, type);
        game.enemies.push(enemy);
    }
    
    createFloatingText(player.x, player.y - 100, '进入' + dungeon.name + '!', '#ff00ff');
    game.screenShake = 0.3;
}

// 副本完成
function completeDungeon() {
    const dungeon = game.dungeon;
    if (!dungeon) return;
    
    // 奖励经验
    player.addExp(dungeon.rewardExp);
    createFloatingText(player.x, this.x - 80, '副本通关! +' + dungeon.rewardExp + '经验', '#ffd700');
    
    // 必定掉落装备
    const types = ['武器', '防具', '饰品'];
    const equipType = types[Math.floor(Math.random() * types.length)];
    const quality = '仙品';
    const q = EQUIP_QUALITY[quality];
    
    let stat, statName, value;
    if (equipType === '武器') {
        stat = 'attack'; statName = '攻击'; value = Math.floor(15 + Math.random() * 10);
    } else if (equipType === '防具') {
        stat = 'defense'; statName = '防御'; value = Math.floor(10 + Math.random() * 8);
    } else {
        stat = 'critRate'; statName = '暴击'; value = Math.floor(3 + Math.random() * 5);
    }
    
    const item = {
        type: equipType,
        name: quality + statName + (Math.floor(Math.random() * 100) + 100),
        quality: quality,
        qualityColor: q.color,
        stat: stat,
        statName: statName,
        value: value
    };
    
    player.equipment[equipType] = item;
    player.recalcStats();
    createFloatingText(player.x, player.y - 60, '获得仙品' + item.name + '!', q.color);
    
    game.dungeon = null;
    game.dungeonEnemiesRemaining = 0;
    game.screenShake = 0.5;
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
    
    // v1.2.0 灵宠战斗协助 + v1.3.0 技能补全
    if (player.activePet) {
        game.petSkillTimer += actualDt;
        if (game.petSkillTimer >= 10) { // 每10秒触发一次灵宠技能
            game.petSkillTimer = 0;
            // 灵宠技能效果
            const pet = player.activePet;
            if (pet.skill === 'attackBuff') {
                // 攻击辅助 - 造成额外伤害
                const nearestEnemy = game.enemies.find(e => e.alive && Math.abs(e.x - player.x) < 300);
                if (nearestEnemy) {
                    nearestEnemy.takeDamage(pet.attack * pet.level * 2);
                    createFloatingText(nearestEnemy.x, nearestEnemy.y - 60, pet.icon + pet.name + ' 助攻!', PET_QUALITY_COLORS[pet.quality]);
                }
            } else if (pet.skill === 'lightning') {
                // 闪电攻击
                game.enemies.forEach(e => {
                    if (e.alive && Math.abs(e.x - player.x) < 200) {
                        e.takeDamage(pet.attack * pet.level);
                    }
                });
                createFloatingText(player.x, player.y - 100, pet.icon + ' 闪电攻击!', '#ffff00');
                createParticle(player.x, player.y - 50, '#ffff00', 15);
            } else if (pet.skill === 'slow') {
                // 减速敌人
                game.enemies.forEach(e => {
                    if (e.alive && Math.abs(e.x - player.x) < 150 && !e.slowed) {
                        e.slowed = true; e.slowTimer = 3;
                    }
                });
                createFloatingText(player.x, player.y - 100, pet.icon + ' 减速敌人!', '#88ff88');
            } else if (pet.skill === 'speed') {
                // v1.3.0 补全 仙鹤 - 移动加速
                player.speed += 30;
                createFloatingText(player.x, player.y - 100, pet.icon + ' 速度提升!', '#00ffff');
                setTimeout(() => player.recalcStats(), 5000); // 5秒后恢复
            } else if (pet.skill === 'battle') {
                // v1.3.0 补全 白虎 - 战斗助战
                // 白虎会主动攻击附近的敌人
                const nearbyEnemies = game.enemies.filter(e => e.alive && Math.abs(e.x - player.x) < 250);
                if (nearbyEnemies.length > 0) {
                    nearbyEnemies.forEach(e => {
                        e.takeDamage(pet.attack * pet.level * 1.5);
                    });
                    createFloatingText(player.x, player.y - 100, pet.icon + ' 战斗助战!', '#ff8800');
                    createParticle(player.x, player.y - 50, '#ff8800', 20);
                }
            }
            
            // 灵宠升级检查
            if (pet.exp >= pet.requiredExp) {
                player.petLevelUp(pet);
            }
        }
    }
    
    // v1.2.0 药材采集刷新 + v1.3.0 E键采集优化
    game.herbSpawnTimer += actualDt;
    if (game.herbSpawnTimer >= 30) { // 每30秒刷新药材
        game.herbSpawnTimer = 0;
        // v1.3.0: 在地图上生成可采集的药材
        const herbTypes = Object.keys(HERBS);
        const randomHerb = herbTypes[Math.floor(Math.random() * 3)]; // 只生成低级药材
        const herbData = HERBS[randomHerb];
        game.herbSpawns.push({
            name: randomHerb,
            x: player.x + (Math.random() - 0.5) * 400,
            ...herbData
        });
        createFloatingText(player.x, player.y - 120, '发现药材 ' + herbData.icon + randomHerb + '!', herbData.color);
    }
    
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
    
    // ===== 装备UI v1.1.0 =====
    ctx.fillStyle = '#aaa'; ctx.font = '10px Microsoft YaHei'; ctx.textAlign = 'left';
    ctx.fillText('装备:', 20, 95);
    
    let equipX = 55;
    Object.keys(EQUIP_TYPES).forEach(equipType => {
        const equipInfo = EQUIP_TYPES[equipType];
        const equipped = player.equipment[equipType];
        
        // 装备槽背景
        ctx.fillStyle = equipped ? '#333' : '#222';
        ctx.strokeStyle = equipped ? EQUIP_COLORS[equipped.grade] : '#444';
        ctx.lineWidth = equipped ? 2 : 1;
        ctx.beginPath(); ctx.arc(equipX + 12, 92, 12, 0, Math.PI * 2); 
        ctx.fill(); ctx.stroke();
        
        // 装备图标
        ctx.fillStyle = equipped ? '#fff' : '#555';
        ctx.font = '12px Microsoft YaHei'; ctx.textAlign = 'center';
        ctx.fillText(equipped ? equipInfo.icon : '-', equipX + 12, 96);
        
        // 装备名称
        ctx.fillStyle = equipped ? EQUIP_COLORS[equipped.grade] : '#444';
        ctx.font = '8px Microsoft YaHei';
        ctx.fillText(equipped ? equipped.name.substring(0, 3) : '空', equipX + 12, 108);
        
        equipX += 35;
    });
    
    // ===== 境界突破提示 =====
    if (player.realmBreakthroughPending) {
        ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 14px Microsoft YaHei'; ctx.textAlign = 'center';
        const pulse = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillText('⚠️ 境界突破任务! 击败守护者 ⚠️', CONFIG.width / 2, 100);
        ctx.globalAlpha = 1;
    }
    
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
    
    // 防御力显示 v1.1.0
    ctx.fillStyle = '#88ff88'; ctx.font = '10px Microsoft YaHei';
    ctx.fillText('防御: ' + player.defense, 180, 95);
    
    // ===== 副本UI =====
    if (game.dungeon) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(CONFIG.width/2 - 150, 100, 300, 80);
        ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 16px Microsoft YaHei'; ctx.textAlign = 'center';
        ctx.fillText('副本: ' + game.dungeon.name, CONFIG.width/2, 125);
        ctx.fillStyle = '#fff'; ctx.font = '12px Microsoft YaHei';
        ctx.fillText('剩余怪物: ' + game.dungeonEnemiesRemaining, CONFIG.width/2, 145);
        ctx.fillText('目标: 击败' + game.dungeon.enemyCount + '只', CONFIG.width/2, 165);
    }
    
    // ===== 境界突破提示 =====
    if (player.realmBreakthroughPending) {
        ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 12px Microsoft YaHei'; ctx.textAlign = 'center';
        const pulse = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillText('境界突破任务已解锁! 按B开始突破', CONFIG.width/2, 100);
        ctx.globalAlpha = 1;
    }
    
    if (game.realmBreakthrough && game.guardian) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(CONFIG.width/2 - 120, 80, 240, 60);
        ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 14px Microsoft YaHei'; ctx.textAlign = 'center';
        ctx.fillText('境界突破中!', CONFIG.width/2, 100);
        ctx.fillStyle = '#fff'; ctx.font = '11px Microsoft YaHei';
        ctx.fillText('击败守护者!', CONFIG.width/2, 120);
    }
    
    // 闪避状态
    if (player.isDodging) {
        ctx.fillStyle = '#00ffff'; ctx.font = 'bold 16px Microsoft YaHei'; ctx.textAlign = 'center';
        ctx.fillText('闪避中!', CONFIG.width / 2, 70);
    }
    
    // ===== v1.2.0 药材背包UI =====
    ctx.fillStyle = '#aaa'; ctx.font = '10px Microsoft YaHei'; ctx.textAlign = 'left';
    ctx.fillText('药材:', 250, 95);
    
    let herbX = 290;
    Object.keys(HERBS).forEach(herbName => {
        const herb = HERBS[herbName];
        const count = player.herbInventory[herbName] || 0;
        ctx.fillStyle = count > 0 ? '#333' : '#222';
        ctx.strokeStyle = count > 0 ? herb.color : '#444';
        ctx.lineWidth = count > 0 ? 1 : 1;
        ctx.fillRect(herbX, 85, 50, 16);
        ctx.strokeRect(herbX, 85, 50, 16);
        ctx.fillStyle = count > 0 ? herb.color : '#444';
        ctx.font = '9px Microsoft YaHei';
        ctx.fillText(herb.icon + count, herbX + 3, 96);
        herbX += 55;
    });
    
    // ===== v1.2.0 灵宠UI =====
    if (player.pets.length > 0) {
        ctx.fillStyle = '#aaa'; ctx.font = '10px Microsoft YaHei';
        ctx.fillText('灵宠:', 250, 115);
        
        let petX = 290;
        player.pets.forEach((pet, index) => {
            const isActive = player.activePet === pet;
            ctx.fillStyle = isActive ? '#444' : '#333';
            ctx.strokeStyle = PET_QUALITY_COLORS[pet.quality];
            ctx.lineWidth = isActive ? 2 : 1;
            ctx.fillRect(petX, 105, 45, 16);
            ctx.strokeRect(petX, 105, 45, 16);
            ctx.fillStyle = PET_QUALITY_COLORS[pet.quality];
            ctx.font = '9px Microsoft YaHei';
            ctx.fillText(pet.icon + 'L' + pet.level, petX + 3, 116);
            petX += 50;
        });
    }
    
    // ===== v1.3.0 仙侣UI =====
    if (player.companion) {
        ctx.fillStyle = '#aaa'; ctx.font = '10px Microsoft YaHei';
        ctx.fillText('仙侣:', 250, 130);
        
        const comp = player.companion;
        ctx.fillStyle = '#333';
        ctx.strokeStyle = COMPANION_QUALITY_COLORS[comp.quality];
        ctx.lineWidth = 2;
        ctx.fillRect(290, 120, 50, 16);
        ctx.strokeRect(290, 120, 50, 16);
        ctx.fillStyle = COMPANION_QUALITY_COLORS[comp.quality];
        ctx.font = '9px Microsoft YaHei';
        ctx.fillText(comp.icon + comp.name, 293, 131);
    }
    
    // ===== v1.2.0 炼丹/灵宠/仙侣提示 =====
    ctx.fillStyle = '#888'; ctx.font = '9px Microsoft YaHei';
    ctx.fillText('D:炼丹 灵宠:C 仙侣:G 采集:E', CONFIG.width - 140, CONFIG.height - 8);
    
    // ===== v1.2.0 野生灵宠提示 =====
    if (game.wildPet) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(CONFIG.width/2 - 100, 150, 200, 60);
        ctx.fillStyle = PET_QUALITY_COLORS[game.wildPet.quality]; ctx.font = 'bold 14px Microsoft YaHei'; ctx.textAlign = 'center';
        ctx.fillText('发现野生 ' + game.wildPet.icon + game.wildPet.name + '!', CONFIG.width/2, 170);
        ctx.fillStyle = '#fff'; ctx.font = '11px Microsoft YaHei';
        ctx.fillText('按C捕捉 | 击杀后消失', CONFIG.width/2, 190);
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
    
    // v1.3.0 仙侣界面
    if (game.companionOpen) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(CONFIG.width/2 - 200, 50, 400, 350);
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(CONFIG.width/2 - 200, 50, 400, 350);
        
        ctx.fillStyle = '#ff00ff';
        ctx.font = 'bold 24px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('💕 仙侣系统', CONFIG.width/2, 85);
        
        // 当前仙侣状态
        ctx.fillStyle = '#fff';
        ctx.font = '16px Microsoft YaHei';
        ctx.textAlign = 'left';
        ctx.fillText('当前仙侣: ' + (player.companion ? player.companion.icon + player.companion.name : '未绑定'), CONFIG.width/2 - 180, 120);
        
        // 仙侣列表
        let y = 160;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('可寻找仙侣 (15级开放)', CONFIG.width/2, y);
        y += 25;
        
        Object.keys(COMPANIONS).forEach((compName, index) => {
            const comp = COMPANIONS[compName];
            const canBind = player.level >= 15;
            ctx.fillStyle = canBind ? COMPANION_QUALITY_COLORS[comp.quality] : '#666';
            ctx.font = '14px Microsoft YaHei';
            ctx.textAlign = 'left';
            ctx.fillText((index + 1) + '. ' + comp.icon + comp.name + ' (' + comp.quality + ')', CONFIG.width/2 - 180, y);
            ctx.fillText('需求: ' + comp.realmRequired + '境界', CONFIG.width/2, y);
            ctx.fillText('技能: ' + comp.skillName, CONFIG.width/2 + 80, y);
            y += 25;
        });
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('按数字键1-4绑定仙侣 | 按X解除仙侣 | 按G关闭', CONFIG.width/2, 370);
    }
    
    // v1.3.0 炼丹界面
    if (game.alchemyOpen) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(CONFIG.width/2 - 200, 50, 400, 350);
        ctx.strokeStyle = '#44ff44';
        ctx.lineWidth = 2;
        ctx.strokeRect(CONFIG.width/2 - 200, 50, 400, 350);
        
        ctx.fillStyle = '#44ff44';
        ctx.font = 'bold 24px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('⚗️ 炼丹系统', CONFIG.width/2, 85);
        
        // 当前药材
        ctx.fillStyle = '#fff';
        ctx.font = '14px Microsoft YaHei';
        ctx.textAlign = 'left';
        ctx.fillText('当前药材:', CONFIG.width/2 - 180, 120);
        
        let herbX = CONFIG.width/2 - 180;
        Object.keys(HERBS).forEach((herbName, index) => {
            const herb = HERBS[herbName];
            const count = player.herbInventory[herbName] || 0;
            ctx.fillStyle = count > 0 ? herb.color : '#666';
            ctx.fillText(herb.icon + herbName + ': ' + count, herbX, 145);
            herbX += 100;
            if ((index + 1) % 4 === 0) { herbX = CONFIG.width/2 - 180; }
        });
        
        // 丹方列表
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('丹方配方 (按数字键炼制)', CONFIG.width/2, 180);
        
        let recipeY = 210;
        Object.keys(RECIPES).forEach((recipeName, index) => {
            const recipe = RECIPES[recipeName];
            // 检查是否可炼制
            let canCraft = true;
            let missing = '';
            for (let herb in recipe.ingredients) {
                if (!player.herbInventory[herb] || player.herbInventory[herb] < recipe.ingredients[herb]) {
                    canCraft = false;
                    missing = herb;
                }
            }
            
            ctx.fillStyle = canCraft ? '#44ff44' : '#ff4444';
            ctx.font = '12px Microsoft YaHei';
            ctx.textAlign = 'left';
            ctx.fillText((index + 1) + '. ' + recipe.icon + recipeName, CONFIG.width/2 - 180, recipeY);
            
            // 显示材料需求
            let matText = '';
            for (let herb in recipe.ingredients) {
                const need = recipe.ingredients[herb];
                const have = player.herbInventory[herb] || 0;
                matText += herb + need + ' ';
            }
            ctx.fillStyle = canCraft ? '#aaa' : '#ff6666';
            ctx.fillText(matText, CONFIG.width/2 - 80, recipeY);
            
            ctx.fillStyle = canCraft ? '#00ffff' : '#666';
            ctx.textAlign = 'right';
            ctx.fillText(canCraft ? '可炼制' : '材料不足', CONFIG.width/2 + 180, recipeY);
            ctx.textAlign = 'left';
            
            recipeY += 22;
        });
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('按D关闭界面', CONFIG.width/2, 375);
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
    
    // 绘制副本入口
    if (game.dungeonEntrance && !game.dungeon) {
        const screenX = game.dungeonEntrance.x - CONFIG.cameraOffset;
        const bounce = Math.sin(Date.now() * 0.005) * 5;
        ctx.fillStyle = '#ff00ff';
        ctx.font = 'bold 20px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('🌀 副本入口', screenX, CONFIG.groundY - 60 + bounce);
        ctx.fillStyle = '#ffd700';
        ctx.font = '12px Microsoft YaHei';
        ctx.fillText('按F进入', screenX, CONFIG.groundY - 40 + bounce);
    }
    
    // 绘制副本中的进度
    if (game.dungeon) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CONFIG.width, 60);
        ctx.fillStyle = '#ff00ff';
        ctx.font = 'bold 16px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('副本: ' + game.dungeon.name + ' 剩余: ' + game.dungeonEnemiesRemaining + '只', CONFIG.width / 2, 25);
        ctx.fillStyle = '#ffd700';
        ctx.font = '12px Microsoft YaHei';
        ctx.fillText('目标: ' + game.dungeon.description, CONFIG.width / 2, 45);
    }
    
    game.expOrbs.forEach(orb => orb.draw());
    game.enemies.forEach(enemy => enemy.draw());
    game.projectiles.forEach(p => p.draw());
    player.draw();
    
    // v1.2.0 绘制野生灵宠
    if (game.wildPet) {
        const screenX = game.wildPet.x - CONFIG.cameraOffset;
        const pet = game.wildPet;
        ctx.fillStyle = PET_QUALITY_COLORS[pet.quality];
        ctx.font = '24px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText(pet.icon, screenX, CONFIG.groundY - 30);
        
        // 血条
        const hpPercent = pet.hp / pet.maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(screenX - 15, CONFIG.groundY - 50, 30, 4);
        ctx.fillStyle = hpPercent > 0.5 ? '#44ff44' : '#ff4444';
        ctx.fillRect(screenX - 15, CONFIG.groundY - 50, 30 * hpPercent, 4);
    }
    
    // v1.3.0 绘制可采集药材
    game.herbSpawns.forEach(herb => {
        const screenX = herb.x - CONFIG.cameraOffset;
        if (screenX > -50 && screenX < CONFIG.width + 50) {
            // 绘制药材
            const bounce = Math.sin(Date.now() * 0.003) * 5;
            ctx.fillStyle = herb.color;
            ctx.font = '20px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.fillText(herb.icon, screenX, CONFIG.groundY - 20 + bounce);
            
            // 显示按E提示
            const dist = Math.abs(herb.x - player.x);
            if (dist < 50) {
                ctx.fillStyle = '#ffff00';
                ctx.font = 'bold 12px Microsoft YaHei';
                ctx.fillText('按E采集', screenX, CONFIG.groundY - 45 + bounce);
            }
        }
    });
    
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
    
    // 副本进入 F (显示副本选择)
    if (e.code === 'KeyF' || e.key === 'f' || e.key === 'F') {
        if (!game.dungeon) {
            // 显示可进入的副本
            let availableDungeons = [];
            Object.keys(DUNGEONS).forEach(key => {
                if (player.level >= DUNGEONS[key].minLevel) {
                    availableDungeons.push(key);
                }
            });
            if (availableDungeons.length > 0) {
                // 简单起见，直接进入第一个可用副本
                enterDungeon(availableDungeons[0]);
            } else {
                createFloatingText(player.x, player.y - 80, '暂无可用副本', '#888');
            }
        }
    }
    
    // 境界突破 B
    if (e.code === 'KeyB' || e.key === 'b' || e.key === 'B') {
        if (player.realmBreakthroughPending && !game.realmBreakthrough) {
            player.startRealmBreakthrough();
        }
    }
    
    // v1.2.0 炼丹系统 D - 打开完整炼丹界面
    if (e.code === 'KeyD' || e.key === 'd' || e.key === 'D') {
        game.alchemyOpen = !game.alchemyOpen;
        if (game.alchemyOpen) {
            game.companionOpen = false; // 关闭其他界面
            createFloatingText(player.x, player.y - 80, '炼丹界面已打开', '#44ff44');
        } else {
            createFloatingText(player.x, player.y - 80, '炼丹界面已关闭', '#aaaaaa');
        }
    }
    
    // v1.3.0 药材采集 E
    if (e.code === 'KeyE' || e.key === 'e' || e.key === 'E') {
        // 检查附近是否有可采集的药材
        let nearestHerb = null;
        let nearestDist = 50;
        game.herbSpawns.forEach((herb, index) => {
            const dist = Math.abs(herb.x - player.x);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestHerb = index;
            }
        });
        
        if (nearestHerb !== null) {
            const herb = game.herbSpawns[nearestHerb];
            player.herbInventory[herb.name] = (player.herbInventory[herb.name] || 0) + 1;
            game.herbSpawns.splice(nearestHerb, 1);
            createFloatingText(player.x, player.y - 80, '采集 ' + herb.icon + herb.name + '!', herb.color);
            createParticle(player.x, player.y - 30, herb.color, 15);
        } else {
            createFloatingText(player.x, player.y - 80, '附近没有药材', '#888');
        }
    }
    
    // v1.3.0 仙侣系统 G
    if (e.code === 'KeyG' || e.key === 'g' || e.key === 'G') {
        if (player.level < 15) {
            createFloatingText(player.x, this.y - 80, '15级后才能寻找仙侣', '#ff8800');
        } else {
            game.companionOpen = !game.companionOpen;
            if (game.companionOpen) {
                game.alchemyOpen = false; // 关闭其他界面
                createFloatingText(player.x, player.y - 80, '仙侣界面已打开', '#ff00ff');
            } else {
                createFloatingText(player.x, player.y - 80, '仙侣界面已关闭', '#aaaaaa');
            }
        }
    }
    
    // v1.3.0 仙侣界面内操作
    if (game.companionOpen) {
        // 数字键1-4绑定仙侣
        if (e.code === 'Digit1' || e.key === '1') {
            player.bindCompanion('素女');
        } else if (e.code === 'Digit2' || e.key === '2') {
            player.bindCompanion('剑仙');
        } else if (e.code === 'Digit3' || e.key === '3') {
            player.bindCompanion('琴姬');
        } else if (e.code === 'Digit4' || e.key === '4') {
            player.bindCompanion('散人');
        } else if (e.code === 'KeyX' || e.key === 'x' || e.key === 'X') {
            player.unbindCompanion();
        }
    }
    
    // v1.3.0 炼丹界面内操作
    if (game.alchemyOpen) {
        // 数字键1-5炼制丹药
        const recipeKeys = Object.keys(RECIPES);
        if (e.code === 'Digit1' || e.key === '1') {
            player.usePotion(recipeKeys[0]);
        } else if (e.code === 'Digit2' || e.key === '2') {
            player.usePotion(recipeKeys[1]);
        } else if (e.code === 'Digit3' || e.key === '3') {
            player.usePotion(recipeKeys[2]);
        } else if (e.code === 'Digit4' || e.key === '4') {
            player.usePotion(recipeKeys[3]);
        } else if (e.code === 'Digit5' || e.key === '5') {
            player.usePotion(recipeKeys[4]);
        }
    }
    
    // v1.2.0 灵宠系统 C
    if (e.code === 'KeyC' || e.key === 'c' || e.key === 'C') {
        if (game.wildPet) {
            // 捕捉灵宠
            player.catchPet(game.wildPet.name);
            game.wildPet = null;
        } else if (player.pets.length > 0) {
            // 切换灵宠装备
            player.equipPet(0);
        } else {
            createFloatingText(player.x, player.y - 80, '没有灵宠', '#888');
        }
    }
});

window.onload = startGame;