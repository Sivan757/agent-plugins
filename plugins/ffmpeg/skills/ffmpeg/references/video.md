# Video Processing

Use these recipes for video tasks. Probe before choosing a command and verify the output afterward.

Compress for web-compatible MP4:

```bash
ffmpeg -hide_banner -i input.mp4 -map 0:v:0 -map 0:a? -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart output.mp4
```

Transcode video codec while preserving optional audio:

```bash
ffmpeg -hide_banner -i input.mov -map 0:v:0 -map 0:a? -c:v libx265 -crf 28 -preset medium -c:a copy output.mp4
```

Remux without re-encoding:

```bash
ffmpeg -hide_banner -i input.mkv -map 0 -c copy output.mp4
```

Trim or clip:

```bash
ffmpeg -hide_banner -ss 00:00:10 -to 00:00:30 -i input.mp4 -map 0 -c copy clip.mp4
ffmpeg -hide_banner -i input.mp4 -ss 00:00:10 -to 00:00:30 -map 0:v:0 -map 0:a? -c:v libx264 -c:a aac precise-clip.mp4
```

Scale and preserve aspect ratio:

```bash
ffmpeg -hide_banner -i input.mp4 -vf "scale=1280:-2" -c:v libx264 -crf 23 -c:a copy output.mp4
```

Crop:

```bash
ffmpeg -hide_banner -i input.mp4 -vf "crop=1080:1080:420:0" -c:v libx264 -crf 23 -c:a copy output.mp4
```

Extract frames:

```bash
mkdir -p frames
ffmpeg -hide_banner -i input.mp4 -vf "fps=1" frames/frame-%04d.jpg
```

Generate a cover image:

```bash
ffmpeg -hide_banner -ss 00:00:03 -i input.mp4 -frames:v 1 -update 1 -q:v 2 cover.jpg
```

`-update 1` suppresses the image2 muxer "does not contain an image sequence pattern" warning for single-frame outputs. The `-ss` seek time MUST be less than the input's duration (probe with `ffprobe` first) - the `00:00:03` above assumes a clip longer than 3s; for shorter clips, seek to e.g. the midpoint (`-ss <duration/2>`).

Generate a synthetic test video:

```bash
ffmpeg -f lavfi -i testsrc=duration=2:size=1280x720:rate=30 -c:v libx264 -pix_fmt yuv420p out.mp4
```

`testsrc`, `color`, and `smptebars` are useful lavfi sources for testing without source footage.

Add watermark:

```bash
ffmpeg -hide_banner -i input.mp4 -i watermark.png -filter_complex "overlay=W-w-24:H-h-24" -c:v libx264 -crf 23 -c:a copy output.mp4
```

Concatenate matching files with the concat demuxer:

```bash
printf "file '%s'\n" part1.mp4 part2.mp4 > concat.txt
ffmpeg -hide_banner -f concat -safe 0 -i concat.txt -c copy merged.mp4
```

Concatenate mismatched files by re-encoding:

```bash
ffmpeg -hide_banner -i part1.mp4 -i part2.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -c:a aac merged.mp4
```

Create HLS VOD:

```bash
mkdir -p hls
ffmpeg -hide_banner -i input.mp4 -map 0:v:0 -map 0:a? -c:v libx264 -crf 23 -c:a aac -hls_time 6 -hls_playlist_type vod -hls_segment_filename "hls/segment-%03d.ts" hls/index.m3u8
```

Remove audio:

```bash
ffmpeg -hide_banner -i input.mp4 -map 0:v:0 -c:v copy -an silent.mp4
```

Extract audio from video:

```bash
ffmpeg -hide_banner -i input.mp4 -vn -c:a copy audio.m4a
ffmpeg -hide_banner -i input.mp4 -vn -c:a libmp3lame -b:a 192k audio.mp3
```

View or edit metadata:

```bash
ffprobe -hide_banner -show_format -show_streams input.mp4
ffmpeg -hide_banner -i input.mp4 -map 0 -c copy -metadata title="New title" output.mp4
ffmpeg -hide_banner -i input.mp4 -map 0 -c copy -map_metadata -1 clean.mp4
```
