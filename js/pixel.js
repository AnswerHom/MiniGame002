// v2.4.0: 像素风格仙侠角色绘制模块
// 替换 player.draw() 的绘制逻辑

const pixelPlayer = {
    pixelSize: 2,
    colors: {
        skin: '#f5d0c5',
        hair: '#1a1a2e',
        robe: '#e8f4f8',
        accent: '#81e6d9',
        belt: '#2d3748',
        hairpin: '#8b4513',
        eye: '#1a202c',
    },
    drawPixelRect(x, y, w, h, c) {
        ctx.fillStyle = c;
        for (let dx = 0; dx < w; dx++) {
            for (let dy = 0; dy < h; dy++) {
                ctx.fillRect(x + dx * this.pixelSize, y + dy * this.pixelSize, this.pixelSize, this.pixelSize);
            }
        }
    },
    draw(screenX, screenY, idleTime) {
        const ps = this.pixelSize;
        const bob = Math.sin(idleTime * 2) * ps;
        
        // 头部 - 头发
        this.drawPixelRect(screenX + 4, screenY - 48 + bob, 8, 3, this.colors.hair);
        this.drawPixelRect(screenX + 2, screenY - 46 + bob, 2, 4, this.colors.hair);
        this.drawPixelRect(screenX + 12, screenY - 46 + bob, 2, 4, this.colors.hair);
        
        // 发簪
        this.drawPixelRect(screenX + 6, screenY - 50 + bob, 2, 2, this.colors.hairpin);
        
        // 脸部
        this.drawPixelRect(screenX + 4, screenY - 44 + bob, 8, 4, this.colors.skin);
        
        // 眼睛
        this.drawPixelRect(screenX + 5, screenY - 43 + bob, 2, 1, this.colors.eye);
        this.drawPixelRect(screenX + 9, screenY - 43 + bob, 2, 1, this.colors.eye);
        
        // 身体 - 仙侠袍服
        this.drawPixelRect(screenX + 2, screenY - 40 + bob, 12, 12, this.colors.robe);
        
        // 腰带
        this.drawPixelRect(screenX + 2, screenY - 30 + bob, 12, 2, this.colors.belt);
        this.drawPixelRect(screenX + 6, screenY - 30 + bob, 4, 3, this.colors.accent);
        
        // 衣袖
        this.drawPixelRect(screenX, screenY - 38 + bob, 2, 8, this.colors.robe);
        this.drawPixelRect(screenX + 14, screenY - 38 + bob, 2, 8, this.colors.robe);
        
        // 下摆
        this.drawPixelRect(screenX + 2, screenY - 28 + bob, 12, 8, this.colors.robe);
        
        // 腿部
        this.drawPixelRect(screenX + 4, screenY - 20 + bob, 4, 8, this.colors.belt);
        this.drawPixelRect(screenX + 10, screenY - 20 + bob, 4, 8, this.colors.belt);
        
        // 鞋子
        this.drawPixelRect(screenX + 2, screenY - 12 + bob, 6, 2, this.colors.belt);
        this.drawPixelRect(screenX + 10, screenY - 12 + bob, 6, 2, this.colors.belt);
        
        // 仙气环绕效果
        const sp = Math.sin(idleTime * 3) * 2;
        ctx.fillStyle = 'rgba(129,230,217,0.3)';
        for (let i = 0; i < 3; i++) {
            const px = screenX + 8 + Math.sin(idleTime * 2 + i) * 8;
            const py = screenY - 30 + bob + i * 8 + sp;
            ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI*2); ctx.fill();
        }
    }
};

// 替换 player.draw 方法
const originalDraw = player.draw;
player.draw = function() {
    const screenX = this.x - CONFIG.cameraOffset;
    const screenY = this.y + this.idleFloatOffset;
    
    // 使用像素风格绘制
    pixelPlayer.draw(screenX, screenY, this.idleTime);
    
    // 血条
    ctx.fillStyle = '#333';
    ctx.fillRect(screenX + 4, screenY - this.height - 8, 24, 4);
    ctx.fillStyle = '#44ff44';
    ctx.fillRect(screenX + 4, screenY - this.height - 8, 24 * (this.hp / this.maxHp), 4);
    
    ctx.globalAlpha = 1.0;
};
