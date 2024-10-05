import { CharacterViewer } from "./character-viewer";
import { FaceMesh } from "./face-mesh";

export default function Home() {
  return (
    <main className="h-svh w-full">
      <CharacterViewer />
      <FaceMesh />
    </main>
  );
}
