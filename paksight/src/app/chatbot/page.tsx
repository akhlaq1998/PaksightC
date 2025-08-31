 
import { cookies } from "next/headers";
import ChatClient from "./ChatClient";

export default async function ChatbotPage() {
  const c = await cookies();
  const raw = c.get("paksight_session")?.value;
  const role = (raw ? (JSON.parse(raw).role as "ADMIN" | "MEMBER" | "VIEWER") : "VIEWER");
  return <ChatClient role={role} />;
}