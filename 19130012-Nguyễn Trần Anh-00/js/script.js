const canvas = $('canvas')[0];
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;


const WIDTH_SKIS = 200;
const HEIGH_SKIS = 20;


const WIDTH_BRICK = 90;
const HEIGH_BRICK = 30;
const NUM_COL = 7;
const NUM_ROW = 5;

const BALL_RADIUS = 15;
const SKILL_RADIUS = 10;

let FPS;
let SPEED;
let seconds = 0;

let level = 1;


let balls;
let game;
let skis;
let array_Brick;
let array_upgrape;
let duplexTeleport;
let boss;
let bullets;


let scoreText = $('.score_container').get(0);
let levelText = $('.level_container').get(0);
let ballText = $('.ball_container').get(0);


let divLevel1 = $('.level1').get(0);
let divLevel2 = $('.level2').get(0);
let divLevel3 = $('.level3').get(0);
let divLevel4 = $('.level4').get(0);
let divLevel5 = $('.level5').get(0);
let divLevel6 = $('.level6').get(0);


let ballDiv;

let isSwitch = false;

let inputVelocity = {
    x: 0
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


class UpgradeSkis {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.skill = Math.floor(Math.random() * 4) + 1;
        this.isDrop = false;
    }

    drop() {
        this.isDrop = true;

    }

    moveDown() {
        if (this.isDrop)
            this.y += 2;
    }

    draw() {
        if (this.isDrop === true) {
            switch (this.skill) {
                case 1:
                    ctx.strokeStyle = 'violet';
                    break;
                case 2:
                    ctx.strokeStyle = 'white';
                    break;
                case 3:
                    ctx.strokeStyle = 'yellow';
                    break;
                case 4:
                    ctx.strokeStyle = 'orange';
                    break;
            }

            var rot = Math.PI / 2 * 3;
            var x = this.x;
            var y = this.y;
            var spikes = 5;
            var step = Math.PI / spikes;
            var outerRadius = 3;
            var innerRadius = 1.5;

            ctx.beginPath();
            ctx.moveTo(this.x, this.y - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = this.x + Math.cos(rot) * outerRadius;
                y = this.y + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = this.x + Math.cos(rot) * innerRadius;
                y = this.y + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }

            ctx.lineTo(this.x, this.y - outerRadius)
            ctx.closePath();
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.fill();


        }
    }

    checkCollisionWithSkis() {
        if (this.x + SKILL_RADIUS > skis.x && this.x - SKILL_RADIUS < skis.x + skis.width && this.y + SKILL_RADIUS >= skis.y && this.y < skis.y + HEIGH_SKIS) {
            return true;
        }
        return false;
    }
}


class Array_Upgrape {
    constructor() {
        this.list_Upgrape = [];
    }


    add(upgrapeSkis) {
        if (upgrapeSkis !== undefined) {
            upgrapeSkis.drop();
            this.list_Upgrape.push(upgrapeSkis);
        }

    }

    remove(i) {
        this.list_Upgrape.splice(i, 1);
    }

    draw() {
        for (let i = 0; i < this.list_Upgrape.length; i++) {
            this.list_Upgrape[i].draw();
        }
    }

    checkUpgrape() {
        for (let i = 0; i < this.list_Upgrape.length; i++) {
            this.list_Upgrape[i].moveDown();
            if (this.list_Upgrape[i].checkCollisionWithSkis() === true) {
                skis.upgrape(this.list_Upgrape[i]);
                this.remove(i);
                if (i > 0)
                    i--;
            }
        }
    }
}

class Brick {
    constructor(x, y, stiffness, countForExtraPoint, hard) {
        this.x = x;
        this.y = y;
        this.stiffness = stiffness;
        this.countForExtraPoint = countForExtraPoint;
        this.hard = hard;
    }

    draw() {
        switch (this.hard) {
            case true:
                ctx.fillStyle = 'grey';
                break;
            case false:
                switch (this.stiffness) {
                    case 1:
                        ctx.fillStyle = 'blue';
                        break;
                    case  2:
                        ctx.fillStyle = 'red';
                        break;
                    case 3:
                        ctx.fillStyle = 'green';
                        break;
                }

                break;
        }
        ctx.fillRect(this.x, this.y, WIDTH_BRICK, HEIGH_BRICK);

    }

    addUpgrape(upgrapeSkis) {
        this.upgradeSkis = upgrapeSkis;
    }

    collisionWithBall(ball) {
        let px = ball.x;
        let py = ball.y;

        if (px <= this.x)
            px = this.x;
        else if (px > this.x + WIDTH_BRICK)
            px = this.x + WIDTH_BRICK;

        if (py <= this.y)
            py = this.y;
        else if (py > this.y + HEIGH_BRICK)
            py = this.y + HEIGH_BRICK;

        let dx = ball.x - px;
        let dy = ball.y - py;

        return (dx * dx + dy * dy) <= ball.radius * ball.radius;
    }

    collisionWithBulletSkis(bullet) {
        var bx = bullet.x;
        var by = bullet.y;

        if (bx <= this.x)
            bx = this.x;
        else if (bx > this.x + WIDTH_BRICK)
            bx = this.x + WIDTH_BRICK;

        if (by <= this.y)
            by = this.y;
        else if (by > this.y + HEIGH_BRICK)
            by = this.y + HEIGH_BRICK;

        let cx = bullet.x - bx;
        let cy = bullet.y - by;

        return (cx * cx + cy * cy) <= bullet.radius * bullet.radius;
    }

    sideCollision(ball) {
        if (this.x > ball.x + 5 || this.x + WIDTH_BRICK < ball.x - 5) {
            return true;
        }
        return false;
    }

    topBotCollision(ball) {
        if (this.y >= ball.y || this.y + HEIGH_BRICK <= ball.y) {
            return true;
        }
        return false;
    }

}

class Array_Brick {
    constructor() {
        this.array_brick = [];
        this.array_brick_hard = [];
    }

    generate() {
        let ranNum;
        let brick;
        switch (level) {

            case 6:
                boss = new Boss();
                break;
            case 5:
                duplexTeleport = new DuplexTeleport();
                duplexTeleport.generateDuplexTeleport();
                for (let i = 0; i < NUM_ROW; i++) {
                    let rowBrick = [];
                    for (let j = 0; j < NUM_COL; j++) {
                        brick = new Brick(120 + (j * WIDTH_BRICK) + 25 * j, 30 + (i * HEIGH_BRICK) + 10 * i, (Math.floor(Math.random() * 3)) + 1, 5, false);
                        ranNum = Math.random();
                        if (ranNum > 0.5) {
                            brick.addUpgrape(new UpgradeSkis(brick.x + WIDTH_BRICK / 2, brick.y + HEIGH_BRICK / 2));
                        }
                        rowBrick.push(brick);
                    }
                    this.array_brick.push(rowBrick);

                }
                break;
            case 4:
                duplexTeleport = new DuplexTeleport();
                duplexTeleport.generateDuplexTeleport();
                for (let i = 0; i < NUM_ROW; i++) {
                    let rowBrick = [];
                    for (let j = 0; j < NUM_COL; j++) {
                        brick = new Brick(120 + (j * WIDTH_BRICK) + 25 * j, 30 + (i * HEIGH_BRICK) + 10 * i, (Math.floor(Math.random() * 3)) + 1, 5, false);
                        ranNum = Math.random();
                        if (ranNum > 0.5) {
                            brick.addUpgrape(new UpgradeSkis(brick.x + WIDTH_BRICK / 2, brick.y + HEIGH_BRICK / 2));
                        }
                        rowBrick.push(brick);
                    }
                    this.array_brick.push(rowBrick);

                }
                break;
            case 3:
                for (let i = 0; i < NUM_ROW; i++) {
                    let rowBrick = [];
                    for (let j = 0; j < NUM_COL; j++) {
                        brick = new Brick(120 + (j * WIDTH_BRICK) + 25 * j, 30 + (i * HEIGH_BRICK) + 10 * i, (Math.floor(Math.random() * 3)) + 1, 5, false);
                        ranNum = Math.random();
                        if (ranNum > 0.5) {
                            brick.addUpgrape(new UpgradeSkis(brick.x + WIDTH_BRICK / 2, brick.y + HEIGH_BRICK / 2));
                        }
                        rowBrick.push(brick);
                    }
                    this.array_brick.push(rowBrick);

                }
                for (let i = 0; i < NUM_COL - 2; i++) {
                    this.array_brick_hard.push(new Brick(100 + (i * WIDTH_BRICK) + 95 * i, 30 + (NUM_ROW * HEIGH_BRICK) + 20 * NUM_ROW, 0, 0, true))
                }

                break;
            case 2 :
                for (let i = 0; i < NUM_ROW; i++) {
                    let rowBrick = [];
                    for (let j = 0; j < NUM_COL; j++) {
                        brick = new Brick(120 + (j * WIDTH_BRICK) + 25 * j, 30 + (i * HEIGH_BRICK) + 10 * i, (Math.floor(Math.random() * 3)) + 1, 5, false);
                        ranNum = Math.random();
                        if (ranNum > 0.5) {
                            brick.addUpgrape(new UpgradeSkis(brick.x + WIDTH_BRICK / 2, brick.y + HEIGH_BRICK / 2));
                        }
                        rowBrick.push(brick);
                    }
                    this.array_brick.push(rowBrick);

                }

                break;

            case 1:
                for (let i = 0; i < NUM_ROW; i++) {
                    let rowBrick = [];
                    for (let j = 0; j < NUM_COL; j++) {
                        brick = new Brick(120 + (j * WIDTH_BRICK) + 25 * j, 30 + (i * HEIGH_BRICK) + 15 * i, (Math.floor(Math.random() * 3)) + 1, 5, false);
                        rowBrick.push(brick);
                    }
                    this.array_brick.push(rowBrick);
                }
                break;
        }

    }

    draw() {
        for (let i = 0; i < this.array_brick.length; i++) {
            for (let j = 0; j < this.array_brick[i].length; j++) {
                this.array_brick[i][j].draw();
            }
        }
        for (let i = 0; i < this.array_brick_hard.length; i++) {
            this.array_brick_hard[i].draw();
        }
    }
}

class Boss {
    constructor() {
        this.w = 300;
        this.h = 100;
        this.x = WIDTH / 2 - this.w / 2;
        this.y = 100;
        this.stiffness = 150;
        this.countForExtraPoint = 10;
        this.dx = 2;
        this.dy = 0;
        this.color = '#50E4FF';
        this.count = 0;
    }

    drawBoss() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle='grey';
        ctx.arc(this.x+80,this.y+this.h,15,0,Math.PI*2);
        ctx.arc(this.x+this.w-80,this.y+this.h,15,0,Math.PI*2);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle='black';
        ctx.arc(this.x+80,this.y+this.h+5,5,0,Math.PI*2);
        ctx.arc(this.x+this.w-80,this.y+this.h+5,5,0,Math.PI*2);
        ctx.fill();
        ctx.closePath();

    }

    moveBoss() {

        if (this.checkCollisionWithWall() === 'right_collision') {
            this.dx *= -1;
            if (this.x + this.w > WIDTH) {
                this.x = WIDTH - this.w;
            }

        } else if (this.checkCollisionWithWall() === 'left_collision') {
            this.dx *= -1;
            if (this.x < 0) {
                this.x = 0;
            }

        }

    }

    changeDirection() {
        this.moveBoss();
        this.x += this.dx;
        if (this.color === 'red') {
            this.count++;
        }
        if (this.count === 10) {
            this.color = '#50E4FF';
            this.count = 0;
        }

    }

    checkCollisionWithWall() {
        if (this.x < 0) {
            return 'left_collision';
        }
        if (this.x + this.w >= WIDTH) {
            return 'right_collision';
        }

        return 'none';
    }

    collisionWithBall(ball) {
        let px = ball.x;
        let py = ball.y;

        if (px <= this.x)
            px = this.x;
        else if (px > this.x + this.w)
            px = this.x + this.w;

        if (py <= this.y)
            py = this.y;
        else if (py > this.y + this.h)
            py = this.y + this.h;

        let dx = ball.x - px;
        let dy = ball.y - py;

        return (dx * dx + dy * dy) <= ball.radius * ball.radius;
    }

    collisionWithBullet(bullet) {
        let bx = bullet.x;
        let by = bullet.y;

        if (bx <= this.x)
            bx = this.x;
        else if (bx > this.x + this.w)
            bx = this.x + this.w;

        if (by <= this.y)
            by = this.y;
        else if (by > this.y + this.h)
            by = this.y + this.h;

        let cx = bullet.x - bx;
        let cy = bullet.y - by;

        return (cx * cx + cy * cy) <= bullet.radius * bullet.radius;
    }

    sideCollision(ball) {
        if (this.x > ball.x + 5 || this.x + this.w < ball.x - 5) {
            return true;
        }
        return false;
    }

    topBotCollision(ball) {
        if (this.y >= ball.y || this.y + this.h <= ball.y) {
            return true;
        }
        return false;
    }

    generateSkill() {
        return new UpgradeSkis(this.x + this.w / 2, this.y + this.h);
    }

}

class Bullet {
    constructor(x, y, entity) {
        this.entity = entity;
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 2;
        this.radius = 5;
        this.damge = 1;
    }

    shoot() {
        if (this.entity === "skis") {
            this.y -= this.dy;
        }
        if (this.entity === "boss") {
            this.y += this.dy;
        }
    }

    drawBullet() {
        ctx.beginPath();
        if (this.entity === "boss")
            ctx.fillStyle = 'red';
        if (this.entity === "skis")
            ctx.fillStyle = 'white';
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    collision() {
        if (this.entity === "boss") {
            if (this.x + this.radius > skis.x && this.x - this.radius < skis.x + skis.width && this.y + this.radius >= skis.y && this.y - this.radius < skis.y + HEIGH_SKIS) {
                game.gameOverState = true;
                game.isAllowReset = true;
                gameOver();
                return true;
            }
            if (this.y + this.radius > HEIGHT) {
                return true;
            }
        }
        if (this.entity === "skis") {
            if (level === 6 && boss.collisionWithBullet(this) === true) {
                if (boss.stiffness > 0) {
                    boss.color = 'red';
                    boss.stiffness -= this.damge;
                    game.score += boss.countForExtraPoint;
                }
                if (boss.stiffness <= 0) {
                    game.score += boss.countForExtraPoint + 1000;
                    game.gameWonState = true;
                }
                scoreText.innerText = game.score < 10 ? `Score : 0${game.score}` : `Score: ${game.score}`;
                return true;
            }
            if (this.y - this.radius < 0) {
                return true;
            }
            if (this.checkCollisionWithBrickNor() === true)
                return true;
        }
        return false;
    }

    checkCollisionWithBrickNor() {
        let array = array_Brick.array_brick;
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < array[i].length; j++) {
                if (array[i][j].collisionWithBulletSkis(this) === true) {
                    if (array[i][j].stiffness > 0)
                        array[i][j].stiffness -= this.damge;
                    if (array[i][j].stiffness <= 0) {
                        game.score += array[i][j].countForExtraPoint;
                        scoreText.innerText = game.score < 10 ? `Score : 0${game.score}` : `Score: ${game.score}`;

                        // skill
                        array_upgrape.add(array[i][j].upgradeSkis);
                        array[i].splice(j, 1);
                        if (array[i].length === 0) {
                            array.splice(i, 1);
                            if (i > 0)
                                i--;
                        }
                        if (array.length === 0) {
                            game.gameWonState = true;
                            break;
                        }
                    }
                    return true;
                }
            }
        }
        return false;
    }
}

class Array_Bullet {
    constructor() {
        this.bullets = [];
    }

    addBullet(entity) {
        if (entity === "boss") {
            this.bullets.push(new Bullet(boss.x, boss.y + boss.h, entity));
            this.bullets.push(new Bullet(boss.x + boss.w, boss.y + boss.h, entity));
        }
        if (entity === "skis") {
            this.bullets.push(new Bullet(skis.x, skis.y, entity));
            this.bullets.push(new Bullet(skis.x + WIDTH_SKIS, skis.y, entity));
        }
    }

    removeBullet(i) {
        drawStar(this.bullets[i].x, this.bullets[i].y, 9, 15, 7, "red");
        this.bullets.splice(i, 1);
    }

    drawBullets() {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].drawBullet();
        }
    }


    checkShooting() {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].shoot();
            if (this.bullets[i].collision() === true) {
                this.removeBullet(i);
            }

        }
    }
}


class Ball {
    array_vector = [-2, -3, 2, 3];

    constructor() {
        this.radius = BALL_RADIUS;
        this.x = skis.x + (skis.width / 2);
        this.y = HEIGHT - 10 - HEIGH_SKIS - this.radius - 1;
        this.dx = this.array_vector[(Math.floor(Math.random() * this.array_vector.length))];
        this.dy = -3;
        this.damge = 1;
        ballText.innerHTML = "Ball  ";
    }


    draw() {
        ctx.beginPath();
        ctx.fillStyle = 'yellow';
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    checkCollisionWithBrickNor() {
        let array = array_Brick.array_brick;
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < array[i].length; j++) {
                if (array[i][j].collisionWithBall(this) === true) {
                    if (array[i][j].stiffness > 0)
                        array[i][j].stiffness -= this.damge;
                    if (array[i][j].topBotCollision(this) === true)
                        this.dy *= -1;
                    else if (array[i][j].sideCollision(this) === true)
                        this.dx *= -1;

                    if (array[i][j].stiffness <= 0) {
                        game.score += array[i][j].countForExtraPoint;
                        scoreText.innerText = game.score < 10 ? `Score : 0${game.score}` : `Score: ${game.score}`;

                        // skill
                        array_upgrape.add(array[i][j].upgradeSkis);
                        array[i].splice(j, 1);


                        if (array[i].length === 0) {
                            array.splice(i, 1);
                            if (i > 0)
                                i--;
                        }
                        if (array.length === 0) {
                            game.gameWonState = true;
                            break;
                        }
                    }
                    return true;
                }
            }
        }
        return false;
    }

    checkCollisionWithBrickHard() {
        for (let i = 0; i < array_Brick.array_brick_hard.length; i++) {
            if (array_Brick.array_brick_hard[i].collisionWithBall(this) === true) {
                if (array_Brick.array_brick_hard[i].sideCollision(this) === true)
                    this.dx *= -1;
                if (array_Brick.array_brick_hard[i].topBotCollision(this) === true) {
                    this.dy *= -1;
                }
                return true;
            }
        }
        return false;
    }

    checkCollisionBoss() {
        if (boss.collisionWithBall(this) === true) {
            if (boss.stiffness > 0) {
                boss.color = 'red';
                boss.stiffness -= this.damge;
                array_upgrape.add(boss.generateSkill());
                game.score += boss.countForExtraPoint;
            }
            if (boss.sideCollision(this) === true) {
                this.dx *= -1;
            }
            if (boss.topBotCollision(this) === true) {
                this.dy *= -1;
            }
            if (boss.stiffness <= 0) {
                game.score += boss.countForExtraPoint + 1000;
                game.gameWonState = true;
            }
            scoreText.innerText = game.score < 10 ? `Score : 0${game.score}` : `Score: ${game.score}`;
            return true;
        }
        return false;
    }

    checkCollisionWithWall() {
        if (this.x + this.dx > WIDTH || this.x + this.dx < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.dy < 0) {
            this.dy = -this.dy;
        }
    }

    checkCollisionWithSkis() {
        if (this.x + this.radius > skis.x && this.x - this.radius < skis.x + skis.width && this.y + this.radius >= skis.y) {
            this.dy = -this.dy;
            this.y = skis.y - this.radius - 1;
        }
    }

    checkCollisionWithTeleport(teleport) {
        var tx = teleport.x - teleport.w / 2;
        var ty = teleport.y - teleport.h / 2;
        var tw = teleport.w;
        var th = teleport.h;
        if (this.x > tx && this.x < tx + tw && this.y > ty && this.y < ty + th) {
            return true;
        }
        return false;
    }

    checkRemove() {
        if (this.y + this.radius > HEIGHT) {
            for (let i = 0; i < balls.balls.length; i++) {
                if (this === balls.balls[i])
                    balls.removeBall(i);
            }
        }
    }

    changeDirection() {
        if (level === 4 || level === 5) {
            for (let i = 0; i < duplexTeleport.teleports.length; i++) {
                var teleport = duplexTeleport.teleports[i];
                if (this.checkCollisionWithTeleport(teleport) === true) {
                    if (this.dy > 0) {
                        this.x = teleport.wayOut.x;
                        this.y = teleport.wayOut.y + teleport.wayOut.h / 2 + 5;

                    }
                    if (this.dy < 0) {
                        this.x = teleport.wayOut.x;
                        this.y = teleport.wayOut.y - teleport.wayOut.h / 2 - 5;

                    }
                    break;
                }

            }
        }
        this.checkRemove();
        this.checkCollisionWithSkis();
        this.checkCollisionWithWall();
        this.checkCollisionWithBrickNor();
        this.move();
    }

    move() {
        var ox = this.x;
        var oy = this.y;
        this.x += this.dx;
        this.y += this.dy;
        if (level === 6) {
            if (this.checkCollisionBoss() === true) {
                this.x = ox;
                this.y = oy;
            }
        }
        if (this.checkCollisionWithBrickHard() === true) {
            this.x = ox;
            this.y = oy;
        }

    }


}

class Array_Ball {
    constructor() {
        this.balls = [];
    }

    addBall() {
        this.balls.push(new Ball());
        if (balls.balls.length <= 6) {
            for (let i = 0; i < balls.balls.length; i++) {
                ballDiv = document.createElement("div");
                ballDiv.classList.add("ball");
                ballText.appendChild(ballDiv);
            }

        }
    }

    removeBall(i) {
        this.balls.splice(i, 1);
        if (balls.balls.length <= 6) {
            ballDiv = ballText.lastChild;
            ballText.removeChild(ballDiv);
        }
    }

    updateBalls() {
        for (let i = 0; i < this.balls.length; i++) {
            this.balls[i].changeDirection();
        }
    }

    drawBalls() {
        for (let i = 0; i < this.balls.length; i++) {
            this.balls[i].draw();
        }
    }

    checkGameOver() {
        if (this.balls.length === 0) {
            game.gameOverState = true;
            game.isAllowReset = true;
            gameOver();
        }
    }
}


class Skis {
    constructor() {
        this.width = WIDTH_SKIS;
        this.color = 'white';
    }

    generate() {
        this.x = WIDTH / 2 - this.width / 2;
        this.y = HEIGHT - HEIGH_SKIS - 10;
        this.dx = 30;
        this.draw();
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, HEIGH_SKIS);
    }

    move() {

        if (inputVelocity.x === 1 && this.checkCollisionWithWall() !== 'right_collision') {
            this.x += this.dx;
            if (this.x + this.width > WIDTH)
                this.x = WIDTH - this.width;
        }
        if (inputVelocity.x === -1 && this.checkCollisionWithWall() !== 'left_collision') {
            this.x -= this.dx;
            if (this.x < 0)
                this.x = 0;
        }

    }

    changeDirection() {
        this.move();

    }

    checkCollisionWithWall() {
        if (this.x < 0) {
            return 'left_collision';
        }
        if (this.x + this.width >= WIDTH) {
            return 'right_collision';
        }

        return 'none';
    }

    upgrape(upgrapeSkill) {
        switch (upgrapeSkill.skill) {
            case 1:
                SPEED += 5;
                break;
            case 2:
                skis.width += 20;
                break;
            case 3:
                balls.addBall();
                break;
            case 4:

                for (let i = 0; i < balls.balls.length; i++) {
                    if (balls.balls[i].damge <= 4) {
                        balls.balls[i].damge += 1;
                        balls.balls[i].radius += 2;
                    }
                }
                break;
        }
    }

}

class Teleport {
    constructor() {
        this.w = 100;
        this.h = 30;
        this.x = Math.floor(Math.random() * (WIDTH - this.w - 30)) + this.w;
        this.y = Math.floor((Math.random() * (HEIGHT - 500))) + 300;
    }

    drawTeleport() {
        ctx.beginPath();

        var lx = this.x - this.w / 2,
            rx = this.x + this.w / 2,
            ty = this.y - this.h / 2,
            by = this.y + this.h / 2;
        var magic = 0.551784;
        var xmagic = magic * this.w / 2;
        var ymagic = this.h * magic / 2;
        ctx.moveTo(this.x, ty);
        ctx.bezierCurveTo(this.x + xmagic, ty, rx, this.y - ymagic, rx, this.y);
        ctx.bezierCurveTo(rx, this.y + ymagic, this.x + xmagic, by, this.x, by);
        ctx.bezierCurveTo(this.x - xmagic, by, lx, this.y + ymagic, lx, this.y);
        ctx.bezierCurveTo(lx, this.y - ymagic, this.x - xmagic, ty, this.x, ty);


        let gradient = ctx.createLinearGradient(0, 0, WIDTH, 0);
        gradient.addColorStop(0, "magenta");
        gradient.addColorStop(0.5, "blue");
        gradient.addColorStop(1.0, "red");

        ctx.fillStyle = gradient;
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 5;
        ctx.stroke();


        ctx.arc(this.x, this.y, 30, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    addWayOut(wayOut) {
        this.wayOut = wayOut;
    }

    collsionTeleport(teleport) {
        var px = this.x - this.w / 2;
        var py = this.y - this.h / 2;
        var ox = teleport.x - teleport.w / 2;
        var oy = teleport.y - teleport.h / 2
        if (px < ox && px + this.w > ox && py < oy && py + this.h > oy)
            return true;
        if (Math.abs(this.x - teleport.x) < 150)
            return true
        return false;
    }
}

class DuplexTeleport {
    constructor() {
        this.teleports = [];
    }

    generateDuplexTeleport() {
        for (let i = 0; i < 2; i++) {
            this.teleports.push(new Teleport());
        }
        while (this.teleports[0].collsionTeleport(this.teleports[1])) {
            this.teleports[1] = new Teleport();
        }
        this.teleports[0].addWayOut(this.teleports[1]);
        this.teleports[1].addWayOut(this.teleports[0]);
    }

    drawDuplexTeleport() {
        for (let i = 0; i < this.teleports.length; i++) {
            this.teleports[i].drawTeleport();
        }
    }

    changePosition() {
        this.teleports[0] = new Teleport();
        this.teleports[1] = new Teleport();
        while (this.teleports[0].collsionTeleport(this.teleports[1])) {
            this.teleports[1] = new Teleport();
        }
        this.teleports[0].addWayOut(this.teleports[1]);
        this.teleports[1].addWayOut(this.teleports[0]);
    }

}


class Game {
    constructor() {
        this.isPause = false;
        this.isAllowReset = false;
        this.gameOverState = false;
        this.gameWonState = false;
        this.score = 0;
    }

    init() {

        scoreText.innerText = game.score < 10 ? `Score : 0${game.score}` : `Score: ${game.score}`;
        balls = new Array_Ball();
        skis = new Skis();
        array_upgrape = new Array_Upgrape();
        array_Brick = new Array_Brick();
        array_Brick.generate();
        skis.generate();
        balls.addBall();
        seconds = 0;
        SPEED = 70;

        if (level === 5 || level === 6) {
            bullets = new Array_Bullet();
        }


    }

    start() {
        if (level === 7) {
            gameFinish();
        } else {
            this.init();
            clearTimeout(updateScreen);
            this.update();
        }

    }

    update() {
        updateScreen();
    }
}


$(function () {
        $('html').keydown(function (e) {

            switch (e.which) {
                case 37:
                case 65:

                    inputVelocity.x = -1;
                    skis.changeDirection(inputVelocity.x);
                    break;

                case 39:
                case 68:

                    inputVelocity.x = 1;
                    skis.changeDirection(inputVelocity.x);
                    break;
                case 80:
                    game.isPause = !game.isPause;
                    if (game.isPause) {
                        gamePause();
                    } else {
                        updateScreen();
                    }

                    break;
                case 32:
                    if (game.isAllowReset) {
                        game = new Game();
                        level = 1;
                        game.start();
                        levelText.innerText = `level : ${level}`;
                    }
                    break;
                case 13:
                    game = new Game();
                    game.start();
                    levelText.innerText = `level : ${level}`;

                    break;
                case 74:
                    if (level === 5 || level === 6)
                        bullets.addBullet("skis");
                    break;
            }
        });
    }
)


function updateScreen() {
    seconds++;
    if (seconds === 700 && (level === 4 || level === 5)) {
        duplexTeleport.changePosition();
        seconds = 0;
    }
    if (seconds === 130 && level === 6) {
        bullets.addBullet("boss");
        seconds = 0;
    }

    if (game.gameOverState) gameOver();
    if (game.gameWonState) gameRepairLevel();
    if (game.isPause || game.gameOverState || game.gameWonState) return;

    //ball
    balls.updateBalls();
    balls.checkGameOver();

    array_upgrape.checkUpgrape();

    // clear
    clearScreen();


    //teleport
    if (level === 4 || level === 5)
        duplexTeleport.drawDuplexTeleport();

    // boss
    if (level === 6) {
        boss.changeDirection();
        boss.drawBoss();
    }
    // bullet
    if (level === 5 || level === 6) {
        bullets.checkShooting();
        bullets.drawBullets();
    }

    //brick
    array_Brick.draw();

    array_upgrape.draw();
    skis.draw();
    // ball.draw();
    balls.drawBalls();
    FPS = setTimeout(updateScreen, 1000 / SPEED);
}


function

clearScreen() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function gamePause() {
    ctx.fillStyle = 'grey';
    ctx.fillRect(WIDTH / 2 - 180, HEIGHT / 2 - 118, 340, 110);
    ctx.fillStyle = 'yellow';
    ctx.font = '50px Dancing Script';
    ctx.fillText("Game Pause", WIDTH / 2 - 110, HEIGHT / 2 - 50);
    ctx.closePath();

}

function gameOver() {
    ctx.fillStyle = 'grey';
    ctx.fillRect(WIDTH / 2 - 200, HEIGHT / 2 - 100, 340, 120);
    ctx.fillStyle = 'yellow';
    ctx.font = '50px Dancing Script';
    ctx.fillText("Game Over", WIDTH / 2 - 130, HEIGHT / 2 - 50);
    ctx.font = '20px Open-Sans';
    ctx.fillText("press space to play again !", WIDTH / 2 - 130, HEIGHT / 2 - 10);
}

function gameStart() {
    ctx.fillStyle = 'white';
    ctx.font = '30px Open-Sans';
    ctx.fillText("press Enter to start game !", WIDTH / 2 - 150, HEIGHT / 2);
    drawBackGroundStar();
}


function gameFinish() {
    clearScreen();
    game.isAllowReset = true;
    ctx.fillStyle = 'white';
    ctx.font = '30px Open-Sans';
    ctx.fillText("congratulations!! you won the game", WIDTH / 2 - 230, HEIGHT / 2 - 40);
    ctx.font = '20px Open-Sans';
    ctx.fillText("press space to play again", WIDTH / 2 - 110, HEIGHT / 2);
    drawBackGroundStar();
}

function drawStar(ox, oy, spikes, outerRadius, innerRadius, color) {

    ctx.beginPath();
    ctx.strokeStyle = color;
    var rot = Math.PI / 2 * 3;
    var x = ox;
    var y = oy;
    var step = Math.PI / spikes;

    ctx.moveTo(ox, oy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = ox + Math.cos(rot) * outerRadius;
        y = oy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = ox + Math.cos(rot) * innerRadius;
        y = oy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }

    ctx.lineTo(ox, oy - outerRadius)
    ctx.closePath();
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fill();
}

function drawBackGroundStar() {
    drawStar(120, 200, 9, 24, 10, "yellow");
    drawStar(WIDTH - 80, 90, 8, 25, 12, "red");
    drawStar(WIDTH / 2, 150, 9, 20, 10, "pink");
    drawStar(300, HEIGHT - 100, 9, 15, 7, "blue");
    drawStar(WIDTH - 100, HEIGHT / 2, 9, 15, 7, "green");
    drawStar(WIDTH - 250, HEIGHT - 70, 9, 15, 7, "purple");
}

function gameRepairLevel() {
    game.isPause = true;
    level++;
    ctx.fillStyle = 'grey';
    ctx.fillRect(WIDTH / 2 - 200, HEIGHT / 2 - 110, 340, 130);
    ctx.fillStyle = 'yellow';
    ctx.font = '50px Dancing Script';
    ctx.fillText("Great !!!!", WIDTH / 2 - 105, HEIGHT / 2 - 50);
    ctx.font = '20px Open-Sans';
    ctx.fillText("press Enter to play next level !", WIDTH / 2 - 160, HEIGHT / 2 - 10);

}

function switchLevel(levelSwitch) {
    if (game === undefined || (game.isPause == true || game.gameOverState == true)) {
        level = levelSwitch;
        game = new Game();
        game.start();
        levelText.innerText = `level : ${level}`;
    }
}


$(divLevel1).click(() => {
    switchLevel(1)
});
$(divLevel2).click(() => {
    switchLevel(2)
});
$(divLevel3).click(() => {
    switchLevel(3)
});
$(divLevel4).click(() => {
    switchLevel(4)
});
$(divLevel5).click(() => {
    switchLevel(5)
});
$(divLevel6).click(() => {
    switchLevel(6)
});
gameStart();





