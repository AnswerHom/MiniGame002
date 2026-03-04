// MiniGame002 - 游戏主逻辑 v1.11.0
// 代码结构重构：配置数据移至 config.js

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
function createFloatingText(x, y, text, color) { game.particles.push(new FloatingText(x, y, text, color)); }

function spawnEnemy() {
    // 副本中不生成普通怪物
    if (game.dungeon) return;
    
    // v1.6.1 简化版：在玩家前方生成怪物
    const spawnX = player.x + 150 + Math.random() * 200;
    
    // v1.10.1 怪物形态系统 - 根据等级解锁不同形态
    const availableTypes = [];
    // 鬼魂类
    if (player.level >= 1) availableTypes.push('游魂');
    if (player.level >= 3) availableTypes.push('恶灵');
    if (player.level >= 8) availableTypes.push('厉鬼');
    // 兽类
    if (player.level >= 5) { availableTypes.push('苍狼'); availableTypes.push('阴魂'); } // 保留原版
    if (player.level >= 10) availableTypes.push('猛虎');
    if (player.level >= 12) availableTypes.push('獠牙猪');
    // 虫类
    if (player.level >= 10) { availableTypes.push('毒蛛'); availableTypes.push('妖狼'); } // 保留原版
    if (player.level >= 12) availableTypes.push('蜈蚣');
    if (player.level >= 15) availableTypes.push('蝎子');
    // 尸类
    if (player.level >= 15) { availableTypes.push('僵尸'); availableTypes.push('毒蛛'); } // 保留原版
    if (player.level >= 18) availableTypes.push('跳尸');
    if (player.level >= 20) availableTypes.push('铜甲尸');
    
    // v1.7.0 精英怪生成 (15%几率)
    let type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    if (Math.random() < 0.15) {
        type = '精英' + (['阴魂', '妖狼', '毒蛛', '僵尸'][Math.floor(Math.random() * 4)]);
    }
    
    const enemy = new Enemy(spawnX, type);
    // v1.7.0 标记精英怪
    enemy.elite = ENEMY_TYPES[type] && ENEMY_TYPES[type].elite;
    // v1.10.1 记录形态信息
    const config = ENEMY_TYPES[type];
    enemy.form = config.form || null;
    enemy.formDetail = config.formDetail || type;
    
    game.enemies.push(enemy);
    
    // 每1000米生成副本入口
    const newDistance = Math.floor((player.x - 100) / 10);
    if (newDistance > 0 && newDistance % 1000 === 0 && !game.dungeonEntrance) {
        game.dungeonEntrance = { x: player.x + 500, unlocked: false };
    }
}

// v1.6.1 简化版战斗逻辑：主角正常前进，遇怪直接战斗
function updateBattleState(dt) {
    // 副本中不处理
    if (game.dungeon) return;
    
    // 简单逻辑：检测前方是否有怪物
    const nearbyEnemy = game.enemies.find(enemy => 
        enemy.alive && Math.abs(enemy.x - player.x) < 300
    );
    
    // 更新 game 对象中的是否在战斗状态（供其他模块使用）
    game.isFighting = !!nearbyEnemy;
}

// 装备掉落
function tryDropEquipment(enemy) {
    let dropChance = 0.1; // 10%基础掉落
    let quality = '凡品';
    
    // v1.7.0 精英怪必掉装备且高品质
    if (enemy.elite) {
        dropChance = 1;
        const rand = Math.random();
        if (rand < 0.6) quality = '精品';
        else if (rand < 0.9) quality = '极品';
        else quality = '仙品';
    } else if (enemy.type === '阴魂' && Math.random() < 0.3) {
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
        
        // v1.7.0 掉落提示
        const notifyColor = quality === '仙品' ? '#ff00ff' : (quality === '极品' ? '#0088ff' : q.color);
        createFloatingText(enemy.x, enemy.y - enemy.height - 30, '🎁 获得' + item.name + '!', notifyColor);
        
        // v1.7.0 仙品装备专属动画
        if (quality === '仙品' || quality === '极品') {
            for (let i = 0; i < 20; i++) {
                createParticle(enemy.x + enemy.width/2, enemy.y - enemy.height/2, notifyColor, 6);
            }
            game.screenShake = 0.1; game.screenShakeIntensity = 3;
        } else {
            createParticle(enemy.x, enemy.y - enemy.height/2, q.color, 15);
        }
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
    
    // v1.5.0 战斗状态机更新
    updateBattleState(dt);
    
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
    // v1.6.1 简化战斗：持续生成怪物，但限制数量
    const aliveEnemies = game.enemies.filter(e => e.alive);
    if (aliveEnemies.length < 5) {
        game.spawnTimer += actualDt * 1000;
        if (game.spawnTimer >= game.spawnInterval) { 
            spawnEnemy(); 
            game.spawnTimer = 0; 
        }
    }
    game.enemies.forEach(enemy => enemy.update(actualDt));
    game.enemies.forEach(enemy => { if (!enemy.alive) return; const dist = Math.abs((player.x + player.width/2) - (enemy.x + enemy.width/2)); if (dist < player.attackRange) player.attackTarget(enemy); });
    game.enemies = game.enemies.filter(e => e.alive);
    game.expOrbs.forEach(orb => orb.update(actualDt)); game.expOrbs = game.expOrbs.filter(orb => !orb.collected);
    // v1.8.0 金币自动拾取
    game.goldCoins.forEach(coin => coin.update(actualDt)); game.goldCoins = game.goldCoins.filter(coin => !coin.collected);
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
    
    // v1.5.0 战斗场景分离 - 战斗状态时背景变暗红
    let bgColors = scene.bgColor;
    if (game.battleState === BATTLE_STATES.COMBAT) {
        bgColors = ['#2a0a0a', '#3d1a1a', '#2a1515'];
    }
    
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
    gradient.addColorStop(0, bgColors[0]); gradient.addColorStop(0.5, bgColors[1]); gradient.addColorStop(1, bgColors[2]);
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    // v1.5.0 战斗场景切换过渡效果
    if (game.battleSceneTransition > 0) {
        ctx.fillStyle = `rgba(255, 100, 0, ${game.battleSceneTransition * 0.3})`;
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    }
    
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
    
    // v1.5.0 战斗状态显示
    if (game.battleState === BATTLE_STATES.COMBAT) {
        ctx.fillStyle = '#ff6600'; ctx.font = 'bold 12px Microsoft YaHei'; ctx.textAlign = 'right';
        ctx.fillText('⚔️ 战斗中', CONFIG.width - 20, 56);
        
        // 战斗时长
        const battleTime = Math.floor(game.battleDuration);
        ctx.fillStyle = '#ff8800'; ctx.font = '10px Microsoft YaHei';
        ctx.fillText('⏱️ ' + battleTime + 's', CONFIG.width - 20, 68);
    } else if (game.battleState === BATTLE_STATES.VICTORY) {
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 12px Microsoft YaHei'; ctx.textAlign = 'right';
        ctx.fillText('🎉 胜利', CONFIG.width - 20, 56);
    } else if (game.previousBattleState === BATTLE_STATES.COMBAT && game.isTransitioning) {
        ctx.fillStyle = '#00ff00'; ctx.font = 'bold 11px Microsoft YaHei'; ctx.textAlign = 'right';
        ctx.fillText('→ 推进中', CONFIG.width - 20, 56);
    }
    
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
    
    // v1.7.0 主动技能UI (左侧底部)
    let activeSkillX = 200;
    Object.keys(player.activeSkills).forEach(slot => {
        const skill = player.activeSkills[slot];
        const skillData = ACTIVE_SKILLS[skill.name];
        
        // 技能槽背景
        ctx.fillStyle = skill.unlocked ? (skill.cooldownTimer > 0 ? '#444' : '#222') : '#111';
        ctx.strokeStyle = skill.unlocked ? '#00ff00' : '#444';
        ctx.lineWidth = skill.unlocked ? 2 : 1;
        ctx.beginPath(); ctx.arc(activeSkillX + 18, CONFIG.height - 35, 18, 0, Math.PI * 2); 
        ctx.fill(); ctx.stroke();
        
        if (skill.unlocked) {
            // 技能图标
            ctx.fillStyle = '#fff'; ctx.font = '16px Microsoft YaHei'; ctx.textAlign = 'center';
            ctx.fillText(skillData.icon, activeSkillX + 18, CONFIG.height - 30);
            
            // 冷却遮罩
            if (skill.cooldownTimer > 0) {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.beginPath(); ctx.arc(activeSkillX + 18, CONFIG.height - 35, 18, -Math.PI/2, -Math.PI/2 + (skill.cooldownTimer / skillData.cooldown) * Math.PI * 2); ctx.fill();
            }
            
            // 技能等级
            ctx.fillStyle = '#ffd700'; ctx.font = 'bold 10px Microsoft YaHei';
            ctx.fillText('Lv.' + skill.level, activeSkillX + 18, CONFIG.height - 12);
        } else {
            // 未解锁显示问号和需求等级
            ctx.fillStyle = '#444'; ctx.font = 'bold 14px Microsoft YaHei'; ctx.textAlign = 'center';
            ctx.fillText('?', activeSkillX + 18, CONFIG.height - 30);
            ctx.fillStyle = '#666'; ctx.font = '9px Microsoft YaHei';
            ctx.fillText('L.' + skillData.unlockLevel, activeSkillX + 18, CONFIG.height - 12);
        }
        
        // 快捷键提示
        ctx.fillStyle = skill.unlocked ? '#00ffff' : '#444';
        ctx.font = 'bold 9px Microsoft YaHei';
        ctx.fillText(slot, activeSkillX + 18, CONFIG.height - 52);
        
        activeSkillX += 45;
    });
    
    // v1.7.0 技能点显示
    ctx.fillStyle = '#00ffff'; ctx.font = 'bold 11px Microsoft YaHei'; ctx.textAlign = 'left';
    ctx.fillText('💎 技能点: ' + game.skillPoints, 20, 70);
    
    // v1.7.0 金币显示
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px Microsoft YaHei';
    ctx.fillText('💰 金币: ' + game.gold, 120, 70);
    
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
    
    // ===== v1.4.0 宗门UI =====
    if (player.section) {
        ctx.fillStyle = '#aaa'; ctx.font = '10px Microsoft YaHei';
        ctx.fillText('宗门:', 250, 145);
        
        const sect = player.section;
        ctx.fillStyle = '#333';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.fillRect(290, 135, 60, 16);
        ctx.strokeRect(290, 135, 60, 16);
        ctx.fillStyle = '#ffd700';
        ctx.font = '9px Microsoft YaHei';
        ctx.fillText(sect.icon + sect.name, 293, 146);
        
        // 宗门贡献
        ctx.fillStyle = '#aaa'; ctx.font = '9px Microsoft YaHei';
        ctx.fillText('贡:' + player.sectionContrib, 355, 146);
    }
    
    // ===== v1.4.0 坐骑UI =====
    if (player.mount) {
        ctx.fillStyle = '#aaa'; ctx.font = '10px Microsoft YaHei';
        ctx.fillText('坐骑:', 420, 130);
        
        const mount = player.mount;
        ctx.fillStyle = '#333';
        ctx.strokeStyle = MOUNT_QUALITY_COLORS[mount.quality];
        ctx.lineWidth = 2;
        ctx.fillRect(460, 120, 50, 16);
        ctx.strokeRect(460, 120, 50, 16);
        ctx.fillStyle = MOUNT_QUALITY_COLORS[mount.quality];
        ctx.font = '9px Microsoft YaHei';
        ctx.fillText(mount.icon + mount.name, 463, 131);
    }
    
    // ===== v1.4.0 符文UI =====
    let runeX = 420;
    let hasRunes = false;
    game.equippedRunes.forEach((rune, index) => {
        if (rune) {
            hasRunes = true;
            const runeData = RUNES[rune.name];
            ctx.fillStyle = '#333';
            ctx.strokeStyle = RUNE_QUALITY_COLORS[runeData.quality];
            ctx.lineWidth = 1;
            ctx.fillRect(runeX, 145, 25, 14);
            ctx.strokeRect(runeX, 145, 25, 14);
            ctx.fillStyle = RUNE_QUALITY_COLORS[runeData.quality];
            ctx.font = '8px Microsoft YaHei';
            ctx.fillText(runeData.icon, runeX + 2, 155);
        }
        runeX += 28;
    });
    if (hasRunes) {
        ctx.fillStyle = '#aaa'; ctx.font = '9px Microsoft YaHei';
        ctx.fillText('符文:', 420, 143);
    }
    
    // ===== v1.2.0 炼丹/灵宠/仙侣提示 =====
    ctx.fillStyle = '#888'; ctx.font = '9px Microsoft YaHei';
    ctx.fillText('D:炼丹 灵宠:C 仙侣:G 采集:E 宗门:J 坐骑:K 符文:R', CONFIG.width - 180, CONFIG.height - 8);
    
    // ===== v1.2.0 野生灵宠提示 =====
    if (game.wildPet) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(CONFIG.width/2 - 100, 150, 200, 60);
        ctx.fillStyle = PET_QUALITY_COLORS[game.wildPet.quality]; ctx.font = 'bold 14px Microsoft YaHei'; ctx.textAlign = 'center';
        ctx.fillText('发现野生 ' + game.wildPet.icon + game.wildPet.name + '!', CONFIG.width/2, 170);
        ctx.fillStyle = '#fff'; ctx.font = '11px Microsoft YaHei';
        ctx.fillText('按C捕捉 | 击杀后消失', CONFIG.width/2, 190);
    }
    
    // v1.4.0 宗门界面
    if (game.sectionOpen) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(CONFIG.width/2 - 200, 50, 400, 350);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(CONFIG.width/2 - 200, 50, 400, 350);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 24px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('🏛️ 宗门系统', CONFIG.width/2, 85);
        
        // 当前宗门状态
        ctx.fillStyle = '#fff';
        ctx.font = '14px Microsoft YaHei';
        ctx.textAlign = 'left';
        ctx.fillText('当前宗门: ' + (player.section ? player.section.icon + player.section.name : '未加入'), CONFIG.width/2 - 180, 120);
        if (player.section) {
            ctx.fillText('贡献值: ' + player.sectionContrib, CONFIG.width/2 - 180, 145);
        }
        
        // 宗门任务
        if (player.section && game.sectionTasks) {
            ctx.fillStyle = '#ff8800';
            ctx.font = 'bold 14px Microsoft YaHei';
            ctx.fillText('宗门任务:', CONFIG.width/2 - 180, 180);
            
            let taskY = 205;
            Object.keys(game.sectionTasks).forEach(taskKey => {
                const task = game.sectionTasks[taskKey];
                ctx.fillStyle = '#fff';
                ctx.font = '12px Microsoft YaHei';
                ctx.fillText(task.icon + task.name + ': ' + task.progress + '/' + task.target + ' (奖励:' + task.reward + ')', CONFIG.width/2 - 180, taskY);
                taskY += 22;
            });
        }
        
        // 宗门列表
        let y = player.section ? 280 : 160;
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('可加入宗门 (20级开放)', CONFIG.width/2, y);
        y += 25;
        
        Object.keys(SECTIONS).forEach((sectName, index) => {
            const sect = SECTIONS[sectName];
            const canJoin = player.level >= 20;
            ctx.fillStyle = canJoin ? '#ffd700' : '#666';
            ctx.font = '12px Microsoft YaHei';
            ctx.textAlign = 'left';
            ctx.fillText((index + 1) + '. ' + sect.icon + sectName + ' (' + sect.quality + ')', CONFIG.width/2 - 180, y);
            ctx.fillText(sect.description, CONFIG.width/2, y);
            y += 20;
        });
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('按数字键1-4加入宗门 | 按X离开宗门 | 按J关闭', CONFIG.width/2, 370);
    }
    
    // v1.4.0 坐骑界面
    if (game.mountOpen) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(CONFIG.width/2 - 200, 50, 400, 350);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(CONFIG.width/2 - 200, 50, 400, 350);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 24px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('🦌 坐骑系统', CONFIG.width/2, 85);
        
        // 当前坐骑状态
        ctx.fillStyle = '#fff';
        ctx.font = '14px Microsoft YaHei';
        ctx.textAlign = 'left';
        ctx.fillText('当前坐骑: ' + (player.mount ? player.mount.icon + player.mount.name : '未装备'), CONFIG.width/2 - 180, 120);
        if (player.mount) {
            const mountData = MOUNTS[player.mount.name];
            ctx.fillText('速度加成: +' + Math.floor(mountData.speedBonus * 100) + '%', CONFIG.width/2 - 180, 145);
            if (mountData.attackBonus > 0) {
                ctx.fillText('攻击加成: +' + (typeof mountData.attackBonus === 'number' ? mountData.attackBonus : Math.floor(mountData.attackBonus * 100) + '%'), CONFIG.width/2 - 180, 170);
            }
        }
        
        // 坐骑列表
        let y = 210;
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('可解锁坐骑 (25级开放)', CONFIG.width/2, y);
        y += 25;
        
        Object.keys(MOUNTS).forEach((mountName, index) => {
            const mount = MOUNTS[mountName];
            const canUnlock = player.level >= mount.unlockLevel;
            ctx.fillStyle = canUnlock ? MOUNT_QUALITY_COLORS[mount.quality] : '#666';
            ctx.font = '12px Microsoft YaHei';
            ctx.textAlign = 'left';
            ctx.fillText((index + 1) + '. ' + mount.icon + mountName + ' (' + mount.quality + ')', CONFIG.width/2 - 180, y);
            ctx.fillText('Lv.' + mount.unlockLevel + ' 速+' + Math.floor(mount.speedBonus * 100) + '%', CONFIG.width/2, y);
            y += 20;
        });
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('按数字键1-4装备坐骑 | 按X下骑 | 按K关闭', CONFIG.width/2, 370);
    }
    
    // v1.4.0 符文界面
    if (game.runeOpen) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(CONFIG.width/2 - 200, 50, 400, 350);
        ctx.strokeStyle = '#0088ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(CONFIG.width/2 - 200, 50, 400, 350);
        
        ctx.fillStyle = '#0088ff';
        ctx.font = 'bold 24px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('🔮 符文系统', CONFIG.width/2, 85);
        
        // 符文槽
        ctx.fillStyle = '#fff';
        ctx.font = '14px Microsoft YaHei';
        ctx.textAlign = 'left';
        ctx.fillText('符文槽:', CONFIG.width/2 - 180, 120);
        
        let slotX = CONFIG.width/2 - 180;
        game.equippedRunes.forEach((rune, index) => {
            if (rune) {
                const runeData = RUNES[rune.name];
                ctx.fillStyle = RUNE_QUALITY_COLORS[runeData.quality];
                ctx.fillRect(slotX, 130, 50, 20);
                ctx.fillStyle = '#000';
                ctx.font = '10px Microsoft YaHei';
                ctx.fillText(runeData.icon + rune.name.substring(0, 3), slotX + 2, 144);
            } else {
                ctx.fillStyle = '#333';
                ctx.strokeStyle = '#555';
                ctx.strokeRect(slotX, 130, 50, 20);
                ctx.fillStyle = '#555';
                ctx.font = '10px Microsoft YaHei';
                ctx.fillText('空槽', slotX + 10, 144);
            }
            slotX += 55;
        });
        
        // 符文背包
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('符文背包 (击杀BOSS获得)', CONFIG.width/2, 175);
        
        let runeY = 200;
        if (player.runeInventory.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '12px Microsoft YaHei';
            ctx.fillText('暂无符文', CONFIG.width/2, runeY);
        } else {
            player.runeInventory.forEach((rune, index) => {
                const runeData = RUNES[rune.name];
                ctx.fillStyle = RUNE_QUALITY_COLORS[runeData.quality];
                ctx.font = '11px Microsoft YaHei';
                ctx.textAlign = 'left';
                ctx.fillText((index + 1) + '. ' + runeData.icon + rune.name + ' +' + Math.floor(runeData.statValue * 100) + '%', CONFIG.width/2 - 180, runeY);
                runeY += 18;
            });
        }
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('按数字键1-6装备符文到槽位 | 按X卸下符文 | 按R关闭', CONFIG.width/2, 370);
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
    // v1.8.0 绘制金币
    game.goldCoins.forEach(coin => coin.draw());
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

// ===== v1.4.0 连携系统：检查是否触发连携技 =====
function checkComboSkill() {
    const combo = game.comboCount;
    let comboSkill = null;
    
    if (combo >= 20) comboSkill = COMBO_SKILLS[20];
    else if (combo >= 10) comboSkill = COMBO_SKILLS[10];
    else if (combo >= 5) comboSkill = COMBO_SKILLS[5];
    
    if (comboSkill) {
        game.comboSkillActive = true;
        game.comboSkillTimer = 1.0;
        
        // 对范围内所有敌人造成额外伤害
        game.enemies.forEach(enemy => {
            if (enemy.alive && Math.abs(enemy.x - player.x) < 300) {
                const extraDamage = player.attack * comboSkill.damageMult;
                enemy.takeDamage(extraDamage);
                createFloatingText(enemy.x, enemy.y - 50, comboSkill.text, comboSkill.color);
            }
        });
        
        // 屏幕特效
        game.screenShake = 0.3;
        game.screenShakeIntensity = 5;
    }
}

// ===== v1.4.0 符文系统：尝试掉落符文 =====
function tryDropRune(enemy) {
    const runeKeys = Object.keys(RUNES);
    // BOSS必掉传说/稀有符文，普通怪掉普通符文
    const isBoss = enemy.isBoss;
    
    let runeName;
    if (isBoss) {
        const bossRunes = ['暴击符文', '生命符文', '神圣符文'];
        runeName = bossRunes[Math.floor(Math.random() * bossRunes.length)];
    } else {
        runeName = runeKeys[Math.floor(Math.random() * 3)]; // 前3个是普通符文
    }
    
    const runeData = RUNES[runeName];
    player.runeInventory.push({ name: runeName, icon: runeData.icon, quality: runeData.quality, stat: runeData.stat, statValue: runeData.statValue });
    
    createFloatingText(enemy.x, enemy.y - 60, '符文!' + runeData.icon + runeName, RUNE_QUALITY_COLORS[runeData.quality]);
    createParticle(enemy.x, enemy.y - 30, RUNE_QUALITY_COLORS[runeData.quality], 15);
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
    
    // v1.7.0 主动技能 1/2/3/4
    if (e.code === 'Digit1' || e.key === '1') {
        player.useActiveSkill(1);
    } else if (e.code === 'Digit2' || e.key === '2') {
        player.useActiveSkill(2);
    } else if (e.code === 'Digit3' || e.key === '3') {
        player.useActiveSkill(3);
    } else if (e.code === 'Digit4' || e.key === '4') {
        player.useActiveSkill(4);
    }
    
    // 兵器切换 4/5/6
    if (e.code === 'Digit4' || e.key === '4') {
        player.switchWeapon('剑');
    } else if (e.code === 'Digit5' || e.key === '5') {
        player.switchWeapon('刀');
    } else if (e.code === 'Digit6' || e.key === '6') {
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
    
    // v1.4.0 宗门系统 J
    if (e.code === 'KeyJ' || e.key === 'j' || e.key === 'J') {
        if (player.level < 20) {
            createFloatingText(player.x, player.y - 80, '20级后才能加入宗门', '#ff8800');
        } else {
            game.sectionOpen = !game.sectionOpen;
            if (game.sectionOpen) {
                game.companionOpen = false;
                game.alchemyOpen = false;
                game.mountOpen = false;
                game.runeOpen = false;
                createFloatingText(player.x, player.y - 80, '宗门界面已打开', '#ffd700');
            } else {
                createFloatingText(player.x, player.y - 80, '宗门界面已关闭', '#aaaaaa');
            }
        }
    }
    
    // v1.4.0 坐骑系统 K
    if (e.code === 'KeyK' || e.key === 'k' || e.key === 'K') {
        if (player.level < 25) {
            createFloatingText(player.x, player.y - 80, '25级后才能解锁坐骑', '#ff8800');
        } else {
            game.mountOpen = !game.mountOpen;
            if (game.mountOpen) {
                game.companionOpen = false;
                game.alchemyOpen = false;
                game.sectionOpen = false;
                game.runeOpen = false;
                createFloatingText(player.x, player.y - 80, '坐骑界面已打开', '#00ff00');
            } else {
                createFloatingText(player.x, player.y - 80, '坐骑界面已关闭', '#aaaaaa');
            }
        }
    }
    
    // v1.4.0 符文系统 R
    if (e.code === 'KeyR' || e.key === 'r' || e.key === 'R') {
        game.runeOpen = !game.runeOpen;
        if (game.runeOpen) {
            game.companionOpen = false;
            game.alchemyOpen = false;
            game.sectionOpen = false;
            game.mountOpen = false;
            createFloatingText(player.x, player.y - 80, '符文界面已打开', '#0088ff');
        } else {
            createFloatingText(player.x, player.y - 80, '符文界面已关闭', '#aaaaaa');
        }
    }
    
    // v1.4.0 宗门界面操作
    if (game.sectionOpen) {
        if (e.code === 'Digit1' || e.key === '1') {
            player.joinSection('青云宗');
        } else if (e.code === 'Digit2' || e.key === '2') {
            player.joinSection('玄冰宫');
        } else if (e.code === 'Digit3' || e.key === '3') {
            player.joinSection('天机阁');
        } else if (e.code === 'Digit4' || e.key === '4') {
            player.joinSection('万兽山');
        } else if (e.code === 'KeyX' || e.key === 'x' || e.key === 'X') {
            player.leaveSection();
        }
    }
    
    // v1.4.0 坐骑界面操作
    if (game.mountOpen) {
        if (e.code === 'Digit1' || e.key === '1') {
            player.equipMount('灵鹿');
        } else if (e.code === 'Digit2' || e.key === '2') {
            player.equipMount('云鹤');
        } else if (e.code === 'Digit3' || e.key === '3') {
            player.equipMount('麒麟');
        } else if (e.code === 'Digit4' || e.key === '4') {
            player.equipMount('鲲鹏');
        } else if (e.code === 'KeyX' || e.key === 'x' || e.key === 'X') {
            player.unequipMount();
        }
    }
    
    // v1.4.0 符文界面操作
    if (game.runeOpen) {
        // 数字键1-6装备符文到槽位
        const runeKeys = Object.keys(RUNES);
        for (let i = 0; i < 6 && i < runeKeys.length; i++) {
            if ((e.code === 'Digit' + (i + 1) || e.key === String(i + 1))) {
                player.equipRune(runeKeys[i], i);
                break;
            }
        }
        // X键卸下符文
        if (e.code === 'KeyX' || e.key === 'x' || e.key === 'X') {
            // 默认卸下第一个有符文的槽位
            for (let i = 0; i < game.equippedRunes.length; i++) {
                if (game.equippedRunes[i]) {
                    player.unequipRune(i);
                    break;
                }
            }
        }
    }
});

window.onload = startGame;

// ===== v1.8.0 音效系统 =====
const AudioSystem = {
    context: null,
    
    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    },
    
    play(type) {
        if (!this.context) return;
        
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        
        const now = this.context.currentTime;
        
        if (type === 'hit') {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            osc.connect(gain);
            gain.connect(this.context.destination);
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            
        } else if (type === 'combo') {
            const baseFreq = 300 + (game.comboCount || 0) * 20;
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.context.destination);
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
            
        } else if (type === 'coin') {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.context.destination);
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.setValueAtTime(1600, now + 0.05);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            
        } else if (type === 'skill') {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            osc.type = 'triangle';
            osc.connect(gain);
            gain.connect(this.context.destination);
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
            
        } else if (type === 'levelup') {
            const osc1 = this.context.createOscillator();
            const osc2 = this.context.createOscillator();
            const gain = this.context.createGain();
            osc1.type = 'sine';
            osc2.type = 'sine';
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.context.destination);
            osc1.frequency.setValueAtTime(523, now);
            osc1.frequency.setValueAtTime(659, now + 0.1);
            osc1.frequency.setValueAtTime(784, now + 0.2);
            osc2.frequency.setValueAtTime(523, now);
            osc2.frequency.setValueAtTime(659, now + 0.1);
            osc2.frequency.setValueAtTime(784, now + 0.2);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.3);
            osc2.stop(now + 0.3);
        }
    }
};

AudioSystem.init();

function playSound(type) {
    AudioSystem.play(type);
}