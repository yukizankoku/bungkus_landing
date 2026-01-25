import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  Quote,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

// Configure DOMPurify with allowed tags for rich text editing
const ALLOWED_TAGS = ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'blockquote', 'a', 'br', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td'];
const ALLOWED_ATTR = ['href', 'target', 'rel'];

const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className, minHeight = "300px" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const lastValueRef = useRef(value);
  const isInternalChangeRef = useRef(false);

  // Only update DOM from props when content changed externally (e.g., AI translate)
  useEffect(() => {
    if (editorRef.current && !isInternalChangeRef.current) {
      // Only update if value actually changed from outside
      if (value !== lastValueRef.current) {
        editorRef.current.innerHTML = value;
        lastValueRef.current = value;
      }
    }
    isInternalChangeRef.current = false;
  }, [value]);

  // Set initial content on mount
  useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
      lastValueRef.current = value;
    }
  }, []);

  const execCommand = useCallback((command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    editorRef.current?.focus();
    
    // Update the value after command execution with sanitization
    setTimeout(() => {
      if (editorRef.current) {
        const sanitized = sanitizeHtml(editorRef.current.innerHTML);
        isInternalChangeRef.current = true;
        lastValueRef.current = sanitized;
        onChange(sanitized);
      }
    }, 0);
  }, [onChange]);

  const formatBlock = useCallback((tag: string) => {
    document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
    
    setTimeout(() => {
      if (editorRef.current) {
        const sanitized = sanitizeHtml(editorRef.current.innerHTML);
        isInternalChangeRef.current = true;
        lastValueRef.current = sanitized;
        onChange(sanitized);
      }
    }, 0);
  }, [onChange]);

  // Sanitize HTML before storing to prevent XSS attacks
  const handleInput = () => {
    if (editorRef.current) {
      const sanitized = sanitizeHtml(editorRef.current.innerHTML);
      isInternalChangeRef.current = true;
      lastValueRef.current = sanitized;
      onChange(sanitized);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // CRITICAL: Stop propagation to prevent dnd-kit KeyboardSensor from hijacking the event
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation?.();
      
      if (e.shiftKey) {
        // Shift+Enter = line break within same block
        e.preventDefault();
        document.execCommand('insertLineBreak', false);
      } else {
        // Enter = new paragraph
        e.preventDefault();
        document.execCommand('insertParagraph', false);
      }
      // Update value after key action
      setTimeout(() => {
        if (editorRef.current) {
          const sanitized = sanitizeHtml(editorRef.current.innerHTML);
          isInternalChangeRef.current = true;
          lastValueRef.current = sanitized;
          onChange(sanitized);
        }
      }, 0);
    }
  };

  const toolbarButtons = [
    { icon: Heading1, action: () => formatBlock('h1'), tooltip: 'Heading 1' },
    { icon: Heading2, action: () => formatBlock('h2'), tooltip: 'Heading 2' },
    { icon: Heading3, action: () => formatBlock('h3'), tooltip: 'Heading 3' },
    { type: 'separator' },
    { icon: Bold, action: () => execCommand('bold'), tooltip: 'Bold' },
    { icon: Italic, action: () => execCommand('italic'), tooltip: 'Italic' },
    { icon: Underline, action: () => execCommand('underline'), tooltip: 'Underline' },
    { type: 'separator' },
    { icon: List, action: () => execCommand('insertUnorderedList'), tooltip: 'Bullet List' },
    { icon: ListOrdered, action: () => execCommand('insertOrderedList'), tooltip: 'Numbered List' },
    { type: 'separator' },
    { icon: Quote, action: () => formatBlock('blockquote'), tooltip: 'Quote' },
    { 
      icon: LinkIcon, 
      action: () => {
        const url = prompt('Enter URL:');
        if (url) execCommand('createLink', url);
      }, 
      tooltip: 'Insert Link' 
    },
  ];

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 border-b border-border">
        {toolbarButtons.map((button, index) => {
          if (button.type === 'separator') {
            return <div key={index} className="w-px h-6 bg-border mx-1" />;
          }
          const Icon = button.icon!;
          return (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={button.action}
              title={button.tooltip}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "p-4 focus:outline-none prose prose-sm max-w-none rich-text-editor",
          "prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground",
          "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
          "prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground",
          "prose-a:text-primary",
          !value && !isFocused && "text-muted-foreground"
        )}
        style={{ minHeight }}
        data-placeholder={placeholder}
      />
      
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        
        /* H1: Largest, with primary accent border */
        .rich-text-editor h1 {
          font-size: 1.875rem !important;
          font-weight: 700 !important;
          border-left: 4px solid hsl(var(--primary)) !important;
          padding-left: 1rem !important;
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
          background: hsl(var(--primary) / 0.05) !important;
          margin-bottom: 1rem !important;
        }
        
        /* H2: Medium, with bottom border */
        .rich-text-editor h2 {
          font-size: 1.5rem !important;
          font-weight: 600 !important;
          border-bottom: 2px solid hsl(var(--border)) !important;
          padding-bottom: 0.5rem !important;
          color: hsl(var(--primary)) !important;
          margin-bottom: 0.75rem !important;
        }
        
        /* H3: Smaller, with left border */
        .rich-text-editor h3 {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          border-left: 2px solid hsl(var(--muted-foreground)) !important;
          padding-left: 0.75rem !important;
          color: hsl(var(--muted-foreground)) !important;
          margin-bottom: 0.5rem !important;
        }
      `}</style>
    </div>
  );
}
