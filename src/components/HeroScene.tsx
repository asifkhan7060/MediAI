import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════
   Red Blood Cells — Torus (donut) shape, classic RBC look
   ═══════════════════════════════════════════════════════ */

function RedBloodCells() {
  const count = 25;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const temp: { position: THREE.Vector3; speed: number; offset: number; scale: number; rotSpeed: THREE.Vector3 }[] = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 10
        ),
        speed: 0.05 + Math.random() * 0.15,
        offset: Math.random() * Math.PI * 2,
        scale: 0.08 + Math.random() * 0.15,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.2
        ),
      });
    }
    return temp;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      dummy.position.set(
        p.position.x + Math.sin(time * p.speed + p.offset) * 0.8,
        p.position.y + Math.cos(time * p.speed * 0.7 + p.offset) * 1.0,
        p.position.z + Math.sin(time * p.speed * 0.5 + p.offset) * 0.4
      );
      dummy.rotation.set(
        time * p.rotSpeed.x + p.offset,
        time * p.rotSpeed.y + p.offset,
        time * p.rotSpeed.z
      );
      dummy.scale.setScalar(p.scale * (1 + Math.sin(time * 1.2 + p.offset) * 0.15));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <torusGeometry args={[1, 0.35, 12, 24]} />
      <meshStandardMaterial
        color="hsl(0, 65%, 55%)"
        emissive="hsl(0, 70%, 30%)"
        emissiveIntensity={0.6}
        transparent
        opacity={0.5}
        roughness={0.3}
        metalness={0.2}
      />
    </instancedMesh>
  );
}

/* ═══════════════════════════════════════════════════════
   White Blood Cells — Icosahedron (bumpy spherical shape)
   ═══════════════════════════════════════════════════════ */

function WhiteBloodCells() {
  const count = 15;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const temp: { position: THREE.Vector3; speed: number; offset: number; scale: number; rotSpeed: THREE.Vector3 }[] = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 8
        ),
        speed: 0.04 + Math.random() * 0.12,
        offset: Math.random() * Math.PI * 2,
        scale: 0.1 + Math.random() * 0.18,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.15
        ),
      });
    }
    return temp;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      dummy.position.set(
        p.position.x + Math.cos(time * p.speed + p.offset) * 0.7,
        p.position.y + Math.sin(time * p.speed * 0.6 + p.offset) * 0.9,
        p.position.z + Math.cos(time * p.speed * 0.4 + p.offset) * 0.5
      );
      dummy.rotation.set(
        time * p.rotSpeed.x + p.offset,
        time * p.rotSpeed.y,
        time * p.rotSpeed.z + p.offset * 0.5
      );
      dummy.scale.setScalar(p.scale * (1 + Math.sin(time * 1.5 + p.offset) * 0.2));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="hsl(195, 80%, 75%)"
        emissive="hsl(195, 80%, 45%)"
        emissiveIntensity={0.5}
        transparent
        opacity={0.4}
        roughness={0.4}
        metalness={0.3}
      />
    </instancedMesh>
  );
}

/* ═══════════════════════════════════════════════════════
   Platelets — Small disc/cylinder shapes
   ═══════════════════════════════════════════════════════ */

function Platelets() {
  const count = 30;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const temp: { position: THREE.Vector3; speed: number; offset: number; scale: number; rotSpeed: THREE.Vector3 }[] = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 10
        ),
        speed: 0.08 + Math.random() * 0.2,
        offset: Math.random() * Math.PI * 2,
        scale: 0.04 + Math.random() * 0.08,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.4
        ),
      });
    }
    return temp;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      dummy.position.set(
        p.position.x + Math.sin(time * p.speed + p.offset) * 0.6,
        p.position.y + Math.cos(time * p.speed * 0.8 + p.offset) * 0.7,
        p.position.z + Math.sin(time * p.speed * 0.3 + p.offset) * 0.4
      );
      dummy.rotation.set(
        time * p.rotSpeed.x + p.offset,
        time * p.rotSpeed.y + p.offset * 0.7,
        time * p.rotSpeed.z
      );
      dummy.scale.setScalar(p.scale * (1 + Math.sin(time * 2 + p.offset) * 0.25));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[1, 1, 0.25, 8]} />
      <meshStandardMaterial
        color="hsl(42, 85%, 65%)"
        emissive="hsl(42, 85%, 40%)"
        emissiveIntensity={0.5}
        transparent
        opacity={0.45}
        roughness={0.3}
        metalness={0.3}
      />
    </instancedMesh>
  );
}

/* ═══════════════════════════════════════════════════════
   Virus-like Particles — Dodecahedron with spiky feel
   ═══════════════════════════════════════════════════════ */

function MicroOrganisms() {
  const count = 10;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const temp: { position: THREE.Vector3; speed: number; offset: number; scale: number; rotSpeed: THREE.Vector3 }[] = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 8
        ),
        speed: 0.03 + Math.random() * 0.1,
        offset: Math.random() * Math.PI * 2,
        scale: 0.06 + Math.random() * 0.12,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.3
        ),
      });
    }
    return temp;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      dummy.position.set(
        p.position.x + Math.cos(time * p.speed + p.offset) * 0.5,
        p.position.y + Math.sin(time * p.speed * 0.5 + p.offset) * 0.8,
        p.position.z + Math.cos(time * p.speed * 0.3 + p.offset) * 0.3
      );
      dummy.rotation.set(
        time * p.rotSpeed.x,
        time * p.rotSpeed.y + p.offset,
        time * p.rotSpeed.z + p.offset * 0.3
      );
      dummy.scale.setScalar(p.scale * (1 + Math.sin(time * 1.8 + p.offset) * 0.2));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="hsl(262, 60%, 60%)"
        emissive="hsl(262, 60%, 35%)"
        emissiveIntensity={0.6}
        transparent
        opacity={0.35}
        roughness={0.4}
        metalness={0.4}
      />
    </instancedMesh>
  );
}

/* ═══════════════════════════════════════════
   Ambient Orbs — Large glowing gradient orbs
   ═══════════════════════════════════════════ */

function AmbientOrb({ position, color, emissive, scale = 1 }: {
  position: [number, number, number];
  color: string;
  emissive: string;
  scale?: number;
}) {
  return (
    <Float speed={1.2} floatIntensity={0.6} rotationIntensity={0.15}>
      <mesh position={position} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.4}
          transparent
          opacity={0.1}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </Float>
  );
}

/* ═══════════════════════════════════════
   Main Scene — Medical Cell Types
   ═══════════════════════════════════════ */

function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[6, 5, 5]} intensity={1.2} color="hsl(0, 65%, 60%)" />
      <pointLight position={[-5, -3, 3]} intensity={0.8} color="hsl(195, 80%, 55%)" />
      <pointLight position={[0, 4, -5]} intensity={0.5} color="hsl(42, 85%, 60%)" />
      <pointLight position={[-4, 5, 2]} intensity={0.4} color="hsl(262, 60%, 55%)" />

      {/* Different cell types */}
      <RedBloodCells />
      <WhiteBloodCells />
      <Platelets />
      <MicroOrganisms />

      {/* Large ambient glow orbs for depth */}
      <AmbientOrb position={[-4, 2, -5]} color="hsl(0, 60%, 50%)" emissive="hsl(0, 60%, 30%)" scale={2.5} />
      <AmbientOrb position={[4, -2, -5]} color="hsl(195, 80%, 50%)" emissive="hsl(195, 80%, 30%)" scale={2} />
      <AmbientOrb position={[-2, -3, -4]} color="hsl(42, 85%, 55%)" emissive="hsl(42, 85%, 35%)" scale={1.5} />
      <AmbientOrb position={[3, 3, -4]} color="hsl(262, 60%, 50%)" emissive="hsl(262, 60%, 30%)" scale={1.8} />
    </>
  );
}

/* ═══════════════════════════════════════
   Export — Canvas wrapper with blur
   ═══════════════════════════════════════ */

export default function HeroScene() {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        pointerEvents: 'none',
        filter: 'blur(1.5px)',
        WebkitFilter: 'blur(1.5px)',
      }}
    >
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          style={{ background: 'transparent' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}
