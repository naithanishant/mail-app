import { Dispatch } from "react";
import { CONTENT_TYPES } from "../constants";
import {
  setHeaderData,
  setUsersData,
  setUsersPaginationData,
  addUserData,
  setEmailTemplatesData,
  addEmailTemplateData,
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
      console.log("Creating content type with schema:", schema);

      // Use template name for content type identification
      const templateName = schema.template_name || 'Untitled Template';
      const sanitizedName = templateName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      // Generate a unique content type UID using template name
      const contentTypeUID = `${sanitizedName}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      console.log("Generated content type UID:", contentTypeUID);
      
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
      const fields = schema.sections ? schema.sections.map(mapSectionToField) : [];

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

      // Create the content type payload
      const contentTypePayload = {
        content_type: {
          uid: contentTypeUID,
          title: templateName,
          description: schema.description || `Content type for ${templateName}`,
          schema: [titleField, ...fields],
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
          console.log("Content type created:", result);
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
    console.log("Creating regular email template entry with data:", templateData);
    
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

    console.log("Creating regular template entry:", templateEntry);

    // TODO: Replace with actual Contentstack API call
    // const entry = await ManagementStack.contentType('email_template').entry().create({
    //   entry: templateEntry
    // });

    // Simulate API response
    const response = {
      entry: templateEntry,
      notice: "Regular template created successfully"
    };

    console.log("Regular template entry created successfully:", response);

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

    console.log("Regular template added to state successfully");
  } catch (error) {
    console.error("Error creating regular email template:", error);
    throw error;
  }
};

// Create custom drag-drop template (template name only)
export const createCustomTemplate = async (
  dispatch: Dispatch<any>,
  templateData: { entry: TCreateCustomTemplateInput },
): Promise<void> => {
  try {
    console.log("Creating custom template entry with data:", templateData);
    
    const { 
      template_name, 
      template_body, 
      active, 
      dragDropData 
    } = templateData.entry;

    // Generate unique template UID
    const uid = `template_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const created_at = new Date().toISOString();

    // Create the template entry in Contentstack
    const templateEntry = {
      uid,
      template_name,
      template_body: template_body || "", // Generated from sections
      active,
      created_at,
      content_type_uid: null, // Will be set if content type is created
      isDragDropTemplate: true,
      dragDropData: dragDropData
    };

    console.log("Creating custom template entry:", templateEntry);

    // TODO: Replace with actual Contentstack API call
    // const entry = await ManagementStack.contentType('email_template').entry().create({
    //   entry: templateEntry
    // });

    // Simulate API response
    const response = {
      entry: templateEntry,
      notice: "Custom template created successfully"
    };

    console.log("Custom template entry created successfully:", response);

    // Add the new template to the state (using TCustomTemplateData format)
    dispatch(addEmailTemplateData({ 
      uid, 
      template_name, 
      template_subject: "", // Empty for custom templates
      template_body: template_body || "",
      active, 
      created_at,
      content_type_uid: undefined
    }));

    console.log("Custom template added to state successfully");
  } catch (error) {
    console.error("Error creating custom template:", error);
    throw error;
  }
};

// Complete workflow for creating drag-drop templates with content types
export const createDragDropTemplateWithContentType = async (
  dispatch: Dispatch<any>,
  templateData: { entry: TCreateCustomTemplateInput },
): Promise<any> => {
  try {
    let contentTypeUID = null;
    let contentTypeResult = null;
    
    // Step 1: Create content type if it's a drag-drop template
    if (templateData.entry.isDragDropTemplate && templateData.entry.dragDropData) {
      console.log("Creating content type for drag-drop template...");
      
      try {
        contentTypeResult = await createContentType(templateData.entry.dragDropData);
        console.log("Content type created successfully:", contentTypeResult);
        // contentTypeUID = contentTypeResult.uid;
        // console.log("Content type created successfully with UID:", contentTypeUID);
        // console.log("Content type title:", contentTypeResult.content_type.title);
      } catch (error) {
        console.error("Error creating content type:", error);
        throw new Error(`Failed to create content type: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Step 2: Create custom template entry (without template creation for now)
    // Note: Template entry creation is currently disabled per user's changes
    // Only content type creation is active
    
    // Return complete result with template name
    return {
      contentTypeName: contentTypeResult?.content_type?.title || templateData.entry.template_name,
      templateUID: `template_${Date.now()}`,
      templateName: templateData.entry.template_name,
      success: true,
      message: `Content type '${contentTypeResult?.content_type?.title}' created successfully for template '${templateData.entry.template_name}'`
    };
    
  } catch (error) {
    console.error("Error in complete template creation workflow:", error);
    throw error;
  }
};

// Separate function for creating content type only
export const createTemplateContentType = async (dragDropData: any): Promise<string> => {
  try {
    console.log("Creating template content type only:", dragDropData);
    
    const contentTypeResult = await createContentType(dragDropData);
    const contentTypeUID = contentTypeResult.uid;
    
    console.log("Content type created successfully with UID:", contentTypeUID);
    return contentTypeUID;
  } catch (error) {
    console.error("Error creating template content type:", error);
    throw error;
  }
};

// export const fetchEmailTemplateData = async (
//   dispatch: Dispatch<any>
// ): Promise<void> => {
//   const data = await getEntry(CONTENT_TYPES.EMAIL_TEMPLATE);
//   dispatch(setEmailTemplatesData(data[0]));
// };

// export const createUser = async (
//   dispatch: Dispatch<any>,
//   userData: any,
// ): Promise<void> => {
//   const data = await createEntry({ contentTypeUid: CONTENT_TYPES.USERS, entryData: userData });
//   await fetchUsersData(dispatch);
// };

// export const createEmailTemplate = async (
//   dispatch: Dispatch<any>,
//   templateData: any,
// ): Promise<void> => {
//   const data = await createEntry({ contentTypeUid: CONTENT_TYPES.EMAIL_TEMPLATE, entryData: templateData });
//   await fetchEmailTemplateData(dispatch);
// };

export const fetchInitialData = async (
  dispatch: Dispatch<any>,
  setLoading: (status: boolean) => void
): Promise<void> => {
  try {
    console.log("fetching initial data");
    await Promise.all([
      fetchHeaderData(dispatch),
      fetchUsersData(dispatch, 1, 5), // Start with first page, 5 users per page
      fetchEmailTemplateData(dispatch),
    ]);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

