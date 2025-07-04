import React, { useState } from 'react';
import '../../styles/EmailTemplatesList.css';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { createEmailTemplate } from '../../api';
import AddEmailTemplateModal from './components/AddEmailTemplateModal';
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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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

  const handleAddTemplate = async (templateData: { 
    template_name: string; 
    template_subject: string; 
    template_body: string; 
    active: boolean; 
  }) => {
    const newTemplate = {
      title: templateData.template_name,
      template_name: templateData.template_name,
      template_subject: templateData.template_subject,
      template_body: templateData.template_body,
      active: templateData.active,
    };

    try {
      // Use the API function to create template in Contentstack
      await createEmailTemplate(dispatch, { entry: newTemplate });
    } catch (error) {
      console.error('Error creating email template:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="email-templates-list-container">
      <div className="email-templates-list-header">
        <h1>Email Templates Management</h1>
        <button
          onClick={handleOpenModal}
          className="add-template-button"
        >
          + Add New Template
        </button>
      </div>

      {emailTemplates.length === 0 ? (
        <div className="no-templates-container">
          <h3 className="no-templates-title">No email templates found</h3>
          <p className="no-templates-description">Get started by adding your first email template</p>
          <button
            onClick={handleOpenModal}
            className="add-first-template-button"
          >
            Add First Template
          </button>
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
                  <p className="template-subject">
                    <strong>Subject:</strong> {template.template_subject}
                  </p>
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