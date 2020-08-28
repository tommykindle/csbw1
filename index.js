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
        let bornList = [];
        let killList = [];
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let cell = this.array[i][j];
                let n = this.neighborNumber([i, j]);
                if (!cell.living && this.bornRule.indexOf(n) >= 0) {
                    bornList.push(cell);
                }
                else if (cell.living && this.surviveRule.indexOf(n) == -1) {
                    killList.push(cell);
                }
                else {
                    cell.color = cell.living ? livingColor : deadColor;
                    cell.draw();
                }
            }
        }
        killList.forEach(cell => {
            cell.kill();
            cell.draw();
        })
        bornList.forEach(cell => {
            cell.born();
            cell.draw();
        })
        if (bornList.length == 0 && killList.length == 0) {
            this.stop();
            return;
        }
        generation.textContent++;
    }

    neighborNumber(coord) {
        return this.livingNeighbors(coord).length;
    }

    livingNeighbors(coord) {
        return this.neighbors(coord).filter(coord => {
            let i = coord[0];
            let j = coord[1];
            return this.array[i][j].living;
        })
    }

    neighbors(coord) {
        let i = coord[0];
        let j = coord[1];
        let list = [];
        let x;
        let y;
        for (let s = -1; s <= 1; s++) {
            for (let t = -1; t <= 1; t++) {
                if (s != 0 || t != 0) {
                    x = (i + s + cols) % cols;
                    y = (j + t + rows) % rows;
                    list.push([x, y])
                }
            }
        }
        return list;
    }

    // game loop

    gameloop() {
        if (this.running == true) {
            setTimeout(() => {

                this.next();
                requestAnimationFrame(this.gameloop.bind(this))
            }, this.wait);
        }
    }
}

// Presets Class

class Preset {
    constructor(name) {
        this.name = name;
        this.coords = [];
        this.pattern = "";
    }

    draw(game) {
        game.clear();
        this.coords.forEach(([i, j]) => {
            let cell = game.array[i][j];
            cell.born();
            cell.draw();

        })
    }

    setPattern(str) {
        this.coords = [];
        this.pattern = str;
        let x = 0;
        let y = 0;
        for (let k = 0; k < str.length; k++) {
            let char = str[k];
            switch (char) {
                case ".":
                    x++;
                    break;
                case "O":
                    this.coords.push([x, y]);
                    x++;
                    break;
                case "|":
                    x = 0;
                    y++;
                    break;
            }
        }

    }

    addTo(game) {
        game.presets.push(this);
        let opt = document.createElement("option");
        opt.appendChild(document.createTextNode(this.name));
        selectInput.appendChild(opt);
    }

    center(game) {
        this.moveRight(game.xcenter);
        this.moveDown(game.ycenter);
    }

    moveRight(offset) {
        this.coords.forEach(coord => {
            coord[0] += offset;
        });
    }

    moveDown(offset) {
        this.coords.forEach(coord => {
            coord[1] += offset;
        });
    }
}

// MAKING THE GAME

let game = new Game([3], [2, 3]);
game.draw();



// DEFINITION OF PRESETS

RPentomino = new Preset("R-Pentomino");
RPentomino.setPattern(`
.OO|
OO.|
.O.|
`);
RPentomino.center(game);

Metamorphosis = new Preset("Metamorphosis II");
Metamorphosis.setPattern(`
....................OO.........OO....................|
....................OO.........OO....................|
.....................................................|
.....................................................|
....................OOO.......OOO....................|
....................OOO.......OOO....................|
.....................................................|
.....................................................|
.....................................................|
..................OO...OO...OO...OO..................|
...................OOOOO.....OOOOO...................|
....................OOO.......OOO....................|
.....................O.........O.....................|
........O...................................O........|
.......O.O.................................O.O.......|
......O.OO.................................OO.O......|
OO...OO.OO.................................OO.OO...OO|
OO....O.OO.................................OO.O....OO|
.......O.O.................................O.O.......|
........O...................................O........|
.......................O.O...........................|
......................O..............................|
......................O..............................|
......................O..O...........................|
......................OOO............................|
.....................................................|
......................OOO............................|
......................O..O...........................|
......................O..............................|
......................O..............................|
.......................O.O...........................|
........O...................................O........|
.......O.O.................................O.O.......|
OO....O.OO.................................OO.O....OO|
OO...OO.OO.................................OO.OO...OO|
......O.OO.................................OO.O......|
.......O.O.................................O.O.......|
........O...................................O........|
.....................O.........O.....................|
....................OOO.......OOO....................|
...................OOOOO.....OOOOO...................|
..................OO...OO...OO...OO..................|
.....................................................|
.....................................................|
.....................................................|
....................OOO.......OOO....................|
....................OOO.......OOO....................|
.....................................................|
.....................................................|
....................OO.........OO....................|
....................OO.........OO....................|
`);
Metamorphosis.moveRight(25);
Metamorphosis.moveDown(15);


GosperGun = new Preset("Gosper Gun");
GosperGun.setPattern(`
........................O...........|
......................O.O...........|
............OO......OO............OO|
...........O...O....OO............OO|
OO........O.....O...OO..............|
OO........O...O.OO....O.O...........|
..........O.....O.......O...........|
...........O...O....................|
............OO......................|
`);
GosperGun.moveDown(20);
GosperGun.moveRight(20);







Schick = new Preset("Schick ship");
Schick.setPattern(`
.O..O...............|
O...................|
O...O...............|
OOOO.........OO.....|
......OOO.....OO....|
......OO.OO......OOO|
......OOO.....OO....|
OOOO.........OO.....|
O...O...............|
O...................|
.O..O...............|
`);
Schick.center(game);





Lobster = new Preset("Lobster");
Lobster.setPattern(`
...........OOO............|
.............O............|
........OO..O.............|
........OO................|
............OO............|
...........OO.............|
..........O..O............|
..........................|
........O..O..............|
.......O...O..............|
......O.OOO...............|
.....O....................|
.....O.............O.O..OO|
......O.............OO.O.O|
.OO.............OO..O....O|
O..OO..OO......O...O......|
.....O..O......O......OO..|
.........OO....O.O....OO..|
..O...O...O.....O.........|
......OO....O..O..........|
.O.O.....O...OO...........|
OO........O...............|
.....O....O...............|
.......O...O..............|
....OO.....O..............|
....O.....O...............|
`);
Lobster.moveDown(35);
Lobster.moveRight(10);





Frothing = new Preset("Frothing Puffer");
Frothing.setPattern(`
.......O.................O.......|
......OOO...............OOO......|
.....OO....OOO.....OOO....OO.....|
...OO.O..OOO..O...O..OOO..O.OO...|
....O.O..O.O...O.O...O.O..O.O....|
.OO.O.O.O.O....O.O....O.O.O.O.OO.|
.OO...O.O....O.....O....O.O...OO.|
.OOO.O...O....O.O.O....O...O.OOO.|
OO.........OO.O.O.O.OO.........OO|
............O.......O............|
.........OO.O.......O.OO.........|
..........O...........O..........|
.......OO.O...........O.OO.......|
.......OO...............OO.......|
.......O.O.O.OOO.OOO.O.O.O.......|
......OO...O...O.O...O...OO......|
......O..O...O.O.O.O...O..O......|
.........OO....O.O....OO.........|
.....OO....O...O.O...O....OO.....|
.........O.OO.O...O.OO.O.........|
..........O.O.O.O.O.O.O..........|
............O..O.O..O............|
...........O.O.....O.O...........|
`);
Frothing.moveRight(36);
Frothing.moveDown(25);

// ADD PRESETS TO GAME

Metamorphosis.addTo(game);
Schick.addTo(game);
Lobster.addTo(game);
Frothing.addTo(game);
GosperGun.addTo(game);
RPentomino.addTo(game);
