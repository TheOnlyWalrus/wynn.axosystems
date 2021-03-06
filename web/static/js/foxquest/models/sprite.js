import {DialogueBox, InventoryBox} from './dialogue.js'

export class Sprite {
    image = null;
    pos = {
        x: 0,
        y: 0
    };  // Center
    dims = {
        w: 0,
        h: 0
    };
    color = '#000000';
    moveSpeed = 0.5;
    denyInput = false;
    movementLocked = false;
    collisionBounceFactor = 1;
    facing = {
        up: 1,
        right: 0
    };
    move = {x:0,y:0};
    area;
    stats = {
        attack: 0,
        defense: 0,
        speed: 0,
        health: 0,
        maxHealth: 0
    };

    constructor(game, name, info) {
        this.game = game;
        this.canvas = this.game.canvas;
        this.context = this.canvas.getContext('2d');
        this.name = name;
        this.info = info;
        this.move = {x:0,y:0};
        this.area = this.game.currentArea;
    }

    draw() {
        if (this.onScreen()) {
            let xMe = this.pos.x - this.dims.w / 2;
            let yMe = this.pos.y - this.dims.h / 2;

            if (
                xMe <= 0 ||
                xMe + this.dims.w >= this.area.width
            ) {
                if (this.move.x !== 0) {
                    let sign = this.move.x / Math.abs(this.move.x);
                    this.move.x = -this.move.x - sign * this.collisionBounceFactor;
                    this.denyInput = true;
                }
            }
            if (
                yMe <= 0 ||
                yMe + this.dims.h >= this.area.height
            ) {
                if (this.move.y !== 0) {
                    let sign = this.move.y / Math.abs(this.move.y);
                    this.move.y = -this.move.y - sign * this.collisionBounceFactor;
                    this.denyInput = true;
                }
            }

            if (!this.movementLocked) {
                let moveVec = this.move;
                let magnitude = Math.sqrt(moveVec.x * moveVec.x + moveVec.y * moveVec.y);
                if (magnitude !== 0) {
                    moveVec.x = moveVec.x / magnitude;
                    moveVec.y = moveVec.y / magnitude;
                }

                this.pos = {
                    x: this.pos.x + moveVec.x * this.moveSpeed,
                    y: this.pos.y + moveVec.y * this.moveSpeed
                };

                if (this.move.x !== 0) {
                    this.facing.right = this.move.x;
                    this.facing.up = 0;
                } else if (this.move.y !== 0) {
                    this.facing.up = -this.move.y;
                    this.facing.right = 0;
                }
            }

            if (this.image !== null) {
                // draw image
            } else {
                this.context.fillStyle = this.color;
                this.context.fillRect(
                    xMe, yMe,
                    this.dims.w, this.dims.h
                );
            }
        }
    }

    drawName() {
        this.context.font = '14px courier new';
        this.context.fillStyle = '#000000';  // Figure out how to position automatically
        this.context.fillText(this.name, this.pos.x - this.dims.h / 2 - 15, this.pos.y - this.dims.h / 2 - 7);
    }

    onScreen() {
        // let xMe = this.pos.x - this.dims.w / 2;
        // let yMe = this.pos.y - this.dims.h / 2;
        //
        // let _obj = {
        //     name: this.name,
        //     obj: this
        // };
        //
        // if (
        //     xMe < this.canvas.width &&
        //     xMe + this.dims.w > 0 &&
        //     yMe < this.canvas.height &&
        //     yMe + this.dims.h > 0
        // ) {
        //     if (!spritesOnScreen.includes(_obj)) {
        //         spritesOnScreen += _obj;
        //     }
        //
        //     return true;
        // } else {
        //     if (spritesOnScreen.includes(_obj)) {
        //         delete spritesOnScreen[_obj];
        //     }
        //
        //     return false;
        // }

        return true;
    }

    checkColliding(other) {
        if (this.info.species === 'wall' && other.info.species === 'wall')
            return;

        let xMe = this.pos.x - this.dims.w / 2;
        let yMe = this.pos.y - this.dims.h / 2;
        let xThem = other.pos.x - other.dims.w / 2;
        let yThem = other.pos.y - other.dims.h / 2;

        if (
            xMe < xThem + other.dims.w &&
            xMe + this.dims.w > xThem &&
            yMe < yThem + other.dims.h &&
            yMe + this.dims.h > yThem
        ) {
            this.onCollision(other);
        } else {
            this.denyInput = false;
        }
    }

    isColliding(other) {
        let xMe = this.pos.x - this.dims.w / 2;
        let yMe = this.pos.y - this.dims.h / 2;
        let xThem = other.pos.x - other.dims.w / 2;
        let yThem = other.pos.y - other.dims.h / 2;

        return xMe < xThem + other.dims.w &&
            xMe + this.dims.w > xThem &&
            yMe < yThem + other.dims.h &&
            yMe + this.dims.h > yThem;
    }

    onCollision(other) {
        let xMe = this.pos.x - this.dims.w / 2;
        let yMe = this.pos.y - this.dims.h / 2;
        let xThem = other.pos.x - other.dims.w / 2;
        let yThem = other.pos.y - other.dims.h / 2;

        if (xMe < xThem + other.dims.w &&
            xMe + this.dims.w > xThem && !other.info.from) {
            if (this.move.x !== 0) {
                let sign = this.move.x / Math.abs(this.move.x);
                this.move.x = -this.move.x - sign * this.collisionBounceFactor;
                this.denyInput = true;
            }
        }
        if (yMe < yThem + other.dims.h &&
            yMe + this.dims.h > yThem && !other.info.from) {
            if (this.move.y !== 0) {
                let sign = this.move.y / Math.abs(this.move.y);
                this.move.y = -this.move.y - sign * this.collisionBounceFactor;
                this.denyInput = true;
            }
        }
    }
}

export class Enemy extends Sprite {
    constructor(game, name, info) {
        super(game, name, info);
        this.startHealth = info.startHealth;
        this.stats.maxHealth = info.maxHealth;
    }
}

export class Player extends Sprite {
    detectRadius = 80;
    inventory = [];
    party = {

    };
    inventorySize = 10;
    money = 0;
    showInventory = false;
    equipped = {
        weapon: null,
        shield: null
    };

    constructor(game, name, info) {
        super(game, name, info);
        this.stats.health = 95;
        this.stats.maxHealth = 100;

        this.inventoryBox = new InventoryBox(this.game, 0, 0, 700, 500, null);
    }

    use(item) {
        if (!item.stats.reusable) {
            this.game.player.inventory.splice(this.game.player.inventory.indexOf(item), 1);
        }

        if (item.type === 'potion') {
            if (item.stats.health) {
                this.stats.health += item.stats.health;
                if (this.stats.health > this.stats.maxHealth) {
                    this.stats.health = this.stats.maxHealth;
                }
            }
        }
    }

    equip(item) {
        item.equipped = true;

        if (this.equipped[item.type] !== null) {
            this.stats.attack -= this.equipped[item.type].stats.attack ? this.equipped[item.type].stats.attack : 0;
            this.stats.defense -= this.equipped[item.type].stats.defense ? this.equipped[item.type].stats.defense : 0;
            this.stats.maxHealth -= this.equipped[item.type].stats.health ? this.equipped[item.type].stats.health : 0;
            this.equipped.weapon.equipped = false;
            this.equipped.weapon.holder = null;
        }
        this.equipped[item.type] = item;
        this.equipped[item.type].holder = this;
        this.stats.attack += this.equipped[item.type].stats.attack ? this.equipped[item.type].stats.attack : 0;
        this.stats.defense += this.equipped[item.type].stats.defense ? this.equipped[item.type].stats.defense : 0;
        this.stats.maxHealth += this.equipped[item.type].stats.health ? this.equipped[item.type].stats.health : 0;
    }

    unequip(itemType) {
        this.stats = {
            attack: this.stats.attack - this.equipped[itemType].stats.attack,
            defense: this.stats.defense - this.equipped[itemType].stats.defense
        };
        this.stats.maxHealth = this.stats.maxHealth - this.equipped[itemType].stats.health;
        this.equipped[itemType].equipped = false;
        this.equipped[itemType] = null;
    }

    drawRadius() {
        this.context.beginPath();
        this.context.strokeStyle = '#000000';
        this.context.lineWidth = 1.0;
        this.context.arc(this.pos.x, this.pos.y, this.detectRadius, 0, 2 * Math.PI);
        this.context.stroke();
    }

    draw() {
        super.draw();

        if (this.showInventory) {
            if (!this.inventoryBox.context) {
                this.inventoryBox.context = this.context;
            }

            this.inventoryBox.pos = {
                x: this.pos.x + 60,
                y: this.pos.y + this.game.canvas.height / 2 + 60
            };

            this.inventoryBox.draw();
        }
    }

    toggleInventory() {
        this.movementLocked = !this.movementLocked;
        this.showInventory = !this.showInventory;
    }

    isInRadius(other) {
        let distX = Math.abs(this.pos.x - other.pos.x - other.dims.w / 2);
        let distY = Math.abs(this.pos.y - other.pos.y - other.dims.h / 2);

        if (distX > other.dims.w / 2 + this.detectRadius) { return false; }
        if (distY > other.dims.h / 2 + this.detectRadius) { return false; }

        if (distX <= other.dims.w / 2) { return true; }
        if (distY <= other.dims.h / 2) { return true; }

        let dx = distX - other.dims.w / 2;
        let dy = distY - other.dims.h / 2;
        return dx * dx + dy * dy <= this.detectRadius * this.detectRadius;
    }

    detectWithinRadius(other) {
        if (other !== this && other.name !== 'wall') {
            if (this.isInRadius(other)) {
                other.drawName();
            }
        }
    }

    setupParty() {
        this.party['1'] = new PartyMember(this.game, '1', this, {species: 'fox', affiliation: 'party', 'pos': 1});
    }
}

export class PartyMember extends Sprite {
    equipped = {
        weapon: null,
        shield: null
    };

    constructor(game, name, player, info) {
        super(game, name, info)
        this.player = player;
        this.stats.maxHealth = this.stats.health = 100;
    }

    use(item) {
        if (!item.stats.reusable) {
            this.game.player.inventory.splice(this.game.player.inventory.indexOf(item), 1);
        }

        if (item.type === 'potion') {
            if (item.stats.health) {
                this.stats.health += item.stats.health;
                if (this.stats.health > this.stats.maxHealth) {
                    this.stats.health = this.stats.maxHealth;
                }
            }
        }
    }

    equip(item) {
        item.equipped = true;

        if (this.equipped[item.type] !== null) {
            this.stats.attack -= this.equipped[item.type].stats.attack ? this.equipped[item.type].stats.attack : 0;
            this.stats.defense -= this.equipped[item.type].stats.defense ? this.equipped[item.type].stats.defense : 0;
            this.stats.maxHealth -= this.equipped[item.type].stats.health ? this.equipped[item.type].stats.health : 0;
            this.equipped.weapon.equipped = false;
            this.equipped.weapon.holder = null;
        }
        this.equipped[item.type] = item;
        this.equipped[item.type].holder = this;
        this.stats.attack += this.equipped[item.type].stats.attack ? this.equipped[item.type].stats.attack : 0;
        this.stats.defense += this.equipped[item.type].stats.defense ? this.equipped[item.type].stats.defense : 0;
        this.stats.maxHealth += this.equipped[item.type].stats.health ? this.equipped[item.type].stats.health : 0;
    }

    unequip(itemType) {
        this.stats = {
            attack: this.stats.attack - this.equipped[itemType].stats.attack,
            defense: this.stats.defense - this.equipped[itemType].stats.defense
        };
        this.stats.maxHealth = this.stats.maxHealth - this.equipped[itemType].stats.health;
        this.equipped[itemType].equipped = false;
        this.equipped[itemType].holder = null;
        this.equipped[itemType] = null;
    }
}

export class Ray extends Sprite {
    constructor(game, range) {
        super(game, 'ray', {});
        this.canvas = this.game.canvas;
        this.range = range;
    }

    setup(sender, intent) {
        this.info.from = sender;
        this.info.intent = intent;
        this.facing = sender.facing;
        this.pos.x = sender.pos.x;
        this.pos.y = sender.pos.y;

        if (sender.facing.right !== 0) {
            this.dims.w = 1 * this.range;

            if (sender.facing.right === -1) {
                this.pos.x -= sender.dims.w / 2;
            }
        }
        if (sender.facing.up !== 0) {
            this.dims.h = 1 * this.range;

            if (sender.facing.up === 1) {
                this.pos.y -= sender.dims.h / 2;
            }
        }

        return this;
    }

    checkColliding(other) {
        if (this.isColliding(other)) {
            this.dims = {w:0,h:0};
            this.range = 0;

            other.onCollision(this);
        }
    }
}

export class NPC extends Sprite {
    dialogue = {};
    game;
    guiActive = false;
    redirAfterGUI = -2;

    constructor(game, name, info) {  // TODO: change canvas to game in every class
        super(game, name, info);
        this.game = game;
        this.dialogueNum = 0;
        this.loadDialogue();
    }

    loadDialogue() {
        // replace player string value with game.player
        fetch(`../../json/dialogue/${this.name}.json`)
            .then(res => res.json())
            .then(r => {
                Object.keys(r).map((key, _) => {
                    let from = r[key].from;

                    if (from === 'player') {
                        r[key].from = this.game.player;
                    } else if (from === 'self') {
                        r[key].from = this;
                    }
                });

                this.dialogue = r;
            });
    }

    checkColliding(other) {
        super.checkColliding(other);
    }

    talk(other) {
        if (this.redirAfterGUI !== -2) {
            this.dialogueNum = this.redirAfterGUI;
            this.redirAfterGUI = -2;
        } else {
            if (this.game.currentArea.activeDialogues.length === 0) {
                other.movementLocked = true;
                let l = this.dialogue[this.dialogueNum];
                let d = new DialogueBox(this.game, l.from, l.textLines);

                this.game.pushDialogue(d);
            } else {
                if (this.dialogueNum >= this.dialogue.size || this.dialogue[this.dialogueNum] === undefined) {
                    this.dialogueNum = 0;
                    other.movementLocked = false;
                    this.game.popDialogue();
                } else {
                    if (
                        this.dialogue[this.dialogueNum].textLines[this.game.currentArea.activeDialogues[0].cursor] !== undefined &&
                        this.dialogue[this.dialogueNum].textLines[this.game.currentArea.activeDialogues[0].cursor].action
                    ) {
                        // action field is defined
                        let d = this.dialogue[this.dialogueNum].textLines[this.game.currentArea.activeDialogues[0].cursor];
                        this.dialogueNum = d.redir;

                        this.act(d)
                    } else if (
                        this.dialogue[this.dialogueNum].textLines[this.game.currentArea.activeDialogues[0].cursor] !== undefined &&
                        this.dialogue[this.dialogueNum].textLines[this.game.currentArea.activeDialogues[0].cursor].redir
                    ) {
                        // action field is not defined, but redir is and is a choice
                        let d = this.dialogue[this.dialogueNum].textLines[this.game.currentArea.activeDialogues[0].cursor];

                        this.dialogueNum = d.redir;
                    } else if (this.dialogue[this.dialogueNum].redir !== undefined) {
                        // normal dialogue, but redir is defined
                        this.dialogueNum = this.dialogue[this.dialogueNum].redir;
                    } else {
                        // normal dialogue, no redir (go to next line)
                        this.dialogueNum += 1;
                    }

                    if (this.dialogue[this.dialogueNum] !== undefined) {
                        this.game.currentArea.activeDialogues[0].setText(this.dialogue[this.dialogueNum].textLines);
                        this.game.currentArea.activeDialogues[0].author = this.dialogue[this.dialogueNum].from;
                    } else {
                        this.dialogueNum = 0;
                        other.movementLocked = false;
                        this.game.popDialogue();
                    }
                }
            }
        }
    }

    act(dialoguePiece) {
        if (dialoguePiece.action === 'open_gui') {
            this.guiActive = true;
        } else if (dialoguePiece.action === 'close_gui') {
            this.guiActive = false;
        }
    }

    // Todo: make shopkeeper class for these
    // Todo: maybe add another menu like "buy_screen" when selecting an item and display info about it

    onCollision(other) {
        super.onCollision(other);

        if (other.name === 'ray') {
            this.talk(other.info.from);
        }
    }
}

export class Merchant extends NPC {
    shopDialogue = {'buy': 'You bought %item_name for %item_cost!',
                    'sell': 'You sold %item_name for %item_cost!'};

    constructor(game, name, info) {
        super(game, name, info);

        this.shopItems = info.shopItems;
    }

    buy(dialoguePiece) {
        if (
            this.game.player.inventory.length < this.game.player.inventorySize
        ) {
            let item = this.shopItems.find(i => i.id == dialoguePiece.itemId);  // == is fine here, sometimes the types don't match

            if (item) {
                if (this.game.player.money >= item.price) {
                    this.game.player.inventory.push(item);
                    this.game.player.money -= item.price;

                    this.dialogue[dialoguePiece.redirSuccess].textLines[0] = this.shopDialogue['buy'].replace('%item_name', item.name).replace('%item_cost', item.price);
                    this.dialogueNum = dialoguePiece.redirSuccess;
                } else {
                    this.dialogueNum = dialoguePiece.redirFailMoney;
                }
            } else {
                this.dialogueNum = dialoguePiece.redirFail;
            }
        } else {
            this.dialogueNum = dialoguePiece.redirFailSpace;
        }
    }

    sell(dialoguePiece) {
        let item = this.game.player.inventory.find(i => i.id == dialoguePiece.itemId && !i.equipped);

        if (item && item.equipped !== true) {
            this.game.player.money += item.sellPrice;
            this.game.player.inventory.splice(this.game.player.inventory.indexOf(item), 1);

            this.dialogue[dialoguePiece.redirSuccess].textLines[0] = this.shopDialogue['sell'].replace('%item_name', item.name).replace('%item_cost', item.sellPrice);
            this.dialogueNum = dialoguePiece.redirSuccess;
        } else {
            this.dialogueNum = dialoguePiece.redirFail;
        }
    }

    act(dialoguePiece) {
        super.act(dialoguePiece);

        if (dialoguePiece.action === 'buy_item') {
            this.buy(dialoguePiece);
        } else if (dialoguePiece.action === 'sell_item') {
            this.sell(dialoguePiece);
        }
    }

    talk(other) {
        if (this.redirAfterGUI !== -2) {
            this.dialogueNum = this.redirAfterGUI;
            this.redirAfterGUI = -2;
        } else {
            if (this.game.currentArea.activeDialogues.length === 0) {
                other.movementLocked = true;
                let l = this.dialogue[this.dialogueNum];
                let d = new DialogueBox(this.game, l.from, l.textLines);

                this.game.pushDialogue(d);
            } else {
                if (this.dialogueNum >= this.dialogue.size || this.dialogue[this.dialogueNum] === undefined) {
                    this.dialogueNum = 0;
                    other.movementLocked = false;
                    this.game.popDialogue();
                } else {
                    if (
                        this.dialogue[this.dialogueNum].textLines[this.game.currentArea.activeDialogues[0].cursor] !== undefined &&
                        this.dialogue[this.dialogueNum].textLines[this.game.currentArea.activeDialogues[0].cursor].action
                    ) {
                        // action field is defined
                        let d = this.dialogue[this.dialogueNum].textLines[this.game.currentArea.activeDialogues[0].cursor];
                        this.dialogueNum = d.redir;

                        this.act(d)
                    } else if (
                        this.dialogue[this.dialogueNum].textLines[this.game.currentArea.activeDialogues[0].cursor] !== undefined &&
                        this.dialogue[this.dialogueNum].textLines[this.game.currentArea.activeDialogues[0].cursor].redir
                    ) {
                        // action field is not defined, but redir is and is a choice
                        let d = this.dialogue[this.dialogueNum].textLines[this.game.currentArea.activeDialogues[0].cursor];
                        if (d.redir === 'shop_sell') {
                            this.dialogue[d.redir].textLines = [];

                            this.game.player.inventory.forEach(item => {
                                this.dialogue[d.redir].textLines.push({
                                    text: `${item.sellPrice} - ${item.name}`,
                                    action: 'sell_item',
                                    redirSuccess: 'sell_item_success',
                                    redirFail: 'sell_item_fail',
                                    itemId: item.id
                                });
                            });

                            this.dialogue[d.redir].textLines.push({text: 'Exit', redir: 'shop_enter'});
                        }
                        this.dialogueNum = d.redir;
                    } else if (this.dialogue[this.dialogueNum].redir !== undefined) {
                        // normal dialogue, but redir is defined
                        this.dialogueNum = this.dialogue[this.dialogueNum].redir;
                    } else {
                        // normal dialogue, no redir (go to next line)
                        this.dialogueNum += 1;
                    }

                    if (this.dialogue[this.dialogueNum] !== undefined) {
                        this.game.currentArea.activeDialogues[0].setText(this.dialogue[this.dialogueNum].textLines);
                        this.game.currentArea.activeDialogues[0].author = this.dialogue[this.dialogueNum].from;
                    } else {
                        this.dialogueNum = 0;
                        other.movementLocked = false;
                        this.game.popDialogue();
                    }
                }
            }
        }
    }
}
