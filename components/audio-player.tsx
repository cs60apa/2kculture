"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isMinimized] = useState(false)

  // Mock current track data
  const currentTrack = {
    title: "Midnight City",
    artist: "M83",
    album: "Hurry Up, We're Dreaming",
    cover: "/placeholder.svg?height=60&width=60",
  }

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // Toggle like
  const toggleLike = () => {
    setIsLiked(!isLiked)
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-background border-t z-40 transition-all duration-300",
        isMinimized ? "h-16" : "h-20",
      )}
    >
      <div className="container h-full flex items-center justify-between gap-4 px-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 max-w-[30%]">
          <Image
            src={currentTrack.cover || "/placeholder.svg"}
            alt={currentTrack.title}
            width={48}
            height={48}
            className="h-12 w-12 rounded object-cover"
          />
          <div className="min-w-0">
            <h4 className="font-medium truncate">{currentTrack.title}</h4>
            <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
          <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={toggleLike}>
            <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")} />
            <span className="sr-only">Like</span>
          </Button>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center justify-center flex-1 max-w-2xl gap-1">
          <div className="flex items-center justify-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Shuffle className="h-4 w-4" />
              <span className="sr-only">Shuffle</span>
            </Button>
            <Button variant="ghost" size="icon">
              <SkipBack className="h-5 w-5" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
            </Button>
            <Button variant="ghost" size="icon">
              <SkipForward className="h-5 w-5" />
              <span className="sr-only">Next</span>
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Repeat className="h-4 w-4" />
              <span className="sr-only">Repeat</span>
            </Button>
          </div>

          <div className="w-full hidden sm:flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={(value) => setCurrentTime(value[0])}
              className="w-full [&>span:first-child]:h-1 [&>span:first-child]:bg-muted [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-purple-600"
            />
            <span className="text-xs text-muted-foreground w-10">{formatTime(duration || 0)}</span>
          </div>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2 min-w-[100px] max-w-[20%]">
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            step={1}
            onValueChange={(value) => {
              setVolume(value[0])
              if (value[0] > 0 && isMuted) setIsMuted(false)
            }}
            className="w-full hidden sm:flex [&>span:first-child]:h-1 [&>span:first-child]:bg-muted [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-purple-600"
          />
        </div>
      </div>
    </div>
  )
}
