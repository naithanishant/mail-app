import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@contentstack/venus-components';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
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
  TBackgroundConfig,
  TFontStyleConfig,
  TLinkConfig,
  TCCConfig,
  TBCCConfig
} from '../../../schemas/templateSchema';
import { createTemplateContentType } from '../../../api/index';
import { TCreateCustomTemplateInput } from '../../../types/index';
import RichTextEditor from '../../shared/RichTextEditor/RichTextEditor';
import { validateRTEContent, normalizeRTEContent } from '../../../utils/rteUtils';
import { useToast } from '../../../contexts/ToastContext';

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
  { id: 'image', type: 'image', name: 'Image', description: 'Select image from Contentstack assets', icon: '🖼️' },
  { id: 'file', type: 'file', name: 'File', description: 'Select file from Contentstack assets', icon: '📎' },
  // { id: 'background', type: 'background', name: 'Background', description: 'Set background color or image', icon: '🎨' },
  // { id: 'fontstyle', type: 'fontstyle', name: 'Font Style', description: 'Configure font settings', icon: '🔤' },
  { id: 'link', type: 'link', name: 'Link', description: 'Add clickable link', icon: '🔗' },
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
  // Create initial template with default text section
  const createInitialTemplate = () => {
    const newTemplate = createNewTemplate(`Custom Template ${Date.now()}`);
    const defaultTextSection = createNewSection('text', 0);
    
    return {
      template: {
        ...newTemplate,
        sections: [defaultTextSection]
      },
      defaultSectionId: defaultTextSection.id
    };
  };

  const initialData = createInitialTemplate();
  const [template, setTemplate] = useState<any>(initialData.template);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(initialData.defaultSectionId);
  const [draggedSectionType, setDraggedSectionType] = useState<TSectionType | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{
    templateName?: string;
    contentType?: string;
    sections?: string;
    general?: string;
  }>({});
  const [isCreating, setIsCreating] = useState(false);
  const { showSuccess, showError, showWarning } = useToast();

  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Clear errors when template changes
  useEffect(() => {
    setErrors({});
  }, [template.template_name, template.sections]);

  useEffect(() => {
    if (existingTemplate) {
      setTemplate(existingTemplate);
      // Set the first section as selected if there are sections
      if (existingTemplate.sections && existingTemplate.sections.length > 0) {
        setSelectedSectionId(existingTemplate.sections[0].id);
      } else {
        setSelectedSectionId(null);
      }
    } else {
      // Create new template with default text section
      const initialData = createInitialTemplate();
      setTemplate(initialData.template);
      setSelectedSectionId(initialData.defaultSectionId);
    }
    setErrors({});
  }, [existingTemplate, isOpen]);



  const clearError = (field: keyof typeof errors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const setError = (field: keyof typeof errors, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const handleDragStart = (e: React.DragEvent, sectionType: TSectionType) => {
    // Check if CC, BCC, or Link already exists in template
    if ((sectionType === 'cc' || sectionType === 'bcc') && 
        template.sections.some((section: any) => section.type === sectionType)) {
      e.preventDefault();
      const sectionName = sectionType.toUpperCase();
      setError('sections', `${sectionName} section already exists. Only one ${sectionName} section is allowed per template.`);
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

    // Additional check to prevent dropping CC/BCC/Link if they already exist
    if ((draggedSectionType === 'cc' || draggedSectionType === 'bcc') && 
        template.sections.some((section: any) => section.type === draggedSectionType)) {
      setDraggedSectionType(null);
      setIsDragging(false);
      const sectionName = draggedSectionType.toUpperCase();
      setError('sections', `${sectionName} section already exists. Only one ${sectionName} section is allowed per template.`);
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
    
    // Trigger validation when template name changes
    if (field === 'template_name') {
      // Clear errors first
      setErrors({});
      
      // Validate after a short delay to avoid showing errors while typing
      setTimeout(() => {
        const newErrors: typeof errors = {};
        
        if (!value || value.trim() === '' || value.trim() === 'Custom Template') {
          newErrors.templateName = 'Please enter a unique template name';
        } else if (value.trim().length < 3) {
          newErrors.templateName = 'Template name must be at least 3 characters long';
        }
        
        setErrors(newErrors);
      }, 500);
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    // Template name validation
    if (!template.template_name || template.template_name.trim() === '' || template.template_name.trim() === 'Custom Template') {
      newErrors.templateName = 'Please enter a unique template name';
    } else if (template.template_name.trim().length < 3) {
      newErrors.templateName = 'Template name must be at least 3 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    // Check if template name is valid
    const templateName = template.template_name;
    const isTemplateNameValid = templateName && 
           templateName.trim() !== '' && 
           templateName.trim() !== 'Custom Template' && 
           templateName.trim().length >= 3;
    
    // Check if there are any form errors
    const hasErrors = Object.keys(errors).some(key => errors[key as keyof typeof errors]);
    
    return isTemplateNameValid && !hasErrors;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // Prepare template data with drag-drop structure
      const templateData: TCreateCustomTemplateInput = {
        template_name: template.template_name.trim(),
        template_body: "", // Will be generated from sections
        active: true,
        isDragDropTemplate: true,
        dragDropData: {
          ...template,
          // Ensure template name is included in dragDropData
          template_name: template.template_name.trim()
        }
      };
      
      // Pass the template data to the parent component
      // The parent will handle the complete workflow (content type + template creation)
      onSaveTemplate(templateData);
      onClose();
      
    } catch (error) {
      console.error("Error saving template:", error);
      showError(`Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCreateContentTypeOnly = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsCreating(true);
      
      // Prepare template data with drag-drop structure (same format as handleSave)
      const templateData: TCreateCustomTemplateInput = {
        template_name: template.template_name.trim(),
        template_body: "", // Will be generated from sections
        active: true,
        isDragDropTemplate: true,
        dragDropData: {
          ...template,
          // Ensure template name is included in dragDropData
          template_name: template.template_name.trim()
        }
      };
      
      onSaveTemplate(templateData);
      onClose();
    } catch (error) {
      console.error("Error creating content type:", error);
      showError(`Failed to create content type: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          <Button 
            className="section-move-btn"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleSectionMove(section.id, 'up');
            }}
            disabled={section.order === 0}
            buttonType="tertiary"
          >
            ↑
          </Button>
          <Button 
            className="section-move-btn"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleSectionMove(section.id, 'down');
            }}
            disabled={section.order === template.sections.length - 1}
            buttonType="tertiary"
          >
            ↓
          </Button>
          <Button 
            className="section-delete-btn"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleSectionDelete(section.id);
            }}
            buttonType="tertiary"
          >
            ×
          </Button>
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
        return (
          <div className="text-preview">
            <div className="section-label">
              <strong>📝 Text Section</strong>
            </div>
            <div className="section-placeholder">
              [Text content will be configured here]
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="image-preview">
            <div className="section-label">
              <strong>🖼️ Image Section</strong>
            </div>
            <div className="section-placeholder">
              [Image from Contentstack assets will be configured here]
            </div>
          </div>
        );
      
      case 'file':
        return (
          <div className="file-preview">
            <div className="section-label">
              <strong>📎 File Section</strong>
            </div>
            <div className="section-placeholder">
              [File from Contentstack assets will be configured here]
            </div>
          </div>
        );
      
      case 'link':
        return (
          <div className="link-preview">
            <div className="section-label">
              <strong>🔗 Link Section</strong>
            </div>
            <div className="section-placeholder">
              [Link with text and URL will be configured here]
            </div>
          </div>
        );
      
      case 'cc':
        return (
          <div className="cc-preview">
            <div className="section-label">
              <strong>👥 CC Section</strong>
            </div>
            <div className="section-placeholder">
              [CC recipients will be configured here]
            </div>
          </div>
        );
      
      case 'bcc':
        return (
          <div className="bcc-preview">
            <div className="section-label">
              <strong>👤 BCC Section</strong>
            </div>
            <div className="section-placeholder">
              [BCC recipients will be configured here]
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
              placeholder="Enter a unique template name (min 3 characters)"
              className={`template-name-input ${errors.templateName ? 'error' : ''}`}
              maxLength={50}
            />
            {errors.templateName && <p className="error-message">{errors.templateName}</p>}
          </div>
        </div>
        
        {/* Separator */}
        <div className="properties-separator"></div>
        
        {/* Simple schema creation message */}
        <div className="template-settings-section">
          <h3>Schema Creation</h3>
          <p className="settings-hint">Add sections to create the email template schema. Section properties will be configured later.</p>
        </div>
      </div>
    );
  };



  if (!isOpen) return null;

  return (
    <div className="drag-drop-modal-overlay">
      <div className="drag-drop-modal">
        <div className="modal-header">
          <h2>Custom Template Builder</h2>
          <div className="header-actions">
            <Button className="close-btn" onClick={onClose} buttonType="tertiary">
               ×
            </Button>
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
                  const isAlreadyAdded = (item.type === 'cc' || item.type === 'bcc' || item.type === 'link') && 
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
                         <Button className="cancel-btn" onClick={onClose} buttonType="secondary">
                Cancel
             </Button>
             <Button className="content-type-btn" onClick={handleCreateContentTypeOnly} disabled={isCreating || !isFormValid()} buttonType="primary">
                {isCreating ? 'Creating...' : 'Create Content Type Only'}
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};



export default DragDropTemplateModal; 