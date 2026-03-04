// ===== 场景模块 =====

const SCENES = [
    { name: '山野之路', bgColor: ['#1a0a2e', '#2d1b4e', '#1a3a5c'], groundColor: '#1a2f25', sky: 'night' },
    { name: '幽林深处', bgColor: ['#0a1a0a', '#1a2d1a', '#1a3a2a'], groundColor: '#1a2a1a', sky: 'dusk' },
    { name: '古墓遗迹', bgColor: ['#1a1a1a', '#2a2a2a', '#1a2a2a'], groundColor: '#2a2a2a', sky: 'night' }
];

// 场景状态
let sceneState = {
    clouds: [],
    stars: [],
    groundDetails: [],
    lastCloudSpawn: 0,
    cameraX: 0
};

function getScene(distance) {
    return SCENES[Math.floor(distance / 1000) % 3];
}

// ===== v1.0.5 三层背景系统 =====

function drawBackground() {
    const scene = getScene(player.x);
    const cameraX = player.x - 100;
    sceneState.cameraX = cameraX;
    
    // 绘制三层背景
    drawFarLayer(scene, cameraX);
    drawMidLayer(scene, cameraX);
    drawNearLayer(scene, cameraX);
    
    // 绘制地面
    drawGround(scene, cameraX);
    
    // 生成云朵和星星
    updateClouds();
    updateStars(scene);
    updateGroundDetails();
}

// 远景：天空、山脉、星星 (0.2x速度)
function drawFarLayer(scene, cameraX) {
    const skyTheme = SKY_THEMES[scene.sky] || SKY_THEMES.day;
    
    // 天空渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
    gradient.addColorStop(0, skyTheme.colors[0]);
    gradient.addColorStop(0.5, skyTheme.colors[1]);
    gradient.addColorStop(1, skyTheme.colors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    // 绘制星星（夜晚）
    if (scene.sky === 'night') {
        drawStars(cameraX);
    }
    
    // 绘制远景山脉
    drawMountains(cameraX);
}

// 中景：云朵、飞鸟 (0.5x速度)
function drawMidLayer(scene, cameraX) {
    // 绘制云朵
    drawClouds(cameraX);
}

// 近景：地面、花草 (1.0x速度)
function drawNearLayer(scene, cameraX) {
    // 近景元素在drawGround中绘制
}

// 地面绘制
function drawGround(scene, cameraX) {
    // 地面
    ctx.fillStyle = scene.groundColor;
    ctx.fillRect(0, CONFIG.groundY, CONFIG.width, CONFIG.height - CONFIG.groundY);
    
    // 绘制地面装饰
    drawGroundDetails(cameraX);
}

// ===== 云朵系统 =====
function updateClouds() {
    const now = Date.now();
    const scene = getScene(player.x);
    
    // 夜晚不生成云朵
    if (scene.sky === 'night') return;
    
    // 随机生成新云朵
    const interval = CLOUD_CONFIG.minInterval + Math.random() * (CLOUD_CONFIG.maxInterval - CLOUD_CONFIG.minInterval);
    if (now - sceneState.lastCloudSpawn > interval) {
        const size = CLOUD_CONFIG.minSize + Math.random() * (CLOUD_CONFIG.maxSize - CLOUD_CONFIG.minSize);
        sceneState.clouds.push({
            x: CONFIG.width + size,
            y: 30 + Math.random() * 80,
            size: size,
            speed: CLOUD_CONFIG.speed * (0.8 + Math.random() * 0.4)
        });
        sceneState.lastCloudSpawn = now;
    }
    
    // 更新云朵位置
    sceneState.clouds = sceneState.clouds.filter(cloud => {
        cloud.x -= cloud.speed * 0.016; // 假设60fps
        return cloud.x + cloud.size > -50;
    });
}

function drawClouds(cameraX) {
    const scene = getScene(player.x);
    if (scene.sky === 'night') return;
    
    sceneState.clouds.forEach(cloud => {
        const screenX = cloud.x - cameraX * 0.5; // 中景0.5x速度
        
        ctx.fillStyle = CLOUD_CONFIG.color;
        ctx.beginPath();
        ctx.arc(screenX, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
        ctx.arc(screenX + cloud.size * 0.3, cloud.y - cloud.size * 0.1, cloud.size * 0.4, 0, Math.PI * 2);
        ctx.arc(screenX + cloud.size * 0.6, cloud.y, cloud.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
    });
}

// ===== 星星系统 =====
function initStars() {
    if (sceneState.stars.length > 0) return;
    
    for (let i = 0; i < STAR_CONFIG.count; i++) {
        sceneState.stars.push({
            x: Math.random() * CONFIG.width * 3,
            y: Math.random() * (CONFIG.groundY - 50),
            size: STAR_CONFIG.minSize + Math.random() * (STAR_CONFIG.maxSize - STAR_CONFIG.minSize),
            color: STAR_CONFIG.colors[Math.floor(Math.random() * STAR_CONFIG.colors.length)],
            twinkleOffset: Math.random() * Math.PI * 2,
            twinkleSpeed: STAR_CONFIG.twinkleSpeed
        });
    }
}

function updateStars(scene) {
    if (scene.sky === 'night') {
        initStars();
    }
}

function drawStars(cameraX) {
    const scene = getScene(player.x);
    if (scene.sky !== 'night') return;
    
    const time = Date.now() / 1000;
    
    sceneState.stars.forEach(star => {
        const screenX = star.x - cameraX * 0.2; // 远景0.2x速度
        
        // 闪烁效果
        const alpha = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        
        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(screenX, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.globalAlpha = 1;
}

// 绘制远景山脉
function drawMountains(cameraX) {
    const scene = getScene(player.x);
    if (!SCENE_BACKGROUNDS[scene.name]?.mountains) return;
    
    ctx.fillStyle = 'rgba(40, 30, 60, 0.5)';
    const offset = cameraX * 0.2;
    
    // 绘制山脉轮廓
    ctx.beginPath();
    ctx.moveTo(-offset % 400, CONFIG.groundY);
    
    for (let i = -1; i < 4; i++) {
        const baseX = i * 200 - offset % 200;
        ctx.lineTo(baseX + 50, CONFIG.groundY - 100);
        ctx.lineTo(baseX + 100, CONFIG.groundY - 60);
        ctx.lineTo(baseX + 150, CONFIG.groundY - 120);
        ctx.lineTo(baseX + 200, CONFIG.groundY - 80);
    }
    
    ctx.lineTo(CONFIG.width + 100, CONFIG.groundY);
    ctx.closePath();
    ctx.fill();
}

// ===== 地面细节系统 =====
function initGroundDetails() {
    if (sceneState.groundDetails.length > 0) return;
    
    // 随机生成小花
    for (let i = 0; i < 30; i++) {
        sceneState.groundDetails.push({
            type: 'flower',
            x: Math.random() * CONFIG.width * 2,
            color: GROUND_DETAIL_CONFIG.flowerColors[Math.floor(Math.random() * GROUND_DETAIL_CONFIG.flowerColors.length)],
            size: GROUND_DETAIL_CONFIG.flowerSize * (0.8 + Math.random() * 0.4)
        });
    }
    
    // 随机生成石头
    for (let i = 0; i < 15; i++) {
        sceneState.groundDetails.push({
            type: 'stone',
            x: Math.random() * CONFIG.width * 2,
            color: GROUND_DETAIL_CONFIG.stoneColors[Math.floor(Math.random() * GROUND_DETAIL_CONFIG.stoneColors.length)],
            size: GROUND_DETAIL_CONFIG.stoneSize.min + Math.random() * (GROUND_DETAIL_CONFIG.stoneSize.max - GROUND_DETAIL_CONFIG.stoneSize.min)
        });
    }
}

function updateGroundDetails() {
    initGroundDetails();
}

function drawGroundDetails(cameraX) {
    const offset = player.x - 100;
    
    sceneState.groundDetails.forEach(detail => {
        const screenX = detail.x - offset;
        
        // 只绘制屏幕范围内的
        if (screenX < -50 || screenX > CONFIG.width + 50) return;
        
        if (detail.type === 'flower') {
            // 绘制小花
            ctx.fillStyle = detail.color;
            ctx.beginPath();
            ctx.arc(screenX, CONFIG.groundY - 5, detail.size, 0, Math.PI * 2);
            ctx.fill();
            // 花瓣
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(screenX, CONFIG.groundY - 5 - detail.size * 0.3, detail.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        } else if (detail.type === 'stone') {
            // 绘制石头
            ctx.fillStyle = detail.color;
            ctx.beginPath();
            ctx.ellipse(screenX, CONFIG.groundY - detail.size / 3, detail.size, detail.size / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// ===== 配置数据 =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CONFIG = { width: 800, height: 450, groundY: 380, cameraOffset: 0 };
canvas.width = CONFIG.width;
canvas.height = CONFIG.height;

// ===== 境界系统 =====
const REALMS = [
    { name: '练气', minLevel: 1 },
    { name: '筑基', minLevel: 5 },
    { name: '金丹', minLevel: 10 },
    { name: '元婴', minLevel: 15 },
    { name: '化神', minLevel: 20 },
    { name: '炼虚', minLevel: 25 },
    { name: '合体', minLevel: 30 },
    { name: '大乘', minLevel: 35 },
    { name: '渡劫', minLevel: 40 },
    { name: '飞升', minLevel: 50 }
];

const REALM_COLORS = {
    '练气': '#888888',
    '筑基': '#4ade80',
    '金丹': '#fbbf24',
    '元婴': '#f97316',
    '化神': '#ef4444',
    '炼虚': '#ec4899',
    '合体': '#8b5cf6',
    '大乘': '#3b82f6',
    '渡劫': '#06b6d4',
    '飞升': '#fbbf24'
};

function getRealm(level) {
    for (let i = REALMS.length - 1; i >= 0; i--) {
        if (level >= REALMS[i].minLevel) return REALMS[i];
    }
    return REALMS[0];
}

const BATTLE_STATES = {
    ADVANCE: 'advance',
    COMBAT: 'combat',
    VICTORY: 'victory'
};

// 背景层配置
const BACKGROUND_LAYERS = {
    far: { speed: 0.2, name: '远景' },
    mid: { speed: 0.5, name: '中景' },
    near: { speed: 1.0, name: '近景' }
};

// 天空主题
const SKY_THEMES = {
    day: { colors: ['#87ceeb', '#b8e0f0', '#e0f7fa'], name: '白天' },
    dusk: { colors: ['#ff7e5f', '#feb47b', '#ffcf9f'], name: '黄昏' },
    night: { colors: ['#0c1445', '#1a2a5c', '#2a3a6c'], name: '夜晚' }
};

// 云朵配置
const CLOUD_CONFIG = {
    minSize: 80,
    maxSize: 150,
    minInterval: 5000,
    maxInterval: 10000,
    speed: 30,
    opacity: 0.6,
    color: 'rgba(255,255,255,0.6)'
};

// 星星配置
const STAR_CONFIG = {
    count: 25,
    minSize: 2,
    maxSize: 4,
    colors: ['#ffffff', '#fffacd', '#e0ffff'],
    twinkleSpeed: 2
};

// 地面细节配置
const GROUND_DETAIL_CONFIG = {
    grassStripeHeight: 20,
    grassColors: ['#90cdf4', '#68d391'],
    flowerColors: ['#ffb6c1', '#ffd700', '#ff69b4'],
    flowerSize: 6,
    stoneColors: ['#696969', '#808080', '#a9a9a9'],
    stoneSize: { min: 10, max: 25 }
};

// 场景背景配置
const SCENE_BACKGROUNDS = {
    '山野之路': { sky: 'night', mountains: true, birds: true, trees: true },
    '幽林深处': { sky: 'dusk', mountains: false, birds: false, trees: true },
    '古墓遗迹': { sky: 'night', mountains: false, birds: false, trees: false }
};
