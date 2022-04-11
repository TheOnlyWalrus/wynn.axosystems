export class DialogueBox {
    lineSpacing = 20;
    width = 450;
    height = 125;
    pos = {
        x: 250,
        y: 90
    }

    constructor(canvas, author, textLines) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.textLines = textLines;
        this.author = author;
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
            this.context.fillText(this.textLines[i], this.pos.x - this.width / 2 + 15, this.pos.y - this.height / 2 + 50 + i * this.lineSpacing);
        }
    }
}
