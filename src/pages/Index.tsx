import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import ImagePreview from '@/components/ImagePreview';
import ChatInterface from '@/components/ChatInterface';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCurrentImage(e.target.result as string);
        toast({
          title: "Image uploaded successfully",
          description: "You can now start asking questions about your exercise.",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = (message: string) => {
    // This will be handled by the backend
    console.log('Message sent:', message);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Math Tutor</h1>
          <p className="text-lg text-gray-600">
            Upload your math problem and get step-by-step guidance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Upload Exercise</h2>
              {currentImage ? (
                <ImagePreview
                  imageUrl={currentImage}
                  onRemove={() => setCurrentImage(null)}
                />
              ) : (
                <ImageUpload onImageUpload={handleImageUpload} />
              )}
            </div>
          </div>

          <div>
            <ChatInterface onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;