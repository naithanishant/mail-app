/**
 * Validates Rich Text Editor content
 * @param content - The HTML content from the RTE
 * @param fieldName - Name of the field for error messages
 * @returns Error message if invalid, null if valid
 */
export const validateRTEContent = (content: string, fieldName: string): string | null => {
  if (!content || content.trim() === '') {
    return `${fieldName} is required`;
  }

  // Remove HTML tags and check if there's actual text content
  const textContent = content.replace(/<[^>]*>/g, '').trim();
  
  // Check for empty content (only HTML tags with no text)
  if (textContent === '' || textContent === '&nbsp;') {
    return `${fieldName} cannot be empty`;
  }

  // Check for minimum length (optional)
  if (textContent.length < 10) {
    return `${fieldName} must be at least 10 characters long`;
  }

  // Check for maximum length (optional)
  if (textContent.length > 10000) {
    return `${fieldName} must not exceed 10,000 characters`;
  }

  return null;
};

/**
 * Normalizes Rich Text Editor content
 * @param content - The HTML content from the RTE
 * @returns Normalized content
 */
export const normalizeRTEContent = (content: string): string => {
  if (!content) {
    return '';
  }

  // Remove empty paragraphs at the beginning and end
  let normalized = content.trim();
  
  // Remove empty paragraphs with only whitespace or &nbsp;
  normalized = normalized.replace(/<p[^>]*>(\s|&nbsp;)*<\/p>/g, '');
  
  // Remove empty divs
  normalized = normalized.replace(/<div[^>]*>(\s|&nbsp;)*<\/div>/g, '');
  
  // Remove multiple consecutive line breaks
  normalized = normalized.replace(/(<br\s*\/?>){3,}/g, '<br><br>');
  
  // Ensure consistent paragraph structure
  if (normalized && !normalized.startsWith('<p>') && !normalized.includes('<p>')) {
    normalized = `<p>${normalized}</p>`;
  }
  
  return normalized;
};

/**
 * Converts RTE content to plain text
 * @param content - The HTML content from the RTE
 * @returns Plain text content
 */
export const rteToPlainText = (content: string): string => {
  if (!content) {
    return '';
  }

  // Remove HTML tags and decode HTML entities
  const textContent = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .trim();

  return textContent;
};

/**
 * Checks if RTE content is empty
 * @param content - The HTML content from the RTE
 * @returns True if content is empty, false otherwise
 */
export const isRTEContentEmpty = (content: string): boolean => {
  if (!content) {
    return true;
  }

  const textContent = rteToPlainText(content);
  return textContent === '' || textContent === '&nbsp;';
};

/**
 * Truncates RTE content to a specified length
 * @param content - The HTML content from the RTE
 * @param maxLength - Maximum length of the truncated text
 * @returns Truncated plain text content
 */
export const truncateRTEContent = (content: string, maxLength: number = 150): string => {
  if (!content) {
    return '';
  }

  const textContent = rteToPlainText(content);
  
  if (textContent.length <= maxLength) {
    return textContent;
  }

  return textContent.substring(0, maxLength).trim() + '...';
}; 