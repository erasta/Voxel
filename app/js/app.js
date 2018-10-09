var container, scene, camera, renderer, controls, stats;
var gui, guiParams;
var mesh, voxels;

function voxelSphere(voxels, center, radius, color, opacity) {
    var curr = new THREE.Vector3()
    for (curr.z = 0; curr.z < voxels.size.z; ++curr.z) {
        for (curr.y = 0; curr.y < voxels.size.y; ++curr.y) {
            for (curr.x = 0; curr.x < voxels.size.x; ++curr.x) {
                var dist = curr.distanceTo(center);
                if (dist > radius) continue;
                voxels.set(curr.x, curr.y, curr.z, 0, color[0]);
                voxels.set(curr.x, curr.y, curr.z, 1, color[1]);
                voxels.set(curr.x, curr.y, curr.z, 2, color[2]);
                voxels.set(curr.x, curr.y, curr.z, 3, opacity);
            }
        }
    }
}

function initApp() {
    applyGuiChanges();
}

function applyGuiChanges() {
    if (!voxels || voxels.size.z !== guiParams.dim) {
        var dim = guiParams.dim, half = guiParams.dim / 2;
        var cell = 40 / dim;
        voxels = new Voxels(new THREE.Vector3(dim, dim, dim), 4, new THREE.Vector3(cell, cell, cell), new THREE.Vector3(-20, -20, 0));
        voxelSphere(voxels, new THREE.Vector3(half, half, half), half * 0.7, [255, 0, 0], 20);
        voxelSphere(voxels, new THREE.Vector3(half, half, half), half * 0.35, [0, 255, 0], 255);
    }
    scene.remove(mesh);
    if (guiParams.show == 'Atlas') {
        mesh = VoxelsAsPlane.createAtlas(voxels);
    } else if (guiParams.show == 'Plane') {
        mesh = VoxelsAsPlane.create(voxels, Math.floor(guiParams.planePos * (voxels.size.z - 1)));
    } else if (guiParams.show == 'Voxels') {
        mesh = VoxelRender.create(voxels);
    }
    scene.add(mesh);
}

function initGui() {
    gui = new dat.GUI({ autoPlace: true, width: 500 });
    guiParams = new(function() {
        this.show = 'Voxels';
        this.dim = 40;
        this.planePos = 0.5;
    })();
    gui.add(guiParams, 'show', ['Atlas', 'Plane', 'Voxels']).onChange(applyGuiChanges);
    gui.add(guiParams, 'dim').name('Dimensions').min(8).max(128).step(8).onChange(applyGuiChanges);
    gui.add(guiParams, 'planePos').name('Z Plane pos').min(0).max(1).step(0.01).onChange(applyGuiChanges);
}

function initGraphics() {
    THREE.Object3D.DefaultUp.set(0, 0, 1);

    // SCENE
    scene = new THREE.Scene();
    container = document.getElementById('ThreeJS');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setFaceCulling(0);
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    // // Stats of FPS
    // stats = new Stats();
    // stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    // document.body.appendChild(stats.domElement);

    // CAMERA
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.set(0, -100, 60);
    // camera.up.set(0.0, 1.0, 0.0);
    scene.add(camera);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    THREEx.WindowResize(renderer, camera);

    // Background clear color
    renderer.setClearColor(0xffffff, 1);
    renderer.clear();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x222222));
    var grid = new THREE.GridHelper(50, 50);
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);

    // Lights
    [
        [1, 1, 1],
        [-1, 1, 1],
        [1, -1, 1],
        [-1, -1, 1]
    ].forEach(function(pos) {
        var dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
        dirLight.position.set(pos[0] * 100, pos[1] * 100, pos[2] * 100);
        this.scene.add(dirLight);
    });
}

var lastPos, lastParams;
function animate() {
    // stats.begin();
    if(!lastPos || lastPos.distanceToManhattan(camera.position) > 0.001 || !_.isEqual(guiParams, lastParams)) {
        lastPos = lastPos || new THREE.Vector3();
        lastPos.copy(camera.position);
        lastParams = _.clone(guiParams);
        renderer.render(scene, camera);
    }
    // stats.end();
    requestAnimationFrame(animate);
}

// code entry point
initGui();
initGraphics();
initApp();
animate();
