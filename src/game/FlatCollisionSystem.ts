import * as THREE from 'three';

export interface FlatBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export class FlatCollisionSystem {
  public readonly bounds: FlatBounds;

  constructor(bounds: FlatBounds) {
    this.bounds = bounds;
  }

  public resolvePosition(position: THREE.Vector3, radius: number): THREE.Vector3 {
    return new THREE.Vector3(
      THREE.MathUtils.clamp(position.x, this.bounds.minX + radius, this.bounds.maxX - radius),
      position.y,
      THREE.MathUtils.clamp(position.z, this.bounds.minZ + radius, this.bounds.maxZ - radius)
    );
  }
}
