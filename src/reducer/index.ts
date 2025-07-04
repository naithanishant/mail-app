import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { THeaderData, TUsersData, TEmailTemplateData } from "../types";

interface AppState {
  headerData: THeaderData;
  usersData: TUsersData[];
  emailTemplates: TEmailTemplateData[];
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
  emailTemplates: []
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
    setEmailTemplatesData: (state, action: PayloadAction<TEmailTemplateData[]>) => {
      state.emailTemplates = action.payload;
    },
  },
});

export const {
  setHeaderData,
  setUsersData,
  setEmailTemplatesData,
} = mainSlice.actions;

export default mainSlice.reducer;
