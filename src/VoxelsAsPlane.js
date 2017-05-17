class VoxelsAsPlane {
    static createAtlas(voxels) {
        var tex = VoxelRender.makeTexture(voxels.data, voxels.side, voxels.side);
        var material = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
        var plane = new THREE.PlaneGeometry(voxels.side / voxels.size.x * 10, voxels.side / voxels.size.y * 10);
        var mesh = new THREE.Mesh(plane, material);
        return mesh;
    }

    static create(voxels, z) {
        var arrtex = new Uint8Array(voxels.channels * voxels.size.x * voxels.size.y);
        var j = 0;
        for (var y = 0; y < voxels.size.y; ++y) {
            var i = voxels.index(0, y, z, 0),
                il = i + voxels.size.x * voxels.channels;
            while (i < il) arrtex[j++] = voxels.data[i++];
        }
        var tex = VoxelRender.makeTexture(arrtex, voxels.size.x, voxels.size.y);
        var material = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
        var mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
        mesh.geometry.translate(0.5, 0.5, 0);
        mesh.position.set(voxels.firstCell.x, voxels.firstCell.y, voxels.zcoord(z));
        mesh.scale.copy(voxels.cellSize).multiply(voxels.size);
        return mesh;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports.VoxelsAsPlane = VoxelsAsPlane;
}
