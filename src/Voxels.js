class Voxels {
    constructor(size, channels, cellSize, firstCell, data) {
        this.size = size || new THREE.Vector3(16, 16, 16);
        this.channels = channels || 4;
        this.cellSize = cellSize || new THREE.Vector3(1, 1, 1);
        this.firstCell = firstCell || new THREE.Vector3(-this.size.x * this.cellSize.x / 2, -this.size.y * this.cellSize.y / 2, 0);
        this.side = Math.pow(2, Math.ceil(Math.log2(Math.ceil(Math.sqrt(this.size.x * this.size.y * this.size.z)))));
        this.tileNum = new THREE.Vector2(Math.floor(this.side / this.size.x), Math.floor(this.side / this.size.y));
        this.data = data || new Uint8Array(this.channels * this.side * this.side);
    }

    lastCell() {
        return this.size.clone().multiply(this.cellSize).add(this.firstCell);
    }

    box() {
        return new THREE.Box3(this.firstCell.clone(), this.lastCell());
    }

    index(x, y, z, c) {
        var u = x + (z % this.tileNum.x) * this.size.x;
        var v = y + Math.floor(z / this.tileNum.x) * this.size.y;
        return (c || 0) + this.channels * (u + this.side * v);
        // return (c || 0) + this.channels * (x + this.size.x * (y + this.size.y * z));
    };

    get(x, y, z, c) {
        return this.data[this.index(x, y, z, c)];
    };

    set(x, y, z, c, value) {
        this.data[this.index(x, y, z, c)] = value;
    };

    xcoord(xpos) { return this.firstCell.x + (xpos + 0.4999) * this.cellSize.x; };
    ycoord(ypos) { return this.firstCell.y + (ypos + 0.4999) * this.cellSize.y; };
    zcoord(zpos) { return this.firstCell.z + (zpos + 0.4999) * this.cellSize.z; };
    xpos(xcoord) { return (xcoord - this.firstCell.x) / this.cellSize.x; };
    ypos(ycoord) { return (ycoord - this.firstCell.y) / this.cellSize.y; };
    zpos(zcoord) { return (zcoord - this.firstCell.z) / this.cellSize.z; };
}
