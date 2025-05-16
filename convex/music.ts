import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// USER RELATED FUNCTIONS
export const createUser = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      userId: args.userId,
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
      role: args.role,
      createdAt: Date.now(),
    });

    return userId;
  },
});

export const getUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    return user;
  },
});

// SONG RELATED FUNCTIONS
export const createSong = mutation({
  args: {
    title: v.string(),
    artistId: v.string(),
    artistName: v.string(),
    albumId: v.optional(v.id("albums")),
    audioUrl: v.string(),
    coverArt: v.optional(v.string()),
    duration: v.optional(v.number()),
    genres: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    isPublic: v.boolean(),
    releaseDate: v.optional(v.number()), // Allow custom release date
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.artistId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const songId = await ctx.db.insert("songs", {
      title: args.title,
      artistId: args.artistId,
      artistName: args.artistName,
      albumId: args.albumId,
      audioUrl: args.audioUrl,
      coverArt: args.coverArt,
      duration: args.duration,
      genres: args.genres,
      tags: args.tags,
      plays: 0,
      likes: 0,
      releaseDate: args.releaseDate || Date.now(), // Use provided date or current timestamp
      isPublic: args.isPublic,
    });

    return songId;
  },
});

export const getSongs = query({
  handler: async (ctx) => {
    const songs = await ctx.db
      .query("songs")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .take(50);

    return songs;
  },
});

export const getSongsByArtist = query({
  args: { artistId: v.string() },
  handler: async (ctx, args) => {
    const songs = await ctx.db
      .query("songs")
      .withIndex("by_artistId", (q) => q.eq("artistId", args.artistId))
      .order("desc")
      .collect();

    return songs;
  },
});

export const getPopularSongs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const songs = await ctx.db
      .query("songs")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .take(limit);

    return songs;
  },
});

export const searchSongs = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase();

    // Basic search - in a production app, you'd implement a more robust search function
    const allSongs = await ctx.db
      .query("songs")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();

    return allSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(searchQuery) ||
        song.artistName.toLowerCase().includes(searchQuery) ||
        (song.genres &&
          song.genres.some((genre) =>
            genre.toLowerCase().includes(searchQuery)
          ))
    );
  },
});

// ALBUM RELATED FUNCTIONS
export const createAlbum = mutation({
  args: {
    title: v.string(),
    artistId: v.string(),
    artistName: v.string(),
    coverArt: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.artistId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const albumId = await ctx.db.insert("albums", {
      title: args.title,
      artistId: args.artistId,
      artistName: args.artistName,
      coverArt: args.coverArt,
      genres: args.genres,
      description: args.description,
      releaseDate: Date.now(),
    });

    return albumId;
  },
});

export const getAlbumsByArtist = query({
  args: { artistId: v.string() },
  handler: async (ctx, args) => {
    const albums = await ctx.db
      .query("albums")
      .withIndex("by_artistId", (q) => q.eq("artistId", args.artistId))
      .order("desc")
      .collect();

    return albums;
  },
});

export const getAlbumWithSongs = query({
  args: { albumId: v.id("albums") },
  handler: async (ctx, args) => {
    const album = await ctx.db.get(args.albumId);

    if (!album) {
      throw new Error("Album not found");
    }

    const songs = await ctx.db
      .query("songs")
      .withIndex("by_albumId", (q) => q.eq("albumId", args.albumId))
      .collect();

    return {
      album,
      songs,
    };
  },
});

// PLAYLIST RELATED FUNCTIONS
export const createPlaylist = mutation({
  args: {
    name: v.string(),
    userId: v.string(),
    description: v.optional(v.string()),
    coverArt: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const playlistId = await ctx.db.insert("playlists", {
      name: args.name,
      userId: args.userId,
      description: args.description,
      coverArt: args.coverArt,
      isPublic: args.isPublic,
      createdAt: now,
      updatedAt: now,
    });

    return playlistId;
  },
});

export const getUserPlaylists = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const playlists = await ctx.db
      .query("playlists")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return playlists;
  },
});

export const addSongToPlaylist = mutation({
  args: {
    playlistId: v.id("playlists"),
    songId: v.id("songs"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const playlist = await ctx.db.get(args.playlistId);

    if (!playlist) {
      throw new Error("Playlist not found");
    }

    if (playlist.userId !== args.userId) {
      throw new Error("Not authorized to modify this playlist");
    }

    const song = await ctx.db.get(args.songId);
    if (!song) {
      throw new Error("Song not found");
    }

    // Get the current highest position
    const existingSongs = await ctx.db
      .query("playlistSongs")
      .withIndex("by_playlist", (q) => q.eq("playlistId", args.playlistId))
      .collect();

    const position = existingSongs.length;

    // Add the song to the playlist
    const playlistSongId = await ctx.db.insert("playlistSongs", {
      playlistId: args.playlistId,
      songId: args.songId,
      addedAt: Date.now(),
      position,
    });

    // Update the playlist's updatedAt timestamp
    await ctx.db.patch(args.playlistId, {
      updatedAt: Date.now(),
    });

    return playlistSongId;
  },
});

// PLAY COUNT FUNCTIONS
export const incrementPlayCount = mutation({
  args: {
    songId: v.id("songs"),
  },
  handler: async (ctx, args) => {
    const song = await ctx.db.get(args.songId);

    if (!song) {
      throw new Error("Song not found");
    }

    // Increment play count
    await ctx.db.patch(args.songId, {
      plays: (song.plays || 0) + 1,
    });

    return { success: true };
  },
});

// LIKE/FAVORITES RELATED FUNCTIONS
export const toggleLike = mutation({
  args: {
    songId: v.id("songs"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if song exists
    const song = await ctx.db.get(args.songId);
    if (!song) {
      throw new Error("Song not found");
    }

    // Check if the like already exists
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_song", (q) =>
        q.eq("userId", args.userId).eq("songId", args.songId)
      )
      .first();

    // If like exists, remove it
    if (existingLike) {
      await ctx.db.delete(existingLike._id);
      return { liked: false };
    }

    // Otherwise, add the like
    await ctx.db.insert("likes", {
      userId: args.userId,
      songId: args.songId,
      createdAt: Date.now(),
    });

    return { liked: true };
  },
});
