var VoxelRender = VoxelRender || {};

VoxelRender.create = function(voxels) {
    // Create layers of circle to form a sphere containing the voxels
    var geom = new THREE.Geometry();
    var sphere = voxels.box().getBoundingSphere();
    var circleCenter = sphere.center.clone();
    var z1 = sphere.center.z - sphere.radius + voxels.cellSize.z;
    var z2 = sphere.center.z + sphere.radius - voxels.cellSize.z;
    for (var z = z1; z <= z2; z += voxels.cellSize.z) {
        var circleRadius = Math.sqrt(sphere.radius * sphere.radius - Math.pow(sphere.center.z - z, 2));
        var circle = new THREE.CircleGeometry(circleRadius, 20);
        circle.translate(sphere.center.x, sphere.center.y, z);
        geom.merge(circle);
    }
    var material = new THREE.MeshNormalMaterial();

    return new THREE.Mesh(geom, material);
};
