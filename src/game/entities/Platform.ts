import * as THREE from 'three';
import { CollisionSystem, PlatformBody } from '../CollisionSystem';

export interface PlatformConfig {
  id: string;
  direction: THREE.Vector3;
  planetRadius?: number;
  width?: number;
  depth?: number;
  height?: number;
  thickness?: number;
  color?: number;
}

export class Platform {
  public readonly mesh: THREE.Mesh;
  public readonly collider: PlatformBody;

  constructor(config: PlatformConfig, collisionSystem: CollisionSystem) {
    const planetRadius = config.planetRadius ?? 10;
    const width = config.width ?? 3;
    const depth = config.depth ?? 3;
    const height = config.height ?? 1;
    const thickness = config.thickness ?? 0.35;
    const color = config.color ?? 0x886644;
    const normal = config.direction.clone().normalize();
    const reference = Math.abs(normal.y) > 0.95
      ? new THREE.Vector3(1, 0, 0)
      : new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(reference, normal).normalize();
    const forward = new THREE.Vector3().crossVectors(right, normal).normalize();

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, thickness, depth),
      new THREE.MeshStandardMaterial({ color })
    );
    this.mesh.position.copy(normal)
      .multiplyScalar(planetRadius + height - thickness / 2);
    this.mesh.quaternion.setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(right, normal, forward)
    );

    this.collider = collisionSystem.addPlatform({
      id: config.id,
      normal,
      right,
      forward,
      width,
      depth,
      height,
      planetRadius,
    });
  }
}
