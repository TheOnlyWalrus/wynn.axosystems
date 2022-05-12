let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

/*
 * Check if enemy in radius of tower from tower object, not main update loop or from enemy object
 */

function normalize2D(v) {
    let len = Math.sqrt(v.x * v.x + v.y * v.y);
    return { x: v.x / len, y: v.y / len };
}

class Tower {
    constructor(x, y, texture, color, damage, fireRate, range, type) {
        // x and y are the coordinates of the tower center
        this.x = x;
        this.y = y;
        this.texture = texture;
        this.width = texture.size.w;
        this.height = texture.size.h;
        this.color = color;
        this.damage = damage;
        this.fireRate = fireRate;
        this.range = range;
        this.type = type;
    }

    draw() {
        // top left corner of the tower
        let _x = this.x - this.width / 2;
        let _y = this.y - this.height / 2;

        ctx.drawImage(this.texture.img, _x, _y, this.width, this.height);

        this.drawRange();  // draw range of tower
    }

    drawRange() {
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, 2 * Math.PI);  // x and y are center for circle
        ctx.stroke();
    }

    update() {
        this.draw();  // draw the tower last
    }
}

let sprites = [

];

const TEXTURES = {
    'grass': {
        path: '/img/2/grass.png',
        size: { w: 16, h: 16 },
        img: null
    },
    'tower': {
        path: '/img/2/tower.png',
        size: { w: 32, h: 32 },
        img: null
    }
};
let texturesLoaded = false;

for (let texture in TEXTURES) {
    let img = new Image(TEXTURES[texture].size.w, TEXTURES[texture].size.h);
    img.onload = () => {
        TEXTURES[texture].img = img;
    }
    img.src = TEXTURES[texture].path;
}

const FPS = 60;
let deltaTime = 0;
let lastFrameTime = new Date().getTime();
let updater = setInterval(() => update(), 1000 / FPS);

sprites.push(new Tower(100, 100, TEXTURES['tower'], '#ff0000', 1, 1, 50, 'tower'));

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
