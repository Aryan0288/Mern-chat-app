import React, { useEffect } from 'react';
import Typed from 'typed.js';

const TypedText = () => {
  useEffect(() => {
    const typeData = new Typed(".role", {
      strings: [
        "World Best Chat-App",
        "Great Experience",
        "5 Star Rating ",
        "Explore Globally",
        "Make Healthy Connection",
      ],
      loop: true,
      typeSpeed: 100,
      backSpeed: 150,
      backDelay: 1300,
    });

    // Clean up the Typed instance on component unmount
    return () => {
      typeData.destroy();
    };
  }, []); // Empty dependency array ensures this effect runs only once after the initial render

  return (
    <div>
      <span className="role"></span>
    </div>
  );
};

export default TypedText;
