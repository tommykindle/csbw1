// select HTMl Elements

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const nextButton = document.getElementById("nextButton");
const startButton = document.getElementById("startButton");
const fasterButton = document.getElementById("fasterButton");
const slowerButton = document.getElementById("slowerButton");
const clearButton = document.getElementById("clearButton");
const randomButton = document.getElementById("randomButton");

const selectInput = document.getElementById("selectInput");
const bornInput = document.getElementById("bornInput");
const surviveInput = document.getElementById("surviveInput");

const population = document.getElementById("population");
const generation = document.getElementById("generation");

generation.textContent = "Hello!"

// Colors

const livingColor = "#000050";
const deadColor = "#F0F0F0";
const killColor = "#DFDAF0";
const bornColor = "#00FF00";
const buttonActiveColor = "#CCC";
const buttonInactiveColor = "#707080";


// Scale

const scale = 8; //size of the cell
const cols = Math.floor(canvas.width / scale);
const rows = Math.floor(canvas.height / scale);

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = deadColor;
        this.living = false;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x * scale + 1, this.y * scale + 1, scale - 1, scale - 1);
    }

    kill() {
        if (this.living) {
            this.living = false;
            this.color = killColor;
            population.textContent--;
        }
    }

    born() {
        if (!this.living) {
            this.living = true;
            this.color = bornColor;
            population.textContent++;
        }
    }
    swap() {
        if (this.living) {
            this.kill();
        } else {
            this.born();
        }
    }
}

// helper function

function makeCellArray(m, n) {
    let array = new Array(m);
    for (let i = 0; i < m; i++) {
        array[i] = new Array(n);
        for (let j = 0; j < n; j++) {
            array[i][j] = new Cell(i, j);
        }
    }
    return array;
}

// Game Class

class Game {
    constructor(bornRule, surviveRule) {
        this.array = makeCellArray(cols, rows);
        this.bornRule = bornRule;
        this.surviveRule = surviveRule;



        this.running = false;

        this.presets = [];

        this.xcenter = Math.floor(cols / 2);
        this.ycenter = Math.floor(rows / 2);

        this.wait = 30; //ms

        canvas.addEventListener("mousedown", this.drawPixel.bind(this));

        startButton.onclick = this.startstop.bind(this);
        fasterButton.onclick = this.faster.bind(this);
        slowerButton.onclick = this.slower.bind(this);
        nextButton.onclick = this.next.bind(this);
        clearButton.onclick = this.clear.bind(this);
        randomButton.onclick = this.randomize.bind(this);
        selectInput.onclick = this.presetSelector.bind(this);
        bornInput.oninput = this.changeBornRule.bind(this);
        surviveInput.oninput = this.changeSurviveRule.bind(this);
    }
    // input method

    start() {
        this.running = true;
        startButton.value = "Pause";
        nextButton.style.color = buttonInactiveColor;
        bornInput.disabled = true;
        surviveInput.disabled = true;

        requestAnimationFrame(this.gameloop.bind(this));
    }

    stop() {
        this.running = false;
        startButton.value = "Start";
        nextButton.style.color = buttonActiveColor;
        bornInput.disabled = false;
        surviveInput.disabled = false;
    }

    startstop() {
        if (this.running) {
            this.stop();
        } else {
            this.start();
        }
    }

    drawPixel(e) {
        if (this.running == false) {
            let x = e.clientX - canvas.offsetLeft;
            let y = e.clientY - canvas.offsetTop;
            let i = Math.floor(x / scale);
            let j = Math.floor(y / scale);
            if (i >= 0 && i < cols && j >= 0 && j < rows) {
                let cell = this.array[i][j];
                cell.swap();
                cell.draw();
            }
        }
    }

    faster() {
        this.wait = Math.max(0, this.wait - 20);
        if (this.wait == 0) {
            fasterButton.style.color = buttonInactiveColor;
        }
    }

    slower() {
        if (this.wait == 0) {
            fasterButton.style.color = buttonActiveColor;

        }
        this.wait += 20;
    }

    clear() {
        this.stop();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.array.forEach(col => col.forEach(cell => {
            cell.kill();
            cell.color = deadColor;
        }))

        population.textContent = "0";
        generation.textContent = "0";

        this.draw();
    }

    randomize() {
        this.clear();
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let cell = this.array[i][j]
                let random = Math.floor(2 * Math.random());
                if (random == 0) {
                    cell.kill();
                } else {
                    cell.born();
                }
            }
        }
        this.draw();
    }

    changeBornRule() {
        this.bornRule = bornInput.value.split("").map(x => parseInt(x));
    }

    changeSurviveRule() {
        this.surviveRule = surviveInput.value.split("").map(x => parseInt(x));
    }

    presetSelector() {
        let index = selectInput.selectedIndex;
        let preset = this.presets[index];
        preset.draw(this);
    }

    // draw method
    draw() {
        this.array.forEach(col => col.forEach(cell => cell.draw()));
    }

    // next

    next() {

    }

    // game loop

    gameloop() {

    }
}

let game = new Game("3", "23");
