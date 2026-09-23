import * as THREE from "three";
import { InputHandler } from "./InputHandler";

export class Player{
    public mesh: THREE.Mesh;
    private speed = 0.12;

    constructor(){
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ee77});

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.y = 0.5;
    }

    public update(input: InputHandler){
        if (input.keys.w) this.mesh.position.z -= this.speed;
        if (input.keys.s) this.mesh.position.z += this.speed;
        if (input.keys.d) this.mesh.position.x += this.speed;
        if (input.keys.a) this.mesh.position.x -= this.speed;
    }
}