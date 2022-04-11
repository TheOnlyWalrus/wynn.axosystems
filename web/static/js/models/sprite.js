import { DialogueBox } from './dialogue.js'

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
    move = {x:0,y:0}

    constructor(canvas, name, info) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.name = name;
        this.info = info;
        this.move = {x:0,y:0};
        this._vel = {x:0,y:0};
    }

    draw() {
        if (this.onScreen()) {
            let xMe = this.pos.x - this.dims.w / 2;
            let yMe = this.pos.y - this.dims.h / 2;

            if (
                xMe <= 0 ||
                xMe + this.dims.w >= this.canvas.width
            ) {
                if (this.move.x !== 0) {
                    let sign = this.move.x / Math.abs(this.move.x);
                    this.move.x = -this.move.x - sign * this.collisionBounceFactor;
                    this.denyInput = true;
                }
            }
            if (
                yMe <= 0 ||
                yMe + this.dims.h >= this.canvas.height
            ) {
                if (this.move.y !== 0) {
                    let sign = this.move.y / Math.abs(this.move.y);
                    this.move.y = -this.move.y - sign * this.collisionBounceFactor;
                    this.denyInput = true;
                }
            }

            if (!this.movementLocked) {
                this.pos = {
                    x: this.pos.x + this.move.x * this.moveSpeed,
                    y: this.pos.y + this.move.y * this.moveSpeed
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

export class Ray extends Sprite {
    rayWidth = 10

    constructor(canvas, range) {
        super(canvas, 'ray', {});
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

    constructor(canvas, name, info) {
        super(canvas, name, info);
        this.dialogueNum = 0;
    }

    setup(game) {
        this.game = game;
        this.loadDialogue();
    }

    loadDialogue() {
        if (this.name === 'npc1') {  // TODO: maybe load a dialogue file by name
            this.dialogue = {
                0: {
                    textLines: [
                        'Hello from line 1!',
                        'Hello from line 2!'
                    ],
                    from: this
                },
                1: {
                    textLines: ['2nd dialogue!'],
                    from: this
                },
                2: {
                    textLines: ['3rd dialogue!'],
                    from: this.game.player
                }
            }
        }
    }

    checkColliding(other) {
        super.checkColliding(other);
    }

    talk(other) {
        if (this.dialogueNum === 0) {
            other.movementLocked = true;
            let l = this.dialogue[this.dialogueNum];
            let d = new DialogueBox(this.canvas, l.from, l.textLines);
            this.game.pushDialogue(d);
            this.dialogueNum += 1;
        } else {
            if (this.dialogueNum >= this.dialogue.size - 1 || this.dialogue[this.dialogueNum] === undefined) {
                this.dialogueNum = 0;
                other.movementLocked = false;
                this.game.popDialogue();
            } else {
                this.game.currentArea.activeDialogues[0].textLines = this.dialogue[this.dialogueNum].textLines;
                this.game.currentArea.activeDialogues[0].author = this.dialogue[this.dialogueNum].from;
                this.dialogueNum += 1;
            }
        }
    }

    onCollision(other) {
        super.onCollision(other);

        if (other.name === 'ray') {
            this.talk(other.info.from);
        }
    }
}
