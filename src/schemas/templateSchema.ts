// Email Template Schema for Drag & Drop Template Builder
// This schema defines the structure for modular email templates

export type TSectionType = 
  | 'text'
  | 'image'
  | 'file'
  | 'cc'
  | 'bcc';

export type TAlignment = 'left' | 'center' | 'right';
export type TImageFit = 'contain' | 'cover' | 'fill' | 'none';

// Base interface for all sections
export interface TTemplateSection {
  id: string;
  type: TSectionType;
  order: number;
  visible: boolean;
  config: TSectionConfig;
  styles: TSectionStyles;
}

// Configuration options for each section type
export type TSectionConfig = 
  | TTextConfig
  | TImageConfig
  | TFileConfig
  | TCCConfig
  | TBCCConfig;

// Style options that apply to all sections
export interface TSectionStyles {
  backgroundColor?: string;
  padding?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  margin?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  borderRadius?: number;
  border?: {
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
    color: string;
  };
}

// Text Section Configuration
export interface TTextConfig {
  // Structural properties
  label: string;
  description?: string;
  required: boolean;
  contentType: 'paragraph' | 'heading' | 'list' | 'quote';
  
  // Content properties (used for preview/defaults)
  content: string;
  isRichText: boolean;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '500' | '600' | '700';
  textColor: string;
  alignment: TAlignment;
  lineHeight: number;
  letterSpacing: number;
  allowVariables: boolean;
}

// Image Section Configuration
export interface TImageConfig {
  // Structural properties
  label: string;
  description?: string;
  required: boolean;
  maxWidth?: number;
  maxHeight?: number;
  allowedTypes?: string[];
  
  // Content properties (used for preview/defaults)
  url: string;
  alt: string;
  width: number;
  height: number;
  fit: TImageFit;
  alignment: TAlignment;
  clickable: boolean;
  linkUrl?: string;
  linkTarget?: '_blank' | '_self';
  caption?: string;
  captionAlignment?: TAlignment;
}

// File Section Configuration
export interface TFileConfig {
  // Structural properties
  label: string;
  description?: string;
  required: boolean;
  allowedTypes?: string[];
  maxSize?: string;
  
  // Content properties (used for preview/defaults)
  fileName: string;
  fileUrl: string;
  fileSize?: string;
  fileType: 'pdf' | 'doc' | 'xls' | 'txt' | 'other';
}

// CC Section Configuration
export interface TCCConfig {
  // Structural properties
  label: string;
  description?: string;
  required: boolean;
  
  // Content properties (used for preview/defaults)
  recipients: string;
  showInEmail: boolean;
}

// BCC Section Configuration
export interface TBCCConfig {
  // Structural properties
  label: string;
  description?: string;
  required: boolean;
  
  // Content properties (used for preview/defaults)
  recipients: string;
  hideFromRecipients: boolean;
}

// Complete Template Schema
export interface TDragDropTemplate {
  uid: string;
  template_name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  version: number;
  
  // Template settings
  settings: TTemplateSettings;
  
  // Template sections
  sections: TTemplateSection[];
  
  // Template variables for dynamic content
  variables: TTemplateVariable[];
  
  // Template metadata
  metadata: TTemplateMetadata;
  
  // Preview data for testing
  previewData?: Record<string, any>;
}

export interface TTemplateSettings {
  containerWidth: number;
  containerMaxWidth: number;
  backgroundColor: string;
  fontFamily: string;
  defaultTextColor: string;
  defaultLinkColor: string;
  preheaderText?: string;
  enableDarkMode: boolean;
  responsiveBreakpoint: number;
}

export interface TTemplateVariable {
  id: string;
  name: string;
  displayName: string;
  type: 'text' | 'image' | 'url' | 'email' | 'date' | 'number' | 'boolean';
  defaultValue: any;
  required: boolean;
  description?: string;
  category?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface TTemplateMetadata {
  category?: string;
  tags: string[];
  thumbnail?: string;
  author?: string;
  usage_count: number;
  last_used?: string;
  is_favorite: boolean;
  is_shared: boolean;
  permission_level: 'private' | 'team' | 'public';
}

// Section library for drag and drop
export interface TSectionLibrary {
  categories: TSectionCategory[];
}

export interface TSectionCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  sections: TSectionTemplate[];
}

export interface TSectionTemplate {
  id: string;
  name: string;
  description?: string;
  type: TSectionType;
  icon?: string;
  thumbnail?: string;
  defaultConfig: TSectionConfig;
  defaultStyles: TSectionStyles;
  isCustomizable: boolean;
  isPremium: boolean;
  tags: string[];
}

// Template builder state
export interface TTemplateBuilderState {
  template: TDragDropTemplate;
  selectedSectionId: string | null;
  draggedSectionId: string | null;
  isDragging: boolean;
  showPreview: boolean;
  previewMode: 'desktop' | 'mobile';
  unsavedChanges: boolean;
  validationErrors: TValidationError[];
}

export interface TValidationError {
  sectionId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// Template export/import formats
export interface TTemplateExport {
  template: TDragDropTemplate;
  format: 'json' | 'html' | 'mjml';
  exportedAt: string;
  exportedBy: string;
}

// Template rendering options
export interface TTemplateRenderOptions {
  variables?: Record<string, any>;
  format: 'html' | 'preview' | 'email';
  minify?: boolean;
  inlineStyles?: boolean;
  generateTextVersion?: boolean;
  validateLinks?: boolean;
}

// Default configuration for different section types
export const DEFAULT_SECTION_CONFIGS: Record<TSectionType, any> = {
  text: {
    label: 'Text Content',
    description: 'Enter your text content here',
    required: false,
    contentType: 'paragraph',
    content: '',
    isRichText: false,
    fontSize: 16,
    fontWeight: 'normal',
    textColor: '#333333',
    alignment: 'left',
    lineHeight: 1.5,
    letterSpacing: 0,
    allowVariables: true,
  } as TTextConfig,
  image: {
    label: 'Image',
    description: 'Upload an image',
    required: false,
    maxWidth: 600,
    maxHeight: 400,
    allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    url: '',
    alt: '',
    width: 300,
    height: 200,
    fit: 'cover',
    alignment: 'center',
    clickable: false,
    linkUrl: '',
    linkTarget: '_blank',
    caption: '',
    captionAlignment: 'center',
  } as TImageConfig,
  file: {
    label: 'File Attachment',
    description: 'Attach a file',
    required: false,
    allowedTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
    maxSize: '10MB',
    fileName: '',
    fileUrl: '',
    fileSize: '',
    fileType: 'pdf',
  } as TFileConfig,
  cc: {
    label: 'CC Recipients',
    description: 'Carbon copy recipients',
    required: false,
    recipients: '',
    showInEmail: true,
  } as TCCConfig,
  bcc: {
    label: 'BCC Recipients',
    description: 'Blind carbon copy recipients',
    required: false,
    recipients: '',
    hideFromRecipients: true,
  } as TBCCConfig,
};

// Add subject as a special section type
export const SUBJECT_CONFIG = {
  label: 'Subject',
  description: 'Email subject line',
  required: true,
  content: '',
  isRichText: false,
  fontSize: 16,
  fontWeight: 'normal',
  textColor: '#333333',
  alignment: 'left',
  lineHeight: 1.5,
  letterSpacing: 0,
  allowVariables: true,
};

// Default section styles
export const DEFAULT_SECTION_STYLES: TSectionStyles = {
  backgroundColor: 'transparent',
  padding: {
    top: 10,
    bottom: 10,
    left: 15,
    right: 15,
  },
  margin: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  borderRadius: 0,
};

// Utility functions
export const createNewSection = (type: TSectionType, order: number): TTemplateSection => ({
  id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type,
  order,
  visible: true,
  config: DEFAULT_SECTION_CONFIGS[type],
  styles: { ...DEFAULT_SECTION_STYLES },
});

export const createNewTemplate = (name: string): TDragDropTemplate => ({
  uid: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  template_name: name,
  active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
  
  settings: {
    containerWidth: 600,
    containerMaxWidth: 800,
    backgroundColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    defaultTextColor: '#333333',
    defaultLinkColor: '#0066cc',
    preheaderText: '',
    enableDarkMode: false,
    responsiveBreakpoint: 768,
  },
  sections: [],
  variables: [],
  metadata: {
    tags: [],
    usage_count: 0,
    last_used: new Date().toISOString(),
    is_favorite: false,
    is_shared: false,
    permission_level: 'private',
  },
});

// Validation functions
export const validateSection = (section: TTemplateSection): TValidationError[] => {
  const errors: TValidationError[] = [];
  
  switch (section.type) {
    case 'text':
      const textConfig = section.config as TTextConfig;
      if (!textConfig.content?.trim()) {
        errors.push({
          sectionId: section.id,
          field: 'content',
          message: 'Text content is required',
          severity: 'error',
        });
      }
      break;
      
    case 'image':
      const imageConfig = section.config as TImageConfig;
      if (!imageConfig.url?.trim()) {
        errors.push({
          sectionId: section.id,
          field: 'url',
          message: 'Image URL is required',
          severity: 'error',
        });
      }
      break;
      
    case 'file':
      const fileConfig = section.config as TFileConfig;
      if (!fileConfig.fileName?.trim()) {
        errors.push({
          sectionId: section.id,
          field: 'fileName',
          message: 'File name is required',
          severity: 'error',
        });
      }
      break;
      
    case 'cc':
      const ccConfig = section.config as TCCConfig;
      if (!ccConfig.recipients?.trim()) {
        errors.push({
          sectionId: section.id,
          field: 'recipients',
          message: 'CC recipients are required',
          severity: 'error',
        });
      }
      break;
      
    case 'bcc':
      const bccConfig = section.config as TBCCConfig;
      if (!bccConfig.recipients?.trim()) {
        errors.push({
          sectionId: section.id,
          field: 'recipients',
          message: 'BCC recipients are required',
          severity: 'error',
        });
      }
      break;
  }
  
  return errors;
};

export const validateTemplate = (template: TDragDropTemplate): TValidationError[] => {
  const errors: TValidationError[] = [];
  
  if (!template.template_name?.trim()) {
    errors.push({
      sectionId: '',
      field: 'template_name',
      message: 'Template name is required',
      severity: 'error',
    });
  }
  
  // Check for duplicate CC/BCC sections
  const ccSections = template.sections.filter(s => s.type === 'cc');
  const bccSections = template.sections.filter(s => s.type === 'bcc');
  
  if (ccSections.length > 1) {
    ccSections.slice(1).forEach(section => {
      errors.push({
        sectionId: section.id,
        field: 'type',
        message: 'Only one CC section is allowed per template',
        severity: 'error',
      });
    });
  }
  
  if (bccSections.length > 1) {
    bccSections.slice(1).forEach(section => {
      errors.push({
        sectionId: section.id,
        field: 'type',
        message: 'Only one BCC section is allowed per template',
        severity: 'error',
      });
    });
  }
  
  // Validate all sections
  template.sections.forEach(section => {
    const sectionErrors = validateSection(section);
    errors.push(...sectionErrors);
  });
  
  return errors;
}; 