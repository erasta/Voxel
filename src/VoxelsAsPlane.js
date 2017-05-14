var VoxelsAsPlane = VoxelsAsPlane || {};

VoxelsAsPlane.createAtlas = function(voxels) {
    var tex = VoxelRender.makeTexture(voxels.data, voxels.side, voxels.side);
    var material = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), material);
    return mesh;
};

VoxelsAsPlane.create = function(voxels, z) {
    var arrtex = new Uint8Array(voxels.size[3] * voxels.size[0] * voxels.size[1]);
    var j = 0;
    for (var y = 0; y < voxels.size[1]; ++y) {
        var i = voxels.index(0, y, z, 0);
        for (var x = 0; x < voxels.size[0] * voxels.size[3]; ++x) {
            arrtex[j++] = voxels.data[i++];
        }
    }
    var tex = VoxelRender.makeTexture(arrtex, voxels.size[0], voxels.size[1]);
    var material = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), material);
    return mesh;
};
