import * as THREE from "three";
import { InputHandler } from "./InputHandler";
import { ThreeMFLoader } from "three/examples/jsm/Addons.js";

export class Player{
    public mesh: THREE.Mesh;
    private speed = 0.12;

    constructor(){
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ee77});

        const faceGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
        const faceMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
        
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.set(0, 0.2, -0.5);

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.add(face);
        this.mesh.position.y = 0.5;
    }

    public update(input: InputHandler, cameraYaw: number){
        const moveVector = new THREE.Vector3(0,0,0);

        if (input.keys.w) moveVector.z -= 1;
        if (input.keys.s) moveVector.z += 1;
        if (input.keys.d) moveVector.x += 1;
        if (input.keys.a) moveVector.x -= 1;

        if (moveVector.lengthSq() > 0){
            moveVector.normalize();

            moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);

            this.mesh.position.addScaledVector(moveVector, this.speed);

            const angle = Math.atan2(moveVector.x, moveVector.z);
            this.mesh.rotation.y = angle;
        }
    }
}