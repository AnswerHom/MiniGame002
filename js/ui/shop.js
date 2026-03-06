// ===== v1.3.6 商店模块 =====

// v1.4.0: 生命药水回复量
const HEALTH_POTION_VALUE = 15;

// v1.3.6: 商店物品数据 - v1.4.0: 添加生命药水
function getShopItems() {
    // v3.2.0: 商店只售卖装备
    return [
        // 武器
        { id: 'weapon_sword1', type: 'weapon', name: '新手剑', attackBonus: 2, price: 50 },
        { id: 'weapon_sword2', type: 'weapon', name: '精钢剑', attackBonus: 5, price: 150 },
        { id: 'weapon_sword3', type: 'weapon', name: '玄铁剑', attackBonus: 10, price: 400 },
        { id: 'weapon_sword4', type: 'weapon', name: '青云剑', attackBonus: 20, price: 1000 },
        // 防具
        { id: 'armor_1', type: 'armor', name: '布衣', defenseBonus: 2, price: 50 },
        { id: 'armor_2', type: 'armor', name: '皮甲', defenseBonus: 5, hpBonus: 30, price: 150 },
        { id: 'armor_3', type: 'armor', name: '铁甲', defenseBonus: 10, hpBonus: 50, price: 400 },
        { id: 'armor_4', type: 'armor', name: '玄武甲', defenseBonus: 20, hpBonus: 100, price: 1000 },
        // 饰品
        { id: 'accessory_1', type: 'accessory', name: '玉佩', hpBonus: 20, price: 100 },
        { id: 'accessory_2', type: 'accessory', name: '护符', defenseBonus: 3, price: 200 },
        { id: 'accessory_3', type: 'accessory', name: '灵环', critRateBonus: 0.05, price: 500 }
    ];
}

// v3.2.0: 购买物品 - 只支持装备购买
function purchaseItem(item) {
    if (game.gold >= item.price) {
        game.gold -= item.price;
        
        // 检查是否已购买过
        if (!player.purchasedItems) player.purchasedItems = [];
        if (player.purchasedItems.includes(item.id)) {
            game.purchaseConfirm = {
                itemName: '已拥有',
                timer: 1
            };
            return;
        }
        
        // 记录已购买
        player.purchasedItems.push(item.id);
        
        // 应用装备属性
        if (item.type === 'weapon') {
            player.attack += item.attackBonus;
        } else if (item.type === 'armor') {
            player.defense += item.defenseBonus || 0;
            if (item.hpBonus) player.maxHp += item.hpBonus;
        } else if (item.type === 'accessory') {
            if (item.hpBonus) player.maxHp += item.hpBonus;
            if (item.defenseBonus) player.defense += item.defenseBonus;
            if (item.critRateBonus) player.critRate += item.critRateBonus;
        }
        
        game.playSound('levelup');
        game.purchaseConfirm = {
            itemName: item.name + ' 装备成功!',
            timer: 1.5
        };
        game.showShop = false;
    }
}

// v1.3.6: 绘制商店按钮 - v1.5.2: 使用布局规范，按钮尺寸≥44px，间距≥20px
function drawShopButton() {
    const btnPos = getRightButtonsStartPos();
    const btnX = btnPos.x;
    const btnY = btnPos.y + (UI_INTERACTION.minButtonSize + UI_INTERACTION.buttonSpacing) * 3;  // 第4个按钮
    const btnSize = UI_INTERACTION.minButtonSize;  // 44px
    
    // 按钮背景
    ctx.fillStyle = game.showShop ? '#4CAF50' : '#4a5568';
    ctx.fillRect(btnX, btnY, btnSize, btnSize);
    
    // 按钮边框
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnSize, btnSize);
    
    // 商店图标
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🛒', btnX + btnSize/2, btnY + btnSize/2 + 6);
    ctx.textAlign = 'left';
    
    // 记录按钮区域供点击检测
    game.uiButtons = game.uiButtons || {};
    game.uiButtons.shop = { x: btnX, y: btnY, width: btnSize, height: btnSize, bgColor: '#4a5568', icon: '🛒' };
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
