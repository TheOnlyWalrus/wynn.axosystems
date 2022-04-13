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
    itemView = {};
    infoChoices = [];
    cursorMode = 'main';
    types = [
        'weapon',
        'shield'
    ];

    constructor(game, x, y, w, h) {
        super(game, x, y, w, h, null);

        this.infoBox = new DisplayBox(this.game, x, y, 500, 100, null);
        this.infoChoices = [
            {
                text: 'Equip',
                action: () => this.equip(),
            },
            {
                text: 'Exit',
                action: () => this.stopViewingInfo()
            }
        ];
    }

    draw() {
        super.draw();

        if (this.items !== this.game.player.inventory) {
            this.items = this.game.player.inventory;
        }

        // set cursor to 0 if cursor is out of bounds (shouldn't happen because of setCursor)
        if (this.cursor >= this.items.length) {
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

        for (let i = 0; i < Object.keys(this.game.player.equipped).length; i++) {
            let item = Object.values(this.game.player.equipped)[i];
            let name = 'None';

            if (item !== null) {
                name = item.name;
            }

            let typeName = this.types[i][0].toUpperCase() + this.types[i].slice(1);

            this.context.fillStyle = '#FFFFFF';
            this.context.font = '20px courier new';
            this.context.fillText(typeName + ': ' + name, this.pos.x - 25 - this.width / 2, this.pos.y - this.height * 1.45 + (i + 1) * 20);
        }

        if (this.viewingInfo) {
            this.infoBox.pos = {
                x: this.pos.x,
                y: this.pos.y - 250
            };
            this.infoBox.draw();
            this.context.fillStyle = '#FFFFFF';
            this.infoBox.writeText(1, this.itemView.name);
            this.infoBox.writeText(2, this.itemView.description);

            for (let i = 0; i < this.infoChoices.length; i++) {
                if (!this.items[this.prevCursorPos].equipped && this.infoChoices[0].text !== 'Equip') {
                    this.infoChoices[0] = {
                        'text': 'Equip',
                        'action': () => this.equip()
                    }
                } else if (this.items[this.prevCursorPos].equipped && this.infoChoices[0].text !== 'Unequip') {
                    this.infoChoices[0] = {
                        'text': 'Unequip',
                        'action': () => this.unequip()
                    }
                }

                let text = this.infoChoices[i].text;
                if (this.cursor === i) {
                    text = '> ' + text;
                }

                this.infoBox.writeText(i + 3, text);
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
        } else {
            if (this.cursor + dir >= this.infoChoices.length) {  // cursor at very bottom and trying to move down, set to first
                this.cursor = 0;
            } else if (this.cursor + dir < 0) {  // cursor at very top and trying to move up, set to last
                this.cursor = this.infoChoices.length - 1;
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
        } else if (this.viewingInfo && this.infoChoices[this.cursor]) {
            this.infoChoices[this.cursor].action();
        }
    }

    equip() {
        let item = this.items[this.prevCursorPos];

        this.game.player.equip(item);

        this.stopViewingInfo();
    }

    unequip() {
        this.game.player.unequip(this.items[this.prevCursorPos].type);

        this.stopViewingInfo();
    }

    stopViewingInfo() {
        this.viewingInfo = false;
        this.cursor = this.prevCursorPos;
    }
}
