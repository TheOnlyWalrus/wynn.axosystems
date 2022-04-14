export class DisplayBox {
    width;
    height;
    pos;
    screenPos;
    lineSpacing = 20;

    constructor(game, x, y, w, h, toDisplay) {
        this.display = toDisplay;
        this.game = game;
        this.context = this.game.context;
        // this.author = author;
        this.screenPos = {x:x,y:y};
        this.pos = this.screenPos;
        this.width = w;
        this.height = h;
        this.context = this.game.getContext();
    }

    draw() {
        // main rect
        this.context.fillStyle = '#000000';
        this.context.fillRect(this.pos.x - this.width / 1.7 - 5, this.pos.y - this.height * 1.5 - 5, this.width, this.height);

        // purple inner rect
        this.context.strokeStyle = '#5A008A';
        this.context.lineWidth = 2.5;
        this.context.strokeRect(this.pos.x - this.width / 1.7, this.pos.y - this.height * 1.5, this.width - 10, this.height - 10);
    }

    writeText(lineNo, text) {
        this.context.font = '20px courier new';
        this.context.fillStyle = '#FFFFFF';
        this.context.fillText(text, this.pos.x - this.width / 1.7 + 10, this.pos.y - this.height * 1.5 + this.lineSpacing * lineNo);
    }

    getTextWidth(text) {
        return this.context.measureText(text).width;
    }
}

export class DialogueBox extends DisplayBox {
    cursor = 0;
    textLines;
    textMaxWidth = 510

    constructor(game, author, textLines) {
        super(game, 295, 110, 540, 165, textLines);
        this.author = author;

        this.setText(textLines);
    }

    splitText(text) {
        let words = text.split(' ');
        let lines = [];
        let cur = words[0];

        for (let i = 1; i < words.length; i++) {
            let word = words[i];
            let width = this.context.measureText(cur + ' ' + word).width;

            if (width <= this.textMaxWidth) {
                cur += ' ' + word;
            } else {
                lines.push(cur);
                cur = word;
            }
        }

        lines.push(cur);
        return lines;
    }

    setText(lines) {
        this.textLines = lines;
        let i = this.getFirstChoiceIdx();  // get first choice

        if (i === lines.length) {  // if no choices, delete cursor
            this.delCursor();
        } else {  // set cursor to first choice
            this.cursor = i;
        }
    }

    draw() {
        // main rect
        this.context.fillStyle = '#000000';
        this.context.fillRect(this.pos.x - this.width / 2, this.pos.y - this.height / 2, this.width, this.height);

        // purple inner rect
        this.context.strokeStyle = '#5A008A';
        this.context.lineWidth = 2.5;
        this.context.strokeRect(this.pos.x - this.width / 2 + 5, this.pos.y - this.height / 2 + 5, this.width - 10, this.height - 10);

        let lineNo = 0;

        // show name at top of box
        this.context.font = '20px courier new';
        this.context.fillStyle = '#66CBFF';
        this.context.fillText(this.author.name, this.pos.x - this.width / 2 + 15, this.pos.y - this.height / 2 + 25);

        // npc dialogue
        this.context.fillStyle = '#FFFFFF';
        for (let i = 0; i < this.textLines.length; i++) {
            let text = this.textLines[i];
            if (text.text) {  // option check
                this.context.fillStyle = '#FFFAA0';
                text = text.text;
            }
            if (this.cursor === i) {  // add cursor to text if option is selected
                text = '> ' + text;
            }

            text = this.splitText(text);  // text-wrap

            for (let j = 0; j < text.length; j++) {  // for each line in text
                this.context.fillText(text[j], this.pos.x - this.width / 2 + 15, this.pos.y - this.height / 2 + 50 + lineNo * this.lineSpacing);

                lineNo += 1;
            }
        }
    }

    getFirstChoiceIdx() {
        let i;
        for (i = 0; i < this.textLines.length; i++) {
            if (this.textLines[i].redir || this.textLines[i].action) {  // if choice found
                break;
            }

            if (!this.textLines[i].redir && !this.textLines[i].action && i === this.textLines.length - 1) {  // if choice not found and at end of list
                i = this.textLines.length;
            }
        }

        return i;
    }

    moveCursor(dir) {
        if (this.cursor + dir >= this.textLines.length) {  // cursor at very bottom and trying to move down, set to first
            this.cursor = this.getFirstChoiceIdx();
        } else if (this.cursor + dir < this.getFirstChoiceIdx()) {  // cursor at very top and trying to move up, set to last
            this.cursor = this.textLines.length - 1;
        } else {  // normal cursor movement
            this.cursor += dir;
        }
    }

    delCursor() {
        this.cursor = null;
    }
}

export class InventoryBox extends DisplayBox {
    cursor = 0;
    prevCursorPos = 0;
    viewingInfo = false;
    viewingEquipping = false;
    viewingUse = false;
    itemView = {};
    infoChoices = [];
    types = [
        'weapon',
        'shield'
    ];
    equipChoices = [];
    useChoices = [];

    constructor(game, x, y, w, h) {
        super(game, x, y, w, h, null);

        this.infoBox = new DisplayBox(this.game, x, y, 500, 100, null);
        this.equipBox = new DisplayBox(this.game, x, y, 500, 100, null);
        this.useBox = new DisplayBox(this.game, x, y, 500, 100, null);
        this.infoChoices = [
            {
                text: 'Equip',
                action: () => this.viewingEquipping = true
            },
            {
                text: 'Exit',
                action: () => this.stopViewingInfo()
            }
        ];
        this.equipChoices = [
            {
                text: 'Exit',
                action: () => this.stopViewingEquipping()
            }
        ]
    }

    draw() {
        super.draw();

        if (this.equipChoices.length < Object.values(this.game.player.party).length + 1) {
            this.equipChoices = [
                {
                    text: 'Exit',
                    action: () => this.stopViewingEquipping()
                }
            ];
            for (let p of Object.values(this.game.player.party)) {
                this.equipChoices.unshift({
                    text: p.name,
                    action: () => this.equip(p)
                });
            }
            this.equipChoices.unshift({
                text: 'Player',
                action: () => this.equip(this.game.player)
            });
        }
        if (this.useChoices.length < Object.values(this.game.player.party).length + 1) {
            this.useChoices = [
                {
                    text: 'Exit',
                    action: () => this.stopViewingUse()
                }
            ];
            for (let p of Object.values(this.game.player.party)) {
                this.useChoices.unshift({
                    text: p.name,
                    action: () => this.use(p)
                });
            }
            this.useChoices.unshift({
                text: 'Player',
                action: () => this.use(this.game.player)
            });
        }

        if (this.items !== this.game.player.inventory) {
            this.items = this.game.player.inventory;
        }

        // set cursor to 0 if cursor is out of bounds (shouldn't happen because of setCursor)
        if (this.cursor >= this.items.length && !this.viewingEquipping && !this.viewingInfo && !this.viewingUse) {
            this.cursor = 0;
        } else if ((this.cursor >= this.equipChoices.length && this.viewingEquipping && !this.viewingUse) || (this.cursor < 0 && this.viewingEquipping && !this.viewingUse)) {
            this.cursor = 1;
        } else if (this.cursor >= this.infoChoices.length && this.viewingInfo && !this.viewingEquipping && !this.viewingUse) {
            this.cursor = 0;
        } else if (this.cursor >= this.useChoices.length && this.viewingUse) {
            this.cursor = 0;
        }

        // show name at top of box
        this.context.font = '20px courier new';
        this.context.fillStyle = '#66CBFF';
        this.context.fillText('Inventory', this.pos.x - 120, this.pos.y - this.height * 1.45);

        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            let itemName = item.name;

            if (item.equipped) {
                this.context.fillStyle = '#9e74e5';
            } else {
                this.context.fillStyle = '#FFFFFF';
            }

            if (!this.viewingInfo) {
                if (this.cursor === i) {
                    itemName = '> ' + itemName;
                }
            }

            this.context.font = '20px courier new';
            this.context.fillText(itemName, this.pos.x - 120, this.pos.y - this.height * 1.45 + (i + 1) * 20);
        }

        let all = Object.values(this.game.player.equipped);
        for (let p of Object.values(this.game.player.party)) {
            all = [...all, ...Object.values(p.equipped)];
        }
        for (let i = 0; i < all.length; i++) {
            let item = all[i];
            let name = 'None';

            if (item !== null) {
                name = item.name;
            }

            let idx = i % Object.keys(this.game.player.equipped).length;
            let typeName = this.types[idx][0].toUpperCase() + this.types[idx].slice(1);

            this.context.fillStyle = '#FFFFFF';
            this.context.font = '20px courier new';
            this.context.fillText(typeName + ': ' + name, this.pos.x - 25 - this.width / 2, this.pos.y - this.height * 1.45 + (i + 1) * 20);
        }

        for (let i = 0; i < Object.keys(this.game.player.baseStats).length; i++) {
            let statValue = Object.values(this.game.player.baseStats)[i];

            let statName = Object.keys(this.game.player.baseStats)[i].toLowerCase();
            statName = statName[0].toUpperCase() + statName.slice(1);

            let equipped = Object.values(this.game.player.equipped);

            for (let j = 0; j < equipped.length; j++) {
                if (equipped[j] !== null) {
                    if (equipped[j].stats[statName.toLowerCase()] && equipped[j].stats[statName.toLowerCase()] !== 0) {
                        statValue += ' +' + equipped[j].stats[statName.toLowerCase()];
                    }
                }
            }

            this.context.fillStyle = '#FFFFFF';
            this.context.font = '20px courier new';
            this.context.fillText(statName + ': ' + statValue, this.pos.x - 25 + this.width / 7, this.pos.y - this.height * 1.45 + (i + 1) * 20);
        }

        this.context.fillStyle = '#FFFAA0';
        this.context.fillText('Money: ' + this.game.player.money, this.pos.x - 25 - this.width / 2, this.pos.y - this.height * 1.45 + 20 * 22);

        if (this.viewingInfo && !this.viewingEquipping && !this.viewingUse) {
            this.infoBox.pos = {
                x: this.pos.x,
                y: this.pos.y - 250
            };
            this.infoBox.draw();
            this.context.fillStyle = '#FFFFFF';
            this.infoBox.writeText(1, this.itemView.name);
            this.infoBox.writeText(2, this.itemView.description);

            for (let i = 0; i < this.infoChoices.length; i++) {
                if (!this.items[this.prevCursorPos].equipped && this.infoChoices[0].text !== 'Equip' && this.items[this.prevCursorPos].stats.usable === undefined) {
                    this.infoChoices[0] = {
                        'text': 'Equip',
                        'action': () => this.viewingEquipping = true
                    }
                } else if (this.items[this.prevCursorPos].equipped && this.infoChoices[0].text !== 'Unequip') {
                    this.infoChoices[0] = {
                        'text': 'Unequip',
                        'action': () => this.unequip(this.items[this.prevCursorPos].holder)
                    }
                } else if (this.items[this.prevCursorPos].stats.usable && this.infoChoices[0].text !== 'Use') {
                    this.infoChoices[0] = {
                        'text': 'Use',
                        'action': () => this.viewingUse = true
                    }
                }

                let text = this.infoChoices[i].text;
                if (this.cursor === i) {
                    text = '> ' + text;
                }

                this.infoBox.writeText(i + 3, text);
            }
        } else if (this.viewingEquipping && !this.viewingUse) {
            this.equipBox.pos = {
                x: this.pos.x,
                y: this.pos.y - 250
            };
            this.equipBox.draw()
            this.equipBox.writeText(1, 'Equip to: ');
            for (let i = 0; i < this.equipChoices.length; i++) {
                name = this.equipChoices[i].text;
                if (this.cursor === i) {
                    name = '> ' + name;
                }

                this.equipBox.writeText(i + 2, name);
            }
        } else if (this.viewingUse) {
            this.useBox.pos = {
                x: this.pos.x,
                y: this.pos.y - 250
            };
            this.useBox.draw()
            for (let i = 0; i < this.useChoices.length; i++) {
                name = this.useChoices[i].text;
                if (this.cursor === i) {
                    name = '> ' + name;
                }

                this.useBox.writeText(i + 1, name);
            }
        }
    }

    moveCursor(dir) {
        if (!this.viewingInfo) {
            if (this.cursor + dir >= this.items.length) {  // cursor at very bottom and trying to move down, set to first
                this.cursor = 0;
            } else if (this.cursor + dir < 0) {  // cursor at very top and trying to move up, set to last
                this.cursor = this.items.length - 1;
            } else {  // normal cursor movement
                this.cursor += dir;
            }
        } else if (!this.viewingEquipping) {
            if (this.cursor + dir >= this.infoChoices.length) {  // cursor at very bottom and trying to move down, set to first
                this.cursor = 0;
            } else if (this.cursor + dir < 0) {  // cursor at very top and trying to move up, set to last
                this.cursor = this.infoChoices.length - 1;
            } else {  // normal cursor movement
                this.cursor += dir;
            }
        } else if (this.viewingEquipping) {
            if (this.cursor + dir >= this.equipChoices.length) {  // cursor at very bottom and trying to move down, set to first
                this.cursor = 0;
            } else if (this.cursor + dir < 0) {  // cursor at very top and trying to move up, set to last
                this.cursor = this.equipChoices.length - 1;
            } else {  // normal cursor movement
                this.cursor += dir;
            }
        }
    }

    select() {
        if (!this.viewingInfo && this.items[this.cursor]) {
            this.viewingInfo = true;
            this.itemView = this.items[this.cursor];
            this.prevCursorPos = this.cursor;
            this.cursor = 0;
        } else if (this.viewingInfo && this.infoChoices[this.cursor] && !this.viewingEquipping && !this.viewingUse) {
            this.infoChoices[this.cursor].action();
        } else if (this.viewingEquipping && !this.viewingUse) {
            this.equipChoices[this.cursor].action();
        } else if (this.viewingUse) {
            this.useChoices[this.cursor].action();
        }
    }

    equip(who) {
        let item = this.items[this.prevCursorPos];

        who.equip(item);

        this.stopViewingEquipping();
    }

    unequip(who) {
        who.unequip(this.items[this.prevCursorPos].type);

        this.stopViewingInfo();
    }

    use(who) {
        who.use(this.items[this.prevCursorPos]);

        this.stopViewingUse();
        if (!this.items[this.prevCursorPos].stats.reusable) {
            this.stopViewingInfo();
        }
    }

    stopViewingInfo() {
        this.viewingInfo = false;
        this.cursor = this.prevCursorPos;
    }

    stopViewingEquipping() {
        this.viewingEquipping = false;
        this.cursor = 0;
    }

    stopViewingUse() {
        this.viewingUse = false;
        this.cursor = 0;
    }
}
