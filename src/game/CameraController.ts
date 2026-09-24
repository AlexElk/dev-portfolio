import * as THREE from "three";

export class CameraController{
    public camera: THREE.PerspectiveCamera;
    public domElement: HTMLElement;
    public yaw = 0; //Horizontal Angle
    public pitch = 0.3 //Vertical Angle

    private distance = 7;
    private heightOffset = 1.2;

    private isDragging = false;
    private previousMouse = {x: 0, y: 0}
    private previousTouch = {x: 0, y: 0}
    private touchId: number | null = null;

    constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement)
    {
        this.camera = camera;
        this.domElement = domElement;
        this.setupEvents(domElement);
    }

    private setupEvents(element: HTMLElement ){
    //compu
    element.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.previousMouse = {x: e.clientX, y: e.clientY};
    });

    window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.previousMouse.x;
        const deltaY = e.clientY - this.previousMouse.y;

        this.rotate(deltaX * 0.005, deltaY * 0.003);
        this.previousMouse = {x: e.clientX, y: e.clientY};
    });

    window.addEventListener('mouseup', () => {
        this.isDragging = false;
    });
    //touch

    element.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;

        const touch = e.touches[0];
        this.touchId = touch.identifier;
        this.previousTouch = {x: touch.clientX, y: touch.clientY};
    }, {passive: true});

    element.addEventListener('touchmove', (e) => {
        if (this.touchId === null) return;

        const touch = Array.from(e.touches).find(({identifier}) => identifier === this.touchId);
        if (!touch) return;

        const deltaX = touch.clientX - this.previousTouch.x;
        const deltaY = touch.clientY - this.previousTouch.y;

        this.rotate(deltaX * 0.005, deltaY * 0.003);
        this.previousTouch = {x: touch.clientX, y: touch.clientY};
    }, {passive: true});

    const stopTouchDrag = (e: TouchEvent) => {
        if (this.touchId === null) return;

        const touchEnded = Array.from(e.changedTouches)
            .some(({identifier}) => identifier === this.touchId);

        if (touchEnded) this.touchId = null;
    };

    element.addEventListener('touchend', stopTouchDrag, {passive: true});
    element.addEventListener('touchcancel', stopTouchDrag, {passive: true});
    }

    private rotate(deltaYaw: number, deltaPitch: number){
        this.yaw -= deltaYaw;
        this.pitch += deltaPitch;

        const maxPitch = Math.PI / 2 -0.1;
        const minPitch = -0.1;
        this.pitch = Math.max(minPitch, Math.min(maxPitch, this.pitch));
    }

    public update(targetPosition: THREE.Vector3)
    {
        //where the camera looks
        const target = targetPosition.clone().add(new THREE.Vector3(0, this.heightOffset , 0));

        //Spheric coordinates to position the camera around the player
        const offSetX = this.distance * Math.sin(this.yaw) * Math.cos(this.pitch);
        const offSetY = this.distance * Math.sin(this.pitch);
        const offSetZ = this.distance * Math.cos(this.yaw) * Math.cos(this.pitch);

        this.camera.position.set(
            target.x + offSetX,
            target.y + offSetY,
            target.z + offSetZ
        );

        this.camera.lookAt(target);
    }
}