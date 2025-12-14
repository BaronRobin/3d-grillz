import React from 'react';
import './DigitalPipeline.css';
// Icons removed as requested

const DigitalPipeline = () => {
    const pipelineSteps = [
        {
            number: '01',
            title: '3D Scanning',
            description: 'High-Fidelity Intraoral Scanners capture dental geometry with sub-millimeter precision, creating a perfect digital impression.',
            tech: ['Structured Light', 'Laser Triangulation', 'STL Export']
        },
        {
            number: '02',
            title: 'Digital Modeling',
            description: 'Procedural design and sculpting in Blender and Houdini transform anatomical data into artistic wearable forms.',
            tech: ['Blender', 'Houdini', 'Parametric Design']
        },
        {
            number: '03',
            title: 'Fabrication',
            description: 'Additive manufacturing through SLA printing or direct metal laser sintering brings digital designs into physical reality.',
            tech: ['SLA Printing', 'DMLS', 'Investment Casting']
        },
        {
            number: '04',
            title: 'AR Visualization',
            description: 'Unreal Engine and ARKit enable real-time preview with photorealistic materials and spatial tracking for immersive visualization.',
            tech: ['Unreal Engine', 'ARKit', 'PBR Materials']
        },
        {
            number: '05',
            title: 'Hand Finishing',
            description: 'The raw casting is hand-polished, stones are bead-set under microscope, and final fit is verified manually.',
            tech: ['Polishing', 'Stone Setting', 'Quality Control']
        }
    ];

    return (
        <section className="digital-pipeline section" id="pipeline">
            <div className="container">
                <div className="section-header fade-in-up">
                    <h2>The Digital Pipeline</h2>
                    <p className="section-subtitle">
                        A seamless workflow from scan to sparkle
                    </p>
                </div>

                <div className="pipeline-timeline">
                    {pipelineSteps.map((step, index) => (
                        <div
                            key={step.number}
                            className={`pipeline-step glass-dark fade-in-up stagger-${index + 1}`}
                        >
                            <div className="step-number gradient-text">{step.number}</div>
                            <div className="step-content">
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                                <div className="tech-tags">
                                    {step.tech.map((tech, i) => (
                                        <span key={i} className="tech-tag">{tech}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DigitalPipeline;
