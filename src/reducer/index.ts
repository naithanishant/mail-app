import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { THeaderData, TUsersData, TEmailTemplateData, TUsersPaginationData } from "../types";

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
  customTemplates: []
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
} = mainSlice.actions;

export default mainSlice.reducer;
