import { readData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const suggestions = readData("profile/suggestions.md");
  const snapshot = readData("profile/snapshot.md");
  return (
    <>
      <h1>Profile</h1>
      <p className="lede">Copy these into LinkedIn yourself. AJAX will not touch the live profile.</p>
      <h2>Suggestions</h2>
      <div className="card md">{suggestions}</div>
      <h2>Snapshot (fact base)</h2>
      <div className="card md">{snapshot}</div>
    </>
  );
}
