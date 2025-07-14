import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  TCustomEmailForm, 
  TCustomEmailFormErrors, 
  TSelectedUser, 
  TEmailTag, 
  TUsersData, 
  TCustomTemplate,
  TDynamicFieldValue,
  TContentTypeField
} from '../../types';
import '../../styles/SendEmail.css';
import RichTextEditor from '../shared/RichTextEditor/RichTextEditor';
import { renderFieldBySchema } from '../shared/FieldRenderer';
import { validateRTEContent, normalizeRTEContent } from '../../utils/rteUtils';
import { fetchContentTypeSchema, createCustomContentTypeEntry } from '../../api';

const SendEmail: React.FC = () => {
  const { customTemplates, emailUsers } = useSelector((state: RootState) => state.main);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<TCustomEmailForm>({
    selectedContentType: '',
    title: '',
    subject: '',
    recipients: [],
    tags: [],
    ccRecipients: '',
    bccRecipients: '',
    dynamicFields: []
  });
  const [errors, setErrors] = useState<TCustomEmailFormErrors>({});
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<TUsersData[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TCustomTemplate | null>(null);
  const [templateSchema, setTemplateSchema] = useState<TContentTypeField[]>([]);
  const [originalSchema, setOriginalSchema] = useState<TContentTypeField[]>([]);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const userSearchRef = useRef<HTMLDivElement>(null);



  // Filter users based on search query
  useEffect(() => {
    if (userSearchQuery.trim()) {
      const filtered = emailUsers.filter(user => {
        // Add null checks for all fields
        const firstName = (user.first_name || '').toLowerCase();
        const lastName = (user.last_name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const searchTerm = userSearchQuery.toLowerCase();
        
        return firstName.includes(searchTerm) || 
               lastName.includes(searchTerm) || 
               email.includes(searchTerm);
      });
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(emailUsers);
    }
  }, [userSearchQuery, emailUsers]);

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

  // Handle template selection
  const handleTemplateSelect = async (templateUID: string) => {
    if (templateUID === '') {
      // Clear template selection
      setSelectedTemplate(null);
      setTemplateSchema([]);
      setOriginalSchema([]);
      setFormData(prev => ({
        ...prev,
        selectedContentType: '',
        title: '',
        subject: '',
        ccRecipients: '',
        bccRecipients: '',
        dynamicFields: []
      }));
      return;
    }

    // Find selected template
    const template = customTemplates.find((t: any) => t.uid === templateUID);
    if (!template) {
      console.error('Template not found:', templateUID);
      return;
    }

    setSelectedTemplate(template);
    setIsLoadingSchema(true);

    try {
      // Fetch the content type schema
      const contentTypeData = await fetchContentTypeSchema(templateUID);
      const schema = contentTypeData.schema || [];
      
      // Store original schema for reference
      setOriginalSchema(schema);
      
      // Use all fields from the schema except title
      const schemaFields = schema.filter((field: TContentTypeField) => 
        field.uid !== 'title'
      );
      
      // Flatten group fields to avoid recursive rendering issues
      const flattenedFields: TContentTypeField[] = [];
      
      schemaFields.forEach((field: TContentTypeField) => {
        if (field.data_type === 'group' && field.schema && field.schema.length > 0) {
          // Add a group header field
          flattenedFields.push({
            ...field,
            uid: `${field.uid}_group_header`,
            data_type: 'group_header',
            display_name: field.display_name,
            field_metadata: {
              ...field.field_metadata,
              description: field.field_metadata.description || `Fields for ${field.display_name}`
            }
          });
          
          // Add each sub-field as individual fields with prefixed UIDs
          field.schema.forEach((subField: TContentTypeField) => {
                         flattenedFields.push({
               ...subField,
               uid: `${field.uid}.${subField.uid}`,
               display_name: `${field.display_name} - ${subField.display_name}`,
               field_metadata: {
                 ...subField.field_metadata,
                 description: subField.field_metadata.description || `${subField.display_name} for ${field.display_name}`
               }
             });
          });
        } else {
          // Regular field, add as-is
          flattenedFields.push(field);
        }
      });
      
      setTemplateSchema(flattenedFields);
      
            // Initialize form data with template - include ALL fields (even hidden ones)
              const initialDynamicFields: TDynamicFieldValue[] = flattenedFields.map((field: TContentTypeField) => {
        // For recipients field, initialize with empty string (will be comma-separated UIDs)
        if ((field.uid.includes('recipient') || field.uid.includes('to') || field.uid === 'recipients') && 
            !field.uid.includes('cc') && !field.uid.includes('bcc')) {
          return {
            fieldUID: field.uid,
            fieldType: field.data_type,
            value: '',
            assets: []
          };
        }
        
        // Skip group headers (they're just visual separators)
        if (field.data_type === 'group_header') {
          return {
            fieldUID: field.uid,
            fieldType: field.data_type,
            value: '',
            assets: []
          };
        }
        
        // Initialize ALL fields with default values (including hidden ones like link targets)
        let defaultValue = field.field_metadata.default_value || '';
        
        // Set _blank as default for link target fields
        if (field.uid.includes('link') && (field.uid.includes('.target') || field.uid.includes('_target'))) {
          defaultValue = '_blank';
        }
        
        return {
          fieldUID: field.uid,
          fieldType: field.data_type,
          value: defaultValue,
          assets: []
        };
      });

      setFormData(prev => ({
        ...prev,
        selectedContentType: templateUID,
        title: '', // Keep for compatibility but hidden from UI
        subject: '',
        ccRecipients: '',
        bccRecipients: '',
        dynamicFields: initialDynamicFields
      }));

      // Clear any existing errors
      setErrors({});
    } catch (error) {
      console.error('Error fetching template schema:', error);
      setErrors(prev => ({
        ...prev,
        selectedContentType: 'Failed to load template schema'
      }));
    } finally {
      setIsLoadingSchema(false);
    }
  };





  // Handle dynamic field changes
  const handleDynamicFieldChange = (fieldUID: string, value: TDynamicFieldValue) => {
    setFormData(prev => ({
      ...prev,
      dynamicFields: prev.dynamicFields.map(field => 
        field.fieldUID === fieldUID ? value : field
      )
    }));
    
    // Clear field-specific errors
    if (errors.dynamicFields && errors.dynamicFields[fieldUID]) {
      const newDynamicFields = { ...errors.dynamicFields };
      delete newDynamicFields[fieldUID];
      setErrors(prev => ({
        ...prev,
        dynamicFields: Object.keys(newDynamicFields).length > 0 ? newDynamicFields : undefined
      }));
    }
  };

  // Handle user selection
  const handleUserSelect = (user: TUsersData) => {
    const selectedUser: TSelectedUser = {
      id: user.uid, // Use UID instead of email
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || user.uid,
      email: user.email || '',
      subscribed: user.subscribed
    };

    const isAlreadySelected = formData.recipients.some(recipient => recipient.id === selectedUser.id);
    
    if (!isAlreadySelected) {
      const newRecipients = [...formData.recipients, selectedUser];
      
      // Find the recipients field in schema to update its dynamic field value
      const recipientsField = templateSchema.find(field => 
        (field.uid.includes('recipient') || field.uid.includes('to') || field.uid === 'recipients') && 
        !field.uid.includes('cc') && !field.uid.includes('bcc')
      );
      
      // Create comma-separated UIDs for the backend
      const recipientUIDs = newRecipients.map(recipient => recipient.id).join(',');
      
      setFormData(prev => ({
        ...prev,
        recipients: newRecipients,
        // Store comma-separated UIDs in the dynamic field value
        dynamicFields: recipientsField ? prev.dynamicFields.map(field => 
          field.fieldUID === recipientsField.uid 
            ? { ...field, value: recipientUIDs }
            : field
        ) : prev.dynamicFields
      }));
    }

    setUserSearchQuery('');
    setShowUserDropdown(false);
    
    // Clear errors for the recipients field
    const recipientsField = templateSchema.find(field => 
      (field.uid.includes('recipient') || field.uid.includes('to') || field.uid === 'recipients') && 
      !field.uid.includes('cc') && !field.uid.includes('bcc')
    );
    
    if (recipientsField && errors.dynamicFields && errors.dynamicFields[recipientsField.uid]) {
      const newDynamicFields = { ...errors.dynamicFields };
      delete newDynamicFields[recipientsField.uid];
      setErrors(prev => ({
        ...prev,
        dynamicFields: Object.keys(newDynamicFields).length > 0 ? newDynamicFields : undefined
      }));
    }
  };

  // Handle remove recipient
  const handleRemoveRecipient = (userId: string) => {
    const newRecipients = formData.recipients.filter(recipient => recipient.id !== userId);
    
    // Find the recipients field in schema to update its dynamic field value
    const recipientsField = templateSchema.find(field => 
      (field.uid.includes('recipient') || field.uid.includes('to') || field.uid === 'recipients') && 
      !field.uid.includes('cc') && !field.uid.includes('bcc')
    );
    
    // Create comma-separated UIDs for the backend
    const recipientUIDs = newRecipients.map(recipient => recipient.id).join(',');
    
    setFormData(prev => ({
      ...prev,
      recipients: newRecipients,
      // Store comma-separated UIDs in the dynamic field value
      dynamicFields: recipientsField ? prev.dynamicFields.map(field => 
        field.fieldUID === recipientsField.uid 
          ? { ...field, value: recipientUIDs }
          : field
      ) : prev.dynamicFields
    }));
  };

  // Handle tag operations
  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag: TEmailTag = {
        id: Date.now().toString(),
        label: tagInput.trim(),
        value: tagInput.trim()
      };

      const tagExists = formData.tags.some(tag => tag.value.toLowerCase() === newTag.value.toLowerCase());
      
      if (!tagExists) {
        const newTags = [...formData.tags, newTag];
        
        // Find the tags field in schema to update its dynamic field value
        const tagsField = templateSchema.find(field => field.uid.includes('tag'));
        
        setFormData(prev => ({
          ...prev,
          tags: newTags,
          // Also update the dynamic field value for the tags field
          dynamicFields: tagsField ? prev.dynamicFields.map(field => 
            field.fieldUID === tagsField.uid 
              ? { ...field, value: newTags }
              : field
          ) : prev.dynamicFields
        }));
      }

      setTagInput('');
      
      // Clear errors for the tags field
      const tagsField = templateSchema.find(field => field.uid.includes('tag'));
      if (tagsField && errors.dynamicFields && errors.dynamicFields[tagsField.uid]) {
        const newDynamicFields = { ...errors.dynamicFields };
        delete newDynamicFields[tagsField.uid];
        setErrors(prev => ({
          ...prev,
          dynamicFields: Object.keys(newDynamicFields).length > 0 ? newDynamicFields : undefined
        }));
      }
    }
  };

  const handleRemoveTag = (tagId: string) => {
    const newTags = formData.tags.filter(tag => tag.id !== tagId);
    
    // Find the tags field in schema to update its dynamic field value
    const tagsField = templateSchema.find(field => field.uid.includes('tag'));
    
    setFormData(prev => ({
      ...prev,
      tags: newTags,
      // Also update the dynamic field value for the tags field
      dynamicFields: tagsField ? prev.dynamicFields.map(field => 
        field.fieldUID === tagsField.uid 
          ? { ...field, value: newTags }
          : field
      ) : prev.dynamicFields
    }));
  };

  // Helper function to render error messages
  const renderErrorMessage = (error: string | undefined): React.ReactNode => {
    if (!error) return null;
    return <span className="error-message">{error}</span>;
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: TCustomEmailFormErrors = {};

    // Validate template selection
    if (!formData.selectedContentType) {
      newErrors.selectedContentType = 'Please select a custom template';
    }

    // Validate dynamic fields based on schema
    const dynamicFieldErrors: { [fieldUID: string]: string } = {};
    templateSchema.forEach(field => {
      const fieldValue = formData.dynamicFields.find(f => f.fieldUID === field.uid);
      
      // Handle recipients field validation - check for various recipient field names
      if ((field.uid.includes('recipient') || field.uid.includes('to') || field.uid === 'recipients') && !field.uid.includes('cc') && !field.uid.includes('bcc')) {
        if (field.mandatory && formData.recipients.length === 0) {
          dynamicFieldErrors[field.uid] = `${field.display_name} is required - at least one recipient must be selected`;
        }
        return; // Skip other validation for recipients field
      }
      
      // Handle tags field validation
      if (field.uid.includes('tag')) {
        if (field.mandatory && formData.tags.length === 0) {
          dynamicFieldErrors[field.uid] = `${field.display_name} is required - at least one tag must be added`;
        }
        return; // Skip other validation for tags field
      }
      

      
      // Handle file field validation
      if (field.data_type === 'file') {
        if (field.mandatory && (!fieldValue || !fieldValue.assets || fieldValue.assets.length === 0)) {
          dynamicFieldErrors[field.uid] = `${field.display_name} is required - please select a file`;
        }
        return;
      }
             
             // Skip group headers (they're just visual separators)
      if (field.data_type === 'group_header') {
        return;
      }
      
      // Skip link target fields - no validation needed
      if (field.uid.includes('link') && (field.uid.includes('.target') || field.uid.includes('_target'))) {
        return;
      }
      
      // Standard field validation
      if (field.mandatory && (!fieldValue || !fieldValue.value)) {
        dynamicFieldErrors[field.uid] = `${field.display_name} is required`;
      }
      
      // Additional validation for rich text fields (but not for CC/BCC/Subject which use text inputs)
      if (field.data_type === 'text' && 
          (field.field_metadata.rich_text_type === 'advanced' || field.field_metadata.rich_text_type === 'basic') &&
          !field.uid.includes('cc') && !field.uid.includes('bcc') && !field.uid.includes('subject') &&
          fieldValue && fieldValue.value) {
        const rteError = validateRTEContent(fieldValue.value, field.display_name);
        if (rteError) {
          dynamicFieldErrors[field.uid] = rteError;
        }
      }
      
      // Email validation for CC/BCC fields
      if ((field.uid.includes('cc') || field.uid.includes('bcc')) && fieldValue && fieldValue.value) {
        const emails = fieldValue.value.split(',').map((email: string) => email.trim()).filter((email: string) => email);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emails.filter((email: string) => !emailRegex.test(email));
        
        if (invalidEmails.length > 0) {
          dynamicFieldErrors[field.uid] = `Invalid email format: ${invalidEmails.join(', ')}`;
        }
      }
      

    });

    if (Object.keys(dynamicFieldErrors).length > 0) {
      newErrors.dynamicFields = dynamicFieldErrors;
    }

    setErrors(newErrors);
    
    const hasErrors = Object.keys(newErrors).length > 0;
    return !hasErrors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Prepare entry data for Contentstack
    let entryData: any = {};

    try {

      // Add a default title if title field exists in original schema
      const titleField = originalSchema.find((field: TContentTypeField) => field.uid === 'title');
      if (titleField) {
        entryData.title = `Email - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      }

      // Dynamic fields are now processed in schema order above

      // Add special handling for recipients and tags
      const recipientsField = templateSchema.find(field => (field.uid.includes('recipient') || field.uid.includes('to') || field.uid === 'recipients') && !field.uid.includes('cc') && !field.uid.includes('bcc'));
      const tagsField = templateSchema.find(field => field.uid.includes('tag'));
      
      if (recipientsField) {
        // Send comma-separated UIDs to the backend
        const recipientUIDs = formData.recipients.map(recipient => recipient.id).join(',');
        entryData[recipientsField.uid] = recipientUIDs;
      }
      
      if (tagsField) {
        entryData[tagsField.uid] = formData.tags;
      }
      
      entryData.sent_at = new Date().toISOString();

      // Process fields in schema order to maintain correct order
      const orderedEntryData: any = {};
      const groupData: { [groupUID: string]: any } = {};
      
      templateSchema.forEach((schemaField, index) => {
        const dynamicField = formData.dynamicFields.find(f => f.fieldUID === schemaField.uid);
        
        // Skip group headers
        if (schemaField.data_type === 'group_header') {
          return;
        }
        
        // For missing fields (hidden fields), provide default values
        if (!dynamicField) {
          // Check if this is a flattened group field (contains dot notation)
          if (schemaField.uid.includes('.')) {
            const [groupUID, subFieldUID] = schemaField.uid.split('.');
            
            // Initialize group object if not exists
            if (!groupData[groupUID]) {
              groupData[groupUID] = {};
            }
            
            // Add default value for missing field
            let defaultValue = schemaField.field_metadata.default_value || '';
            
            // Set _blank as default for link target fields
            if (schemaField.uid.includes('link') && (schemaField.uid.includes('.target') || schemaField.uid.includes('_target'))) {
              defaultValue = '_blank';
            }
            
            groupData[groupUID][subFieldUID] = defaultValue;
          } else {
            // Regular field - add default value
            let defaultValue = schemaField.field_metadata.default_value || '';
            
            // Set _blank as default for link target fields
            if (schemaField.uid.includes('link') && (schemaField.uid.includes('.target') || schemaField.uid.includes('_target'))) {
              defaultValue = '_blank';
            }
            
            orderedEntryData[schemaField.uid] = defaultValue;
          }
          return;
        }
        
        // Skip group headers
        if (dynamicField.fieldType === 'group_header') return;
        
        // Check if this is a flattened group field (contains dot notation)
        if (schemaField.uid.includes('.')) {
          const [groupUID, subFieldUID] = schemaField.uid.split('.');
          
          // Initialize group object if not exists
          if (!groupData[groupUID]) {
            groupData[groupUID] = {};
          }
          
          // Add field value to group
          if (dynamicField.fieldType === 'file' && dynamicField.assets && dynamicField.assets.length > 0) {
            groupData[groupUID][subFieldUID] = dynamicField.assets[0].uid;
          } else {
            groupData[groupUID][subFieldUID] = dynamicField.value;
          }
        } else {
          // Regular field
          if (dynamicField.fieldType === 'file' && dynamicField.assets && dynamicField.assets.length > 0) {
            orderedEntryData[dynamicField.fieldUID] = dynamicField.assets[0].uid;
          } else {
            orderedEntryData[dynamicField.fieldUID] = dynamicField.value;
          }
        }
      });
      
      // Add grouped data to entry
      Object.keys(groupData).forEach(groupUID => {
        orderedEntryData[groupUID] = groupData[groupUID];
      });
      
      // Use the ordered entry data instead of the original entryData
      Object.assign(entryData, orderedEntryData);

      // Create the entry in Contentstack
      const createdEntry = await createCustomContentTypeEntry(formData.selectedContentType, entryData);
      
      // Reset form after successful submission
      setFormData({
        selectedContentType: '',
        title: '',
        subject: '',
        recipients: [],
        tags: [],
        ccRecipients: '',
        bccRecipients: '',
        dynamicFields: []
      });
      setSelectedTemplate(null);
      setTemplateSchema([]);
      setOriginalSchema([]);      
    } catch (error) {
      console.error('Error creating email entry:', error);
      alert(`Failed to create email entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="send-email-container">
      <div className="send-email-header">
        <h1>Send Email</h1>
        <p>Create and send personalized emails using custom templates</p>
      </div>

      <form onSubmit={handleSubmit} className="send-email-form">
        {/* Custom Template Selection */}
        <div className="form-group">
          <label htmlFor="template" className="form-label">
            Select Custom Template *
          </label>
          <select
            id="template"
            value={formData.selectedContentType}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className={`form-input template-select ${errors.selectedContentType ? 'error' : ''}`}
          >
            <option value="">Choose a custom template...</option>
            {customTemplates.map((template: any) => (
              <option key={template.uid} value={template.uid}>
                {template.title}
              </option>
            ))}
          </select>
          {errors.selectedContentType && <span className="error-message">{errors.selectedContentType}</span>}
          {isLoadingSchema && (
            <p className="template-info">Loading template schema...</p>
          )}
          {selectedTemplate && !isLoadingSchema && (
            <p className="template-info">
              Template selected: {selectedTemplate.title}. Fill in the fields below based on the template schema.
            </p>
          )}
        </div>

                {/* Show form fields only when template is selected */}
        {selectedTemplate && !isLoadingSchema && (
          <>
            {/* Dynamic Fields from Template Schema */}
            {templateSchema.map((field) => renderFieldBySchema({
              field,
              fieldValue: formData.dynamicFields.find(f => f.fieldUID === field.uid),
              fieldError: errors.dynamicFields ? errors.dynamicFields[field.uid] : undefined,
              isSubmitting,
              // Recipients handling
              recipients: formData.recipients,
              userSearchQuery,
              showUserDropdown,
              filteredUsers,
              userSearchRef,
              onUserSearchChange: (query: string) => {
                setUserSearchQuery(query);
              },
              onUserSearchFocus: () => {
                setShowUserDropdown(true);
              },
              onUserSelect: handleUserSelect,
              onRemoveRecipient: handleRemoveRecipient,
              // Tags handling
              tags: formData.tags,
              tagInput,
              onTagInputChange: setTagInput,
              onTagAdd: handleTagAdd,
              onRemoveTag: handleRemoveTag,
              // Field change handler
              onDynamicFieldChange: handleDynamicFieldChange
            }))}

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="submit"
                disabled={isSubmitting}
                className="send-button"
              >
                {isSubmitting ? 'Creating Entry...' : 'Create Email Entry'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default SendEmail; 