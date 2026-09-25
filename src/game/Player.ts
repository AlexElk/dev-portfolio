import * as THREE from "three";
import { InputHandler } from "./InputHandler";

export class Player{
    public mesh: THREE.Mesh;
    public planetRadius = 10; //* Maybe get it from the origin
    private speed = 0.12;

    constructor(){
        const geometry = new THREE.BoxGeometry(0.8, 1, 0.8);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ee77});

        const faceGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
        const faceMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
        
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.set(0, 0.2, -0.5);

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.add(face);

        const initialNormal = new THREE.Vector3(0,1,0); //North pole
        this.mesh.position.copy(initialNormal.multiplyScalar(this.planetRadius + 0.5));
    }

    public update(input: InputHandler | null, cameraYaw: number, camera?: THREE.Camera){
        // const moveVector = new THREE.Vector3(0,0,0);

        const normal = this.mesh.position.clone().normalize();

        if(input){
            const inputVec = new THREE.Vector3();
            if (input.keys.w) inputVec.z -= 1;
            if (input.keys.s) inputVec.z += 1;
            if (input.keys.d) inputVec.x += 1;
            if (input.keys.a) inputVec.x -= 1;

            if (inputVec.lengthSq() > 0 && camera){
                inputVec.normalize();

                //Get the camera direction according to the surface
                const camDir = new THREE.Vector3();
                camera.getWorldDirection(camDir);

                const forward = camDir.clone().sub(normal.clone().multiplyScalar(camDir.dot(normal)));
                if (forward.lengthSq() < 1e-6) {
                    return;
                }
                forward.normalize();
                const right = new THREE.Vector3().crossVectors(forward, normal).normalize();

                const moveDir = new THREE.Vector3()
                    .addScaledVector(forward, -inputVec.z)
                    .addScaledVector(right, inputVec.x)
                    .normalize();

                this.mesh.position.addScaledVector(moveDir, this.speed); // Sphere's tangent

                //Keep the player in the surface
                const newNormal = this.mesh.position.clone().normalize();
                this.mesh.position.copy(newNormal.clone().multiplyScalar(this.planetRadius + 0.5));

                //Orientation
                const moveRight = new THREE.Vector3()
                    .crossVectors(moveDir, newNormal)
                    .normalize();
                const targetMatrix = new THREE.Matrix4().makeBasis(
                    moveRight,
                    newNormal,
                    moveDir.clone().negate()
                );
                const lookQuat = new THREE.Quaternion().setFromRotationMatrix(targetMatrix);
                this.mesh.quaternion.slerp(lookQuat, 0.3);
                return;
                // moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);

                // this.mesh.position.addScaledVector(moveVector, this.speed);

                // const angle = Math.atan2(moveVector.x, moveVector.z);
                // this.mesh.rotation.y = angle;
            }
        }

        // Keep the current heading while adapting it to the new surface normal.
        const currentForward = new THREE.Vector3(0, 0, -1)
            .applyQuaternion(this.mesh.quaternion);
        const tangentForward = currentForward
            .sub(normal.clone().multiplyScalar(currentForward.dot(normal)));

        if (tangentForward.lengthSq() > 1e-6) {
            tangentForward.normalize();
            const tangentRight = new THREE.Vector3()
                .crossVectors(tangentForward, normal)
                .normalize();
            const targetMatrix = new THREE.Matrix4().makeBasis(
                tangentRight,
                normal,
                tangentForward.clone().negate()
            );
            const targetQ = new THREE.Quaternion().setFromRotationMatrix(targetMatrix);
            this.mesh.quaternion.slerp(targetQ, 0.2);
        }
    }
}