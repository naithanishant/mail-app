import React, { useState, useEffect } from 'react';
import { Button } from '@contentstack/venus-components';
import '../../styles/EmailTemplatesList.css';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { createTemplateContentType, fetchCustomTemplatesData } from '../../api/index';
import { TCreateCustomTemplateInput } from '../../types/index';
import DragDropTemplateModal from './components/DragDropTemplateModal';
import { useToast } from '../../contexts/ToastContext';

interface CustomTemplate {
  uid: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  schema: any[];
}

const EmailTemplatesList: React.FC<any> = () => {
  const customTemplates = useSelector((state: RootState) => state.main.customTemplates);
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToast();
  const [isDragDropModalOpen, setIsDragDropModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CustomTemplate | null>(null);

  // Fetch custom templates on component mount
  useEffect(() => {
    fetchCustomTemplatesData(dispatch);
  }, [dispatch]);

  const handleOpenDragDropModal = () => {
    setIsDragDropModalOpen(true);
  };

  const handleCloseDragDropModal = () => {
    setIsDragDropModalOpen(false);
  };

  const handleViewTemplate = (template: CustomTemplate) => {
    setSelectedTemplate(template);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedTemplate(null);
  };

  // Handle custom drag-drop template creation
  const handleDragDropTemplate = async (templateData: TCreateCustomTemplateInput) => {
    try {
      await createTemplateContentType(templateData.dragDropData);
      // Refresh custom templates list after creation
      fetchCustomTemplatesData(dispatch);
      showSuccess('Template created successfully!');
    } catch (error) {
      console.error('Error creating custom template:', error);
      showError(`Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get field count for template preview
  const getFieldCount = (schema: any[]) => {
    return schema ? schema.length : 0;
  };

  return (
    <div className="email-templates-list-container">
      <div className="email-templates-list-header">
        <h1 className="heading-2">Custom Email Templates</h1>
        <div className="header-buttons">
          <Button
            onClick={handleOpenDragDropModal}
            className="add-custom-template-button"
          >
            🎨 Create Custom Template
          </Button>
        </div>
      </div>

      {!customTemplates || customTemplates.length === 0 ? (
        <div className="no-templates-container">
          <h3 className="heading-4">No custom templates found</h3>
          <p className="body-normal">Get started by creating your first custom email template</p>
          <div className="first-template-buttons">
            <Button
              onClick={handleOpenDragDropModal}
              className="add-first-custom-template-button"
            >
              🎨 Create Custom Template
            </Button>
          </div>
        </div>
      ) : (
        <div className="templates-grid">
          {customTemplates.map((template: CustomTemplate, index: number) => (
            <div
              key={`custom-template-${template.uid}-${index}`}
              className="template-card clickable"
              onClick={() => handleViewTemplate(template)}
            >
              <div className="template-card-content">
                <div className="template-details">
                  <h3 className="heading-6">
                    {template.title}
                  </h3>
                  <p className="body-small">
                    <strong>Description:</strong> {template.description || 'No description'}
                  </p>
                  <p className="body-small">
                    <strong>Fields:</strong> {getFieldCount(template.schema)} custom fields
                  </p>
                  <p className="caption">
                    <strong>Created:</strong> {formatDate(template.created_at)}
                  </p>
                </div>
                <div className="active-badge active">
                  CUSTOM
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {customTemplates && customTemplates.length > 0 && (
        <div className="templates-count">
          <p className="body-small">Total Custom Templates: {customTemplates.length}</p>
        </div>
      )}

      <DragDropTemplateModal
        isOpen={isDragDropModalOpen}
        onClose={handleCloseDragDropModal}
        onSaveTemplate={handleDragDropTemplate}
      />
      
      {selectedTemplate && (
        <div className="template-view-modal">
          <div className="template-view-content">
            <div className="template-view-header">
              <h2>{selectedTemplate.title}</h2>
              <Button 
                onClick={handleCloseViewModal}
                className="close-button"
                buttonType="tertiary"
              >
                ×
              </Button>
            </div>
            <div className="template-view-body">
              <p><strong>Description:</strong> {selectedTemplate.description || 'No description'}</p>
              <p><strong>UID:</strong> {selectedTemplate.uid}</p>
              <div className="template-schema">
                <h4>Template Fields ({getFieldCount(selectedTemplate.schema)}):</h4>
                {selectedTemplate.schema && selectedTemplate.schema.length > 0 ? (
                  <ul className="schema-list">
                    {selectedTemplate.schema.map((field: any, index: number) => (
                      <li key={`field-${index}`} className="schema-item">
                        <strong>{field.display_name}</strong> ({field.data_type})
                        {field.field_metadata?.description && (
                          <span className="field-description"> - {field.field_metadata.description}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No fields defined for this template.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplatesList; 