# Email Template and Content Type Creation API

This document explains the **separated flows** for creating **regular email templates** and **custom drag-drop templates** in Contentstack.

## Template Type Separation

The system now has **two distinct template types** to avoid confusion:

### **1. Regular Email Templates**
- **Fields**: `template_name`, `template_subject`, `template_body`
- **Type**: `TCreateEmailTemplateInput`
- **Function**: `createEmailTemplate()`
- **Use Case**: Standard email templates with subject lines

### **2. Custom Drag-Drop Templates**
- **Fields**: `template_name` only (body generated from sections)
- **Type**: `TCreateCustomTemplateInput`
- **Function**: `createCustomTemplate()` or `createDragDropTemplateWithContentType()`
- **Use Case**: Dynamic templates built with drag-drop interface

## Available Functions

### 1. `createEmailTemplate(dispatch, { entry: TCreateEmailTemplateInput })`
Creates a regular email template with subject.

**Parameters:**
- `dispatch`: Redux dispatch function
- `entry`: TCreateEmailTemplateInput object

**Type Definition:**
```typescript
type TCreateEmailTemplateInput = {
  template_name: string;
  template_subject: string;
  template_body: string;
  active: boolean;
  isDragDropTemplate?: false;
}
```

**Usage:**
```javascript
await createEmailTemplate(dispatch, {
  entry: {
    template_name: 'Newsletter Template',
    template_subject: 'Monthly Newsletter',
    template_body: 'Email content here',
    active: true
  }
});
```

### 2. `createCustomTemplate(dispatch, { entry: TCreateCustomTemplateInput })`
Creates a custom drag-drop template (template name only).

**Parameters:**
- `dispatch`: Redux dispatch function
- `entry`: TCreateCustomTemplateInput object

**Type Definition:**
```typescript
type TCreateCustomTemplateInput = {
  template_name: string;
  template_body?: string; // Optional, generated from sections
  active: boolean;
  isDragDropTemplate: true;
  dragDropData: TDragDropTemplate;
}
```

**Usage:**
```javascript
await createCustomTemplate(dispatch, {
  entry: {
    template_name: 'Product Launch Template',
    active: true,
    isDragDropTemplate: true,
    dragDropData: {
      template_name: 'Product Launch Template',
      sections: [/* sections */]
    }
  }
});
```

### 3. `createContentType(schema)`
Creates a content type in Contentstack based on the drag-drop template schema.

**Parameters:**
- `schema`: TDragDropTemplate object with template_name and sections

**Usage:**
```javascript
const contentType = await createContentType(dragDropTemplate);
console.log('Content type created:', contentType.content_type.title);
```

### 4. `createDragDropTemplateWithContentType(dispatch, { entry: TCreateCustomTemplateInput })`
Complete workflow that creates content type for custom templates.

**Parameters:**
- `dispatch`: Redux dispatch function
- `entry`: TCreateCustomTemplateInput object

**Returns:**
```typescript
{
  contentTypeUID: string;
  contentTypeName: string;
  templateUID: string;
  templateName: string;
  success: boolean;
  message: string;
}
```

**Usage:**
```javascript
const result = await createDragDropTemplateWithContentType(dispatch, {
  entry: {
    template_name: 'Welcome Email Template',
    active: true,
    isDragDropTemplate: true,
    dragDropData: templateData
  }
});
```

### 5. `createTemplateContentType(dragDropData)`
Creates content type only (no template entry).

**Usage:**
```javascript
const contentTypeUID = await createTemplateContentType(template);
```

## Component Integration

### **EmailTemplatesList Component**

```typescript
// Regular template handler
const handleAddTemplate = async (templateData: TCreateEmailTemplateInput) => {
  await createEmailTemplate(dispatch, { entry: templateData });
};

// Custom template handler  
const handleDragDropTemplate = async (templateData: TCreateCustomTemplateInput) => {
  const result = await createDragDropTemplateWithContentType(dispatch, { entry: templateData });
};
```

### **DragDropTemplateModal Component**

```typescript
interface DragDropTemplateModalProps {
  onSaveTemplate: (templateData: TCreateCustomTemplateInput) => void;
}
```

## Key Benefits of Separation

1. **Type Safety**: Clear separation prevents template_subject confusion
2. **Clear Interfaces**: Each template type has specific requirements
3. **No Mixing**: Regular templates always have subjects, custom templates don't
4. **Proper Validation**: Each type validates its specific fields
5. **Better UX**: Users know exactly what fields are required

## Migration Guide

### **Before (Mixed Types)**
```javascript
// Confusing - mixed properties
const templateData = {
  template_name: 'My Template',
  template_subject: 'Subject', // Sometimes needed, sometimes not
  isDragDropTemplate: true,     // Unclear when to set
  dragDropData: data           // Optional, confusing
};
```

### **After (Separated Types)**
```javascript
// Clear - Regular template
const regularTemplate: TCreateEmailTemplateInput = {
  template_name: 'Newsletter',
  template_subject: 'Monthly Update', // Always required
  template_body: 'Content',
  active: true
};

// Clear - Custom template  
const customTemplate: TCreateCustomTemplateInput = {
  template_name: 'Dynamic Template', // Only name required
  active: true,
  isDragDropTemplate: true,          // Always true
  dragDropData: templateStructure    // Always required
};
```

## Error Handling

Each template type has specific error handling:

- **Regular Templates**: Validates name, subject, and body
- **Custom Templates**: Validates name and drag-drop structure
- **Content Types**: Validates template name and sections 