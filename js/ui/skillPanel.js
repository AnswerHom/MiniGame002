// ===== v1.8.0 技能界面 =====

// 技能界面状态
const skillPanel = {
    isOpen: false,
    selectedSkill: null,
    currentTab: 'learned'  // 'learned' | 'available'
};

// 打开技能面板
function openSkillPanel() {
    skillPanel.isOpen = true;
    skillPanel.selectedSkill = null;
    skillPanel.currentTab = 'learned';
}

// 关闭技能面板
function closeSkillPanel() {
    skillPanel.isOpen = false;
    skillPanel.selectedSkill = null;
}

// 切换技能面板
function toggleSkillPanel() {
    if (skillPanel.isOpen) {
        closeSkillPanel();
    } else {
        openSkillPanel();
    }
}

// 处理技能面板点击
function handleSkillPanelClick(clickX, clickY) {
    const panelWidth = 420;
    const panelHeight = 480;
    const panelX = (CONFIG.width - panelWidth) / 2;
    const panelY = (CONFIG.height - panelHeight) / 2;
    
    // 检查是否点击了关闭按钮
    const closeBtnX = panelX + panelWidth - 40;
    const closeBtnY = panelY + 10;
    const closeBtnSize = 30;
    
    if (clickX >= closeBtnX && clickX <= closeBtnX + closeBtnSize && 
        clickY >= closeBtnY && clickY <= closeBtnY + closeBtnSize) {
        closeSkillPanel();
        return;
    }
    
    // 检查 Tab 点击
    const tabWidth = (panelWidth - 40) / 2;
    const tabY = panelY + 60;
    
    // 已学技能 Tab
    if (clickX >= panelX + 20 && clickX <= panelX + 20 + tabWidth &&
        clickY >= tabY && clickY <= tabY + 35) {
        skillPanel.currentTab = 'learned';
        return;
    }
    
    // 可解锁 Tab
    if (clickX >= panelX + 20 + tabWidth + 5 && clickX <= panelX + 20 + tabWidth + 5 + tabWidth &&
        clickY >= tabY && clickY <= tabY + 35) {
        skillPanel.currentTab = 'available';
        return;
    }
    
    // 检查技能列表点击
    const listY = tabY + 45;
    const listHeight = panelHeight - 120;
    
    // 遍历所有技能点击区域
    const skills = skillPanel.currentTab === 'learned' ? getLearnedSkills() : getUnlockableSkills();
    
    skills.forEach(skill => {
        const skillBtn = game.uiButtons['skill_' + skill.id];
        if (skillBtn) {
            if (clickX >= skillBtn.x && clickX <= skillBtn.x + skillBtn.width &&
                clickY >= skillBtn.y && clickY <= skillBtn.y + skillBtn.height) {
                skillPanel.selectedSkill = skill.id;
                
                // 检查是否有操作按钮
                if (skillPanel.currentTab === 'learned') {
                    const level = playerSkills.skillLevels[skill.id] || 1;
                    const btnWidth = 140;
                    const btnGap = 10;
                    const actionBtnWidth = (420 - 50 - btnGap * 2) / 2;
                    
                    // 检查升级按钮
                    if (level < skill.maxLevel) {
                        const upgradeBtnX = panelX + 20 + (panelWidth - 40) / 2 - actionBtnWidth / 2;
                        const upgradeBtnY = listY + listHeight - 40;
                        
                        if (clickX >= upgradeBtnX && clickX <= upgradeBtnX + actionBtnWidth &&
                            clickY >= upgradeBtnY && clickY <= upgradeBtnY + 30) {
                            upgradeSkill(skill.id);
                            return;
                        }
                    }
                    
                    // 主动技能操作按钮
                    if (skill.type === SKILL_TYPES.ACTIVE) {
                        const equipBtnX = panelX + 25;
                        const equipBtnWidth = actionBtnWidth;
                        const btnY = listY + listHeight - 45;
                        
                        // 装备/收起按钮
                        if (clickX >= equipBtnX && clickX <= equipBtnX + equipBtnWidth &&
                            clickY >= btnY && clickY <= btnY + 30) {
                            toggleActiveSkill(skill.id);
                            return;
                        }
                        
                        // 使用按钮
                        const useBtnX = panelX + 25 + equipBtnWidth + 10;
                        if (clickX >= useBtnX && clickX <= useBtnX + equipBtnWidth &&
                            clickY >= btnY && clickY <= btnY + 30) {
                            useActiveSkill(skill.id);
                            return;
                        }
                    }
                } else {
                    // 可解锁 Tab - 检查学习按钮
                    if (!playerSkills.learned.includes(skill.id)) {
                        const learnBtnX = panelX + 20 + (panelWidth - 40) / 2 - 70;
                        const learnBtnY = listY + listHeight - 45;
                        
                        if (clickX >= learnBtnX && clickX <= learnBtnX + 140 &&
                            clickY >= learnBtnY && clickY <= learnBtnY + 35) {
                            learnSkill(skill.id);
                            return;
                        }
                    }
                }
                return;
            }
        }
    });
}

// 绘制技能按钮 - 入口
function drawSkillButton() {
    const btnPos = getRightButtonsStartPos();
    const btnX = btnPos.x;
    const btnY = btnPos.y + (UI_INTERACTION.minButtonSize + UI_INTERACTION.buttonSpacing) * 5;  // 第6个按钮
    const btnSize = UI_INTERACTION.minButtonSize;  // 44px
    
    // 按钮背景
    ctx.fillStyle = skillPanel.isOpen ? '#f6ad55' : '#4a5568';
    ctx.fillRect(btnX, btnY, btnSize, btnSize);
    
    // 按钮边框
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnSize, btnSize);
    
    // 技能图标
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✨', btnX + btnSize/2, btnY + btnSize/2 + 6);
    ctx.textAlign = 'left';
    
    // 记录按钮区域供点击检测
    game.uiButtons = game.uiButtons || {};
    game.uiButtons.skill = { x: btnX, y: btnY, width: btnSize, height: btnSize, bgColor: '#4a5568', icon: '✨' };
}

// 绘制技能界面
function drawSkillPanelUI() {
    if (!skillPanel.isOpen) return;
    
    // 半透明遮罩背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    // 面板参数
    const panelWidth = 420;
    const panelHeight = 480;
    const panelX = (CONFIG.width - panelWidth) / 2;
    const panelY = (CONFIG.height - panelHeight) / 2;
    
    // 面板背景
    ctx.fillStyle = '#1a202c';
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 10);
    ctx.fill();
    ctx.stroke();
    
    // 标题栏
    ctx.fillStyle = '#2d3748';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, 50, [10, 10, 0, 0]);
    ctx.fill();
    
    // 标题文字
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('技能系统', panelX + panelWidth / 2, panelY + 32);
    ctx.textAlign = 'left';
    
    // 关闭按钮
    const closeBtnX = panelX + panelWidth - 40;
    const closeBtnY = panelY + 10;
    const closeBtnSize = 30;
    ctx.fillStyle = '#e53e3e';
    ctx.beginPath();
    ctx.arc(closeBtnX + closeBtnSize/2, closeBtnY + closeBtnSize/2, closeBtnSize/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('×', closeBtnX + closeBtnSize/2, closeBtnY + closeBtnSize/2 + 6);
    ctx.textAlign = 'left';
    
    // 记录关闭按钮区域
    game.uiButtons = game.uiButtons || {};
    game.uiButtons.skillClose = { 
        x: closeBtnX, y: closeBtnY, 
        width: closeBtnSize, height: closeBtnSize, 
        action: 'closeSkillPanel' 
    };
    
    // Tab 切换
    const tabWidth = (panelWidth - 40) / 2;
    const tabY = panelY + 60;
    
    // 已学技能 Tab
    ctx.fillStyle = skillPanel.currentTab === 'learned' ? '#4299e1' : '#4a5568';
    ctx.beginPath();
    ctx.roundRect(panelX + 20, tabY, tabWidth, 35, [5, 5, 0, 0]);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '14px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('已学技能 (' + getLearnedSkills().length + ')', panelX + 20 + tabWidth/2, tabY + 23);
    
    // 可解锁 Tab
    const availableSkills = getUnlockableSkills();
    ctx.fillStyle = skillPanel.currentTab === 'available' ? '#48bb78' : '#4a5568';
    ctx.beginPath();
    ctx.roundRect(panelX + 20 + tabWidth + 5, tabY, tabWidth, 35, [5, 5, 0, 0]);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('可解锁 (' + availableSkills.length + ')', panelX + 20 + tabWidth + 5 + tabWidth/2, tabY + 23);
    ctx.textAlign = 'left';
    
    // 记录 Tab 区域
    game.uiButtons.skillTabLearned = { 
        x: panelX + 20, y: tabY, 
        width: tabWidth, height: 35, 
        action: () => { skillPanel.currentTab = 'learned'; }
    };
    game.uiButtons.skillTabAvailable = { 
        x: panelX + 20 + tabWidth + 5, y: tabY, 
        width: tabWidth, height: 35, 
        action: () => { skillPanel.currentTab = 'available'; }
    };
    
    // 技能列表区域
    const listY = tabY + 45;
    const listHeight = panelHeight - 120;
    
    // 背景
    ctx.fillStyle = '#2d3748';
    ctx.beginPath();
    ctx.roundRect(panelX + 20, listY, panelWidth - 40, listHeight, 5);
    ctx.fill();
    
    // 显示技能列表
    if (skillPanel.currentTab === 'learned') {
        drawLearnedSkills(panelX + 25, listY, panelWidth - 50, listHeight);
    } else {
        drawAvailableSkills(panelX + 25, listY, panelWidth - 50, listHeight);
    }
}

// 绘制已学技能列表
function drawLearnedSkills(x, y, width, height) {
    const skills = getLearnedSkills();
    const skillWidth = width - 10;
    const skillHeight = 70;
    const padding = 8;
    const gap = 5;
    
    // 计算每行显示数量
    const cols = 2;
    const rows = Math.ceil(skills.length / cols);
    
    // 绘制每个技能
    skills.forEach((skill, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const skillX = x + col * (skillWidth + gap);
        const skillY = y + 10 + row * (skillHeight + gap);
        
        if (skillY + skillHeight > y + height) return;
        
        const isSelected = skillPanel.selectedSkill === skill.id;
        
        // 技能背景
        ctx.fillStyle = isSelected ? '#4a5568' : '#1a202c';
        ctx.strokeStyle = skill.type === SKILL_TYPES.ACTIVE ? '#4299e1' : '#48bb78';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(skillX, skillY, skillWidth, skillHeight, 5);
        ctx.fill();
        ctx.stroke();
        
        // 技能图标
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText(skill.icon, skillX + 10, skillY + 35);
        
        // 技能名称和等级
        const level = playerSkills.skillLevels[skill.id] || 1;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.fillText(skill.name + ' Lv.' + level, skillX + 45, skillY + 20);
        
        // 技能类型
        ctx.font = '12px Microsoft YaHei';
        ctx.fillStyle = skill.type === SKILL_TYPES.ACTIVE ? '#4299e1' : '#48bb78';
        const typeText = skill.type === SKILL_TYPES.ACTIVE ? '主动' : '被动';
        ctx.fillText(typeText, skillX + 45, skillY + 35);
        
        // 技能效果
        ctx.fillStyle = '#a0aec0';
        ctx.font = '11px Microsoft YaHei';
        const effectText = skill.effectDesc(level);
        ctx.fillText(effectText, skillX + 10, skillY + 55);
        
        // 主动技能显示冷却
        if (skill.type === SKILL_TYPES.ACTIVE) {
            const cooldown = playerSkills.cooldowns[skill.id] || 0;
            if (cooldown > 0) {
                ctx.fillStyle = '#e53e3e';
                ctx.fillText('CD: ' + cooldown.toFixed(1) + 's', skillX + skillWidth - 60, skillY + 20);
            } else {
                // 装备状态
                const isActive = playerSkills.activeSkills[skill.id];
                ctx.fillStyle = isActive ? '#48bb78' : '#718096';
                ctx.fillText(isActive ? '已装备' : '未装备', skillX + skillWidth - 60, skillY + 20);
            }
        }
        
        // 记录点击区域
        game.uiButtons = game.uiButtons || {};
        game.uiButtons['skill_' + skill.id] = {
            x: skillX, y: skillY,
            width: skillWidth, height: skillHeight,
            action: () => { skillPanel.selectedSkill = skill.id; }
        };
    });
    
    // 如果有选中的技能，显示操作按钮
    if (skillPanel.selectedSkill) {
        const skill = getSkillDefinitions().find(s => s.id === skillPanel.selectedSkill);
        if (skill) {
            drawSkillActions(x, y + height - 45, width, 40, skill);
        }
    }
    
    if (skills.length === 0) {
        ctx.fillStyle = '#a0aec0';
        ctx.font = '14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('暂无已学技能', x + width/2, y + height/2);
        ctx.textAlign = 'left';
    }
}

// 绘制可解锁技能列表
function drawAvailableSkills(x, y, width, height) {
    const skills = getUnlockableSkills();
    const skillWidth = width - 10;
    const skillHeight = 70;
    const padding = 8;
    const gap = 5;
    
    skills.forEach((skill, index) => {
        const row = index;
        const skillX = x;
        const skillY = y + 10 + row * (skillHeight + gap);
        
        if (skillY + skillHeight > y + height) return;
        
        const isSelected = skillPanel.selectedSkill === skill.id;
        
        // 技能背景
        ctx.fillStyle = isSelected ? '#4a5568' : '#1a202c';
        ctx.strokeStyle = '#718096';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(skillX, skillY, skillWidth, skillHeight, 5);
        ctx.fill();
        ctx.stroke();
        
        // 技能图标
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText(skill.icon, skillX + 10, skillY + 35);
        
        // 技能名称和解锁等级
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.fillText(skill.name, skillX + 45, skillY + 20);
        
        // 解锁条件
        ctx.font = '12px Microsoft YaHei';
        ctx.fillStyle = '#a0aec0';
        ctx.fillText('需要等级: ' + skill.unlockLevel, skillX + 45, skillY + 35);
        
        // 技能效果
        ctx.fillStyle = '#718096';
        ctx.font = '11px Microsoft YaHei';
        ctx.fillText(skill.desc, skillX + 10, skillY + 55);
        
        // 记录点击区域
        game.uiButtons = game.uiButtons || {};
        game.uiButtons['skill_' + skill.id] = {
            x: skillX, y: skillY,
            width: skillWidth, height: skillHeight,
            action: () => { skillPanel.selectedSkill = skill.id; }
        };
    });
    
    // 如果有选中的技能，显示学习按钮
    if (skillPanel.selectedSkill) {
        const skill = getSkillDefinitions().find(s => s.id === skillPanel.selectedSkill);
        if (skill && !playerSkills.learned.includes(skill.id)) {
            const level = 1;
            const costExp = skill.upgradeCost.exp;
            const costGold = skill.upgradeCost.gold;
            
            // 学习按钮
            const btnX = x + width/2 - 70;
            const btnY = y + height - 45;
            const btnWidth = 140;
            const btnHeight = 35;
            
            const canLearn = player.level >= skill.unlockLevel;
            
            ctx.fillStyle = canLearn ? '#48bb78' : '#4a5568';
            ctx.beginPath();
            ctx.roundRect(btnX, btnY, btnWidth, btnHeight, 5);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = '14px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.fillText('学习', btnX + btnWidth/2, btnY + 22);
            
            // 消耗显示
            ctx.font = '11px Microsoft YaHei';
            ctx.fillStyle = canLearn ? '#a0aec0' : '#e53e3e';
            ctx.fillText('消耗: ' + costExp + '经验 ' + costGold + '金币', btnX + btnWidth/2, btnY + 50);
            ctx.textAlign = 'left';
            
            game.uiButtons.skillLearn = {
                x: btnX, y: btnY,
                width: btnWidth, height: btnHeight,
                action: () => { learnSkill(skill.id); }
            };
        }
    }
    
    if (skills.length === 0) {
        ctx.fillStyle = '#a0aec0';
        ctx.font = '14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('暂无可解锁技能', x + width/2, y + height/2);
        ctx.textAlign = 'left';
    }
}

// 绘制技能操作按钮
function drawSkillActions(x, y, width, height, skill) {
    const level = playerSkills.skillLevels[skill.id] || 1;
    const isActive = playerSkills.activeSkills[skill.id];
    const cooldown = playerSkills.cooldowns[skill.id] || 0;
    const canUpgrade = canUpgradeSkill(skill.id);
    
    // 按钮容器
    const btnGap = 10;
    const btnWidth = (width - btnGap * 2) / 2;
    const btnHeight = 30;
    const btnY = y;
    
    // 主动技能操作
    if (skill.type === SKILL_TYPES.ACTIVE) {
        // 装备/收起按钮
        const equipBtnX = x + 5;
        const equipText = isActive ? '收起' : '装备';
        
        ctx.fillStyle = isActive ? '#e53e3e' : '#4299e1';
        ctx.beginPath();
        ctx.roundRect(equipBtnX, btnY, btnWidth, btnHeight, 5);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '12px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText(equipText, equipBtnX + btnWidth/2, btnY + 18);
        
        game.uiButtons.skillToggle = {
            x: equipBtnX, y: btnY,
            width: btnWidth, height: btnHeight,
            action: () => { toggleActiveSkill(skill.id); }
        };
        
        // 使用按钮(如果有冷却显示)
        if (cooldown > 0) {
            ctx.fillStyle = '#4a5568';
            ctx.beginPath();
            ctx.roundRect(x + btnWidth + 10, btnY, btnWidth, btnHeight, 5);
            ctx.fill();
            ctx.fillStyle = '#a0aec0';
            ctx.fillText('冷却中', x + btnWidth + 10 + btnWidth/2, btnY + 18);
        } else {
            ctx.fillStyle = '#ed8936';
            ctx.beginPath();
            ctx.roundRect(x + btnWidth + 10, btnY, btnWidth, btnHeight, 5);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillText('使用', x + btnWidth + 10 + btnWidth/2, btnY + 18);
            
            game.uiButtons.skillUse = {
                x: x + btnWidth + 10, y: btnY,
                width: btnWidth, height: btnHeight,
                action: () => { useActiveSkill(skill.id); }
            };
        }
        
        // 升级按钮
        if (level < skill.maxLevel) {
            const upgradeCost = skill.upgradeCost.exp * level;
            const upgradeGoldCost = skill.upgradeCost.gold * level;
            
            const upgradeBtnX = x + width/2 - btnWidth/2;
            const upgradeBtnY = y + btnHeight + 5;
            
            ctx.fillStyle = canUpgrade ? '#48bb78' : '#4a5568';
            ctx.beginPath();
            ctx.roundRect(upgradeBtnX, upgradeBtnY, btnWidth, btnHeight, 5);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillText('升级', upgradeBtnX + btnWidth/2, upgradeBtnY + 18);
            
            ctx.font = '10px Microsoft YaHei';
            ctx.fillStyle = canUpgrade ? '#a0aec0' : '#e53e3e';
            ctx.fillText(upgradeCost + '经验/' + upgradeGoldCost + '金币', upgradeBtnX + btnWidth/2, upgradeBtnY + 40);
            
            game.uiButtons.skillUpgrade = {
                x: upgradeBtnX, y: upgradeBtnY,
                width: btnWidth, height: btnHeight,
                action: () => { upgradeSkill(skill.id); }
            };
        } else {
            ctx.fillStyle = '#718096';
            ctx.font = '12px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.fillText('已满级', x + width/2, btnY + btnHeight + 20);
        }
        
        ctx.textAlign = 'left';
    } else {
        // 被动技能升级
        if (level < skill.maxLevel) {
            const upgradeCost = skill.upgradeCost.exp * level;
            const upgradeGoldCost = skill.upgradeCost.gold * level;
            
            const upgradeBtnX = x + width/2 - btnWidth/2;
            
            ctx.fillStyle = canUpgrade ? '#48bb78' : '#4a5568';
            ctx.beginPath();
            ctx.roundRect(upgradeBtnX, btnY, btnWidth, btnHeight, 5);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '12px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.fillText('升级', upgradeBtnX + btnWidth/2, btnY + 18);
            
            ctx.font = '10px Microsoft YaHei';
            ctx.fillStyle = canUpgrade ? '#a0aec0' : '#e53e3e';
            ctx.fillText(upgradeCost + '经验/' + upgradeGoldCost + '金币', upgradeBtnX + btnWidth/2, btnY + 40);
            
            game.uiButtons.skillUpgrade = {
                x: upgradeBtnX, y: btnY,
                width: btnWidth, height: btnHeight,
                action: () => { upgradeSkill(skill.id); }
            };
            ctx.textAlign = 'left';
        } else {
            ctx.fillStyle = '#718096';
            ctx.font = '12px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.fillText('已满级', x + width/2, btnY + 18);
            ctx.textAlign = 'left';
        }
    }
}
