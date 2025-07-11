import React from 'react';
import { TContentTypeField, TDynamicFieldValue, TSelectedUser, TEmailTag, TUsersData } from '../../types';
import DynamicFormField from './DynamicFormField';

interface FieldRendererProps {
  field: TContentTypeField;
  fieldValue: TDynamicFieldValue | undefined;
  fieldError: string | undefined;
  isSubmitting: boolean;
  // Recipients handling
  recipients: TSelectedUser[];
  userSearchQuery: string;
  showUserDropdown: boolean;
  filteredUsers: TUsersData[];
  userSearchRef: React.RefObject<HTMLDivElement>;
  onUserSearchChange: (query: string) => void;
  onUserSearchFocus: () => void;
  onUserSelect: (user: TUsersData) => void;
  onRemoveRecipient: (userId: string) => void;
  // Tags handling
  tags: TEmailTag[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onTagAdd: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemoveTag: (tagId: string) => void;
  // Field change handler
  onDynamicFieldChange: (fieldUID: string, value: TDynamicFieldValue) => void;
}

export const renderFieldBySchema = (props: FieldRendererProps): React.ReactNode => {
  const {
    field,
    fieldValue,
    fieldError,
    isSubmitting,
    recipients,
    userSearchQuery,
    showUserDropdown,
    filteredUsers,
    userSearchRef,
    onUserSearchChange,
    onUserSearchFocus,
    onUserSelect,
    onRemoveRecipient,
    tags,
    tagInput,
    onTagInputChange,
    onTagAdd,
    onRemoveTag,
    onDynamicFieldChange
  } = props;

  const hasFieldError = Boolean(fieldError);

  // Skip any link fields that are not text or url
  if (field.uid.includes('link') && !(field.uid.includes('.text') || field.uid.includes('.url') || field.uid.includes('_text') || field.uid.includes('_url'))) {
    return null;
  }

  // Helper function to render error messages
  const renderErrorMessage = (error: string | undefined): React.ReactNode => {
    if (!error) return null;
    return <span className="error-message">{error}</span>;
  };

  // Recipients field - check for various recipient field names
  if ((field.uid.includes('recipient') || field.uid.includes('to') || field.uid === 'recipients') && 
      !field.uid.includes('cc') && !field.uid.includes('bcc')) {
    return (
      <div key={field.uid} className="form-group">
        <label className="form-label">
          {field.display_name}
          {field.mandatory && <span className="required-asterisk"> *</span>}
        </label>
        <div className="recipients-container">
          <div className="selected-recipients">
            {recipients.map((recipient) => (
              <div key={recipient.id} className="recipient-tag">
                <span>{recipient.name} ({recipient.email})</span>
                <button
                  type="button"
                  onClick={() => onRemoveRecipient(recipient.id)}
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
              onChange={(e) => onUserSearchChange(e.target.value)}
              onFocus={onUserSearchFocus}
              className={`form-input ${hasFieldError ? 'error' : ''}`}
              placeholder="Search and select users..."
            />
            {showUserDropdown && filteredUsers.length > 0 && (
              <div className="user-dropdown">
                {filteredUsers.slice(0, 10).map((user) => (
                  <div
                    key={user.email}
                    className="user-dropdown-item"
                    onClick={() => onUserSelect(user)}
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
        {renderErrorMessage(fieldError)}
        {field.field_metadata.description && (
          <small className="field-description">{field.field_metadata.description}</small>
        )}
      </div>
    );
  }

  // Tags field
  if (field.uid.includes('tag')) {
    return (
      <div key={field.uid} className="form-group">
        <label className="form-label">
          {field.display_name}
          {field.mandatory && <span className="required-asterisk"> *</span>}
        </label>
        <div className="tags-container">
          <div className="selected-tags">
            {tags.map((tag) => (
              <div key={tag.id} className="tag-item">
                <span>{tag.label}</span>
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag.id)}
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
            onChange={(e) => onTagInputChange(e.target.value)}
            onKeyDown={onTagAdd}
            className="form-input"
            placeholder="Add tags (press Enter to add)"
          />
        </div>
        {renderErrorMessage(fieldError)}
        {field.field_metadata.description && (
          <small className="field-description">{field.field_metadata.description}</small>
        )}
      </div>
    );
  }

  // Subject field - single line text input
  if (field.uid.includes('subject')) {
    return (
      <div key={field.uid} className="form-group">
        <label className="form-label">
          {field.display_name}
          {field.mandatory && <span className="required-asterisk"> *</span>}
        </label>
        <input
          type="text"
          value={fieldValue?.value || ''}
          onChange={(e) => onDynamicFieldChange(field.uid, {
            fieldUID: field.uid,
            fieldType: field.data_type,
            value: e.target.value,
            assets: []
          })}
          placeholder="Enter email subject..."
          className={`form-input ${hasFieldError ? 'error' : ''}`}
        />
        {renderErrorMessage(fieldError)}
        {field.field_metadata.description && (
          <small className="field-description">{field.field_metadata.description}</small>
        )}
      </div>
    );
  }

  // CC fields - single line text input for comma-separated emails
  if (field.uid.includes('cc') && !field.uid.includes('bcc')) {
    return (
      <div key={field.uid} className="form-group">
        <label className="form-label">
          {field.display_name}
          {field.mandatory && <span className="required-asterisk"> *</span>}
        </label>
        <input
          type="text"
          value={fieldValue?.value || ''}
          onChange={(e) => onDynamicFieldChange(field.uid, {
            fieldUID: field.uid,
            fieldType: field.data_type,
            value: e.target.value,
            assets: []
          })}
          placeholder="Enter CC recipients (comma-separated emails)..."
          className={`form-input ${hasFieldError ? 'error' : ''}`}
        />
        {renderErrorMessage(fieldError)}
        {field.field_metadata.description && (
          <small className="field-description">{field.field_metadata.description}</small>
        )}
      </div>
    );
  }

  // BCC fields - single line text input for comma-separated emails
  if (field.uid.includes('bcc')) {
    return (
      <div key={field.uid} className="form-group">
        <label className="form-label">
          {field.display_name}
          {field.mandatory && <span className="required-asterisk"> *</span>}
        </label>
        <input
          type="text"
          value={fieldValue?.value || ''}
          onChange={(e) => onDynamicFieldChange(field.uid, {
            fieldUID: field.uid,
            fieldType: field.data_type,
            value: e.target.value,
            assets: []
          })}
          placeholder="Enter BCC recipients (comma-separated emails)..."
          className={`form-input ${hasFieldError ? 'error' : ''}`}
        />
        {renderErrorMessage(fieldError)}
        {field.field_metadata.description && (
          <small className="field-description">{field.field_metadata.description}</small>
        )}
      </div>
    );
  }

  // Group header - just a visual separator
  if (field.data_type === 'group_header') {
    return (
      <div key={field.uid} className="form-group group-header">
        <div className="group-header-content">
          <h4 className="group-header-title">{field.display_name}</h4>
          {field.field_metadata.description && (
            <small className="group-header-description">{field.field_metadata.description}</small>
          )}
        </div>
      </div>
    );
  }

  // Link fields - use simple input elements
  if (field.uid.includes('link') && (field.uid.includes('.text') || field.uid.includes('.url') || field.uid.includes('_text') || field.uid.includes('_url'))) {
    return (
      <div key={field.uid} className="form-group">
        <label className="form-label">
          {field.display_name}
          {field.mandatory && <span className="required-asterisk"> *</span>}
        </label>
        <input
          type="text"
          value={fieldValue?.value || ''}
          onChange={(e) => onDynamicFieldChange(field.uid, {
            fieldUID: field.uid,
            fieldType: field.data_type,
            value: e.target.value,
            assets: []
          })}
          placeholder={field.field_metadata.description || `Enter ${field.display_name.toLowerCase()}`}
          className={`form-input ${hasFieldError ? 'error' : ''}`}
          disabled={isSubmitting}
        />
        {renderErrorMessage(fieldError)}
        {field.field_metadata.description && (
          <small className="field-description">{field.field_metadata.description}</small>
        )}
      </div>
    );
  }

  // All other fields - use DynamicFormField component
  return (
    <DynamicFormField
      key={field.uid}
      field={field}
      value={fieldValue || { fieldUID: field.uid, fieldType: field.data_type, value: '', assets: [] }}
      onChange={(value) => onDynamicFieldChange(field.uid, value)}
      error={fieldError}
      disabled={isSubmitting}
    />
  );
}; 