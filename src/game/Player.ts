import * as THREE from "three";
import { InputHandler } from "./InputHandler";
import { CollisionBody, CollisionSystem } from "./CollisionSystem";
import { FlatCollisionSystem } from "./FlatCollisionSystem";

export type PlayerMovementMode = 'SPHERICAL' | 'FLAT';

export class Player{
    public mesh: THREE.Mesh;
    public planetRadius = 10; //* Maybe get it from the origin
    public collisionRadius = 0.45;
    private speed = 0.12;
    private movementMode: PlayerMovementMode = 'SPHERICAL';
    private collisionSystem?: CollisionSystem;
    private collisionBody?: CollisionBody;
    private flatCollisionSystem?: FlatCollisionSystem;

    constructor(collisionSystem?: CollisionSystem){
        this.collisionSystem = collisionSystem;
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

        if (collisionSystem) {
            this.collisionBody = collisionSystem.addSphere(
                'player',
                'PLAYER',
                this.mesh.position,
                this.collisionRadius,
                this.planetRadius + 0.5
            );
        }
    }

    public setFlatMovement(collisionSystem: FlatCollisionSystem): void {
        this.movementMode = 'FLAT';
        this.flatCollisionSystem = collisionSystem;
    }

    public update(input: InputHandler | null, cameraYaw: number, camera?: THREE.Camera){
        if (this.movementMode === 'FLAT') {
            this.updateFlat(input, cameraYaw);
            return;
        }

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
                    // Looking straight down removes the camera direction's
                    // tangent component. Use the camera's local right axis
                    // to keep a stable movement basis in that case.
                    const cameraRight = new THREE.Vector3(1, 0, 0)
                        .applyQuaternion(camera.quaternion);
                    forward.crossVectors(normal, cameraRight);
                }

                if (forward.lengthSq() < 1e-6) {
                    return;
                }
                forward.normalize();
                const right = new THREE.Vector3().crossVectors(forward, normal).normalize();

                const moveDir = new THREE.Vector3()
                    .addScaledVector(forward, -inputVec.z)
                    .addScaledVector(right, inputVec.x)
                    .normalize();

                const desiredPosition = this.mesh.position.clone()
                    .addScaledVector(moveDir, this.speed);
                const resolvedPosition = this.collisionSystem && this.collisionBody
                    ? this.collisionSystem.resolvePosition(this.collisionBody, desiredPosition)
                    : desiredPosition;
                this.mesh.position.copy(resolvedPosition); // Sphere's tangent

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

    private updateFlat(input: InputHandler | null, cameraYaw: number): void {
        if (!input || !this.flatCollisionSystem) return;

        const inputVector = new THREE.Vector2(
            Number(input.keys.d) - Number(input.keys.a),
            Number(input.keys.s) - Number(input.keys.w)
        );
        if (inputVector.lengthSq() === 0) return;

        inputVector.normalize();
        const forward = new THREE.Vector3(
            Math.sin(cameraYaw),
            0,
            -Math.cos(cameraYaw)
        );
        const right = new THREE.Vector3(
            Math.cos(cameraYaw),
            0,
            Math.sin(cameraYaw)
        );
        const moveDirection = forward.multiplyScalar(-inputVector.y)
            .addScaledVector(right, inputVector.x)
            .normalize();
        const desiredPosition = this.mesh.position.clone()
            .addScaledVector(moveDirection, this.speed);
        const resolvedPosition = this.flatCollisionSystem.resolvePosition(
            desiredPosition,
            this.collisionRadius
        );

        this.mesh.position.copy(resolvedPosition);
        const targetMatrix = new THREE.Matrix4().makeBasis(
            right,
            new THREE.Vector3(0, 1, 0),
            moveDirection.clone().negate()
        );
        const targetQuaternion = new THREE.Quaternion()
            .setFromRotationMatrix(targetMatrix);
        this.mesh.quaternion.slerp(targetQuaternion, 0.3);
    }
}