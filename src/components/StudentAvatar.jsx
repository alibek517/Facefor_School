import React, { useState, useEffect } from 'react';
import { getStudentPhotoUrls } from '../utils/photoHelper';

export const StudentAvatar = ({ 
  student, 
  effectiveBaseUrl, 
  size = "w-10 h-10",
  className = "",
  rounded = "rounded-xl",
  hidePhoto = false
}) => {
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const { primaryUrl, fallbackUrl } = hidePhoto 
    ? { primaryUrl: null, fallbackUrl: null }
    : getStudentPhotoUrls(student, effectiveBaseUrl);

  useEffect(() => {
    if (hidePhoto) return;
    setHasError(false);
    setUseFallback(false);
  }, [
    student?.id, 
    student?.studentId, 
    student?.faceId, 
    student?.rawEmployeeNo, 
    student?.employeeNo,
    effectiveBaseUrl,
    hidePhoto
  ]);

  const currentSrc = useFallback ? fallbackUrl : primaryUrl;

  const handleError = () => {
    if (!useFallback && fallbackUrl && fallbackUrl !== primaryUrl) {
      setUseFallback(true);
    } else {
      setHasError(true);
    }
  };

  const name = student?.fullName || student?.name || '';
  const initial = name ? name.charAt(0).toUpperCase() : 'O';

  return (
    <div className={`relative ${size} shrink-0 ${rounded} overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs ${className}`}>
      {!hidePhoto && currentSrc && !hasError ? (
        <img
          src={currentSrc}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={handleError}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs select-none">
          {initial}
        </div>
      )}
    </div>
  );
};

export default StudentAvatar;
