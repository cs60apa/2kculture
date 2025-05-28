import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifyAdmin } from "./auth";

// Query to get play count analytics
export const getPlayCountAnalytics = query({
  args: {
    artistId: v.string(),
    timeframe: v.union(
      v.literal("7days"),
      v.literal("30days"),
      v.literal("90days"),
      v.literal("year")
    ),
  },
  handler: async (ctx, { artistId, timeframe }) => {
    const now = new Date();
    const startDate = new Date();

    // Set the start date based on timeframe
    switch (timeframe) {
      case "7days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(now.getDate() - 90);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get all plays and songs for this artist within the timeframe
    const [plays, allSongs] = await Promise.all([
      ctx.db
        .query("plays")
        .filter((q) =>
          q.and(
            q.eq(q.field("artistId"), artistId),
            q.gte(q.field("timestamp"), startDate.getTime())
          )
        )
        .collect(),
      ctx.db
        .query("songs")
        .filter((q) => q.eq(q.field("artistId"), artistId))
        .collect(),
    ]);

    // Calculate play counts by day
    const playsByDay = plays.reduce((acc, play) => {
      const date = new Date(play.timestamp).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate play counts by song
    const playsBySong = plays.reduce((acc, play) => {
      acc[play.songId] = (acc[play.songId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort songs by play count
    const rankedSongs = allSongs
      .map((song) => ({
        ...song,
        periodPlays: playsBySong[song._id] || 0,
      }))
      .sort((a, b) => b.periodPlays - a.periodPlays);

    return {
      totalPlays: plays.length,
      playsByDay,
      rankedSongs,
      averagePlayCount: plays.length / allSongs.length,
      uniqueListeners: new Set(plays.map((p) => p.userId).filter(Boolean)).size,
    };
  },
});

// Get overall dashboard stats including total plays, daily plays, top songs
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    // Get total plays
    const plays = await ctx.db.query("plays").collect();
    const totalPlays = plays.length;

    // Get daily plays for the last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentPlays = plays.filter((play) => play.timestamp >= thirtyDaysAgo);

    // Aggregate plays by day
    const dailyPlays = [];
    const dailyPlayMap = new Map();

    for (const play of recentPlays) {
      const date = new Date(play.timestamp).toDateString();
      const count = dailyPlayMap.get(date) || 0;
      dailyPlayMap.set(date, count + 1);
    }

    // Convert to array
    for (const [date, count] of dailyPlayMap.entries()) {
      dailyPlays.push({ date, count });
    }

    // Sort by date
    dailyPlays.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get top songs by play count
    const songPlays = new Map();
    for (const play of plays) {
      const count = songPlays.get(play.songId) || 0;
      songPlays.set(play.songId, count + 1);
    }

    const topSongsIds = [...songPlays.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([songId]) => songId);

    const topSongs = [];
    for (const songId of topSongsIds) {
      const song = await ctx.db.get(songId);
      // Check if it's a song with the expected properties
      if (song && "title" in song && "artistName" in song) {
        topSongs.push({
          id: song._id,
          title: song.title,
          artistName: song.artistName,
          coverArt: song.coverArt,
          plays: songPlays.get(songId) || 0,
        });
      }
    }

    return {
      totalPlays,
      dailyPlays,
      topSongs,
    };
  },
});

// Get recent activity for the dashboard
export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    // Define a type for our activity entries
    type ActivityEntry = {
      type: string;
      title: string;
      coverArt?: string;
      timestamp: number;
      count: number;
    };

    const recentActivity: ActivityEntry[] = [];

    // Get recent plays
    const recentPlays = await ctx.db.query("plays").order("desc").take(5);

    for (const play of recentPlays) {
      const song = await ctx.db.get(play.songId);
      // Check if song has the expected properties
      if (song && "title" in song) {
        // Count plays for this song
        const songPlays = await ctx.db
          .query("plays")
          .filter((q) => q.eq(q.field("songId"), play.songId))
          .collect();

        recentActivity.push({
          type: "play",
          title: song.title,
          coverArt: "coverArt" in song ? song.coverArt : undefined,
          timestamp: play.timestamp,
          count: songPlays.length,
        });
      }
    }

    // Get recent engagements (likes)
    const recentEngagements = await ctx.db
      .query("engagement")
      .filter((q) => q.eq(q.field("type"), "like"))
      .order("desc")
      .take(5);

    for (const engagement of recentEngagements) {
      const song = await ctx.db.get(engagement.songId);
      // Check if song has the expected properties
      if (song && "title" in song) {
        // Count likes for this song
        const songLikes = await ctx.db
          .query("engagement")
          .filter((q) =>
            q.and(
              q.eq(q.field("songId"), engagement.songId),
              q.eq(q.field("type"), "like")
            )
          )
          .collect();

        recentActivity.push({
          type: "like",
          title: song.title,
          coverArt: "coverArt" in song ? song.coverArt : undefined,
          timestamp: engagement.timestamp,
          count: songLikes.length,
        });
      }
    }

    // Get recent uploads (songs)
    const recentSongs = await ctx.db.query("songs").order("desc").take(5);

    for (const song of recentSongs) {
      // For songs, we can be sure they have the title property
      recentActivity.push({
        type: "upload",
        title: song.title,
        coverArt: song.coverArt,
        timestamp: song._creationTime,
        count: 1,
      });
    }

    // Sort by timestamp (most recent first) and take 10
    recentActivity.sort((a, b) => b.timestamp - a.timestamp);
    return recentActivity.slice(0, 10);
  },
});

// Mutation to track a new play
export const trackPlay = mutation({
  args: {
    songId: v.id("songs"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { songId, userId }) => {
    const song = await ctx.db.get(songId);
    if (!song) {
      throw new Error("Song not found");
    }

    // Record the play
    await ctx.db.insert("plays", {
      songId,
      artistId: song.artistId,
      userId,
      timestamp: Date.now(),
    });

    // Update the song's play count
    await ctx.db.patch(songId, {
      plays: (song.plays || 0) + 1,
    });

    return { success: true };
  },
});

// Mutation to track engagement events
export const trackEngagement = mutation({
  args: {
    songId: v.id("songs"),
    userId: v.string(),
    type: v.string(), // 'like', 'share', 'comment', etc.
  },
  handler: async (ctx, { songId, userId, type }) => {
    const song = await ctx.db.get(songId);
    if (!song) {
      throw new Error("Song not found");
    }

    // Record the engagement event
    await ctx.db.insert("engagement", {
      songId,
      artistId: song.artistId,
      userId,
      type,
      timestamp: Date.now(),
    });

    // Update counters on the song based on engagement type
    const update: { [key: string]: number } = {};

    switch (type) {
      case "like":
        update.likes = (song.likes || 0) + 1;
        break;
      case "share":
        update.shares = (song.shares || 0) + 1;
        break;
      case "comment":
        update.comments = (song.comments || 0) + 1;
        break;
    }

    if (Object.keys(update).length > 0) {
      await ctx.db.patch(songId, update);
    }

    return { success: true };
  },
});

// Query to get engagement analytics
export const getEngagementAnalytics = query({
  args: {
    artistId: v.string(),
    timeframe: v.union(
      v.literal("7days"),
      v.literal("30days"),
      v.literal("90days"),
      v.literal("year")
    ),
  },
  handler: async (ctx, { artistId, timeframe }) => {
    const now = new Date();
    const startDate = new Date();

    switch (timeframe) {
      case "7days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(now.getDate() - 90);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get all engagement events and plays for this artist within the timeframe
    const [engagementEvents, plays, allSongs] = await Promise.all([
      ctx.db
        .query("engagement")
        .filter((q) =>
          q.and(
            q.eq(q.field("artistId"), artistId),
            q.gte(q.field("timestamp"), startDate.getTime())
          )
        )
        .collect(),
      ctx.db
        .query("plays")
        .filter((q) =>
          q.and(
            q.eq(q.field("artistId"), artistId),
            q.gte(q.field("timestamp"), startDate.getTime())
          )
        )
        .collect(),
      ctx.db
        .query("songs")
        .filter((q) => q.eq(q.field("artistId"), artistId))
        .collect(),
    ]);

    // Calculate engagement by type
    const engagementByType = engagementEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate engagement by day
    const engagementByDay = engagementEvents.reduce((acc, event) => {
      const date = new Date(event.timestamp).toISOString().split("T")[0];
      acc[date] = {
        ...acc[date],
        total: (acc[date]?.total || 0) + 1,
        [event.type]: (acc[date]?.[event.type] || 0) + 1,
      };
      return acc;
    }, {} as Record<string, { total: number; [key: string]: number }>);

    // Calculate engagement by song
    const engagementBySong = engagementEvents.reduce((acc, event) => {
      acc[event.songId] = {
        ...acc[event.songId],
        total: (acc[event.songId]?.total || 0) + 1,
        [event.type]: (acc[event.songId]?.[event.type] || 0) + 1,
      };
      return acc;
    }, {} as Record<string, { total: number; [key: string]: number }>);

    // Calculate overall engagement rate
    const totalEngagements = engagementEvents.length;
    const totalPlays = plays.length;
    const engagementRate =
      totalPlays > 0 ? (totalEngagements / totalPlays) * 100 : 0;

    // Sort songs by engagement
    const rankedSongs = allSongs
      .map((song) => ({
        ...song,
        engagementStats: engagementBySong[song._id] || { total: 0 },
        plays: plays.filter((p) => p.songId === song._id).length,
      }))
      .sort(
        (a, b) =>
          b.engagementStats.total / (b.plays || 1) -
          a.engagementStats.total / (a.plays || 1)
      );

    return {
      totalEngagements,
      engagementRate,
      engagementByType,
      engagementByDay,
      rankedSongs,
      uniqueEngagedUsers: new Set(engagementEvents.map((e) => e.userId)).size,
    };
  },
});

// Get detailed analytics for a specific song
export const getSongAnalytics = query({
  args: { songId: v.id("songs") },
  handler: async (ctx, args) => {
    const { songId } = args;

    // Get song details
    const song = await ctx.db.get(songId);
    if (!song) {
      throw new Error("Song not found");
    }

    // Get all plays for the song
    const plays = await ctx.db
      .query("plays")
      .filter((q) => q.eq(q.field("songId"), songId))
      .collect();

    // Get likes for the song
    const likes = await ctx.db
      .query("engagement")
      .filter((q) =>
        q.and(q.eq(q.field("songId"), songId), q.eq(q.field("type"), "like"))
      )
      .collect();

    // Calculate daily plays for the last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentPlays = plays.filter((play) => play.timestamp >= thirtyDaysAgo);

    const dailyPlays = [];
    const dailyPlayMap = new Map();

    for (const play of recentPlays) {
      const date = new Date(play.timestamp).toDateString();
      const count = dailyPlayMap.get(date) || 0;
      dailyPlayMap.set(date, count + 1);
    }

    // Convert to array and sort
    for (const [date, count] of dailyPlayMap.entries()) {
      dailyPlays.push({ date, count });
    }

    dailyPlays.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      song,
      totalPlays: plays.length,
      totalLikes: likes.length,
      dailyPlays,
    };
  },
});

// Get overall artist analytics
export const getArtistAnalytics = query({
  args: { artistId: v.string() },
  handler: async (ctx, args) => {
    const { artistId } = args;

    // Get all songs by this artist
    const songs = await ctx.db
      .query("songs")
      .filter((q) => q.eq(q.field("artistId"), artistId))
      .collect();

    const songIds = songs.map((song) => song._id);

    // Get all plays for these songs - without using 'in' operator
    const plays = [];
    for (const songId of songIds) {
      const songPlays = await ctx.db
        .query("plays")
        .filter((q) => q.eq(q.field("songId"), songId))
        .collect();
      plays.push(...songPlays);
    }

    // Get all likes for these songs - without using 'in' operator
    const likes = [];
    for (const songId of songIds) {
      const songLikes = await ctx.db
        .query("engagement")
        .filter((q) =>
          q.and(q.eq(q.field("songId"), songId), q.eq(q.field("type"), "like"))
        )
        .collect();
      likes.push(...songLikes);
    }

    // Calculate plays and likes per song
    const songAnalytics = [];
    for (const song of songs) {
      const songPlays = plays.filter((play) => play.songId === song._id).length;
      const songLikes = likes.filter((like) => like.songId === song._id).length;

      songAnalytics.push({
        id: song._id,
        title: song.title,
        coverArt: song.coverArt,
        plays: songPlays,
        likes: songLikes,
        releaseDate: song.releaseDate,
      });
    }

    // Sort by play count (most played first)
    songAnalytics.sort((a, b) => b.plays - a.plays);

    // Calculate daily plays for the last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentPlays = plays.filter((play) => play.timestamp >= thirtyDaysAgo);

    const dailyPlays = [];
    const dailyPlayMap = new Map();

    for (const play of recentPlays) {
      const date = new Date(play.timestamp).toDateString();
      const count = dailyPlayMap.get(date) || 0;
      dailyPlayMap.set(date, count + 1);
    }

    // Convert to array and sort
    for (const [date, count] of dailyPlayMap.entries()) {
      dailyPlays.push({ date, count });
    }

    dailyPlays.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      totalSongs: songs.length,
      totalPlays: plays.length,
      totalLikes: likes.length,
      songAnalytics,
      dailyPlays,
    };
  },
});

// Get admin dashboard stats
export const getAdminDashboardStats = query({
  handler: async (ctx) => {
    const adminUser = await verifyAdmin(ctx);
    if (!adminUser) return null;

    // Get all plays
    const plays = await ctx.db.query("plays").collect();
    const totalPlays = plays.length;

    // Get total users and artists
    const users = await ctx.db.query("users").collect();
    const totalUsers = users.length;
    const totalArtists = users.filter((u) => u.role === "artist").length;

    // Get daily plays for the last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentPlays = plays.filter((play) => play.timestamp >= thirtyDaysAgo);

    const dailyPlays = [];
    const dailyPlayMap = new Map();

    for (const play of recentPlays) {
      const date = new Date(play.timestamp).toDateString();
      const count = dailyPlayMap.get(date) || 0;
      dailyPlayMap.set(date, count + 1);
    }

    // Convert to array and sort
    for (const [date, count] of dailyPlayMap.entries()) {
      dailyPlays.push({ date, count });
    }

    dailyPlays.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate top songs
    const songPlayCounts = new Map();
    for (const play of plays) {
      const count = songPlayCounts.get(play.songId) || 0;
      songPlayCounts.set(play.songId, count + 1);
    }

    const topSongIds = [...songPlayCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);

    const topSongs = [];
    for (const songId of topSongIds) {
      const song = await ctx.db.get(songId);
      // Check if it's a song with the expected properties
      if (song && "title" in song && "artistName" in song && "_id" in song) {
        topSongs.push({
          id: song._id,
          title: song.title,
          artistName: song.artistName,
          coverArt: "coverArt" in song ? song.coverArt : undefined,
          plays: songPlayCounts.get(song._id),
        });
      }
    }

    return {
      totalPlays,
      totalUsers,
      totalArtists,
      dailyPlays,
      topSongs,
    };
  },
});
