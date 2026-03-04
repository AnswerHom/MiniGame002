function drawUI() {
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
    
    // v1.5.0 战斗状态显示
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
    
    // 技能UI
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
    
    // v1.7.0 主动技能UI (左侧底部)
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
    
    // v1.7.0 技能点显示
    ctx.fillStyle = '#00ffff'; ctx.font = 'bold 11px Microsoft YaHei'; ctx.textAlign = 'left';
    ctx.fillText('💎 技能点: ' + game.skillPoints, 20, 70);
    
    // v1.7.0 金币显示
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px Microsoft YaHei';
    ctx.fillText('💰 金币: ' + game.gold, 120, 70);
    
    // ===== 兵器切换UI =====
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
    
    // ===== 装备UI v1.1.0 =====
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
    
    // ===== 境界突破提示 =====
    if (player.realmBreakthroughPending) {
        ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 14px Microsoft YaHei'; ctx.textAlign = 'center';
        const pulse = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillText('⚠️ 境界突破任务! 击败守护者 ⚠️', CONFIG.width / 2, 100);
        ctx.globalAlpha = 1;
    }
    
    // ===== 怒气条UI =====
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
    
    // 防御力显示 v1.1.0
    ctx.fillStyle = '#88ff88'; ctx.font = '10px Microsoft YaHei';
    ctx.fillText('防御: ' + player.defense, 180, 95);
    
    // ===== 副本UI =====
    if (game.dungeon) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(CONFIG.width/2 - 150, 100, 300, 80);
        ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 16px Microsoft YaHei'; ctx.textAlign = 'center';
        ctx.fillText('副本: ' + game.dungeon.name, CONFIG.width/2, 125);
        ctx.fillStyle = '#fff'; ctx.font = '12px Microsoft YaHei';
        ctx.fillText('剩余怪物: ' + game.dungeonEnemiesRemaining, CONFIG.width/2, 145);
        ctx.fillText('目标: 击败' + game.dungeon.enemyCount + '只', CONFIG.width/2, 165);
    }
    
    // ===== 境界突破提示 =====
    if (player.realmBreakthroughPending) {
        ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 12px Microsoft YaHei'; ctx.textAlign = 'center';
        const pulse = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillText('境界突破任务已解锁! 按B开始突破', CONFIG.width/2, 100);
        ctx.globalAlpha = 1;
    }
    
    if (game.realmBreakthrough && game.guardian) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(CONFIG.width/2 - 120, 80, 240, 60);
        ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 14px Microsoft YaHei'; ctx.textAlign = 'center';
        ctx.fillText('境界突破中!', CONFIG.width/2, 100);
        ctx.fillStyle = '#fff'; ctx.font = '11px Microsoft YaHei';
        ctx.fillText('击败守护者!', CONFIG.width/2, 120);
    }
    
    // 闪避状态
    if (player.isDodging) {
        ctx.fillStyle = '#00ffff'; ctx.font = 'bold 16px Microsoft YaHei'; ctx.textAlign = 'center';
        ctx.fillText('闪避中!', CONFIG.width / 2, 70);
    }
    
    // ===== v1.2.0 药材背包UI =====
    ctx.fillStyle = '#aaa'; ctx.font = '10px Microsoft YaHei'; ctx.textAlign = 'left';
    ctx.fillText('药材:', 250, 95);
    
    let herbX = 290;
    Object.keys(HERBS).forEach(herbName => {
        const herb = HERBS[herbName];
        const count = player.herbInventory[herbName] || 0;
        ctx.fillStyle = count > 0 ? '#333' : '#222';
        ctx.strokeStyle = count > 0 ? herb.color : '#444';
        ctx.lineWidth = count > 0 ? 1 : 1;
        ctx.fillRect(herbX, 85, 50, 16);
        ctx.strokeRect(herbX, 85, 50, 16);
        ctx.fillStyle = count > 0 ? herb.color : '#444';
        ctx.font = '9px Microsoft YaHei';
        ctx.fillText(herb.icon + count, herbX + 3, 96);
        herbX += 55;
    });
    
    // ===== v1.2.0 灵宠UI =====
    if (player.pets.length > 0) {
        ctx.fillStyle = '#aaa'; ctx.font = '10px Microsoft YaHei';
        ctx.fillText('灵宠:', 250, 115);
        
        let petX = 290;
        player.pets.forEach((pet, index) => {
            const isActive = player.activePet === pet;
            ctx.fillStyle = isActive ? '#444' : '#333';
            ctx.strokeStyle = PET_QUALITY_COLORS[pet.quality];
            ctx.lineWidth = isActive ? 2 : 1;
            ctx.fillRect(petX, 105, 45, 16);
            ctx.strokeRect(petX, 105, 45, 16);
            ctx.fillStyle = PET_QUALITY_COLORS[pet.quality];
            ctx.font = '9px Microsoft YaHei';
            ctx.fillText(pet.icon + 'L' + pet.level, petX + 3, 116);
            petX += 50;
        });
    }
    
    // ===== v1.3.0 仙侣UI =====
    if (player.companion) {
        ctx.fillStyle = '#aaa'; ctx.font = '10px Microsoft YaHei';
        ctx.fillText('仙侣:', 250, 130);
        
        const comp = player.companion;
        ctx.fillStyle = '#333';
        ctx.strokeStyle = COMPANION_QUALITY_COLORS[comp.quality];
        ctx.lineWidth = 2;
        ctx.fillRect(290, 120, 50, 16);
        ctx.strokeRect(290, 120, 50, 16);
        ctx.fillStyle = COMPANION_QUALITY_COLORS[comp.quality];
        ctx.font = '9px Microsoft YaHei';
        ctx.fillText(comp.icon + comp.name, 293, 131);
    }
    
    // ===== v1.4.0 宗门UI =====
    if (player.section) {
        ctx.fillStyle = '#aaa'; ctx.font = '10px Microsoft YaHei';
        ctx.fillText('宗门:', 250, 145);
        
        const sect = player.section;
        ctx.fillStyle = '#333';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.fillRect(290, 135, 60, 16);
        ctx.strokeRect(290, 135, 60, 16);
        ctx.fillStyle = '#ffd700';
        ctx.font = '9px Microsoft YaHei';
        ctx.fillText(sect.icon + sect.name, 293, 146);
        
        // 宗门贡献
        ctx.fillStyle = '#aaa'; ctx.font = '9px Microsoft YaHei';
        ctx.fillText('贡:' + player.sectionContrib, 355, 146);
    }
    
    // ===== v1.4.0 坐骑UI =====
    if (player.mount) {
        ctx.fillStyle = '#aaa'; ctx.font = '10px Microsoft YaHei';
        ctx.fillText('坐骑:', 420, 130);
        
        const mount = player.mount;
        ctx.fillStyle = '#333';
        ctx.strokeStyle = MOUNT_QUALITY_COLORS[mount.quality];
        ctx.lineWidth = 2;
        ctx.fillRect(460, 120, 50, 16);
        ctx.strokeRect(460, 120, 50, 16);
        ctx.fillStyle = MOUNT_QUALITY_COLORS[mount.quality];
        ctx.font = '9px Microsoft YaHei';
        ctx.fillText(mount.icon + mount.name, 463, 131);
    }
    
    // ===== v1.4.0 符文UI =====
    let runeX = 420;
    let hasRunes = false;
    game.equippedRunes.forEach((rune, index) => {
        if (rune) {
            hasRunes = true;
            const runeData = RUNES[rune.name];
            ctx.fillStyle = '#333';
            ctx.strokeStyle = RUNE_QUALITY_COLORS[runeData.quality];
            ctx.lineWidth = 1;
            ctx.fillRect(runeX, 145, 25, 14);
            ctx.strokeRect(runeX, 145, 25, 14);
            ctx.fillStyle = RUNE_QUALITY_COLORS[runeData.quality];
            ctx.font = '8px Microsoft YaHei';
            ctx.fillText(runeData.icon, runeX + 2, 155);
        }
        runeX += 28;
    });
    if (hasRunes) {
        ctx.fillStyle = '#aaa'; ctx.font = '9px Microsoft YaHei';
        ctx.fillText('符文:', 420, 143);
    }
    
    // ===== v1.2.0 炼丹/灵宠/仙侣提示 =====
    ctx.fillStyle = '#888'; ctx.font = '9px Microsoft YaHei';
    ctx.fillText('D:炼丹 灵宠:C 仙侣:G 采集:E 宗门:J 坐骑:K 符文:R', CONFIG.width - 180, CONFIG.height - 8);
    
    // ===== v1.2.0 野生灵宠提示 =====
    if (game.wildPet) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(CONFIG.width/2 - 100, 150, 200, 60);
        ctx.fillStyle = PET_QUALITY_COLORS[game.wildPet.quality]; ctx.font = 'bold 14px Microsoft YaHei'; ctx.textAlign = 'center';
        ctx.fillText('发现野生 ' + game.wildPet.icon + game.wildPet.name + '!', CONFIG.width/2, 170);
        ctx.fillStyle = '#fff'; ctx.font = '11px Microsoft YaHei';
        ctx.fillText('按C捕捉 | 击杀后消失', CONFIG.width/2, 190);
    }
    
    // v1.4.0 宗门界面
    if (game.sectionOpen) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(CONFIG.width/2 - 200, 50, 400, 350);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(CONFIG.width/2 - 200, 50, 400, 350);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 24px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('🏛️ 宗门系统', CONFIG.width/2, 85);
        
        // 当前宗门状态
        ctx.fillStyle = '#fff';
        ctx.font = '14px Microsoft YaHei';
        ctx.textAlign = 'left';
        ctx.fillText('当前宗门: ' + (player.section ? player.section.icon + player.section.name : '未加入'), CONFIG.width/2 - 180, 120);
        if (player.section) {
            ctx.fillText('贡献值: ' + player.sectionContrib, CONFIG.width/2 - 180, 145);
        }
        
        // 宗门任务
        if (player.section && game.sectionTasks) {
            ctx.fillStyle = '#ff8800';
            ctx.font = 'bold 14px Microsoft YaHei';
            ctx.fillText('宗门任务:', CONFIG.width/2 - 180, 180);
            
            let taskY = 205;
            Object.keys(game.sectionTasks).forEach(taskKey => {
                const task = game.sectionTasks[taskKey];
                ctx.fillStyle = '#fff';
                ctx.font = '12px Microsoft YaHei';
                ctx.fillText(task.icon + task.name + ': ' + task.progress + '/' + task.target + ' (奖励:' + task.reward + ')', CONFIG.width/2 - 180, taskY);
                taskY += 22;
            });
        }
        
        // 宗门列表
        let y = player.section ? 280 : 160;
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('可加入宗门 (20级开放)', CONFIG.width/2, y);
        y += 25;
        
        Object.keys(SECTIONS).forEach((sectName, index) => {
            const sect = SECTIONS[sectName];
            const canJoin = player.level >= 20;
            ctx.fillStyle = canJoin ? '#ffd700' : '#666';
            ctx.font = '12px Microsoft YaHei';
            ctx.textAlign = 'left';
            ctx.fillText((index + 1) + '. ' + sect.icon + sectName + ' (' + sect.quality + ')', CONFIG.width/2 - 180, y);
            ctx.fillText(sect.description, CONFIG.width/2, y);
            y += 20;
        });
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('按数字键1-4加入宗门 | 按X离开宗门 | 按J关闭', CONFIG.width/2, 370);
    }
    
    // v1.4.0 坐骑界面
    if (game.mountOpen) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(CONFIG.width/2 - 200, 50, 400, 350);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(CONFIG.width/2 - 200, 50, 400, 350);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 24px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('🦌 坐骑系统', CONFIG.width/2, 85);
        
        // 当前坐骑状态
        ctx.fillStyle = '#fff';
        ctx.font = '14px Microsoft YaHei';
        ctx.textAlign = 'left';
        ctx.fillText('当前坐骑: ' + (player.mount ? player.mount.icon + player.mount.name : '未装备'), CONFIG.width/2 - 180, 120);
        if (player.mount) {
            const mountData = MOUNTS[player.mount.name];
            ctx.fillText('速度加成: +' + Math.floor(mountData.speedBonus * 100) + '%', CONFIG.width/2 - 180, 145);
            if (mountData.attackBonus > 0) {
                ctx.fillText('攻击加成: +' + (typeof mountData.attackBonus === 'number' ? mountData.attackBonus : Math.floor(mountData.attackBonus * 100) + '%'), CONFIG.width/2 - 180, 170);
            }
        }
        
        // 坐骑列表
        let y = 210;
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('可解锁坐骑 (25级开放)', CONFIG.width/2, y);
        y += 25;
        
        Object.keys(MOUNTS).forEach((mountName, index) => {
            const mount = MOUNTS[mountName];
            const canUnlock = player.level >= mount.unlockLevel;
            ctx.fillStyle = canUnlock ? MOUNT_QUALITY_COLORS[mount.quality] : '#666';
            ctx.font = '12px Microsoft YaHei';
            ctx.textAlign = 'left';
            ctx.fillText((index + 1) + '. ' + mount.icon + mountName + ' (' + mount.quality + ')', CONFIG.width/2 - 180, y);
            ctx.fillText('Lv.' + mount.unlockLevel + ' 速+' + Math.floor(mount.speedBonus * 100) + '%', CONFIG.width/2, y);
            y += 20;
        });
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('按数字键1-4装备坐骑 | 按X下骑 | 按K关闭', CONFIG.width/2, 370);
    }
    
    // v1.4.0 符文界面
    if (game.runeOpen) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(CONFIG.width/2 - 200, 50, 400, 350);
        ctx.strokeStyle = '#0088ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(CONFIG.width/2 - 200, 50, 400, 350);
        
        ctx.fillStyle = '#0088ff';
        ctx.font = 'bold 24px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('🔮 符文系统', CONFIG.width/2, 85);
        
        // 符文槽
        ctx.fillStyle = '#fff';
        ctx.font = '14px Microsoft YaHei';
        ctx.textAlign = 'left';
        ctx.fillText('符文槽:', CONFIG.width/2 - 180, 120);
        
        let slotX = CONFIG.width/2 - 180;
        game.equippedRunes.forEach((rune, index) => {
            if (rune) {
                const runeData = RUNES[rune.name];
                ctx.fillStyle = RUNE_QUALITY_COLORS[runeData.quality];
                ctx.fillRect(slotX, 130, 50, 20);
                ctx.fillStyle = '#000';
                ctx.font = '10px Microsoft YaHei';
                ctx.fillText(runeData.icon + rune.name.substring(0, 3), slotX + 2, 144);
            } else {
                ctx.fillStyle = '#333';
                ctx.strokeStyle = '#555';
                ctx.strokeRect(slotX, 130, 50, 20);
                ctx.fillStyle = '#555';
                ctx.font = '10px Microsoft YaHei';
                ctx.fillText('空槽', slotX + 10, 144);
            }
            slotX += 55;
        });
        
        // 符文背包
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('符文背包 (击杀BOSS获得)', CONFIG.width/2, 175);
        
        let runeY = 200;
        if (player.runeInventory.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '12px Microsoft YaHei';
            ctx.fillText('暂无符文', CONFIG.width/2, runeY);
        } else {
            player.runeInventory.forEach((rune, index) => {
                const runeData = RUNES[rune.name];
                ctx.fillStyle = RUNE_QUALITY_COLORS[runeData.quality];
                ctx.font = '11px Microsoft YaHei';
                ctx.textAlign = 'left';
                ctx.fillText((index + 1) + '. ' + runeData.icon + rune.name + ' +' + Math.floor(runeData.statValue * 100) + '%', CONFIG.width/2 - 180, runeY);
                runeY += 18;
            });
        }
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('按数字键1-6装备符文到槽位 | 按X卸下符文 | 按R关闭', CONFIG.width/2, 370);
    }
    
    // 游戏结束
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
        
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 48px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', CONFIG.width/2, CONFIG.height/2 - 20);
        
        ctx.fillStyle = '#fff';
        ctx.font = '20px Microsoft YaHei';
        ctx.fillText('最终等级: Lv.' + player.level + ' ' + realm.name, CONFIG.width/2, CONFIG.height/2 + 20);
        ctx.fillText('前行距离: ' + game.distance + 'm', CONFIG.width/2, CONFIG.height/2 + 50);
        ctx.fillText('击杀总数: ' + game.killCount, CONFIG.width/2, CONFIG.height/2 + 80);
        ctx.fillText('重新刷新页面重新开始', CONFIG.width/2, CONFIG.height/2 + 110);
    }
    
    // v1.3.0 仙侣界面
    if (game.companionOpen) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(CONFIG.width/2 - 200, 50, 400, 350);
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(CONFIG.width/2 - 200, 50, 400, 350);
        
        ctx.fillStyle = '#ff00ff';
        ctx.font = 'bold 24px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('💕 仙侣系统', CONFIG.width/2, 85);
        
        // 当前仙侣状态
        ctx.fillStyle = '#fff';
        ctx.font = '16px Microsoft YaHei';
        ctx.textAlign = 'left';
        ctx.fillText('当前仙侣: ' + (player.companion ? player.companion.icon + player.companion.name : '未绑定'), CONFIG.width/2 - 180, 120);
        
        // 仙侣列表
        let y = 160;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('可寻找仙侣 (15级开放)', CONFIG.width/2, y);
        y += 25;
        
        Object.keys(COMPANIONS).forEach((compName, index) => {
            const comp = COMPANIONS[compName];
            const canBind = player.level >= 15;
            ctx.fillStyle = canBind ? COMPANION_QUALITY_COLORS[comp.quality] : '#666';
            ctx.font = '14px Microsoft YaHei';
            ctx.textAlign = 'left';
            ctx.fillText((index + 1) + '. ' + comp.icon + comp.name + ' (' + comp.quality + ')', CONFIG.width/2 - 180, y);
            ctx.fillText('需求: ' + comp.realmRequired + '境界', CONFIG.width/2, y);
            ctx.fillText('技能: ' + comp.skillName, CONFIG.width/2 + 80, y);
            y += 25;
        });
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('按数字键1-4绑定仙侣 | 按X解除仙侣 | 按G关闭', CONFIG.width/2, 370);
    }
    
    // v1.3.0 炼丹界面
    if (game.alchemyOpen) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(CONFIG.width/2 - 200, 50, 400, 350);
        ctx.strokeStyle = '#44ff44';
        ctx.lineWidth = 2;
        ctx.strokeRect(CONFIG.width/2 - 200, 50, 400, 350);
        
        ctx.fillStyle = '#44ff44';
        ctx.font = 'bold 24px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('⚗️ 炼丹系统', CONFIG.width/2, 85);
        
        // 当前药材
        ctx.fillStyle = '#fff';
        ctx.font = '14px Microsoft YaHei';
        ctx.textAlign = 'left';
        ctx.fillText('当前药材:', CONFIG.width/2 - 180, 120);
        
        let herbX = CONFIG.width/2 - 180;
        Object.keys(HERBS).forEach((herbName, index) => {
            const herb = HERBS[herbName];
            const count = player.herbInventory[herbName] || 0;
            ctx.fillStyle = count > 0 ? herb.color : '#666';
            ctx.fillText(herb.icon + herbName + ': ' + count, herbX, 145);
            herbX += 100;
            if ((index + 1) % 4 === 0) { herbX = CONFIG.width/2 - 180; }
        });
        
        // 丹方列表
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('丹方配方 (按数字键炼制)', CONFIG.width/2, 180);
        
        let recipeY = 210;
        Object.keys(RECIPES).forEach((recipeName, index) => {
            const recipe = RECIPES[recipeName];
            // 检查是否可炼制
            let canCraft = true;
            let missing = '';
            for (let herb in recipe.ingredients) {
                if (!player.herbInventory[herb] || player.herbInventory[herb] < recipe.ingredients[herb]) {
                    canCraft = false;
                    missing = herb;
                }
            }
            
            ctx.fillStyle = canCraft ? '#44ff44' : '#ff4444';
            ctx.font = '12px Microsoft YaHei';
            ctx.textAlign = 'left';
            ctx.fillText((index + 1) + '. ' + recipe.icon + recipeName, CONFIG.width/2 - 180, recipeY);
            
            // 显示材料需求
            let matText = '';
            for (let herb in recipe.ingredients) {
                const need = recipe.ingredients[herb];
                const have = player.herbInventory[herb] || 0;
                matText += herb + need + ' ';
            }
            ctx.fillStyle = canCraft ? '#aaa' : '#ff6666';
            ctx.fillText(matText, CONFIG.width/2 - 80, recipeY);
            
            ctx.fillStyle = canCraft ? '#00ffff' : '#666';
            ctx.textAlign = 'right';
            ctx.fillText(canCraft ? '可炼制' : '材料不足', CONFIG.width/2 + 180, recipeY);
            ctx.textAlign = 'left';
            
            recipeY += 22;
        });
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('按D关闭界面', CONFIG.width/2, 375);
    }
}

