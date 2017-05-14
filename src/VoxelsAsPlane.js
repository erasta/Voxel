var VoxelsAsPlane = VoxelsAsPlane || {};

VoxelsAsPlane.createAtlas = function(voxels) {
    var tex = VoxelRender.makeTexture(voxels.data, voxels.side, voxels.side);
    var material = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), material);
    return mesh;
};

VoxelsAsPlane.create = function(voxels, z) {
    var arrtex = new Uint8Array(voxels.channels * voxels.size.x * voxels.size.y);
    var j = 0;
    for (var y = 0; y < voxels.size.y; ++y) {
        var i = voxels.index(0, y, z, 0), il = i + voxels.size.x * voxels.channels;
        while (i < il) arrtex[j++] = voxels.data[i++];
    }
    var tex = VoxelRender.makeTexture(arrtex, voxels.size.x, voxels.size.y);
    var material = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    mesh.scale.copy(voxels.cellSize).multiplyScalar(64);
    // mesh.position.z = voxels.zcoord(z);
    return mesh;
};
