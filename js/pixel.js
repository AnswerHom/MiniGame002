// v2.5.0: 主角形象重构 - 精致像素仙侠角色
const pixelPlayer = {
    pixelSize: 3,  // 更大的像素，更清晰的轮廓
    colors: {
        skin: '#ffdab9',      // 肤色 - 桃花玉面
        hair: '#2c1810',       // 头发 - 墨黑色
        robe: '#4169e1',       // 袍服 - 宝蓝色
        robeDark: '#2e4a9e',   // 袍服阴影
        accent: '#ffd700',     // 装饰 - 金色
        belt: '#8b4513',      // 腰带 - 棕色
        hairpin: '#c0c0c0',   // 发簪 - 银色
        eye: '#1a1a1a',       // 眼睛
    },
    drawPixelRect(x, y, w, h, c) {
        ctx.fillStyle = c;
        for (let dx = 0; dx < w; dx++) {
            for (let dy = 0; dy < h; dy++) {
                ctx.fillRect(x + dx * this.pixelSize, y + dy * this.pixelSize, this.pixelSize, this.pixelSize);
            }
        }
    },
    draw(screenX, screenY, idleTime, attacking) {
        const ps = this.pixelSize;
        const bob = Math.sin(idleTime * 2.5) * ps * 0.5;
        const breathe = Math.sin(idleTime * 1.5) * 1;
        
        // ========== 头部区域 ==========
        // 刘海
        this.drawPixelRect(screenX + 2, screenY - 54 + bob, 10, 2, this.colors.hair);
        this.drawPixelRect(screenX, screenY - 52 + bob, 2, 4, this.colors.hair);
        this.drawPixelRect(screenX + 12, screenY - 52 + bob, 2, 4, this.colors.hair);
        
        // 头顶发髻
        this.drawPixelRect(screenX + 4, screenY - 58 + bob, 6, 2, this.colors.hair);
        this.drawPixelRect(screenX + 3, screenY - 60 + bob, 8, 2, this.colors.hair);
        
        // 发簪 - 金色
        this.drawPixelRect(screenX + 5, screenY - 64 + bob, 4, 2, this.colors.accent);
        this.drawPixelRect(screenX + 4, screenY - 66 + bob, 2, 2, this.colors.accent);
        
        // 脸部
        this.drawPixelRect(screenX + 2, screenY - 50 + bob, 10, 4, this.colors.skin);
        
        // 眼睛
        this.drawPixelRect(screenX + 3, screenY - 49 + bob, 2, 2, this.colors.eye);
        this.drawPixelRect(screenX + 9, screenY - 49 + bob, 2, 2, this.colors.eye);
        
        // 眼睛高光
        ctx.fillStyle = '#fff';
        ctx.fillRect(screenX + 3 * ps + 1, screenY - 49 * ps + bob + 1, ps * 0.5, ps * 0.5);
        ctx.fillRect(screenX + 9 * ps + 1, screenY - 49 * ps + bob + 1, ps * 0.5, ps * 0.5);
        
        // 眉毛
        this.drawPixelRect(screenX + 3, screenY - 51 + bob, 2, 1, this.colors.hair);
        this.drawPixelRect(screenX + 9, screenY - 51 + bob, 2, 1, this.colors.hair);
        
        // 嘴巴
        this.drawPixelRect(screenX + 5, screenY - 46 + bob, 4, 1, '#e8a0a0');
        
        // ========== 身体区域 ==========
        // 衣领
        this.drawPixelRect(screenX + 2, screenY - 44 + bob, 10, 2, this.colors.accent);
        
        // 袍服主体
        this.drawPixelRect(screenX, screenY - 42 + bob, 14, 14, this.colors.robe);
        this.drawPixelRect(screenX + 2, screenY - 40 + bob, 10, 10, this.colors.robeDark);
        
        // 金色花纹
        this.drawPixelRect(screenX + 4, screenY - 38 + bob, 2, 2, this.colors.accent);
        this.drawPixelRect(screenX + 8, screenY - 38 + bob, 2, 2, this.colors.accent);
        
        // 腰带
        this.drawPixelRect(screenX, screenY - 30 + bob, 14, 2, this.colors.belt);
        // 腰扣
        this.drawPixelRect(screenX + 5, screenY - 30 + bob, 4, 2, this.colors.accent);
        
        // ========== 手臂 ==========
        // 左臂
        this.drawPixelRect(screenX - 2, screenY - 40 + bob, 2, 10, this.colors.robe);
        this.drawPixelRect(screenX - 4, screenY - 36 + bob, 2, 6, this.colors.skin);
        
        // 右臂 - 如果没拿武器
        if (!attacking) {
            this.drawPixelRect(screenX + 16, screenY - 40 + bob, 2, 10, this.colors.robe);
            this.drawPixelRect(screenX + 18, screenY - 36 + bob, 2, 6, this.colors.skin);
        }
        
        // ========== 下摆 ==========
        this.drawPixelRect(screenX, screenY - 28 + bob, 14, 10, this.colors.robe);
        this.drawPixelRect(screenX + 2, screenY - 26 + bob, 10, 6, this.colors.robeDark);
        
        // ========== 腿部 ==========
        this.drawPixelRect(screenX + 2, screenY - 18 + bob, 4, 8, this.colors.belt);
        this.drawPixelRect(screenX + 8, screenY - 18 + bob, 4, 8, this.colors.belt);
        
        // 鞋子
        this.drawPixelRect(screenX, screenY - 10 + bob, 6, 2, this.colors.belt);
        this.drawPixelRect(screenX + 8, screenY - 10 + bob, 6, 2, this.colors.belt);
        
        // ========== 武器 ==========
        if (attacking) {
            // 攻击姿态 - 剑举过头顶
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(screenX + 20, screenY - 50 + bob, ps * 2, ps * 8);
            ctx.fillStyle = '#fff';
            ctx.fillRect(screenX + 20 + ps * 0.5, screenY - 50 + bob, ps, ps * 7);
        } else {
            // 剑 - 身体右侧
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(screenX + 16, screenY - 30 + bob, ps * 2, ps * 3);
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(screenX + 16 + ps * 0.5, screenY - 50 + bob, ps, ps * 20);
            ctx.fillStyle = '#fff';
            ctx.fillRect(screenX + 16 + ps * 0.7, screenY - 48 + bob, ps * 0.5, ps * 18);
        }
        
        // ========== 特效 ==========
        // 仙气环绕
        ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
        for (let i = 0; i < 4; i++) {
            const angle = idleTime * 2 + i * 1.5;
            const radius = 15 + Math.sin(idleTime * 3 + i) * 5;
            const px = screenX + 7 + Math.cos(angle) * radius;
            const py = screenY - 35 + bob + Math.sin(angle) * radius;
            ctx.beginPath();
            ctx.arc(px, py, 2 + i * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 呼吸效果 - 身体微微发光
        if (breathe > 0.5) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
            ctx.beginPath();
            ctx.ellipse(screenX + 7, screenY - 30 + bob, 10, 15, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};

// 替换 player.draw 方法
player.draw = function() {
    const screenX = this.x - CONFIG.cameraOffset;
    const screenY = this.y + this.idleFloatOffset;
    
    pixelPlayer.draw(screenX, screenY, this.idleTime, this.attacking);
    
    // 血条
    ctx.fillStyle = '#333';
    ctx.fillRect(screenX + 2, screenY - this.height - 4, 20, 3);
    ctx.fillStyle = '#44ff44';
    ctx.fillRect(screenX + 2, screenY - this.height - 4, 20 * (this.hp / this.maxHp), 3);
    
    ctx.globalAlpha = 1.0;
};
