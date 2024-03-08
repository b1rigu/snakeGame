const physicsFPS = 10;
const playerSizeAndSpeed = 30;
const maxHorizontal = 35;
const maxVertical = 20;
const edgePadding = 10;
const canvasWidth = edgePadding * 2 + playerSizeAndSpeed * maxHorizontal;
const canvasHeight = edgePadding * 2 + playerSizeAndSpeed * maxVertical;

const mainCanvas = document.querySelector("canvas");
mainCanvas.width = canvasWidth;
mainCanvas.height = canvasHeight;
const mainContext = mainCanvas.getContext("2d", { alpha: false });
mainContext.imageSmoothingEnabled = false;
const backgroundCanvas = document.createElement("canvas");
backgroundCanvas.width = canvasWidth;
backgroundCanvas.height = canvasHeight;
const backgroundContext = backgroundCanvas.getContext("2d", { alpha: false });
backgroundContext.imageSmoothingEnabled = false;

class Food {
    constructor(position) {
        this.position = position;
    }

    draw() {
        backgroundContext.beginPath();
        backgroundContext.fillStyle = "red";
        backgroundContext.roundRect(
            this.position.x,
            this.position.y,
            playerSizeAndSpeed,
            playerSizeAndSpeed,
            30
        );
        backgroundContext.fill();
    }
}

class Snake {
    constructor() {
        this.snakeBodies = [
            {
                position: {
                    x: edgePadding,
                    y: edgePadding,
                },
                goingDirection: "right",
            },
        ];
    }

    checkCollisionBetweenItself(index) {
        if (
            index > 0 &&
            this.snakeBodies[0].position.x + playerSizeAndSpeed >
                this.snakeBodies[index].position.x &&
            this.snakeBodies[0].position.x <
                this.snakeBodies[index].position.x + playerSizeAndSpeed &&
            this.snakeBodies[0].position.y <
                this.snakeBodies[index].position.y + playerSizeAndSpeed &&
            this.snakeBodies[0].position.y + playerSizeAndSpeed > this.snakeBodies[index].position.y
        ) {
            initGame();
        }
    }

    checkCollisionToWall() {
        if (
            this.snakeBodies[0].position.x <= 0 ||
            this.snakeBodies[0].position.x + playerSizeAndSpeed >= canvasWidth ||
            this.snakeBodies[0].position.y <= 0 ||
            this.snakeBodies[0].position.y + playerSizeAndSpeed >= canvasHeight
        ) {
            initGame();
        }
    }

    updateGoingDirectionOfTails() {
        for (let index = this.snakeBodies.length - 1; index > 0; index -= 1) {
            this.snakeBodies[index].goingDirection = this.snakeBodies[index - 1].goingDirection;
        }
    }

    update() {
        for (let index = 0; index < this.snakeBodies.length; index++) {
            switch (this.snakeBodies[index].goingDirection) {
                case "right":
                    this.snakeBodies[index].position.x += playerSizeAndSpeed;
                    break;
                case "left":
                    this.snakeBodies[index].position.x -= playerSizeAndSpeed;
                    break;
                case "up":
                    this.snakeBodies[index].position.y -= playerSizeAndSpeed;
                    break;
                case "down":
                    this.snakeBodies[index].position.y += playerSizeAndSpeed;
                    break;
            }
            this.checkCollisionBetweenItself(index);
        }

        this.checkCollisionToWall();

        this.updateGoingDirectionOfTails();
    }

    draw() {
        this.snakeBodies.forEach((snake) => {
            backgroundContext.beginPath();
            backgroundContext.fillStyle = "green";
            backgroundContext.roundRect(
                snake.position.x,
                snake.position.y,
                playerSizeAndSpeed,
                playerSizeAndSpeed,
                10
            );
            backgroundContext.fill();
        });
    }

    setDirection(direction) {
        if (this.snakeBodies[0].goingDirection != direction) {
            this.snakeBodies[0].goingDirection = direction;
        }
    }

    addBody() {
        this.snakeBodies.push({
            position: {
                x: this.snakeBodies[this.snakeBodies.length - 1].position.x,
                y: this.snakeBodies[this.snakeBodies.length - 1].position.y,
            },
            goingDirection: this.snakeBodies[this.snakeBodies.length - 1].goingDirection,
        });

        if (this.snakeBodies[this.snakeBodies.length - 1].goingDirection == "up") {
            this.snakeBodies[this.snakeBodies.length - 1].position.y += playerSizeAndSpeed;
        } else if (this.snakeBodies[this.snakeBodies.length - 1].goingDirection == "down") {
            this.snakeBodies[this.snakeBodies.length - 1].position.y -= playerSizeAndSpeed;
        } else if (this.snakeBodies[this.snakeBodies.length - 1].goingDirection == "left") {
            this.snakeBodies[this.snakeBodies.length - 1].position.x += playerSizeAndSpeed;
        } else if (this.snakeBodies[this.snakeBodies.length - 1].goingDirection == "right") {
            this.snakeBodies[this.snakeBodies.length - 1].position.x -= playerSizeAndSpeed;
        }
    }
}

let msPrevs = {};
function canRunLoop(fps, id) {
    if (!(id.toString() in msPrevs)) {
        msPrevs[id.toString()] = performance.now();
    }
    const msPerFrame = 1000 / fps;

    const msNow = performance.now();
    const msPassed = msNow - msPrevs[id.toString()];

    if (msPassed < msPerFrame) return false;

    const excessTime = msPassed % msPerFrame;
    msPrevs[id.toString()] = msNow - excessTime;

    return true;
}

function randomNumber(to) {
    return Math.floor(Math.random() * to);
}

function drawBoard() {
    backgroundContext.lineWidth = 1;
    backgroundContext.strokeStyle = "rgba(0, 0, 0, 0.1)";
    for (var x = 0; x < canvasWidth - edgePadding * 2; x += playerSizeAndSpeed) {
        for (var y = 0; y < canvasHeight - edgePadding * 2; y += playerSizeAndSpeed) {
            backgroundContext.strokeRect(
                x + edgePadding,
                y + edgePadding,
                playerSizeAndSpeed,
                playerSizeAndSpeed
            );
        }
    }
}

function drawBackground() {
    backgroundContext.fillStyle = "gray";
    backgroundContext.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

    backgroundContext.fillStyle = "white";
    backgroundContext.fillRect(
        edgePadding,
        edgePadding,
        backgroundCanvas.width - edgePadding * 2,
        backgroundCanvas.height - edgePadding * 2
    );
}

function configureSnakeDirectionByKey() {
    if (lastKeyPressed == "w" && snake.snakeBodies[0].goingDirection != "down")
        snake.setDirection("up");
    else if (lastKeyPressed == "a" && snake.snakeBodies[0].goingDirection != "right")
        snake.setDirection("left");
    else if (lastKeyPressed == "s" && snake.snakeBodies[0].goingDirection != "up")
        snake.setDirection("down");
    else if (lastKeyPressed == "d" && snake.snakeBodies[0].goingDirection != "left")
        snake.setDirection("right");
}

function addFoodIfEmpty() {
    if (foods.length == 0) {
        let allPossiblePlaceToPutFood = [];

        for (let i = 0; i < maxVertical; i++) {
            for (let j = 0; j < maxHorizontal; j++) {
                const posX = edgePadding + playerSizeAndSpeed * j;
                const posY = edgePadding + playerSizeAndSpeed * i;
                const snakeFound = snake.snakeBodies.findIndex(
                    (snakeBody) => snakeBody.position.x == posX && snakeBody.position.y == posY
                );
                if (snakeFound == -1) {
                    allPossiblePlaceToPutFood.push({
                        position: {
                            x: posX,
                            y: posY,
                        },
                    });
                }
            }
        }

        if (allPossiblePlaceToPutFood.length == 0) {
            console.log("You won");
            initGame();
        } else {
            const placeToPutFood =
                allPossiblePlaceToPutFood[randomNumber(allPossiblePlaceToPutFood.length)];
            foods.push(new Food(placeToPutFood.position));
        }
    }
}

function checkFoodCollision() {
    if (
        foods[0] &&
        snake.snakeBodies[0].position.x + playerSizeAndSpeed > foods[0].position.x &&
        snake.snakeBodies[0].position.x < foods[0].position.x + playerSizeAndSpeed &&
        snake.snakeBodies[0].position.y < foods[0].position.y + playerSizeAndSpeed &&
        snake.snakeBodies[0].position.y + playerSizeAndSpeed > foods[0].position.y
    ) {
        snake.addBody();
        foods.pop();
    }
}

function animationLoop() {
    requestAnimationFrame(animationLoop);

    drawBackground();

    drawBoard();

    foods.forEach((food) => food.draw());
    snake.draw();

    mainContext.drawImage(backgroundCanvas, 0, 0);
}

function physicsLoop() {
    requestAnimationFrame(physicsLoop);

    if (!canRunLoop(physicsFPS, 0)) return;

    configureSnakeDirectionByKey();

    addFoodIfEmpty();

    snake.update();

    checkFoodCollision();
}

let lastKeyPressed = "";
let snake = new Snake();
let foods = [];

function initGame() {
    lastKeyPressed = "d";
    foods = [];
    snake = new Snake();
    animationLoop();
    physicsLoop();
}

initGame();

document.addEventListener("keydown", (event) => {
    event.preventDefault();
    switch (event.key.toLowerCase()) {
        case "w":
            lastKeyPressed = "w";
            break;
        case "a":
            lastKeyPressed = "a";
            break;
        case "s":
            lastKeyPressed = "s";
            break;
        case "d":
            lastKeyPressed = "d";
            break;
    }
});
