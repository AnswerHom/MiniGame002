// ===== UI界面模块 =====

const UI = {
    // 绘制游戏UI
    draw() {
        this.drawStatusBar();
        this.drawSkills();
        this.drawBattleInfo();
        this.drawSaveIndicator();
    },
    
    // 状态栏（经验条、血条、属性）
    drawStatusBar() {
        const realm = player.getRealm();
        
        // 经验条
        const expPercent = player.exp / player.requiredExp;
        ctx.fillStyle = '#333'; ctx.fillRect(20, 20, 160, 16);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(20, 20, 160 * expPercent, 16);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(20, 20, 160, 16);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Microsoft YaHei'; ctx.textAlign = 'left';
        ctx.fillText('Lv.' + player.level, 24, 32); ctx.textAlign = 'right';
        ctx.fillText(player.exp + '/' + player.requiredExp, 176, 32);
        
        // 血条
        const hpPercent = Math.max(0, player.hp) / player.maxHp;
        ctx.fillStyle = '#333'; ctx.fillRect(20, 40, 160, 12);
        ctx.fillStyle = hpPercent > 0.3 ? '#44ff44' : '#ff4444'; ctx.fillRect(20, 40, 160 * Math.max(0, hpPercent), 12);
        ctx.strokeStyle = '#fff'; ctx.strokeRect(20, 40, 160, 12);
        ctx.fillStyle = '#fff'; ctx.font = '10px Microsoft YaHei'; ctx.textAlign = 'center';
        ctx.fillText(Math.max(0, player.hp) + '/' + player.maxHp, 100, 49);
        
        // 攻击力
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Microsoft YaHei'; ctx.textAlign = 'left';
        ctx.fillText('攻击: ' + player.attack, 190, 32);
        
        // 防御力
        ctx.fillStyle = '#88ff88'; ctx.font = '10px Microsoft YaHei';
        ctx.fillText('防御: ' + player.defense, 190, 44);
        
        // 暴击率
        const critPercent = Math.floor(player.getCritRate() * 100);
        ctx.fillStyle = '#ff6666'; ctx.font = '10px Microsoft YaHei';
        ctx.fillText('暴击: ' + critPercent + '%', 190, 56);
        
        // 境界
        ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 12px Microsoft YaHei'; ctx.textAlign = 'right';
        ctx.fillText('境界: ' + realm.name, CONFIG.width - 20, 25);
        
        // 距离
        ctx.fillStyle = '#00ffff'; ctx.font = '11px Microsoft YaHei';
        ctx.fillText('距离: ' + game.distance + 'm', CONFIG.width - 20, 42);
        
        // 技能点
        ctx.fillStyle = '#00ffff'; ctx.font = 'bold 11px Microsoft YaHei'; ctx.textAlign = 'left';
        ctx.fillText('💎 技能点: ' + game.skillPoints, 20, 70);
        
        // 金币
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px Microsoft YaHei';
        ctx.fillText('💰 金币: ' + game.gold, 120, 70);
    },
    
    // 战斗信息
    drawBattleInfo() {
        // 战斗状态显示
        if (game.battleState === BATTLE_STATES.COMBAT) {
            ctx.fillStyle = '#ff6600'; ctx.font = 'bold 12px Microsoft YaHei'; ctx.textAlign = 'right';
            ctx.fillText('⚔️ 战斗中', CONFIG.width - 20, 56);
            
            const battleTime = Math.floor(game.battleDuration);
            ctx.fillStyle = '#ff8800'; ctx.font = '10px Microsoft YaHei';
            ctx.fillText('⏱️ ' + battleTime + 's', CONFIG.width - 20, 68);
        } else if (game.battleState === BATTLE_STATES.VICTORY) {
            ctx.fillStyle = '#ffd700'; ctx.font = 'bold 12px Microsoft YaHei'; ctx.textAlign = 'right';
            ctx.fillText('🎉 胜利', CONFIG.width - 20, 56);
        } else if (game.previousBattleState === BATTLE_STATES.COMBAT && game.isTransitioning) {
            ctx.fillStyle = '#00ff00'; ctx.font = 'bold 11px Microsoft YaHei'; ctx.textAlign = 'right';
            ctx.fillText('→ 推进中', CONFIG.width - 20, 56);
        }
        
        // 击杀数
        ctx.fillStyle = '#ff6666'; ctx.font = '11px Microsoft YaHei';
        ctx.fillText('击杀: ' + game.killCount, CONFIG.width - 80, 25);
        
        // 连杀
        if (game.comboCount >= 3) {
            ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 12px Microsoft YaHei';
            ctx.fillText('连杀: ' + game.comboCount, CONFIG.width - 80, 42);
        }
    },
    
    // 技能栏
    drawSkills() {
        // 被动技能（底部左侧）
        let skillX = 20;
        Object.keys(SKILLS).forEach((skillName, index) => {
            const skill = player.skills[skillName];
            const skillData = SKILLS[skillName];
            
            ctx.fillStyle = skill.unlocked ? (skill.cooldownTimer > 0 ? '#555' : '#333') : '#222';
            ctx.beginPath(); ctx.arc(skillX + 20, CONFIG.height - 35, 18, 0, Math.PI * 2); ctx.fill();
            
            if (skill.unlocked) {
                ctx.fillStyle = '#fff'; ctx.font = '16px Microsoft YaHei'; ctx.textAlign = 'center';
                ctx.fillText(skillData.icon, skillX + 20, CONFIG.height - 30);
                
                if (skill.cooldownTimer > 0) {
                    ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    ctx.beginPath(); ctx.arc(skillX + 20, CONFIG.height - 35, 18, -Math.PI/2, -Math.PI/2 + (skill.cooldownTimer / skillData.cooldown) * Math.PI * 2); ctx.fill();
                }
            } else {
                ctx.fillStyle = '#444'; ctx.font = 'bold 14px Microsoft YaHei'; ctx.textAlign = 'center';
                ctx.fillText('?', skillX + 20, CONFIG.height - 30);
                ctx.fillStyle = '#444'; ctx.font = '9px Microsoft YaHei';
                ctx.fillText('Lv.' + skillData.unlockLevel, skillX + 20, CONFIG.height - 15);
            }
            
            skillX += 50;
        });
        
        // 技能提示
        ctx.fillStyle = '#888'; ctx.font = '10px Microsoft YaHei'; ctx.textAlign = 'left';
        ctx.fillText('按空格释放技能', 20, CONFIG.height - 8);
        
        // 主动技能（底部左侧偏移）
        let activeSkillX = 200;
        Object.keys(player.activeSkills).forEach(slot => {
            const skill = player.activeSkills[slot];
            const skillData = ACTIVE_SKILLS[skill.name];
            
            ctx.fillStyle = skill.unlocked ? (skill.cooldownTimer > 0 ? '#444' : '#222') : '#111';
            ctx.strokeStyle = skill.unlocked ? '#00ff00' : '#444';
            ctx.lineWidth = skill.unlocked ? 2 : 1;
            ctx.beginPath(); ctx.arc(activeSkillX + 18, CONFIG.height - 35, 18, 0, Math.PI * 2); 
            ctx.fill(); ctx.stroke();
            
            if (skill.unlocked) {
                ctx.fillStyle = '#fff'; ctx.font = '16px Microsoft YaHei'; ctx.textAlign = 'center';
                ctx.fillText(skillData.icon, activeSkillX + 18, CONFIG.height - 30);
                
                if (skill.cooldownTimer > 0) {
                    ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    ctx.beginPath(); ctx.arc(activeSkillX + 18, CONFIG.height - 35, 18, -Math.PI/2, -Math.PI/2 + (skill.cooldownTimer / skillData.cooldown) * Math.PI * 2); ctx.fill();
                }
                
                ctx.fillStyle = '#ffd700'; ctx.font = 'bold 10px Microsoft YaHei';
                ctx.fillText('Lv.' + skill.level, activeSkillX + 18, CONFIG.height - 12);
            } else {
                ctx.fillStyle = '#444'; ctx.font = 'bold 14px Microsoft YaHei'; ctx.textAlign = 'center';
                ctx.fillText('?', activeSkillX + 18, CONFIG.height - 30);
                ctx.fillStyle = '#666'; ctx.font = '9px Microsoft YaHei';
                ctx.fillText('L.' + skillData.unlockLevel, activeSkillX + 18, CONFIG.height - 12);
            }
            
            ctx.fillStyle = skill.unlocked ? '#00ffff' : '#444';
            ctx.font = 'bold 9px Microsoft YaHei';
            ctx.fillText(slot, activeSkillX + 18, CONFIG.height - 52);
            
            activeSkillX += 45;
        });
    },
    
    // 存档提示
    drawSaveIndicator() {
        if (game.showSaveUI) {
            ctx.fillStyle = '#00ff00'; ctx.font = 'bold 14px Microsoft YaHei'; ctx.textAlign = 'center';
            ctx.fillText('💾 已自动存档', CONFIG.width / 2, CONFIG.height / 2 - 100);
        }
    },
    
    // 显示升级弹窗
    showUpgradePopup(title, stats) {
        // 可以扩展为更复杂的弹窗UI
    },
    
    // 显示背包界面
    showInventory() {
        // 可以扩展为背包UI
    }
};
