import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';

    // Scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Fog
    scene.fog = new THREE.FogExp2(0x000000, 0.1);

    // Change the box's color to smooth pink
    const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1, 1, 1, 1);
    const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xFF69B4 });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    scene.add(box);

    // Make orbs smaller and increase their count
    const orbCount = 30;
    const orbSize = 0.25;
    const orbGeometry = new THREE.SphereGeometry(orbSize, 32, 32);
    const orbMaterial = new THREE.MeshPhongMaterial({ color: 0x0099ff }); // Soft blue color
    const orbs = [];

    for (let i = 0; i < orbCount; i++) {
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
        orb.userData.seed = Math.random() * 100;
        
        // Make orbs emit light
        const orbLight = new THREE.PointLight(0x0099ff, 1, 10); // Soft blue light
        orb.add(orbLight);

        scene.add(orb);
        orbs.push(orb);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    // Camera position and controls
    camera.position.z = 5;
    const controls = new OrbitControls(camera, renderer.domElement);

    // Raycaster and mouse
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(box);

    if (intersects.length > 0) {
        // Wobble animation
        const wobbleTween = new TWEEN.Tween(box.rotation)
            .to(
                {
                    x: box.rotation.x + Math.PI / 16,
                    y: box.rotation.y + Math.PI / 16,
                    z: box.rotation.z + Math.PI / 16
                },
                100
            )
            .repeat(1)
            .yoyo(true)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();

        wobbleTween.onComplete(() => {
            // Break the box into 100 smaller boxes
            const smallBoxSize = 0.1;
            const smallBoxGeometry = new THREE.BoxBufferGeometry(smallBoxSize, smallBoxSize, smallBoxSize);
            const smallBoxes = [];

            for (let i = 0; i < 100; i++) {
                const smallBox = new THREE.Mesh(smallBoxGeometry, boxMaterial);
                smallBox.position.copy(box.position);
                scene.add(smallBox);
                smallBoxes.push(smallBox);
            }

            // Remove the original box
            scene.remove(box);

            // Animate the smaller boxes
            smallBoxes.forEach((smallBox, index) => {
                const targetPosition = smallBox.position.clone().add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(5));
                const explodeTween = new TWEEN.Tween(smallBox.position)
                    .to(targetPosition, 1000)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .start();

                // Animate the smaller boxes back to the original box
                explodeTween.onComplete(() => {
                    const combineTween = new TWEEN.Tween(smallBox.position)
                        .to(box.position, 1000)
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .start();

                    combineTween.onComplete(() => {
                        // Remove the small box and add the original box back
                        scene.remove(smallBox);
                        if (index === smallBoxes.length - 1) {
                            scene.add(box);
                        }
                    });
                });
            });
        });
    }
});

// Animation loop
const animate = () => {
    requestAnimationFrame(animate);
    TWEEN.update();

    // Rotate the box
    box.rotation.x += 0.01;
    box.rotation.y += 0.01;

    // Update shiny orbs positions with smoother floating
    orbs.forEach(orb => {
        orb.position.x += Math.sin(Date.now() * 0.001 + orb.userData.seed) * 0.01;
        orb.position.y += Math.cos(Date.now() * 0.001 + orb.userData.seed) * 0.01;
        orb.position.z += Math.sin(Date.now() * 0.001 + orb.userData.seed) * 0.01;
    });

    // Render the scene
    renderer.render(scene, camera);
};

// Start the animation loop
animate();

