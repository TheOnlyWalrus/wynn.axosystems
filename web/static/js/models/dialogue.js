export class DisplayBox {
    width;
    height;
    pos;
    screenPos;

    constructor(canvas, x, y, w, h, toDisplay) {
        this.display = toDisplay;
        this.canvas = canvas;
        // this.author = author;
        this.screenPos = {x:x,y:y};
        this.pos = this.screenPos;
        this.width = w;
        this.height = h;
        this.context = this.canvas.getContext('2d');
    }

    draw() {
        // main rect
        this.context.fillStyle = '#000000';
        this.context.fillRect(this.pos.x - this.width / 2, this.pos.y - this.height / 2, this.width, this.height);

        // purple inner rect
        this.context.strokeStyle = '#5A008A';
        this.context.lineWidth = 2.5;
        this.context.strokeRect(this.pos.x - this.width / 2 + 5, this.pos.y - this.height / 2 + 5, this.width - 10, this.height - 10);
    }
}

export class DialogueBox extends DisplayBox {
    lineSpacing = 20;
    cursor = 0;
    textLines;
    textMaxWidth = 510

    constructor(canvas, author, textLines) {
        super(canvas, 295, 110, 540, 165, textLines);
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
        super.draw();

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
            if (this.textLines[i].redir) {  // if choice found
                break;
            }

            if (!this.textLines[i].redir && i === this.textLines.length - 1) {  // if choice not found and at end of list
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
