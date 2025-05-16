import { Song as PlayerSong } from "@/lib/player-store";
import { Id } from "@/convex/_generated/dataModel";

// Extended Song type that includes all properties needed across the application
export interface Song extends PlayerSong {
  _id: string;
  artistId: string;
  artistName: string;
  audioUrl: string;
  coverArt?: string;
  genres?: string[];
  tags?: string[];
  plays?: number;
  isPublic: boolean;  // Should always be a boolean, but force it with Boolean() when needed
  releaseDate?: number;
  _creationTime?: number;
}

// For type safety when using with Convex
export type SongId = Id<"songs">;
