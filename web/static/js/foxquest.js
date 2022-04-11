import { Area } from './models/area.js';
import { NPC, Ray, Sprite } from "./models/sprite.js";

class GameArea {
    textures = {};
    areas = {
        grasslands: new Area('ground1')
    };
    canvas = document.getElementById('game');
    player = new NPC(this.canvas, 'player', {species: 'fox', affiliation: 'player'});
    sprites = [
        this.player,
        new NPC(this.canvas, 'npc1', {species: 'fox', affiliation: 'friendly'}),
        new Sprite(this.canvas, 'wall', {species: 'wall', affiliation: 'boundary'})
    ];
    dialogues = [];

    start() {
        this.prepareTextures();

        window.addEventListener('keydown', (e) => this.keyDown(e));
        window.addEventListener('keyup', (e) => this.keyUp(e));
        window.addEventListener('keypress', (e) => this.keyPress(e));

        this.context = this.canvas.getContext('2d');
        this.frame = 0;
        this.updater = setInterval(() => this.update(), 0);
        this.sprites[0].dims = {w: 20, h: 20};
        this.sprites[0].pos = {x: 100, y: 100};

        this.sprites[1].dims = {w: 20, h: 20};
        this.sprites[1].pos = {x: 500, y: 350};

        this.sprites[2].dims = {w: 10, h: 200};
        this.sprites[2].pos = {x: 900, y: 500};
        this.heldKeys = {};
        this.pressedKeys = {};

        this.sprites[1].setup(this);

        this.currentArea = this.areas['grasslands'];
    }

    prepareTextures() {
        this.textures.ground1 = '/img/foxquest/ground1.png'
        this.textures.ground2 = '/img/foxquest/ground2.png'
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    update() {
        this.clear();
        this.frame += 1;

        let move = {x: 0, y: 0};
        let ray;

        if (this.heldKeys['w'] || this.heldKeys['ArrowUp']) {
            move.y -= 1;
        }
        if (this.heldKeys['a'] || this.heldKeys['ArrowLeft']) {
            move.x -= 1;
        }
        if (this.heldKeys['s'] || this.heldKeys['ArrowDown']) {
            move.y += 1;
        }
        if (this.heldKeys['d'] || this.heldKeys['ArrowRight']) {
            move.x += 1;
        }
        if (this.pressedKeys['e']) {
            ray = new Ray(this.canvas, 100);
            ray.setup(this.player, 'interact')
            delete this.pressedKeys['e'];
        }

        if (!this.player.denyInput) {
            this.player.move = move;
        }

        // Draw bg first
        let img = new Image();
        img.src = this.textures[this.currentArea.bgTexture];

        if (img.complete) {
            this.context.fillStyle = this.context.createPattern(img, 'repeat');
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Draw sprites and check ray
        this.sprites.forEach(s => {
            if (ray && s !== this.player && ray !== s) {
                ray.checkColliding(s);
            }

            this.sprites.forEach(s2 => {
                if (s !== s2)
                    s.checkColliding(s2);
            });

            s.draw();
        });

        // Draw dialogue
        this.dialogues.forEach(d => {
            d.draw();
        })
    }

    keyDown(event) {
        this.heldKeys[event.key] = true;
    }

    keyUp(event) {
        delete this.heldKeys[event.key];
    }

    keyPress(event) {
        this.pressedKeys[event.key] = true;
    }
}

let game = new GameArea();
game.start();
