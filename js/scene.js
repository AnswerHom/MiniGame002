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
    groundDetails: []
};

function getScene(distance) {
    return SCENES[Math.floor(distance / 1000) % 3];
}

function drawBackground() {
    const scene = getScene(player.x);
    
    // 天空渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
    gradient.addColorStop(0, scene.bgColor[0]);
    gradient.addColorStop(0.5, scene.bgColor[1]);
    gradient.addColorStop(1, scene.bgColor[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    // 地面
    ctx.fillStyle = scene.groundColor;
    ctx.fillRect(0, CONFIG.groundY, CONFIG.width, CONFIG.height - CONFIG.groundY);
}
