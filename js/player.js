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
    // v1.4.0 宗门系统
    section: null, sectionContrib: 0,
    // v1.4.0 坐骑系统
    mount: null, mountLevel: 1,
    // v1.4.0 符文系统
    runeInventory: [],
    // v1.7.0 技能系统 - 主动技能槽 4个（对应数字键1/2/3/4）
    activeSkills: {
        1: { name: '御剑术', unlocked: false, cooldownTimer: 0, level: 0 },
        2: { name: '剑气斩', unlocked: false, cooldownTimer: 0, level: 0 },
        3: { name: '护体光环', unlocked: false, cooldownTimer: 0, level: 0 },
        4: { name: '疾风步', unlocked: false, cooldownTimer: 0, level: 0 }
    },
    skillPoints: 0,  // 技能点
    // v1.7.0 疾风步状态
    isDashing: false, dashTimer: 0, dashSpeedBonus: 0,
    // v1.7.0 护体光环反伤
    shieldReflecting: false,
    
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
        // v1.6.1 修复：从武器配置中获取攻击范围
        this.attackRange = w.range;
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
        // v1.4.0 坐骑攻击加成
        if (this.mount) {
            if (typeof this.mount.attackBonus === 'number') {
                attack += this.mount.attackBonus;
            } else {
                attack *= (1 + this.mount.attackBonus);
            }
        }
        // v1.4.0 符文攻击加成
        attack *= (1 + this.getRuneBonus('attack'));
        
        // v1.4.0 宗门攻击加成
        if (this.section && this.section.bonus === 'attack') {
            attack = Math.floor(attack * (1 + this.section.bonusValue));
        }
        
        this.attack = Math.floor(attack);
        
        // 防御力
        this.defense = this.getDefense();
        
        // v1.2.0 灵宠防御加成
        if (this.activePet) {
            this.defense += this.activePet.defense * this.activePet.level;
        }
        
        // v1.4.0 宗门防御加成 + 符文防御加成
        if (this.section && this.section.bonus === 'defense') {
            this.defense = Math.floor(this.defense * (1 + this.section.bonusValue));
        }
        this.defense = Math.floor(this.defense * (1 + this.getRuneBonus('defense')));
        
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
        // v1.4.0 符文生命加成
        maxHp *= (1 + this.getRuneBonus('maxHp'));
        this.maxHp = Math.floor(maxHp);
        
        // v1.2.0 灵宠速度加成
        let speed = 150;
        if (this.activePet) {
            speed += this.activePet.speed * this.activePet.level;
        }
        // v1.4.0 坐骑速度加成
        if (this.mount) {
            speed *= (1 + this.mount.speedBonus);
        }
        // v1.4.0 符文速度加成
        speed *= (1 + this.getRuneBonus('speed'));
        this.speed = Math.floor(speed);
        
        // v1.4.0 符文暴击率加成
        let critRate = 0.05;
        critRate += this.getRuneBonus('critRate');
        this.critRate = critRate;
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
        // v1.8.0 升级音效
        playSound('levelup');
        
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
    
    // v1.4.0 宗门系统：加入宗门
    joinSection(sectionName) {
        if (this.level < 20) {
            createFloatingText(this.x, this.y - 80, '20级后才能加入宗门', '#ff8800');
            return false;
        }
        const sectionData = SECTIONS[sectionName];
        if (!sectionData) return false;
        
        this.section = { name: sectionName, icon: sectionData.icon, bonus: sectionData.bonus, bonusValue: sectionData.bonusValue };
        this.sectionContrib = 0;
        
        // 初始化宗门任务
        game.sectionTasks = {
            '击杀怪物': { name: '击杀怪物', target: 10, progress: 0, reward: 50, icon: '⚔️' },
            '采集药材': { name: '采集药材', target: 5, progress: 0, reward: 30, icon: '🌿' }
        };
        
        this.recalcStats();
        createFloatingText(this.x, this.y - 100, '加入 ' + sectionData.icon + sectionName + '!', '#ffd700');
        return true;
    },
    
    // v1.4.0 宗门系统：离开宗门
    leaveSection() {
        if (!this.section) {
            createFloatingText(this.x, this.y - 80, '没有加入宗门', '#888');
            return;
        }
        const sectionName = this.section.name;
        this.section = null;
        this.sectionContrib = 0;
        game.sectionTasks = {};
        this.recalcStats();
        createFloatingText(this.x, this.y - 80, '已离开 ' + sectionName, '#aaaaaa');
    },
    
    // v1.4.0 坐骑系统：装备坐骑
    equipMount(mountName) {
        const mountData = MOUNTS[mountName];
        if (!mountData) return false;
        
        if (this.level < mountData.unlockLevel) {
            createFloatingText(this.x, this.y - 80, mountData.unlockLevel + '级后才能解锁' + mountData.name, '#ff8800');
            return false;
        }
        
        this.mount = { name: mountName, icon: mountData.icon, quality: mountData.quality, speedBonus: mountData.speedBonus, attackBonus: mountData.attackBonus };
        game.isMounted = true;
        this.recalcStats();
        createFloatingText(this.x, this.y - 100, '装备坐骑 ' + mountData.icon + mountData.name + '!', MOUNT_QUALITY_COLORS[mountData.quality]);
        return true;
    },
    
    // v1.4.0 坐骑系统：下骑
    unequipMount() {
        if (!this.mount) {
            createFloatingText(this.x, this.y - 80, '没有装备坐骑', '#888');
            return;
        }
        const mountName = this.mount.name;
        this.mount = null;
        game.isMounted = false;
        this.recalcStats();
        createFloatingText(this.x, this.y - 80, '已下骑', '#aaaaaa');
    },
    
    // v1.4.0 符文系统：装备符文
    equipRune(runeName, slotIndex) {
        const runeData = RUNES[runeName];
        if (!runeData) return false;
        
        if (slotIndex < 0 || slotIndex >= game.equippedRunes.length) return false;
        
        // 检查背包中是否有这个符文
        const runeIndex = this.runeInventory.findIndex(r => r && r.name === runeName);
        if (runeIndex === -1) {
            createFloatingText(this.x, this.y - 80, '没有这个符文', '#ff8800');
            return false;
        }
        
        // 卸下当前槽位的符文
        if (game.equippedRunes[slotIndex]) {
            this.runeInventory.push(game.equippedRunes[slotIndex]);
        }
        
        // 装备新符文
        game.equippedRunes[slotIndex] = this.runeInventory[runeIndex];
        this.runeInventory.splice(runeIndex, 1);
        
        this.recalcStats();
        createFloatingText(this.x, this.y - 100, '装备符文 ' + runeData.icon + runeName, RUNE_QUALITY_COLORS[runeData.quality]);
        return true;
    },
    
    // v1.4.0 符文系统：卸下符文
    unequipRune(slotIndex) {
        if (slotIndex < 0 || slotIndex >= game.equippedRunes.length) return false;
        
        const rune = game.equippedRunes[slotIndex];
        if (!rune) return false;
        
        this.runeInventory.push(rune);
        game.equippedRunes[slotIndex] = null;
        
        this.recalcStats();
        createFloatingText(this.x, this.y - 80, '卸下符文', '#aaaaaa');
        return true;
    },
    
    // v1.4.0 获取符文属性加成
    getRuneBonus(stat) {
        let bonus = 0;
        game.equippedRunes.forEach(rune => {
            if (rune && rune.stat === stat) {
                bonus += rune.statValue;
            }
        });
        return bonus;
    },
    
    addExp(amount) {
        // v1.3.0 仙侣经验加成
        let expMultiplier = this.getExpBonus();
        
        // v1.4.0 宗门经验加成
        if (this.section && this.section.bonus === 'exp') {
            expMultiplier += this.section.bonusValue;
        }
        
        const finalAmount = Math.floor(amount * expMultiplier);
        this.exp += finalAmount;
        
        // v1.4.0 宗门任务进度
        if (this.section) {
            const taskKey = '击杀怪物';
            if (game.sectionTasks && game.sectionTasks[taskKey]) {
                game.sectionTasks[taskKey].progress++;
                if (game.sectionTasks[taskKey].progress >= game.sectionTasks[taskKey].target) {
                    this.sectionContrib += game.sectionTasks[taskKey].reward;
                    createFloatingText(this.x, this.y - 100, '宗门任务完成! +' + game.sectionTasks[taskKey].reward + '贡献', '#ffd700');
                    game.sectionTasks[taskKey].progress = 0;
                }
            }
        }
        
        if (this.exp >= this.requiredExp) { this.exp -= this.requiredExp; this.levelUp(); }
    },
    
    takeDamage() {
        // v1.7.0 护体光环免伤
        if (this.shieldReflecting) {
            createFloatingText(this.x, this.y - 60, '免疫!', '#00ffff');
            return false;
        }
        if (this.skills.护体神光.active || this.isDodging) return false;
        this.isDodging = true; this.dodgeTimer = 0.5; return true;
    },
    
    // v1.7.0 受到伤害时触发反伤
    onHitByEnemy(enemy, damage) {
        // v1.7.0 护体光环反伤
        if (this.shieldReflecting) {
            const reflectDamage = damage * 0.5;
            enemy.takeDamage(reflectDamage);
            createFloatingText(enemy.x, enemy.y - enemy.height - 20, '反伤 ' + Math.floor(reflectDamage), '#00ffff');
            createParticle(enemy.x + enemy.width/2, enemy.y - enemy.height/2, '#00ffff', 10);
            return false;  // 不受伤害
        }
        return true;  // 正常受到伤害
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
    
    // v1.7.0 主动技能使用
    useActiveSkill(slot) {
        const skill = this.activeSkills[slot];
        if (!skill || !skill.unlocked) return;
        if (skill.cooldownTimer > 0) {
            createFloatingText(this.x, this.y - 80, '冷却中!', '#888');
            return;
        }
        
        const skillData = ACTIVE_SKILLS[skill.name];
        
        // v1.8.0 御剑术 - 远程飞剑
        if (skill.name === '御剑术') {
            const damage = this.attack * skillData.damage * (1 + skill.level * 0.2);
            
            // 发射飞剑
            game.projectiles.push(new Projectile(
                this.x + this.width,
                this.y - this.height / 2,
                400,
                damage,
                'sword'
            ));
            
            // 特效
            for (let i = 0; i < 15; i++) {
                createParticle(this.x + this.width, this.y - this.height/2 + (Math.random() - 0.5) * 40, '#00ffff', 4);
            }
            game.screenShake = 0.1; game.screenShakeIntensity = 5;
            createFloatingText(this.x, this.y - 80, '🗡️ 御剑术!', '#00ffff');
            // v1.8.0 技能音效
            playSound('skill');
            
            skill.cooldownTimer = skillData.cooldown;
            
        } else if (skill.name === '剑气斩') {
            // 范围伤害 + 击退
            const damage = this.attack * skillData.damage * (1 + skill.level * 0.2);
            const knockback = skillData.knockback + skill.level * 20;
            
            game.enemies.forEach(enemy => {
                if (enemy.x > this.x - 50 && enemy.x < this.x + 300) {
                    enemy.takeDamage(damage);
                    enemy.x += knockback;  // 击退效果
                }
            });
            
            // 特效
            for (let i = 0; i < 30; i++) {
                createParticle(this.x + 50 + Math.random() * 150, this.y - this.height/2 + (Math.random() - 0.5) * 60, '#00ffff', 5);
            }
            game.screenShake = 0.2; game.screenShakeIntensity = 8;
            createFloatingText(this.x, this.y - 80, '🗡️ 剑气斩!', '#00ffff');
            
            skill.cooldownTimer = skillData.cooldown;
            
        } else if (skill.name === '护体光环') {
            // 3秒免伤 + 反伤
            this.shieldReflecting = true;
            this.shieldTimer = skillData.duration;
            
            // 护体光环特效
            for (let i = 0; i < 20; i++) {
                createParticle(this.x + this.width/2, this.y - this.height/2, '#ffd700', 8);
            }
            game.screenShake = 0.1; game.screenShakeIntensity = 5;
            createFloatingText(this.x, this.y - 80, '🛡️ 护体光环!', '#ffd700');
            
            skill.cooldownTimer = skillData.cooldown;
            
        } else if (skill.name === '疾风步') {
            // 瞬间位移 + 加速
            this.x += skillData.dashDistance;
            this.isDashing = true;
            this.dashTimer = skillData.duration;
            this.dashSpeedBonus = skillData.speedBonus;
            
            // 疾风步特效
            for (let i = 0; i < 15; i++) {
                createParticle(this.x - 50 + Math.random() * 30, this.y - this.height/2, '#88ff88', 4);
            }
            game.screenShake = 0.1; game.screenShakeIntensity = 3;
            createFloatingText(this.x - 50, this.y - 80, '💨 疾风步!', '#88ff88');
            
            skill.cooldownTimer = skillData.cooldown;
        }
    },
    
    // v1.7.0 升级主动技能
    upgradeActiveSkill(slot) {
        const skill = this.activeSkills[slot];
        if (!skill || !skill.unlocked) return;
        if (game.skillPoints < 1) {
            createFloatingText(this.x, this.y - 80, '技能点不足!', '#ff4444');
            return;
        }
        
        game.skillPoints--;
        skill.level++;
        
        const skillData = ACTIVE_SKILLS[skill.name];
        createFloatingText(this.x, this.y - 80, skillData.icon + skill.name + ' Lv.' + skill.level + '!', '#ffd700');
        createParticle(this.x, this.y - 30, '#ffd700', 15);
        // v1.8.0 升级音效
        playSound('levelup');
    },
    
    // v1.7.0 解锁主动技能
    unlockActiveSkill(slot) {
        const skill = this.activeSkills[slot];
        const skillData = ACTIVE_SKILLS[skill.name];
        
        if (this.level < skillData.unlockLevel) {
            createFloatingText(this.x, this.y - 80, skillData.unlockLevel + '级解锁!', '#ff8800');
            return false;
        }
        
        if (game.skillPoints < 1) {
            createFloatingText(this.x, this.y - 80, '需要1技能点解锁!', '#ff4444');
            return false;
        }
        
        game.skillPoints--;
        skill.unlocked = true;
        skill.level = 1;
        
        createFloatingText(this.x, this.y - 100, '解锁 ' + skillData.icon + skill.name + '!', '#00ff00');
        createParticle(this.x, this.y - 30, '#00ff00', 20);
        return true;
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
        
        // v1.7.0 疾风步加速
        if (this.isDashing) {
            currentSpeed *= this.dashSpeedBonus;
            this.dashTimer -= dt;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.dashSpeedBonus = 0;
            }
        }
        
        // v1.7.0 护体光环持续时间
        if (this.shieldReflecting) {
            this.shieldTimer -= dt;
            if (this.shieldTimer <= 0) {
                this.shieldReflecting = false;
            }
        }
        
        // 简化战斗逻辑：始终前进
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
        // v1.7.0 主动技能冷却
        Object.keys(this.activeSkills).forEach(slot => {
            const skill = this.activeSkills[slot];
            if (skill.cooldownTimer > 0) skill.cooldownTimer -= dt;
        });
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.attacking) { this.attackFrame += dt * 10; if (this.attackFrame >= 1) this.attacking = false; }
    },
    
    draw() {
        const screenX = this.x - CONFIG.cameraOffset;
        const w = WEAPONS[this.weapon];
        
        // v1.9.0 坐骑可视化 - 绘制坐骑光环
        if (this.mount) {
            const mountData = MOUNTS[this.mount.name];
            const qualityColor = MOUNT_QUALITY_COLORS[mountData.quality];
            const bounce = Math.sin(Date.now() * 0.005) * 3;
            const pulse = 0.3 + Math.sin(Date.now() * 0.003) * 0.2;
            
            // 绘制坐骑光环
            ctx.save();
            ctx.globalAlpha = pulse;
            ctx.strokeStyle = qualityColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(screenX + this.width/2, this.y - 5, 25, 8, 0, 0, Math.PI * 2);
            ctx.stroke();
            
            // 绘制坐骑图标（在角色脚下）
            ctx.globalAlpha = 1;
            ctx.font = '20px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.fillText(mountData.icon, screenX + this.width/2, this.y - 10 + bounce);
            ctx.restore();
        }
        
        if (this.skills.护体神光.active) {
            ctx.save(); ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;
            ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(screenX + this.width/2, this.y - this.height/2, 50, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
        
        // v1.7.0 护体光环特效
        if (this.shieldReflecting) {
            ctx.save(); 
            ctx.globalAlpha = 0.4 + Math.sin(Date.now() * 0.015) * 0.2;
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(screenX + this.width/2, this.y - this.height/2, 45, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
            ctx.beginPath(); ctx.arc(screenX + this.width/2, this.y - this.height/2, 45, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
        
        // v1.7.0 疾风步残影
        if (this.isDashing) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#88ff88';
            ctx.fillRect(screenX - 30, this.y - this.height, this.width, this.height);
            ctx.restore();
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
