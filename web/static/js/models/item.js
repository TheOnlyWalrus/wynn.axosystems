export class Item {
    stats = {};
    description;
    equipped = false;
    price = 0;
    sellPrice = 0;
    holder = null;
    id = null;
    type = null;

    constructor(game, name, info)
    {
        this.game = game;
        this.name = name;
        this.id = info.id;
        this.price = info.price;
        this.sellPrice = info.sellPrice;
        this.stats = info.stats;
        this.description = info.description ? info.description : 'No description.';
        this.type = info.type;
    }

    clone() {
        return new Item(this.game, this.name, {
            id: this.id,
            stats: this.stats,
            description: this.description,
            type: this.type,
            sellPrice: this.sellPrice,
            price: this.price
        });
    }
}
