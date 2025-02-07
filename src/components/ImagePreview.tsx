import { X } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
}

const ImagePreview = ({ imageUrl, onRemove }: ImagePreviewProps) => {
  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg animate-fade-in">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
      >
        <X className="w-4 h-4 text-white" />
      </button>
      <img
        src={imageUrl}
        alt="Preview"
        className="w-full h-auto max-h-[300px] object-contain"
      />
    </div>
  );
};

export default ImagePreview;