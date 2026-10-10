import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

export const StudentAvatar = ({ student, effectiveBaseUrl, size = "w-10 h-10" }) => {
  const [hasError, setHasError] = useState(false);
  const cleanId = String(student?.rawEmployeeNo || student?.studentId || student?.faceId || student?.id || '').replace(/^s-/, '');
  const paddedId = cleanId ? cleanId.padStart(8, '0') : '';
  const photoSrc = effectiveBaseUrl && cleanId ? `${effectiveBaseUrl}/api/device/photo/${paddedId || cleanId}` : null;

  useEffect(() => {
    setHasError(false);
  }, [cleanId, effectiveBaseUrl]);

  return (
    <div className={`relative ${size} shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs`}>
      {photoSrc && !hasError ? (
        <img
          src={photoSrc}
          alt={student?.fullName || student?.name || ''}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs">
          {(student?.fullName || student?.name || 'O').charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default StudentAvatar;
