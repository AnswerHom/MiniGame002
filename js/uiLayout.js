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
        x: CONFIG.width - UI_SAFE_ZONE.right - UI_INTERACTION.minHitArea,
        y: UI_SAFE_ZONE.top + 5 + 60  // 状态栏高度 + 间距，紧凑排列
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
