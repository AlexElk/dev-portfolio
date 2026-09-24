import * as THREE from 'three';

export interface HouseTrigger {
  position: THREE.Vector3;
  promptPosition: THREE.Vector3;
  type: 'ENTER' | 'EXIT';
}

export function setupOverworldScene(scene: THREE.Scene): HouseTrigger[] {
  // Suelo
  const grid = new THREE.GridHelper(30, 30, 0x00ff88, 0x444444);
  scene.add(grid);

  const housePositions = [
    new THREE.Vector3(-6, 0, -5),
    new THREE.Vector3(6, 0, -5),
    new THREE.Vector3(0, 0, -12),
  ];

  const triggers: HouseTrigger[] = [];

  housePositions.forEach((pos) => {
    // Estructura de la Casa 
    const houseGeo = new THREE.BoxGeometry(3, 3, 3);
    const houseMat = new THREE.MeshStandardMaterial({ color: 0xaa4444 });
    const house = new THREE.Mesh(houseGeo, houseMat);
    house.position.set(pos.x, 1.5, pos.z);
    scene.add(house);

    // Doa
    const doorGeo = new THREE.BoxGeometry(0.8, 1.6, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x442211 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(pos.x, 0.8, pos.z + 1.5);
    scene.add(door);

    // Activation Point
    triggers.push({
      position: new THREE.Vector3(pos.x, 0.5, pos.z + 2.2),
      promptPosition: new THREE.Vector3(pos.x, 2.5, pos.z + 1.5),
      type: 'ENTER',
    });
  });

  return triggers;
}

// Inside
export function setupInteriorScene(scene: THREE.Scene): HouseTrigger[] {
  // Suelo de madera
  const floorGeo = new THREE.PlaneGeometry(8, 8);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x553311, side: THREE.DoubleSide });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = Math.PI / 2;
  scene.add(floor);

  // Paredes de cajas
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x888899 });

  const createWall = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    wall.position.set(x, y, z);
    scene.add(wall);
  };

  createWall(8, 3, 0.2, 0, 1.5, -4); // Pared Trasera
  createWall(0.2, 3, 8, -4, 1.5, 0); // Pared Izquierda
  createWall(0.2, 3, 8, 4, 1.5, 0);  // Pared Derecha

  // Salida
  return [
    {
      position: new THREE.Vector3(0, 0.5, 3),
      promptPosition: new THREE.Vector3(0, 2, 3.5),
      type: 'EXIT',
    },
  ];
}

export function setupMenuScene(scene: THREE.Scene) {
  // Floor
  const grid = new THREE.GridHelper(20, 20, 0x00ff88, 0x444444);
  scene.add(grid);

  // Cubo
  const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff88 });
  const menuCube = new THREE.Mesh(geometry, material);
  menuCube.position.set(0, 1.2, 0);
  scene.add(menuCube);

  return menuCube;
}