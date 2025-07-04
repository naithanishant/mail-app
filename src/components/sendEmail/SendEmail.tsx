import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { TEmailForm, TEmailFormErrors, TSelectedUser, TEmailTag, TUsersData } from '../../types';
import '../../styles/SendEmail.css';
import RichTextEditor from '../shared/RichTextEditor/RichTextEditor';
import { validateRTEContent, normalizeRTEContent } from '../../utils/rteUtils';

const SendEmail: React.FC = () => {
  const { usersData, emailTemplates } = useSelector((state: RootState) => state.main);
  const [formData, setFormData] = useState<TEmailForm>({
    subject: '',
    body: '',
    recipients: [],
    tags: []
  });
  const [errors, setErrors] = useState<TEmailFormErrors>({});
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<TUsersData[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const userSearchRef = useRef<HTMLDivElement>(null);

  // Filter users based on search query
  useEffect(() => {
    if (userSearchQuery.trim()) {
      const filtered = usersData.filter(user => 
        user.first_name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(usersData);
    }
  }, [userSearchQuery, usersData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userSearchRef.current && !userSearchRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Rich text editor configuration is now handled by the shared RichTextEditor component

  const handleSubjectChange = (value: string) => {
    setFormData(prev => ({ ...prev, subject: value }));
    if (errors.subject) {
      setErrors(prev => ({ ...prev, subject: undefined }));
    }
  };

  const handleBodyChange = (value: string) => {
    // Normalize the content to ensure consistent format
    const normalizedValue = normalizeRTEContent(value);
    
    setFormData(prev => ({ ...prev, body: normalizedValue }));
    if (errors.body) {
      setErrors(prev => ({ ...prev, body: undefined }));
    }
  };

  const handleTemplateSelect = (templateUid: string) => {
    setSelectedTemplate(templateUid);
    
    if (templateUid === '') {
      // Clear fields when "None" is selected
      setFormData(prev => ({
        ...prev,
        subject: '',
        body: ''
      }));
      return;
    }

    // Find the selected template by uid
    const template = emailTemplates.find(t => t.uid === templateUid);
    
    if (template) {
      const normalizedBody = normalizeRTEContent(template.template_body);
      
      setFormData(prev => ({
        ...prev,
        subject: template.template_subject,
        body: normalizedBody
      }));
      
      // Clear any existing errors for subject and body
      setErrors(prev => ({
        ...prev,
        subject: undefined,
        body: undefined
      }));
    }
  };

  const handleUserSelect = (user: TUsersData) => {
    const selectedUser: TSelectedUser = {
      id: user.email, // Using email as ID since it's unique
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      subscribed: user.subscribed
    };

    // Check if user is already selected
    const isAlreadySelected = formData.recipients.some(recipient => recipient.id === selectedUser.id);
    
    if (!isAlreadySelected) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, selectedUser]
      }));
    }

    setUserSearchQuery('');
    setShowUserDropdown(false);
    if (errors.recipients) {
      setErrors(prev => ({ ...prev, recipients: undefined }));
    }
  };

  const handleRemoveRecipient = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(recipient => recipient.id !== userId)
    }));
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag: TEmailTag = {
        id: Date.now().toString(),
        label: tagInput.trim(),
        value: tagInput.trim()
      };

      // Check if tag already exists
      const tagExists = formData.tags.some(tag => tag.value.toLowerCase() === newTag.value.toLowerCase());
      
      if (!tagExists) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }

      setTagInput('');
      if (errors.tags) {
        setErrors(prev => ({ ...prev, tags: undefined }));
      }
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag.id !== tagId)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: TEmailFormErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    // Use consistent RTE validation
    const bodyError = validateRTEContent(formData.body, 'Email body');
    if (bodyError) {
      newErrors.body = bodyError;
    }

    if (formData.recipients.length === 0) {
      newErrors.recipients = 'At least one recipient is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Email Data:', formData);
      
      // Reset form after successful submission
      setFormData({
        subject: '',
        body: '',
        recipients: [],
        tags: []
      });
      setSelectedTemplate('');
      
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="send-email-container">
      <div className="send-email-header">
        <h1>Send Email</h1>
        <p>Create and send personalized emails to your subscribers</p>
      </div>

      <form onSubmit={handleSubmit} className="send-email-form">
        {/* Template Selection */}
        <div className="form-group">
          <label htmlFor="template" className="form-label">
            Select Template (Optional)
          </label>
          <select
            id="template"
            value={selectedTemplate}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className="form-input template-select"
          >
            <option value="">None - Start from scratch</option>
            {emailTemplates
              .filter(template => template.active) // Only show active templates
              .map((template) => (
                <option key={template.uid} value={template.uid}>
                  {template.template_name}
                </option>
              ))}
          </select>
          {selectedTemplate && (
            <p className="template-info">
              Template selected: The subject and body have been pre-filled. You can edit them before sending.
            </p>
          )}
        </div>

        {/* Subject Field */}
        <div className="form-group">
          <label htmlFor="subject" className="form-label">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className={`form-input ${errors.subject ? 'error' : ''}`}
            placeholder="Enter email subject"
          />
          {errors.subject && <span className="error-message">{errors.subject}</span>}
        </div>

        {/* Recipients Field */}
        <div className="form-group">
          <label className="form-label">Recipients *</label>
          <div className="recipients-container">
            <div className="selected-recipients">
              {formData.recipients.map((recipient) => (
                <div key={recipient.id} className="recipient-tag">
                  <span>{recipient.name} ({recipient.email})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipient(recipient.id)}
                    className="remove-recipient"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="user-search-container" ref={userSearchRef}>
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                onFocus={() => setShowUserDropdown(true)}
                className={`form-input ${errors.recipients ? 'error' : ''}`}
                placeholder="Search and select users..."
              />
              {showUserDropdown && filteredUsers.length > 0 && (
                <div className="user-dropdown">
                  {filteredUsers.slice(0, 10).map((user) => (
                    <div
                      key={user.email}
                      className="user-dropdown-item"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="user-info">
                        <span className="user-name">{user.first_name} {user.last_name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                      <span className={`user-status ${user.subscribed ? 'subscribed' : 'unsubscribed'}`}>
                        {user.subscribed ? 'Subscribed' : 'Unsubscribed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {errors.recipients && <span className="error-message">{errors.recipients}</span>}
        </div>

        {/* Tags Field */}
        <div className="form-group">
          <label className="form-label">Tags</label>
          <div className="tags-container">
            <div className="selected-tags">
              {formData.tags.map((tag) => (
                <div key={tag.id} className="tag-item">
                  <span>{tag.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id)}
                    className="remove-tag"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagAdd}
              className="form-input"
              placeholder="Add tags (press Enter to add)"
            />
          </div>
          {errors.tags && <span className="error-message">{errors.tags}</span>}
        </div>

        {/* Body Field */}
        <div className="form-group">
          <label className="form-label">Email Body *</label>
          <RichTextEditor
            value={formData.body}
            onChange={handleBodyChange}
            placeholder="Write your email content here..."
            hasError={!!errors.body}
            minHeight={200}
            maxHeight={400}
          />
          {errors.body && <span className="error-message">{errors.body}</span>}
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className="send-button"
          >
            {isSubmitting ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendEmail; 