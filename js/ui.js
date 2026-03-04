// ui.js - UI界面模块
// 从 game.js 提取的所有UI绘制逻辑

const UI = {
    // 绘制游戏UI主函数
    draw: function() {
        this.drawStatusBar();
        this.drawSkills();
        this.drawWeaponSelector();
        this.drawEquipment();
        this.drawRealmBreakthrough();
        this.drawRageBar();
        this.drawDungeon();
    },

    // 状态栏（生命值、经验条、境界显示）
    drawStatusBar: function() {
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
        
        // 攻击力（显示兵器攻击力）
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
        
        // 战斗状态显示
        if (game.battleState === BATTLE_STATES.COMBAT) {
            ctx.fillStyle = '#ff6600'; ctx.font = 'bold 12px Microsoft YaHei'; ctx.textAlign = 'right';
            ctx.fillText('⚔️ 战斗中', CONFIG.width - 20, 56);
            
            // 战斗时长
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
        
        // 技能点显示
        ctx.fillStyle = '#00ffff'; ctx.font = 'bold 11px Microsoft YaHei'; ctx.textAlign = 'left';
        ctx.fillText('💎 技能点: ' + game.skillPoints, 20, 70);
        
        // 金币显示
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px Microsoft YaHei';
        ctx.fillText('💰 金币: ' + game.gold, 120, 70);
    },

    // 技能栏（技能图标、冷却显示）
    drawSkills: function() {
        // 被动技能UI
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
                
                if (!skill.unlocked) {
                    ctx.fillStyle = '#666'; ctx.font = '10px Microsoft YaHei';
                    ctx.fillText('Lv.' + skillData.unlockLevel, skillX + 20, CONFIG.height - 15);
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
        
        // 主动技能UI (左侧底部)
        let activeSkillX = 200;
        Object.keys(player.activeSkills).forEach(slot => {
            const skill = player.activeSkills[slot];
            const skillData = ACTIVE_SKILLS[skill.name];
            
            // 技能槽背景
            ctx.fillStyle = skill.unlocked ? (skill.cooldownTimer > 0 ? '#444' : '#222') : '#111';
            ctx.strokeStyle = skill.unlocked ? '#00ff00' : '#444';
            ctx.lineWidth = skill.unlocked ? 2 : 1;
            ctx.beginPath(); ctx.arc(activeSkillX + 18, CONFIG.height - 35, 18, 0, Math.PI * 2); 
            ctx.fill(); ctx.stroke();
            
            if (skill.unlocked) {
                // 技能图标
                ctx.fillStyle = '#fff'; ctx.font = '16px Microsoft YaHei'; ctx.textAlign = 'center';
                ctx.fillText(skillData.icon, activeSkillX + 18, CONFIG.height - 30);
                
                // 冷却遮罩
                if (skill.cooldownTimer > 0) {
                    ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    ctx.beginPath(); ctx.arc(activeSkillX + 18, CONFIG.height - 35, 18, -Math.PI/2, -Math.PI/2 + (skill.cooldownTimer / skillData.cooldown) * Math.PI * 2); ctx.fill();
                }
                
                // 技能等级
                ctx.fillStyle = '#ffd700'; ctx.font = 'bold 10px Microsoft YaHei';
                ctx.fillText('Lv.' + skill.level, activeSkillX + 18, CONFIG.height - 12);
            } else {
                // 未解锁显示问号和需求等级
                ctx.fillStyle = '#444'; ctx.font = 'bold 14px Microsoft YaHei'; ctx.textAlign = 'center';
                ctx.fillText('?', activeSkillX + 18, CONFIG.height - 30);
                ctx.fillStyle = '#666'; ctx.font = '9px Microsoft YaHei';
                ctx.fillText('L.' + skillData.unlockLevel, activeSkillX + 18, CONFIG.height - 12);
            }
            
            // 快捷键提示
            ctx.fillStyle = skill.unlocked ? '#00ffff' : '#444';
            ctx.font = 'bold 9px Microsoft YaHei';
            ctx.fillText(slot, activeSkillX + 18, CONFIG.height - 52);
            
            activeSkillX += 45;
        });
    },

    // 兵器切换UI
    drawWeaponSelector: function() {
        let weaponX = 100;
        Object.keys(WEAPONS).forEach((weaponName, index) => {
            const w = WEAPONS[weaponName];
            const isSelected = player.weapon === weaponName;
            
            ctx.fillStyle = isSelected ? '#444' : '#222';
            ctx.strokeStyle = isSelected ? '#00ff00' : '#555';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.beginPath(); ctx.arc(weaponX + 15, CONFIG.height - 35, 16, 0, Math.PI * 2); 
            ctx.fill(); ctx.stroke();
            
            ctx.fillStyle = isSelected ? '#fff' : '#888';
            ctx.font = '14px Microsoft YaHei'; ctx.textAlign = 'center';
            ctx.fillText(w.icon, weaponX + 15, CONFIG.height - 30);
            
            ctx.fillStyle = isSelected ? '#00ff00' : '#666';
            ctx.font = '9px Microsoft YaHei';
            ctx.fillText(index + 1, weaponX + 15, CONFIG.height - 12);
            
            weaponX += 40;
        });
    },

    // 装备UI
    drawEquipment: function() {
        ctx.fillStyle = '#aaa'; ctx.font = '10px Microsoft YaHei'; ctx.textAlign = 'left';
        ctx.fillText('装备:', 20, 95);
        
        let equipX = 55;
        Object.keys(EQUIP_TYPES).forEach(equipType => {
            const equipInfo = EQUIP_TYPES[equipType];
            const equipped = player.equipment[equipType];
            
            // 装备槽背景
            ctx.fillStyle = equipped ? '#333' : '#222';
            ctx.strokeStyle = equipped ? EQUIP_COLORS[equipped.grade] : '#444';
            ctx.lineWidth = equipped ? 2 : 1;
            ctx.beginPath(); ctx.arc(equipX + 12, 92, 12, 0, Math.PI * 2); 
            ctx.fill(); ctx.stroke();
            
            // 装备图标
            ctx.fillStyle = equipped ? '#fff' : '#555';
            ctx.font = '12px Microsoft YaHei'; ctx.textAlign = 'center';
            ctx.fillText(equipped ? equipInfo.icon : '-', equipX + 12, 96);
            
            // 装备名称
            ctx.fillStyle = equipped ? EQUIP_COLORS[equipped.grade] : '#444';
            ctx.font = '8px Microsoft YaHei';
            ctx.fillText(equipped ? equipped.name.substring(0, 3) : '空', equipX + 12, 108);
            
            equipX += 35;
        });
    },

    // 境界突破提示
    drawRealmBreakthrough: function() {
        if (player.realmBreakthroughPending) {
            ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 14px Microsoft YaHei'; ctx.textAlign = 'center';
            const pulse = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
            ctx.globalAlpha = pulse;
            ctx.fillText('⚠️ 境界突破任务! 击败守护者 ⚠️', CONFIG.width / 2, 100);
            ctx.globalAlpha = 1;
        }
    },

    // 怒气条UI
    drawRageBar: function() {
        const ragePercent = player.rage / player.maxRage;
        ctx.fillStyle = '#333'; ctx.fillRect(20, 56, 160, 10);
        ctx.fillStyle = player.rage >= player.maxRage ? '#ff6600' : '#ff4444';
        ctx.fillRect(20, 56, 160 * ragePercent, 10);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(20, 56, 160, 10);
        ctx.fillStyle = player.rage >= player.maxRage ? '#ff6600' : '#fff';
        ctx.font = '9px Microsoft YaHei'; ctx.textAlign = 'right';
        ctx.fillText('怒气: ' + player.rage + '/' + player.maxRage, 176, 64);
        
        // 怒气满时提示
        if (player.rage >= player.maxRage) {
            ctx.fillStyle = '#ff6600'; ctx.font = 'bold 10px Microsoft YaHei'; ctx.textAlign = 'left';
            const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
            ctx.globalAlpha = pulse;
            ctx.fillText('按Q释放怒气技能!', 20, 80);
            ctx.globalAlpha = 1;
        }
        
        // 防御力显示
        ctx.fillStyle = '#88ff88'; ctx.font = '10px Microsoft YaHei';
        ctx.fillText('防御: ' + player.defense, 180, 95);
    },

    // 副本UI
    drawDungeon: function() {
        if (game.dungeon) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(CONFIG.width/2 - 150, 100, 300, 80);
            ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 16px Microsoft YaHei'; ctx.textAlign = 'center';
            ctx.fillText('副本: ' + game.dungeon.name, CONFIG.width/2, 125);
            ctx.fillStyle = '#fff'; ctx.font = '12px Microsoft YaHei';
            ctx.fillText('剩余怪物: ' + game.dungeonEnemiesRemaining, CONFIG.width/2, 145);
            ctx.fillText('目标: 击败' + game.dungeon.enemyCount + '只', CONFIG.width/2, 165);
        }
    },

    // 显示升级弹窗
    showUpgradePopup: function() {
        // 升级弹窗逻辑
    },

    // 背包界面
    drawInventory: function() {
        // 背包界面逻辑
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
