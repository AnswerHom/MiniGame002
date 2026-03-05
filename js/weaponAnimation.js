// v1.5.1: 武器动画配置模块
// 主角武器动画优化 - 攻击时武器动态效果

const WEAPON_ANIMATION = {
    // 摇摆配置
    swingAngle: 15,        // 摇摆角度（度）
    swingSpeed: 8,         // 摇摆速度
    swingEase: 'ease-in-out',
    
    // 闲置时微动
    idleSwayAmount: 3,     // 闲置时摇摆幅度（度）
    idleSwaySpeed: 2,      // 闲置时摇摆速度
    
    // 攻击时摆动时间轴（秒）
    attackTimeline: {
        forward: 0.1,   // 前摆
        swing: 0.15,    // 挥动
        back: 0.1       // 回摆
    }
};

// 武器类型配置
const WEAPON_TYPES = {
    sword: {
        name: '剑',
        swingAngle: 15,
        hasRotation: false,
        hasVibration: false
    },
    blade: {
        name: '刀',
        swingAngle: 20,
        hasRotation: true,
        rotationAngle: 30,
        hasVibration: false
    },
    spear: {
        name: '枪',
        swingAngle: 10,
        hasRotation: false,
        hasVibration: true,
        vibrationAmount: 3
    }
};
