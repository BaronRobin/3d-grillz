import React, { useEffect } from 'react';
import DigitalPipeline from '../components/DigitalPipeline';
import BehindTheDesign from '../components/BehindTheDesign';

const Process = () => {
    // Ensure we scroll to top on page transition
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="page-container" style={{ paddingTop: '80px', position: 'relative', minHeight: '100vh' }}>
            {/* Background Video for Process Page */}
            <div className="process-bg-video-wrapper" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                opacity: 0.3
            }}>
                {/* <video autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                    <source src="/assets/process-loop.webm" type="video/webm" />
                </video> */}
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #000, #222)' }}></div>
            </div>

            <DigitalPipeline />
            <BehindTheDesign />
        </div>
    );
};

export default Process;
