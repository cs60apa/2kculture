"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"
import { allGenres } from "@/lib/data"

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
          // Reset form or show success message
        }, 500)
      }
    }, 200)
  }

  return (
    <div className="container px-4 py-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-3xl font-bold">Upload Your Music</h1>
        <p className="text-muted-foreground">Share your tracks with the 2kCulture community</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Track Information</CardTitle>
          <CardDescription>
            Fill in the details about your track. All fields are required for a successful upload.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Track Title</Label>
                  <Input id="title" placeholder="Enter track title" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="artist">Artist Name</Label>
                    <Input id="artist" placeholder="Your artist name" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {allGenres.map((genre) => (
                          <SelectItem key={genre.id} value={genre.id.toString()}>
                            {genre.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Tell us about your track" className="min-h-[100px]" />
                </div>

                <div className="space-y-2">
                  <Label>Cover Art</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
                    <p className="text-xs text-muted-foreground">Recommended: 1400 x 1400 pixels, JPG or PNG</p>
                    <Button type="button" variant="outline" size="sm" className="mt-2">
                      Choose File
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Audio File</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
                    <p className="text-xs text-muted-foreground">Accepted formats: MP3, AAC (max 50MB)</p>
                    <Button type="button" variant="outline" size="sm" className="mt-2">
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="text-sm">Uploading... {uploadProgress}%</div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isUploading}>
              Upload Track
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start border-t px-6 py-4">
          <h3 className="text-sm font-medium">Before you upload:</h3>
          <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2 space-y-1">
            <li>Make sure you have the rights to distribute this music</li>
            <li>Higher quality audio files provide better listening experience</li>
            <li>Custom artwork helps your music stand out</li>
          </ul>
        </CardFooter>
      </Card>
    </div>
  )
}
