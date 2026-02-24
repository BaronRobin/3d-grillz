import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Environment, ContactShadows } from '@react-three/drei';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import './WebGLShowcase.css';

/**
 * Custom 3D Model Component for the WebGL Showcase.
 * Handles the rotation animation for the rendered geometry.
 * @param {Object} props
 * @param {boolean} props.visible - Whether the model is visible.
 * @param {number} props.geometryType - The index determining which geometry to render.
 * @param {string} props.color - Hex color for the material.
 * @param {number} props.roughness - Material roughness.
 * @returns {JSX.Element}
 */
const GrillModel = ({ visible, geometryType, color = "#eec95e", roughness = 0.1 }) => {
    const mesh = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        mesh.current.rotation.y = Math.sin(t / 4) / 2;
        mesh.current.rotation.z = (1 + Math.sin(t / 1.5)) / 20;
    });

    return (
        <group dispose={null}>
            <mesh ref={mesh} visible={visible}>
                {geometryType === 0 && <torusKnotGeometry args={[0.8, 0.2, 128, 32]} />}
                {geometryType === 1 && <torusGeometry args={[0.8, 0.4, 16, 100]} />}
                {geometryType === 2 && <octahedronGeometry args={[1, 0]} />}

                <meshStandardMaterial
                    color={color}
                    metalness={1}
                    roughness={roughness}
                />
            </mesh>
        </group>
    );
};

/**
 * WebGL Showcase Component that renders interactive 3D models using React Three Fiber.
 * @param {Object} props
 * @param {Object} [props.forcedMaterial] - Optional material override properties {color, roughness}
 * @param {boolean} [props.hideHeader] - If true, hides the "Interactive Showcase" header
 * @returns {JSX.Element}
 */
const WebGLShowcase = ({ forcedMaterial, hideHeader = false }) => {
    const [index, setIndex] = useState(0);
    const designs = ['Custom Molded Gold', 'Classic Grill', 'Diamond Cut'];

    const nextDesign = () => setIndex((prev) => (prev + 1) % designs.length);
    const prevDesign = () => setIndex((prev) => (prev - 1 + designs.length) % designs.length);

    return (
        <section className={`webgl-section section ${hideHeader ? 'no-padding' : ''}`} id="showcase">
            <div className="container" style={hideHeader ? { height: '100%', display: 'flex', flexDirection: 'column' } : {}}>
                {!hideHeader && (
                    <div className="section-header fade-in-up">
                        <h2 style={{ marginBottom: 0 }}>Interactive Showcase</h2>
                    </div>
                )}

                <div className="showcase-card fade-in-up" style={{ background: 'transparent', boxShadow: 'none', flexGrow: 1 }}>
                    <div className="canvas-wrapper">
                        <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                            <ambientLight intensity={0.5} />
                            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                            <Environment preset="city" />

                            <Float speed={4} rotationIntensity={1} floatIntensity={2}>
                                <GrillModel
                                    geometryType={index}
                                    visible={true}
                                    color={forcedMaterial ? forcedMaterial.color : (index === 2 ? "#b9f2ff" : "#eec95e")}
                                    roughness={forcedMaterial ? forcedMaterial.roughness : 0.1}
                                />
                            </Float>

                            <ContactShadows position={[0, -1.4, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
                            <OrbitControls enableZoom={true} enablePan={false} autoRotate />
                        </Canvas>

                        <div className="interaction-hint">
                            <span>Drag to Rotate | Scroll to Zoom</span>
                        </div>

                        {/* Top Right Controls */}
                        <div className="view-controls">
                            <button
                                className="view-btn"
                                onClick={() => {
                                    const elem = document.querySelector('.canvas-wrapper');
                                    if (!document.fullscreenElement) {
                                        elem.requestFullscreen().catch(err => {
                                            console.log(`Error attempting to enable fullscreen: ${err.message}`);
                                        });
                                    } else {
                                        document.exitFullscreen();
                                    }
                                }}
                                title="Toggle Fullscreen"
                            >
                                ⛶
                            </button>
                            {/* AR Button removed as requested */}
                        </div>

                        <div className="design-controls">
                            <button className="control-btn" onClick={prevDesign}>
                                <FaChevronLeft />
                            </button>
                            <div className="design-info">
                                <h3>{designs[index]}</h3>
                                <div className="design-indicator">
                                    {designs.map((_, i) => (
                                        <div key={i} className={`indicator-dot ${i === index ? 'active' : ''}`} />
                                    ))}
                                </div>
                            </div>
                            <button className="control-btn" onClick={nextDesign}>
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WebGLShowcase;
