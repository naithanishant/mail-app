import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
  hasError?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter your content here...',
  readOnly = false,
  className = '',
  minHeight = 200,
  maxHeight = 400,
  hasError = false
}) => {
  // Comprehensive toolbar configuration
  const modules = {
    toolbar: readOnly ? false : [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'link', 'image', 'script'
  ];

  const containerClassName = `
    rte-container
    ${hasError ? 'rte-error' : ''}
    ${readOnly ? 'rte-readonly' : ''}
    ${className}
  `.trim();

  return (
    <div 
      className={containerClassName}
      style={{
        '--min-height': `${minHeight}px`,
        '--max-height': `${maxHeight}px`
      } as React.CSSProperties}
    >
      <ReactQuill
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        modules={modules}
        formats={formats}
        theme="snow"
      />
    </div>
  );
};

export default RichTextEditor; 