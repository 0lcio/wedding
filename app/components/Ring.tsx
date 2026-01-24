"use client";

import * as THREE from 'three'
import React, { useRef, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

type GLTFResult = GLTF & {
  nodes: {
    Object_2: THREE.Mesh
    Object_3: THREE.Mesh
  }
  materials: {
    Crystal: THREE.MeshStandardMaterial
    Metal: THREE.MeshStandardMaterial
  }
}

export function Ring(props: JSX.IntrinsicElements['group']) {
  const { nodes } = useGLTF('/models/ring.glb') as GLTFResult
  const groupRef = useRef<THREE.Group>(null)

  // 1. Materiale Diamante Realistico
  const diamondMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    metalness: 0.0,
    roughness: 0.0,           // Liscia perfetta
    transmission: 1.0,        // Vetro/Cristallo
    ior: 2.42,                // Indice di rifrazione reale del diamante
    thickness: 1.5,           // Spessore per calcolare la rifrazione
    envMapIntensity: 2.5,     // Aumenta la luminosità dei riflessi
    clearcoat: 1.0,
    attenuationColor: new THREE.Color('#ffffff'),
    attenuationDistance: 0.5,
    dispersion: 5,            // (IMPORTANTE) Crea l'effetto arcobaleno
    toneMapped: false         // Mantiene i bianchi brillanti senza tagliarli
  }), [])

  // 2. Materiale Metallo Scuro (Black Chrome / Rodio Nero)
  const darkMetalMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#151515',         // Quasi nero, ma non #000000 assoluto
    metalness: 1.0,           // Completamente metallico
    roughness: 0.1,           // Quasi specchio, ma con un minimo di texture
    clearcoat: 1.0,           // Strato lucido sopra
    clearcoatRoughness: 0.0,
    envMapIntensity: 1.5,     // Riflessi forti
    reflectivity: 1.0
  }), [])

  useGSAP(() => {
    if (!groupRef.current) return;
    
    gsap.to(groupRef.current.rotation, {
      y: Math.PI * 2,
      duration: 10,
      repeat: -1,
      ease: "none"
    });
  }, { scope: groupRef });

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {/* Applico il materiale Diamante */}
        <mesh geometry={nodes.Object_2.geometry} material={diamondMaterial} />
        {/* Applico il materiale Metallo Scuro al posto di materials.Metal */}
        <mesh geometry={nodes.Object_3.geometry} material={darkMetalMaterial} />
      </group>
    </group>
  )
}

useGLTF.preload('/models/ring.glb')