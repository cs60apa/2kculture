"use client";

import { GlobalPlayer } from "@/components/global-player";
import { usePathname } from "next/navigation";
import { usePlayerStore } from "@/lib/player-store";

export default function PlayerWrapper() {
  const pathname = usePathname();
  const { currentSong } = usePlayerStore();

  // Only show the player if we have a current song
  // and we're not on the home page (landing page)
  const showPlayer = currentSong && pathname !== "/";

  if (!showPlayer) return null;

  return <GlobalPlayer />;
}
