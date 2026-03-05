// ===== v1.6.0 UI布局与交互规范 =====

// v1.6.0: 优化安全区定义，解决UI重叠问题
const UI_SAFE_ZONE = {
    top: 15,       // 顶部安全边距（紧凑）
    bottom: 80,   // 底部安全边距（预留操作区）
    left: 15,      // 左侧安全边距
    right: 15      // 右侧安全边距
};

// 交互优化常量
const UI_INTERACTION = {
    minButtonSize: 44,      // 最小按钮尺寸 44px
    buttonSpacing: 20,      // 按钮间距 20px（防误触）
    feedbackTime: 100,      // 反馈时间 100ms
    clickPadding: 10        // 点击区域扩展 padding
};

// v1.6.0: 层级分离定义（优化）
const UI_LAYERS = {
    SCENE: 0,        // 游戏场景、背景、血条
    MIDDLE: 10,      // 角色、怪物
    UI_BASE: 50,     // 基础UI信息（境界、等级等）
    UI_COMBAT: 60,   // 战斗信息（击杀、伤害等）
    UI_BUTTONS: 70,  // 交互按钮
    UI_POPUP: 100,   // 弹窗、遮罩
    UI_FEEDBACK: 110 // 飘字、反馈
};

// v1.6.0: 四角定位 - 状态栏位置（左上角）
function getStatusPanelPos() {
    return {
        x: UI_SAFE_ZONE.left + 5,
        y: UI_SAFE_ZONE.top + 5
    };
}

// v1.6.0: 状态栏尺寸（紧凑排列）
function getStatusPanelSize() {
    return {
        width: 180,
        height: 110
    };
}

// v1.6.0: 战斗信息面板位置（右上角）
function getStatsPanelPos() {
    return {
        x: CONFIG.width - UI_SAFE_ZONE.right - 160,
        y: UI_SAFE_ZONE.top + 5
    };
}

// v1.6.0: 右侧按钮组位置（右上角，战斗信息下方）
function getRightButtonsStartPos() {
    return {
        x: CONFIG.width - UI_SAFE_ZONE.right - UI_INTERACTION.minButtonSize,
        y: UI_SAFE_ZONE.top + 5 + 100  // 状态栏高度 + 间距
    };
}

// v1.6.0: 动作面板位置（左下角）
function getActionPanelPos() {
    return {
        x: UI_SAFE_ZONE.left + 5,
        y: CONFIG.height - UI_SAFE_ZONE.bottom - UI_INTERACTION.minButtonSize
    };
}

// 获取扩展的点击区域（用于碰撞检测）
function getExpandedHitArea(x, y, width, height) {
    const padding = UI_INTERACTION.clickPadding;
    return {
        x: x - padding,
        y: y - padding,
        width: width + padding * 2,
        height: height + padding * 2
    };
}

// 点击检测（支持扩展区域）
function isPointInButton(px, py, button) {
    const expanded = getExpandedHitArea(button.x, button.y, button.width, button.height);
    return px >= expanded.x &&
           px <= expanded.x + expanded.width &&
           py >= expanded.y &&
           py <= expanded.y + expanded.height;
}

// 按钮点击反馈效果
function createButtonFeedback(button) {
    return {
        x: button.x,
        y: button.y,
        width: button.width,
        height: button.height,
        startTime: Date.now(),
        duration: UI_INTERACTION.feedbackTime
    };
}

// 绘制带反馈的按钮
function drawButtonWithFeedback(ctx, button, feedback) {
    // 计算按钮颜色（如果有反馈则闪烁）
    let bgColor = button.bgColor;
    let scale = 1;
    
    if (feedback) {
        const elapsed = Date.now() - feedback.startTime;
        if (elapsed < feedback.duration) {
            // 反馈动画：轻微放大 + 颜色变亮
            scale = 1 + (1 - elapsed / feedback.duration) * 0.1;
            bgColor = button.hoverColor || button.bgColor;
        }
    }
    
    const centerX = button.x + button.width / 2;
    const centerY = button.y + button.height / 2;
    const scaledWidth = button.width * scale;
    const scaledHeight = button.height * scale;
    const drawX = centerX - scaledWidth / 2;
    const drawY = centerY - scaledHeight / 2;
    
    // 绘制按钮背景
    ctx.fillStyle = bgColor;
    ctx.fillRect(drawX, drawY, scaledWidth, scaledHeight);
    
    // 绘制按钮边框
    ctx.strokeStyle = button.borderColor || '#718096';
    ctx.lineWidth = 2;
    ctx.strokeRect(drawX, drawY, scaledWidth, scaledHeight);
    
    // 绘制按钮文字/图标
    if (button.text) {
        ctx.fillStyle = button.textColor || '#fff';
        ctx.font = button.font || '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(button.text, centerX, centerY + 6);
        ctx.textAlign = 'left';
    }
    
    if (button.icon) {
        ctx.fillStyle = button.textColor || '#fff';
        ctx.font = button.font || '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(button.icon, centerX, centerY + 6);
        ctx.textAlign = 'left';
    }
}

// 验证按钮尺寸是否符合规范
function validateButtonSize(width, height) {
    const minSize = UI_INTERACTION.minButtonSize;
    return width >= minSize && height >= minSize;
}

// 验证按钮间距
function validateButtonSpacing(buttons) {
    const minSpacing = UI_INTERACTION.buttonSpacing;
    for (let i = 0; i < buttons.length; i++) {
        for (let j = i + 1; j < buttons.length; j++) {
            const btn1 = buttons[i];
            const btn2 = buttons[j];
            
            // 计算中心点距离
            const center1X = btn1.x + btn1.width / 2;
            const center1Y = btn1.y + btn1.height / 2;
            const center2X = btn2.x + btn2.width / 2;
            const center2Y = btn2.y + btn2.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(center2X - center1X, 2) +
                Math.pow(center2Y - center1Y, 2)
            );
            
            if (distance < minSpacing) {
                return false;
            }
        }
    }
    return true;
}
