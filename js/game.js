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
function playSound(type) {
    AudioSystem.play(type);
}