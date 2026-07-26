import type { TextareaHTMLAttributes } from 'react';

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%',
        minHeight: 112,
        resize: 'vertical',
        padding: 'var(--md-space-3) var(--md-space-4)',
        borderRadius: 'var(--md-radius-control)',
        border: '1px solid var(--md-color-border)',
        fontFamily: 'inherit',
        fontSize: 'var(--md-font-size-md)',
        background: 'var(--md-color-surface)',
        color: 'var(--md-color-on-surface)',
        outlineColor: 'var(--md-color-primary)',
        ...props.style
      }}
    />
  );
}
