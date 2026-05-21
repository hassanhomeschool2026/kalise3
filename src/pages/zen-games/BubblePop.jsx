import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function BubblePop() {
  const mountRef = useRef(null);
  const sceneRef = useRef({});
  const [score, setScore] = useState(0);

  useEffect(() => {
    let cleanup;
    const timer = setTimeout(() => {
      cleanup = init();
    }, 50);
    return () => { clearTimeout(timer); cleanup && cleanup(); };
  }, []);

  function init() {
    const mount = mountRef.current;
    if (!mount) return;
    const w = mount.offsetWidth || 400;
    const h = mount.offsetHeight || 500;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x0a0015, 1);
    mount.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 0, 12);

    // Fog
    scene.fog = new THREE.FogExp2(0x0a0015, 0.04);

    // Ambient + point lights
    scene.add(new THREE.AmbientLight(0x9966ff, 0.6));
    const pointLight = new THREE.PointLight(0xcc88ff, 2, 30);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    // Background particles
    const bgGeo = new THREE.BufferGeometry();
    const bgCount = 300;
    const bgPos = new Float32Array(bgCount * 3);
    for (let i = 0; i < bgCount * 3; i++) bgPos[i] = (Math.random() - 0.5) * 40;
    bgGeo.setAttribute("position", new THREE.BufferAttribute(bgPos, 3));
    const bgMat = new THREE.PointsMaterial({ color: 0xaa88ff, size: 0.06, transparent: true, opacity: 0.5 });
    scene.add(new THREE.Points(bgGeo, bgMat));

    // Bubbles
    const bubbles = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function spawnBubble() {
      const radius = 0.3 + Math.random() * 0.55;
      const geo = new THREE.SphereGeometry(radius, 32, 32);
      const hue = 0.65 + Math.random() * 0.2;
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color().setHSL(hue, 0.8, 0.65),
        transparent: true,
        opacity: 0.35,
        roughness: 0,
        metalness: 0.1,
        transmission: 0.85,
        thickness: 0.5,
        envMapIntensity: 1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - 0.5) * 10, -7, (Math.random() - 0.5) * 3);
      mesh.userData = { vy: 0.018 + Math.random() * 0.025, vx: (Math.random() - 0.5) * 0.008, alive: true, radius };
      scene.add(mesh);
      bubbles.push(mesh);
    }

    const spawnInterval = setInterval(spawnBubble, 900);

    // Pop effect particles
    function popBurst(position, color) {
      for (let i = 0; i < 12; i++) {
        const geo = new THREE.SphereGeometry(0.06, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
        const p = new THREE.Mesh(geo, mat);
        p.position.copy(position);
        const angle = (i / 12) * Math.PI * 2;
        p.userData = { vx: Math.cos(angle) * 0.08, vy: Math.sin(angle) * 0.08 + 0.05, life: 1 };
        scene.add(p);
        setTimeout(() => scene.remove(p), 600);
      }
    }

    // Click handler
    function onClick(e) {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / w) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / h) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(bubbles.filter(b => b.userData.alive));
      if (hits.length > 0) {
        const hit = hits[0].object;
        hit.userData.alive = false;
        popBurst(hit.position.clone(), hit.material.color);
        scene.remove(hit);
        bubbles.splice(bubbles.indexOf(hit), 1);
        setScore(s => s + 1);
      }
    }
    mount.addEventListener("click", onClick);

    // Animation
    let animId;
    const clock = new THREE.Clock();
    function animate() {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Float bubbles
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.position.y += b.userData.vy;
        b.position.x += b.userData.vx + Math.sin(t + i) * 0.003;
        b.rotation.y += 0.005;
        // Shimmer
        b.material.opacity = 0.25 + Math.sin(t * 2 + i) * 0.1;
        if (b.position.y > 9) {
          scene.remove(b);
          bubbles.splice(i, 1);
        }
      }

      pointLight.position.x = Math.sin(t * 0.5) * 6;
      pointLight.position.y = Math.cos(t * 0.3) * 4 + 3;

      renderer.render(scene, camera);
    }
    animate();

    sceneRef.current = { renderer, animId, spawnInterval };

    const handleResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(spawnInterval);
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      mount.removeEventListener("click", onClick);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <div ref={mountRef} className="w-full h-full" style={{ minHeight: "100%" }} />
      <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-white/80">
        {score} popped
      </div>
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/40">Tap the bubbles</p>
    </div>
  );
}