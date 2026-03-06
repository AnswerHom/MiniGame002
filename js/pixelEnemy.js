// v3.5.0: 怪物像素风格绘制模块

// 像素绘制辅助函数
function drawPixelRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    for (let dx = 0; dx < w; dx++) {
        for (let dy = 0; dy < h; dy++) {
            ctx.fillRect(x + dx * 2, y + dy * 2, 2, 2);
        }
    }
}

// 阴魂 - 像素风格
function drawPixelGhost(screenX, screenY, animTime) {
    const float = Math.sin(animTime * 3) * 3;
    const ps = 2; // 像素大小
    
    // 身体 - 半透明淡蓝色
    ctx.globalAlpha = 0.7;
    drawPixelRect(screenX + 2, screenY - 20 + float, 8, 10, '#87ceeb');
    
    // 头部发光
    ctx.globalAlpha = 0.9;
    drawPixelRect(screenX + 4, screenY - 24 + float, 4, 4, '#add8e6');
    
    // 眼睛
    drawPixelRect(screenX + 3, screenY - 22 + float, 2, 2, '#000');
    drawPixelRect(screenX + 7, screenY - 22 + float, 2, 2, '#000');
    
    // 光芒效果
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#87ceeb';
    ctx.beginPath();
    ctx.arc(screenX + 8, screenY - 15 + float, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1.0;
}

// 蝴蝶精 - 像素风格
function drawPixelButterfly(screenX, screenY, animTime) {
    const flap = Math.sin(animTime * 8) * 0.3;
    const ps = 2;
    
    // 身体
    drawPixelRect(screenX + 4, screenY - 12, 2, 6, '#8b4513');
    
    // 触角
    drawPixelRect(screenX + 3, screenY - 16, 1, 2, '#8b4513');
    drawPixelRect(screenX + 6, screenY - 16, 1, 2, '#8b4513');
    
    // 左翅膀
    ctx.save();
    ctx.translate(screenX + 4, screenY - 10);
    ctx.rotate(-flap);
    drawPixelRect(-6, -4, 6, 8, '#ffb6c1');
    drawPixelRect(-4, -2, 3, 4, '#ffc0cb');
    ctx.restore();
    
    // 右翅膀
    ctx.save();
    ctx.translate(screenX + 4, screenY - 10);
    ctx.rotate(flap);
    drawPixelRect(0, -4, 6, 8, '#ffb6c1');
    drawPixelRect(3, -2, 3, 4, '#ffc0cb');
    ctx.restore();
}

// 蝙蝠 - 像素风格
function drawPixelBat(screenX, screenY, animTime) {
    const flap = Math.sin(animTime * 6) * 0.4;
    const ps = 2;
    
    // 身体
    drawPixelRect(screenX + 4, screenY - 10, 4, 6, '#4a0080');
    
    // 左翅膀
    ctx.save();
    ctx.translate(screenX + 4, screenY - 8);
    ctx.rotate(-flap);
    drawPixelRect(-8, -2, 8, 6, '#4b0082');
    drawPixelRect(-6, 0, 4, 3, '#6a0dad');
    ctx.restore();
    
    // 右翅膀
    ctx.save();
    ctx.translate(screenX + 4, screenY - 8);
    ctx.rotate(flap);
    drawPixelRect(0, -2, 8, 6, '#4b0082');
    drawPixelRect(2, 0, 4, 3, '#6a0dad');
    ctx.restore();
    
    // 眼睛 - 红色
    drawPixelRect(screenX + 3, screenY - 9, 2, 2, '#ff0000');
    drawPixelRect(screenX + 7, screenY - 9, 2, 2, '#ff0000');
}

// 毒蛇 - 像素风格
function drawPixelSnake(screenX, screenY, animTime) {
    const wave = Math.sin(animTime * 4) * 2;
    const ps = 2;
    
    // 身体 - 蜿蜒
    for (let i = 0; i < 6; i++) {
        const offset = Math.sin(animTime * 4 + i * 0.5) * wave;
        drawPixelRect(screenX + i * 3, screenY - 8 + offset, 3, 3, '#228b22');
    }
    
    // 头部
    drawPixelRect(screenX, screenY - 6, 4, 4, '#32cd32');
    
    // 眼睛
    drawPixelRect(screenX + 1, screenY - 7, 1, 1, '#ff0000');
    drawPixelRect(screenX + 3, screenY - 7, 1, 1, '#ff0000');
    
    // 舌头
    drawPixelRect(screenX - 3, screenY - 6, 2, 1, '#ff0000');
    drawPixelRect(screenX - 5, screenY - 7, 1, 1, '#ff0000');
}

// 骷髅 - 像素风格
function drawPixelSkeleton(screenX, screenY, animTime) {
    const ps = 2;
    
    // 头骨
    drawPixelRect(screenX + 2, screenY - 24, 8, 8, '#f5f5f5');
    
    // 眼窝
    drawPixelRect(screenX + 3, screenY - 22, 2, 2, '#000');
    drawPixelRect(screenX + 7, screenY - 22, 2, 2, '#000');
    
    // 鼻子
    drawPixelRect(screenX + 5, screenY - 20, 2, 1, '#000');
    
    // 身体
    drawPixelRect(screenX + 4, screenY - 16, 4, 8, '#f5f5f5');
    
    // 手臂 -举起
    drawPixelRect(screenX, screenY - 14, 3, 2, '#f5f5f5');
    drawPixelRect(screenX + 9, screenY - 14, 3, 2, '#f5f5f5');
    
    // 腿
    drawPixelRect(screenX + 3, screenY - 8, 2, 6, '#f5f5f5');
    drawPixelRect(screenX + 7, screenY - 8, 2, 6, '#f5f5f5');
}

// 魔藤 - 像素风格
function drawPixelVine(screenX, screenY, animTime) {
    const sway = Math.sin(animTime * 2) * 2;
    const ps = 2;
    
    // 藤蔓
    for (let i = 0; i < 5; i++) {
        const offset = Math.sin(animTime * 2 + i * 0.3) * sway;
        drawPixelRect(screenX + 4, screenY - i * 6, 4, 5, '#6b2d5e');
    }
    
    // 叶子
    drawPixelRect(screenX, screenY - 12 + sway, 3, 3, '#9b59b6');
    drawPixelRect(screenX + 9, screenY - 18 - sway, 3, 3, '#9b59b6');
    
    // 花朵
    drawPixelRect(screenX + 3, screenY - 28, 4, 4, '#e74c3c');
    drawPixelRect(screenX + 4, screenY - 27, 2, 2, '#f1c40f');
}

// 冰魔 - 像素风格
function drawPixelIceDevil(screenX, screenY, animTime) {
    const shimmer = Math.sin(animTime * 4) * 0.2 + 0.8;
    const ps = 2;
    
    // 身体 - 冰蓝色
    ctx.globalAlpha = shimmer;
    drawPixelRect(screenX + 2, screenY - 20, 8, 12, '#63b3ed');
    ctx.globalAlpha = 1.0;
    
    // 头部
    drawPixelRect(screenX + 3, screenY - 24, 6, 5, '#90cdf4');
    
    // 眼睛 - 深蓝色
    drawPixelRect(screenX + 3, screenY - 22, 2, 2, '#1a365d');
    drawPixelRect(screenX + 7, screenY - 22, 2, 2, '#1a365d');
    
    // 冰晶装饰
    const sparkle = Math.sin(animTime * 6) > 0;
    if (sparkle) {
        drawPixelRect(screenX, screenY - 28, 2, 2, '#fff');
        drawPixelRect(screenX + 10, screenY - 10, 2, 2, '#fff');
    }
}

// 远古巨魔(Boss) - 像素风格
function drawPixelBoss(screenX, screenY, animTime) {
    const breathe = Math.sin(animTime * 2) * 2;
    const ps = 2;
    
    // 身体 - 暗红色
    drawPixelRect(screenX, screenY - 40 + breathe, 16, 20, '#8b0000');
    
    // 头部
    drawPixelRect(screenX + 2, screenY - 52 + breathe, 12, 12, '#a52a2a');
    
    // 眼睛 - 红色发光
    drawPixelRect(screenX + 3, screenY - 48 + breathe, 3, 3, '#ff0000');
    drawPixelRect(screenX + 10, screenY - 48 + breathe, 3, 3, '#ff0000');
    
    // 獠牙
    drawPixelRect(screenX + 2, screenY - 40 + breathe, 2, 4, '#fff');
    drawPixelRect(screenX + 12, screenY - 40 + breathe, 2, 4, '#fff');
    
    // 角
    drawPixelRect(screenX, screenY - 56 + breathe, 2, 6, '#4a0000');
    drawPixelRect(screenX + 14, screenY - 56 + breathe, 2, 6, '#4a0000');
    
    // 光芒
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(screenX + 8, screenY - 30 + breathe, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
}
