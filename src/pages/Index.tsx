import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import ImagePreview from '@/components/ImagePreview';
import ChatInterface from '@/components/ChatInterface';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [problemImage, setProblemImage] = useState<string | null>(null);
  const [workImage, setWorkImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleProblemImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setProblemImage(e.target.result as string);
        toast({
          title: "Problem image uploaded successfully",
          description: "You can now start asking questions about your exercise.",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleWorkImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setWorkImage(e.target.result as string);
        toast({
          title: "Work progress image uploaded successfully",
          description: "Share where you're stuck and I'll help guide you.",
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
              <h2 className="text-xl font-semibold mb-4">Problem Statement</h2>
              {problemImage ? (
                <ImagePreview
                  imageUrl={problemImage}
                  onRemove={() => setProblemImage(null)}
                />
              ) : (
                <ImageUpload 
                  onImageUpload={handleProblemImageUpload}
                  label="Upload your problem statement"
                  description="Share the math problem you need help with"
                />
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Your Work</h2>
              {workImage ? (
                <ImagePreview
                  imageUrl={workImage}
                  onRemove={() => setWorkImage(null)}
                />
              ) : (
                <ImageUpload 
                  onImageUpload={handleWorkImageUpload}
                  label="Upload your current work"
                  description="Share where you're stuck and need guidance"
                />
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