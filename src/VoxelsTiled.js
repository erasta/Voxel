var VoxelsTiled = function(size, cellSize, firstCell, data) {
    this.size = size || [16, 16, 16, 4];
    this.cellSize = cellSize || new THREE.Vector3(1, 1, 1);
    this.firstCell = firstCell || new THREE.Vector3(-this.size[0] * this.cellSize.x / 2, -this.size[1] * this.cellSize.y / 2, 0);
    this.side = Math.pow(2, Math.ceil(Math.log2(Math.ceil(Math.sqrt(this.size[0] * this.size[1] * this.size[2])))));
    this.tileNum = new THREE.Vector2(Math.floor(this.side / this.size[0]), Math.floor(this.side / this.size[1]));
    this.data = data || new Uint8Array(this.size[3] * this.side * this.side);
}

VoxelsTiled.prototype.last = function() {
    return new THREE.Vector3().fromArray(this.size).multiply(this.cellSize).add(this.firstCell);
}

VoxelsTiled.prototype.box = function() {
    return new THREE.Box3(this.firstCell.clone(), this.last());
}

VoxelsTiled.prototype.index = function(x, y, z, c) {
    var u = x + (z % this.tileNum.x) * this.size[0];
    var v = y + Math.floor(z / this.tileNum.x) * this.size[1];
    return (c || 0) + this.size[3] * (u + this.side * v);
    // return (c || 0) + this.size[3] * (x + this.size[0] * (y + this.size[1] * z));
};

VoxelsTiled.prototype.get = function(x, y, z, c) {
    return this.data[this.index(x, y, z, c)];
};

VoxelsTiled.prototype.set = function(x, y, z, c, value) {
    this.data[this.index(x, y, z, c)] = value;
};
