"use client";

import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Heart,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  ListMusic,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { usePlayerStore, type Song } from "@/lib/player-store";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@clerk/nextjs";

export function GlobalPlayer() {
  const { user } = useUser();
  const [expanded, setExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const soundRef = useRef<Howl | null>(null);
  const seekIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const incrementPlayCount = useMutation(api.music.incrementPlayCount);

  // Player store state
  const {
    currentSong,
    isPlaying,
    volume,
    muted,
    repeat,
    shuffle,
    queue,
    queueIndex,
    togglePlay,
    playNext,
    playPrevious,
    toggleRepeat,
    toggleShuffle,
    setVolume,
    toggleMute,
    removeFromQueue,
  } = usePlayerStore();

  // Initialize howler with the audio source when the song changes
  useEffect(() => {
    if (currentSong) {
      // Clean up previous sound instance
      if (soundRef.current) {
        soundRef.current.unload();
      }

      // Create new instance
      const sound = new Howl({
        src: [currentSong.audioUrl],
        html5: true,
        volume: muted ? 0 : volume,
        onload: () => {
          // Log play count once
          if (currentSong._id) {
            incrementPlayCount({
              songId: currentSong._id as Id<"songs">,
            }).catch(console.error);
          }
        },
        onend: () => {
          playNext();
        },
      });

      soundRef.current = sound;

      // Start playing if isPlaying is true
      if (isPlaying) {
        sound.play();

        // Start seek interval
        seekIntervalRef.current = setInterval(() => {
          if (!seeking) {
            setCurrentTime(sound.seek() || 0);
          }
        }, 1000);
      }

      // Clean up on unmount or when song changes
      return () => {
        if (soundRef.current) {
          soundRef.current.unload();
        }
        if (seekIntervalRef.current) {
          clearInterval(seekIntervalRef.current);
        }
      };
    }
  }, [currentSong, incrementPlayCount]);

  // Handle play/pause changes
  useEffect(() => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.play();

      if (!seekIntervalRef.current) {
        seekIntervalRef.current = setInterval(() => {
          if (!seeking) {
            setCurrentTime(soundRef.current?.seek() || 0);
          }
        }, 1000);
      }
    } else {
      soundRef.current.pause();

      if (seekIntervalRef.current) {
        clearInterval(seekIntervalRef.current);
        seekIntervalRef.current = null;
      }
    }
  }, [isPlaying]);

  // Handle volume/mute changes
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(muted ? 0 : volume);
    }
  }, [volume, muted]);

  // Handle seek change
  const handleSeekChange = (values: number[]) => {
    const seekValue = values[0];
    setSeeking(true);
    setCurrentTime(seekValue);
  };

  // Complete seeking when user releases slider
  const handleSeekComplete = (values: number[]) => {
    if (!soundRef.current) return;

    const seekValue = values[0];
    soundRef.current.seek(seekValue);
    setSeeking(false);
  };

  // Format the song duration
  const duration = currentSong?.duration || soundRef.current?.duration() || 0;

  if (!currentSong) return null;

  return (
    <>
      {/* Minimized player - always visible at bottom */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-background border-t z-40 transition-all duration-300",
          expanded ? "h-[calc(100vh-4rem)]" : "h-16"
        )}
      >
        {!expanded && (
          <div className="flex items-center justify-between px-4 h-full">
            <div className="flex items-center gap-3 w-1/4">
              <div className="h-10 w-10 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                {currentSong.coverArt ? (
                  <img
                    src={currentSong.coverArt}
                    alt={currentSong.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-400/30 to-indigo-600/30">
                    <div className="text-lg font-semibold text-primary/70">
                      {currentSong.title[0]}
                    </div>
                  </div>
                )}
              </div>
              <div className="truncate">
                <div className="font-medium text-sm truncate">
                  {currentSong.title}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {currentSong.artistName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 w-2/4 justify-center">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={playPrevious}
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={playNext}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 w-1/4 justify-end">
              <Sheet open={queueOpen} onOpenChange={setQueueOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <ListMusic className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <QueueView />
                </SheetContent>
              </Sheet>

              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setExpanded(true)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Expanded player */}
        {expanded && (
          <div className="h-full flex flex-col">
            <div className="flex justify-end p-4">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setExpanded(false)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto px-4 gap-8">
              <div className="w-full aspect-square bg-secondary rounded-lg overflow-hidden shadow-xl">
                {currentSong.coverArt ? (
                  <img
                    src={currentSong.coverArt}
                    alt={currentSong.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-indigo-600">
                    <div className="text-5xl font-bold text-white">
                      {currentSong.title[0]}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full text-center">
                <h2 className="text-2xl font-semibold mb-1">
                  {currentSong.title}
                </h2>
                <p className="text-muted-foreground">
                  {currentSong.artistName}
                </p>
              </div>

              <div className="w-full space-y-2">
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeekChange}
                  onValueCommit={handleSeekComplete}
                  className="cursor-pointer"
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              <div className="w-full flex justify-between items-center">
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "text-muted-foreground hover:text-foreground",
                    shuffle && "text-primary hover:text-primary"
                  )}
                  onClick={toggleShuffle}
                >
                  <Shuffle className="h-5 w-5" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10"
                  onClick={playPrevious}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>

                <Button
                  size="icon"
                  variant="default"
                  className="h-14 w-14 rounded-full"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-0.5" />
                  )}
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10"
                  onClick={playNext}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "text-muted-foreground hover:text-foreground",
                    repeat !== "off" && "text-primary hover:text-primary"
                  )}
                  onClick={toggleRepeat}
                >
                  {repeat === "one" ? (
                    <Repeat1 className="h-5 w-5" />
                  ) : (
                    <Repeat className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <div className="w-full flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={toggleMute}>
                  {muted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>

                <Slider
                  value={[muted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(values) => setVolume(values[0])}
                  className="w-full"
                />
              </div>

              <div className="w-full flex justify-between items-center">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    setExpanded(false);
                    setQueueOpen(true);
                  }}
                >
                  <ListMusic className="h-4 w-4" />
                  Queue
                </Button>

                <FavoriteSongButton
                  songId={currentSong._id as Id<"songs">}
                  userId={user?.id}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add padding to the bottom of the page to account for the player */}
      <div className="h-16" />
    </>
  );
}

// Queue view component
function QueueView() {
  const { queue, queueIndex, currentSong, playSong, removeFromQueue } =
    usePlayerStore();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between py-2">
        <h3 className="font-semibold">Queue</h3>
      </div>

      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-1 py-2">
          {currentSong && (
            <>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Now Playing
              </h4>
              <QueueItem
                song={currentSong}
                isActive={true}
                onClick={() => {}}
                onRemove={null}
              />
            </>
          )}

          {queue.length > 1 && (
            <>
              <h4 className="text-sm font-medium text-muted-foreground mt-4 mb-2">
                Up Next
              </h4>
              {queue.slice(queueIndex + 1).map((song, idx) => (
                <QueueItem
                  key={`${song._id}-${idx}`}
                  song={song}
                  isActive={false}
                  onClick={() => playSong(song)}
                  onRemove={() => removeFromQueue(queueIndex + 1 + idx)}
                />
              ))}

              {queueIndex > 0 && (
                <>
                  <h4 className="text-sm font-medium text-muted-foreground mt-4 mb-2">
                    Previous
                  </h4>
                  {queue.slice(0, queueIndex).map((song, idx) => (
                    <QueueItem
                      key={`${song._id}-${idx}`}
                      song={song}
                      isActive={false}
                      onClick={() => playSong(song)}
                      onRemove={() => removeFromQueue(idx)}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Queue item component
function QueueItem({
  song,
  isActive,
  onClick,
  onRemove,
}: {
  song: Song;
  isActive: boolean;
  onClick: () => void;
  onRemove: (() => void) | null;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 py-2 px-3 rounded-md",
        isActive ? "bg-secondary" : "hover:bg-secondary/50 cursor-pointer"
      )}
      onClick={isActive ? undefined : onClick}
    >
      <Avatar className="h-10 w-10 rounded-md">
        {song.coverArt ? (
          <img
            src={song.coverArt}
            alt={song.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-400/30 to-indigo-600/30">
            <div className="text-sm font-semibold text-primary/70">
              {song.title[0]}
            </div>
          </div>
        )}
      </Avatar>

      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "font-medium text-sm truncate",
            isActive && "text-primary"
          )}
        >
          {song.title}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {song.artistName}
        </div>
      </div>

      {onRemove && (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// Favorite button component
function FavoriteSongButton({
  songId,
  userId,
}: {
  songId: Id<"songs">;
  userId?: string;
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const toggleLike = useMutation(api.music.toggleLike);

  // Handle toggling favorite status
  const handleToggleFavorite = async () => {
    if (!userId) return;

    try {
      const result = await toggleLike({
        songId,
        userId,
      });

      setIsFavorite(result.liked);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Fallback to local state toggle if API fails
      setIsFavorite(!isFavorite);
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn(
        "h-10 w-10",
        isFavorite && "text-pink-500 hover:text-pink-600"
      )}
      onClick={handleToggleFavorite}
      disabled={!userId}
    >
      <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
    </Button>
  );
}
