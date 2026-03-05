// ===== v1.3.6 商店模块 =====

// v1.3.6: 商店物品数据
function getShopItems() {
    return [
        { id: 'doubleAttack', name: '攻击力翻倍', desc: '30秒内攻击力x2', price: 10, duration: 30 },
        { id: 'quickGold', name: '金币加成', desc: '30秒内金币x2', price: 8, duration: 30 },
        { id: 'invincible', name: '无敌模式', desc: '10秒内不受伤害', price: 15, duration: 10 }
    ];
}

// v1.3.6: 购买物品 - v1.3.7: 购买后自动关闭商店
function purchaseItem(item) {
    if (game.gold >= item.price) {
        game.gold -= item.price;
        game.activatePowerup(item.id, item.duration);
        game.playSound('levelup');
        // v1.3.7: 购买后自动关闭商店
        game.showShop = false;
    }
}

// v1.3.6: 绘制商店按钮
function drawShopButton() {
    const btnX = CONFIG.width - 50;
    const btnY = 170;
    const btnSize = 30;
    
    // 按钮背景
    ctx.fillStyle = game.showShop ? '#4CAF50' : '#4a5568';
    ctx.fillRect(btnX, btnY, btnSize, btnSize);
    
    // 按钮边框
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnSize, btnSize);
    
    // 商店图标
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🛒', btnX + btnSize/2, btnY + 20);
    ctx.textAlign = 'left';
}

// v1.3.6: 绘制商店界面
function drawShopUI() {
    if (!game.showShop) return;
    
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    const centerX = CONFIG.width / 2;
    const centerY = CONFIG.height / 2;
    
    // 标题
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('🎰 金币商店', centerX, centerY - 140);
    
    // 当前金币
    ctx.fillStyle = '#fff';
    ctx.font = '20px Microsoft YaHei';
    ctx.fillText('当前金币: 💰 ' + game.gold, centerX, centerY - 100);
    
    // 绘制物品
    const shopItems = getShopItems();
    const itemWidth = 140;
    const itemHeight = 60;
    const startX = centerX - 200;
    const startY = centerY - 60;
    
    shopItems.forEach((item, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const itemX = startX + col * (itemWidth + 20);
        const itemY = startY + row * (itemHeight + 20);
        
        // 物品背景
        const canAfford = game.gold >= item.price;
        ctx.fillStyle = canAfford ? '#2d4a3e' : '#3a3a3a';
        ctx.fillRect(itemX, itemY, itemWidth, itemHeight);
        ctx.strokeStyle = canAfford ? '#4CAF50' : '#666';
        ctx.lineWidth = 2;
        ctx.strokeRect(itemX, itemY, itemWidth, itemHeight);
        
        // 物品名称
        ctx.fillStyle = canAfford ? '#fff' : '#888';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.textAlign = 'left';
        ctx.fillText(item.name, itemX + 10, itemY + 22);
        
        // 物品描述
        ctx.font = '11px Microsoft YaHei';
        ctx.fillStyle = '#aaa';
        ctx.fillText(item.desc, itemX + 10, itemY + 40);
        
        // 价格
        ctx.fillStyle = canAfford ? '#ffd700' : '#666';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.textAlign = 'right';
        ctx.fillText('💰 ' + item.price, itemX + itemWidth - 10, itemY + 22);
    });
    
    // 关闭提示
    ctx.textAlign = 'center';
    ctx.fillStyle = '#aaa';
    ctx.font = '16px Microsoft YaHei';
    ctx.fillText('点击任意位置关闭商店', centerX, centerY + 120);
    
    // v1.3.6: 显示激活的增益
    const activePowerups = Object.keys(game.activePowerups);
    if (activePowerups.length > 0) {
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 16px Microsoft YaHei';
        ctx.fillText('🎯 激活增益:', centerX, centerY + 150);
        
        let yOffset = 175;
        activePowerups.forEach(powerup => {
            const remaining = Math.ceil(game.activePowerups[powerup]);
            const item = shopItems.find(i => i.id === powerup);
            if (item) {
                ctx.fillStyle = '#ffd700';
                ctx.font = '14px Microsoft YaHei';
                ctx.fillText(item.name + ' (' + remaining + 's)', centerX, centerY + yOffset);
                yOffset += 25;
            }
        });
    }
    
    ctx.textAlign = 'left';
}
