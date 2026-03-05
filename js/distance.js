/**
 * distance.js - 距离常量与换算函数
 * 统一规则：10像素 = 1米
 */

// 距离常量
const PIXELS_PER_METER = 10; // 10像素 = 1米

// 距离转换函数
function pixelsToMeters(pixels) {
    return Math.round(pixels / PIXELS_PER_METER);
}

function metersToPixels(meters) {
    return meters * PIXELS_PER_METER;
}

// 格式化距离显示
function formatDistance(pixels) {
    const meters = pixelsToMeters(pixels);
    return meters + '米';
}
