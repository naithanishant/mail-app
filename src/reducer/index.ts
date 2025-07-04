import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { THeaderData, TUsersData } from "../types";

interface AppState {
  headerData: THeaderData;
  usersData: TUsersData[];
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
  usersData: [
    {
      first_name: "",
      last_name: "",
      email: "",
      subscribed: false,
    }
  ],
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
  },
});

export const {
  setHeaderData,
  setUsersData,
} = mainSlice.actions;

export default mainSlice.reducer;
