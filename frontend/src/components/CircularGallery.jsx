
import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Image, ScrollControls, useScroll, Text } from '@react-three/drei'
import * as THREE from 'three'
import '../pages/LandingPage.css' // Reuse main CSS for consistency

function GalleryItem({ url, index, position, bend, ...props }) {
    const ref = useRef()
    const scroll = useScroll()
    const [hovered, hover] = useState(false)

    useFrame((state, delta) => {
        // Calculate global scroll offset (0 to 1)
        const offset = scroll.offset

        // Each item's base position in the circle (0 to 2PI) + scroll offset
        // 6 items total for this example
        const totalItems = 6
        const angleStep = (Math.PI * 2) / totalItems
        const baseAngle = index * angleStep
        // Rotate the entire gallery based on scroll
        const currentAngle = baseAngle + (offset * Math.PI * 2)

        // Calculate position on a circle
        const radius = 4 // Adjust radius based on screen size ideally
        const x = Math.sin(currentAngle) * radius
        const z = Math.cos(currentAngle) * radius

        // Apply bent position
        ref.current.position.set(x, position[1], z - 4) // Push back a bit
        ref.current.rotation.y = currentAngle + Math.PI // Face inward

        // Scale on hover
        ref.current.scale.lerp(new THREE.Vector3().setScalar(hovered ? 1.2 : 1), 0.1)
    })

    return (
        <group {...props}>
            <Image ref={ref} url={url} transparent side={THREE.DoubleSide} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
                <bentPlaneGeometry args={[0.1, 1, 1, 20, 20]} />
            </Image>
        </group>
    )
}

// Since standard drei Image doesn't bend easily without custom shaders, 
// let's create a simpler 3D carousel that mimics the "CircularGallery" request 
// but using standard PlaneGeometry arranged in a circle.

function Carousel({ radius = 2.5, count = 6 }) {
    const group = useRef()
    const scroll = useScroll()

    // Testimonial Data as Textures/Cards would be ideal, but for now let's make 3D cards
    // We will simulate the cards using simple meshes with text for this demo

    useFrame((state, delta) => {
        // Auto-rotation + Scroll rotation
        const autoRotateSpeed = 0.1 // Slower rotation
        const scrollRotation = scroll.offset * Math.PI * 2
        // Use a ref for continuous rotation to avoid jumps if component re-renders,
        // but for simple auto-rotate based on time:
        const timeRotation = state.clock.getElapsedTime() * autoRotateSpeed

        group.current.rotation.y = scrollRotation + timeRotation
    })

    return (
        <group ref={group}>
            {Array.from({ length: count }).map((_, i) => {
                const angle = (i / count) * Math.PI * 2
                return (
                    <Card
                        key={i}
                        angle={angle}
                        radius={radius}
                        index={i}
                    />
                )
            })}
        </group>
    )
}

function Card({ angle, radius, index }) {
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius

    // Testimonial specific colors or data
    const colors = ['#2E7D32', '#5D4037', '#FFA000', '#1976D2', '#7B1FA2', '#C2185B']
    const names = ["Ramesh Kumar", "Suresh Patel", "Anita Desai", "Vikram Singh", "Meera Reddy", "John Doe"]
    const roles = ["Farmer", "Supplier", "Consumer", "Farmer", "Supplier", "Logistics"]
    const texts = [
        "AgriConnect changed my life. Direct sales, no middlemen.",
        "Best platform for selling equipment. Sales doubled!",
        "Fresh organic vegetables directly from farmers.",
        "Weather insights help me plan my crops better.",
        "Connecting with farmers has never been easier.",
        "Efficient tracking and management system."
    ]

    return (
        <group position={[x, 0, z]} rotation={[0, angle, 0]}>
            {/* Card Background */}
            <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[2.8, 3.5, 0.1]} /> {/* Large Card */}
                {/* High emissive intensity guarantees white appearance */}
                <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0} emissive="#ffffff" emissiveIntensity={0.8} />
            </mesh>

            {/* Border/Accent */}
            <mesh position={[0, 0, -0.06]}>
                <boxGeometry args={[2.9, 3.6, 0.05]} />
                <meshStandardMaterial color={colors[index]} />
            </mesh>

            {/* Text Content - Front Side */}
            <group position={[0, 0, 0.06]}>
                <Text
                    position={[0, 1.2, 0]}
                    fontSize={0.25}
                    color="#1a1a1a"
                    fontWeight="bold"
                    anchorX="center"
                    anchorY="middle"
                >
                    {names[index]}
                </Text>
                <Text
                    position={[0, 0.9, 0]}
                    fontSize={0.15}
                    color="#4a4a4a"
                    anchorX="center"
                    anchorY="middle"
                >
                    {roles[index]}
                </Text>
                <Text
                    position={[0, 0, 0]}
                    fontSize={0.18}
                    color="#333333"
                    maxWidth={2.2}
                    textAlign="center"
                    anchorX="center"
                    anchorY="middle"
                    lineHeight={1.4}
                >
                    "{texts[index]}"
                </Text>

                {/* Fake Star Rating */}
                <group position={[0, -1, 0]}>
                    <Text fontSize={0.2} color="#FFA000">★★★★★</Text>
                </group>
            </group>
        </group>
    )
}

function Rig() {
    return useFrame((state) => {
        state.camera.position.lerp({ x: 0, y: 0, z: 9 }, 0.1) // Adjust zoom
        state.camera.lookAt(0, 0, 0)
    })
}

export default function CircularGallery() {
    return (
        <Canvas shadows camera={{ position: [0, 0, 10], fov: 35 }}>
            {/* Increased ambient light intensity for brighter scene */}
            <ambientLight intensity={1.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow intensity={2} />
            <group position={[0, -0.5, 0]}>
                {/* ScrollControls manages the virtual scroll area */}
                <ScrollControls pages={4} damping={0.2} infinite>
                    <Carousel />
                </ScrollControls>
            </group>
            {/* <Rig /> */}
        </Canvas>
    )
}
