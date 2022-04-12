import { Area } from './models/area.js';
import { NPC, Ray, Player } from "./models/sprite.js";

class GameArea {
    textures = {};
    areas = {

    };
    canvas = document.getElementById('game');
    player = new Player(this.canvas, 'player', {species: 'fox', affiliation: 'player'});

    start() {
        this.prepareTextures();
        this.player.setup(this);

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
        this.context.setTransform(1, 0, 0, 1, 0, 0);
    }

    update() {
        this.clear();
        this.frame += 1;

        let move = {x: 0, y: 0};

        // probably handle these in each Area or make a call to the currentArea to handle
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
        if (this.pressedKeys['w'] || (this.heldKeys['ArrowUp'] && this.currentArea.activeDialogues.length > 0)) {
            this.pressedKeys['w'] ? delete this.pressedKeys['w'] : delete this.heldKeys['ArrowUp'];

            if (this.currentArea) {
                if (this.currentArea.activeDialogues.length > 0) {;
                    this.currentArea.activeDialogues[0].moveCursor(-1);
                }
            }
        }
        if (this.pressedKeys['s'] || (this.heldKeys['ArrowDown'] && this.currentArea.activeDialogues.length > 0)) {
            this.pressedKeys['s'] ? delete this.pressedKeys['s'] : delete this.heldKeys['ArrowDown'];

            if (this.currentArea) {
                if (this.currentArea.activeDialogues.length > 0) {
                    this.currentArea.activeDialogues[0].moveCursor(1);
                }
            }
        }

        if (!this.player.denyInput) {
            this.player.move = move;
        }


        let camX = -this.player.pos.x + this.canvas.width / 2;
        let camY = -this.player.pos.y + this.canvas.height / 2;

        this.context.translate(camX, camY);

        if (this.currentArea.activeDialogues.length > 0) {
            let d = this.currentArea.activeDialogues[0];
            this.currentArea.activeDialogues[0].pos = {
                x: d.screenPos.x + this.player.pos.x - this.canvas.width / 2,
                y: d.screenPos.y + this.player.pos.y - this.canvas.height / 2
            }

            if (this.pressedKeys['3']) {
                console.log(`dX: ${d.screenPos.x}, dY: ${d.screenPos.y}, cX: ${camX}, cY: ${camY}, dH: ${d.height}, dW: ${d.width}`);

                delete this.pressedKeys['3'];
            }
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
