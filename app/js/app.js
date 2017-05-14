var container, scene, camera, renderer, controls, stats;
var gui, guiParams;
var mesh, voxels;

function initApp() {
    voxels = new VoxelsTiled([16, 16, 16 ,4]);
    for (var z = 0; z < voxels.size[2]; ++z) {
        for (var y = 0; y < voxels.size[1]; ++y) {
            for (var x = 0; x < voxels.size[0]; ++x) {
                var dist = Math.sqrt(Math.pow(x-8, 2) + Math.pow(y-8, 2) + Math.pow(z-8, 2));
                voxels.set(x, y, z, 0, dist * 32);
                voxels.set(x, y, z, 1, 0);
                voxels.set(x, y, z, 2, 0);
                voxels.set(x, y, z, 3, (dist < 5) ? 255 : 0);
            }
        }
    }

    applyGuiChanges();
}

function applyGuiChanges() {
    scene.remove(mesh);
    if (guiParams.show == 'Atlas') {
        mesh = VoxelsAsPlane.createAtlas(voxels);
    } else if (guiParams.show == 'Plane') {
        mesh = VoxelsAsPlane.create(voxels, guiParams.z);
    } else if (guiParams.show == 'Voxels') {
        mesh = VoxelRender.create(voxels);
    }
    scene.add(mesh);
}

function initGui() {
    gui = new dat.GUI({ autoPlace: true, width: 500 });
    guiParams = new(function() {
        this.show = 'Plane';
        this.z = 8;
    })();
    gui.add(guiParams, 'show', ['Atlas', 'Plane', 'Voxels']).onChange(applyGuiChanges);
    gui.add(guiParams, 'z').name('Z').min(0).max(16).step(1).onChange(applyGuiChanges);
}

function initGraphics() {
    THREE.Object3D.DefaultUp.set(0, 0, 1);

    // SCENE
    scene = new THREE.Scene();
    container = document.getElementById('ThreeJS');

    // RENDERER
    if (Detector.webgl) {
        renderer = new THREE.WebGLRenderer({ antialias: true });
    } else {
        renderer = new THREE.CanvasRenderer();
    }

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
    camera.position.set(0, -30, 5);
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

var lastPos;
function animate() {
    // stats.begin();
    if(!lastPos || lastPos.distanceToManhattan(camera.position) > 0.001) {
        lastPos = lastPos || new THREE.Vector3();
        lastPos.copy(camera.position);
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
