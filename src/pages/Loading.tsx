import React from 'react';
import { ClipLoader } from 'react-spinners'; 

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center  z-50">
      <div className="flex flex-col items-center">
        <ClipLoader size={50} color="#30c0f9" />
        <div className="text-xl font-semibold  mt-4">Loading...</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
