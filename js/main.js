// ===== v1.0.4 游戏主循环 =====
// v1.0.4: 实现三层背景系统、云朵、星星、地面细节

// 远景元素状态
let farLayerElements = {
    clouds: [],
    stars: [],
    mountains: [],
    trees: [],
    lastCloudTime: 0
};

// 地面细节
let groundDetails = {
    flowers: [],
    stones: []
};

// 初始化地面细节
function initGroundDetails() {
    groundDetails.flowers = [];
    groundDetails.stones = [];
    
    // 生成小花
    for (let i = 0; i < 15; i++) {
        groundDetails.flowers.push({
            x: Math.random() * CONFIG.width,
            color: GROUND_DETAIL_CONFIG.flowerColors[Math.floor(Math.random() * GROUND_DETAIL_CONFIG.flowerColors.length)],
            size: GROUND_DETAIL_CONFIG.flowerSize + Math.random() * 4
        });
    }
    
    // 生成石头
    for (let i = 0; i < 8; i++) {
        groundDetails.stones.push({
            x: Math.random() * CONFIG.width,
            size: GROUND_DETAIL_CONFIG.stoneSize.min + Math.random() * (GROUND_DETAIL_CONFIG.stoneSize.max - GROUND_DETAIL_CONFIG.stoneSize.min),
            color: GROUND_DETAIL_CONFIG.stoneColors[Math.floor(Math.random() * GROUND_DETAIL_CONFIG.stoneColors.length)]
        });
    }
}

// 初始化星星
function initStars() {
    farLayerElements.stars = [];
    for (let i = 0; i < STAR_CONFIG.count; i++) {
        farLayerElements.stars.push({
            x: Math.random() * CONFIG.width,
            y: Math.random() * (CONFIG.groundY - 100),
            size: STAR_CONFIG.minSize + Math.random() * (STAR_CONFIG.maxSize - STAR_CONFIG.minSize),
            color: STAR_CONFIG.colors[Math.floor(Math.random() * STAR_CONFIG.colors.length)],
            twinkleOffset: Math.random() * Math.PI * 2,
            twinkleSpeed: STAR_CONFIG.twinkleSpeed
        });
    }
}

// 初始化云朵
function initClouds() {
    farLayerElements.clouds = [];
    for (let i = 0; i < 3; i++) {
        addCloud(Math.random() * CONFIG.width);
    }
}

// 添加新云朵
function addCloud(x) {
    const size = CLOUD_CONFIG.minSize + Math.random() * (CLOUD_CONFIG.maxSize - CLOUD_CONFIG.minSize);
    farLayerElements.clouds.push({
        x: x,
        y: 30 + Math.random() * 100,
        width: size,
        height: size * 0.6,
        speed: CLOUD_CONFIG.speed * (0.5 + Math.random() * 0.5)
    });
}

// 绘制天空
function drawSky(scene) {
    const theme = SCENE_BACKGROUNDS[scene.name]?.sky || 'day';
    const skyColors = SKY_THEMES[theme].colors;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
    gradient.addColorStop(0, skyColors[0]);
    gradient.addColorStop(0.5, skyColors[1]);
    gradient.addColorStop(1, skyColors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
}

// 绘制星星（夜晚）
function drawStars(time) {
    const scene = getScene(player.x);
    const theme = SCENE_BACKGROUNDS[scene.name]?.sky;
    
    if (theme !== 'night') return;
    
    farLayerElements.stars.forEach(star => {
        const twinkle = 0.5 + 0.5 * Math.sin(time / 1000 * star.twinkleSpeed + star.twinkleOffset);
        ctx.globalAlpha = 0.4 + twinkle * 0.6;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// 绘制云朵（中景）
function drawClouds(dt) {
    const scene = getScene(player.x);
    const theme = SCENE_BACKGROUNDS[scene.name]?.sky;
    
    // 白天和黄昏显示云朵
    if (theme === 'night') return;
    
    // 更新云朵位置
    farLayerElements.clouds.forEach(cloud => {
        cloud.x += cloud.speed * dt;
        if (cloud.x > CONFIG.width + cloud.width) {
            cloud.x = -cloud.width;
            cloud.y = 30 + Math.random() * 100;
        }
    });
    
    // 绘制云朵
    farLayerElements.clouds.forEach(cloud => {
        ctx.fillStyle = CLOUD_CONFIG.color;
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // 添加第二层云朵
        ctx.beginPath();
        ctx.ellipse(cloud.x - cloud.width * 0.2, cloud.y + 5, cloud.width / 3, cloud.height / 3, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 生成新云朵
    const now = Date.now();
    if (now - farLayerElements.lastCloudTime > CLOUD_CONFIG.minInterval + Math.random() * (CLOUD_CONFIG.maxInterval - CLOUD_CONFIG.minInterval)) {
        addCloud(CONFIG.width + 50);
        farLayerElements.lastCloudTime = now;
    }
}

// 绘制山脉（远景）
function drawMountains(cameraOffset) {
    const offset = cameraOffset * BACKGROUND_LAYERS.far.speed;
    
    // 远景山脉轮廓
    ctx.fillStyle = '#2a1a3a';
    ctx.beginPath();
    ctx.moveTo(-offset % CONFIG.width, CONFIG.groundY);
    
    // 生成山脉形状
    for (let x = -offset % CONFIG.width; x < CONFIG.width + 200; x += 80) {
        const h = 80 + Math.sin(x * 0.01) * 40 + Math.random() * 30;
        ctx.lineTo(x, CONFIG.groundY - h);
    }
    ctx.lineTo(CONFIG.width + 100, CONFIG.groundY);
    ctx.closePath();
    ctx.fill();
    
    // 第二层山脉（更远）
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath();
    ctx.moveTo(-offset % CONFIG.width, CONFIG.groundY);
    for (let x = -offset % CONFIG.width; x < CONFIG.width + 200; x += 60) {
        const h = 50 + Math.sin(x * 0.015) * 30 + Math.random() * 20;
        ctx.lineTo(x, CONFIG.groundY - h);
    }
    ctx.lineTo(CONFIG.width + 100, CONFIG.groundY);
    ctx.closePath();
    ctx.fill();
}

// 绘制树木剪影（中景）
function drawTrees(cameraOffset) {
    const offset = cameraOffset * BACKGROUND_LAYERS.mid.speed;
    const scene = getScene(player.x);
    
    if (!SCENE_BACKGROUNDS[scene.name]?.trees) return;
    
    ctx.fillStyle = '#0a1a0a';
    for (let x = -offset % 300; x < CONFIG.width + 100; x += 150) {
        const h = 100 + Math.sin(x) * 30;
        // 树干
        ctx.fillRect(x, CONFIG.groundY - h, 15, h);
        // 树冠
        ctx.beginPath();
        ctx.arc(x + 7, CONFIG.groundY - h - 20, 40, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 绘制地面条纹
function drawGroundStripes() {
    const scene = getScene(player.x);
    ctx.fillStyle = scene.groundColor;
    ctx.fillRect(0, CONFIG.groundY, CONFIG.width, CONFIG.height - CONFIG.groundY);
    
    // 草地条纹
    for (let y = CONFIG.groundY; y < CONFIG.height; y += GROUND_DETAIL_CONFIG.grassStripeHeight) {
        const stripeIndex = Math.floor((y - CONFIG.groundY) / GROUND_DETAIL_CONFIG.grassStripeHeight);
        ctx.fillStyle = GROUND_DETAIL_CONFIG.grassColors[stripeIndex % 2];
        ctx.fillRect(0, y, CONFIG.width, GROUND_DETAIL_CONFIG.grassStripeHeight / 2);
    }
}

// 绘制地面细节（花朵和石头）
function drawGroundDetails() {
    // 绘制小花
    groundDetails.flowers.forEach(flower => {
        ctx.fillStyle = flower.color;
        ctx.beginPath();
        ctx.arc(flower.x, CONFIG.groundY - 5, flower.size, 0, Math.PI * 2);
        ctx.fill();
        // 花心
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(flower.x, CONFIG.groundY - 5, flower.size / 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 绘制石头
    groundDetails.stones.forEach(stone => {
        ctx.fillStyle = stone.color;
        ctx.beginPath();
        ctx.ellipse(stone.x, CONFIG.groundY - stone.size / 3, stone.size, stone.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawBackground() {
    const scene = getScene(player.x);
    const cameraOffset = player.x - 100;
    
    // 第一层：天空（静止）
    drawSky(scene);
    
    // 第二层：星星（夜晚）
    drawStars(performance.now());
    
    // 第三层：山脉（远景 - 0.2x速度）
    drawMountains(cameraOffset);
    
    // 第四层：云朵（中景 - 0.5x速度，已在drawClouds中处理）
    // 第五层：树木（中景 - 0.5x速度）
    drawTrees(cameraOffset);
    
    // 第六层：云朵动画更新
    drawClouds(0.016);
    
    // 第七层：地面（近景 - 1.0x速度 = 静止）
    drawGroundStripes();
    drawGroundDetails();
}

function update(dt) {
    if (game.gameOver) return;
    
    // v1.0.2: 伤害数字更新
    game.updateDamageNumbers(dt);
    
    // v1.0.2: 玩家移动状态重置（由怪物检测时设置）
    player.isMoving = true;
    
    // 玩家更新
    player.update(dt);
    
    // 怪物生成
    game.spawnTimer += dt * 1000;
    if (game.spawnTimer >= game.spawnInterval) {
        spawnEnemy();
        game.spawnTimer = 0;
    }
    
    // 怪物更新
    game.enemies.forEach(enemy => enemy.update(dt));
    
    // v1.0.2: 战斗逻辑 - 遇怪停下（已在enemy.update中处理）
    
    // 检测攻击
    game.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        const dist = Math.abs(player.x - enemy.x);
        if (dist < player.attackRange) {
            player.attackTarget(enemy);
        }
    });
    
    // 清理死亡怪物
    game.enemies = game.enemies.filter(e => e.alive);
    
    // 升级检测
    if (player.exp >= player.requiredExp) {
        player.levelUp();
    }
}

function draw() {
    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);
    
    drawBackground();
    
    // 绘制怪物
    game.enemies.forEach(enemy => enemy.draw());
    
    // 绘制玩家
    player.draw();
    
    // v1.0.2: 绘制伤害数字
    game.drawDamageNumbers();
    
    // 绘制UI
    drawUI();
    
    // 游戏结束
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 48px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', CONFIG.width / 2, CONFIG.height / 2);
        ctx.fillStyle = '#fff';
        ctx.font = '20px Microsoft YaHei';
        ctx.fillText('最终等级: Lv.' + player.level, CONFIG.width / 2, CONFIG.height / 2 + 40);
        ctx.fillText('击杀总数: ' + game.killCount, CONFIG.width / 2, CONFIG.height / 2 + 70);
    }
}

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - game.lastTime) / 1000, 0.1);
    game.lastTime = timestamp;
    
    update(dt);
    draw();
    
    if (!game.gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    // v1.0.4: 初始化背景元素
    initStars();
    initClouds();
    initGroundDetails();
    
    game.lastTime = performance.now();
    game.enemies = [];
    game.killCount = 0;
    game.spawnTimer = 0;
    game.gameOver = false;
    player.x = 100;
    player.hp = player.maxHp;
    player.exp = 0;
    player.level = 1;
    requestAnimationFrame(gameLoop);
}

window.onload = startGame;
