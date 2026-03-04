const game = {
    running: true, gameOver: false, cameraX: 0, lastTime: 0,
    enemies: [], expOrbs: [], particles: [], projectiles: [],
    spawnTimer: 0, spawnInterval: 5000, groundY: CONFIG.groundY, distance: 0,
    clouds: [], stars: [], grass: [], killCount: 0, comboCount: 0, comboTimer: 0,
    comboRewards: { 3: 10, 5: 25, 10: 50 },
    screenShake: 0, screenShakeIntensity: 0,
    slowMotion: 0,
    // v1.5.0 战斗状态机
    battleState: BATTLE_STATES.ADVANCE,
    previousBattleState: BATTLE_STATES.ADVANCE,
    enemyDetectionRange: 250,  // 遇怪检测范围
    battleTransitionTimer: 0,  // 战斗状态切换过渡计时器
    isTransitioning: false,    // 是否在过渡中
    battleSceneTransition: 0,  // 场景切换过渡动画
    // v1.5.0 战斗节奏
    attackInterval: 1.2,       // 攻击间隔1.2秒
    monsterWaveCount: 3,       // 每波3只
    monsterWaveInterval: 5,   // 波次间隔5秒
    waveTimer: 0,
    monstersThisWave: 0,
    battleDuration: 0,         // 战斗持续时间
    maxBattleDuration: 180,   // 最长3分钟
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
    companionOpen: false, companion: null, companionSkillTimer: 0,
    // v1.4.0 宗门系统
    sectionOpen: false, section: null, sectionContrib: 0, sectionTasks: {},
    // v1.4.0 坐骑系统
    mountOpen: false, mount: null, mountLevel: 1, isMounted: false,
    // v1.4.0 符文系统
    runeOpen: false, runes: [], equippedRunes: [null, null, null, null, null, null],
    // v1.4.0 连携系统
    comboSkillActive: false, comboSkillTimer: 0,
    // v1.7.0 技能系统
    skillPoints: 0,  // 技能点
    gold: 0,  // 金币
    goldCoins: [],  // v1.8.0 金币列表
    lootNotifications: [],  // 掉落提示
    eliteMonsters: []  // 精英怪列表
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

