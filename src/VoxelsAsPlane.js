var VoxelsAsPlane = VoxelsAsPlane || {};

VoxelsAsPlane.createAtlas = function(voxels) {
    var tex = VoxelRender.makeTexture(voxels.data, voxels.side, voxels.side);
    var material = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), material);
    return mesh;
};

VoxelsAsPlane.create = function(voxels, z) {
    var arrtex = new Uint8Array(voxels.size[3] * voxels.size[0] * voxels.size[1]);
    for (var y = 0; y < voxels.size[1]; ++y) {
        var from = voxels.index(0, y, z, 0), to = voxels.index(0, y+1, z, 0);
        for (var i = from, j = y * voxels.size[0]; i < to; ++i, ++j) {
            // if (voxels.data[i]) debugger
            arrtex[j] = voxels.data[i];
        }
    }
    var tex = VoxelRender.makeTexture(arrtex, voxels.size[0], voxels.size[1]);
    var material = new THREE.MeshBasicMaterial({ map: tex, transparent: false });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), material);
    return mesh;
};
