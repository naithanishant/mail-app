import React, { useState } from 'react';
import '../../styles/EmailTemplatesList.css';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { createDragDropTemplateWithContentType, createEmailTemplate, createTemplateContentType } from '../../api/index';
import { TCreateEmailTemplateInput, TCreateCustomTemplateInput } from '../../types/index';
import AddEmailTemplateModal from './components/AddEmailTemplateModal';
import DragDropTemplateModal from './components/DragDropTemplateModal';
import { truncateRTEContent } from '../../utils/rteUtils';

interface EmailTemplate {
  uid: string;
  template_name: string;
  template_subject: string;
  template_body: string;
  active: boolean;
}

const EmailTemplatesList: React.FC<any> = () => {
  const emailTemplates = useSelector((state: RootState) => state.main.emailTemplates);
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragDropModalOpen, setIsDragDropModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenDragDropModal = () => {
    setIsDragDropModalOpen(true);
  };

  const handleCloseDragDropModal = () => {
    setIsDragDropModalOpen(false);
  };

  const handleViewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedTemplate(null);
  };

  // Using shared RTE utility for consistent content handling

  // Handle regular template creation (with subject)
  const handleAddTemplate = async (templateData: TCreateEmailTemplateInput) => {
    try {
      console.log("Adding regular template with data:", templateData);
      
      await createEmailTemplate(dispatch, { entry: templateData });
      console.log("Regular template created successfully");
      
    } catch (error) {
      console.error('Error creating regular email template:', error);
      alert(`Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle custom drag-drop template creation (template name only)
  const handleDragDropTemplate = async (templateData: any) => {
    console.log("templateData", templateData);
    
    try {
      await createTemplateContentType(templateData)
    } catch (error) {
      console.error('Error creating drag-drop template:', error);
      alert(`Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="email-templates-list-container">
      <div className="email-templates-list-header">
        <h1>Email Templates Management</h1>
        <div className="header-buttons">
          <button
            onClick={handleOpenModal}
            className="add-template-button"
          >
            + Add Simple Template
          </button>
          <button
            onClick={handleOpenDragDropModal}
            className="add-custom-template-button"
          >
            🎨 Create Custom Template
          </button>
        </div>
      </div>

      {emailTemplates.length === 0 ? (
        <div className="no-templates-container">
          <h3 className="no-templates-title">No email templates found</h3>
          <p className="no-templates-description">Get started by adding your first email template</p>
          <div className="first-template-buttons">
            <button
              onClick={handleOpenModal}
              className="add-first-template-button"
            >
              Add Simple Template
            </button>
            <button
              onClick={handleOpenDragDropModal}
              className="add-first-custom-template-button"
            >
              🎨 Create Custom Template
            </button>
          </div>
        </div>
      ) : (
        <div className="templates-grid">
          {emailTemplates.map((template, index) => (
            <div
              key={`template-card-${index}`}
              className="template-card clickable"
              onClick={() => handleViewTemplate(template)}
            >
              <div className="template-card-content">
                <div className="template-details">
                  <h3 className="template-name">
                    {template.template_name}
                  </h3>
                  <p className="template-body">
                    <strong>Body:</strong> {truncateRTEContent(template.template_body, 100)}
                  </p>
                </div>
                <div className={`active-badge ${template.active ? 'active' : 'inactive'}`}>
                  {template.active ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {emailTemplates.length > 0 && (
        <div className="templates-count">
          Total Templates: {emailTemplates.length}
        </div>
      )}

      <AddEmailTemplateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddTemplate={handleAddTemplate}
      />

      <DragDropTemplateModal
        isOpen={isDragDropModalOpen}
        onClose={handleCloseDragDropModal}
        onSaveTemplate={handleDragDropTemplate}
      />
      
      {selectedTemplate && (
        <AddEmailTemplateModal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          onAddTemplate={() => {}} // No-op for view mode
          isViewMode={true}
          templateData={selectedTemplate}
        />
      )}
    </div>
  );
};

export default EmailTemplatesList; 