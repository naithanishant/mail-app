import React, { useState, useEffect, useRef } from 'react';
import '../../../styles/DragDropTemplateModal.css';
import { 
  createNewTemplate, 
  createNewSection, 
  TTemplateSection,
  TSectionType,
  DEFAULT_SECTION_CONFIGS,
  TTextConfig,
  TImageConfig,
  TFileConfig,
  TCCConfig,
  TBCCConfig
} from '../../../schemas/templateSchema';
import { createTemplateContentType } from '../../../api/index';
import { TCreateCustomTemplateInput } from '../../../types/index';
import RichTextEditor from '../../shared/RichTextEditor/RichTextEditor';
import { validateRTEContent, normalizeRTEContent } from '../../../utils/rteUtils';

interface DragDropTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTemplate: (templateData: TCreateCustomTemplateInput) => void;
  existingTemplate?: any;
}

interface SectionLibraryItem {
  id: string;
  type: TSectionType;
  name: string;
  description: string;
  icon: string;
}

const BODY_SECTIONS: SectionLibraryItem[] = [
  { id: 'text', type: 'text', name: 'Text', description: 'Add text content', icon: '📝' },
  { id: 'image', type: 'image', name: 'Image', description: 'Add images', icon: '🖼️' },
  { id: 'file', type: 'file', name: 'Files', description: 'Attach files', icon: '📎' },
];

const MISCELLANEOUS_SECTIONS: SectionLibraryItem[] = [
  { id: 'cc', type: 'cc', name: 'CC', description: 'Carbon copy recipients', icon: '👥' },
  { id: 'bcc', type: 'bcc', name: 'BCC', description: 'Blind carbon copy', icon: '👤' },
];

const DragDropTemplateModal: React.FC<DragDropTemplateModalProps> = ({
  isOpen,
  onClose,
  onSaveTemplate,
  existingTemplate
}) => {
  const [template, setTemplate] = useState<any>(createNewTemplate('Custom Template'));
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [draggedSectionType, setDraggedSectionType] = useState<TSectionType | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{
    templateName?: string;
    contentType?: string;
    sections?: string;
    general?: string;
  }>({});
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Clear errors when template changes
  useEffect(() => {
    setErrors({});
    setSuccessMessage('');
  }, [template.template_name, template.sections]);

  useEffect(() => {
    if (existingTemplate) {
      setTemplate(existingTemplate);
    } else {
      setTemplate(createNewTemplate('Custom Template'));
    }
    setErrors({});
    setSuccessMessage('');
  }, [existingTemplate, isOpen]);

  const clearError = (field: keyof typeof errors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const setError = (field: keyof typeof errors, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
    setSuccessMessage('');
  };

  const handleDragStart = (e: React.DragEvent, sectionType: TSectionType) => {
    // Check if CC or BCC already exists in template
    if ((sectionType === 'cc' || sectionType === 'bcc') && 
        template.sections.some((section: any) => section.type === sectionType)) {
      e.preventDefault();
      setError('sections', `${sectionType.toUpperCase()} section already exists. Only one ${sectionType.toUpperCase()} section is allowed per template.`);
      return;
    }
    
    clearError('sections');
    setDraggedSectionType(sectionType);
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', sectionType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, insertIndex?: number) => {
    e.preventDefault();
    
    if (!draggedSectionType) return;

    // Additional check to prevent dropping CC/BCC if they already exist
    if ((draggedSectionType === 'cc' || draggedSectionType === 'bcc') && 
        template.sections.some((section: any) => section.type === draggedSectionType)) {
      setDraggedSectionType(null);
      setIsDragging(false);
      setError('sections', `${draggedSectionType.toUpperCase()} section already exists. Only one ${draggedSectionType.toUpperCase()} section is allowed per template.`);
      return;
    }

    clearError('sections');
    const newSection = createNewSection(draggedSectionType, insertIndex || template.sections.length);
    
    // Insert section at specific index or append to end
    const updatedSections = [...template.sections];
    if (insertIndex !== undefined) {
      updatedSections.splice(insertIndex, 0, newSection);
      // Reorder sections
      updatedSections.forEach((section: any, index: number) => {
        section.order = index;
      });
    } else {
      updatedSections.push(newSection);
    }

    setTemplate((prev: any) => ({
      ...prev,
      sections: updatedSections
    }));

    setSelectedSectionId(newSection.id);
    setDraggedSectionType(null);
    setIsDragging(false);
  };

  const handleSectionClick = (sectionId: string) => {
    setSelectedSectionId(sectionId);
  };

  const handleSectionDelete = (sectionId: string) => {
    setTemplate((prev: any) => ({
      ...prev,
      sections: prev.sections.filter((section: any) => section.id !== sectionId)
    }));
    setSelectedSectionId(null);
    // Note: This will automatically re-enable CC/BCC sections in the library
    // when they are deleted from the template
  };

  const handleSectionMove = (sectionId: string, direction: 'up' | 'down') => {
    const sectionIndex = template.sections.findIndex((s: any) => s.id === sectionId);
    if (sectionIndex === -1) return;

    const newIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
    if (newIndex < 0 || newIndex >= template.sections.length) return;

    const updatedSections = [...template.sections];
    const [movedSection] = updatedSections.splice(sectionIndex, 1);
    updatedSections.splice(newIndex, 0, movedSection);

    // Update order
    updatedSections.forEach((section: any, index: number) => {
      section.order = index;
    });

    setTemplate((prev: any) => ({
      ...prev,
      sections: updatedSections
    }));
  };

  const handleSectionConfigChange = (sectionId: string, config: any) => {
    setTemplate((prev: any) => ({
      ...prev,
      sections: prev.sections.map((section: any) => 
        section.id === sectionId ? { ...section, config } : section
      )
    }));
  };

  const handleTemplateSettingsChange = (field: string, value: any) => {
    setTemplate((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      console.log("Saving template with data:", template);
      
      // Ensure template name is not empty
      if (!template.template_name || template.template_name.trim() === '' || template.template_name === 'Custom Template') {
        setError('templateName', 'Please enter a template name');
        return;
      }
      clearError('templateName');
      
      // Prepare template data with drag-drop structure
      const templateData: TCreateCustomTemplateInput = {
        template_name: template.template_name,
        template_body: "", // Will be generated from sections
        active: true,
        isDragDropTemplate: true,
        dragDropData: {
          ...template,
          // Ensure template name is included in dragDropData
          template_name: template.template_name
        }
      };
      
      console.log("Template data being passed:", templateData);
      console.log("Template name:", templateData.template_name);
      
      // Pass the template data to the parent component
      // The parent will handle the complete workflow (content type + template creation)
      onSaveTemplate(templateData);
      onClose();
      
    } catch (error) {
      console.error("Error saving template:", error);
      setError('general', `Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCreateContentTypeOnly = async () => {
    try {
      setIsCreating(true);
      setErrors({});
      setSuccessMessage('');
      
      // Ensure template name is not empty
      if (!template.template_name || template.template_name.trim() === '' || template.template_name === 'Custom Template') {
        setError('templateName', 'Please enter a template name');
        return;
      }
      clearError('templateName');
      
      // Prepare template data with name
      const templateWithName: any = {
        ...template,
        template_name: template.template_name
      };
      
      onSaveTemplate(templateWithName);
      onClose();
    } catch (error) {
      console.error("Error creating content type:", error);
      setError('contentType', `Failed to create content type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const renderSectionPreview = (section: any) => {
    const isSelected = selectedSectionId === section.id;
    
    return (
      <div
        key={section.id}
        className={`section-preview ${isSelected ? 'selected' : ''}`}
        onClick={() => handleSectionClick(section.id)}
      >
        <div className="section-controls">
          <button 
            className="section-move-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleSectionMove(section.id, 'up');
            }}
            disabled={section.order === 0}
          >
            ↑
          </button>
          <button 
            className="section-move-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleSectionMove(section.id, 'down');
            }}
            disabled={section.order === template.sections.length - 1}
          >
            ↓
          </button>
          <button 
            className="section-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleSectionDelete(section.id);
            }}
          >
            ×
          </button>
        </div>
        
        <div className="section-content">
          {renderSectionContent(section)}
        </div>
      </div>
    );
  };

  const renderSectionContent = (section: any) => {
    switch (section.type) {
      case 'text':
        const textConfig = section.config as TTextConfig;
        return (
          <div className="text-preview">
            <div className="section-label">
              <strong>📝 {textConfig.label || 'Text Section'}</strong>
              {textConfig.required && <span className="required-badge">*</span>}
            </div>
            <div className="section-description">
              {textConfig.description || 'Rich text content will be entered here'}
            </div>
            <div className="section-placeholder">
              [Text content placeholder - {textConfig.contentType || 'paragraph'}]
            </div>
          </div>
        );
      
      case 'image':
        const imageConfig = section.config as TImageConfig;
        return (
          <div className="image-preview">
            <div className="section-label">
              <strong>🖼️ {imageConfig.label || 'Image Section'}</strong>
              {imageConfig.required && <span className="required-badge">*</span>}
            </div>
            <div className="section-description">
              {imageConfig.description || 'Image will be uploaded here'}
            </div>
            <div className="image-placeholder">
              <div className="placeholder-content">
                🖼️ Image placeholder
                {imageConfig.maxWidth && imageConfig.maxHeight && (
                  <div className="constraints">Max: {imageConfig.maxWidth}x{imageConfig.maxHeight}px</div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'file':
        const fileConfig = section.config as TFileConfig;
        return (
          <div className="file-preview">
            <div className="section-label">
              <strong>📎 {fileConfig.label || 'File Section'}</strong>
              {fileConfig.required && <span className="required-badge">*</span>}
            </div>
            <div className="section-description">
              {fileConfig.description || 'File attachment will be added here'}
            </div>
            <div className="file-placeholder">
              📎 File attachment placeholder
              {fileConfig.allowedTypes && (
                <div className="constraints">Types: {fileConfig.allowedTypes.join(', ')}</div>
              )}
              {fileConfig.maxSize && (
                <div className="constraints">Max size: {fileConfig.maxSize}</div>
              )}
            </div>
          </div>
        );
      
      case 'cc':
        const ccConfig = section.config as TCCConfig;
        return (
          <div className="cc-preview">
            <div className="section-label">
              <strong>👥 {ccConfig.label || 'CC Section'}</strong>
              {ccConfig.required && <span className="required-badge">*</span>}
            </div>
            <div className="section-description">
              {ccConfig.description || 'Carbon copy recipients will be added here'}
            </div>
            <div className="section-placeholder">
              [CC recipients placeholder]
            </div>
          </div>
        );
      
      case 'bcc':
        const bccConfig = section.config as TBCCConfig;
        return (
          <div className="bcc-preview">
            <div className="section-label">
              <strong>👤 {bccConfig.label || 'BCC Section'}</strong>
              {bccConfig.required && <span className="required-badge">*</span>}
            </div>
            <div className="section-description">
              {bccConfig.description || 'Blind carbon copy recipients will be added here'}
            </div>
            <div className="section-placeholder">
              [BCC recipients placeholder]
            </div>
          </div>
        );
      
      default:
        return <div className="section-placeholder">Section: {section.type}</div>;
    }
  };

  const renderPropertiesPanel = () => {
    return (
      <div className="properties-panel">
        {/* Always show template name at the top */}
        <div className="template-name-section">
          <h3>Template Name</h3>
          <div className="property-group">
            <input
              type="text"
              value={template.template_name}
              onChange={(e) => handleTemplateSettingsChange('template_name', e.target.value)}
              placeholder="Enter template name"
              className={`template-name-input ${errors.templateName ? 'error' : ''}`}
            />
            {errors.templateName && <p className="error-message">{errors.templateName}</p>}
          </div>
        </div>
        
        {/* Separator */}
        <div className="properties-separator"></div>
        
        {/* Section-specific properties or general settings */}
        {!selectedSectionId ? (
          <div className="template-settings-section">
            <h3>Template Settings</h3>
            <p className="settings-hint">Select a section to edit its properties, or drag new sections from the library.</p>
          </div>
        ) : (
          <div className="section-properties-section">
            <h3>Section Properties</h3>
                      {(() => {
            const selectedSection = template.sections.find((s: any) => s.id === selectedSectionId);
            return selectedSection ? renderSectionProperties(selectedSection) : null;
          })()}
        </div>
      )}
    </div>
  );
};

const renderSectionProperties = (section: any) => {
    switch (section.type) {
      case 'text':
        return <TextProperties section={section} onChange={handleSectionConfigChange} />;
      case 'image':
        return <ImageProperties section={section} onChange={handleSectionConfigChange} />;
      case 'file':
        return <FileProperties section={section} onChange={handleSectionConfigChange} />;
      case 'cc':
        return <CCProperties section={section} onChange={handleSectionConfigChange} />;
      case 'bcc':
        return <BCCProperties section={section} onChange={handleSectionConfigChange} />;
      default:
        return <div>Properties for {section.type} not implemented yet</div>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="drag-drop-modal-overlay">
      <div className="drag-drop-modal">
        <div className="modal-header">
          <h2>Custom Template Builder</h2>
          <div className="header-actions">
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="modal-body">
          {/* Section Library */}
          <div className="section-library">
            <div className="section-category">
              <h3>Body</h3>
              <div className="section-items">
                {BODY_SECTIONS.map(item => (
                  <div
                    key={item.id}
                    className="section-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.type)}
                  >
                    <span className="section-icon">{item.icon}</span>
                    <div className="section-info">
                      <div className="section-name">{item.name}</div>
                      <div className="section-description">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="section-category">
              <h3>Miscellaneous</h3>
              <div className="section-items">
                {MISCELLANEOUS_SECTIONS.map(item => {
                  const isAlreadyAdded = (item.type === 'cc' || item.type === 'bcc') && 
                    template.sections.some((section: any) => section.type === item.type);
                  
                  return (
                    <div
                      key={item.id}
                      className={`section-item ${isAlreadyAdded ? 'disabled' : ''}`}
                      draggable={!isAlreadyAdded}
                      onDragStart={(e) => handleDragStart(e, item.type)}
                      title={isAlreadyAdded ? `${item.name} already added - only one per template` : `Drag to add ${item.name}`}
                    >
                      <span className="section-icon">{item.icon}</span>
                      <div className="section-info">
                        <div className="section-name">{item.name}</div>
                        <div className="section-description">{item.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Template Canvas */}
          <div className="template-canvas">
            <div className="canvas-header">
              <h3>Template Preview</h3>
              {errors.sections && <p className="error-message">{errors.sections}</p>}
            </div>
            
            <div 
              className={`canvas-content ${isDragging ? 'dragging' : ''}`}
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {template.sections.length === 0 ? (
                <div className="empty-canvas">
                  <p>Drag sections from the library to start building your template</p>
                </div>
              ) : (
                template.sections
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((section: any) => renderSectionPreview(section))
              )}
            </div>
          </div>

          {/* Properties Panel */}
          {renderPropertiesPanel()}
        </div>

        <div className="modal-footer">
          <div className="footer-actions">
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="content-type-btn" onClick={handleCreateContentTypeOnly} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Content Type Only'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Property components for different section types

const TextProperties: React.FC<{ section: TTemplateSection; onChange: (id: string, config: any) => void }> = ({ section, onChange }) => {
  const config = section.config as TTextConfig;
  
  return (
    <div className="property-groups">
      <div className="property-group">
        <label>Section Label</label>
        <input
          type="text"
          value={config.label}
          onChange={(e) => onChange(section.id, { ...config, label: e.target.value })}
          placeholder="Enter section label"
        />
      </div>
      <div className="property-group">
        <label>Description</label>
        <textarea
          value={config.description || ''}
          onChange={(e) => onChange(section.id, { ...config, description: e.target.value })}
          placeholder="Describe what content goes here"
          rows={2}
        />
      </div>
      <div className="property-group">
        <label>Content Type</label>
        <select
          value={config.contentType}
          onChange={(e) => onChange(section.id, { ...config, contentType: e.target.value })}
        >
          <option value="paragraph">Paragraph</option>
          <option value="heading">Heading</option>
          <option value="list">List</option>
          <option value="quote">Quote</option>
        </select>
      </div>
      <div className="property-group">
        <label>
          <input
            type="checkbox"
            checked={config.required}
            onChange={(e) => onChange(section.id, { ...config, required: e.target.checked })}
          />
          Required Field
        </label>
      </div>
      <div className="property-group">
        <label>Default Font Size</label>
        <input
          type="number"
          value={config.fontSize}
          onChange={(e) => onChange(section.id, { ...config, fontSize: parseInt(e.target.value) })}
          min="8"
          max="72"
        />
      </div>
      <div className="property-group">
        <label>Default Text Color</label>
        <input
          type="color"
          value={config.textColor}
          onChange={(e) => onChange(section.id, { ...config, textColor: e.target.value })}
        />
      </div>
      <div className="property-group">
        <label>Default Alignment</label>
        <select
          value={config.alignment}
          onChange={(e) => onChange(section.id, { ...config, alignment: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );
};

const ImageProperties: React.FC<{ section: TTemplateSection; onChange: (id: string, config: any) => void }> = ({ section, onChange }) => {
  const config = section.config as TImageConfig;
  
  return (
    <div className="property-groups">
      <div className="property-group">
        <label>Section Label</label>
        <input
          type="text"
          value={config.label}
          onChange={(e) => onChange(section.id, { ...config, label: e.target.value })}
          placeholder="Enter section label"
        />
      </div>
      <div className="property-group">
        <label>Description</label>
        <textarea
          value={config.description || ''}
          onChange={(e) => onChange(section.id, { ...config, description: e.target.value })}
          placeholder="Describe what image goes here"
          rows={2}
        />
      </div>
      <div className="property-group">
        <label>
          <input
            type="checkbox"
            checked={config.required}
            onChange={(e) => onChange(section.id, { ...config, required: e.target.checked })}
          />
          Required Field
        </label>
      </div>
      <div className="property-group">
        <label>Max Width (px)</label>
        <input
          type="number"
          value={config.maxWidth || ''}
          onChange={(e) => onChange(section.id, { ...config, maxWidth: parseInt(e.target.value) || undefined })}
          placeholder="Optional"
        />
      </div>
      <div className="property-group">
        <label>Max Height (px)</label>
        <input
          type="number"
          value={config.maxHeight || ''}
          onChange={(e) => onChange(section.id, { ...config, maxHeight: parseInt(e.target.value) || undefined })}
          placeholder="Optional"
        />
      </div>
      <div className="property-group">
        <label>Allowed Types</label>
        <input
          type="text"
          value={config.allowedTypes?.join(', ') || ''}
          onChange={(e) => onChange(section.id, { ...config, allowedTypes: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
          placeholder="jpg, png, gif, webp"
        />
      </div>
      <div className="property-group">
        <label>Default Alignment</label>
        <select
          value={config.alignment}
          onChange={(e) => onChange(section.id, { ...config, alignment: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div className="property-group">
        <label>
          <input
            type="checkbox"
            checked={config.clickable}
            onChange={(e) => onChange(section.id, { ...config, clickable: e.target.checked })}
          />
          Allow linking
        </label>
      </div>
    </div>
  );
};

const FileProperties: React.FC<{ section: TTemplateSection; onChange: (id: string, config: any) => void }> = ({ section, onChange }) => {
  const config = section.config as TFileConfig;
  
  return (
    <div className="property-groups">
      <div className="property-group">
        <label>Section Label</label>
        <input
          type="text"
          value={config.label}
          onChange={(e) => onChange(section.id, { ...config, label: e.target.value })}
          placeholder="Enter section label"
        />
      </div>
      <div className="property-group">
        <label>Description</label>
        <textarea
          value={config.description || ''}
          onChange={(e) => onChange(section.id, { ...config, description: e.target.value })}
          placeholder="Describe what file goes here"
          rows={2}
        />
      </div>
      <div className="property-group">
        <label>
          <input
            type="checkbox"
            checked={config.required}
            onChange={(e) => onChange(section.id, { ...config, required: e.target.checked })}
          />
          Required Field
        </label>
      </div>
      <div className="property-group">
        <label>Allowed File Types</label>
        <input
          type="text"
          value={config.allowedTypes?.join(', ') || ''}
          onChange={(e) => onChange(section.id, { ...config, allowedTypes: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
          placeholder="pdf, doc, docx, xls, xlsx, txt"
        />
      </div>
      <div className="property-group">
        <label>Max File Size</label>
        <input
          type="text"
          value={config.maxSize || ''}
          onChange={(e) => onChange(section.id, { ...config, maxSize: e.target.value })}
          placeholder="e.g., 10MB"
        />
      </div>
      <div className="property-group">
        <label>Default File Type</label>
        <select
          value={config.fileType || 'pdf'}
          onChange={(e) => onChange(section.id, { ...config, fileType: e.target.value })}
        >
          <option value="pdf">PDF</option>
          <option value="doc">Document</option>
          <option value="xls">Spreadsheet</option>
          <option value="txt">Text</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );
};

const CCProperties: React.FC<{ section: TTemplateSection; onChange: (id: string, config: any) => void }> = ({ section, onChange }) => {
  const config = section.config as TCCConfig;
  
  return (
    <div className="property-groups">
      <div className="property-group">
        <label>Section Label</label>
        <input
          type="text"
          value={config.label}
          onChange={(e) => onChange(section.id, { ...config, label: e.target.value })}
          placeholder="Enter section label"
        />
      </div>
      <div className="property-group">
        <label>Description</label>
        <textarea
          value={config.description || ''}
          onChange={(e) => onChange(section.id, { ...config, description: e.target.value })}
          placeholder="Describe what CC recipients go here"
          rows={2}
        />
      </div>
      <div className="property-group">
        <label>
          <input
            type="checkbox"
            checked={config.required}
            onChange={(e) => onChange(section.id, { ...config, required: e.target.checked })}
          />
          Required Field
        </label>
      </div>
      <div className="property-group">
        <label>
          <input
            type="checkbox"
            checked={config.showInEmail || false}
            onChange={(e) => onChange(section.id, { ...config, showInEmail: e.target.checked })}
          />
          Show CC in email
        </label>
      </div>
    </div>
  );
};

const BCCProperties: React.FC<{ section: TTemplateSection; onChange: (id: string, config: any) => void }> = ({ section, onChange }) => {
  const config = section.config as TBCCConfig;
  
  return (
    <div className="property-groups">
      <div className="property-group">
        <label>Section Label</label>
        <input
          type="text"
          value={config.label}
          onChange={(e) => onChange(section.id, { ...config, label: e.target.value })}
          placeholder="Enter section label"
        />
      </div>
      <div className="property-group">
        <label>Description</label>
        <textarea
          value={config.description || ''}
          onChange={(e) => onChange(section.id, { ...config, description: e.target.value })}
          placeholder="Describe what BCC recipients go here"
          rows={2}
        />
      </div>
      <div className="property-group">
        <label>
          <input
            type="checkbox"
            checked={config.required}
            onChange={(e) => onChange(section.id, { ...config, required: e.target.checked })}
          />
          Required Field
        </label>
      </div>
      <div className="property-group">
        <label>
          <input
            type="checkbox"
            checked={config.hideFromRecipients || true}
            onChange={(e) => onChange(section.id, { ...config, hideFromRecipients: e.target.checked })}
          />
          Hide from recipients
        </label>
      </div>
    </div>
  );
};

export default DragDropTemplateModal; 