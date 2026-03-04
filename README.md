# MiniGame002 修仙推图游戏

## 项目简介
一款自动挂机修仙题材的推图小游戏，玩家自动前进、自动战斗、自动升级。

## 文件结构

```
js/
├── config.js   # 配置与常量
├── game.js    # 游戏状态
├── player.js  # 玩家模块
├── enemy.js   # 怪物模块
├── scene.js   # 场景模块
├── ui.js      # UI界面
└── main.js    # 游戏主循环
```

## 加载顺序 (index.html)

```html
<script src="js/config.js"></script>   <!-- 1. 配置 + canvas -->
<script src="js/game.js"></script>    <!-- 2. 游戏状态 -->
<script src="js/player.js"></script>   <!-- 3. 玩家 -->
<script src="js/scene.js"></script>    <!-- 4. 场景 -->
<script src="js/enemy.js"></script>    <!-- 5. 怪物 -->
<script src="js/ui.js"></script>        <!-- 6. UI -->
<script src="js/main.js"></script>      <!-- 7. 主循环 -->
```

**规则**：后面的文件可以调用前面定义的函数/变量，前面的文件不能调用后面的。

---

## 模块详解

### 1. config.js - 配置与常量

**职责**：存放所有全局配置、常量、canvas 初始化

**主要定义**：
| 名称 | 说明 |
|------|------|
| `canvas` | Canvas 元素 |
| `ctx` | 2D 绘图上下文 |
| `CONFIG` | 游戏配置 { width, height, groundY, cameraOffset } |
| `BATTLE_STATES` | 战斗状态 { ADVANCE, COMBAT, VICTORY } |
| `REALMS` | 境界数组 [{ name, minLevel }] |
| `REALM_COLORS` | 境界颜色映射 |

---

### 2. game.js - 游戏状态

**职责**：管理游戏全局状态

**主要属性**：
| 属性 | 类型 | 说明 |
|------|------|------|
| `state` | string | 游戏状态 |
| `running` | boolean | 是否运行中 |
| `gameOver` | boolean | 游戏是否结束 |
| `enemies` | array | 怪物数组 |
| `spawnTimer` | number | 怪物生成计时器 |
| `spawnInterval` | number | 怪物生成间隔(ms) |
| `killCount` | number | 击杀数 |
| `damageNumbers` | array | 伤害数字数组 |

**主要方法**：
| 方法 | 说明 |
|------|------|
| `restart()` | 重新开始游戏 |
| `addDamageNumber()` | 添加伤害数字 |
| `updateDamageNumbers()` | 更新伤害数字 |
| `drawDamageNumbers()` | 绘制伤害数字 |

---

### 3. player.js - 玩家模块

**职责**：管理玩家属性和行为

**主要属性**：
| 属性 | 类型 | 说明 |
|------|------|------|
| `x` | number | X坐标 |
| `y` | number | Y坐标 |
| `width` | number | 宽度(32px) |
| `height` | number | 高度(48px) |
| `level` | number | 等级 |
| `hp` | number | 当前生命值 |
| `maxHp` | number | 最大生命值 |
| `attack` | number | 攻击力 |
| `speed` | number | 移动速度(0.8) |
| `attackRange` | number | 攻击范围(80px) |
| `attackCooldown` | number | 攻击冷却 |
| `attackInterval` | number | 攻击间隔(1.2s) |
| `critRate` | number | 暴击率(0.05) |
| `critDamage` | number | 暴击伤害倍率(2.0) |
| `exp` | number | 经验值 |
| `requiredExp` | number | 升级所需经验 |
| `attacking` | boolean | 是否在攻击 |
| `robeColor` | string | 衣服颜色 |
| `robeAccentColor` | string | 衣服装饰色 |
| `hairColor` | string | 头发颜色 |
| `weaponColor` | string | 武器颜色 |

**主要方法**：
| 方法 | 说明 |
|------|------|
| `update(dt)` | 更新玩家状态 |
| `attackTarget(enemy)` | 攻击敌人 |
| `takeDamage(damage)` | 受到伤害 |
| `levelUp()` | 升级 |
| `draw()` | 绘制玩家 |

---

### 4. enemy.js - 怪物模块

**职责**：定义怪物类型和 Enemy 类

**主要定义**：
| 名称 | 说明 |
|------|------|
| `ENEMY_TYPES` | 怪物类型配置 { hp, attack, exp, speed, color, size } |
| `Enemy` | 怪物类 |
| `spawnEnemy()` | 生成怪物函数 |

**Enemy 类属性**：
| 属性 | 说明 |
|------|------|
| `x`, `y` | 坐标 |
| `width`, `height` | 尺寸 |
| `type` | 怪物类型 |
| `realm` | 境界 |
| `hp`, `maxHp` | 生命值 |
| `attack` | 攻击力 |
| `exp` | 经验值 |
| `speed` | 移动速度 |
| `alive` | 是否存活 |

**Enemy 类方法**：
| 方法 | 说明 |
|------|------|
| `update(dt)` | 更新怪物状态 |
| `attackPlayer()` | 攻击玩家 |
| `takeDamage(damage)` | 受到伤害 |
| `draw()` | 绘制怪物 |

---

### 5. scene.js - 场景模块

**职责**：绘制游戏背景和场景效果

**主要定义**：
| 名称 | 说明 |
|------|------|
| `SCENES` | 场景配置数组 |
| `SKY_THEMES` | 天空主题配色 |
| `CLOUD_CONFIG` | 云朵配置 |
| `sceneState` | 场景状态 { clouds, stars, groundDetails } |

**主要函数**：
| 函数 | 说明 |
|------|------|
| `getScene(distance)` | 根据距离获取场景 |
| `drawBackground()` | 绘制背景 |
| `drawClouds()` | 绘制云朵 |
| `drawStars()` | 绘制星星 |
| `drawGroundDetails()` | 绘制地面细节 |

---

### 6. ui.js - UI界面

**职责**：绘制游戏 HUD 界面

**主要函数**：
| 函数 | 说明 |
|------|------|
| `drawUI()` | 绘制所有UI元素 |

**UI 元素**：
- 境界显示
- 等级
- 血条
- 攻击力
- 击杀数
- 距离
- 场景名称

---

### 7. main.js - 游戏主循环

**职责**：游戏核心循环逻辑

**主要函数**：
| 函数 | 说明 |
|------|------|
| `update(dt)` | 更新游戏状态 |
| `draw()` | 绘制游戏画面 |
| `gameLoop(timestamp)` | 主循环 |
| `startGame()` | 开始游戏 |

**核心逻辑**：
1. 玩家自动向右移动
2. 定时生成怪物
3. 怪物自动靠近玩家
4. 玩家自动攻击范围内怪物
5. 怪物死亡掉落经验
6. 经验足够自动升级

---

## 版本管理

版本信息存储在 `version.txt`：
```
需求版本: v1.x.x
客户端版本: v1.x.x
```

---

## 注意事项

1. **全局常量放 config.js**：所有文件共享，避免重复定义
2. **加载顺序**：后面的文件可以调用前面的，前面不能调用后面的
3. **语法检查**：修改后运行 `node --check` 验证语法
