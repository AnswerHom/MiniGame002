// ===== v1.5.2 UI布局与交互规范 =====

// 安全区定义
const UI_SAFE_ZONE = {
    top: 20,       // 顶部安全边距
    bottom: 100,   // 底部安全边距（预留操作区）
    left: 20,      // 左侧安全边距
    right: 20      // 右侧安全边距
};

// 交互优化常量
const UI_INTERACTION = {
    minButtonSize: 44,      // 最小按钮尺寸 44px
    buttonSpacing: 20,      // 按钮间距 20px（防误触）
    feedbackTime: 100,      // 反馈时间 100ms
    clickPadding: 10        // 点击区域扩展 padding
};

// 层级分离定义
const UI_LAYERS = {
    SCENE: 0,        // 游戏场景、背景
    MIDDLE: 10,      // 角色、怪物、UI背景
    TOP: 100         // 交互按钮、弹窗、伤害数字
};

// 状态面板（左上角）
function getStatusPanelPos() {
    return {
        x: UI_SAFE_ZONE.left,
        y: UI_SAFE_ZONE.top
    };
}

// 状态面板尺寸
function getStatusPanelSize() {
    return {
        width: 200,
        height: 130
    };
}

// 战斗统计面板（右上角）
function getStatsPanelPos() {
    return {
        x: CONFIG.width - UI_SAFE_ZONE.right - 150,
        y: UI_SAFE_ZONE.top
    };
}

// 右侧按钮组（右上角）
function getRightButtonsStartPos() {
    return {
        x: CONFIG.width - UI_SAFE_ZONE.right - UI_INTERACTION.minButtonSize,
        y: UI_SAFE_ZONE.top
    };
}

// 动作面板（左下角）
function getActionPanelPos() {
    return {
        x: UI_SAFE_ZONE.left,
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
