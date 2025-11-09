import React, { useState, useCallback, useEffect } from 'react';
import { editImageWithPrompt, QuotaError } from './services/geminiService';
import { fileToGenerativePart, dataUrlToFile } from './utils/fileUtils';
import { useTheme } from './hooks/useTheme';
import { ImageDisplay } from './components/ImageDisplay';
import { PhotoIcon } from './components/icons/PhotoIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { EditAgainIcon } from './components/icons/EditAgainIcon';
import { SunIcon } from './components/icons/SunIcon';
import { MoonIcon } from './components/icons/MoonIcon';

const App: React.FC = () => {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const processNewImageFile = useCallback((file: File) => {
    setOriginalImageFile(file);
    setEditedImage(null);
    setError(null);
    setCountdown(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processNewImageFile(file);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!originalImageFile || !prompt.trim()) {
      setError("Please upload an image and enter a prompt.");
      return;
    }

    if (countdown !== null) return;

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const imageData = await fileToGenerativePart(originalImageFile);
      const generatedImageUrl = await editImageWithPrompt(imageData, prompt);
      setEditedImage(generatedImageUrl);
      setIsLoading(false);
    } catch (err) {
      if (err instanceof QuotaError) {
        const retrySeconds = err.retryAfter > 0 ? err.retryAfter : 60;
        setError(`Quota limit reached. Retrying in ${retrySeconds} seconds...`);
        setCountdown(retrySeconds);
      } else if (err instanceof Error) {
        setError(err.message);
        setIsLoading(false);
      } else {
        setError("An unknown error occurred.");
        setIsLoading(false);
      }
    }
  }, [originalImageFile, prompt, countdown]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown <= 0) {
      setCountdown(null);
      setError(null);
      handleGenerate();
      return;
    }

    const timerId = setTimeout(() => {
      const newTime = countdown - 1;
      setCountdown(newTime);
      setError(`Quota limit reached. Retrying in ${newTime} seconds...`);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [countdown, handleGenerate]);

  const handleDownload = () => {
    if (!editedImage || !originalImageFile) return;

    const link = document.createElement('a');
    link.href = editedImage;

    const originalName = originalImageFile.name;
    const nameWithoutExtension = originalName.lastIndexOf('.') > 0
      ? originalName.substring(0, originalName.lastIndexOf('.'))
      : originalName;

    const now = new Date();
    const timestamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('') + '_' + [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0')
    ].join('');

    const mimeType = editedImage.split(';')[0].split(':')[1];
    const extension = mimeType ? mimeType.split('/')[1] : 'png';

    link.download = `${nameWithoutExtension}_edited_${timestamp}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleEditAgain = useCallback(async () => {
    if (!editedImage) return;
    
    const originalName = originalImageFile?.name ?? 'edited_image';
    const nameWithoutExtension = originalName.lastIndexOf('.') > 0
      ? originalName.substring(0, originalName.lastIndexOf('.'))
      : originalName;
    
    const newFileName = `${nameWithoutExtension}_re-edit.png`;

    const file = await dataUrlToFile(editedImage, newFileName);
    processNewImageFile(file);

  }, [editedImage, originalImageFile, processNewImageFile]);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      processNewImageFile(event.dataTransfer.files[0]);
      return;
    }

    const dataUrl = event.dataTransfer.getData('text/plain');
    if (dataUrl && dataUrl.startsWith('data:image')) {
      await handleEditAgain();
    }
  }, [processNewImageFile, handleEditAgain]);

  const handleDragStart = (event: React.DragEvent<HTMLImageElement>) => {
    if (editedImage) {
      event.dataTransfer.setData('text/plain', editedImage);
    }
  };

  const examplePrompts = [
    "Add a retro, vintage filter",
    "Make the image black and white",
    "Change the background to a sunny beach",
    "Give the main subject a superhero cape",
    "Remove the person in the background"
  ];

  const handleExamplePromptClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="container mx-auto max-w-7xl">
        <header className="relative text-center mb-8">
            <button onClick={toggleTheme} className="absolute top-0 right-0 p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors" aria-label="Toggle theme">
                {theme === 'light' ? <MoonIcon className="w-6 h-6 text-gray-800" /> : <SunIcon className="w-6 h-6 text-yellow-400" />}
            </button>
          <div className="flex items-center justify-center gap-4 mb-2 pt-12 sm:pt-0">
             <SparklesIcon className="w-10 h-10 text-green-500" />
             <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500">
              Online AI Image Editor
            </h1>
          </div>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Edit your photos with simple text instructions using Gemini.
          </p>
        </header>

        <main className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-green-600 dark:text-green-400">1. Upload Image</h2>
              <label 
                htmlFor="image-upload" 
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                onDragLeave={() => setIsDraggingOver(false)}
                className={`cursor-pointer w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed ${isDraggingOver ? 'border-green-400' : 'border-gray-300 dark:border-gray-600'} hover:border-green-400 transition-all flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400`}
              >
                {originalImagePreview ? (
                  <img src={originalImagePreview} alt="Original" className="object-contain h-full w-full p-2" />
                ) : (
                  <>
                    <PhotoIcon className="w-12 h-12 mb-2" />
                    <span>Click or drag to upload</span>
                  </>
                )}
              </label>
              <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-green-600 dark:text-green-400">2. Describe Your Edit</h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Add a retro filter"
                className="w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all resize-none text-gray-800 dark:text-gray-100"
                rows={3}
                disabled={!originalImageFile || isLoading}
              />
              <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Or try an example:</p>
                  <div className="flex flex-wrap gap-2">
                      {examplePrompts.map((p) => (
                           <button key={p} onClick={() => handleExamplePromptClick(p)} disabled={!originalImageFile || isLoading} className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-green-600/20 dark:hover:bg-green-600/50 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full transition-colors">
                               {p}
                           </button>
                      ))}
                  </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!originalImageFile || !prompt.trim() || isLoading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {countdown !== null ? `Retrying (${countdown}s)` : `Generating...`}
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6" />
                  Generate Image
                </>
              )}
            </button>
            {error && <p className="text-red-500 dark:text-red-400 text-center mt-2 break-words">{error}</p>}
          </div>

          <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-center text-gray-500 dark:text-gray-400">Original</h2>
                <ImageDisplay label="Original" imageUrl={originalImagePreview} />
            </div>
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-center text-gray-500 dark:text-gray-400">Edited</h2>
                 <ImageDisplay 
                    label="Edited" 
                    imageUrl={editedImage} 
                    isLoading={isLoading}
                    isDraggable={!!editedImage}
                    onDragStart={handleDragStart}
                  />
                 {editedImage && !isLoading && (
                   <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <button
                          onClick={handleEditAgain}
                          className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105"
                      >
                          <EditAgainIcon className="w-5 h-5" />
                          Edit Again
                      </button>
                      <button
                          onClick={handleDownload}
                          className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105"
                      >
                          <DownloadIcon className="w-5 h-5" />
                          Download Image
                      </button>
                   </div>
                 )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
