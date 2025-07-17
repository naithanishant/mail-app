import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@contentstack/venus-components';
import { fetchContentTypeSchema, getEntryWithCount } from '../../api/index';
import { TCustomTemplate, TContentTypeField } from '../../types/index';
import { RootState } from '../../store';
import { useToast } from '../../contexts/ToastContext';
import '../../styles/EmailContentPreview.css';

interface EmailContentPreviewProps {}

const EmailContentPreview: React.FC<EmailContentPreviewProps> = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();
  
  // Get users data from Redux store
  const { usersData, emailUsers } = useSelector((state: RootState) => state.main);
  
  const [template, setTemplate] = useState<TCustomTemplate | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(0);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesPagination, setEntriesPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'email' | 'html' | 'json'>('email');
  const [emailContent, setEmailContent] = useState('');
  const [jsonContent, setJsonContent] = useState('');

  useEffect(() => {
    if (uid) {
      fetchTemplateData();
    }
  }, [uid]);

  // Helper function to convert UIDs to user emails
  const convertUidsToEmails = (uidsString: string): string => {
    if (!uidsString) return '';
    
    // Use emailUsers first (subscribed users), then fall back to usersData
    const availableUsers = emailUsers.length > 0 ? emailUsers : usersData;
    
    // If it already looks like email addresses, return as-is
    if (uidsString.includes('@')) {
      return uidsString;
    }
    
    // Split by common delimiters and clean up
    const uids = uidsString.split(/[,;\s]+/).filter(uid => uid.trim());
    
    const emails = uids.map(uid => {
      const cleanUid = uid.trim();
      // Try to find user by various ID fields
      const user = availableUsers.find(user => 
        user.uid === cleanUid || 
        user.id === cleanUid || 
        user.email === cleanUid
      );
      
      if (user?.email) {
        return user.email;
      }
      
      // If no user found but looks like UID, return a formatted placeholder
      if (cleanUid.length > 10) {
        return `user-${cleanUid.slice(-6)}@example.com`;
      }
      
      return cleanUid; // Return original if nothing else works
    });
    
    return emails.join(', ');
  };

  // Helper function to get sample user emails for placeholders
  const getSampleUserEmails = (count: number = 3): string => {
    const availableUsers = emailUsers.length > 0 ? emailUsers : usersData;
    const sampleUsers = availableUsers.slice(0, count);
    
    if (sampleUsers.length === 0) {
      return 'user1@example.com, user2@example.com, user3@example.com';
    }
    
    return sampleUsers
      .map(user => user.email || `${user.first_name?.toLowerCase()}@example.com`)
      .join(', ');
  };

  const fetchTemplateData = async () => {
    try {
      setLoading(true);
      const contentType = await fetchContentTypeSchema(uid!);
      
      const templateData: TCustomTemplate = {
        uid: contentType.uid,
        title: contentType.title,
        description: contentType.description || '',
        schema: contentType.schema || [],
        created_at: contentType.created_at,
        updated_at: contentType.updated_at,
      };
      
      setTemplate(templateData);
      
      // Fetch entries for this content type and pass the template data
      await fetchTemplateEntries(contentType.uid, 1, templateData);
      
    } catch (error) {
      console.error('Error fetching template data:', error);
      showError('Failed to fetch template data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplateEntries = async (contentTypeUid: string, page: number = 1, templateData?: TCustomTemplate) => {
    try {
      setEntriesLoading(true);
      const result = await getEntryWithCount(contentTypeUid, page, 10);
      
      setEntries(result.entries);
      setEntriesPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage
      });
      
      // Reset selected entry index when fetching new entries
      setSelectedEntryIndex(0);
      
      // Generate content for the first entry (or empty if no entries)
      // Use provided templateData or fall back to state template
      const currentTemplate = templateData || template;
      if (currentTemplate) {
        if (result.entries.length > 0) {
          // Preselect and populate the first entry
          generateEmailContent(currentTemplate, result.entries[0]);
        } else {
          // No entries, show template with placeholders
          generateEmailContent(currentTemplate);
        }
      }
    } catch (error) {
      console.error('Error fetching template entries:', error);
      showError('Failed to fetch template entries. Please try again.');
    } finally {
      setEntriesLoading(false);
    }
  };

  const generateEmailContent = (templateData: TCustomTemplate, entry?: any) => {
    setContentLoading(true);
    
    // Use requestAnimationFrame to ensure smooth transitions
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          const html = renderTemplateToHTML(templateData, entry);
          const json = generateJSONPreview(templateData, entry);
          
          setEmailContent(html);
          setJsonContent(json);
        } catch (error) {
          console.error('Error generating email content:', error);
          setEmailContent('<p>Error loading content</p>');
          setJsonContent('{"error": "Failed to load content"}');
        } finally {
          setContentLoading(false);
        }
      }, 50);
    });
  };

  const renderTemplateToHTML = (templateData: TCustomTemplate, entry?: any): string => {
    const { title, schema } = templateData;
    
    // Extract different field types
    const titleField = schema.find(field => field.uid === 'title');
    const subjectField = schema.find(field => field.uid === 'subject');
    const recipientsField = schema.find(field => field.uid === 'recipients');
    const textFields = schema.filter(field => 
      field.uid.startsWith('text_') && field.data_type === 'text'
    );
    const imageFields = schema.filter(field => 
      field.uid.startsWith('image_') && field.data_type === 'file' && field.field_metadata?.image
    );
    const fileFields = schema.filter(field => 
      field.uid.startsWith('file_') && field.data_type === 'file' && !field.field_metadata?.image
    );
    const linkTextFields = schema.filter(field => 
      field.uid.endsWith('_text') && field.uid.startsWith('link_')
    );
    const linkUrlFields = schema.filter(field => 
      field.uid.endsWith('_url') && field.uid.startsWith('link_')
    );
    const ccFields = schema.filter(field => field.uid.startsWith('cc_'));
    const bccFields = schema.filter(field => field.uid.startsWith('bcc_'));

    // Generate HTML content
    let html = `
      <div class="email-preview-wrapper">
        <style>
          .email-preview-wrapper * {
            box-sizing: border-box;
            max-width: 100%;
          }
          .email-preview-wrapper {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 20px;
            background-color: #f9f9f9;
            min-height: 100%;
            border-radius: 8px;
            box-sizing: border-box;
          }
                                .email-container {
             background-color: white;
             border-radius: 8px;
             padding: 30px;
             box-shadow: 0 2px 10px rgba(0,0,0,0.1);
             width: 100%;
             max-width: 100%;
             margin: 0 auto;
           }
          .email-header {
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .email-subject {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .email-meta {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          .email-body {
            margin-bottom: 30px;
          }
          .content-section {
            margin-bottom: 25px;
          }
          .content-section h3 {
            color: #34495e;
            margin-bottom: 10px;
            font-size: 18px;
          }
          .content-section p {
            margin-bottom: 15px;
            line-height: 1.8;
          }
          .image-section {
            width:450px;
            text-align: center;
            margin: 25px 0;
          }
          .image-placeholder {
            background-color: #ecf0f1;
            border: 2px dashed #bdc3c7;
            border-radius: 8px;
            padding: 40px;
            color: #7f8c8d;
            font-style: italic;
          }
          .file-section {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .file-icon {
            display: inline-block;
            margin-right: 10px;
            font-size: 20px;
          }
          .link-section {
            margin: 20px 0;
          }
                     .link-button {
             display: inline-block;
             background-color: #3822aa;
             color: white;
             padding: 12px 24px;
             text-decoration: none;
             border-radius: 5px;
             font-weight: bold;
             transition: background-color 0.3s;
           }
                     .link-button:hover {
             background-color: #2e1a85;
           }
                     .cc-bcc-section {
             background-color: #f1f2f6;
             border-left: 4px solid #3822aa;
             padding: 15px;
             margin: 20px 0;
             font-size: 14px;
           }
          .field-label {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
          }
                     .field-placeholder {
             color: #7f8c8d;
             font-style: italic;
             background-color: #ecf0f1;
             padding: 3px;
             border-radius: 4px;
             border: 1px dashed #bdc3c7;
             width: 100%;
             max-width: 100%;
             word-wrap: break-word;
           }
        </style>
        
        <div class="email-container">
          <div class="email-header">
                         <div class="email-subject">
               ${subjectField ? 
                 (entry && entry[subjectField.uid] ? 
                   entry[subjectField.uid] : 
                   `<span class="field-placeholder">[${subjectField.display_name}: ${subjectField.field_metadata?.description || 'Email subject will appear here'}]</span>`) : 
                 'Email Subject'
               }
             </div>
             <div class="email-meta">
               <strong>To:</strong> ${recipientsField ? 
                 (entry && entry[recipientsField.uid] ? 
                   `<span class="user-email">${convertUidsToEmails(entry[recipientsField.uid])}</span>` : 
                   `<span class="field-placeholder">${getSampleUserEmails(2)}</span>`) : 
                 'Recipients'
               }
             </div>
                         ${ccFields.length > 0 ? `
               <div class="email-meta">
                 <strong>CC:</strong> ${ccFields.map(field => 
                   entry && entry[field.uid] ? 
                     `<span class="user-email">${convertUidsToEmails(entry[field.uid])}</span>` : 
                     `<span class="field-placeholder">${getSampleUserEmails(1)}</span>`
                 ).join(', ')}
               </div>
             ` : ''}
             ${bccFields.length > 0 ? `
               <div class="email-meta">
                 <strong>BCC:</strong> ${bccFields.map(field => 
                   entry && entry[field.uid] ? 
                     `<span class="user-email">${convertUidsToEmails(entry[field.uid])}</span>` : 
                     `<span class="field-placeholder">${getSampleUserEmails(1)}</span>`
                 ).join(', ')}
               </div>
             ` : ''}
          </div>
          
          <div class="email-body">
    `;

         // Add text content sections
     textFields.forEach(field => {
       const fieldContent = entry && entry[field.uid] ? entry[field.uid] : null;
       
       html += `
         <div class="content-section">
           <div class="field-label">${field.display_name}</div>
           ${fieldContent ? `
             <div class="field-content">
               ${fieldContent}
             </div>
           ` : `
             <div class="field-placeholder">
               [${field.field_metadata?.description || 'Text content will appear here'}]
               ${field.field_metadata?.default_value ? `<br><small>Default: ${field.field_metadata.default_value}</small>` : ''}
             </div>
           `}
         </div>
       `;
     });

         // Add image sections
     imageFields.forEach(field => {
       const fieldAsset = entry && entry[field.uid] ? entry[field.uid] : null;
       
       html += `
         <div class="content-section">
           <div class="field-label">${field.display_name}</div>
           <div class="image-section">
             ${fieldAsset ? `
               <img src="${fieldAsset.url}" alt="${fieldAsset.title || field.display_name}" 
                    style="max-width: 100%; width: 100%; height: auto; border-radius: 8px; display: block;">
               ${fieldAsset.title ? `<p style="margin-top: 10px; font-size: 14px; color: #666; word-wrap: break-word;">${fieldAsset.title}</p>` : ''}
             ` : `
               <div class="image-placeholder">
                 🖼️ ${field.field_metadata?.description || 'Image will appear here'}<br>
                 <small>Supported formats: ${field.field_metadata?.extensions?.join(', ') || 'jpg, png, gif'}</small>
               </div>
             `}
           </div>
         </div>
       `;
     });

         // Add file sections
     fileFields.forEach(field => {
       const fieldAsset = entry && entry[field.uid] ? entry[field.uid] : null;
       
       html += `
         <div class="content-section">
           <div class="field-label">${field.display_name}</div>
           <div class="file-section">
             ${fieldAsset ? `
               <span class="file-icon">📎</span>
               <a href="${fieldAsset.url}" target="_blank" style="text-decoration: none; color: #3822aa;">
                 <strong>${fieldAsset.title || fieldAsset.filename}</strong>
               </a>
               ${fieldAsset.file_size ? `<br><small>Size: ${fieldAsset.file_size}</small>` : ''}
             ` : `
               <span class="file-icon">📎</span>
               <span class="field-placeholder">
                 [${field.field_metadata?.description || 'File attachment will appear here'}]
                 <br><small>Supported formats: ${field.field_metadata?.extensions?.join(', ') || 'pdf, doc, txt'}</small>
               </span>
             `}
           </div>
         </div>
       `;
     });

    // Add link sections
    const linkPairs = linkTextFields.map(textField => {
      const linkId = textField.uid.replace('_text', '');
      const urlField = linkUrlFields.find(field => field.uid === `${linkId}_url`);
      return { textField, urlField };
    });

         linkPairs.forEach(({ textField, urlField }) => {
       const linkText = entry && entry[textField.uid] ? entry[textField.uid] : null;
       const linkUrl = entry && urlField && entry[urlField.uid] ? entry[urlField.uid] : null;
       
       html += `
         <div class="content-section">
           <div class="field-label">${textField.display_name.replace(' Text', '')}</div>
           <div class="link-section">
             ${linkText && linkUrl ? `
               <a href="${linkUrl}" class="link-button" target="_blank">
                 ${linkText}
               </a>
             ` : `
               <a href="#" class="link-button">
                 [${textField.field_metadata?.description || 'Link text'}]
               </a>
               <div style="margin-top: 10px; font-size: 12px; color: #666;">
                 Link URL: <span class="field-placeholder">[${urlField?.field_metadata?.description || 'Link URL will appear here'}]</span>
               </div>
             `}
           </div>
         </div>
       `;
     });

    html += `
          </div>
          
          <!-- Email Footer -->
          <div class="email-footer" style="margin-top: 30px; background-color: #f8f9fa; margin-left: -30px; margin-right: -30px; margin-bottom: -30px; padding: 20px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
            <div style="font-size: 12px; color: #666; text-align: center;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #2c3e50;">
                📧 ${title}
              </p>
              ${entry ? `
                <p style="margin: 0 0 8px 0;">
                  <strong>Entry:</strong> ${entry.title || 'Untitled Entry'}
                </p>
                <p style="margin: 0 0 8px 0;">
                  <strong>Generated:</strong> ${new Date().toLocaleDateString()} • ${new Date().toLocaleTimeString()}
                </p>
              ` : `
                <p style="margin: 0 0 8px 0;">
                  <em>📋 Template Structure Preview</em>
                </p>
                <p style="margin: 0;">
                  <small>No entry data • Showing field placeholders</small>
                </p>
              `}
                             ${entry ? `
                 <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #ddd;">
                   <small style="color: #888;">
                     Preview generated from actual email entry data<br>
                     📧 User IDs automatically converted to email addresses
                   </small>
                 </div>
               ` : `
                 <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #ddd;">
                   <small style="color: #888;">
                     📧 Sample emails shown from available users (${emailUsers.length > 0 ? emailUsers.length : usersData.length} users loaded)
                   </small>
                 </div>
               `}
            </div>
          </div>
        </div>
      </div>
    `;

    return html;
  };

  const generateJSONPreview = (templateData: TCustomTemplate, entry?: any): string => {
    const preview = {
      template: {
        uid: templateData.uid,
        title: templateData.title,
        description: templateData.description,
        created_at: templateData.created_at,
        updated_at: templateData.updated_at,
      },
      schema: templateData.schema.map(field => ({
        uid: field.uid,
        display_name: field.display_name,
        data_type: field.data_type,
        mandatory: field.mandatory,
        multiple: field.multiple,
        field_metadata: field.field_metadata,
      })),
      entries_info: {
        total_entries: entriesPagination.totalCount,
        current_page: entriesPagination.currentPage,
        total_pages: entriesPagination.totalPages,
        showing_entry: selectedEntryIndex + 1,
      },
      current_entry: entry ? {
        uid: entry.uid,
        title: entry.title,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
        data: entry
      } : null,
      sample_data: entry ? entry : generateSampleData(templateData.schema),
    };

    return JSON.stringify(preview, null, 2);
  };

  const generateSampleData = (schema: TContentTypeField[]) => {
    const sampleData: any = {};
    
    schema.forEach(field => {
      switch (field.data_type) {
        case 'text':
          // Handle email-related fields specially
          if (field.uid === 'recipients') {
            sampleData[field.uid] = getSampleUserEmails(2);
          } else if (field.uid.startsWith('cc_')) {
            sampleData[field.uid] = getSampleUserEmails(1);
          } else if (field.uid.startsWith('bcc_')) {
            sampleData[field.uid] = getSampleUserEmails(1);
          } else if (field.uid === 'subject') {
            sampleData[field.uid] = field.field_metadata?.default_value || 
              'Sample Email Subject - Marketing Campaign Update';
          } else {
            sampleData[field.uid] = field.field_metadata?.default_value || 
              `Sample ${field.display_name.toLowerCase()}`;
          }
          break;
        case 'file':
          if (field.field_metadata?.image) {
            sampleData[field.uid] = {
              url: 'https://example.com/sample-image.jpg',
              filename: 'sample-image.jpg',
              content_type: 'image/jpeg',
            };
          } else {
            sampleData[field.uid] = {
              url: 'https://example.com/sample-file.pdf',
              filename: 'sample-file.pdf',
              content_type: 'application/pdf',
            };
          }
          break;
        default:
          // Handle email-related fields in other data types too
          if (field.uid === 'recipients' || field.uid.startsWith('cc_') || field.uid.startsWith('bcc_')) {
            sampleData[field.uid] = getSampleUserEmails(field.uid === 'recipients' ? 2 : 1);
          } else {
            sampleData[field.uid] = field.field_metadata?.default_value || 
              `Sample ${field.display_name.toLowerCase()}`;
          }
      }
    });

    return sampleData;
  };

  const handleBack = () => {
    navigate('/templates');
  };

  const handleExport = () => {
    const content = previewMode === 'json' ? jsonContent : emailContent;
    const filename = `${template?.title || 'template'}-${previewMode}.${previewMode === 'json' ? 'json' : 'html'}`;
    
    const blob = new Blob([content], { type: previewMode === 'json' ? 'application/json' : 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEntrySelect = (index: number) => {
    // Prevent multiple rapid selections
    if (contentLoading) return;
    
    setSelectedEntryIndex(index);
    if (template && entries[index]) {
      generateEmailContent(template, entries[index]);
    }
  };

  const handleEntriesPageChange = async (page: number) => {
    if (template) {
      await fetchTemplateEntries(template.uid, page, template);
    }
  };

  if (loading) {
    return (
      <div className="email-preview-loading">
        <div className="loading-spinner"></div>
        <p>Loading template preview...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="email-preview-error">
        <h2>Template Not Found</h2>
        <p>The requested template could not be found.</p>
        <Button onClick={handleBack} buttonType="primary">
          Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="email-content-preview" style={{ width: '100%', maxWidth: 'none', minWidth: '0' }}>
      <div className="preview-header">
        <div className="preview-title">
          <Button 
            onClick={handleBack} 
            buttonType="tertiary" 
            className="back-button"
          >
            ← Back to Templates
          </Button>
          <h1>{template.title}</h1>
          <p className="template-description">
            {template.description}
            {entries.length > 0 && (
              <span className="preview-status">
                {' '} • Showing actual email content from entry {selectedEntryIndex + 1} with live user emails
              </span>
            )}
            {entries.length === 0 && (
              <span className="preview-status">
                {' '} • No entries found, showing template structure with sample user emails
              </span>
            )}
          </p>
        </div>
        
        {/* <div className="preview-actions">
          <div className="view-mode-toggle">
            <Button
              onClick={() => setPreviewMode('email')}
              buttonType={previewMode === 'email' ? 'primary' : 'secondary'}
              className="mode-button"
            >
              📧 Email Preview
            </Button>
            <Button
              onClick={() => setPreviewMode('html')}
              buttonType={previewMode === 'html' ? 'primary' : 'secondary'}
              className="mode-button"
            >
              🔧 HTML Source
            </Button>
            <Button
              onClick={() => setPreviewMode('json')}
              buttonType={previewMode === 'json' ? 'primary' : 'secondary'}
              className="mode-button"
            >
              📋 JSON Schema
            </Button>
          </div>
          
          <Button
            onClick={handleExport}
            buttonType="primary"
            className="export-button"
          >
            ⬇️ Export {previewMode.toUpperCase()}
          </Button>
        </div> */}
      </div>

      <div className={`preview-content ${contentLoading ? 'switching' : ''}`}>
        <div className="preview-main-content">
          {previewMode === 'email' && (
            <div className="email-preview-container">
              <div className="preview-frame">
                <div
                  className="email-preview-iframe"
                  dangerouslySetInnerHTML={{ __html: emailContent }}
                />
              </div>
            </div>
          )}

          {previewMode === 'html' && (
            <div className="code-preview-container">
              <pre className="code-preview">
                <code>{emailContent}</code>
              </pre>
            </div>
          )}

          {previewMode === 'json' && (
            <div className="code-preview-container">
              <pre className="code-preview">
                <code>{jsonContent}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Entries Sidebar */}
        <div className="entries-sidebar">
          <div className="entries-header">
            <div className="entries-header-content">
              <h3>Email Entries ({entriesPagination.totalCount})</h3>
              {entries.length > 0 && !entriesLoading && (
                <span className="entries-current-selection">
                  Entry {selectedEntryIndex + 1} selected
                </span>
              )}
            </div>
            {entriesLoading && (
              <div className="entries-loading">
                <div className="loading-spinner-small"></div>
              </div>
            )}
          </div>

          {entries.length === 0 ? (
            <div className="no-entries">
              <p>No email entries found for this template.</p>
              <p className="hint">Create an email using this template to see entries here.</p>
            </div>
          ) : (
            <>
              <div className="entries-list">
                {entries.map((entry, index) => (
                  <div
                    key={entry.uid}
                    className={`entry-item ${index === selectedEntryIndex ? 'selected' : ''} ${contentLoading ? 'loading' : ''}`}
                    onClick={() => handleEntrySelect(index)}
                  >
                    <div className="entry-title">
                      {entry.title || `Entry ${index + 1}`}
                      {index === selectedEntryIndex && (
                        <span className="entry-selected-badge">● Currently viewing</span>
                      )}
                    </div>
                    <div className="entry-meta">
                      <span className="entry-date">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                      <span className="entry-subject">
                        {entry.subject ? `"${entry.subject}"` : 'No subject'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Entries Pagination */}
              {entriesPagination.totalPages > 1 && (
                <div className="entries-pagination">
                  <Button
                    onClick={() => handleEntriesPageChange(entriesPagination.currentPage - 1)}
                    disabled={!entriesPagination.hasPreviousPage || entriesLoading}
                    buttonType="tertiary"
                    className="pagination-btn"
                  >
                    ← Prev
                  </Button>
                  <span className="page-info">
                    Page {entriesPagination.currentPage} of {entriesPagination.totalPages}
                  </span>
                  <Button
                    onClick={() => handleEntriesPageChange(entriesPagination.currentPage + 1)}
                    disabled={!entriesPagination.hasNextPage || entriesLoading}
                    buttonType="tertiary"
                    className="pagination-btn"
                  >
                    Next →
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="preview-info">
        <div className="template-stats">
          <div className="stat-item">
            <span className="stat-label">Fields:</span>
            <span className="stat-value">{template.schema.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Entries:</span>
            <span className="stat-value">{entriesPagination.totalCount}</span>
          </div>
          {entries.length > 0 && (
            <div className="stat-item">
              <span className="stat-label">Viewing Entry:</span>
              <span className="stat-value">{selectedEntryIndex + 1} of {entriesPagination.totalCount}</span>
            </div>
          )}
          <div className="stat-item">
            <span className="stat-label">Template Created:</span>
            <span className="stat-value">{new Date(template.created_at).toLocaleDateString()}</span>
          </div>
          {entries.length > 0 && entries[selectedEntryIndex] && (
            <div className="stat-item">
              <span className="stat-label">Entry Created:</span>
              <span className="stat-value">{new Date(entries[selectedEntryIndex].created_at).toLocaleDateString()}</span>
            </div>
          )}
          <div className="stat-item">
            <span className="stat-label">Available Users:</span>
            <span className="stat-value">{emailUsers.length > 0 ? emailUsers.length : usersData.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailContentPreview; 