import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { THeaderData, TUsersData, TEmailTemplateData, TUsersPaginationData, TCustomTemplatesPaginationData, TCustomTemplate } from "../types";

interface AppState {
  headerData: THeaderData;
  usersData: TUsersData[];
  usersPagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  emailTemplates: TEmailTemplateData[];
  customTemplates: any;
  customTemplatesPagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  emailUsers: TUsersData[];
  isLoadingEmailUsers: boolean;
  allCustomTemplates: TCustomTemplate[];
  isLoadingAllCustomTemplates: boolean;
}

const initialState: AppState = {
  headerData: {
    text: "",
    logo: {
      url: "",
    },
    navigation_links: {
      link: [
        {
          href: "",
          title: "",
        },
      ],
    },
  },
  usersData: [],
  usersPagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 6,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  emailTemplates: [],
  customTemplates: [],
  customTemplatesPagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 6,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  emailUsers: [],
  isLoadingEmailUsers: false,
  allCustomTemplates: [],
  isLoadingAllCustomTemplates: false
};

const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    setHeaderData: (state, action: PayloadAction<THeaderData>) => {
      state.headerData = action.payload;
    },
    setUsersData: (state, action: PayloadAction<TUsersData[]>) => {
      state.usersData = action.payload;
    },
    setUsersPaginationData: (state, action: PayloadAction<TUsersPaginationData>) => {
      state.usersData = action.payload.users;
      state.usersPagination = action.payload.pagination;
    },
    addUserData: (state, action: PayloadAction<TUsersData>) => {
      const users = [action.payload, ...state.usersData];
      state.usersData = users;
      // Update pagination count when adding a user
      state.usersPagination.totalCount += 1;
      state.usersPagination.totalPages = Math.ceil(state.usersPagination.totalCount / state.usersPagination.limit);
    },
    setEmailTemplatesData: (state, action: PayloadAction<TEmailTemplateData[]>) => {
      state.emailTemplates = action.payload;
    },
    addEmailTemplateData: (state, action: PayloadAction<TEmailTemplateData>) => {
      const templates = [action.payload, ...state.emailTemplates];
      state.emailTemplates = templates;
    },
    setCustomTemplatesData: (state, action: PayloadAction<any>) => {
      state.customTemplates = action.payload;
    },
    setCustomTemplatesPaginationData: (state, action: PayloadAction<TCustomTemplatesPaginationData>) => {
      state.customTemplates = action.payload.customTemplates;
      state.customTemplatesPagination = action.payload.pagination;
    },
    setEmailUsersData: (state, action: PayloadAction<TUsersData[]>) => {
      state.emailUsers = action.payload;
      state.isLoadingEmailUsers = false;
    },
    setEmailUsersLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingEmailUsers = action.payload;
    },
    setAllCustomTemplatesData: (state, action: PayloadAction<TCustomTemplate[]>) => {
      state.allCustomTemplates = action.payload;
      state.isLoadingAllCustomTemplates = false;
    },
    setAllCustomTemplatesLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingAllCustomTemplates = action.payload;
    },
  },
});

export const {
  setHeaderData,
  setUsersData,
  setUsersPaginationData,
  addUserData,
  setEmailTemplatesData,
  addEmailTemplateData,
  setCustomTemplatesData,
  setCustomTemplatesPaginationData,
  setEmailUsersData,
  setEmailUsersLoading,
  setAllCustomTemplatesData,
  setAllCustomTemplatesLoading,
} = mainSlice.actions;

export default mainSlice.reducer;
