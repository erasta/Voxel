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

    var tex = VoxelRender.makeTexture(voxels.data, voxels.side, voxels.side);

    var material = new THREE.ShaderMaterial({
        transparent: true,
        vertexShader: VoxelRender.vertShader,
        fragmentShader: VoxelRender.fragShader,
        uniforms: {
            cubeTex: {type: 't', value: tex},
            size: {type: 'v3', value: voxels.size},
            cellSize: {type: 'v3', value: voxels.cellSize},
            firstCell: {type: 'v3', value: voxels.firstCell},
            lastCell: {type: 'v3', value: voxels.last()},
            center: {type: 'v3', value: voxels.firstCell.clone().add(voxels.last()).divideScalar(2)},
            tileNum: {type: 'v2', value: voxels.tileNum},
            side: {type: 'v2', value: voxels.side},
        },
        // wireframe: true
    });
    // var material = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0.3 });

    return new THREE.Mesh(geom, material);
};

VoxelRender.makeTexture = function(arr, width, height) {
    var texture = new THREE.DataTexture(arr, width, height, THREE.RGBAFormat);
    texture.needsUpdate = true;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping; // RepeatWrapping;
    texture.minFilter = texture.magFilter = THREE.NearestFilter; // THREE.LinearFilter;
    texture.flipY = false;
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
		// //Set the world space coordinates of the back faces vertices as output.
        vec3 cameraVector = normalize(center - cameraPosition);
        vec3 down = vec3(0.0, 0.0, -1.0);
        vec4 quat = rotationBetweenVectorsToQuaternion(down, cameraVector);
		vec3 rotpos = rotateVectorByQuaternion(position - center, quat) + center;
        // worldSpaceCoords = (rotpos - firstCell) / cellSize / size + vec3(0.5); //move it from [-0.5;0.5] to [0,1]
        worldSpaceCoords = (rotpos - firstCell) / cellSize / vec3(64.0); //move it from [-0.5;0.5] to [0,1]
        // worldSpaceCoords = position + vec3(0.5);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(rotpos, 1.0);
        // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
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
    uniform vec2 tileNum;
    uniform float side;

    vec4 sampleAs3DTexture(vec3 texCoord) {
        if (min(min(texCoord.x, texCoord.y), texCoord.z) < 0.01 || max(max(texCoord.x, texCoord.y), texCoord.z) > 0.99) discard;
        vec3 size1 = size - vec3(1.0);
        vec3 coord = floor(texCoord * size1);
        float u = (coord.x + mod(coord.z, tileNum.x) * size.x) / side;
        float v = (coord.y + floor(coord.z / tileNum.x) * size.y) / side;
        vec2 texCoordSlice = clamp(vec2(u, v), 0.0, 1.0);
        return texture2D(cubeTex, texCoordSlice);
    }
    void main(void) {
        gl_FragColor = sampleAs3DTexture(worldSpaceCoords);
        if (gl_FragColor.w < 0.01) discard;
        // gl_FragColor = vec4(1.0, 0.0, 0.0, 0.3);
        // gl_FragColor = gl_FragCoord;
    }
    `;
