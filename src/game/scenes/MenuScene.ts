import * as THREE from 'three';
import { IScene } from '../SceneManager';
import { InputHandler } from '../InputHandler'; 

export class MenuScene implements IScene{
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    private cube: THREE.Mesh;

    constructor(){
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a01);

        this.camera = new THREE.PerspectiveCamera(75, 256/ 224, 0.1, 1000);
        this.camera.position.set(0,3,0);
        this.camera.lookAt(0,0,0);

        const geometry = new THREE.BoxGeometry(1,1,1);
        const material = new THREE.MeshBasicMaterial({color: 0x00ffaa, wireframe: true});
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);

        const light = new THREE.DirectionalLight(0xffffff,1);
        light.position.set(2,5,3);
        this.scene.add(light, new THREE.AmbientLight(0x404040));
    }

    public update(inputHandler: InputHandler)
    {
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.02;
    }

    public destroy() {
        this.scene.clear();
    }

}