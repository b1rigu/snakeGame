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

let lastKeyPressed = "";

let msPrevs = {};
function canRunLoop(fps) {
    if (!(fps.toString() in msPrevs)) {
        msPrevs[fps.toString()] = performance.now();
    }
    const msPerFrame = 1000 / fps;

    const msNow = performance.now();
    const msPassed = msNow - msPrevs[fps.toString()];

    if (msPassed < msPerFrame) return false;

    const excessTime = msPassed % msPerFrame;
    msPrevs[fps.toString()] = msNow - excessTime;

    return true;
}

function randomNumber(to) {
    return Math.floor(Math.random() * to);
}

class Food {
    constructor(x, y) {
        this.position = {
            x,
            y,
        };
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
                previousGoingDirection: "right",
                changeDirection: false,
            },
        ];
    }

    update() {
        this.snakeBodies.forEach((snake) => {
            switch (snake.goingDirection) {
                case "right":
                    snake.position.x += playerSizeAndSpeed;
                    break;
                case "left":
                    snake.position.x -= playerSizeAndSpeed;
                    break;
                case "up":
                    snake.position.y -= playerSizeAndSpeed;
                    break;
                case "down":
                    snake.position.y += playerSizeAndSpeed;
                    break;
            }
        });

        if (
            this.snakeBodies[0].position.x <= 0 ||
            this.snakeBodies[0].position.x + playerSizeAndSpeed >= canvasWidth ||
            this.snakeBodies[0].position.y <= 0 ||
            this.snakeBodies[0].position.y + playerSizeAndSpeed >= canvasHeight
        ) {
            initGame();
            return;
        }

        if (this.snakeBodies.length > 1) {
            for (let index = 1; index < this.snakeBodies.length; index++) {
                if (
                    this.snakeBodies[0].position.x + playerSizeAndSpeed >
                        this.snakeBodies[index].position.x &&
                    this.snakeBodies[0].position.x <
                        this.snakeBodies[index].position.x + playerSizeAndSpeed &&
                    this.snakeBodies[0].position.y <
                        this.snakeBodies[index].position.y + playerSizeAndSpeed &&
                    this.snakeBodies[0].position.y + playerSizeAndSpeed >
                        this.snakeBodies[index].position.y
                ) {
                    initGame();
                    return;
                }
            }
        }

        for (let index = 0; index < this.snakeBodies.length; index++) {
            this.snakeBodies[index].previousGoingDirection = this.snakeBodies[index].goingDirection;
        }

        for (let index = 0; index < this.snakeBodies.length; index++) {
            const head = this.snakeBodies[index];
            const tail = this.snakeBodies[index + 1];
            if (tail && head.changeDirection) {
                tail.goingDirection = head.previousGoingDirection;
            }
        }

        const changeDirectionsMapped = this.snakeBodies.map(
            (snakeBody) => snakeBody.changeDirection
        );

        changeDirectionsMapped.unshift(...changeDirectionsMapped.splice(-1));
        changeDirectionsMapped[0] = false;

        changeDirectionsMapped.forEach((changeDirection, index) => {
            this.snakeBodies[index].changeDirection = changeDirection;
        });
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
            this.snakeBodies[0].changeDirection = true;
        }
    }

    addBody() {
        this.snakeBodies.push({
            position: {
                x: this.snakeBodies[this.snakeBodies.length - 1].position.x,
                y: this.snakeBodies[this.snakeBodies.length - 1].position.y,
            },
            goingDirection: this.snakeBodies[this.snakeBodies.length - 1].goingDirection,
            previousGoingDirection:
                this.snakeBodies[this.snakeBodies.length - 1].previousGoingDirection,
            changeDirection: this.snakeBodies[this.snakeBodies.length - 1].changeDirection,
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

let snake = new Snake();
let foods = [];

function initGame() {
    lastKeyPressed = "d";
    foods = [];
    snake = new Snake();
    animationLoop();
    physicsLoop();
}

function animationLoop() {
    requestAnimationFrame(animationLoop);

    backgroundContext.fillStyle = "white";
    backgroundContext.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

    foods.forEach((food) => food.draw());
    snake.draw();

    mainContext.drawImage(backgroundCanvas, 0, 0);
}

function physicsLoop() {
    requestAnimationFrame(physicsLoop);

    if (!canRunLoop(physicsFPS)) return;

    if (lastKeyPressed == "w" && snake.snakeBodies[0].goingDirection != "down")
        snake.setDirection("up");
    else if (lastKeyPressed == "a" && snake.snakeBodies[0].goingDirection != "right")
        snake.setDirection("left");
    else if (lastKeyPressed == "s" && snake.snakeBodies[0].goingDirection != "up")
        snake.setDirection("down");
    else if (lastKeyPressed == "d" && snake.snakeBodies[0].goingDirection != "left")
        snake.setDirection("right");

    if (foods.length == 0) {
        let allPossiblePlaces = [];

        for (let i = 0; i < maxVertical; i++) {
            for (let j = 0; j < maxHorizontal; j++) {
                allPossiblePlaces.push({
                    position: {
                        x: edgePadding + playerSizeAndSpeed * j,
                        y: edgePadding + playerSizeAndSpeed * i,
                    },
                });
            }
        }

        allPossiblePlaces = allPossiblePlaces.filter((place) => {
            let collided = false;
            for (let i = 0; i < snake.snakeBodies.length; i++) {
                if (
                    snake.snakeBodies[i].position.x + playerSizeAndSpeed > place.position.x &&
                    snake.snakeBodies[i].position.x < place.position.x + playerSizeAndSpeed &&
                    snake.snakeBodies[i].position.y < place.position.y + playerSizeAndSpeed &&
                    snake.snakeBodies[i].position.y + playerSizeAndSpeed > place.position.y
                ) {
                    collided = true;
                    break;
                }
            }
            if (collided) return false;

            return true;
        });

        const placeToPutFood = allPossiblePlaces[randomNumber(allPossiblePlaces.length)];

        foods.push(new Food(placeToPutFood.position.x, placeToPutFood.position.y));
    }

    snake.update();

    foods = foods.filter((food) => {
        const collided =
            snake.snakeBodies[0].position.x + playerSizeAndSpeed > food.position.x &&
            snake.snakeBodies[0].position.x < food.position.x + playerSizeAndSpeed &&
            snake.snakeBodies[0].position.y < food.position.y + playerSizeAndSpeed &&
            snake.snakeBodies[0].position.y + playerSizeAndSpeed > food.position.y;
        if (collided) snake.addBody();
        return !collided;
    });
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
