const LoadingSpinner = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`${sizeClasses[size]} border-4 border-gray-300 border-t-primary-600 rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default LoadingSpinner; 

// It tells users the app is "thinking" (checking tokens or fetching data) so they don't think it's frozen.