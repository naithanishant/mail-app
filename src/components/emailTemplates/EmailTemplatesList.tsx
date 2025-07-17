import React, { useState, useEffect } from 'react';
import { Button } from '@contentstack/venus-components';
import { useNavigate } from 'react-router-dom';
import '../../styles/EmailTemplatesList.css';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { createTemplateContentType, fetchCustomTemplatesDataWithPagination } from '../../api/index';
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
  const { customTemplates, customTemplatesPagination } = useSelector((state: RootState) => state.main);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [isDragDropModalOpen, setIsDragDropModalOpen] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  // Fetch custom templates on component mount
  useEffect(() => {
    fetchCustomTemplatesDataWithPagination(dispatch, 1, 6);
  }, [dispatch]);

  const handleOpenDragDropModal = () => {
    setIsDragDropModalOpen(true);
  };

  const handleCloseDragDropModal = () => {
    setIsDragDropModalOpen(false);
  };

  const handleViewTemplate = (template: CustomTemplate) => {
    navigate(`/templates/${template.uid}/preview`);
  };

  // Handle custom drag-drop template creation
  const handleDragDropTemplate = async (templateData: TCreateCustomTemplateInput) => {
    try {
      await createTemplateContentType(templateData.dragDropData);
      // Refresh custom templates list after creation
      fetchCustomTemplatesDataWithPagination(dispatch, customTemplatesPagination.currentPage, customTemplatesPagination.limit);
      showSuccess('Template created successfully!');
    } catch (error) {
      console.error('Error creating custom template:', error);
      showError(`Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePageChange = async (page: number) => {
    if (page !== customTemplatesPagination.currentPage && !isLoadingPage) {
      setIsLoadingPage(true);
      try {
        await fetchCustomTemplatesDataWithPagination(dispatch, page, customTemplatesPagination.limit);
      } catch (error) {
        console.error('Error fetching custom templates:', error);
        showError('Failed to fetch templates. Please try again.');
      } finally {
        setIsLoadingPage(false);
      }
    }
  };

  const handlePreviousPage = () => {
    if (customTemplatesPagination.hasPreviousPage) {
      handlePageChange(customTemplatesPagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (customTemplatesPagination.hasNextPage) {
      handlePageChange(customTemplatesPagination.currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const totalPages = customTemplatesPagination.totalPages;
    const currentPage = customTemplatesPagination.currentPage;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        endPage = Math.min(totalPages, 5);
      }
      
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get field count for template preview
  const getFieldCount = (schema: any[]) => {
    return schema ? schema.length : 0;
  };

  // Calculate display indices for pagination info
  const startIndex = (customTemplatesPagination.currentPage - 1) * customTemplatesPagination.limit;
  const endIndex = Math.min(startIndex + customTemplates.length, customTemplatesPagination.totalCount);

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

      {customTemplatesPagination.totalCount === 0 ? (
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
        <>
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

          {/* Loading indicator */}
          {isLoadingPage && (
            <div className="pagination-loading">
              <div className="loading-spinner"></div>
              <span>Loading templates...</span>
            </div>
          )}

          {/* Pagination Controls */}
          {customTemplatesPagination.totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {startIndex + 1} to {endIndex} of {customTemplatesPagination.totalCount} templates
              </div>
              
              <div className="pagination-controls">
                <Button
                  onClick={handlePreviousPage}
                  disabled={!customTemplatesPagination.hasPreviousPage || isLoadingPage}
                  className="pagination-button pagination-prev"
                >
                  Previous
                </Button>
                
                <div className="pagination-numbers">
                  {generatePageNumbers().map((page) => (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={isLoadingPage}
                      className={`pagination-number ${customTemplatesPagination.currentPage === page ? 'active' : ''} ${isLoadingPage ? 'loading' : ''}`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  onClick={handleNextPage}
                  disabled={!customTemplatesPagination.hasNextPage || isLoadingPage}
                  className="pagination-button pagination-next"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="templates-count">
        <p className="body-small">Total Custom Templates: {customTemplatesPagination.totalCount}</p>
      </div>

      <DragDropTemplateModal
        isOpen={isDragDropModalOpen}
        onClose={handleCloseDragDropModal}
        onSaveTemplate={handleDragDropTemplate}
      />
    </div>
  );
};

export default EmailTemplatesList; 