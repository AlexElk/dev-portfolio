import * as THREE from 'three';

export interface HouseTrigger {
  position: THREE.Vector3;
  promptPosition: THREE.Vector3;
  type: 'ENTER' | 'EXIT';
}

export interface NPCData {
    position: THREE.Vector3;
    name: string;
    lines: string[];
}

export function alignToSphere(
  object: THREE.Object3D,
  dir: THREE.Vector3,
  radius: number = 10,
  offsetHeight: number = 0
){
  const normal = dir.clone().normalize();
  object.position.copy(normal.clone().multiplyScalar(radius + offsetHeight));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
  object.quaternion.copy(q);
}

export function setupOverworldScene(scene: THREE.Scene) {

  const PLANET_RADIUS = 10;
  scene.background = new THREE.Color(0x020208);

  //Stern
  const starsGeo = new THREE.BufferGeometry();
  const count = 1200;
  const position = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++){
    position[i] = (Math.random() - 0.5) * 250;
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(position, 3));
  const starsMat = new THREE.PointsMaterial({color: 0xffffff, size: 0.8});
  scene.add(new THREE.Points(starsGeo, starsMat));

  //Kugel
  const planetGeo = new THREE.SphereGeometry(PLANET_RADIUS, 64, 64);
  const planetMat = new THREE.MeshBasicMaterial({color: 0x228b22, wireframe: false, reflectivity: 0.2}) //Roughness here?
  const planet = new THREE.Mesh(planetGeo, planetMat);
  scene.add(planet);
  
  const houseDirections = [
    new THREE.Vector3(-0.5, 0.8, -0.3),
    new THREE.Vector3(0.6, 0.7, 0.4),
    new THREE.Vector3(-0.5, 0.8, 0.3)
  ]

  const triggers: HouseTrigger[] = [];

  houseDirections.forEach((dir) => {
    const house = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 2.5, 2.5),
      new THREE.MeshStandardMaterial({color: 0xaa4444})
    );
    alignToSphere(house, dir, PLANET_RADIUS, 1.25);
    scene.add(house);

    const normal = dir.clone().normalize();
    const triggerPos = normal.clone().multiplyScalar(PLANET_RADIUS + 0.5);
    const promptPos = normal.clone().multiplyScalar(PLANET_RADIUS + 3.2);

    triggers.push({
      position: triggerPos,
      promptPosition: promptPos,
      type: 'ENTER'
    });
  });

  // housePositions.forEach((pos) => {
  //   // Estructura de la Casa 
  //   const houseGeo = new THREE.BoxGeometry(3, 3, 3);
  //   const houseMat = new THREE.MeshStandardMaterial({ color: 0xaa4444 });
  //   const house = new THREE.Mesh(houseGeo, houseMat);
  //   house.position.set(pos.x, 1.5, pos.z);
  //   scene.add(house);

  //   // Doa
  //   const doorGeo = new THREE.BoxGeometry(0.8, 1.6, 0.1);
  //   const doorMat = new THREE.MeshStandardMaterial({ color: 0x442211 });
  //   const door = new THREE.Mesh(doorGeo, doorMat);
  //   door.position.set(pos.x, 0.8, pos.z + 1.5);
  //   scene.add(door);

  //   // Activation Point
  //   triggers.push({
  //     position: new THREE.Vector3(pos.x, 0.5, pos.z + 2.2),
  //     promptPosition: new THREE.Vector3(pos.x, 2.5, pos.z + 1.5),
  //     type: 'ENTER',
  //   });
  // });

  //NPC
  const npcDir = new THREE.Vector3(0.2, 0.9, -0.4);
  const npcMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 0x0088ff}));
  alignToSphere(npcMesh, npcDir, PLANET_RADIUS, 0.5);
  scene.add(npcMesh);

  const npcData: NPCData = {
    position: npcMesh.position.clone(),
    name: 'Old guy',
    lines: [
        'Hello! I make games using a toaster',
        'You can see around what I had made',
        'Interact using E'
    ],
  };

  return {triggers, npcData};
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