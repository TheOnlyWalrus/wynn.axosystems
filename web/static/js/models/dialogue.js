export class DialogueBox {
    lineSpacing = 20;
    width = 450;
    height = 125;
    pos = {
        x: 250,
        y: 90
    }
    cursor = 0;
    textLines;

    constructor(canvas, author, textLines) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.setText(textLines);
        this.author = author;
    }

    setText(lines) {
        this.textLines = lines;
        let i;
        for (i = 0; i < lines.length; i++) {
            if (lines[i].redir) {
                break;
            }

            if (!lines[i].redir && i === lines.length - 1) {
                i = lines.length;
            }
        }

        if (i === lines.length) {
            this.delCursor();
        } else {
            this.cursor = i;
        }
    }

    draw() {
        this.context.fillStyle = '#000000';
        this.context.fillRect(this.pos.x - this.width / 2, this.pos.y - this.height / 2, this.width, this.height);

        this.context.strokeStyle = '#5A008A';
        this.context.lineWidth = 2.5;
        this.context.strokeRect(this.pos.x - this.width / 2 + 5, this.pos.y - this.height / 2 + 5, this.width - 10, this.height - 10);

        this.context.font = '20px courier new';
        this.context.fillStyle = '#66CBFF';
        this.context.fillText(this.author.name, this.pos.x - this.width / 2 + 15, this.pos.y - this.height / 2 + 25);

        this.context.fillStyle = '#FFFFFF';
        for (let i = 0; i < this.textLines.length; i++) {
            let text = this.textLines[i];
            if (text.text) {
                text = text.text;
            }
            if (this.cursor === i) {
                text = '> ' + text;
            }
            this.context.fillText(text, this.pos.x - this.width / 2 + 15, this.pos.y - this.height / 2 + 50 + i * this.lineSpacing);
        }
    }

    getFirstChoiceIdx() {
        let i;
        for (i = 0; i < this.textLines.length; i++) {
            if (this.textLines[i].redir) {
                break;
            }

            if (!this.textLines[i].redir && i === this.textLines.length - 1) {
                i = this.textLines.length;
            }
        }
        console.log(i);

        return i;
    }

    createCursor(pos) {
        this.cursor = pos ? pos : 0;
    }

    moveCursor(dir) {
        if (this.cursor + dir >= this.textLines.length) {
            this.cursor = this.getFirstChoiceIdx();
        } else if (this.cursor + dir < this.getFirstChoiceIdx()) {
            this.cursor = this.textLines.length - 1;
        } else {
            this.cursor += dir;
        }
    }

    delCursor() {
        this.cursor = null;
    }
}
