import { Outlet } from "react-router";
import { AIChatBot } from "../components/AIChatBot";

export function Root() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      <AIChatBot />
    </div>
  );
}
