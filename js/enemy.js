// ===== v1.0.0 怪物模块 =====

const ENEMY_TYPES = {
    阴魂: { hp: 20, attack: 5, exp: 20, speed: 50, color: '#7b2d8e' },
    妖狼: { hp: 30, attack: 10, exp: 35, speed: 80, color: '#8B4513' },
    毒蛛: { hp: 25, attack: 8, exp: 30, speed: 40, color: '#2E8B57' },
    僵尸: { hp: 50, attack: 12, exp: 50, speed: 30, color: '#4A5D23' }
};

class Enemy {
    constructor(x, type) {
        const config = ENEMY_TYPES[type] || ENEMY_TYPES['阴魂'];
        this.x = x;
        this.y = CONFIG.groundY;
        this.width = 40;
        this.height = 50;
        this.type = type;
        this.hp = config.hp;
        this.maxHp = config.hp;
        this.attack = config.attack;
        this.exp = config.exp;
        this.speed = config.speed;
        this.color = config.color;
        this.alive = true;
        this.attackCooldown = 0;
    }

    update(dt) {
        if (!this.alive) return;
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        
        const dist = player.x - this.x;
        if (dist > 0 && dist < 300) this.x += this.speed * dt;
        
        if (Math.abs(dist) < player.attackRange && this.attackCooldown <= 0) {
            this.attackPlayer();
        }
    }

    attackPlayer() {
        this.attackCooldown = 1;
        const died = player.takeDamage(this.attack);
        if (died) game.gameOver = true;
    }

    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
            player.exp += this.exp;
            game.killCount++;
            return true;
        }
        return false;
    }

    draw() {
        if (!this.alive) return;
        const screenX = this.x - CONFIG.cameraOffset;
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX, this.y - this.height, this.width, this.height);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(screenX + 5, this.y - this.height + 10, 8, 8);
        ctx.fillRect(screenX + 25, this.y - this.height + 10, 8, 8);
        ctx.fillStyle = '#333';
        ctx.fillRect(screenX, this.y - this.height - 10, this.width, 5);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(screenX, this.y - this.height - 10, this.width * (this.hp / this.maxHp), 5);
    }
}

function spawnEnemy() {
    const types = Object.keys(ENEMY_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    game.enemies.push(new Enemy(player.x + 200 + Math.random() * 200, type));
}
