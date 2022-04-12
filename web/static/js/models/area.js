import {NPC, Sprite} from "./sprite.js";

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

        this.sprites[0] = this.game.player;
        this.sprites[0].dims = {w: 20, h: 20};
        this.sprites[0].pos = {x: 100, y: 100};
        this.sprites[0].setArea(this);

        this.sprites[1] = new NPC(this.game.canvas, 'npc1', {species: 'fox', affiliation: 'friendly'});
        this.sprites[1].dims = {w: 20, h: 20};
        this.sprites[1].pos = {x: 500, y: 350};
        this.sprites[1].setup(this.game);
        this.sprites[1].setArea(this);

        this.sprites[2] = new NPC(this.game.canvas, 'wall', {species: 'wall', affiliation: 'boundary'});
        this.sprites[2].dims = {w: 10, h: 200};
        this.sprites[2].pos = {x: 900, y: 500};
        this.sprites[2].setup(this.game);
        this.sprites[2].setArea(this);
    }

    drawBg() {
        let img = new Image();
        img.src = this.game.textures[this.bgTexture];

        if (img.complete) {
            this.game.context.fillStyle = this.game.context.createPattern(img, 'repeat');

            this.game.context.fillRect(
                this.game.player.pos.x - this.game.canvas.width / 2,
                this.game.player.pos.y - this.game.canvas.height / 2, 2000, 2000);
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
