// ===== v1.9.0 剧情系统 =====

// 剧情数据结构
const StoryData = {
    // 剧情触发器 - key 为距离
    triggers: {
        100: {
            id: "chapter1_intro",
            trigger: { distance: 100, condition: "first" },
            dialogues: [
                { speaker: "仙人", avatar: "xianren", text: "少年，我看你根骨清奇，乃是修仙的上佳之选。" },
                { speaker: "主角", avatar: "player", text: "前辈谬赞了，晚辈初入仙途，还请前辈指点。" },
                { speaker: "仙人", avatar: "xianren", text: "此地灵气充裕，正是修炼的绝佳之地。你且向前探索吧。" },
                { speaker: "主角", avatar: "player", text: "谨遵前辈教诲！" }
            ]
        },
        500: {
            id: "chapter2_encounter",
            trigger: { distance: 500, condition: "first" },
            dialogues: [
                { speaker: "山贼", avatar: "bandit", text: "此山是我开，此树是我栽，要想从此过，留下买路财！" },
                { speaker: "主角", avatar: "player", text: "光天化日之下，竟有此事？看剑！" },
                { speaker: "山贼", avatar: "bandit", text: "啊！少侠饶命，小的有眼不识泰山！" },
                { speaker: "主角", avatar: "player", text: "滚吧，下次别让我再看到你为非作歹。" }
            ]
        },
        1000: {
            id: "chapter3_treasure",
            trigger: { distance: 1000, condition: "first" },
            dialogues: [
                { speaker: "神秘声音", avatar: "mystery", text: "少年，你已通过考验。" },
                { speaker: "主角", avatar: "player", text: "是谁在说话？出来！" },
                { speaker: "神秘声音", avatar: "mystery", text: "我是此地的守护灵，见你心地善良，特赠予你一件宝物。" },
                { speaker: "主角", avatar: "player", text: "多谢前辈厚爱，晚辈定当好好使用。" }
            ]
        }
    },
    
    // 已触发的剧情记录
    triggeredStories: {},
    
    // 角色头像颜色配置
    avatarColors: {
        xianren: { bg: '#9b59b6', border: '#8e44ad' },
        player: { bg: '#3498db', border: '#2980b9' },
        bandit: { bg: '#e74c3c', border: '#c0392b' },
        mystery: { bg: '#34495e', border: '#2c3e50' },
        boss: { bg: '#e67e22', border: '#d35400' }
    }
};

// 剧情系统状态
const storySystem = {
    active: false,
    currentStory: null,
    currentDialogueIndex: 0,
    dialogueText: '',
    typewriterIndex: 0,
    typewriterTimer: null,
    typewriterSpeed: 30, // 毫秒/字符
    
    // 初始化
    init() {
        this.active = false;
        this.currentStory = null;
        this.currentDialogueIndex = 0;
        this.dialogueText = '';
        this.typewriterIndex = 0;
        if (this.typewriterTimer) {
            clearInterval(this.typewriterTimer);
            this.typewriterTimer = null;
        }
    },
    
    // 检查是否触发剧情
    checkTrigger(distance) {
        // 遍历所有触发器
        for (const [triggerDistance, story] of Object.entries(StoryData.triggers)) {
            const dist = parseInt(triggerDistance);
            if (distance >= dist) {
                // 检查是否首次触发
                const storyKey = story.id;
                if (!StoryData.triggeredStories[storyKey]) {
                    // 标记为已触发
                    StoryData.triggeredStories[storyKey] = true;
                    // 触发剧情
                    this.startStory(story);
                    return true;
                }
            }
        }
        return false;
    },
    
    // 开始剧情
    startStory(story) {
        this.active = true;
        this.currentStory = story;
        this.currentDialogueIndex = 0;
        this.startTypewriter();
        
        // 暂停游戏
        game.paused = true;
    },
    
    // 打字机效果
    startTypewriter() {
        const currentDialogue = this.currentStory.dialogues[this.currentDialogueIndex];
        this.dialogueText = '';
        this.typewriterIndex = 0;
        
        if (this.typewriterTimer) {
            clearInterval(this.typewriterTimer);
        }
        
        this.typewriterTimer = setInterval(() => {
            if (this.typewriterIndex < currentDialogue.text.length) {
                this.dialogueText += currentDialogue.text[this.typewriterIndex];
                this.typewriterIndex++;
            } else {
                clearInterval(this.typewriterTimer);
                this.typewriterTimer = null;
            }
        }, this.typewriterSpeed);
    },
    
    // 跳过打字机效果，直接显示完整文本
    skipTypewriter() {
        if (this.typewriterTimer) {
            clearInterval(this.typewriterTimer);
            this.typewriterTimer = null;
        }
        const currentDialogue = this.currentStory.dialogues[this.currentDialogueIndex];
        this.dialogueText = currentDialogue.text;
        this.typewriterIndex = currentDialogue.text.length;
    },
    
    // 继续下一句对话
    continueDialogue() {
        // 如果打字机效果还没完成，直接显示完整文本
        if (this.typewriterIndex < this.currentStory.dialogues[this.currentDialogueIndex].text.length) {
            this.skipTypewriter();
            return;
        }
        
        this.currentDialogueIndex++;
        
        // 检查是否还有更多对话
        if (this.currentDialogueIndex >= this.currentStory.dialogues.length) {
            this.endStory();
        } else {
            this.startTypewriter();
        }
    },
    
    // 跳过剧情
    skipStory() {
        this.endStory();
    },
    
    // 结束剧情
    endStory() {
        if (this.typewriterTimer) {
            clearInterval(this.typewriterTimer);
            this.typewriterTimer = null;
        }
        
        this.init();
        
        // 恢复游戏
        if (game.paused) {
            game.paused = false;
            game.lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        }
    },
    
    // 更新
    update(dt) {
        // 剧情系统不需要每帧更新逻辑
    },
    
    // 绘制
    draw() {
        if (!this.active || !this.currentStory) return;
        
        const currentDialogue = this.currentStory.dialogues[this.currentDialogueIndex];
        const totalDialogues = this.currentStory.dialogues.length;
        
        // 半透明背景遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
        
        // 对话框容器
        const panelWidth = CONFIG.width * 0.8;
        const panelHeight = 200;
        const panelX = (CONFIG.width - panelWidth) / 2;
        const panelY = CONFIG.height - panelHeight - 50;
        
        // 对话框背景
        ctx.fillStyle = 'rgba(20, 20, 40, 0.95)';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 15);
        ctx.fill();
        ctx.stroke();
        
        // 角色头像区域
        const avatarSize = 80;
        const avatarX = panelX + 20;
        const avatarY = panelY + 20;
        
        // 头像背景
        const avatarColor = StoryData.avatarColors[currentDialogue.avatar] || StoryData.avatarColors.player;
        ctx.fillStyle = avatarColor.bg;
        ctx.strokeStyle = avatarColor.border;
        ctx.lineWidth = 4;
        roundRect(ctx, avatarX, avatarY, avatarSize, avatarSize, 10);
        ctx.fill();
        ctx.stroke();
        
        // 角色名
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 24px Microsoft YaHei';
        ctx.textAlign = 'left';
        ctx.fillText(currentDialogue.speaker, avatarX + avatarSize + 20, avatarY + 30);
        
        // 对话进度
        ctx.fillStyle = '#aaa';
        ctx.font = '16px Microsoft YaHei';
        ctx.fillText(`${this.currentDialogueIndex + 1}/${totalDialogues}`, panelX + panelWidth - 80, avatarY + 30);
        
        // 对话文本（打字机效果）
        ctx.fillStyle = '#fff';
        ctx.font = '20px Microsoft YaHei';
        ctx.textAlign = 'left';
        
        // 文本换行处理
        const maxTextWidth = panelWidth - avatarSize - 60;
        const lines = this.wrapText(ctx, this.dialogueText, maxTextWidth);
        let textY = avatarY + 60;
        lines.forEach(line => {
            ctx.fillText(line, avatarX + avatarSize + 20, textY);
            textY += 28;
        });
        
        // 底部提示
        ctx.fillStyle = '#888';
        ctx.font = '14px Microsoft YaHei';
        ctx.textAlign = 'center';
        const hintText = this.typewriterIndex < currentDialogue.text.length ? '点击跳过打字 / 点击继续' : '点击继续 / 点击按钮跳过';
        ctx.fillText(hintText, CONFIG.width / 2, panelY + panelHeight - 15);
        
        // 跳过按钮
        const skipBtnWidth = 80;
        const skipBtnHeight = 30;
        const skipBtnX = panelX + panelWidth - skipBtnWidth - 10;
        const skipBtnY = panelY + 10;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        roundRect(ctx, skipBtnX, skipBtnY, skipBtnWidth, skipBtnHeight, 5);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#fff';
        ctx.font = '14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('跳过', skipBtnX + skipBtnWidth / 2, skipBtnY + 20);
        
        ctx.textAlign = 'left';
    },
    
    // 文本换行辅助函数
    wrapText(ctx, text, maxWidth) {
        const lines = [];
        let currentLine = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    },
    
    // 处理点击
    handleClick(clickX, clickY) {
        if (!this.active) return false;
        
        const panelWidth = CONFIG.width * 0.8;
        const panelHeight = 200;
        const panelX = (CONFIG.width - panelWidth) / 2;
        const panelY = CONFIG.height - panelHeight - 50;
        
        // 检查是否点击了跳过按钮
        const skipBtnWidth = 80;
        const skipBtnHeight = 30;
        const skipBtnX = panelX + panelWidth - skipBtnWidth - 10;
        const skipBtnY = panelY + 10;
        
        if (clickX >= skipBtnX && clickX <= skipBtnX + skipBtnWidth &&
            clickY >= skipBtnY && clickY <= skipBtnY + skipBtnHeight) {
            this.skipStory();
            return true;
        }
        
        // 点击对话框区域继续对话
        if (clickX >= panelX && clickX <= panelX + panelWidth &&
            clickY >= panelY && clickY <= panelY + panelHeight) {
            this.continueDialogue();
            return true;
        }
        
        return true;
    }
};

// 圆角矩形辅助函数
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// 更新剧情系统
function updateStories(dt) {
    if (storySystem.active) {
        storySystem.update(dt);
    }
}

// 绘制剧情系统
function drawStories() {
    if (storySystem.active) {
        storySystem.draw();
    }
}
