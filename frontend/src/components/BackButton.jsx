import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ href = '/' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (href === '/') {
      navigate('/');
    } else {
      navigate(href);
    }
  };

    return (
    <button
      onClick={handleClick}
      className="absolute top-4 left-4 p-2 rounded-full hover:bg-surface-container-high transition"
      aria-label="Retour"
    >
      <img
        src={'/icons/arrow_back.svg'}
        alt="back"
        className="w-6 h-6 invert-50"
      />
    </button>
  );
};

export default BackButton;
