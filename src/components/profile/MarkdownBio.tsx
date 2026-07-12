import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownBioProps {
  content: string;
  className?: string;
  maxLength?: number;
}

export const MarkdownBio: React.FC<MarkdownBioProps> = ({
  content,
  className = '',
  maxLength = 500
}) => {
  const isRTL = /[\u0600-\u06FF]/.test(content);
  
  // Truncate content if needed
  const displayContent = content.length > maxLength 
    ? content.substring(0, maxLength) + '...'
    : content;

  return (
    <div 
      className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize link styling
          a: ({ node, ...props }) => (
            <a 
              {...props} 
              className="text-primary hover:text-primary/80 underline decoration-primary/50 hover:decoration-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          // Customize paragraph spacing
          p: ({ node, ...props }) => (
            <p {...props} className="mb-2 last:mb-0" />
          ),
          // Customize emphasis
          strong: ({ node, ...props }) => (
            <strong {...props} className="font-semibold text-foreground" />
          ),
          em: ({ node, ...props }) => (
            <em {...props} className="italic text-muted-foreground" />
          ),
          // Customize lists
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc list-inside space-y-1" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal list-inside space-y-1" />
          ),
          // Remove h1-h6 to prevent large headings in bio
          h1: ({ node, ...props }) => (
            <div {...props} className="font-semibold text-base mb-2" />
          ),
          h2: ({ node, ...props }) => (
            <div {...props} className="font-semibold text-base mb-2" />
          ),
          h3: ({ node, ...props }) => (
            <div {...props} className="font-medium text-sm mb-1" />
          ),
          h4: ({ node, ...props }) => (
            <div {...props} className="font-medium text-sm mb-1" />
          ),
          h5: ({ node, ...props }) => (
            <div {...props} className="font-medium text-sm mb-1" />
          ),
          h6: ({ node, ...props }) => (
            <div {...props} className="font-medium text-sm mb-1" />
          ),
          // Disable images for security
          img: () => null,
          // Disable code blocks
          code: ({ node, ...props }: any) => {
            const isInline = !props.className?.includes('language-');
            return isInline ? (
              <code {...props} className="bg-muted px-1 py-0.5 rounded text-sm font-mono" />
            ) : (
              <code {...props} className="bg-muted px-2 py-1 rounded text-sm font-mono block" />
            );
          },
          pre: ({ node, ...props }) => (
            <pre {...props} className="bg-muted p-2 rounded text-sm font-mono overflow-x-auto" />
          )
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
};