import React, { useState, useCallback, useEffect } from 'react';
import { generateImagePrompt, generateImage } from './services/geminiService';
import Button from './components/Button';
import FileUpload from './components/FileUpload';
import SelectInput from './components/SelectInput';
import { CharacterPosition, ImageAspectRatio, ImageStyle } from './types';
import { CHARACTER_POSITION_OPTIONS, IMAGE_ASPECT_RATIO_OPTIONS, IMAGE_STYLE_OPTIONS, PLACEHOLDER_IMAGE_URL } from './constants';

const App: React.FC = () => {
  const [contentIdea, setContentIdea] = useState<string>('');
  const [characterImageBase64, setCharacterImageBase64] = useState<string | null>(null);
  const [faceImageBase64, setFaceImageBase64] = useState<string | null>(null);
  const [selectedImageAspectRatio, setSelectedImageAspectRatio] = useState<ImageAspectRatio>(ImageAspectRatio.SIXTEEN_TO_NINE);
  const [selectedImageStyle, setSelectedImageStyle] = useState<ImageStyle>(ImageStyle.REALISTIC);
  const [selectedCharacterPosition, setSelectedCharacterPosition] = useState<CharacterPosition>(CharacterPosition.STANDING);

  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [generatedImageURL, setGeneratedImageURL] = useState<string | null>(null);

  const [loadingPrompt, setLoadingPrompt] = useState<boolean>(false);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState<boolean>(false);

  const [isSidePageOpen, setIsSidePageOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Apply dark mode class to HTML body
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleSidePage = useCallback(() => {
    setIsSidePageOpen((prev) => !prev);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const handleGeneratePrompt = useCallback(async () => {
    setError(null);
    setLoadingPrompt(true);
    setGeneratedPrompt('');
    setGeneratedImageURL(null); // Clear previous image when generating new prompt
    setShowCopiedMessage(false); // Hide copied message
    try {
      const prompt = await generateImagePrompt(
        contentIdea,
        characterImageBase64,
        faceImageBase64,
        selectedImageStyle,
        selectedCharacterPosition,
        selectedImageAspectRatio
      );
      setGeneratedPrompt(prompt);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate prompt.');
    } finally {
      setLoadingPrompt(false);
    }
  }, [
    contentIdea,
    characterImageBase64,
    faceImageBase64,
    selectedImageStyle,
    selectedCharacterPosition,
    selectedImageAspectRatio
  ]);

  const handleGenerateImage = useCallback(async () => {
    if (!generatedPrompt) {
      setError('Please generate a prompt first.');
      return;
    }
    setError(null);
    setLoadingImage(true);
    setGeneratedImageURL(null);
    try {
      const imageUrl = await generateImage(generatedPrompt, selectedImageAspectRatio);
      setGeneratedImageURL(imageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate image.');
    } finally {
      setLoadingImage(false);
    }
  }, [generatedPrompt, selectedImageAspectRatio]);

  const handleDownloadImage = useCallback(() => {
    if (generatedImageURL) {
      const link = document.createElement('a');
      link.href = generatedImageURL;
      link.download = `gemini_generated_image_${Date.now()}.jpeg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [generatedImageURL]);

  const handleCopyPrompt = useCallback(async () => {
    if (generatedPrompt) {
      try {
        await navigator.clipboard.writeText(generatedPrompt);
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 2000); // Hide after 2 seconds
      } catch (err) {
        console.error('Failed to copy prompt: ', err);
        setError('Failed to copy prompt to clipboard.');
      }
    }
  }, [generatedPrompt]);

  const isFormValid = contentIdea.trim().length > 0;

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-blue-700 dark:bg-gray-900 text-white h-16 flex items-center justify-between px-4 shadow-md">
        <button onClick={toggleSidePage} className="p-2 rounded-md hover:bg-blue-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" aria-label="Open side menu">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Prompt generator</h1>
        <button onClick={toggleDarkMode} className="p-2 rounded-md hover:bg-blue-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" aria-label="Toggle dark mode">
          {isDarkMode ? (
            <img src="https://i.ibb.co.com/zWBRYYmp/night-mode.png" alt="night-mode" className="h-6 w-6" />
          ) : (
            <img src="https://i.ibb.co.com/39GY5KPw/day-mode.png" alt="day-mode" className="h-6 w-6" />
          )}
        </button>
      </header>

      {/* Side Page Overlay */}
      {isSidePageOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidePage}
          aria-label="Close side menu"
        ></div>
      )}

      {/* Side Page Content */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white dark:bg-gray-800 shadow-xl z-50 transform ${
          isSidePageOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-menu-title"
      >
        <div className="p-4 pt-16"> {/* Add padding-top for fixed header */}
          <h2 id="side-menu-title" className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Menu</h2>
          <nav>
            <ul className="space-y-2">
              <li>
                <a href="#" className="block p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="block p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="block p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  Settings
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto p-4 md:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl mt-16 z-10 w-full max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 dark:text-gray-100 mb-8">
          Gemini Image Content Generator
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Input Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">1. Content Details</h2>
            <div>
              <label htmlFor="contentIdea" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Content Idea / Prompt Start
              </label>
              <textarea
                id="contentIdea"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
                rows={4}
                value={contentIdea}
                onChange={(e) => setContentIdea(e.target.value)}
                placeholder="Describe your content idea, e.g., 'A futuristic city at sunset with flying cars.'"
              ></textarea>
            </div>

            <FileUpload
              label="Upload Character Photo (Optional)"
              onFileChange={setCharacterImageBase64}
              currentPreview={characterImageBase64}
            />

            <FileUpload
              label="Upload Face Photo (Optional)"
              onFileChange={setFaceImageBase64}
              currentPreview={faceImageBase64}
            />
          </div>

          {/* Options Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">2. Image Preferences</h2>
            <SelectInput
              label="Image Style"
              options={IMAGE_STYLE_OPTIONS}
              value={selectedImageStyle}
              onChange={(e) => setSelectedImageStyle(e.target.value as ImageStyle)}
              className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            />

            <SelectInput
              label="Character Position"
              options={CHARACTER_POSITION_OPTIONS}
              value={selectedCharacterPosition}
              onChange={(e) => setSelectedCharacterPosition(e.target.value as CharacterPosition)}
              className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            />

            <SelectInput
              label="Image Aspect Ratio"
              options={IMAGE_ASPECT_RATIO_OPTIONS}
              value={selectedImageAspectRatio}
              onChange={(e) => setSelectedImageAspectRatio(e.target.value as ImageAspectRatio)}
              className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            />

            <Button
              onClick={handleGeneratePrompt}
              loading={loadingPrompt}
              disabled={!isFormValid}
              className="w-full"
            >
              Generate Detailed Prompt
            </Button>
          </div>
        </div>

        {/* Generated Prompt Section */}
        {generatedPrompt && (
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-inner">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-3">3. Generated Prompt</h2>
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed flex-grow">{generatedPrompt}</p>
              <button
                onClick={handleCopyPrompt}
                className="ml-4 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-shrink-0"
                aria-label="Copy prompt to clipboard"
              >
                {showCopiedMessage ? (
                  <span className="text-green-600 dark:text-green-400">Copied!</span>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
              </button>
            </div>
            <Button
              onClick={handleGenerateImage}
              loading={loadingImage}
              disabled={!generatedPrompt}
              className="mt-6 w-full md:w-auto"
            >
              Generate Image
            </Button>
          </div>
        )}

        {/* Generated Image Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">4. Generated Image</h2>
          <div className="w-full h-auto max-h-[600px] overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center p-2 shadow-lg">
            {loadingImage ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500 dark:text-gray-400">
                <svg className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Generating your masterpiece...</p>
              </div>
            ) : generatedImageURL ? (
              <div>
                <img
                  src={generatedImageURL}
                  alt="Generated Content"
                  className="max-w-full max-h-full object-contain rounded-md mb-4"
                />
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 space-y-1">
                  <p><strong>Aspect Ratio:</strong> {selectedImageAspectRatio}</p>
                  <p><strong>Style:</strong> {selectedImageStyle}</p>
                  <p><strong>Character Position:</strong> {selectedCharacterPosition}</p>
                </div>
              </div>
            ) : (
              <img
                src={PLACEHOLDER_IMAGE_URL}
                alt="Placeholder"
                className="max-w-full max-h-full object-contain rounded-md opacity-70"
              />
            )}
          </div>
          {generatedImageURL && (
            <Button
              onClick={handleDownloadImage}
              className="mt-6 w-full md:w-auto"
              variant="secondary"
            >
              Download Image
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;