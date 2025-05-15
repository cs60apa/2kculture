import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Song = {
  _id: string;
  title: string;
  artistName: string;
  audioUrl: string;
  coverArt?: string;
  duration?: number;
};

interface PlayerStore {
  // Current playing state
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  repeat: "off" | "all" | "one";
  shuffle: boolean;

  // Queue management
  queue: Song[];
  history: Song[];
  queueIndex: number;

  // Actions
  playSong: (song: Song) => void;
  playQueue: (songs: Song[], startIndex: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;

  // Playback controls
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seek: (time: number) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSong: null,
      isPlaying: false,
      volume: 0.7,
      muted: false,
      repeat: "off",
      shuffle: false,
      queue: [],
      history: [],
      queueIndex: -1,

      // Play single song (replaces queue)
      playSong: (song) => {
        set({
          currentSong: song,
          isPlaying: true,
          queue: [song],
          queueIndex: 0,
          history: get().currentSong
            ? [...get().history, get().currentSong].slice(-20) // Keep last 20 songs
            : get().history,
        });
      },

      // Play a queue of songs starting at specific index
      playQueue: (songs, startIndex) => {
        if (songs.length === 0) return;

        set({
          queue: songs,
          queueIndex: startIndex,
          currentSong: songs[startIndex],
          isPlaying: true,
          history: get().currentSong
            ? [...get().history, get().currentSong].slice(-20)
            : get().history,
        });
      },

      // Add song to end of queue
      addToQueue: (song) => {
        set({ queue: [...get().queue, song] });
      },

      // Remove song from queue
      removeFromQueue: (index) => {
        const newQueue = [...get().queue];
        newQueue.splice(index, 1);

        // Adjust currentIndex if needed
        const queueIndex = get().queueIndex;
        let newIndex = queueIndex;

        if (index < queueIndex) {
          newIndex = queueIndex - 1;
        }

        set({
          queue: newQueue,
          queueIndex: Math.min(newIndex, newQueue.length - 1),
        });
      },

      // Clear the queue
      clearQueue: () => {
        set({
          queue: get().currentSong ? [get().currentSong] : [],
          queueIndex: get().currentSong ? 0 : -1,
        });
      },

      // Toggle play/pause
      togglePlay: () => {
        set({ isPlaying: !get().isPlaying });
      },

      // Play next song
      playNext: () => {
        const { queue, queueIndex, shuffle, repeat } = get();

        if (queue.length === 0) return;

        let nextIndex;

        if (shuffle) {
          // Get random index excluding current
          const availableIndices = Array.from(
            { length: queue.length },
            (_, i) => i
          ).filter((i) => i !== queueIndex);

          if (availableIndices.length === 0) {
            if (repeat === "off") return;
            nextIndex = queueIndex; // Repeat same song if it's the only one
          } else {
            nextIndex =
              availableIndices[
                Math.floor(Math.random() * availableIndices.length)
              ];
          }
        } else {
          nextIndex = queueIndex + 1;

          // Handle end of queue based on repeat mode
          if (nextIndex >= queue.length) {
            if (repeat === "off") {
              set({ isPlaying: false });
              return;
            } else if (repeat === "one") {
              nextIndex = queueIndex;
            } else {
              // repeat === 'all'
              nextIndex = 0;
            }
          }
        }

        const nextSong = queue[nextIndex];

        set({
          currentSong: nextSong,
          queueIndex: nextIndex,
          isPlaying: true,
          history: get().currentSong
            ? [...get().history, get().currentSong].slice(-20)
            : get().history,
        });
      },

      // Play previous song
      playPrevious: () => {
        const { queue, queueIndex, history } = get();

        // First check if we have history
        if (history.length > 0) {
          const previousSong = history[history.length - 1];
          const newHistory = history.slice(0, -1);

          // Find if the previous song exists in queue already
          const songIndexInQueue = queue.findIndex(
            (song) => song._id === previousSong._id
          );

          if (songIndexInQueue >= 0) {
            set({
              currentSong: previousSong,
              queueIndex: songIndexInQueue,
              isPlaying: true,
              history: newHistory,
            });
          } else {
            // Insert into queue at current position
            const newQueue = [...queue];
            newQueue.splice(queueIndex, 0, previousSong);

            set({
              currentSong: previousSong,
              queue: newQueue,
              queueIndex: queueIndex,
              isPlaying: true,
              history: newHistory,
            });
          }
          return;
        }

        // If no history, just go back in the queue
        if (queue.length === 0) return;

        const prevIndex = queueIndex > 0 ? queueIndex - 1 : 0;
        const prevSong = queue[prevIndex];

        set({
          currentSong: prevSong,
          queueIndex: prevIndex,
          isPlaying: true,
        });
      },

      // Toggle repeat mode
      toggleRepeat: () => {
        const currentRepeat = get().repeat;
        const nextRepeat =
          currentRepeat === "off"
            ? "all"
            : currentRepeat === "all"
              ? "one"
              : "off";

        set({ repeat: nextRepeat });
      },

      // Toggle shuffle
      toggleShuffle: () => {
        set({ shuffle: !get().shuffle });
      },

      // Set volume
      setVolume: (volume) => {
        set({
          volume: volume,
          muted: volume === 0,
        });
      },

      // Toggle mute
      toggleMute: () => {
        set({ muted: !get().muted });
      },

      // Seek to position
      seek: (time) => {
        // This will be handled by the audio player component
        // since Zustand can't directly control the audio element
      },
    }),
    {
      name: "2kculture-player-store",
      // Only persist certain fields
      partialize: (state) => ({
        volume: state.volume,
        repeat: state.repeat,
        shuffle: state.shuffle,
        queue: state.queue,
        currentSong: state.currentSong,
      }),
    }
  )
);
