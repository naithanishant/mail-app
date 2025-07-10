import React, { useState, useEffect } from 'react';
import '../../../styles/AddEmailTemplateModal.css';
import RichTextEditor from '../../shared/RichTextEditor/RichTextEditor';
import { validateRTEContent, normalizeRTEContent } from '../../../utils/rteUtils';

interface AddEmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTemplate: (templateData: { 
    template_name: string; 
    template_subject: string; 
    template_body: string; 
    active: boolean; 
  }) => void;
  isViewMode?: boolean;
  templateData?: {
    uid: string;
    template_name: string;
    template_subject: string;
    template_body: string;
    active: boolean;
  };
}

const AddEmailTemplateModal: React.FC<AddEmailTemplateModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddTemplate,
  isViewMode = false,
  templateData
}) => {
  const [formData, setFormData] = useState({
    template_name: '',
    template_subject: '',
    template_body: '',
    active: true
  });

  const [errors, setErrors] = useState({
    template_name: '',
    template_subject: '',
    template_body: ''
  });

  // Populate form data when in view mode
  useEffect(() => {
    if (isViewMode && templateData) {
      setFormData({
        template_name: templateData.template_name || '',
        template_subject: templateData.template_subject || '',
        template_body: templateData.template_body || '',
        active: templateData.active || false
      });
    }
  }, [isViewMode, templateData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleQuillChange = (value: string) => {
    // Normalize the content to ensure consistent format
    const normalizedValue = normalizeRTEContent(value);
    
    setFormData(prev => ({
      ...prev,
      template_body: normalizedValue
    }));
    
    // Clear error when user starts typing
    if (errors.template_body) {
      setErrors(prev => ({
        ...prev,
        template_body: ''
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validateForm = () => {
    const newErrors = {
      template_name: '',
      template_subject: '',
      template_body: ''
    };

    if (!formData.template_name.trim()) {
      newErrors.template_name = 'Template name is required';
    }

    if (!formData.template_subject.trim()) {
      newErrors.template_subject = 'Template subject is required';
    }

    // Use consistent RTE validation
    const bodyError = validateRTEContent(formData.template_body, 'Template body');
    if (bodyError) {
      newErrors.template_body = bodyError;
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't submit if in view mode
    if (isViewMode) {
      return;
    }
    
    if (validateForm()) {
      onAddTemplate(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      template_name: '',
      template_subject: '',
      template_body: '',
      active: true
    });
    setErrors({
      template_name: '',
      template_subject: '',
      template_body: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isViewMode ? 'View Email Template' : 'Add New Email Template'}</h2>
          <button className="modal-close-button" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="template_name">Template Name *</label>
            <input
              type="text"
              id="template_name"
              name="template_name"
              value={formData.template_name}
              onChange={handleInputChange}
              className={errors.template_name ? 'error' : ''}
              placeholder="Enter template name"
              readOnly={isViewMode}
            />
            {errors.template_name && <span className="error-message">{errors.template_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="template_subject">Subject *</label>
            <input
              type="text"
              id="template_subject"
              name="template_subject"
              value={formData.template_subject}
              onChange={handleInputChange}
              className={errors.template_subject ? 'error' : ''}
              placeholder="Enter email subject"
              readOnly={isViewMode}
            />
            {errors.template_subject && <span className="error-message">{errors.template_subject}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="template_body">Body *</label>
            <RichTextEditor
              value={formData.template_body}
              onChange={handleQuillChange}
              placeholder="Enter email body"
              readOnly={isViewMode}
              hasError={!!errors.template_body}
              minHeight={200}
              maxHeight={400}
            />
            {errors.template_body && <span className="error-message">{errors.template_body}</span>}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleCheckboxChange}
                disabled={isViewMode}
              />
              Active Template
            </label>
          </div>

        </form>
          <div className="modal-actions">
            {isViewMode ? (
              <button type="button" className="cancel-button" onClick={handleClose}>
                Close
              </button>
            ) : (
              <>
                <button type="button" className="cancel-button" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Add Template
                </button>
              </>
            )}
          </div>
      </div>
    </div>
  );
};

export default AddEmailTemplateModal; 