import { Suspense, useMemo, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, Lightformer, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function GoldParticleField() {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const count = 400
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const radius = 4 + Math.random() * 6
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = radius * Math.cos(phi)
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.02
    }
  })

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#c9a961"
        size={0.035}
        sizeAttenuation
        depthWrite={false}
        opacity={0.55}
      />
    </Points>
  )
}

function Pendant() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * 0.35
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.15
  })

  const goldMaterialProps = {
    color: '#d4af37',
    metalness: 0.9,
    roughness: 0.2,
    envMapIntensity: 1.2,
  }

  return (
    <group ref={groupRef}>
      {/* Central gem-like torus knot */}
      <mesh castShadow>
        <torusKnotGeometry args={[0.85, 0.26, 220, 32, 2, 3]} />
        <meshStandardMaterial {...goldMaterialProps} />
      </mesh>

      {/* Pendant loop */}
      <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.07, 24, 64]} />
        <meshStandardMaterial {...goldMaterialProps} />
      </mesh>

      {/* Accent sphere "gem" */}
      <mesh position={[0, -1.15, 0]}>
        <sphereGeometry args={[0.28, 48, 48]} />
        <meshStandardMaterial color="#fff7e0" metalness={0.3} roughness={0.05} envMapIntensity={1.5} />
      </mesh>
    </group>
  )
}

function SceneFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#d4af37" wireframe />
    </mesh>
  )
}

/**
 * Procedural, jewellery-like 3D hero centerpiece. Renders a slowly
 * auto-rotating, gently bobbing gold "pendant" (torus-knot gem + loop +
 * accent sphere) inside a soft particle field, lit by a studio HDRI.
 *
 * Entirely skipped (renders a CSS-only glow instead) when the user has
 * `prefers-reduced-motion: reduce` set, or if WebGL isn't available.
 */
export function RotatingHeroScene() {
  const [canRender3d, setCanRender3d] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let hasWebGl = false
    try {
      const canvas = document.createElement('canvas')
      hasWebGl = Boolean(
        window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')),
      )
    } catch {
      hasWebGl = false
    }

    setCanRender3d(!prefersReducedMotion && hasWebGl)
    setChecked(true)
  }, [])

  if (!checked) {
    return <div className="aspect-square w-full max-w-lg" />
  }

  if (!canRender3d) {
    return (
      <div className="relative aspect-square w-full max-w-lg">
        <div className="absolute inset-0 animate-float rounded-full bg-radial from-gold/30 via-gold/10 to-transparent blur-2xl" />
        <div className="absolute inset-[15%] rounded-full border border-gold/40" />
        <div className="absolute inset-[30%] rounded-full border border-gold/60" />
      </div>
    )
  }

  return (
    <div className="aspect-square w-full max-w-lg">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 2]} intensity={1.2} />
        <Suspense fallback={<SceneFallback />}>
          <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
            <Pendant />
          </Float>
          <GoldParticleField />
          {/*
            Procedural studio lighting rig built entirely from local
            Lightformers (no remote HDRI fetch) so the hero renders
            identically online or fully offline.
          */}
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={2.5} color="#fff7e0" position={[3, 3, 2]} scale={[3, 3, 1]} />
            <Lightformer form="rect" intensity={1.2} color="#c9a961" position={[-3, 1, 2]} scale={[2, 3, 1]} />
            <Lightformer form="ring" intensity={1.5} color="#ffffff" position={[0, -3, -2]} scale={4} />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  )
}
