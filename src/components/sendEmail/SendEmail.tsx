import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { RootState } from '../../store';
import { TEmailForm, TEmailFormErrors, TSelectedUser, TEmailTag, TUsersData } from '../../types';
import '../../styles/SendEmail.css';

const SendEmail: React.FC = () => {
  const { usersData } = useSelector((state: RootState) => state.main);
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

  // Rich text editor configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image']
    ],
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'color', 'background', 'align', 'script'
  ];

  const handleSubjectChange = (value: string) => {
    setFormData(prev => ({ ...prev, subject: value }));
    if (errors.subject) {
      setErrors(prev => ({ ...prev, subject: undefined }));
    }
  };

  const handleBodyChange = (value: string) => {
    setFormData(prev => ({ ...prev, body: value }));
    if (errors.body) {
      setErrors(prev => ({ ...prev, body: undefined }));
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

    if (!formData.body.trim() || formData.body.trim() === '<p><br></p>') {
      newErrors.body = 'Email body is required';
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
          <div className={`quill-container ${errors.body ? 'error' : ''}`}>
            <ReactQuill
              value={formData.body}
              onChange={handleBodyChange}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Write your email content here..."
              theme="snow"
            />
          </div>
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