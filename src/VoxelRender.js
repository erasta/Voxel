var VoxelRender = VoxelRender || {};

VoxelRender.create = function(voxels) {
    // Create layers of circles slicing a sphere containing the voxels
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
    var material = new THREE.ShaderMaterial({
        transparent: true,
        vertexShader: VoxelRender.vertShader,
        fragmentShader: VoxelRender.fragShader,
        uniforms: {
            cubeTex: {type: "t", value: tex},
            size: {type: "v3", value: new THREE.Vector3().fromArray(voxels.size)},
            cellSize: {type: "v3", value: voxels.cellSize},
            firstCell: {type: "v3", value: voxels.firstCell},
            lastCell: {type: "v3", value: voxels.last()},
            center: {type: "v3", value: voxels.firstCell.clone().add(voxels.last()).divideScalar(2)},
        },
        // wireframe: true
    });
    // var material = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0.3 });

    var tex = VoxelRender.makeTexture(voxels.data, voxels.size[0], voxels.size[1]);

    return new THREE.Mesh(geom, material);
};

VoxelRender.makeTexture = function(arr, width, height) {
    var texture = new THREE.DataTexture(arr, width, height, THREE.RGBAFormat);
    texture.needsUpdate = true;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; // ClampToEdgeWrapping
    texture.minFilter = texture.magFilter = THREE.LinearFilter;
    texture.flipY = true;
    return texture;
};

VoxelRender.vertShader = `
	varying vec3 worldSpaceCoords;
    uniform vec3 size;
    uniform vec3 cellSize;
    uniform vec3 firstCell;
    uniform vec3 lastCell;
    uniform vec3 center;

    vec4 rotationBetweenVectorsToQuaternion(vec3 a, vec3 b) {
        float nxDir = dot(a, b);
        if (nxDir < -0.999999) {
            vec3 tmpvec3 = cross(vec3(1.0, 0.0, 0.0), a);
            if (length(tmpvec3) < 0.000001)
                tmpvec3 = cross(vec3(0.0, 1.0, 0.0), a);
            return vec4(normalize(tmpvec3), 0.0);
        } else if (nxDir > 0.999999) {
            return vec4(0.0, 0.0, 0.0, 1.0);
        } else {
            vec3 tmpvec3 = cross(a, b);
            vec4 tmpvec4 = vec4(tmpvec3, 1.0 + nxDir);
            return normalize(tmpvec4);
        }
    }

    vec3 rotateVectorByQuaternion( vec3 v, vec4 q ) {
        vec3 dest = vec3( 0.0 );
        float x = v.x, y  = v.y, z  = v.z;
        float qx = q.x, qy = q.y, qz = q.z, qw = q.w;
        // calculate quaternion * vector
        float ix =  qw * x + qy * z - qz * y,
            iy =  qw * y + qz * x - qx * z,
            iz =  qw * z + qx * y - qy * x,
            iw = -qx * x - qy * y - qz * z;
        // calculate result * inverse quaternion
        dest.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        dest.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        dest.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        return dest;
    }

    void main() {
		//Set the world space coordinates of the back faces vertices as output.
        vec3 cameraVector = normalize(center - cameraPosition);
        vec3 down = vec3(0.0, 0.0, -1.0);
        vec4 quat = rotationBetweenVectorsToQuaternion(down, cameraVector);
		vec3 rotpos = rotateVectorByQuaternion(position - center, quat) + center;
        worldSpaceCoords = (rotpos - firstCell) / cellSize / size; //move it from [-0.5;0.5] to [0,1]
        gl_Position = projectionMatrix * modelViewMatrix * vec4(rotpos, 1.0);
    }
    `;

VoxelRender.fragShader = `
    varying vec3 worldSpaceCoords;
    uniform sampler2D cubeTex;
    uniform vec3 size;
    uniform vec3 cellSize;
    uniform vec3 firstCell;
    uniform vec3 lastCell;
    uniform vec3 center;
    void main(void) {
        // gl_FragColor = sampleAs3DTexture(worldSpaceCoords);
        // if (gl_FragColor.w < 0.01) discard;
        gl_FragColor = vec4(1.0, 0.0, 0.0, 0.3);
        //gl_FragColor = gl_FragCoord;
    }
    `;