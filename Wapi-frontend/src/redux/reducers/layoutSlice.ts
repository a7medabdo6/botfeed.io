import { DEFAULT_LOCALE } from "@/src/constants/locale";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

function readInitialIsRTL(): boolean {
  if (typeof window === "undefined") return false;
  const rtlStored = localStorage.getItem("isRTL");
  if (rtlStored === "true") return true;
  if (rtlStored === "false") return false;
  const lang = localStorage.getItem("selected_language") || DEFAULT_LOCALE;
  return lang === "ar";
}

const initialState = {
  sidebarToggle: false,
  isRTL: readInitialIsRTL(),
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    setSidebarToggle: (state, action: PayloadAction<boolean | undefined>) => {
      state.sidebarToggle = typeof action.payload === "boolean" ? action.payload : !state.sidebarToggle;
      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebarToggle", String(state.sidebarToggle));
      }
    },
    setRTL: (state, action: PayloadAction<boolean | undefined>) => {
      state.isRTL = typeof action.payload === "boolean" ? action.payload : !state.isRTL;
      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("isRTL", String(state.isRTL));
      }
    },
  },
});

export const { setSidebarToggle, setRTL } = layoutSlice.actions;

export default layoutSlice.reducer;
