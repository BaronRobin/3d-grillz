import React, { useEffect } from 'react';
import AboutMe from '../components/AboutMe';

const About = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="page-container" style={{ paddingTop: '80px' }}>
            <AboutMe />
        </div>
    );
};

export default About;
