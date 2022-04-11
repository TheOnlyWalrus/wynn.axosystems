import { Area } from './models/area.js';
import { NPC, Ray, Sprite } from "./models/sprite.js";

class GameArea {
    textures = {};
    areas = {

    };
    canvas = document.getElementById('game');
    player = new NPC(this.canvas, 'player', {species: 'fox', affiliation: 'player'});

    start() {
        this.prepareTextures();

        this.areas['grasslands'] = new Area(this, 'grasslands', 'ground1');
        this.areas['desert'] = new Area(this, 'desert', 'ground2');

        window.addEventListener('keydown', (e) => this.keyDown(e));
        window.addEventListener('keyup', (e) => this.keyUp(e));
        window.addEventListener('keypress', (e) => this.keyPress(e));

        this.context = this.canvas.getContext('2d');
        this.frame = 0;
        this.updater = setInterval(() => this.update(), 0);

        this.heldKeys = {};
        this.pressedKeys = {};

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
            this.ray = new Ray(this.canvas, 100);
            this.ray.setup(this.player, 'interact')
            delete this.pressedKeys['e'];
        }
        if (this.pressedKeys['1']) {
            this.transitionArea('grasslands');
            delete this.pressedKeys['1'];
        }
        if (this.pressedKeys['2']) {
            this.transitionArea('desert');
            delete this.pressedKeys['2'];
        }

        if (!this.player.denyInput) {
            this.player.move = move;
        }

        if (this.currentArea) {
            this.currentArea.update()
        }
    }

    keyDown(event) {
        this.heldKeys[event.key] = true;
    }

    keyUp(event) {
        this.heldKeys[event.key] = false;
    }

    keyPress(event) {
        this.pressedKeys[event.key] = true;
    }

    transitionArea(area) {
        this.currentArea = this.areas[area];
    }

    pushDialogue(dialogue) {
        if (this.currentArea) {
            this.currentArea.activeDialogues.push(dialogue);
        }
    }

    popDialogue() {
        if (this.currentArea) {
            this.currentArea.activeDialogues.pop();
        }
    }
}

let game = new GameArea();
game.start();
