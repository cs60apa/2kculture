"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Howl } from "howler";
import {
  Heart,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Music,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  src: string;
  title: string;
  artist: string;
  coverArt?: string;
  songId?: Id<"songs">;
  // Keeping artistId for potential future use
  artistId?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
}

export const AudioPlayer = ({
  src,
  title,
  artist,
  coverArt,
  songId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  artistId,
  onNext,
  onPrevious,
  className,
}: AudioPlayerProps) => {
  const trackPlay = useMutation(api.analytics.trackPlay);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [seek, setSeek] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [liked, setLiked] = useState(false);
  const [hasTrackedPlay, setHasTrackedPlay] = useState(false);

  const soundRef = useRef<Howl | null>(null);
  const seekIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track play when song starts
  useEffect(() => {
    if (playing && songId && !hasTrackedPlay) {
      trackPlay({
        songId: songId as Id<"songs">,
        userId: undefined,
      });
      setHasTrackedPlay(true);
    }
  }, [playing, songId, trackPlay, hasTrackedPlay]);

  // Reset hasTrackedPlay when song changes
  useEffect(() => {
    setHasTrackedPlay(false);
  }, [src]);

  // Initialize howler with the audio source
  useEffect(() => {
    if (src) {
      // Clean up previous sound instance
      if (soundRef.current) {
        soundRef.current.unload();
      }

      // Create new instance
      const sound = new Howl({
        src: [src],
        html5: true,
        volume: volume,
        onload: () => {
          setDuration(sound.duration());
        },
        onend: () => {
          setPlaying(false);
          setSeek(0);
          if (repeat) {
            sound.play();
            setPlaying(true);
          } else if (onNext) {
            onNext();
          }
        },
      });

      soundRef.current = sound;

      // Clean up on component unmount
      return () => {
        if (soundRef.current) {
          soundRef.current.unload();
        }
        if (seekIntervalRef.current) {
          clearInterval(seekIntervalRef.current);
        }
      };
    }
  }, [src, volume, repeat, onNext]);

  // Handle play/pause toggle
  const togglePlay = () => {
    if (!soundRef.current) return;

    if (playing) {
      soundRef.current.pause();
      if (seekIntervalRef.current) {
        clearInterval(seekIntervalRef.current);
        seekIntervalRef.current = null;
      }
    } else {
      soundRef.current.play();
      // Start seek interval
      seekIntervalRef.current = setInterval(() => {
        if (soundRef.current) {
          setSeek(soundRef.current.seek());
        }
      }, 1000);
    }

    setPlaying(!playing);
  };

  // Handle seek change
  const handleSeekChange = (values: number[]) => {
    if (!soundRef.current) return;

    const newSeek = values[0];
    soundRef.current.seek(newSeek);
    setSeek(newSeek);
  };

  // Handle volume change
  const handleVolumeChange = (values: number[]) => {
    if (!soundRef.current) return;

    const newVolume = values[0];
    soundRef.current.volume(newVolume);
    setVolume(newVolume);

    if (newVolume === 0) {
      setMuted(true);
    } else if (muted) {
      setMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!soundRef.current) return;

    if (muted) {
      soundRef.current.volume(volume || 0.5);
      setMuted(false);
    } else {
      soundRef.current.volume(0);
      setMuted(true);
    }
  };

  // Format time in mm:ss
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Cover Art */}
        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
          {coverArt ? (
            <Image
              src={coverArt}
              alt={`${title} cover art`}
              className="w-full h-full object-cover"
              width={64}
              height={64}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-indigo-600">
              <Music className="text-white h-8 w-8" />
            </div>
          )}
        </div>

        {/* Track Info and Controls */}
        <div className="flex-1">
          <div className="mb-2">
            <h3 className="font-medium text-base line-clamp-1">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{artist}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <Slider
              value={[seek]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeekChange}
              className="cursor-pointer"
            />

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{formatTime(seek)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShuffle(!shuffle)}
            className={cn(
              "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white",
              shuffle &&
                "text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
            )}
          >
            <Shuffle className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onPrevious}
            disabled={!onPrevious}
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            onClick={togglePlay}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-10 w-10"
          >
            {playing ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onNext}
            disabled={!onNext}
          >
            <SkipForward className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setRepeat(!repeat)}
            className={cn(
              "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white",
              repeat &&
                "text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
            )}
          >
            <Repeat className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLiked(!liked)}
            className={cn(
              "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white",
              liked &&
                "text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300"
            )}
          >
            <Heart className={cn("h-5 w-5", liked && "fill-current")} />
          </Button>

          <Button size="icon" variant="ghost" onClick={toggleMute}>
            {muted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>

          <div className="w-24">
            <Slider
              value={[muted ? 0 : volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
