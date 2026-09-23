import { send } from "node:process";
import * as THREE from "three";

export function createScene(container: HTMLElement)
{
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e1e24);

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 6, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //Light
    const light = new THREE.DirectionalLight(0xfff, 1);
    light.position.set(5,10,7);
    scene.add(light, new THREE.AmbientLight(0x404040));

    //Suelo
    const grid = new THREE.GridHelper(20, 20, 0xffffff, 0x444444);
    scene.add(grid);

    const HandleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', HandleResize);

    const cleanup = () => {
        window.removeEventListener('resize', HandleResize);
        container.removeChild(renderer.domElement);
        renderer.dispose();

    };

    return { scene, camera, renderer, cleanup};
}