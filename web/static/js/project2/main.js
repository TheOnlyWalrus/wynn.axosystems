let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

const TOWER_WIDTH = 24;
const TOWER_HEIGHT = 24;

/*
 * Check if enemy in radius of tower from tower object, not main update loop or from enemy object
 */

class Tower {
    constructor(x, y, color, damage, fireRate, range, type) {
        // x and y are the coordinates of the tower center
        this.x = x;
        this.y = y;
        this.color = color;
        this.damage = damage;
        this.fireRate = fireRate;
        this.range = range;
        this.type = type;
    }

    draw() {
        ctx.fillStyle = this.color;

        let _x = this.x - TOWER_WIDTH / 2;
        let _y = this.y - TOWER_HEIGHT / 2;

        ctx.fillRect(_x, _y, TOWER_WIDTH, TOWER_HEIGHT);
    }

    update() {
        this.draw();
    }
}

let sprites = [

];

const TEXTURES = {
    'grass': {
        path: '/img/2/grass.png',
        img: null
    },
};
let texturesLoaded = false;

for (let texture in TEXTURES) {
    let img = new Image(16, 16);
    img.onload = () => {
        TEXTURES[texture].img = img;
    }
    img.src = TEXTURES[texture].path;
}

const FPS = 60;
let deltaTime = 0;
let lastFrameTime = new Date().getTime();
let updater = setInterval(() => update(), 1000 / FPS);

sprites.push(new Tower(100, 100, '#FF0000', 1, 1, 1, 'tower'));

function clear() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function update() {
    clear();  // start with a blank canvas every frame

    if (!texturesLoaded) {  // only continue if the bg image is loaded, otherwise check each texture
        for (let texture in TEXTURES) {
            if (!TEXTURES[texture].img) {
                return;
            }
        }

        texturesLoaded = true;
    }

    deltaTime = (new Date().getTime() - lastFrameTime) / 1000;  // calculate the time since the last frame

    ctx.fillStyle = ctx.createPattern(TEXTURES['grass'].img, 'repeat');  // repeated grass image for the background
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Logic
    for (let sprite of sprites) {
        sprite.update();
    }

    lastFrameTime = new Date().getTime();  // update the last frame time at the very end of the frame
}
