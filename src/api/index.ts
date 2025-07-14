import { Dispatch } from "react";
import { CONTENT_TYPES } from "../constants";
import {
  setHeaderData,
  setUsersData,
  setUsersPaginationData,
  addUserData,
  setEmailTemplatesData,
  addEmailTemplateData,
  setCustomTemplatesData,
  setEmailUsersData,
  setEmailUsersLoading,
} from "../reducer";
import { TUsersPaginationData } from "../types";
import { initializeContentstackSdk, initializeContentstackManagementSdk } from "../sdk/utils";
import * as Utils from "@contentstack/utils";
import { TCreateEmailTemplateInput, TCreateCustomTemplateInput } from "../types";

const Stack = initializeContentstackSdk();
const ManagementStack = initializeContentstackManagementSdk();

type GetEntryByUrl = {
  entryUrl: string | undefined;
  contentTypeUid: string;
  referenceFieldPath: string[] | undefined;
  jsonRtePath: string[] | undefined;
};

const renderOption = {
  span: (node: any, next: any) => next(node.children),
};

export const getEntry = (contentType: string, page: number = 1, limit: number = 10) => {
  const Query = Stack.ContentType(contentType).Query().limit(limit).skip((page - 1) * limit);
  return Query.toJSON()
    .find()
    .then((entry) => {
      return entry;
    })
    .catch((err: any) => {
      return {};
    });
};

export const getEntryWithCount = async (contentType: string, page: number = 1, limit: number = 10) => {
  try {
    // ✅ OPTIMIZED: Single API call with includeCount()
    const Query = Stack.ContentType(contentType).Query()
      .limit(limit)
      .skip((page - 1) * limit)
      .includeCount(); // This includes the total count in the response
    
    const result = await Query.toJSON().find();
    
    // result[0] = entries array
    // result[result.length - 1] = total count (when includeCount() is used)
    const entries = result[0] || [];
    const totalCount = result[result.length - 1] || 0;
    
    return {
      entries,
      totalCount,
      currentPage: page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPreviousPage: page > 1,
    };
  } catch (err) {
    console.error("Error fetching entries with count:", err);
    return {
      entries: [],
      totalCount: 0,
      currentPage: 1,
      limit,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }
};

export const getEntryByUrl = ({
  contentTypeUid,
  entryUrl,
  referenceFieldPath,
  jsonRtePath,
}: GetEntryByUrl) => {
  return new Promise((resolve, reject) => {
    const blogQuery = Stack.ContentType(contentTypeUid).Query();
    if (referenceFieldPath) blogQuery.includeReference(referenceFieldPath);
    blogQuery.toJSON();
    const data = blogQuery.where("url", `${entryUrl}`).find();
    data.then(
      (result) => {
        jsonRtePath &&
          Utils.jsonToHTML({
            entry: result,
            paths: jsonRtePath,
            renderOption,
          });
        resolve(result[0]);
      },
      (error) => {
        console.error(error);
        reject(error);
      }
    );
  });
};

const publishEntry = (contentTypeUid: string, entryData: any) => {
  return new Promise((resolve, reject) => {
    ManagementStack.contentType(contentTypeUid).entry(entryData.uid).publish(entryData).then((result) => {
      resolve(result);
    }).catch((error) => {
      reject(error);
    });
  });
}

export const createEntry = ({
  contentTypeUid,
  entryData
}: {
  contentTypeUid: string;
  entryData: any;
}): Promise<any> => {
  return new Promise((resolve, reject) => {
    ManagementStack.contentType(contentTypeUid).entry().create(entryData).then((result) => {
      resolve(result);
    }).catch((error) => {
      reject(error);
    });
  });
}

export const fetchHeaderData = async (
  dispatch: Dispatch<any>
): Promise<void> => {
  const data = await getEntry(CONTENT_TYPES.HEADER);
  dispatch(setHeaderData(data[0][0]));
};

export const fetchUsersData = async (
  dispatch: Dispatch<any>,
  page: number = 1,
  limit: number = 6
): Promise<void> => {
  const data = await getEntryWithCount(CONTENT_TYPES.USERS, page, limit);
  
  const paginationData: TUsersPaginationData = {
    users: data.entries,
    pagination: {
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      totalCount: data.totalCount,
      limit: data.limit,
      hasNextPage: data.hasNextPage,
      hasPreviousPage: data.hasPreviousPage,
    },
  };
  
  dispatch(setUsersPaginationData(paginationData));
};

export const fetchEmailTemplateData = async (
  dispatch: Dispatch<any>
): Promise<void> => {
  const data = await getEntry(CONTENT_TYPES.EMAIL_TEMPLATE);
  dispatch(setEmailTemplatesData(data[0]));
};

export const fetchCustomTemplatesData = async (
  dispatch: Dispatch<any>
): Promise<void> => {
  try {
    // Fetch all content types that are not standard ones (custom templates)
    const data = await ManagementStack.contentType().query({
      query: {
        uid: {
          $nin: Object.values(CONTENT_TYPES)
        }
      }
    }).find();
    
    dispatch(setCustomTemplatesData(data?.items || []));
  } catch (error) {
    console.error("Error fetching custom templates:", error);
    dispatch(setCustomTemplatesData([]));
  }
};

// Fetch specific content type schema by UID
export const fetchContentTypeSchema = async (contentTypeUID: string): Promise<any> => {
  try {
    const contentType = await ManagementStack.contentType(contentTypeUID).fetch();
    return contentType;
  } catch (error) {
    console.error("Error fetching content type schema:", error);
    throw error;
  }
};

// Fetch assets from Contentstack (if needed for asset management)
export const fetchAssets = async (query: any = {}): Promise<any> => {
  try {
    const assets = await ManagementStack.asset().query(query).find();
    return assets;
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw error;
  }
};

// Create entry for custom content type
export const createCustomContentTypeEntry = async (
  contentTypeUID: string,
  entryData: any
): Promise<any> => {
  try {
    const entry = await ManagementStack.contentType(contentTypeUID).entry().create({
      entry: entryData
    });

    await ManagementStack.contentType(contentTypeUID).entry(entry.uid).publish({
      publishDetails: {
        locales: ['en-us'],
        environments: ['development']
      }
    });

    setTimeout(() => {
      startEmailSending(contentTypeUID, entry.uid);
    }, 5000);

    return entry;
  } catch (error) {
    console.error("Error creating custom content type entry:", error);
    throw error;
  }
};

export const createUser = async (
  dispatch: Dispatch<any>,
  userData: any,
): Promise<void> => {
  const data = await createEntry({ contentTypeUid: CONTENT_TYPES.USERS, entryData: userData });
  const { uid, first_name, last_name, email, subscribed } = data;
  dispatch(addUserData({ id: uid, uid, first_name, last_name, email, subscribed }));
};

export const createContentType = async (schema: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      // Use template name for content type identification
      const templateName = schema.template_name || 'Untitled Template';
      const sanitizedName = templateName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      // Map template sections to Contentstack field types
      const mapSectionToField = (section: any) => {
        const baseField = {
          display_name: section.config.label || section.type.charAt(0).toUpperCase() + section.type.slice(1),
          uid: `${section.type}_${section.id}`,
          mandatory: section.config.required || false,
        };

        switch (section.type) {
          case 'text':
            return {
              ...baseField,
              data_type: 'text',
              field_metadata: {
                description: section.config.description || '',
                default_value: section.config.content || '',
                multiline: section.config.contentType === 'paragraph',
                rich_text_type: section.config.isRichText ? 'advanced' : 'basic',
                options: []
              }
            };

          case 'image':
            return {
              ...baseField,
              data_type: 'file',
              field_metadata: {
                description: section.config.description || '',
                rich_text_type: 'standard',
                image: true,
                file_size: section.config.maxSize || '10',
                extensions: section.config.allowedTypes || ['jpg', 'jpeg', 'png', 'gif', 'webp']
              }
            };

          case 'file':
            return {
              ...baseField,
              data_type: 'file',
              field_metadata: {
                description: section.config.description || '',
                rich_text_type: 'standard',
                file_size: section.config.maxSize || '10',
                extensions: section.config.allowedTypes || ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']
              }
            };

          case 'link':
            // Return two separate text fields for link text and URL
            return [
              {
                display_name: `${section.config.label || 'Link'} Text`,
                uid: `${section.type}_${section.id}_text`,
                data_type: 'text',
                field_metadata: {
                  description: 'Text to display for the link',
                  default_value: section.config.linkText || 'Click Here',
                  multiline: false,
                  rich_text_type: 'basic'
                },
                mandatory: section.config.required || false,
                multiple: false
              },
              {
                display_name: `${section.config.label || 'Link'} URL`,
                uid: `${section.type}_${section.id}_url`,
                data_type: 'text',
                field_metadata: {
                  description: 'The URL the link should point to',
                  default_value: section.config.linkUrl || '',
                  multiline: false,
                  rich_text_type: 'basic'
                },
                mandatory: section.config.required || false,
                multiple: false
              }
            ];

          case 'cc':
          case 'bcc':
            return {
              ...baseField,
              data_type: 'text',
              field_metadata: {
                description: section.config.description || '',
                default_value: section.config.recipients || '',
                multiline: true,
                rich_text_type: 'basic'
              }
            };

          default:
            return {
              ...baseField,
              data_type: 'text',
              field_metadata: {
                description: 'Custom field',
                default_value: '',
                multiline: false,
                rich_text_type: 'basic'
              }
            };
        }
      };

      // Create fields from template sections
      const fields = schema.sections ? schema.sections.map(mapSectionToField).flat() : [];



      // Always add title field as required by Contentstack
      const titleField = {
        display_name: 'Title',
        uid: 'title',
        data_type: 'text',
        field_metadata: {
          description: 'Template title',
          default_value: templateName,
          multiline: false,
          rich_text_type: 'basic'
        },
        unique: false,
        mandatory: true,
        multiple: false
      };

      const subjectField = {
        display_name: 'Subject',
        uid: 'subject',
        data_type: 'text',
        field_metadata: {
          description: 'Email subject',
          default_value: '',
          multiline: false,
          rich_text_type: 'basic'
        },
        unique: false,
        mandatory: true,
        multiple: false
      };

      const reciepientsField = {
        display_name: 'Recipients',
        uid: 'recipients',
        data_type: 'text',
        field_metadata: {
          description: 'Email Recipients',
          default_value: '',
          multiline: false,
          rich_text_type: 'basic'
        },
        unique: false,
        mandatory: true,
        multiple: false
      };

      // Create the content type payload
      const contentTypePayload = {
        content_type: {
          uid: sanitizedName,
          title: templateName,
          description: schema.description || `Content type for ${templateName}`,
          schema: [titleField, subjectField, reciepientsField, ...fields],
          options: {
            is_page: false,
            singleton: false,
            title: 'title',
            sub_title: []
          }
        }
      };

      // TODO: Replace with actual Contentstack API call
      ManagementStack.contentType().create(contentTypePayload)
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          console.error("Error creating content type:", error);
          reject(error);
        });

      // Simulate successful content type creation
      // const mockResponse = {
      //   content_type: {
      //     uid: contentTypeUID,
      //     title: templateName,
      //     description: schema.description || `Content type for ${templateName}`,
      //     schema: [titleField, ...fields],
      //     created_at: new Date().toISOString(),
      //     updated_at: new Date().toISOString(),
      //     created_by: 'system',
      //     updated_by: 'system'
      //   },
      //   notice: `Content type '${templateName}' created successfully`
      // };

      // console.log("Mock content type creation response:", mockResponse);
      // resolve(mockResponse);

    } catch (error) {
      console.error("Error in createContentType:", error);
      reject(error);
    }
  });
};

// Create regular email template (with subject)
export const createEmailTemplate = async (
  dispatch: Dispatch<any>,
  templateData: { entry: TCreateEmailTemplateInput },
): Promise<void> => {
  try {
    const { 
      template_name, 
      template_subject,
      template_body, 
      active
    } = templateData.entry;

    // Generate unique template UID
    const uid = `template_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const created_at = new Date().toISOString();

    // Create the template entry in Contentstack
    const templateEntry = {
      uid,
      template_name,
      template_subject,
      template_body,
      active,
      created_at,
      content_type_uid: null, // Regular templates don't have custom content types
      isDragDropTemplate: false
    };

    // TODO: Replace with actual Contentstack API call
    // const entry = await ManagementStack.contentType('email_template').entry().create({
    //   entry: templateEntry
    // });

    // Simulate API response
    const response = {
      entry: templateEntry,
      notice: "Regular template created successfully"
    };

    // Add the new template to the state
    dispatch(addEmailTemplateData({ 
      uid, 
      template_name, 
      template_subject,
      template_body, 
      active, 
      created_at,
      content_type_uid: undefined
    }));
  } catch (error) {
    console.error("Error creating regular email template:", error);
    throw error;
  }
};

// Separate function for creating content type only
export const createTemplateContentType = async (dragDropData: any): Promise<string> => {
  try {
    const contentTypeResult = await createContentType(dragDropData);
    const contentTypeUID = contentTypeResult.uid;
    
    return contentTypeUID;
  } catch (error) {
    console.error("Error creating template content type:", error);
    throw error;
  }
};

export const fetchInitialData = async (
  dispatch: Dispatch<any>,
  setLoading: (status: boolean) => void
): Promise<void> => {
  try {
    await Promise.all([
      fetchHeaderData(dispatch),
      fetchUsersData(dispatch, 1, 5), // Start with first page, 5 users per page
      fetchEmailTemplateData(dispatch),
      fetchCustomTemplatesData(dispatch),
      fetchUsersForEmail(dispatch),
    ]);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// Fetch a specific entry by UID from a content type
export const fetchEntryByUID = async (
  contentTypeUID: string,
  entryUID: string
): Promise<any> => {
  try {
    const entry = await Stack.ContentType(contentTypeUID).Entry(entryUID).toJSON().fetch();
    return entry;
  } catch (error) {
    console.error("Error fetching entry by UID:", error);
    throw error;
  }
};

// Start email sending process
export const startEmailSending = async (
  contentTypeUID: string,
  entryUID: string,
  locale: string = 'en-us'
): Promise<any> => {
  try {
    const mailServiceUrl = process.env.REACT_APP_MAIL_SERVICE_URL || 'http://localhost:3001';
    const apiKey = process.env.REACT_APP_MAIL_SERVICE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Mail service API key is not configured. Please set REACT_APP_MAIL_SERVICE_API_KEY environment variable.');
    }

    const response = await fetch(`${mailServiceUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        contentTypeUid: contentTypeUID,
        entryUid: entryUID,
        locale
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || errorData.error || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error starting email sending:", error);
    throw error;
  }
};

// Send bulk emails
export const sendBulkEmails = async (
  requests: Array<{ contentTypeUid: string; entryUid: string; locale?: string }>
): Promise<any> => {
  try {
    const mailServiceUrl = process.env.REACT_APP_MAIL_SERVICE_URL || 'http://localhost:3001';
    const apiKey = process.env.REACT_APP_MAIL_SERVICE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Mail service API key is not configured. Please set REACT_APP_MAIL_SERVICE_API_KEY environment variable.');
    }

    const response = await fetch(`${mailServiceUrl}/api/send-bulk-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ requests })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || errorData.error || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending bulk emails:", error);
    throw error;
  }
};

// Check email sending status (legacy function - may not be needed with new mail service)
export const checkEmailSendingStatus = async (jobId: string): Promise<any> => {
  try {
    const response = await fetch(`/api/email-status/${jobId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking email sending status:", error);
    throw error;
  }
};

const searchUsersForEmail = async (searchText?: string) => {
  try {
    const [searchedUsers] = await Stack.ContentType(CONTENT_TYPES.USERS).Query().query({
      subscribed: true
    }).toJSON().find();
    return searchedUsers || [];
  } catch (error) {
    console.error('Error fetching users for email:', error);
    throw error;
  }
}

export const fetchUsersForEmail = async (
  dispatch: Dispatch<any>,
  searchText?: string
): Promise<void> => {
  dispatch(setEmailUsersLoading(true));
  try {
    const users = await searchUsersForEmail(searchText);
    dispatch(setEmailUsersData(users));
  } catch (error) {
    console.error('Error loading email users:', error);
    dispatch(setEmailUsersLoading(false));
    throw error;
  }
};
