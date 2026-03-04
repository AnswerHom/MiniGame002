# MiniGame002 代码重构规划

## 当前问题
- 所有代码（约3800行）都在 `js/game.js` 中
- 难以维护、团队协作困难

## 模块结构规划

```
js/
├── main.js             # 游戏入口、初始化、游戏循环
├── config.js           # 所有静态配置数据
├── player.js           # 玩家属性、状态、行为
├── enemy.js            # 怪物类、AI逻辑
├── ui.js               # UI界面（状态栏、背包、技能栏等）
├── inventory.js        # 背包系统
├── equipment.js        # 装备系统
├── skills.js           # 技能系统
├── dungeon.js          # 副本系统
├── scene.js            # 场景管理
└── utils.js            # 工具函数
```

## 拆分优先级

### P0 - 紧急（影响运行）
1. **config.js** - 配置数据分离
2. **main.js** - 入口和循环

### P1 - 高（核心功能）
3. **player.js** - 玩家模块
4. **enemy.js** - 怪物模块
5. **ui.js** - UI模块

### P2 - 中（系统功能）
6. **equipment.js** - 装备系统
7. **skills.js** - 技能系统
8. **inventory.js** - 背包系统

### P3 - 低（扩展功能）
9. **dungeon.js** - 副本系统
10. **scene.js** - 场景管理
11. **utils.js** - 工具函数

## 拆分进度

### ✅ 已完成
- [x] **config.js** - 基础配置分离
- [x] **player.js** - 玩家模块分离
- [x] **enemy.js** - 怪物模块分离

### ⏳ 待处理
- [ ] **ui.js** - UI模块（可选拆分）
- [ ] **systems.js** - 系统配置（WEAPONS等，可选拆分）

### ⏳ 待处理
- [ ] **main.js** - 入口和循环
- [ ] **enemy.js** - 怪物模块
- [ ] **ui.js** - UI模块
- [ ] **equipment.js** - 装备系统
- [ ] **skills.js** - 技能系统
- [ ] **inventory.js** - 背包系统
- [ ] **dungeon.js** - 副本系统
- [ ] **scene.js** - 场景管理
- [ ] **utils.js** - 工具函数
