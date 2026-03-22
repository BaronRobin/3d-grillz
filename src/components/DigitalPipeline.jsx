import React from 'react';
import './DigitalPipeline.css';

/**
 * DigitalPipeline Component displaying the 8 steps of the full-service workflow.
 * Features hover-activated descriptions over looping background videos.
 */
const DigitalPipeline = () => {
    const pipelineSteps = [
        {
            number: '01', title: 'Request',
            description: 'Initiate your custom grillz journey directly from our digital shop. No physical meetups required.',
            videoSrc: '/assets/pipeline-placeholder.mp4'
        },
        {
            number: '02', title: 'Consultation',
            description: 'Get in direct, 1-on-1 contact with designer Robin Baron to discuss your exact vision, material, and fit.',
            videoSrc: '/assets/pipeline-placeholder.mp4'
        },
        {
            number: '03', title: 'Imprint & Scan',
            description: 'Provide a standard physical teeth imprint mold, or send over a high-fidelity 3D intraoral scan.',
            videoSrc: '/assets/pipeline-placeholder.mp4'
        },
        {
            number: '04', title: '3D Design',
            description: 'We meticulously sculpt and design your custom idea into a photorealistic 3D printable model.',
            videoSrc: '/assets/pipeline-placeholder.mp4'
        },
        {
            number: '05', title: 'Dashboard',
            description: 'Log in to your exclusive client dashboard to review live design progress and interactive 3D variants.',
            videoSrc: '/assets/pipeline-placeholder.mp4'
        },
        {
            number: '06', title: 'Checkout',
            description: 'Approve your final chosen 3D design variant and securely process your payment online.',
            videoSrc: '/assets/pipeline-placeholder.mp4'
        },
        {
            number: '07', title: 'Craftsmanship',
            description: 'The raw casting is meticulously hand-finished and polished. Premium stones are bead-set under microscope.',
            videoSrc: '/assets/pipeline-placeholder.mp4'
        },
        {
            number: '08', title: 'Shipping',
            description: 'Your finished custom masterpiece is securely packaged and shipped fully insured, directly to your door.',
            videoSrc: '/assets/pipeline-placeholder.mp4'
        }
    ];

    return (
        <section className="digital-pipeline section" id="pipeline">
            <div className="container">
                <div className="section-header fade-in-up">
                    <h2 style={{ fontSize: '3.5rem', marginBottom: '10px' }}>The 0-100 Pipeline</h2>
                    <p className="section-subtitle" style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
                        A completely seamless digital workflow from initial request to final sparkle. Hover over any step to explore.
                    </p>
                </div>

                <div className="pipeline-grid">
                    {pipelineSteps.map((step, index) => (
                        <div
                            key={step.number}
                            className={`pipeline-card fade-in-up stagger-${index + 1}`}
                        >
                            <video 
                                className="pipeline-video" 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                src={step.videoSrc}
                            ></video>
                            
                            <div className="pipeline-overlay"></div>

                            <div className="step-content">
                                <div className="step-header">
                                    <span className="step-number gradient-text">{step.number}</span>
                                    <h3 className="step-title">{step.title}</h3>
                                </div>
                                <div className="step-body">
                                    <p className="step-description">{step.description}</p>
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
