import {NPC, Merchant} from "./sprite.js";
import {DisplayBox} from "./dialogue.js";
import {Item} from "./item.js";

export class Area {
    transitions = {};
    sprites = [];
    activeDialogues = [];
    height = 2000;
    width = 2000;

    constructor(game, name, bgTexture) {
        this.name = name;
        this.game = game;
        this.bgTexture = bgTexture;
    }

    drawBg() {
        let img = new Image();
        img.src = this.game.textures[this.bgTexture];

        if (img.complete) {
            this.game.context.fillStyle = this.game.context.createPattern(img, 'repeat');

            this.game.context.fillRect(
                this.game.player.pos.x - this.game.canvas.width / 2,
                this.game.player.pos.y - this.game.canvas.height / 2, 2000, 2000
            );
        }
    }

    update() {
        this.drawBg();

        // Draw sprites, check ray, check player radius
        this.sprites.forEach(s => {
            this.game.player.detectWithinRadius(s);

            if (this.game.ray && s !== this.game.player && this.game.ray !== s) {
                if (this.game.ray.isColliding(s)) {
                    this.game.ray.checkColliding(s);
                    this.game.ray = null;
                }
            }

            this.sprites.forEach(s2 => {
                if (s !== s2)
                    s.checkColliding(s2);
            });

            s.draw();
        });

        // Draw dialogue
        this.activeDialogues.forEach(d => {
            d.draw();
        })
    }
}

export class Grasslands extends Area {
    constructor(game) {
        super(game, 'grasslands', 'ground1');

        this.sprites[0] = this.game.player;
        this.sprites[0].dims = {w: 20, h: 20};
        this.sprites[0].pos = {x: 100, y: 100};

        let sword = new Item(this.game, 'Basic Sword', {
            description: 'A basic sword',
            type: 'weapon',
            price: 10,
            sellPrice: 5,
            id: 0,
            stats: {
                attack: 5,
                defense: 0
            }
        });
        let shield = new Item(this.game, 'Basic Shield', {
            description: 'A basic shield',
            type: 'shield',
            price: 10,
            sellPrice: 5,
            id: 1,
            stats: {
                attack: 0,
                defense: 5
            }
        });
        // todo: maybe create usable item class
        let healthPotion = new Item(this.game, 'Health Potion', {
            description: 'A health potion',
            type: 'potion',
            price: 5,
            sellPrice: 3,
            id: 2,
            stats: {
                health: 10,
                usable: true,
            }
        });
        sword.holder = this.game.player;
        this.game.player.inventory.push(sword.clone());
        this.game.player.inventory.push(sword.clone());
        this.game.player.inventory.push(healthPotion.clone());
        this.game.player.inventory.push(shield.clone());
        this.game.player.inventory.push(shield.clone());
        sword.holder = this.game.player;

        this.sprites[1] = new Merchant(this.game, 'merchant1', {
            species: 'fox', affiliation: 'friendly',
            shopItems: [
                sword,
                shield,
                healthPotion,
            ]
        });
        this.sprites[1].dims = {w: 20, h: 20};
        this.sprites[1].pos = {x: 500, y: 350};

        this.sprites[2] = new NPC(this.game, 'wall', {species: 'wall', affiliation: 'boundary'});
        this.sprites[2].dims = {w: 10, h: 200};
        this.sprites[2].pos = {x: 900, y: 500};

        for (let s of this.sprites) {
            s.area = this;
            s.context = this.game.getContext();
        }
    }
}

export class Desert extends Area {
    constructor(game) {
        super(game, 'desert', 'ground2');

        this.sprites[0] = this.game.player;
        this.sprites[0].dims = {w: 20, h: 20};
        this.sprites[0].pos = {x: 100, y: 100};

        let sword = new Item(this.game, 'Basic Sword', {
            description: 'A basic sword',
            type: 'weapon',
            price: 10,
            sellPrice: 5,
            id: 0,
            stats: {
                attack: 5,
                defense: 0
            }
        });
        let shield = new Item(this.game, 'Basic Shield', {
            description: 'A basic shield',
            type: 'shield',
            price: 10,
            sellPrice: 5,
            id: 1,
            stats: {
                attack: 0,
                defense: 5
            }
        });
        // todo: maybe create usable item class
        let healthPotion = new Item(this.game, 'Health Potion', {
            description: 'A health potion',
            type: 'potion',
            price: 5,
            sellPrice: 3,
            id: 2,
            stats: {
                health: 10,
                usable: true
            }
        });

        this.sprites[1] = new Merchant(this.game, 'merchant1', {
            species: 'fox', affiliation: 'friendly',
            shopItems: [
                sword,
                shield,
                healthPotion,
            ]
        });
        this.sprites[1].dims = {w: 20, h: 20};
        this.sprites[1].pos = {x: 500, y: 350};

        this.sprites[2] = new NPC(this.game, 'wall', {species: 'wall', affiliation: 'boundary'});
        this.sprites[2].dims = {w: 10, h: 200};
        this.sprites[2].pos = {x: 900, y: 500};

        this.sprites.forEach(s => {
            s.area = this;
        });
    }
}

export class CombatArea extends Area {
    team = [];
    enemies = [];
    turn = 0;
    whosTurn = 0;
    previousArea;

    constructor(game) {
        super(game, 'combat', 'combat');
        this.team.push(this.game.player);
        this.previousArea = this.game.lastAreaInfo;

        this.mainBox = new DisplayBox(
            this.game,
            750, 275,
            1200, 165
        );
    }

    update() {
        // Do not want to call super.update(), as we don't want to detect collisions
        this.drawBg();

        this.mainBox.pos = {
            x: this.mainBox.screenPos.x - this.game.cameraX,
            y: this.mainBox.screenPos.y - this.game.cameraY + this.game.canvas.height - (this.mainBox.height + 50)
        };

        //
        this.mainBox.draw();
    }

    startCombat(lastArea, cX, cY, otherTeam) {
        this.enemies = otherTeam;
        this.game.player.movementLocked = true;
        this.previousArea = lastArea;
    }

    endCombat() {
        this.game.player.movementLocked = false;
    }

    doTurn() {
        // Do turn stuff

        this.turn++;
        this.whosTurn = this.whosTurn ? 0 : 1;
    }
}
