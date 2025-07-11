import { TContentstackAsset } from '../types';

// Asset utilities - File upload functionality disabled
export class AssetUtils {
  // File upload is disabled - returns error message
  static async uploadFile(file: File): Promise<TContentstackAsset> {
    throw new Error('File upload functionality has been disabled');
  }

  // Get asset URL from asset UID (placeholder)
  static async getAssetUrl(assetUID: string): Promise<string> {
    return `/assets/${assetUID}`;
  }

  // Validate file type and size
  static validateFile(file: File, allowedTypes: string[], maxSize: string): string | null {
    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }

    // Check file size
    const maxSizeInBytes = AssetUtils.parseFileSize(maxSize);
    if (file.size > maxSizeInBytes) {
      return `File size exceeds maximum allowed size of ${maxSize}`;
    }

    return null;
  }

  // Parse file size string to bytes
  static parseFileSize(sizeStr: string): number {
    const units: { [key: string]: number } = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
    };

    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);
    if (!match) {
      return 10 * 1024 * 1024; // Default to 10MB
    }

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    return value * (units[unit] || 1);
  }

  // Format file size for display
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Check if file is an image
  static isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  // Generate asset preview URL (placeholder)
  static getAssetPreviewUrl(asset: TContentstackAsset): string {
    // For images, return the URL directly
    if (asset.content_type.startsWith('image/')) {
      return asset.url;
    }
    
    // For other files, return a placeholder
    return '/file-icon.png';
  }
}

export default AssetUtils; 