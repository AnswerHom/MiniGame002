/**
 * distance.js - 距离常量与换算函数
 * 统一规则：10像素 = 1米
 * v1.5.7: 统一度量规则
 */

// ===== 基础规则定义 =====
// 10像素 = 1米
const PIXELS_PER_METER = 10;

// 距离转换函数
function pixelsToMeters(pixels) {
    return Math.round(pixels / PIXELS_PER_METER);
}

function metersToPixels(meters) {
    return meters * PIXELS_PER_METER;
}

// 格式化距离显示（返回带单位的字符串）
function formatDistance(pixels) {
    const meters = pixelsToMeters(pixels);
    return meters + '米';
}

// ===== 战斗系统距离配置 =====
const DistanceConfig = {
    // 主角视野范围：300px = 30米（发现怪物的距离）
    PLAYER_VIEW: 300,           // 30米 - 主角视野
    
    // 怪物视野范围：200px = 20米（怪物发现主角的距离）
    MONSTER_VIEW: 200,          // 20米 - 怪物视野
    
    // 攻击距离：50px = 5米（主角可攻击怪物的距离）
    ATTACK_RANGE: 50,           // 5米 - 主角攻击距离
    
    // 怪物攻击距离：40px = 4米（怪物可攻击主角的距离）
    MONSTER_ATTACK_RANGE: 40,   // 4米 - 怪物攻击距离
    
    // 追击触发距离：250px = 25米（怪物开始追击的距离）
    CHASE_RANGE: 250,           // 25米 - 追击距离
};

// ===== 导出配置（兼容模块化）=====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PIXELS_PER_METER,
        DistanceConfig,
        pixelsToMeters,
        metersToPixels,
        formatDistance
    };
}
