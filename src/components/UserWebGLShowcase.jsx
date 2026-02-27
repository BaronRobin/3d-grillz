import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Environment, ContactShadows, useGLTF } from '@react-three/drei';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { Eye, EyeOff } from 'lucide-react';
import './WebGLShowcase.css';

const CustomModel = ({ url, materialProps, showUpper, showLower }) => {
    const { scene } = useGLTF(url);

    useEffect(() => {
        if (scene) {
            scene.traverse((child) => {
                if (child.isMesh) {
                    // Jaw Isolation
                    const name = child.name.toLowerCase();
                    if (name.includes('upper') || name.includes('top')) {
                        child.visible = showUpper;
                    } else if (name.includes('lower') || name.includes('bottom')) {
                        child.visible = showLower;
                    } else {
                        // Default to visible if not explicitly named upper/lower
                        child.visible = true;
                    }

                    // Material Swapping
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.color.set(materialProps.color);
                        child.material.metalness = 1.0;
                        child.material.roughness = materialProps.roughness;
                        child.material.needsUpdate = true;
                    }
                }
            });
        }
    }, [scene, materialProps, showUpper, showLower]);

    return <primitive object={scene} scale={2} />;
};

const UserWebGLShowcase = ({ designs = [], requestedMaterialName = "Gold" }) => {
    const [index, setIndex] = useState(designs.length > 0 ? designs.length - 1 : 0);
    const [showUpper, setShowUpper] = useState(true);
    const [showLower, setShowLower] = useState(true);

    const materials = [
        { name: '18k Gold', color: '#eec95e', roughness: 0.15 },
        { name: 'White Gold / Silver', color: '#dcdcdc', roughness: 0.1 },
        { name: 'Rose Gold', color: '#b76e79', roughness: 0.15 },
    ];

    // Attempt to map requested material to our presets
    const defaultMatIndex = materials.findIndex(m => m.name.toLowerCase().includes(requestedMaterialName.toLowerCase())) !== -1
        ? materials.findIndex(m => m.name.toLowerCase().includes(requestedMaterialName.toLowerCase()))
        : 0;

    const [matIndex, setMatIndex] = useState(defaultMatIndex);

    const modelRef = useRef();

    // Subtle breathing/floating animation
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (modelRef.current) {
            modelRef.current.rotation.y = Math.sin(t / 4) / 4;
            modelRef.current.rotation.z = (1 + Math.sin(t / 1.5)) / 40;
        }
    });

    const currentDesign = designs[index];
    const currentMat = materials[matIndex];

    const nextDesign = () => setIndex((prev) => (prev + 1) % designs.length);
    const prevDesign = () => setIndex((prev) => (prev - 1 + designs.length) % designs.length);

    if (designs.length === 0) {
        return (
            <div className="glass" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                <p>No custom 3D designs uploaded yet.</p>
            </div>
        );
    }

    return (
        <section className={`webgl-section section no-padding`} id="showcase" style={{ background: 'transparent', height: '100%' }}>
            <div className="container" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0 }}>
                <div className="showcase-card fade-in-up" style={{ background: 'transparent', boxShadow: 'none', flexGrow: 1, position: 'relative' }}>

                    {/* Top HUD: Material & View Controls */}
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
                        <div className="material-selector" style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '8px', backdropFilter: 'blur(4px)' }}>
                            {materials.map((mat, i) => (
                                <button
                                    key={i}
                                    onClick={() => setMatIndex(i)}
                                    style={{
                                        width: '24px', height: '24px', borderRadius: '50%', background: mat.color,
                                        border: matIndex === i ? '2px solid #fff' : '2px solid transparent',
                                        cursor: 'pointer', transition: 'all 0.2s', padding: 0
                                    }}
                                    title={mat.name}
                                />
                            ))}
                        </div>

                        <div className="jaw-toggles" style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '8px', backdropFilter: 'blur(4px)' }}>
                            <button onClick={() => setShowUpper(!showUpper)} style={{ background: 'transparent', border: 'none', color: showUpper ? '#fff' : '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', padding: 0 }}>
                                {showUpper ? <Eye size={16} /> : <EyeOff size={16} />} Upper
                            </button>
                            <button onClick={() => setShowLower(!showLower)} style={{ background: 'transparent', border: 'none', color: showLower ? '#fff' : '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', padding: 0 }}>
                                {showLower ? <Eye size={16} /> : <EyeOff size={16} />} Lower
                            </button>
                        </div>
                    </div>

                    <div className="canvas-wrapper">
                        <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                            <ambientLight intensity={0.5} />
                            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                            <Environment preset="city" />

                            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                                <group ref={modelRef}>
                                    <CustomModel
                                        url={currentDesign.url}
                                        materialProps={currentMat}
                                        showUpper={showUpper}
                                        showLower={showLower}
                                    />
                                </group>
                            </Float>

                            <ContactShadows position={[0, -1.4, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
                            <OrbitControls enableZoom={true} enablePan={false} autoRotate={false} />
                        </Canvas>

                        <div className="interaction-hint" style={{ bottom: '80px' }}>
                            <span>Drag to Rotate | Scroll to Zoom</span>
                        </div>

                        {/* Bottom Controls: Design Variants */}
                        {designs.length > 1 && (
                            <div className="design-controls" style={{ bottom: '1rem' }}>
                                <button className="control-btn" onClick={prevDesign}>
                                    <FaChevronLeft />
                                </button>
                                <div className="design-info">
                                    <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{currentDesign.variant_name || `Version ${index + 1}`}</h3>
                                    <div style={{ fontSize: '0.7rem', color: '#ffb347', marginTop: '4px', letterSpacing: '0.5px' }}>
                                        {matIndex === defaultMatIndex ? 'REQUESTED MATERIAL' : currentMat.name.toUpperCase()}
                                    </div>
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
                        )}
                        {designs.length === 1 && (
                            <div className="design-controls" style={{ bottom: '1rem', justifyContent: 'center' }}>
                                <div className="design-info text-center">
                                    <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{currentDesign.variant_name || 'Custom 3D Design'}</h3>
                                    <div style={{ fontSize: '0.7rem', color: '#ffb347', marginTop: '4px', letterSpacing: '0.5px' }}>
                                        {matIndex === defaultMatIndex ? 'REQUESTED MATERIAL' : currentMat.name.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UserWebGLShowcase;
