import React from 'react';

export const IndustryAgentsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M3 21h18" />
    <path d="M5 21V7l8-4 8 4v14" />
    <path d="M9 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  </svg>
);
