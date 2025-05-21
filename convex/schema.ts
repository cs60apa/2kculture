import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profile table
  users: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.string(), // 'artist' or 'listener'
    createdAt: v.number(), // timestamp
  }).index("by_userId", ["userId"]),

  // Songs table
  songs: defineTable({
    title: v.string(),
    artistId: v.string(), // references users.userId
    artistName: v.string(), // denormalized for efficiency
    albumId: v.optional(v.id("albums")),
    audioUrl: v.string(), // UploadThing URL
    coverArt: v.optional(v.string()), // UploadThing URL
    duration: v.optional(v.number()),
    genres: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    plays: v.number(), // play count
    likes: v.number(), // like count
    releaseDate: v.number(), // timestamp
    isPublic: v.boolean(), // whether the song is published
  })
    .index("by_artistId", ["artistId"])
    .index("by_albumId", ["albumId"])
    .index("by_popular", ["plays"])
    .index("by_recent", ["releaseDate"]),

  // Albums table
  albums: defineTable({
    title: v.string(),
    artistId: v.string(), // references users.userId
    artistName: v.string(), // denormalized for efficiency
    coverArt: v.optional(v.string()), // UploadThing URL
    releaseDate: v.number(), // timestamp
    genres: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    isPublic: v.boolean(), // whether the album is published
  }).index("by_artistId", ["artistId"]),

  // Playlists
  playlists: defineTable({
    name: v.string(),
    userId: v.string(), // Clerk user ID - owner of the playlist
    coverArt: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Playlist songs - many-to-many relation
  playlistSongs: defineTable({
    playlistId: v.id("playlists"),
    songId: v.id("songs"),
    addedAt: v.number(),
    position: v.number(), // for ordering songs in a playlist
  })
    .index("by_playlist", ["playlistId"])
    .index("by_song", ["songId"]),

  // User favorites - for liked songs
  favorites: defineTable({
    userId: v.string(), // Clerk user ID
    songId: v.id("songs"),
    addedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_song", ["songId"]),

  // Likes system
  likes: defineTable({
    userId: v.string(), // Clerk user ID
    songId: v.id("songs"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_song", ["songId"])
    .index("by_user_song", ["userId", "songId"]),

  // Listen history
  history: defineTable({
    userId: v.string(), // Clerk user ID
    songId: v.id("songs"),
    timestamp: v.number(),
    completed: v.boolean(), // Whether song was fully listened to
  }).index("by_user_time", ["userId", "timestamp"]),
});
