import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  label?: string;
  description?: string;
}

const ImageUpload = ({ 
  onImageUpload, 
  label = "Drag and drop your image here, or click to select",
  description = "Supports: JPG, PNG, GIF"
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
      }
    }
  }, [onImageUpload, toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageUpload(files[0]);
    }
  };

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed p-8 transition-colors duration-200 ease-in-out
        ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
        accept="image/*"
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        {isDragging ? (
          <ImageIcon className="w-12 h-12 text-primary animate-bounce" />
        ) : (
          <Upload className="w-12 h-12 text-gray-400" />
        )}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {label}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;