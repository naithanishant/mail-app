export type THeaderData = {
  text: string;
  logo: {
    url: string;
  };
  navigation_links: {
    link: {
      href: string;
      title: string;
    }[];
  };
};

export type TUsersData = {
  id: string;
  uid: string;
  first_name: string;
  last_name: string;
  email: string;
  subscribed: boolean;
};

export type TUsersPaginationData = {
  users: TUsersData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type TSchemaField = {
  id: string;
  type: 'text' | 'textarea' | 'rich_text' | 'boolean' | 'file' | 'select' | 'reference';
  display_name: string;
  field_metadata: {
    description?: string;
    default_value?: any;
    mandatory?: boolean;
    multiple?: boolean;
    options?: string[];
  };
};

export type TTemplateSchema = {
  content_type_id: string;
  title: string;
  description: string;
  fields: TSchemaField[];
};

// Regular/Legacy Email Template Data (with subject)
export type TEmailTemplateData = {
  uid: string;
  template_name: string;
  template_subject: string;
  template_body: string;
  active: boolean;
  created_at?: string;
  schema?: TTemplateSchema;
  // Content type UID for dynamically created content types
  content_type_uid?: string;
}

// Custom Drag-Drop Template Data (template name only)
export type TCustomTemplateData = {
  uid: string;
  template_name: string;
  template_body: string;
  active: boolean;
  created_at?: string;
  // Always true for custom templates
  isDragDropTemplate: true;
  // The drag-drop template structure
  dragDropData: import('../schemas/templateSchema').TDragDropTemplate;
  // Content type UID for dynamically created content types
  content_type_uid?: string;
}

// Union type for handling both template types
export type TAnyTemplateData = TEmailTemplateData | TCustomTemplateData;

// Input data for creating regular templates
export type TCreateEmailTemplateInput = {
  template_name: string;
  template_subject: string;
  template_body: string;
  active: boolean;
  isDragDropTemplate?: false;
}

// Input data for creating custom drag-drop templates
export type TCreateCustomTemplateInput = {
  template_name: string;
  template_body?: string; // Optional, generated from sections
  active: boolean;
  isDragDropTemplate: true;
  dragDropData: import('../schemas/templateSchema').TDragDropTemplate;
}

export type TLink = {
  href: string;
  title: string;
};

// New types for SendEmail component
export type TEmailTag = {
  id: string;
  label: string;
  value: string;
};

export type TSelectedUser = {
  id: string;
  name: string;
  email: string;
  subscribed: boolean;
};

export type TEmailForm = {
  subject: string;
  body: string;
  recipients: TSelectedUser[];
  tags: TEmailTag[];
};

export type TEmailFormErrors = {
  subject?: string;
  body?: string;
  recipients?: string;
  tags?: string;
};