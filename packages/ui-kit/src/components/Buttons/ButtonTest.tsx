import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const ButtonTest: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button onClick={onClick} className="px-4 py-2 bg-blue-500 text-white rounded">
      {children}
    </button>
  );
};
