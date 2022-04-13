import {Area, CombatArea, Desert, Grasslands} from './models/area.js';
import {Ray, Player, Enemy} from "./models/sprite.js";

class GameArea {
    textures = {};
    areas = {

    };
    canvas = document.getElementById('game');
    cameraX = 0;
    cameraY = 0;

    start() {
        this.player = new Player(this, 'player', {species: 'fox', affiliation: 'player'});
        this.prepareTextures();

        this.areas['grasslands'] = new Grasslands(this);
        this.areas['desert'] = new Desert(this);
        this.areas['combat'] = new CombatArea(this);

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

    prepareTextures() {  // could probably just load a texture upon loading an area by name
        this.textures.ground1 = '/img/foxquest/ground1.png'
        this.textures.ground2 = '/img/foxquest/ground2.png'
        this.textures.combat = '/img/foxquest/combat.png'
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.setTransform(1, 0, 0, 1, 0, 0);
    }

    getContext() {
        if (this.context) {
            return this.context;
        } else {
            this.context = this.canvas.getContext('2d');
            return this.canvas.getContext('2d');
        }
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
        if (this.pressedKeys['e'] || this.pressedKeys['Enter'] || this.pressedKeys['z']) {
            if (!this.player.showInventory) {
                this.ray = new Ray(this, 100);
                this.ray.setup(this.player, 'interact')
            } else {
                this.player.inventoryBox.select();
            }

            this.pressedKeys['e'] ? delete this.pressedKeys['e'] : (
                this.pressedKeys['Enter'] ? delete this.pressedKeys['Enter'] : delete this.pressedKeys['z']
            );
        }
        if ((this.pressedKeys['i'] ||  this.pressedKeys['c']) && this.currentArea.activeDialogues.length === 0) {
            this.player.toggleInventory();
            this.pressedKeys['i'] ? delete this.pressedKeys['i'] : delete this.pressedKeys['c'];
        }
        if (this.pressedKeys['1']) {
            this.transitionArea('grasslands');
            delete this.pressedKeys['1'];
        }
        if (this.pressedKeys['2']) {
            this.transitionArea('desert');
            delete this.pressedKeys['2'];
        }
        if (this.pressedKeys['3']) {
            this.transitionArea('combat');
            delete this.pressedKeys['3'];
        }
        if (this.pressedKeys['w'] || (this.heldKeys['ArrowUp'] && (this.currentArea.activeDialogues.length > 0 || this.player.showInventory))) {
            this.pressedKeys['w'] ? delete this.pressedKeys['w'] : delete this.heldKeys['ArrowUp'];

            console.log();

            if (this.currentArea) {
                if (this.currentArea.activeDialogues.length > 0) {
                    this.currentArea.activeDialogues[0].moveCursor(-1);
                } else if (this.player.showInventory) {
                    this.player.inventoryBox.moveCursor(-1)
                }
            }
        }
        if (this.pressedKeys['s'] || (this.heldKeys['ArrowDown'] && (this.currentArea.activeDialogues.length > 0 || this.player.showInventory))) {
            this.pressedKeys['s'] ? delete this.pressedKeys['s'] : delete this.heldKeys['ArrowDown'];

            if (this.currentArea) {
                if (this.currentArea.activeDialogues.length > 0) {
                    this.currentArea.activeDialogues[0].moveCursor(1);
                } else if (this.player.showInventory) {
                    this.player.inventoryBox.moveCursor(1)
                }
            }
        }

        if (!this.player.denyInput) {
            this.player.move = move;
        }

        let camX = -this.player.pos.x + this.canvas.width / 2;
        let camY = -this.player.pos.y + this.canvas.height / 2;
        this.cameraX = camX;
        this.cameraY = camY;
        this.context.translate(camX, camY);

        if (this.currentArea.activeDialogues.length > 0) {
            let d = this.currentArea.activeDialogues[0];
            this.currentArea.activeDialogues[0].pos = {
                x: d.screenPos.x + this.player.pos.x - this.canvas.width / 2,
                y: d.screenPos.y + this.player.pos.y - this.canvas.height / 2
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
        // clearInterval(this.updater);
        let newArea = this.areas[area];

        if (this.currentArea instanceof CombatArea) {
            this.currentArea.endCombat();
        }

        if (newArea.team !== undefined) {
            newArea.startCombat(this.currentArea, this.cameraX, this.cameraY, [new Enemy(this, 'enemy1', {
                maxHealth: 10,
                startHealth: 10,
            })]);
        }

        this.currentArea = newArea;

        // this.updater = this.currentArea.update();
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
