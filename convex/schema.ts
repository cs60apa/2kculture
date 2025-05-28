import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Configure authentication - removed custom auth config as it's handled via environment variables
  // User profile table
  users: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.string(), // 'artist' or 'listener'
    createdAt: v.number(), // timestamp
    bio: v.optional(v.string()),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
  }).searchIndex("search_userId", {
    searchField: "userId",
    filterFields: ["role"],
  }),

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
    shares: v.optional(v.number()), // share count
    comments: v.optional(v.number()), // comment count
    releaseDate: v.number(), // timestamp
    isPublic: v.boolean(), // whether the song is published
  })
    .searchIndex("search_artist", {
      searchField: "artistId",
      filterFields: ["isPublic"],
    })
    .searchIndex("search_album", {
      searchField: "albumId",
      filterFields: ["isPublic"],
    })
    .index("by_popularity", ["plays", "releaseDate"])
    .index("by_recent", ["releaseDate", "isPublic"]),

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
  }).searchIndex("search_artist", {
    searchField: "artistId",
    filterFields: ["isPublic"],
  }),

  // Playlists
  playlists: defineTable({
    name: v.string(),
    userId: v.string(), // Clerk user ID - owner of the playlist
    coverArt: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).searchIndex("search_user", {
    searchField: "userId",
    filterFields: ["isPublic"],
  }),

  // Playlist songs - many-to-many relation
  playlistSongs: defineTable({
    playlistId: v.id("playlists"),
    songId: v.id("songs"),
    addedAt: v.number(),
    position: v.number(), // for ordering songs in a playlist
  })
    .index("by_playlist_song", ["playlistId", "songId"])
    .index("by_added", ["addedAt"]),

  // User favorites - for liked songs
  favorites: defineTable({
    userId: v.string(), // Clerk user ID
    songId: v.id("songs"),
    addedAt: v.number(),
  })
    .index("by_user_favorite", ["userId", "songId"])
    .index("by_added", ["addedAt"]),

  // Likes system
  likes: defineTable({
    userId: v.string(), // Clerk user ID
    songId: v.id("songs"),
    createdAt: v.number(),
  })
    .index("by_like", ["userId", "songId"])
    .index("by_created", ["createdAt"]),

  // Listen history
  history: defineTable({
    userId: v.string(), // Clerk user ID
    songId: v.id("songs"),
    timestamp: v.number(),
    completed: v.boolean(), // Whether song was fully listened to
  }).index("by_user_time", ["userId", "timestamp"]),

  // Analytics: Plays table
  plays: defineTable({
    songId: v.id("songs"),
    artistId: v.string(), // references users.userId
    userId: v.optional(v.string()), // references users.userId, optional for anonymous plays
    timestamp: v.number(), // when the play occurred
  })
    .index("by_songId", ["songId"])
    .index("by_artistId", ["artistId"])
    .index("by_userId", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  // Analytics: Engagement table (likes, shares, etc.)
  engagement: defineTable({
    songId: v.id("songs"),
    artistId: v.string(), // references users.userId
    userId: v.string(), // references users.userId
    type: v.string(), // 'like', 'share', etc.
    timestamp: v.number(), // when the engagement occurred
  })
    .index("by_songId", ["songId"])
    .index("by_artistId", ["artistId"])
    .index("by_userId", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_type", ["type"]),
});
