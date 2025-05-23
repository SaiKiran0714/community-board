import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false, text = 'Loading...' }) => {
  const spinner = (
    <div style={{
      display: 'inline-block',
      width: '24px',
      height: '24px',
      border: '3px solid rgba(232, 225, 213, 0.3)',
      borderRadius: '50%',
      borderTopColor: '#3b82f6',
      animation: 'spin 1s linear infinite'
    }}>
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(253, 251, 247, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(2px)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          {spinner}
          <span style={{
            color: '#666666',
            fontSize: '14px'
          }}>
            {text}
          </span>
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner; 