import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

export class SceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  
  private earth!: THREE.Mesh;
  private clouds!: THREE.Mesh;
  private flightPaths: THREE.Group;
  
  constructor(containerId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
    
    // Setup Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020205);
    
    // Setup Camera
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 5, 20); // Cinematic starting position
    
    // Setup Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);
    
    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 30;
    this.controls.enablePan = false;
    
    this.flightPaths = new THREE.Group();
    this.scene.add(this.flightPaths);
    
    this.createEarth();
    this.createLighting();
    this.createStars();
    
    // Handle resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Handle clicks
    window.addEventListener('click', this.onMouseClick.bind(this));
    
    // Animation Loop
    this.tick();
  }
  
  private createEarth() {
    // Earth Geometry
    const geometry = new THREE.SphereGeometry(5, 128, 128);
    
    // Load realistic textures (using reliable public URLs)
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
    const bumpMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
    const waterMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-water.png');
    
    // Realistic Material
    const material = new THREE.MeshStandardMaterial({
      map: earthMap,
      bumpMap: bumpMap,
      bumpScale: 0.05,
      roughnessMap: waterMap,
      roughness: 0.6,
      metalness: 0.1
    });
    
    this.earth = new THREE.Mesh(geometry, material);
    this.scene.add(this.earth);
    
    // Realistic Atmosphere Glow
    const atmosphereGeo = new THREE.SphereGeometry(5.15, 64, 64);
    const atmosphereMat = new THREE.MeshStandardMaterial({
      color: 0x4aa6ff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      roughness: 1
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    this.scene.add(atmosphere);
    
    // Realistic Clouds layer
    const cloudMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-water.png'); // Placeholder for clouds to add texture variation
    const cloudGeo = new THREE.SphereGeometry(5.03, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      roughness: 1,
      blending: THREE.AdditiveBlending
    });
    this.clouds = new THREE.Mesh(cloudGeo, cloudMat);
    this.scene.add(this.clouds);
  }
  
  private createLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 2);
    sunLight.position.set(10, 5, 10);
    this.scene.add(sunLight);
    
    // Subtle purple backfill
    const backLight = new THREE.DirectionalLight(0x8A2BE2, 1.5);
    backLight.position.set(-10, -5, -10);
    this.scene.add(backLight);
  }
  
  private createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const count = 2000;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);
  }
  
  // Convert Lat/Lon to Vector3
  private getCoordinatesFromLatLng(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    
    return new THREE.Vector3(x, y, z);
  }
  
  public animateRoute(startLat: number, startLng: number, endLat: number, endLng: number) {
    const start = this.getCoordinatesFromLatLng(startLat, startLng, 5);
    const end = this.getCoordinatesFromLatLng(endLat, endLng, 5);
    
    // Calculate distance for curve height
    const distance = start.distanceTo(end);
    const midPoint = start.clone().lerp(end, 0.5);
    midPoint.normalize().multiplyScalar(5 + distance * 0.3); // Arc height
    
    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
    const points = curve.getPoints(50);
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0,
      linewidth: 2
    });
    
    const line = new THREE.Line(geometry, material);
    this.flightPaths.add(line);
    
    // Create vehicle
    const vehicleGeo = new THREE.ConeGeometry(0.1, 0.3, 8);
    vehicleGeo.rotateX(Math.PI / 2);
    const vehicleMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const vehicle = new THREE.Mesh(vehicleGeo, vehicleMat);
    this.flightPaths.add(vehicle);

    // Draw animation
    const proxy = { progress: 0 };
    gsap.to(proxy, {
      progress: 1,
      duration: 2.5,
      ease: "power2.inOut",
      onUpdate: () => {
        material.opacity = proxy.progress;
        
        const pt = curve.getPoint(proxy.progress);
        vehicle.position.copy(pt);
        
        if (proxy.progress < 0.99) {
          const nextPt = curve.getPoint(proxy.progress + 0.01);
          vehicle.lookAt(nextPt);
        }
      }
    });
    
    // Animate Camera to Route
    gsap.to(this.camera.position, {
      x: midPoint.x * 1.5,
      y: midPoint.y * 1.5,
      z: midPoint.z * 1.5,
      duration: 2.5,
      ease: "power3.inOut",
      onUpdate: () => {
        this.camera.lookAt(midPoint.clone().normalize().multiplyScalar(5));
      }
    });
  }
  
  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  // Interactive Raycasting properties
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  
  private onMouseClick(event: MouseEvent) {
    // Don't interact if clicking on UI panels
    if ((event.target as HTMLElement).tagName !== 'CANVAS') return;
    
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Intersect with earth only
    if (this.earth) {
      const intersects = this.raycaster.intersectObject(this.earth);
      if (intersects.length > 0) {
        this.addPinAt(intersects[0].point);
      }
    }
  }
  
  private addPinAt(position: THREE.Vector3) {
    // Core glowing pin
    const geo = new THREE.SphereGeometry(0.04, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0x92FE9D });
    const pin = new THREE.Mesh(geo, mat);
    pin.position.copy(position);
    this.scene.add(pin);
    
    // Outer ring pulse
    const ringGeo = new THREE.RingGeometry(0.06, 0.08, 32);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0x00C9FF, 
      side: THREE.DoubleSide, 
      transparent: true,
      opacity: 0.8
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(position);
    ring.lookAt(new THREE.Vector3(0, 0, 0)); // Face center of earth
    this.scene.add(ring);
    
    // Animations
    pin.scale.set(0, 0, 0);
    gsap.to(pin.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'back.out(1.5)' });
    
    gsap.to(ring.scale, { x: 3, y: 3, z: 3, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to(ringMat, { opacity: 0, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }

  private tick() {
    requestAnimationFrame(this.tick.bind(this));
    
    // Slowly rotate earth and clouds
    if (this.earth) this.earth.rotation.y += 0.0005;
    if (this.clouds) {
      this.clouds.rotation.y += 0.0007;
      this.clouds.rotation.z += 0.0001;
    }
    
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
