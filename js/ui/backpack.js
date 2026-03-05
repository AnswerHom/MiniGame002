// ===== v1.5.6 背包系统 =====

// 物品数据结构
const ITEM_TYPES = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    CONSUMABLE: 'consumable',
    MATERIAL: 'material'
};

// 物品图标映射
const ITEM_ICONS = {
    weapon: '⚔️',
    armor: '🛡️',
    consumable: '🧪',
    material: '📦'
};

// 物品定义
function getItemDefinitions() {
    return [
        { id: 'item_001', name: '铁剑', type: ITEM_TYPES.WEAPON, icon: '⚔️', count: 1, attrs: { atk: 5 }, desc: '一把普通的铁剑，攻击力+5' },
        { id: 'item_002', name: '玄铁剑', type: ITEM_TYPES.WEAPON, icon: '⚔️', count: 1, attrs: { atk: 15 }, desc: '由玄铁打造的剑，攻击力+15' },
        { id: 'item_003', name: '布衣', type: ITEM_TYPES.ARMOR, icon: '🛡️', count: 1, attrs: { def: 3 }, desc: '普通的布衣，防御力+3' },
        { id: 'item_004', name: '皮甲', type: ITEM_TYPES.ARMOR, icon: '🛡️', count: 1, attrs: { def: 8 }, desc: '皮质护甲，防御力+8' },
        { id: 'item_005', name: '生命药水', type: ITEM_TYPES.CONSUMABLE, icon: '🧪', count: 3, attrs: { hp: 20 }, desc: '使用后恢复20点生命值' },
        { id: 'item_006', name: '金创药', type: ITEM_TYPES.CONSUMABLE, icon: '🧪', count: 2, attrs: { hp: 50 }, desc: '使用后恢复50点生命值' },
        { id: 'item_007', name: '铁矿石', type: ITEM_TYPES.MATERIAL, icon: '📦', count: 5, attrs: {}, desc: '可用于锻造装备' },
        { id: 'item_008', name: '兽皮', type: ITEM_TYPES.MATERIAL, icon: '📦', count: 3, attrs: {}, desc: '可用于制作防具' },
        { id: 'item_009', name: '灵草', type: ITEM_TYPES.MATERIAL, icon: '🌿', count: 4, attrs: {}, desc: '仙侠世界常用素材' },
        { id: 'item_010', name: '金币袋', type: ITEM_TYPES.CONSUMABLE, icon: '💰', count: 1, attrs: { gold: 100 }, desc: '使用后获得100金币' }
    ];
}

// 背包数据结构
const backpack = {
    capacity: 16,  // 4x4格子
    items: [],
    isOpen: false,
    selectedItem: null,
    dragItem: null,
    dragIndex: -1
};

// 初始化背包（添加一些初始物品）
function initBackpack() {
    const items = getItemDefinitions();
    // 添加一些初始物品到背包
    backpack.items = [
        { ...items[0], index: 0 },  // 铁剑
        { ...items[4], index: 1 },  // 生命药水 x3
        { ...items[6], index: 2 },  // 铁矿石 x5
    ];
}

// 打开背包
function openBackpack() {
    backpack.isOpen = true;
    backpack.selectedItem = null;
    backpack.dragItem = null;
    backpack.dragIndex = -1;
}

// 关闭背包
function closeBackpack() {
    backpack.isOpen = false;
    backpack.selectedItem = null;
    backpack.dragItem = null;
    backpack.dragIndex = -1;
}

// 切换背包
function toggleBackpack() {
    if (backpack.isOpen) {
        closeBackpack();
    } else {
        openBackpack();
    }
}

// 使用物品
function useItem(itemIndex) {
    const item = backpack.items.find(i => i.index === itemIndex);
    if (!item) return false;
    
    if (item.type === ITEM_TYPES.CONSUMABLE) {
        // 消耗品：使用效果
        if (item.attrs.hp) {
            const healAmount = Math.min(item.attrs.hp, player.maxHp - player.hp);
            player.hp += healAmount;
            game.playSound('levelup');
            game.showMessage('+' + healAmount + ' HP', '#44ff44');
        }
        if (item.attrs.gold) {
            game.gold += item.attrs.gold;
            game.showMessage('+' + item.attrs.gold + ' 金币', '#ffd700');
        }
        
        // 减少数量
        item.count--;
        if (item.count <= 0) {
            backpack.items = backpack.items.filter(i => i.index !== itemIndex);
        }
        return true;
    } else if (item.type === ITEM_TYPES.WEAPON || item.type === ITEM_TYPES.ARMOR) {
        // 装备：显示装备提示（实际装备逻辑可后续扩展）
        game.showMessage('装备: ' + item.name, '#00ff00');
        return true;
    }
    
    return false;
}

// 拖拽整理物品
function swapItems(fromIndex, toIndex) {
    const fromItem = backpack.items.find(i => i.index === fromIndex);
    const toItem = backpack.items.find(i => i.index === toIndex);
    
    if (fromItem) {
        fromItem.index = toIndex;
    }
    if (toItem) {
        toItem.index = fromIndex;
    }
    
    // 重新排序
    backpack.items.sort((a, b) => a.index - b.index);
}

// 获取背包显示状态
function getBackpackDisplayState() {
    return {
        isOpen: backpack.isOpen,
        capacity: backpack.capacity,
        itemCount: backpack.items.length,
        items: backpack.items,
        selectedItem: backpack.selectedItem,
        dragItem: backpack.dragItem,
        dragIndex: backpack.dragIndex
    };
}

// 绘制背包按钮 - v1.5.6: 背包入口
function drawBackpackButton() {
    const btnPos = getRightButtonsStartPos();
    const btnX = btnPos.x;
    const btnY = btnPos.y + (UI_INTERACTION.minButtonSize + UI_INTERACTION.buttonSpacing) * 4;  // 第5个按钮
    const btnSize = UI_INTERACTION.minButtonSize;  // 44px
    
    // 按钮背景
    ctx.fillStyle = backpack.isOpen ? '#9f7aea' : '#4a5568';
    ctx.fillRect(btnX, btnY, btnSize, btnSize);
    
    // 按钮边框
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnSize, btnSize);
    
    // 背包图标
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎒', btnX + btnSize/2, btnY + btnSize/2 + 6);
    ctx.textAlign = 'left';
    
    // 记录按钮区域供点击检测
    game.uiButtons = game.uiButtons || {};
    game.uiButtons.backpack = { x: btnX, y: btnY, width: btnSize, height: btnSize, bgColor: '#4a5568', icon: '🎒' };
}

// 绘制背包界面 - v1.5.6: 背包UI
function drawBackpackUI() {
    if (!backpack.isOpen) return;
    
    // 半透明遮罩背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    // 背包面板参数
    const panelWidth = 400;
    const panelHeight = 450;
    const panelX = (CONFIG.width - panelWidth) / 2;
    const panelY = (CONFIG.height - panelHeight) / 2;
    
    // 动画效果
    const animProgress = game.backpackAnimProgress || 1;
    const scale = 0.9 + 0.1 * animProgress;
    const offsetX = panelX * (1 - animProgress);
    const offsetY = panelY * (1 - animProgress);
    const drawWidth = panelWidth * scale;
    const drawHeight = panelHeight * scale;
    const drawX = (CONFIG.width - drawWidth) / 2;
    const drawY = (CONFIG.height - drawHeight) / 2;
    
    // 面板背景
    ctx.fillStyle = 'rgba(30, 30, 50, 0.95)';
    ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
    
    // 面板边框
    ctx.strokeStyle = '#9f7aea';
    ctx.lineWidth = 3;
    ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);
    
    // 标题栏
    ctx.fillStyle = '#9f7aea';
    ctx.fillRect(drawX, drawY, drawWidth, 50);
    
    // 标题文字
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('🎒 背包', drawX + drawWidth / 2, drawY + 35);
    
    // 关闭按钮
    const closeBtnSize = 30;
    const closeBtnX = drawX + drawWidth - closeBtnSize - 10;
    const closeBtnY = drawY + 10;
    ctx.fillStyle = '#e53e3e';
    ctx.fillRect(closeBtnX, closeBtnY, closeBtnSize, closeBtnSize);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('×', closeBtnX + closeBtnSize / 2, closeBtnY + 22);
    
    // 物品网格区
    const gridCols = 4;
    const gridRows = 4;
    const gridStartX = drawX + 30;
    const gridStartY = drawY + 70;
    const cellSize = 80;
    const cellSpacing = 10;
    
    // 绘制网格
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const cellIndex = row * gridCols + col;
            const cellX = gridStartX + col * (cellSize + cellSpacing);
            const cellY = gridStartY + row * (cellSize + cellSpacing);
            
            // 格子背景
            ctx.fillStyle = 'rgba(60, 60, 80, 0.8)';
            ctx.fillRect(cellX, cellY, cellSize, cellSize);
            ctx.strokeStyle = '#4a5568';
            ctx.lineWidth = 2;
            ctx.strokeRect(cellX, cellY, cellSize, cellSize);
            
            // 查找该位置的物品
            const item = backpack.items.find(i => i.index === cellIndex);
            if (item) {
                // 物品图标
                ctx.font = '36px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(item.icon, cellX + cellSize / 2, cellY + cellSize / 2 + 12);
                
                // 物品数量
                if (item.count > 1) {
                    ctx.fillStyle = '#ffd700';
                    ctx.font = 'bold 14px Arial';
                    ctx.textAlign = 'right';
                    ctx.fillText('x' + item.count, cellX + cellSize - 5, cellY + cellSize - 5);
                }
                
                // 选中状态
                if (backpack.selectedItem === cellIndex) {
                    ctx.strokeStyle = '#00ff00';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(cellX, cellY, cellSize, cellSize);
                }
            }
        }
    }
    
    // 底部状态栏 - 容量显示
    const capacityY = drawY + panelHeight - 40;
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(drawX + 20, capacityY, panelWidth - 40, 30);
    
    ctx.fillStyle = '#fff';
    ctx.font = '16px Microsoft YaHei';
    ctx.textAlign = 'left';
    ctx.fillText('容量: ' + backpack.items.length + '/' + backpack.capacity, drawX + 30, capacityY + 21);
    
    // 物品详情面板
    if (backpack.selectedItem !== null) {
        const selectedItemData = backpack.items.find(i => i.index === backpack.selectedItem);
        if (selectedItemData) {
            const detailY = drawY + panelHeight - 120;
            ctx.fillStyle = 'rgba(40, 40, 60, 0.9)';
            ctx.fillRect(drawX + 20, detailY, panelWidth - 40, 70);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Microsoft YaHei';
            ctx.textAlign = 'left';
            ctx.fillText(selectedItemData.name, drawX + 30, detailY + 20);
            
            ctx.fillStyle = '#aaa';
            ctx.font = '12px Microsoft YaHei';
            ctx.fillText(selectedItemData.desc, drawX + 30, detailY + 40);
            
            // 使用按钮提示
            ctx.fillStyle = selectedItemData.type === ITEM_TYPES.CONSUMABLE ? '#48bb78' : '#aaa';
            ctx.font = '14px Microsoft YaHei';
            ctx.textAlign = 'right';
            const useText = selectedItemData.type === ITEM_TYPES.CONSUMABLE ? '点击使用' : '点击查看';
            ctx.fillText(useText, drawX + panelWidth - 30, detailY + 20);
        }
    }
    
    ctx.textAlign = 'left';
    
    // 记录关闭按钮区域供点击检测
    game.backpackCloseBtn = { x: closeBtnX, y: closeBtnY, width: closeBtnSize, height: closeBtnSize };
}

// 更新背包动画
function updateBackpackAnim(deltaTime) {
    if (backpack.isOpen && (!game.backpackAnimProgress || game.backpackAnimProgress < 1)) {
        game.backpackAnimProgress = Math.min(1, (game.backpackAnimProgress || 0) + deltaTime * 5);
    } else if (!backpack.isOpen && game.backpackAnimProgress > 0) {
        game.backpackAnimProgress = Math.max(0, game.backpackAnimProgress - deltaTime * 5);
    }
}

// 背包点击检测
function handleBackpackClick(x, y) {
    if (!backpack.isOpen) return false;
    
    // 检查关闭按钮
    if (game.backpackCloseBtn) {
        if (x >= game.backpackCloseBtn.x && x <= game.backpackCloseBtn.x + game.backpackCloseBtn.width &&
            y >= game.backpackCloseBtn.y && y <= game.backpackCloseBtn.y + game.backpackCloseBtn.height) {
            closeBackpack();
            return true;
        }
    }
    
    // 面板参数
    const panelWidth = 400;
    const panelHeight = 450;
    const drawX = (CONFIG.width - panelWidth * (0.9 + 0.1 * (game.backpackAnimProgress || 1))) / 2;
    const drawY = (CONFIG.height - panelHeight * (0.9 + 0.1 * (game.backpackAnimProgress || 1))) / 2;
    
    // 检查是否点击在网格区域
    const gridCols = 4;
    const gridRows = 4;
    const gridStartX = drawX + 30;
    const gridStartY = drawY + 70;
    const cellSize = 80;
    const cellSpacing = 10;
    
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const cellIndex = row * gridCols + col;
            const cellX = gridStartX + col * (cellSize + cellSpacing);
            const cellY = gridStartY + row * (cellSize + cellSpacing);
            
            if (x >= cellX && x <= cellX + cellSize && y >= cellY && y <= cellY + cellSize) {
                // 点击了物品格子
                const clickedItem = backpack.items.find(i => i.index === cellIndex);
                
                if (clickedItem) {
                    if (backpack.selectedItem === cellIndex) {
                        // 再次点击，使用物品
                        useItem(cellIndex);
                        backpack.selectedItem = null;
                    } else {
                        // 选中物品
                        backpack.selectedItem = cellIndex;
                    }
                } else {
                    // 点击空格子，取消选中
                    backpack.selectedItem = null;
                }
                return true;
            }
        }
    }
    
    // 点击遮罩区域，关闭背包
    closeBackpack();
    return true;
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        backpack,
        initBackpack,
        openBackpack,
        closeBackpack,
        toggleBackpack,
        useItem,
        swapItems,
        getBackpackDisplayState,
        drawBackpackButton,
        drawBackpackUI,
        updateBackpackAnim,
        handleBackpackClick,
        ITEM_TYPES,
        ITEM_ICONS
    };
}
