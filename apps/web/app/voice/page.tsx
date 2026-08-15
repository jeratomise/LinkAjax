import { listMd, readData } from "@/lib/data";
import { MergeButton } from "./ui";

export const dynamic = "force-dynamic";

export default function VoicePage() {
  const voice = readData("voice.md");
  const about = readData("about-me.md");
  const inbox = listMd("posts/inbox");
  return (
    <>
      <h1>Voice</h1>
      <p className="lede">Every original post you drop in data/posts/inbox is merged into this profile. Cloud Agent automation does the same on push.</p>
      <p className="meta">{inbox.length} file{inbox.length === 1 ? "" : "s"} waiting in inbox.</p>
      <MergeButton disabled={inbox.length === 0} />
      <h2>voice.md</h2>
      <div className="card md">{voice}</div>
      <h2>about-me.md</h2>
      <div className="card md">{about}</div>
    </>
  );
}
