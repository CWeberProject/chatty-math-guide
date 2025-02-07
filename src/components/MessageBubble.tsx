
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

const MessageBubble = ({ message, isUser, timestamp }: MessageBubbleProps) => {
  // Function to process text and replace LaTeX expressions with proper components
  const renderContent = (text: string) => {
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math
        const math = part.slice(2, -2);
        return <BlockMath key={index} math={math} />;
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline math
        const math = part.slice(1, -1);
        return <InlineMath key={index} math={math} />;
      } else {
        // Regular markdown
        return (
          <ReactMarkdown
            key={index}
            components={{
              p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
              pre: ({ children }) => <pre className="overflow-auto p-2 bg-black/10 rounded">{children}</pre>,
              code: ({ children }) => <code className="bg-black/10 rounded px-1">{children}</code>,
              a: ({ href, children }) => (
                <a href={href} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {part}
          </ReactMarkdown>
        );
      }
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[80%]`}>
        <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
        <div
          className={`px-4 py-2 rounded-t-lg ${
            isUser
              ? 'bg-primary text-white rounded-bl-lg'
              : 'bg-secondary text-secondary-foreground rounded-br-lg'
          }`}
        >
          <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
            {renderContent(message)}
          </div>
          <p className="text-xs mt-1 opacity-70">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
