const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const gravity = 0.5;

class Player {
    constructor(x, y, color) {
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.width = 50;
        this.height = 50;
        this.color = color;
        this.health = 100;
        this.isJumping = false;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            width: 100,
            height: 50
        }
        this.isAttacking = false;
        this.lastAttack = 0;
        this.attackCooldown = 500;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        if (this.isAttacking) {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }
    }

    update() {
        this.draw();
        this.attackBox.position.x = this.position.x;
        this.attackBox.position.y = this.position.y;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.height + this.velocity.y >= canvas.height) {
            this.velocity.y = 0;
            this.isJumping = false;
        } else {
            this.velocity.y += gravity;
        }
    }

    attack() {
        const now = Date.now();
        if (now - this.lastAttack > this.attackCooldown) {
            this.isAttacking = true;
            this.lastAttack = now;
            setTimeout(() => {
                this.isAttacking = false;
            }, 100);
        }
    }
}

class Platform {
    constructor(x, y, width, height) {
        this.position = { x, y };
        this.width = width;
        this.height = height;
    }

    draw() {
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

const player1 = new Player(100, 100, 'blue');
const player2 = new Player(650, 100, 'green');

const platforms = [
    new Platform(200, 400, 400, 20),
    new Platform(100, 250, 200, 20),
    new Platform(500, 250, 200, 20)
];

const keys = {
    a: { pressed: false },
    d: { pressed: false },
    w: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
    ArrowUp: { pressed: false }
};

let timer = 10;
let gameOver = false;

function animate() {
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2);
        return;
    }

    window.requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    platforms.forEach(platform => {
        platform.draw();
    });

    player1.update();
    player2.update();

    // Player 1 movement
    player1.velocity.x = 0;
    if (keys.a.pressed) {
        player1.velocity.x = -5;
    } else if (keys.d.pressed) {
        player1.velocity.x = 5;
    }

    // Player 2 movement
    player2.velocity.x = 0;
    if (keys.ArrowLeft.pressed) {
        player2.velocity.x = -5;
    } else if (keys.ArrowRight.pressed) {
        player2.velocity.x = 5;
    }

    // Platform collision
    platforms.forEach(platform => {
        // Player 1
        if (player1.position.y + player1.height <= platform.position.y &&
            player1.position.y + player1.height + player1.velocity.y >= platform.position.y &&
            player1.position.x + player1.width >= platform.position.x &&
            player1.position.x <= platform.position.x + platform.width) {
            player1.velocity.y = 0;
            player1.isJumping = false;
        }
        // Player 2
        if (player2.position.y + player2.height <= platform.position.y &&
            player2.position.y + player2.height + player2.velocity.y >= platform.position.y &&
            player2.position.x + player2.width >= platform.position.x &&
            player2.position.x <= platform.position.x + platform.width) {
            player2.velocity.y = 0;
            player2.isJumping = false;
        }
    });

    // Collision detection
    if (player1.isAttacking &&
        player1.attackBox.position.x + player1.attackBox.width >= player2.position.x &&
        player1.attackBox.position.x <= player2.position.x + player2.width &&
        player1.attackBox.position.y + player1.attackBox.height >= player2.position.y &&
        player1.attackBox.position.y <= player2.position.y + player2.height) {
        player2.health -= 10;
        document.querySelector('#player2Health .health-bar').style.width = player2.health + '%';
        player1.isAttacking = false;
        player2.velocity.x = 10;
    }

    if (player2.isAttacking &&
        player2.attackBox.position.x + player2.attackBox.width >= player1.position.x &&
        player2.attackBox.position.x <= player1.position.x + player1.width &&
        player2.attackBox.position.y + player2.attackBox.height >= player1.position.y &&
        player2.attackBox.position.y <= player1.position.y + player1.height) {
        player1.health -= 10;
        document.querySelector('#player1Health .health-bar').style.width = player1.health + '%';
        player2.isAttacking = false;
        player1.velocity.x = -10;
    }

    if (player1.health <= 0 || player2.health <= 0) {
        gameOver = true;
    }
}

function updateTimer() {
    if (timer > 0) {
        timer--;
        document.getElementById('timer').innerText = timer;
        setTimeout(updateTimer, 1000);
    } else {
        gameOver = true;
    }
}

animate();
updateTimer();

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = true;
            break;
        case 'a':
            keys.a.pressed = true;
            break;
        case 'w':
            if (!player1.isJumping) {
                player1.velocity.y = -15;
                player1.isJumping = true;
            }
            break;
        case ' ':
            player1.attack();
            break;

        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            break;
        case 'ArrowUp':
            if (!player2.isJumping) {
                player2.velocity.y = -15;
                player2.isJumping = true;
            }
            break;
        case 'Enter':
            player2.attack();
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;

        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
    }
});