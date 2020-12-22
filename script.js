//Create canvas
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Background images
const imgBackground = new Image();
imgBackground.src = "img/back-ground.jpg";

// Stat images
const LEVEL_IMG = new Image();
LEVEL_IMG.src = "img/level.png";

const LIFE_IMG = new Image();
LIFE_IMG.src = "img/life.png";

const SCORE_IMG = new Image();
SCORE_IMG.src = "img/score.png";

/////// LOAD SOUNDS ////////

const WALL_HIT = new Audio();
WALL_ = "sounds/wall.mp3";

const LIFE_LOST = new Audio();
LIFE_LOST.src = "sounds/life_lost.mp3";

const PADDLE_HIT = new Audio();
PADDLE_HIT.src = "sounds/paddle_hit.mp3";

const WIN = new Audio();
WIN.src = "sounds/win.mp3";

const BRICK_HIT = new Audio();
BRICK_HIT.src = "sounds/brick_hit.mp3";

/////// END LOAD SOUNDS ////////

// add border
canvas.style.border = "1px solid #0ff";

//set line thick when drawing
ctx.lineWidth = 2;

//stats
let LIFE = 3;
let SCORE = 0;
let LEVEL = 1;
const MAX_LEVEL = 2;
let GAME_OVER = false;

//  paddle  radius and coordinate
const paddle_Width = 90;
const paddle_Height = 30;
const paddingBottom = 30;

const paddle = {
  x: (canvas.width - paddle_Width) / 2,
  y: canvas.height - paddle_Height - paddingBottom,
  width: paddle_Width,
  height: paddle_Height,
  dx: 3,
};

// Ball radius and coordinate ball x,y
const ballRadius = 15;

const ball = {
  x: canvas.width / 2,
  y: paddle.y - ballRadius,
  speed: 5,
  radius: ballRadius,
  dx: 4 * (Math.random() * 2 - 1),
  dy: -4,
};

let rightPressed;
let leftPressed;

const brick = {
  row: 3,
  column: 4,
  width: 65,
  height: 25,
  offSetLeft: 25,
  offSetTop: 40,
  color: "#749da1",
  border: "black",
};

//Moving key
document.addEventListener("keyup", keyUp);
document.addEventListener("keydown", keyDown);

// Press key
function keyDown(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  }
}

// Release key
function keyUp(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = false;
  }
}

// Make a ball
function makeBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#F5A9CB";
  ctx.fill();

  ctx.strokeStyle = "black";
  ctx.stroke();
  ctx.closePath();
}

// Make a paddle
function makePaddle() {
  ctx.fillStyle = "#977FD7";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  ctx.strokeStyle = "black";
  ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Make bricks

//in turn will contain the brick rows (r),
//which in turn will each contain an object
//containing the x and y position to paint each brick on the screen.
let bricks = [];
function drawBricks() {
  for (let row = 0; row < brick.row; row++) {
    bricks[row] = [];
    for (let col = 0; col < brick.column; col++) {
      bricks[row][col] = {
        x: col * (brick.width + brick.offSetLeft) + brick.offSetLeft,
        y: row * (brick.height + brick.offSetTop) + brick.offSetTop,
        status: true,
      };
    }
  }
}

drawBricks();

function makeBricks() {
  for (let row = 0; row < brick.row; row++) {
    for (let col = 0; col < brick.column; col++) {
      if (bricks[row][col].status) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(
          bricks[row][col].x,
          bricks[row][col].y,
          brick.width,
          brick.height
        );

        ctx.strokeStyle = "black";
        ctx.strokeRect(
          bricks[row][col].x,
          bricks[row][col].y,
          brick.width,
          brick.height
        );
      }
    }
  }
}

// game over
function gameOver() {
  if (LIFE <= 0) {
    showYouLose();
    GAME_OVER = true;
  }
}

//if paddle is within canvas
function movePaddle() {
  if (rightPressed && paddle.x + paddle.width + paddle.dx < canvas.width) {
    paddle.x += paddle.dx;
  } else if (leftPressed && paddle.x - paddle.dx > 0) {
    paddle.x -= paddle.dx;
  }
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;
}

function ballHitWall() {
  // if ball touch left margin or touch right margin
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
    WALL_HIT.play();
  }

  // if ball touch top margin
  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
    WALL_HIT.play();
  }

  // if ball touch bottom margin
  if (ball.y + ball.radius > canvas.height) {
    LIFE--;
    LIFE_LOST.play();
    resetBall();
  }
}

function ballHitPaddle() {
  // if ball is within the paddle
  if (
    ball.x < paddle.x + paddle.width &&
    ball.x > paddle.x &&
    ball.y < paddle.y + paddle.height &&
    ball.y + ball.radius > paddle.y
  ) {
    PADDLE_HIT.play();
    // The diffirence between center ball and center paddle
    let collidePoint = ball.x - (paddle.x + paddle.width / 2);
    // - paddle.width / 2  0  +paddle.width / 2
    // normalize -1 0 1
    collidePoint = collidePoint / (paddle.width / 2);

    // when ball hit the paddle, create an angle of 60
    let angle = collidePoint * (Math.PI / 3);
    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = -ball.speed * Math.cos(angle);
  }
}

function ballHitBrick() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      let b = bricks[r][c];
      // if the brick is not broken, check for collision
      if (b.status) {
        if (
          ball.x + ball.radius > b.x &&
          ball.x - ball.radius < b.x + brick.width &&
          ball.y + ball.radius > b.y &&
          ball.y - ball.radius < b.y + brick.height
        ) {
          BRICK_HIT.play();
          b.status = false;
          ball.dy = -ball.dy;
          SCORE += 10;
        }
      }
    }
  }
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = paddle.y - ballRadius;
  ball.dx = 3 * (Math.random() * 2 - 1);
  ball.dy = -3;
}

// show game stats
function showGameStats(text, textX, textY, img, imgX, imgY) {
  // draw text
  ctx.fillStyle = "black";
  ctx.font = "30px Germania One";
  ctx.fillText(text, textX, textY);

  // draw image
  ctx.drawImage(img, imgX, imgY, (width = 35), (height = 35));
}

// level up
function levelUp() {
  let isLevelDone = true;

  // check if all the bricks are broken
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      isLevelDone = isLevelDone && !bricks[r][c].status;
    }
  }

  if (isLevelDone) {
    WIN.play();

    if (LEVEL >= MAX_LEVEL) {
      showYouWin();
      GAME_OVER = true;
      return;
    }
    brick.row++;
    makeBricks();
    ball.speed += 0.5;
    resetBall();
    LEVEL++;
  }
}

function draw() {
  makePaddle();
  makeBall();
  makeBricks();

  // SHOW SCORE
  showGameStats(SCORE, 50, 35, SCORE_IMG, 5, 5);
  // SHOW LIVES
  showGameStats(LIFE, canvas.width - 15, 35, LIFE_IMG, canvas.width - 55, 5);
  // SHOW LEVEL
  showGameStats(
    LEVEL,
    canvas.width / 2,
    35,
    LEVEL_IMG,
    canvas.width / 2 - 40,
    5
  );
}

function update() {
  movePaddle();
  moveBall();
  ballHitWall();
  ballHitPaddle();
  ballHitBrick();
  gameOver();
  levelUp();
}

// Bounce a ball
function loop() {
  // clear the frame
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imgBackground, 0, 0);
  draw();
  update();

  if (!GAME_OVER) {
    requestAnimationFrame(loop); // or let interval = setInterval(loop, 10);
  }
}

loop();

/* SELECT ELEMENTS */
const gameover = document.getElementById("gameover");
const youwin = document.getElementById("youwin");
const youlose = document.getElementById("youlose");
const restart = document.getElementById("restart");

// SHOW YOU WIN
function showYouWin() {}

// SHOW YOU LOSE
function showYouLose() {}
