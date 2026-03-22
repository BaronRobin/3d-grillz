import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import '../App.css';

const MATERIALS = [
    { name: 'Gold', hexStr: '#eec95e', colorVal: 0xeec95e },
    { name: 'Silver', hexStr: '#dcdcdc', colorVal: 0xdcdcdc },
    { name: 'Rose Gold', hexStr: '#b76e79', colorVal: 0xb76e79 }
];

const MOCK_MODELS = [
    { id: 1, name: 'Full Front Grill (6 Teeth)' },
    { id: 2, name: 'Fang Caps (2 Teeth)' },
    { id: 3, name: 'Bottom Row Grill' }
];

// Helper to generate the 3D Jaw & Grillz structure
const createJawAndGrillz = (modelTypeIndex, materialProps) => {
    const rootGroup = new THREE.Group();
    
    // 1. Create Jaw & Teeth
    const jawGroup = new THREE.Group();
    const roundToothGeom = new THREE.CylinderGeometry(0.4, 0.3, 1.2, 16);
    const toothMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.1 });
    
    const NUM_TEETH = 12;
    const RADIUS = 3.5;
    
    // Gums
    const gumsGeom = new THREE.TorusGeometry(RADIUS, 0.6, 16, 64, Math.PI);
    const gumsMat = new THREE.MeshStandardMaterial({ color: 0xff8899, roughness: 0.7 });
    const gums = new THREE.Mesh(gumsGeom, gumsMat);
    gums.rotation.x = Math.PI / 2;
    gums.position.y = 0.8;
    jawGroup.add(gums);

    // Upper Teeth
    for(let i=0; i<=NUM_TEETH; i++) {
        const angle = (i / NUM_TEETH) * Math.PI;
        const tooth = new THREE.Mesh(roundToothGeom, toothMat);
        tooth.position.set(Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS);
        tooth.rotation.y = -angle; 
        jawGroup.add(tooth);
    }
    
    // Lower Jaw
    const lowerJawGroup = jawGroup.clone();
    lowerJawGroup.position.y = -1.3;
    lowerJawGroup.rotation.z = Math.PI;
    rootGroup.add(jawGroup);
    rootGroup.add(lowerJawGroup);

    // 2. Lay down Grillz
    const grillGroup = new THREE.Group();
    const grillGeom = new THREE.CylinderGeometry(0.45, 0.35, 1.25, 16);
    const grillMat = new THREE.MeshStandardMaterial({ 
        color: materialProps.colorVal, 
        metalness: 1.0, 
        roughness: 0.15 
    });

    let targetTeeth = [];
    if (modelTypeIndex === 0) {
        targetTeeth = [3, 4, 5, 6, 7, 8, 9]; // Full Front
    } else if (modelTypeIndex === 1) {
        targetTeeth = [3, 9]; // Fangs
    }

    if (modelTypeIndex !== 2) {
        targetTeeth.forEach(i => {
            const angle = (i / NUM_TEETH) * Math.PI;
            const grill = new THREE.Mesh(grillGeom, grillMat);
            grill.position.set(Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS);
            grill.rotation.y = -angle;
            grillGroup.add(grill);
        });
    } else {
        targetTeeth = [4, 5, 6, 7, 8]; // Bottom
        targetTeeth.forEach(i => {
            const angle = (i / NUM_TEETH) * Math.PI;
            const grill = new THREE.Mesh(grillGeom, grillMat);
            grill.position.set(Math.cos(angle) * RADIUS, -1.3, Math.sin(angle) * RADIUS);
            grill.rotation.y = -angle;
            grill.rotation.z = Math.PI; 
            grillGroup.add(grill);
        });
    }
    
    rootGroup.add(grillGroup);

    // Center & Scale for AR Tracker bounds
    const box = new THREE.Box3().setFromObject(rootGroup);
    const center = new THREE.Vector3();
    box.getCenter(center);
    rootGroup.position.sub(center);
    
    // MindAR uses 1 unit = marker width. Scale to realistic size: 0.5 = half marker width.
    rootGroup.scale.set(0.1, 0.1, 0.1); 
    // Rotate 90deg X so it faces up relative to the flat tracker image
    rootGroup.rotation.x = Math.PI / 2;

    const wrapper = new THREE.Group();
    wrapper.add(rootGroup);
    return wrapper;
};


const ArExperience = () => {
    const [modelIndex, setModelIndex] = useState(0);
    const [matIndex, setMatIndex] = useState(0);
    const [arStarted, setArStarted] = useState(false);
    
    const containerRef = useRef(null);
    const anchorGroupRef = useRef(null);
    const mindarInstanceRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        return () => {
            if (mindarInstanceRef.current) {
                try {
                    mindarInstanceRef.current.stop();
                } catch(e) { }
            }
            // Forcibly remove MindAR UI elements that may have been injected globally
            const overlays = document.querySelectorAll('.mindar-ui-overlay');
            overlays.forEach(el => el.remove());
            
            // Stop any remaining camera video streams just in case
            const videos = document.querySelectorAll('video');
            videos.forEach(v => {
                if (v.srcObject && typeof v.srcObject.getTracks === 'function') {
                    v.srcObject.getTracks().forEach(track => track.stop());
                }
            });
            
            // Remove the video element itself if it was appended to body
            const bodyVideos = document.body.querySelectorAll(':scope > video');
            bodyVideos.forEach(v => v.remove());
        };
    }, []);

    // Effect: Update 3D model immediately when UI changes
    useEffect(() => {
        if (anchorGroupRef.current) {
             // Clear out previous mesh
             while(anchorGroupRef.current.children.length > 0){ 
                 anchorGroupRef.current.remove(anchorGroupRef.current.children[0]); 
             }
             // Generate new mesh
             const newMesh = createJawAndGrillz(modelIndex, MATERIALS[matIndex]);
             anchorGroupRef.current.add(newMesh);
        }
    }, [modelIndex, matIndex]);

    const startAR = async () => {
        setArStarted(true);
        const mindarThree = new MindARThree({
            container: containerRef.current,
            imageTargetSrc: '/targets.mind',
            filterMinCF: 0.05, filterBeta: 10
        });
        mindarInstanceRef.current = mindarThree;

        const { renderer, scene, camera } = mindarThree;

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 10, 5);
        scene.add(directionalLight);

        // Setup Tracker Anchor
        const anchor = mindarThree.addAnchor(0);
        
        // We inject a holding group into the anchor so we can swap out the children via useEffect
        const holdingGroup = new THREE.Group();
        anchorGroupRef.current = holdingGroup;
        
        // Add initial mesh
        holdingGroup.add(createJawAndGrillz(modelIndex, MATERIALS[matIndex]));
        anchor.group.add(holdingGroup);

        try {
            await mindarThree.start();
            renderer.setAnimationLoop(() => {
                renderer.render(scene, camera);
            });
        } catch (e) {
            console.error("Camera access failed", e);
            setArStarted(false);
        }
    };

    const nextModel = () => setModelIndex((prev) => (prev + 1) % MOCK_MODELS.length);
    const prevModel = () => setModelIndex((prev) => (prev - 1 + MOCK_MODELS.length) % MOCK_MODELS.length);

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#0a0a0a' }}>
            
            {/* AR Camera Container */}
            <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, backgroundColor: '#0a0a0a' }}></div>

            {!arStarted && (
                <div style={{ position: 'absolute', top: '20px', left: 0, width: '100%', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h2 className="gradient-text">MindAR Tracker Mode</h2>
                    <p style={{ color: '#ccc', textAlign: 'center', padding: '0 20px' }}>
                        Open <b>https://192.168.x.x:5173/target.png</b> on your laptop screen.<br/>
                        Then click Start and point your phone at the image!
                    </p>
                    <button className="btn btn-primary" onClick={startAR} style={{ padding: '12px 24px', borderRadius: '30px', marginTop: '20px' }}>
                        Start AR Tracker
                    </button>
                    <Link to="/" style={{ color: '#aaa', marginTop: '20px', textDecoration: 'none' }}>Exit to Home</Link>
                </div>
            )}

            {/* Configurator UI Overlay */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                pointerEvents: 'none', zIndex: 50, display: 'flex', flexDirection: 'column', 
                justifyContent: 'flex-end', paddingBottom: '30px', alignItems: 'center'
            }}>
                <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    
                    {/* Material Swatches */}
                    <div style={{ display: 'flex', gap: '15px', background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '30px', backdropFilter: 'blur(5px)' }}>
                        {MATERIALS.map((mat, i) => (
                            <button
                                key={i}
                                onClick={() => setMatIndex(i)}
                                style={{
                                    width: '30px', height: '30px', borderRadius: '50%', background: mat.hexStr,
                                    border: matIndex === i ? '2px solid #fff' : '2px solid transparent',
                                    transition: 'all 0.2s', cursor: 'pointer', padding: 0
                                }}
                            />
                        ))}
                    </div>

                    {/* Model Switcher */}
                    <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '30px', display: 'flex', gap: '20px', alignItems: 'center', backdropFilter: 'blur(5px)' }}>
                        <button onClick={prevModel} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}><FaChevronLeft /></button>
                        <span style={{ color: '#fff', fontWeight: 'bold', minWidth: '180px', textAlign: 'center' }}>{MOCK_MODELS[modelIndex].name}</span>
                        <button onClick={nextModel} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}><FaChevronRight /></button>
                    </div>

                    <div style={{ color: '#ccc', fontSize: '0.8rem', textAlign: 'center', background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '15px' }}>
                        Point camera at Tracker Image to lock Grillz onto it!
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ArExperience;
