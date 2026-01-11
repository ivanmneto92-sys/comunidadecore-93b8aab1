import React from 'react';

interface ParsedPart {
  type: 'text' | 'bold' | 'italic' | 'code' | 'code-block' | 'mention';
  content: string;
  userId?: string;
}

/**
 * Parses basic markdown syntax and mentions into structured parts
 * Supports: **bold**, *italic*, `inline code`, ```code blocks```, @[Name](id)
 */
export function parseMarkdown(content: string): ParsedPart[] {
  const parts: ParsedPart[] = [];
  
  // Combined regex for all patterns
  // Order matters: code blocks first, then inline code, then bold, italic, mentions
  const regex = /```([\s\S]*?)```|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|@\[([^\]]+)\]\(([^)]+)\)/g;
  
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
    }

    if (match[1] !== undefined) {
      // Code block ```...```
      parts.push({ type: 'code-block', content: match[1] });
    } else if (match[2] !== undefined) {
      // Inline code `...`
      parts.push({ type: 'code', content: match[2] });
    } else if (match[3] !== undefined) {
      // Bold **...**
      parts.push({ type: 'bold', content: match[3] });
    } else if (match[4] !== undefined) {
      // Italic *...*
      parts.push({ type: 'italic', content: match[4] });
    } else if (match[5] !== undefined && match[6] !== undefined) {
      // Mention @[Name](id)
      parts.push({ type: 'mention', content: match[5], userId: match[6] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  return parts;
}

/**
 * Renders parsed markdown parts as React elements
 */
export function renderMarkdown(content: string): React.ReactNode {
  const parts = parseMarkdown(content);
  
  if (parts.length === 0) {
    return content;
  }

  return parts.map((part, index) => {
    const key = `${part.type}-${index}`;
    
    switch (part.type) {
      case 'bold':
        return (
          <strong key={key} className="font-semibold">
            {part.content}
          </strong>
        );
      
      case 'italic':
        return (
          <em key={key} className="italic">
            {part.content}
          </em>
        );
      
      case 'code':
        return (
          <code
            key={key}
            className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs text-primary"
          >
            {part.content}
          </code>
        );
      
      case 'code-block':
        return (
          <pre
            key={key}
            className="mt-1 mb-1 p-2 rounded-md bg-muted font-mono text-xs overflow-x-auto"
          >
            <code>{part.content}</code>
          </pre>
        );
      
      case 'mention':
        return (
          <span
            key={key}
            className="bg-primary/20 text-primary px-1 rounded font-medium cursor-pointer hover:bg-primary/30 transition-colors"
            title={part.content}
          >
            @{part.content}
          </span>
        );
      
      case 'text':
      default:
        return <React.Fragment key={key}>{part.content}</React.Fragment>;
    }
  });
}
