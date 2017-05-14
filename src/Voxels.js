var Voxels = function(size, cellSize, firstCell, data) {
    this.size = size || [16, 16, 16, 4];
    this.cellSize = cellSize || new THREE.Vector3(1, 1, 1);
    this.firstCell = firstCell || new THREE.Vector3(-this.size[0] * this.cellSize.x / 2, -this.size[1] * this.cellSize.y / 2, 0);
    this.data = data || new Uint8Array(this.size[0] * this.size[1] * this.size[2] * this.size[3]);
}

Voxels.prototype.last = function() {
    return new THREE.Vector3().fromArray(this.size).multiply(this.cellSize).add(this.firstCell);
}

Voxels.prototype.box = function() {
    return new THREE.Box3(this.firstCell.clone(), this.last());
}

Voxels.prototype.index = function(x, y, z, c) {
    return (c || 0) + this.size[3] * (x + this.size[0] * (y + this.size[1] * z));
};

Voxels.prototype.get = function(x, y, z, c) {
    return this.data[this.index(x, y, z, c)];
};

Voxels.prototype.set = function(x, y, z, c, value) {
    this.data[this.index(x, y, z, c)] = value;
};
