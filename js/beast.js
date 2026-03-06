// ===== v2.3.0 灵兽系统 =====
// 灵兽蛋掉落、孵化、灵兽栏

// 灵兽品质配置
const BEAST_QUALITY = {
    '普通': { color: '#888888', hatchTime: 3, probability: 0 },
    '优秀': { color: '#4ade80', hatchTime: 5, probability: 0 },
    '稀有': { color: '#3b82f6', hatchTime: 8, probability: 0 },
    '史诗': { color: '#a855f7', hatchTime: 15, probability: 0 },
    '传说': { color: '#f59e0b', hatchTime: 30, probability: 0 }
};

// 灵兽蛋掉落概率配置（按境界）
const BEAST_EGG_DROP = {
    '练气': { dropRate: 0.05, quality: { '普通': 80, '优秀': 19, '稀有': 1, '史诗': 0, '传说': 0 } },
    '筑基': { dropRate: 0.08, quality: { '普通': 60, '优秀': 35, '稀有': 5, '史诗': 0, '传说': 0 } },
    '金丹': { dropRate: 0.12, quality: { '普通': 30, '优秀': 50, '稀有': 19, '史诗': 1, '传说': 0 } },
    '元婴': { dropRate: 0.15, quality: { '普通': 10, '优秀': 40, '稀有': 40, '史诗': 10, '传说': 0 } },
    '化神': { dropRate: 0.20, quality: { '普通': 5, '优秀': 30, '稀有': 45, '史诗': 19, '传说': 1 } },
    '炼虚': { dropRate: 0.22, quality: { '普通': 3, '优秀': 25, '稀有': 45, '史诗': 25, '传说': 2 } },
    '合体': { dropRate: 0.24, quality: { '普通': 1, '优秀': 20, '稀有': 45, '史诗': 30, '传说': 4 } },
    '大乘': { dropRate: 0.25, quality: { '普通': 0, '优秀': 20, '稀有': 45, '史诗': 30, '传说': 5 } },
    '渡劫': { dropRate: 0.25, quality: { '普通': 0, '优秀': 20, '稀有': 45, '史诗': 30, '传说': 5 } },
    '飞升': { dropRate: 0.25, quality: { '普通': 0, '优秀': 20, '稀有': 45, '史诗': 30, '传说': 5 } }
};

// 灵兽类型
const BEAST_TYPES = [
    { name: '青蛇', color: '#22c55e', attack: 5, hp: 20, speed: 60 },
    { name: '白虎', color: '#f5f5f4', attack: 8, hp: 30, speed: 50 },
    { name: '朱雀', color: '#ef4444', attack: 10, hp: 25, speed: 70 },
    { name: '玄武', color: '#3b82f6', attack: 6, hp: 40, speed: 40 },
    { name: '麒麟', color: '#a855f7', attack: 12, hp: 35, speed: 55 },
    { name: '青龙', color: '#14b8a6', attack: 11, hp: 32, speed: 65 },
    { name: '白鹤', color: '#e2e8f0', attack: 7, hp: 18, speed: 80 },
    { name: '灵狐', color: '#f97316', attack: 9, hp: 22, speed: 70 }
];

// 玩家灵兽数据
const beastSystem = {
    // 灵兽蛋仓库
    eggs: [],
    // 已拥有的灵兽
    beasts: [],
    // 当前选中的战斗伙伴
    activeBeast: null,
    // 灵兽蛋ID计数器
    eggIdCounter: 0,
    // 灵兽ID计数器
    beastIdCounter: 0,
    // v2.3.0: 灵兽仓库界面显示状态
    showWarehouse: false,
    // 正在孵化的蛋
    hatchingEgg: null,
    // 孵化进度
    hatchProgress: 0,
    // v2.3.0: 灵兽栏界面显示状态
    showBeastArena: false,
    
    // 生成唯一ID
    generateEggId() {
        return 'egg_' + (++this.eggIdCounter);
    },
    
    generateBeastId() {
        return 'beast_' + (++this.beastIdCounter);
    },
    
    // 根据境界获取灵兽蛋掉落
    dropEgg(realm) {
        const dropConfig = BEAST_EGG_DROP[realm] || BEAST_EGG_DROP['练气'];
        
        // 检查是否掉落
        if (Math.random() > dropConfig.dropRate) {
            return null;
        }
        
        // 确定品质
        const qualityRoll = Math.random() * 100;
        let quality = '普通';
        let cumulative = 0;
        for (const [q, p] of Object.entries(dropConfig.quality)) {
            cumulative += p;
            if (qualityRoll < cumulative) {
                quality = q;
                break;
            }
        }
        
        // 创建灵兽蛋
        const egg = {
            id: this.generateEggId(),
            quality: quality,
            realm: realm,
            hatchTime: BEAST_QUALITY[quality].hatchTime,
            color: BEAST_QUALITY[quality].color,
            obtainedAt: Date.now()
        };
        
        this.eggs.push(egg);
        
        // 显示掉落提示
        game.showMessage('获得灵兽蛋 [' + quality + ']', this.color);
        
        return egg;
    },
    
    // 开始孵化
    startHatch(eggId) {
        const egg = this.eggs.find(e => e.id === eggId);
        if (!egg) return false;
        
        // 已经开始孵化的不能重复孵化
        if (this.hatchingEgg) return false;
        
        this.hatchingEgg = egg;
        this.hatchProgress = 0;
        
        // 从仓库移除（孵化中）
        const index = this.eggs.indexOf(egg);
        if (index > -1) {
            this.eggs.splice(index, 1);
        }
        
        return true;
    },
    
    // 更新孵化进度
    updateHatching(dt) {
        if (!this.hatchingEgg) return;
        
        this.hatchProgress += dt;
        
        // 孵化完成
        if (this.hatchProgress >= this.hatchingEgg.hatchTime) {
            this.completeHatch();
        }
    },
    
    // 完成孵化
    completeHatch() {
        if (!this.hatchingEgg) return;
        
        // 随机生成灵兽
        const beastType = BEAST_TYPES[Math.floor(Math.random() * BEAST_TYPES.length)];
        const quality = this.hatchingEgg.quality;
        
        // 品质加成
        const qualityBonus = {
            '普通': 1.0,
            '优秀': 1.2,
            '稀有': 1.5,
            '史诗': 2.0,
            '传说': 3.0
        };
        
        const bonus = qualityBonus[quality] || 1.0;
        
        const beast = {
            id: this.generateBeastId(),
            name: beastType.name,
            color: beastType.color,
            baseAttack: Math.floor(beastType.attack * bonus),
            baseHp: Math.floor(beastType.hp * bonus),
            speed: beastType.speed,
            level: 1,
            quality: quality,
            attack: Math.floor(beastType.attack * bonus),
            hp: Math.floor(beastType.hp * bonus),
            maxHp: Math.floor(beastType.hp * bonus),
            realm: this.hatchingEgg.realm,
            obtainedAt: Date.now()
        };
        
        this.beasts.push(beast);
        
        // 显示孵化成功提示
        game.showMessage('孵化成功！获得 ' + quality + ' ' + beastType.name, '#ffd700');
        
        // 清空孵化状态
        this.hatchingEgg = null;
        this.hatchProgress = 0;
        
        // 如果没有选中的伙伴，自动选中第一个
        if (!this.activeBeast && this.beasts.length > 0) {
            this.activeBeast = this.beasts[0];
        }
    },
    
    // 选择战斗伙伴
    selectPartner(beastId) {
        const beast = this.beasts.find(b => b.id === beastId);
        if (beast) {
            this.activeBeast = beast;
            game.showMessage('已选择 ' + beast.name + ' 作为战斗伙伴', '#4ade80');
        }
    },
    
    // 获取所有灵兽
    getBeasts() {
        return this.beasts;
    },
    
    // 获取当前伙伴
    getActiveBeast() {
        return this.activeBeast;
    },
    
    // 获取灵兽蛋列表
    getEggs() {
        return this.eggs;
    },
    
    // 是否有正在孵化的蛋
    isHatching() {
        return this.hatchingEgg !== null;
    },
    
    // 绘制孵化进度条
    drawHatchProgress() {
        if (!this.hatchingEgg) return;
        
        const barWidth = 120;
        const barHeight = 12;
        const barX = CONFIG.width / 2 - barWidth / 2;
        const barY = CONFIG.height - 60;
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX - 10, barY - 20, barWidth + 20, 50);
        
        // 灵兽蛋信息
        ctx.fillStyle = this.hatchingEgg.color;
        ctx.font = '14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('孵化中: ' + this.hatchingEgg.quality + ' ' + this.hatchingEgg.realm + '灵兽蛋', CONFIG.width / 2, barY);
        
        // 进度条背景
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY + 5, barWidth, barHeight);
        
        // 进度条
        const progress = Math.min(1, this.hatchProgress / this.hatchingEgg.hatchTime);
        const gradient = ctx.createLinearGradient(barX, barY + 5, barX + barWidth * progress, barY + 5);
        gradient.addColorStop(0, '#4ade80');
        gradient.addColorStop(1, '#22c55e');
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY + 5, barWidth * progress, barHeight);
        
        // 进度文字
        ctx.fillStyle = '#fff';
        ctx.font = '12px Microsoft YaHei';
        ctx.fillText(this.hatchProgress.toFixed(1) + 's / ' + this.hatchingEgg.hatchTime + 's', CONFIG.width / 2, barY + 32);
        
        ctx.textAlign = 'left';
    },
    
    // 灵兽参战效果（攻击敌人）
    beastAttack(enemies) {
        if (!this.activeBeast || enemies.length === 0) return;
        
        // 找到最近的敌人
        let nearestEnemy = null;
        let nearestDist = Infinity;
        
        enemies.forEach(enemy => {
            if (!enemy.alive) return;
            const dist = Math.abs(player.x - enemy.x);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = enemy;
            }
        });
        
        // 如果敌人在范围内，攻击
        if (nearestEnemy && nearestDist < 150) {
            const damage = Math.floor(this.activeBeast.attack * 0.5); // 灵兽攻击力是主人的50%
            nearestEnemy.takeDamage(damage);
            
            // 显示伤害数字
            game.addDamageNumber(nearestEnemy.x, nearestEnemy.y - nearestEnemy.height - 20, damage, false, false, this.activeBeast.color);
        }
    }
};

// 绘制灵兽蛋图标
function drawBeastEggIcon(x, y, size, quality, alpha = 1) {
    ctx.globalAlpha = alpha;
    
    // 蛋形
    ctx.fillStyle = BEAST_QUALITY[quality].color || '#888';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.6, size, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x - size * 0.2, y - size * 0.3, size * 0.2, size * 0.3, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
}

// 绘制灵兽图标
function drawBeastIcon(x, y, size, beast, alpha = 1) {
    ctx.globalAlpha = alpha;
    
    // 灵兽外形（简化版）
    ctx.fillStyle = beast.color;
    
    // 身体
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - size * 0.15, y - size * 0.1, size * 0.1, 0, Math.PI * 2);
    ctx.arc(x + size * 0.15, y - size * 0.1, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - size * 0.15, y - size * 0.1, size * 0.05, 0, Math.PI * 2);
    ctx.arc(x + size * 0.15, y - size * 0.1, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
}

// 获取品质颜色
function getQualityColor(quality) {
    return BEAST_QUALITY[quality]?.color || '#888';
}

// 获取品质名称
function getQualityName(quality) {
    return quality;
}
