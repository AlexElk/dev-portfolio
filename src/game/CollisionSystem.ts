import * as THREE from 'three';

export type ColliderType = 'PLAYER' | 'NPC' | 'HOUSE';

export interface CollisionBody {
  id: string;
  type: ColliderType;
  position: THREE.Vector3;
  radius: number;
  surfaceRadius?: number;
}

export class CollisionSystem {
  private bodies = new Map<string, CollisionBody>();

  public addSphere(
    id: string,
    type: ColliderType,
    position: THREE.Vector3,
    radius: number,
    surfaceRadius?: number
  ): CollisionBody {
    const body: CollisionBody = { id, type, position, radius, surfaceRadius };
    this.bodies.set(id, body);
    return body;
  }

  public remove(id: string): void {
    this.bodies.delete(id);
  }

  public resolvePosition(body: CollisionBody, desiredPosition: THREE.Vector3): THREE.Vector3 {
    const resolvedPosition = desiredPosition.clone();
    this.constrainToSurface(resolvedPosition, body.surfaceRadius);

    for (let pass = 0; pass < 3; pass++) {
      for (const other of this.bodies.values()) {
        if (other.id === body.id) continue;

        const offset = resolvedPosition.clone().sub(other.position);
        const distance = offset.length();
        const minimumDistance = body.radius + other.radius;

        if (distance >= minimumDistance) continue;

        if (distance > 1e-6) {
          offset.multiplyScalar(1 / distance);
        } else {
          offset.copy(body.position).sub(other.position).normalize();
          if (offset.lengthSq() < 1e-6) offset.set(1, 0, 0);
        }

        resolvedPosition.copy(other.position)
          .addScaledVector(offset, minimumDistance);
        this.constrainToSurface(resolvedPosition, body.surfaceRadius);
      }
    }

    return resolvedPosition;
  }

  private constrainToSurface(position: THREE.Vector3, surfaceRadius?: number): void {
    if (surfaceRadius === undefined || position.lengthSq() < 1e-6) return;

    position.normalize().multiplyScalar(surfaceRadius);
  }
}
