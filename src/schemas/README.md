# Email Template Schema Documentation

This document explains the drag-and-drop email template schema system, designed to create flexible, reusable email templates with a simplified section-based approach.

## Overview

The email template system supports **5 core section types** that cover all essential email composition needs:

- **Text** - Rich text content with formatting options
- **Image** - Image display with sizing and alignment controls
- **File** - File attachments with metadata
- **CC** - Carbon copy recipients management
- **BCC** - Blind carbon copy recipients management

## Core Types

### Template Structure

```typescript
interface TDragDropTemplate {
  uid: string;
  template_name: string;
  template_subject: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  version: number;
  settings: TTemplateSettings;
  sections: TTemplateSection[];
  variables: TTemplateVariable[];
  metadata: TTemplateMetadata;
}
```

### Section Types

```typescript
type TSectionType = 
  | 'text'
  | 'image'
  | 'file'
  | 'cc'
  | 'bcc';
```

### Section Configuration

Each section type has its own configuration interface:

```typescript
type TSectionConfig = 
  | TTextConfig
  | TImageConfig
  | TFileConfig
  | TCCConfig
  | TBCCConfig;
```

## Section Types in Detail

### 1. Text Section

Rich text content with formatting options:

```typescript
interface TTextConfig {
  content: string;
  isRichText: boolean;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '500' | '600' | '700';
  textColor: string;
  alignment: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
  allowVariables: boolean;
}
```

**Example Usage:**
```typescript
const textSection = createNewSection('text', 0);
const textConfig = textSection.config as TTextConfig;
textConfig.content = '<h2>Welcome {{user_name}}!</h2><p>Thank you for joining our platform.</p>';
textConfig.fontSize = 16;
textConfig.alignment = 'left';
textConfig.allowVariables = true;
```

### 2. Image Section

Image display with sizing and alignment:

```typescript
interface TImageConfig {
  url: string;
  alt: string;
  width: number;
  height: number;
  fit: 'contain' | 'cover' | 'fill' | 'none';
  alignment: 'left' | 'center' | 'right';
  clickable: boolean;
  linkUrl?: string;
  linkTarget?: '_blank' | '_self';
  caption?: string;
  captionAlignment?: 'left' | 'center' | 'right';
}
```

**Example Usage:**
```typescript
const imageSection = createNewSection('image', 1);
const imageConfig = imageSection.config as TImageConfig;
imageConfig.url = 'https://example.com/welcome-image.jpg';
imageConfig.alt = 'Welcome illustration';
imageConfig.width = 400;
imageConfig.height = 250;
imageConfig.alignment = 'center';
```

### 3. File Section

File attachments with metadata:

```typescript
interface TFileConfig {
  fileName: string;
  fileUrl: string;
  fileSize?: string;
  fileType: 'pdf' | 'doc' | 'xls' | 'txt' | 'other';
  description?: string;
}
```

**Example Usage:**
```typescript
const fileSection = createNewSection('file', 2);
const fileConfig = fileSection.config as TFileConfig;
fileConfig.fileName = 'Welcome Guide.pdf';
fileConfig.fileUrl = 'https://example.com/welcome-guide.pdf';
fileConfig.fileSize = '2.5MB';
fileConfig.fileType = 'pdf';
fileConfig.description = 'Complete guide to getting started';
```

### 4. CC Section

Carbon copy recipients management:

```typescript
interface TCCConfig {
  recipients: string;
  showInEmail: boolean;
  description?: string;
}
```

**Example Usage:**
```typescript
const ccSection = createNewSection('cc', 3);
const ccConfig = ccSection.config as TCCConfig;
ccConfig.recipients = 'support@company.com, notifications@company.com';
ccConfig.showInEmail = false;
ccConfig.description = 'Notify support team about new user';
```

### 5. BCC Section

Blind carbon copy recipients management:

```typescript
interface TBCCConfig {
  recipients: string;
  hideFromRecipients: boolean;
  description?: string;
}
```

**Example Usage:**
```typescript
const bccSection = createNewSection('bcc', 4);
const bccConfig = bccSection.config as TBCCConfig;
bccConfig.recipients = 'analytics@company.com';
bccConfig.hideFromRecipients = true;
bccConfig.description = 'Analytics team tracking';
```

## Template Creation

### Creating a New Template

```typescript
import { createNewTemplate, createNewSection } from './templateSchema';

// Create a new template
const template = createNewTemplate('Welcome Email');
template.template_subject = 'Welcome to Our Platform!';
template.description = 'A welcoming email template for new users';

// Add sections
const textSection = createNewSection('text', 0);
const imageSection = createNewSection('image', 1);
const fileSection = createNewSection('file', 2);

// Configure sections
// ... configure each section as needed

// Add sections to template
template.sections = [textSection, imageSection, fileSection];
```

### Template Variables

Support for dynamic content using variables:

```typescript
template.variables = [
  {
    id: 'user_name',
    name: 'user_name',
    displayName: 'User Name',
    type: 'text',
    defaultValue: 'Friend',
    required: true,
    description: 'The name of the user receiving the email'
  },
  {
    id: 'company_name',
    name: 'company_name',
    displayName: 'Company Name',
    type: 'text',
    defaultValue: 'Your Company',
    required: false,
    description: 'Company name for personalization'
  }
];
```

### Template Validation

```typescript
import { validateTemplate } from './templateSchema';

const errors = validateTemplate(template);
if (errors.length > 0) {
  console.error('Template validation errors:', errors);
} else {
  console.log('Template is valid!');
}
```

## Template Conversion

### Converting to Legacy Format

```typescript
import { convertDragDropToLegacy } from '../utils/templateConverter';

const legacyTemplate = convertDragDropToLegacy(template);
// Now compatible with existing email system
```

### Converting from Legacy Format

```typescript
import { convertLegacyToDragDrop } from '../utils/templateConverter';

const dragDropTemplate = convertLegacyToDragDrop(legacyTemplate);
// Now usable in drag-drop builder
```

## Usage Examples

### Simple Welcome Email

```typescript
const welcomeTemplate = createNewTemplate('Welcome Email');

// Text content
const textSection = createNewSection('text', 0);
const textConfig = textSection.config as TTextConfig;
textConfig.content = '<h2>Welcome {{user_name}}!</h2><p>We\'re excited to have you join our platform.</p>';
textConfig.allowVariables = true;

// Welcome image
const imageSection = createNewSection('image', 1);
const imageConfig = imageSection.config as TImageConfig;
imageConfig.url = 'https://example.com/welcome.jpg';
imageConfig.alt = 'Welcome';
imageConfig.alignment = 'center';

// Attach welcome guide
const fileSection = createNewSection('file', 2);
const fileConfig = fileSection.config as TFileConfig;
fileConfig.fileName = 'Getting Started Guide.pdf';
fileConfig.fileUrl = 'https://example.com/guide.pdf';
fileConfig.fileType = 'pdf';

welcomeTemplate.sections = [textSection, imageSection, fileSection];
```

### Newsletter Template

```typescript
const newsletterTemplate = createNewTemplate('Monthly Newsletter');

// Newsletter header
const headerSection = createNewSection('text', 0);
const headerConfig = headerSection.config as TTextConfig;
headerConfig.content = '<h1>Monthly Newsletter</h1><p>{{month}} {{year}}</p>';
headerConfig.alignment = 'center';
headerConfig.allowVariables = true;

// Newsletter content
const contentSection = createNewSection('text', 1);
const contentConfig = contentSection.config as TTextConfig;
contentConfig.content = '<h2>Featured Article</h2><p>{{article_content}}</p>';
contentConfig.allowVariables = true;

// Newsletter archive
const archiveSection = createNewSection('file', 2);
const archiveConfig = archiveSection.config as TFileConfig;
archiveConfig.fileName = 'Newsletter Archive.pdf';
archiveConfig.fileUrl = 'https://example.com/archive.pdf';
archiveConfig.fileType = 'pdf';

// BCC for analytics
const bccSection = createNewSection('bcc', 3);
const bccConfig = bccSection.config as TBCCConfig;
bccConfig.recipients = 'analytics@company.com';
bccConfig.hideFromRecipients = true;

newsletterTemplate.sections = [headerSection, contentSection, archiveSection, bccSection];
```

## Best Practices

### 1. Section Ordering
- Order sections logically (header → content → attachments → metadata)
- Use the `order` property to maintain sequence
- Keep related sections grouped together

### 2. Variable Usage
- Use descriptive variable names (`user_name` not `un`)
- Provide default values for all variables
- Document variable purpose in the description field

### 3. Content Structure
- Use semantic HTML in text sections
- Include alt text for all images
- Provide descriptive file names and descriptions

### 4. Performance
- Optimize image sizes and formats
- Keep file attachments reasonable in size
- Use variables to reduce template duplication

### 5. Accessibility
- Include proper alt text for images
- Use semantic HTML structure
- Ensure sufficient color contrast

## Error Handling

The system includes comprehensive validation:

```typescript
interface TValidationError {
  sectionId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}
```

Common validation errors:
- Empty required fields
- Invalid URLs
- Missing file names
- Invalid email addresses in CC/BCC
- Malformed HTML content

## Integration

### With Existing Email System

Templates created with this schema are automatically converted to the legacy format for compatibility:

```typescript
// Create drag-drop template
const template = createNewTemplate('My Template');
// ... configure template

// Convert for existing system
const legacyTemplate = convertDragDropToLegacy(template);
onSaveTemplate(legacyTemplate);
```

### With Template Builder UI

The schema is designed to work seamlessly with the drag-drop template builder:

```typescript
// Section library categorization
const BODY_SECTIONS = ['text', 'image', 'file'];
const MISCELLANEOUS_SECTIONS = ['cc', 'bcc'];

// Drag-drop functionality
const newSection = createNewSection(draggedType, insertPosition);
template.sections.push(newSection);
```

This simplified schema provides all the essential functionality for email template creation while maintaining ease of use and extensibility. 