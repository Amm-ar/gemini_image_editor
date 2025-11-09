import React from 'react';
import { PhotoIcon } from './icons/PhotoIcon';

interface ImageDisplayProps {
  label: string;
  imageUrl: string | null;
  isLoading?: boolean;
  isDraggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLImageElement>) => void;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ label, imageUrl, isLoading = false, isDraggable = false, onDragStart }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-600 p-4 transition-all duration-300">
      <div className="w-full aspect-square rounded-lg flex items-center justify-center overflow-hidden relative bg-gray-800">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={label} 
            className="object-contain w-full h-full" 
            draggable={isDraggable}
            onDragStart={onDragStart}
          />
        ) : (
          <div className="text-gray-500 text-center flex flex-col items-center">
            <PhotoIcon className="w-16 h-16 mb-2" />
            <span className="font-semibold">{label}</span>
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400"></div>
          </div>
        )}
      </div>
    </div>
  );
};