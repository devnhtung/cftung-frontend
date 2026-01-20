import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";

dayjs.locale("vi");
dayjs.extend(weekday);
dayjs.extend(localeData);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
