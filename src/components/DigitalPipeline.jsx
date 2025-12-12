import React from 'react';
import './DigitalPipeline.css';
import { FaTooth, FaCube, FaLayerGroup, FaGem, FaMobileAlt } from 'react-icons/fa';

const DigitalPipeline = () => {
    const pipelineSteps = [
        {
            number: '01',
            title: '3D Scanning',
            description: 'High-resolution intraoral scanning captures precise dental geometry with sub-millimeter accuracy using iTero or Medit i700 systems.',
            tech: ['Structured Light', 'Laser Triangulation', 'STL Export'],
            icon: <FaTooth />
        },
        {
            number: '02',
            title: 'Digital Modeling',
            description: 'Procedural design and sculpting in Blender and Houdini transform anatomical data into artistic wearable forms.',
            tech: ['Blender', 'Houdini', 'Parametric Design'],
            icon: <FaCube />
        },
        {
            number: '03',
            title: 'Fabrication',
            description: 'Additive manufacturing through SLA printing or direct metal laser sintering brings digital designs into physical reality.',
            tech: ['SLA Printing', 'DMLS', 'Investment Casting'],
            icon: <FaLayerGroup />
        },
        {
            number: '04',
            title: 'AR Visualization',
            description: 'Unreal Engine and ARKit enable real-time preview with photorealistic materials and spatial tracking for immersive visualization.',
            tech: ['Unreal Engine', 'ARKit', 'PBR Materials'],
            icon: <FaMobileAlt />
        },
        {
            number: '05',
            title: 'Hand Finishing',
            description: 'The raw casting is hand-polished, stones are bead-set under microscope, and final fit is verified manually.',
            tech: ['Polishing', 'Stone Setting', 'Quality Control'],
            icon: <FaGem />
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
                            className={`pipeline-step glass-dark hover-lift fade-in-up stagger-${index + 1}`}
                        >
                            <div className="step-number gradient-text">{step.number}</div>
                            <div className="step-content">
                                <div className="step-icon-wrapper">
                                    {step.icon}
                                </div>
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                                <div className="tech-tags">
                                    {step.tech.map((tech, i) => (
                                        <span key={i} className="tech-tag">{tech}</span>
                                    ))}
                                </div>
                            </div>
                            {index < pipelineSteps.length - 1 && (
                                <div className="pipeline-connector"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DigitalPipeline;
