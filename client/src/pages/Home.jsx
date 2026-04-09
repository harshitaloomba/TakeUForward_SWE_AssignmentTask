import { useState } from "react";
import CalendarPage from "../features/calendar/CalendarPage";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  return (
    <>
      <CalendarPage />
    </>
  );
}