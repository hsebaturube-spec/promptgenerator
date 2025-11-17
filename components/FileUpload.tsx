import React, { useState, useCallback, useRef } from 'react';

interface FileUploadProps {
  label: string;
  onFileChange: (base64: string | null) => void;
  currentPreview: string | null;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, onFileChange, currentPreview, className = '' }) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = useCallback((event: ProgressEvent<FileReader>) => {
    const result = event.target?.result as string;
    if (result) {
      // Extract base64 part (remove "data:image/jpeg;base64," prefix if present)
      const base64Data = result.split(',')[1] || result;
      onFileChange(base64Data);
      setError(null);
    }
  }, [onFileChange]);

  const handleFileError = useCallback(() => {
    setError('Failed to read file.');
    onFileChange(null);
  }, [onFileChange]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900');
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900');
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900');
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [onFileChange]);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      onFileChange(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB.');
      onFileChange(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = handleFileRead;
    reader.onerror = handleFileError;
    reader.readAsDataURL(file);
  }, [handleFileRead, handleFileError, onFileChange]);


  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      processFile(event.target.files[0]);
    } else {
      onFileChange(null);
    }
  }, [onFileChange, processFile]);

  const handleClear = useCallback(() => {
    onFileChange(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFileChange]);

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{label}</label>
      <div
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-1 text-center">
          {currentPreview ? (
            <img src={`data:image/png;base64,${currentPreview}`} alt="Preview" className="mx-auto h-32 w-auto object-contain rounded-md" />
          ) : (
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-4V20m0 0v-8a4 4 0 00-4-4H12a4 4 0 00-4 4v20a4 4 0 004 4h16"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <div className="flex text-sm text-gray-600 dark:text-gray-300">
            <label
              htmlFor={`${label}-file-upload`}
              className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <span>Upload a file</span>
              <input
                id={`${label}-file-upload`}
                ref={fileInputRef}
                name="file-upload"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleChange}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
          {currentPreview && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FileUpload;