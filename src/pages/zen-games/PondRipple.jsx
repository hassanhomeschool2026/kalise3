import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function PondRipple() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    camera.position.set(0, 8, 6);
    camera.lookAt(0, 0, 0);

    // Sky gradient background
    const bgGeo = new THREE.PlaneGeometry(40, 40);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x040d1a });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    bg.rotation.x = -Math.PI / 2;
    bg.position.y = -0.05;
    scene.add(bg);

    // Subtle ambient + moonlight
    scene.add(new THREE.AmbientLight(0x112244, 1.2));
    const moonLight = new THREE.DirectionalLight(0x6688bb, 0.8);
    moonLight.position.set(5, 10, 5);
    scene.add(moonLight);

    // Pond water plane (subdivided for ripples)
    const pondGeo = new THREE.PlaneGeometry(12, 12, 120, 120);
    const pondMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a2a4a,
      roughness: 0.05,
      metalness: 0.4,
      transparent: true,
      opacity: 0.92,
    });
    const pond = new THREE.Mesh(pondGeo, pondMat);
    pond.rotation.x = -Math.PI / 2;
    scene.add(pond);

    // Reflection shimmer dots (lily pads / stars on water)
    const shimGeo = new THREE.BufferGeometry();
    const shimCount = 60;
    const shimPos = new Float32Array(shimCount * 3);
    for (let i = 0; i < shimCount; i++) {
      shimPos[i * 3] = (Math.random() - 0.5) * 11;
      shimPos[i * 3 + 1] = 0.02;
      shimPos[i * 3 + 2] = (Math.random() - 0.5) * 11;
    }
    shimGeo.setAttribute("position", new THREE.BufferAttribute(shimPos, 3));
    scene.add(new THREE.Points(shimGeo, new THREE.PointsMaterial({ color: 0xaaccff, size: 0.06, transparent: true, opacity: 0.5 })));

    // Ripple rings
    const ripples = [];

    function addRipple(x, z) {
      for (let ring = 0; ring < 4; ring++) {
        const geo = new THREE.RingGeometry(0.01, 0.08, 64);
        const mat = new THREE.MeshBasicMaterial({
          color: 0x88ccff,
          transparent: true,
          opacity: 0.7 - ring * 0.12,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, 0.02, z);
        mesh.userData = { speed: 0.06 + ring * 0.025, delay: ring * 8, age: -ring * 8 };
        scene.add(mesh);
        ripples.push(mesh);
      }
    }

    function onClick(e) {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / w) * 2 - 1;
      const ny = -((e.clientY - rect.top) / h) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      const hits = raycaster.intersectObject(pond);
      if (hits.length > 0) {
        const { x, z } = hits[0].point;
        addRipple(x, z);
      }
    }
    mount.addEventListener("click", onClick);

    // Ripple vertex animation on pond geometry
    const positions = pondGeo.attributes.position;
    const waves = [];

    function addWave(x, z) {
      waves.push({ x, z, age: 0 });
    }
    mount.addEventListener("click", (e) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / w) * 2 - 1;
      const ny = -((e.clientY - rect.top) / h) * 2 + 1;
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2(nx, ny), camera);
      const hits = ray.intersectObject(pond);
      if (hits.length > 0) addWave(hits[0].point.x, hits[0].point.z);
    });

    let animId;
    const clock = new THREE.Clock();
    function animate() {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Gentle idle water sway
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        let y = Math.sin(x * 0.5 + t * 0.4) * 0.03 + Math.cos(z * 0.4 + t * 0.3) * 0.02;

        // Ripple waves from clicks
        waves.forEach((wave) => {
          const dist = Math.sqrt((x - wave.x) ** 2 + (z - wave.z) ** 2);
          const waveFront = wave.age * 0.04;
          const diff = dist - waveFront;
          if (Math.abs(diff) < 0.5) {
            const decay = Math.max(0, 1 - wave.age * 0.012);
            y += Math.sin(diff * 12) * 0.12 * decay;
          }
        });
        positions.setY(i, y);
      }
      positions.needsUpdate = true;
      pondGeo.computeVertexNormals();

      // Update ripple rings
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.userData.age++;
        if (r.userData.age < 0) continue;
        const scale = 1 + r.userData.age * r.userData.speed;
        r.scale.set(scale, scale, scale);
        r.material.opacity = Math.max(0, 0.65 - r.userData.age * 0.015);
        if (r.material.opacity <= 0) { scene.remove(r); ripples.splice(i, 1); }
      }

      // Age waves
      waves.forEach((w) => w.age++);
      for (let i = waves.length - 1; i >= 0; i--) {
        if (waves[i].age > 80) waves.splice(i, 1);
      }

      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener("click", onClick);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <div ref={mountRef} className="w-full h-full cursor-pointer" />
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/40">Tap the water to create ripples</p>
    </div>
  );
}