import { redirect } from "next/navigation";

// /docs/api redirects to the main API Reference page
export default function DocsApiPage() {
  redirect("/docs");
}
