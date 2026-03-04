// ===== 场景模块 =====

const SCENES = [
    { name: '山野之路', bgColor: ['#1a0a2e', '#2d1b4e', '#1a3a5c'], groundColor: '#1a2f25', sky: 'night' },
    { name: '幽林深处', bgColor: ['#0a1a0a', '#1a2d1a', '#1a3a2a'], groundColor: '#1a2a1a', sky: 'dusk' },
    { name: '古墓遗迹', bgColor: ['#1a1a1a', '#2a2a2a', '#1a2a2a'], groundColor: '#2a2a2a', sky: 'night' }
];

let sceneState = {
    clouds: [],
    stars: [],
    groundDetails: []
};

function getScene(distance) {
    return SCENES[Math.floor(distance / 100) % 3];  // v1.2.3: 每前进100米切换一次场景
}

const SKY_THEMES = {
    day: { colors: ['#87ceeb', '#b8e0f0', '#e0f7fa'] },
    dusk: { colors: ['#ff7e5f', '#feb47b', '#ffcf9f'] },
    night: { colors: ['#0c1445', '#1a2a5c', '#2a3a6c'] }
};

const CLOUD_CONFIG = {
    minSize: 80, maxSize: 150,
    minInterval: 5000, maxInterval: 10000,
    speed: 30,
    color: 'rgba(255,255,255,0.6)'
};

const STAR_CONFIG = {
    count: 25, minSize: 2, maxSize: 4,
    colors: ['#ffffff', '#fffacd', '#e0ffff'],
    twinkleSpeed: 2
};

const GROUND_DETAIL_CONFIG = {
    flowerColors: ['#ffb6c1', '#ffd700', '#ff69b4'],
    stoneColors: ['#696969', '#808080']
};

function drawBackground() {
    if (!player) return;
    const scene = getScene(player.x);
    var cameraX = player.x - 100;
    sceneState.cameraX = cameraX;
    
    var skyTheme = SKY_THEMES[scene.sky] || SKY_THEMES.night;
    var gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
    gradient.addColorStop(0, skyTheme.colors[0]);
    gradient.addColorStop(0.5, skyTheme.colors[1]);
    gradient.addColorStop(1, skyTheme.colors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    if (scene.sky === 'night') {
        drawStars(cameraX);
    }
    
    if (scene.sky !== 'night') {
        drawClouds(cameraX);
    }
    
    ctx.fillStyle = scene.groundColor;
    ctx.fillRect(0, CONFIG.groundY, CONFIG.width, CONFIG.height - CONFIG.groundY);
    
    drawGroundDetails(cameraX);
}

function drawClouds(cameraX) {
    if (!player) return;
    var scene = getScene(player.x);
    if (scene.sky === 'night') return;
    
    if (!sceneState.clouds.length || Math.random() < 0.01) {
        sceneState.clouds.push({
            x: CONFIG.width + 100,
            y: 50 + Math.random() * 80,
            size: 60 + Math.random() * 40
        });
    }
    
    sceneState.clouds = sceneState.clouds.filter(function(cloud) {
        cloud.x -= 20 * 0.016;
        if (cloud.x + cloud.size < 0) return false;
        
        var screenX = cloud.x - cameraX * 0.5;
        ctx.fillStyle = CLOUD_CONFIG.color;
        ctx.beginPath();
        ctx.arc(screenX, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
        ctx.arc(screenX + cloud.size * 0.3, cloud.y - cloud.size * 0.1, cloud.size * 0.4, 0, Math.PI * 2);
        ctx.arc(screenX + cloud.size * 0.6, cloud.y, cloud.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        return true;
    });
}

function drawStars(cameraX) {
    if (!sceneState.stars.length) {
        for (var i = 0; i < STAR_CONFIG.count; i++) {
            sceneState.stars.push({
                x: Math.random() * CONFIG.width * 2,
                y: Math.random() * (CONFIG.groundY - 50),
                size: STAR_CONFIG.minSize + Math.random() * (STAR_CONFIG.maxSize - STAR_CONFIG.minSize)
            });
        }
    }
    
    var time = Date.now() / 1000;
    sceneState.stars.forEach(function(star) {
        var screenX = star.x - cameraX * 0.2;
        if (screenX < -10 || screenX > CONFIG.width + 10) return;
        
        var alpha = 0.5 + 0.5 * Math.sin(time * 2 + star.x);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(screenX, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function drawGroundDetails(cameraX) {
    if (!player) return;
    var offset = player.x - 100;
    
    if (!sceneState.groundDetails.length) {
        for (var i = 0; i < 20; i++) {
            sceneState.groundDetails.push({
                x: Math.random() * CONFIG.width * 2,
                type: Math.random() > 0.5 ? 'flower' : 'stone'
            });
        }
    }
    
    sceneState.groundDetails.forEach(function(detail) {
        var screenX = detail.x - offset;
        if (screenX < -50 || screenX > CONFIG.width + 50) return;
        
        if (detail.type === 'flower') {
            ctx.fillStyle = GROUND_DETAIL_CONFIG.flowerColors[Math.floor(Math.random() * 3)];
            ctx.beginPath();
            ctx.arc(screenX, CONFIG.groundY - 3, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}
