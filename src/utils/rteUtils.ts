/**
 * Utility functions for Rich Text Editor content handling
 * Ensures consistent data format and validation across the platform
 */

/**
 * Checks if RTE content is empty
 * Handles various empty states that ReactQuill can produce
 */
export const isRTEContentEmpty = (content: string): boolean => {
  if (!content || content.trim() === '') {
    return true;
  }

  // Strip HTML tags and decode entities
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  // Check if only whitespace remains
  const cleanText = textContent.replace(/\s+/g, ' ').trim();
  
  return cleanText === '';
};

/**
 * Strips HTML tags from RTE content for display purposes
 * Safely handles HTML entities and returns clean text
 */
export const stripRTEContent = (content: string): string => {
  if (!content) return '';
  
  // Create a temporary div to decode HTML entities
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  
  // Get text content and clean up extra whitespace
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  return textContent.replace(/\s+/g, ' ').trim();
};

/**
 * Normalizes RTE content by removing empty paragraphs and formatting
 * Ensures consistent storage format
 */
export const normalizeRTEContent = (content: string): string => {
  if (!content || isRTEContentEmpty(content)) {
    return '';
  }
  
  // Remove empty paragraphs and normalize whitespace
  return content
    .replace(/<p><br><\/p>/g, '') // Remove empty paragraphs with break
    .replace(/<p><\/p>/g, '')     // Remove completely empty paragraphs
    .replace(/<p>\s*<\/p>/g, '')  // Remove paragraphs with only whitespace
    .trim();
};

/**
 * Validates RTE content and returns error message if invalid
 */
export const validateRTEContent = (content: string, fieldName: string = 'Content'): string | null => {
  if (isRTEContentEmpty(content)) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Truncates RTE content for preview display
 */
export const truncateRTEContent = (content: string, maxLength: number = 100): string => {
  const cleanText = stripRTEContent(content);
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  return cleanText.substring(0, maxLength) + '...';
}; 