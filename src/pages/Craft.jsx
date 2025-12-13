import React, { useEffect } from 'react';
import Craftsmanship from '../components/Craftsmanship';
import ARVisualization from '../components/ARVisualization';

const Craft = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="page-container" style={{ paddingTop: '80px' }}>
            <Craftsmanship />
            <ARVisualization />
        </div>
    );
};

export default Craft;
