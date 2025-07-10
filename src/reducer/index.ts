import { createSlice, PayloadAction } from "@reduxjs/toolkit";
<<<<<<< Updated upstream
import { THeaderData, TUsersData } from "../types";
=======
import { THeaderData, TUsersData, TEmailTemplateData, TUsersPaginationData } from "../types";
>>>>>>> Stashed changes

interface AppState {
  headerData: THeaderData;
  usersData: TUsersData[];
<<<<<<< Updated upstream
=======
  usersPagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  emailTemplates: TEmailTemplateData[];
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  usersData: [
    {
      first_name: "",
      last_name: "",
      email: "",
      subscribed: false,
    }
  ],
=======
  usersData: [],
  usersPagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 6,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  emailTemplates: []
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
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
>>>>>>> Stashed changes
  },
});

export const {
  setHeaderData,
  setUsersData,
<<<<<<< Updated upstream
=======
  setUsersPaginationData,
  addUserData,
  setEmailTemplatesData,
  addEmailTemplateData,
>>>>>>> Stashed changes
} = mainSlice.actions;

export default mainSlice.reducer;
