import React, { useState, useRef, useEffect } from 'react';
import { TContentTypeField, TDynamicFieldValue, TContentstackAsset } from '../../types';
import RichTextEditor from './RichTextEditor/RichTextEditor';
import { fetchAssets } from '../../api';
import '../../styles/DynamicFormField.css';

interface DynamicFormFieldProps {
  field: TContentTypeField;
  value: TDynamicFieldValue;
  onChange: (value: TDynamicFieldValue) => void;
  error?: string;
  disabled?: boolean;
}

const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assets, setAssets] = useState<TContentstackAsset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch assets when modal opens
  useEffect(() => {
    if (showAssetModal && assets.length === 0) {
      fetchAssetsFromContentstack();
    }
  }, [showAssetModal]);

  // Fetch assets from Contentstack
  const fetchAssetsFromContentstack = async () => {
    setIsLoadingAssets(true);
    try {
      const response = await fetchAssets({
        limit: 100,
        skip: 0,
        query: assetSearchQuery ? { title: { $regex: assetSearchQuery } } : {}
      });
      setAssets(response.items || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
      setAssets([]);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setAssetSearchQuery(query);
    if (query.trim()) {
      fetchAssetsFromContentstack();
    } else {
      fetchAssetsFromContentstack();
    }
  };

  // Filter assets based on field type
  const filteredAssets = assets.filter(asset => {
    const isImage = field.field_metadata.image;
    const allowedExtensions = field.field_metadata.extensions || [];
    
    if (isImage) {
      // For image fields, only show image files
      return asset.content_type.startsWith('image/');
    } else {
      // For file fields, show files matching allowed extensions
      if (allowedExtensions.length > 0) {
        const fileExtension = asset.filename.split('.').pop()?.toLowerCase();
        return fileExtension && allowedExtensions.includes(fileExtension);
      }
      return true;
    }
  });

  // Handle text input changes
  const handleTextChange = (newValue: string) => {
    onChange({
      ...value,
      value: newValue
    });
  };

  // Handle rich text editor changes
  const handleRichTextChange = (newValue: string) => {
    onChange({
      ...value,
      value: newValue
    });
  };



  // Handle asset selection
  const handleAssetSelect = (selectedAsset: TContentstackAsset) => {
    onChange({
      ...value,
      value: selectedAsset.url,
      assets: [selectedAsset]
    });
    setShowAssetModal(false);
  };

  // Handle remove asset
  const handleRemoveAsset = () => {
    onChange({
      ...value,
      value: '',
      assets: []
    });
  };

  // Open asset selection modal
  const openAssetModal = () => {
    setShowAssetModal(true);
  };

  // Close asset selection modal
  const closeAssetModal = () => {
    setShowAssetModal(false);
  };

  // Render asset selection modal
  const renderAssetModal = () => {
    if (!showAssetModal) return null;

    return (
      <div className="asset-modal-overlay" onClick={closeAssetModal}>
        <div className="asset-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="asset-modal-header">
            <h3>Select {field.field_metadata.image ? 'Image' : 'File'}</h3>
            <button className="asset-modal-close" onClick={closeAssetModal}>×</button>
          </div>
          
          <div className="asset-modal-search">
            <input
              type="text"
              placeholder="Search assets..."
              value={assetSearchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="asset-modal-body">
            {isLoadingAssets ? (
              <div className="asset-loading">Loading assets...</div>
            ) : filteredAssets.length > 0 ? (
              <div className="asset-grid">
                {filteredAssets.map((asset) => (
                  <div 
                    key={asset.uid} 
                    className="asset-grid-item"
                    onClick={() => handleAssetSelect(asset)}
                  >
                    {field.field_metadata.image ? (
                      <div className="asset-image-container">
                        <img 
                          src={asset.url} 
                          alt={asset.title || asset.filename}
                          className="asset-grid-image"
                        />
                        <div className="asset-overlay">
                          <div className="asset-info">
                            <div className="asset-name">{asset.title || asset.filename}</div>
                            <div className="asset-size">
                              {asset.file_size ? `${Math.round(parseInt(asset.file_size) / 1024)}KB` : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="asset-file-container">
                        <div className="asset-file-icon">📄</div>
                        <div className="asset-file-info">
                          <div className="asset-name">{asset.title || asset.filename}</div>
                          <div className="asset-details">
                            <div className="asset-type">{asset.content_type}</div>
                            <div className="asset-size">
                              {asset.file_size ? `${Math.round(parseInt(asset.file_size) / 1024)}KB` : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="asset-empty">
                No {field.field_metadata.image ? 'images' : 'files'} found.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render field based on type
  const renderField = () => {
    const { data_type, field_metadata } = field;
    const isRequired = field.mandatory;
    const placeholder = field_metadata.description || `Enter ${field.display_name.toLowerCase()}`;

    switch (data_type) {
      case 'text':
        // Check if this is a content field (not subject, cc, bcc fields)
        const isContentField = !field.uid.includes('subject') && 
                              !field.uid.includes('cc') && 
                              !field.uid.includes('bcc');
        
        if (field_metadata.rich_text_type === 'advanced' || field_metadata.rich_text_type === 'basic') {
          return (
            <div>
              <RichTextEditor
                value={value.value || ''}
                onChange={handleRichTextChange}
                placeholder={placeholder}
                hasError={!!error}
                minHeight={field_metadata.multiline ? 150 : 100}
                maxHeight={400}
              />
              {isContentField && (
                <small className="template-variables-helper">
                  💡 <strong>Template Variables:</strong> You can use <code>{'{{first_name}}'}</code>, <code>{'{{last_name}}'}</code>, <code>{'{{image_url}}'}</code>, and <code>{'{{file_url}}'}</code> in your content to personalize emails.
                </small>
              )}
            </div>
          );
        }
        
        if (field_metadata.multiline) {
          return (
            <div>
              <textarea
                value={value.value || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={placeholder}
                className={`form-input ${error ? 'error' : ''}`}
                disabled={disabled}
                rows={4}
              />
              {isContentField && (
                <small className="template-variables-helper">
                  💡 <strong>Template Variables:</strong> You can use <code>{'{{first_name}}'}</code>, <code>{'{{last_name}}'}</code>, <code>{'{{image_url}}'}</code>, and <code>{'{{file_url}}'}</code> in your content to personalize emails.
                </small>
              )}
            </div>
          );
        }
        
        return (
          <div>
            <input
              type="text"
              value={value.value || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={placeholder}
              className={`form-input ${error ? 'error' : ''}`}
              disabled={disabled}
            />
            {isContentField && (
              <small className="template-variables-helper">
                💡 <strong>Template Variables:</strong> You can use <code>{'{{first_name}}'}</code>, <code>{'{{last_name}}'}</code>, <code>{'{{email}}'}</code>, and <code>{'{{file_url}}'}</code> in your content to personalize emails.
              </small>
            )}
          </div>
        );

      case 'file':
        const allowedTypes = field_metadata.extensions || [];
        const maxSize = field_metadata.file_size || '10MB';
        const isImage = field_metadata.image;

        return (
          <div className="file-upload-container">
            {value.assets && value.assets.length > 0 ? (
              <div className="selected-asset-container">
                <div className="selected-asset-preview">
                  {isImage ? (
                    <div className="image-preview">
                      <img 
                        src={value.assets[0].url} 
                        alt={value.assets[0].title || value.assets[0].filename} 
                        className="asset-thumbnail"
                      />
                      <div className="asset-details">
                        <strong>{value.assets[0].title || value.assets[0].filename}</strong>
                        <small>{value.assets[0].content_type}</small>
                        {value.assets[0].file_size && (
                          <small>Size: {Math.round(parseInt(value.assets[0].file_size) / 1024)}KB</small>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="file-preview">
                      <div className="file-icon">📄</div>
                      <div className="asset-details">
                        <strong>{value.assets[0].title || value.assets[0].filename}</strong>
                        <small>{value.assets[0].content_type}</small>
                        {value.assets[0].file_size && (
                          <small>Size: {Math.round(parseInt(value.assets[0].file_size) / 1024)}KB</small>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="asset-actions">
                    <button 
                      type="button" 
                      onClick={openAssetModal}
                      className="asset-replace-btn"
                      disabled={disabled}
                    >
                      Replace
                    </button>
                    <button 
                      type="button" 
                      onClick={handleRemoveAsset}
                      className="asset-remove-btn"
                      disabled={disabled}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="asset-selection-container">
                <button 
                  type="button" 
                  onClick={openAssetModal}
                  className="select-asset-btn"
                  disabled={disabled}
                >
                  Select {isImage ? 'Image' : 'File'} from Contentstack
                </button>
                <div className="asset-info">
                  <small>
                    Supported: {allowedTypes.join(', ')} | Max size: {maxSize}
                  </small>
                </div>
              </div>
            )}
            {renderAssetModal()}
          </div>
        );



      default:
        return (
          <input
            type="text"
            value={value.value || ''}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={placeholder}
            className={`form-input ${error ? 'error' : ''}`}
            disabled={disabled}
          />
        );
    }
  };



  return (
    <div className="dynamic-form-field">
      <label className="form-label">
        {field.display_name}
        {field.mandatory && <span className="required-asterisk"> *</span>}
      </label>
      {renderField()}
      {error && <span className="error-message">{error}</span>}
      {field.field_metadata.description && (
        <small className="field-description">{field.field_metadata.description}</small>
      )}
    </div>
  );
};

export default DynamicFormField; 