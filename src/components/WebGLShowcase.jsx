import React, { useState, useRef, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Environment, ContactShadows, useGLTF } from '@react-three/drei';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import './WebGLShowcase.css';

// Error Boundary for the WebGL Canvas
class CanvasErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        console.warn('WebGL Canvas error caught by boundary:', error.message);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: '300px',
                    gap: '1rem',
                    color: '#666'
                }}>
                    <div style={{ fontSize: '2rem' }}>⬡</div>
                    <p style={{ fontSize: '0.9rem', color: '#555', margin: 0 }}>3D model unavailable</p>
                    <p style={{ fontSize: '0.75rem', color: '#444', margin: 0 }}>The model could not be loaded.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

// Loading fallback while model fetches
const ModelLoader = () => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '300px',
        gap: '1rem',
        color: '#666'
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(201,169,97,0.3)',
            borderTopColor: 'var(--color-accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>Loading 3D model...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

const CustomModel = ({ url, color, roughness }) => {
    const { scene } = useGLTF(url);

    React.useEffect(() => {
        if (scene) {
            scene.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material = child.material.clone();
                    child.material.color.set(color);
                    child.material.metalness = 1.0;
                    child.material.roughness = roughness;
                    child.material.needsUpdate = true;
                }
            });
        }
    }, [scene, color, roughness]);

    return <primitive object={scene} scale={2} />;
};

const GrillModel = ({ visible, geometryType, color = "#eec95e", roughness = 0.1, modelUrl }) => {
    const mesh = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (mesh.current) {
            mesh.current.rotation.y = Math.sin(t / 4) / 2;
            mesh.current.rotation.z = (1 + Math.sin(t / 1.5)) / 20;
        }
    });

    if (modelUrl && typeof modelUrl === 'string' && modelUrl.trim() !== '') {
        return (
            <group dispose={null} ref={mesh} visible={visible}>
                <Suspense fallback={null}>
                    <CustomModel url={modelUrl} color={color} roughness={roughness} />
                </Suspense>
            </group>
        );
    }

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

const WebGLShowcase = ({ forcedMaterial, hideHeader = false, modelUrl }) => {
    const [index, setIndex] = useState(0);
    const designs = modelUrl ? ['Your AI Design Estimation'] : ['Custom Molded Gold', 'Classic Grill', 'Diamond Cut'];

    const nextDesign = () => setIndex((prev) => (prev + 1) % designs.length);
    const prevDesign = () => setIndex((prev) => (prev - 1 + designs.length) % designs.length);

    const validModelUrl = modelUrl && typeof modelUrl === 'string' && modelUrl.trim() !== '' ? modelUrl : null;

    return (
        <section className={`webgl-section section ${hideHeader ? 'no-padding' : ''}`} id="showcase" style={hideHeader ? { background: 'transparent' } : {}}>
            <div className="container" style={hideHeader ? { height: '100%', display: 'flex', flexDirection: 'column', padding: 0 } : {}}>
                {!hideHeader && (
                    <div className="section-header fade-in-up">
                        <h2 style={{ marginBottom: 0 }}>Interactive Showcase</h2>
                    </div>
                )}

                <div className="showcase-card fade-in-up" style={{ background: 'transparent', boxShadow: 'none', flexGrow: 1 }}>
                    <div className="canvas-wrapper">
                        <CanvasErrorBoundary>
                            <Suspense fallback={<ModelLoader />}>
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
                                            modelUrl={validModelUrl}
                                        />
                                    </Float>

                                    <ContactShadows position={[0, -1.4, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
                                    <OrbitControls enableZoom={true} enablePan={false} autoRotate />
                                </Canvas>
                            </Suspense>
                        </CanvasErrorBoundary>

                        <div className="interaction-hint">
                            <span>Drag to Rotate | Scroll to Zoom</span>
                        </div>

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
                        </div>

                        <div className="design-controls">
                            {!validModelUrl && (
                                <button className="control-btn" onClick={prevDesign}>
                                    <FaChevronLeft />
                                </button>
                            )}
                            <div className="design-info">
                                <h3>{designs[index]}</h3>
                                {!validModelUrl && (
                                    <div className="design-indicator">
                                        {designs.map((_, i) => (
                                            <div key={i} className={`indicator-dot ${i === index ? 'active' : ''}`} />
                                        ))}
                                    </div>
                                )}
                                {validModelUrl && (
                                    <div style={{ fontSize: '0.7rem', color: '#ffb347', marginTop: '4px', letterSpacing: '0.5px' }}>
                                        AI-GENERATED APPROXIMATION
                                    </div>
                                )}
                            </div>
                            {!validModelUrl && (
                                <button className="control-btn" onClick={nextDesign}>
                                    <FaChevronRight />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WebGLShowcase;
