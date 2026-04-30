import React from 'react';

const Skeleton = ({ className = '', lines = 1 }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-neutral-200 rounded mb-2 last:mb-0"></div>
      ))}
    </div>
  );
};

export default Skeleton;