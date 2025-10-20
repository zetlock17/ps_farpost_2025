import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const ButtonTest: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button onClick={onClick} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: 'red', color: 'white' }}>
      {children}
    </button>
  );
};
