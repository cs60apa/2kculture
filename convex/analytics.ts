import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    const playsByDay = plays.reduce(
      (acc, play) => {
        const date = new Date(play.timestamp).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Calculate play counts by song
    const playsBySong = plays.reduce(
      (acc, play) => {
        acc[play.songId] = (acc[play.songId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

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
    const engagementByType = engagementEvents.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Calculate engagement by day
    const engagementByDay = engagementEvents.reduce(
      (acc, event) => {
        const date = new Date(event.timestamp).toISOString().split("T")[0];
        acc[date] = {
          ...acc[date],
          total: (acc[date]?.total || 0) + 1,
          [event.type]: (acc[date]?.[event.type] || 0) + 1,
        };
        return acc;
      },
      {} as Record<string, { total: number; [key: string]: number }>
    );

    // Calculate engagement by song
    const engagementBySong = engagementEvents.reduce(
      (acc, event) => {
        acc[event.songId] = {
          ...acc[event.songId],
          total: (acc[event.songId]?.total || 0) + 1,
          [event.type]: (acc[event.songId]?.[event.type] || 0) + 1,
        };
        return acc;
      },
      {} as Record<string, { total: number; [key: string]: number }>
    );

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

// Query to get a song's engagement metrics
export const getSongEngagementMetrics = query({
  args: {
    songId: v.id("songs"),
  },
  handler: async (ctx, { songId }) => {
    const [plays, engagements] = await Promise.all([
      ctx.db
        .query("plays")
        .filter((q) => q.eq(q.field("songId"), songId))
        .collect(),
      ctx.db
        .query("engagement")
        .filter((q) => q.eq(q.field("songId"), songId))
        .collect(),
    ]);

    const uniqueListeners = new Set(plays.map((p) => p.userId).filter(Boolean))
      .size;

    // Group engagements by type
    const engagementsByType = engagements.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const uniqueLikes = engagements.filter((e) => e.type === "like").length;
    const uniqueShares = engagements.filter((e) => e.type === "share").length;
    const uniqueComments = engagements.filter(
      (e) => e.type === "comment"
    ).length;

    // Calculate engagement rate (ratio of total engagements to plays)
    const totalEngagements = engagements.length;
    const engagementRate =
      plays.length > 0 ? (totalEngagements / plays.length) * 100 : 0;

    return {
      totalPlays: plays.length,
      uniqueListeners,
      totalEngagements,
      engagementRate,
      engagementsByType,
      uniqueLikes,
      uniqueShares,
      uniqueComments,
    };
  },
});
