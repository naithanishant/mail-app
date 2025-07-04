import { Dispatch } from "react";
import { CONTENT_TYPES } from "../constants";
import {
  setHeaderData,
  setUsersData,
  setEmailTemplatesData,
} from "../reducer";
import { initializeContentstackSdk, initContentstackManagementSdk } from "../sdk/utils";
import * as Utils from "@contentstack/utils";

const Stack = initializeContentstackSdk();
const ManagementStack = initContentstackManagementSdk();

type GetEntryByUrl = {
  entryUrl: string | undefined;
  contentTypeUid: string;
  referenceFieldPath: string[] | undefined;
  jsonRtePath: string[] | undefined;
};

const renderOption = {
  span: (node: any, next: any) => next(node.children),
};

export const getEntry = (contentType: string) => {
  const Query = Stack.ContentType(contentType).Query();
  return Query.toJSON()
    .find()
    .then((entry) => {
      return entry;
    })
    .catch((err: any) => {
      return {};
    });
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
  dispatch: Dispatch<any>
): Promise<void> => {
  const data = await getEntry(CONTENT_TYPES.USERS);
  dispatch(setUsersData(data[0]));
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
  await fetchUsersData(dispatch);
};

export const createEmailTemplate = async (
  dispatch: Dispatch<any>,
  templateData: any,
): Promise<void> => {
  const data = await createEntry({ contentTypeUid: CONTENT_TYPES.EMAIL_TEMPLATE, entryData: templateData });
  await fetchEmailTemplateData(dispatch);
};

export const fetchInitialData = async (
  dispatch: Dispatch<any>,
  setLoading: (status: boolean) => void
): Promise<void> => {
  try {
    await Promise.all([
      fetchHeaderData(dispatch),
      fetchUsersData(dispatch),
      fetchEmailTemplateData(dispatch),
    ]);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

