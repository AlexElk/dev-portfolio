import * as THREE from "three";
import { InputHandler } from "./InputHandler";
import { CollisionBody, CollisionSystem } from "./CollisionSystem";
import { FlatCollisionSystem } from "./FlatCollisionSystem";

export type PlayerMovementMode = 'SPHERICAL' | 'FLAT';

export class Player{
    public mesh: THREE.Group;
    public planetRadius = 10; //* Maybe get it from the origin
    public collisionRadius = 0.45;
    private speed = 0.12;
    private readonly groundHeight = 0.5;
    private readonly minimumJumpVelocity = 0.14;
    private readonly maximumJumpVelocity = 0.3;
    private readonly jumpCharge = 0.008;
    private readonly gravity = 0.012;
    private jumpHeight = 0;
    private verticalVelocity = 0;
    private isGrounded = true;
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

        const body = new THREE.Mesh(geometry, material);
        const visualRoot = new THREE.Group();
        visualRoot.add(body);
        this.mesh = new THREE.Group();
        body.add(face);

        const visualBounds = new THREE.Box3().setFromObject(visualRoot);
        const visualCenter = visualBounds.getCenter(new THREE.Vector3());
        visualRoot.position.sub(visualCenter);
        this.mesh.add(visualRoot);

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
        if (input?.consumeJumpPress() && this.isGrounded) {
            this.isGrounded = false;
            this.verticalVelocity = this.minimumJumpVelocity;
        }
        this.updateVerticalMotion(input?.jumpHeld ?? false);

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
                this.mesh.position.copy(newNormal.clone().multiplyScalar(this.planetRadius + this.groundHeight));
                this.updateSphericalSupport(newNormal);
                this.applySphericalHeight(newNormal);

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

        this.updateSphericalSupport(normal);
        this.applySphericalHeight(normal);

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
        if (!this.flatCollisionSystem) return;

        const inputVector = new THREE.Vector2(
            Number(input?.keys.d) - Number(input?.keys.a),
            Number(input?.keys.s) - Number(input?.keys.w)
        );
        if (inputVector.lengthSq() === 0) {
            this.mesh.position.y = this.groundHeight + this.jumpHeight;
            return;
        }

        inputVector.normalize();
        const forward = new THREE.Vector3(0, 0, -1)
            .applyQuaternion(this.mesh.quaternion);
        forward.y = 0;
        if (forward.lengthSq() < 1e-6) {
            forward.set(
                Math.sin(cameraYaw),
                0,
                -Math.cos(cameraYaw)
            );
        }
        forward.normalize();
        const right = new THREE.Vector3()
            .crossVectors(forward, new THREE.Vector3(0, 1, 0))
            .normalize();
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
        this.mesh.position.y = this.groundHeight + this.jumpHeight;
        const moveRight = new THREE.Vector3()
            .crossVectors(moveDirection, new THREE.Vector3(0, 1, 0))
            .normalize();
        const targetMatrix = new THREE.Matrix4().makeBasis(
            moveRight,
            new THREE.Vector3(0, 1, 0),
            moveDirection.clone().negate()
        );
        const targetQuaternion = new THREE.Quaternion()
            .setFromRotationMatrix(targetMatrix);
        this.mesh.quaternion.slerp(targetQuaternion, 0.1);
    }

    private updateVerticalMotion(jumpHeld: boolean): void {
        if (this.isGrounded) return;

        if (jumpHeld) {
            this.verticalVelocity = Math.min(
                this.maximumJumpVelocity,
                this.verticalVelocity + this.jumpCharge
            );
        }

        this.jumpHeight += this.verticalVelocity;
        this.verticalVelocity -= this.gravity;

        if (this.jumpHeight <= 0) {
            this.jumpHeight = 0;
            this.verticalVelocity = 0;
            this.isGrounded = true;
        }
    }

    private applySphericalHeight(normal: THREE.Vector3): void {
        this.mesh.position.copy(normal)
            .multiplyScalar(this.planetRadius + this.groundHeight + this.jumpHeight);
    }

    private updateSphericalSupport(normal: THREE.Vector3): void {
        const supportHeight = this.collisionSystem?.getPlatformSupportHeight(
            normal,
            this.planetRadius,
            this.collisionRadius
        ) ?? 0;

        if (this.isGrounded && this.jumpHeight > supportHeight + 0.01) {
            this.isGrounded = false;
            this.verticalVelocity = 0;
            return;
        }

        if (!this.isGrounded && this.verticalVelocity <= 0 && this.jumpHeight <= supportHeight + 0.02) {
            this.jumpHeight = supportHeight;
            this.verticalVelocity = 0;
            this.isGrounded = true;
        }
    }
}