import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function SandGarden() {
  const mountRef = useRef(null);
  const stateRef = useRef({});
  const [tool, setTool] = useState("rake"); // rake | stone

  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1008);
    scene.fog = new THREE.Fog(0x1a1008, 18, 30);

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 10, 8);
    camera.lookAt(0, 0, 0);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffe8c0, 0.7));
    const sun = new THREE.DirectionalLight(0xffd59a, 1.2);
    sun.position.set(6, 12, 6);
    sun.castShadow = true;
    scene.add(sun);

    // Sand ground — subdivided for displacement
    const sandGeo = new THREE.PlaneGeometry(14, 14, 140, 140);
    const sandMat = new THREE.MeshStandardMaterial({
      color: 0xd4a96a,
      roughness: 0.95,
      metalness: 0.0,
    });
    const sand = new THREE.Mesh(sandGeo, sandMat);
    sand.rotation.x = -Math.PI / 2;
    sand.receiveShadow = true;
    scene.add(sand);

    // Sand edge border
    const borderGeo = new THREE.BoxGeometry(15, 0.4, 0.3);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x8b6840, roughness: 0.8 });
    [[-7.15, 0, 0], [7.15, 0, 0]].forEach(([x, y, z]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 14.3), borderMat);
      b.position.set(x, 0.1, z); scene.add(b);
    });
    [[-7.15, 0, 0], [7.15, 0, 0]].forEach(([x, y, z]) => {
      const b = new THREE.Mesh(borderGeo, borderMat);
      b.position.set(0, 0.1, x); scene.add(b);
    });

    // Displacement map for rake grooves
    const grooveCanvas = document.createElement("canvas");
    grooveCanvas.width = 512; grooveCanvas.height = 512;
    const grooveCtx = grooveCanvas.getContext("2d");
    grooveCtx.fillStyle = "#808080"; // neutral displacement
    grooveCtx.fillRect(0, 0, 512, 512);
    const dispTexture = new THREE.CanvasTexture(grooveCanvas);
    sandMat.displacementMap = dispTexture;
    sandMat.displacementScale = 0.25;

    stateRef.current.grooveCtx = grooveCtx;
    stateRef.current.dispTexture = dispTexture;
    stateRef.current.grooveCanvas = grooveCanvas;

    // Stones
    const stones = [];
    function addStone(x, z) {
      const r = 0.25 + Math.random() * 0.3;
      const geo = new THREE.SphereGeometry(r, 16, 12);
      geo.scale(1, 0.65, 1);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0, 0, 0.3 + Math.random() * 0.25),
        roughness: 0.7,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, r * 0.4, z);
      mesh.castShadow = true;
      mesh.rotation.y = Math.random() * Math.PI;
      scene.add(mesh);
      stones.push(mesh);
    }
    // Initial stones
    [[2, 1.5], [-2.5, -1], [1.5, -2.5]].forEach(([x, z]) => addStone(x, z));

    stateRef.current.addStone = addStone;
    stateRef.current.tool = "rake";
    stateRef.current.sand = sand;

    // Pointer state
    let isDrawing = false;
    let lastWorld = null;

    const raycaster = new THREE.Raycaster();
    function getWorldPos(e) {
      const rect = mount.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const nx = ((clientX - rect.left) / w) * 2 - 1;
      const ny = -((clientY - rect.top) / h) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      const hits = raycaster.intersectObject(sand);
      return hits.length > 0 ? hits[0].point : null;
    }

    function drawGroove(from, to) {
      const gCtx = stateRef.current.grooveCtx;
      const toUV = (v) => ({
        u: ((v.x + 7) / 14) * 512,
        v: ((v.z + 7) / 14) * 512,
      });
      const a = toUV(from), b = toUV(to);
      // Main rake line (dark = depression)
      gCtx.strokeStyle = "rgba(40,40,40,0.55)";
      gCtx.lineWidth = 5;
      gCtx.lineCap = "round";
      gCtx.beginPath();
      gCtx.moveTo(a.u, a.v);
      gCtx.lineTo(b.u, b.v);
      gCtx.stroke();
      // Side tines
      for (let t = -2; t <= 2; t += 2) {
        const angle = Math.atan2(b.v - a.v, b.u - a.u) + Math.PI / 2;
        const dx = Math.cos(angle) * t * 4;
        const dy = Math.sin(angle) * t * 4;
        gCtx.strokeStyle = "rgba(50,50,50,0.3)";
        gCtx.lineWidth = 2;
        gCtx.beginPath();
        gCtx.moveTo(a.u + dx, a.v + dy);
        gCtx.lineTo(b.u + dx, b.v + dy);
        gCtx.stroke();
      }
      stateRef.current.dispTexture.needsUpdate = true;
    }

    function onDown(e) {
      e.preventDefault();
      isDrawing = true;
      const pos = getWorldPos(e);
      if (!pos) return;
      if (stateRef.current.tool === "stone") {
        stateRef.current.addStone(pos.x, pos.z);
      }
      lastWorld = pos;
    }
    function onMove(e) {
      e.preventDefault();
      if (!isDrawing || stateRef.current.tool !== "rake") return;
      const pos = getWorldPos(e);
      if (!pos || !lastWorld) return;
      drawGroove(lastWorld, pos);
      lastWorld = pos;
    }
    function onUp() { isDrawing = false; lastWorld = null; }

    mount.addEventListener("mousedown", onDown);
    mount.addEventListener("mousemove", onMove);
    mount.addEventListener("mouseup", onUp);
    mount.addEventListener("mouseleave", onUp);
    mount.addEventListener("touchstart", onDown, { passive: false });
    mount.addEventListener("touchmove", onMove, { passive: false });
    mount.addEventListener("touchend", onUp);

    let animId;
    const clock = new THREE.Clock();
    function animate() {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      sun.position.x = Math.sin(t * 0.05) * 8;
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
      ["mousedown","mousemove","mouseup","mouseleave"].forEach(ev => mount.removeEventListener(ev, ev === "mousedown" ? onDown : ev === "mousemove" ? onMove : onUp));
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  // Sync tool to ref
  useEffect(() => {
    stateRef.current.tool = tool;
  }, [tool]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <div ref={mountRef} className="w-full h-full" style={{ cursor: tool === "rake" ? "crosshair" : "cell" }} />
      <div className="absolute top-3 left-3 flex gap-2">
        {[{ id: "rake", label: "🪥 Rake" }, { id: "stone", label: "🪨 Stone" }].map(t => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-all ${
              tool === t.id ? "bg-white/25 text-white" : "bg-black/25 text-white/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/30">
        {tool === "rake" ? "Draw rake patterns in the sand" : "Tap to place stones"}
      </p>
    </div>
  );
}