# Image Processing

Use these recipes for image and image-sequence tasks. Probe before choosing a command and verify the output afterward.

Extract images from video:

```bash
mkdir -p frames
ffmpeg -hide_banner -i input.mp4 -vf "fps=2" frames/frame-%04d.png
```

Create video from image sequence:

```bash
ffmpeg -hide_banner -framerate 30 -i frames/frame-%04d.png -c:v libx264 -pix_fmt yuv420p output.mp4
```

Compress or convert image:

```bash
ffmpeg -hide_banner -i input.png -q:v 3 output.jpg
ffmpeg -hide_banner -i input.png -c:v libwebp -quality 82 output.webp
```

Scale:

```bash
ffmpeg -hide_banner -i input.jpg -vf "scale=1200:-2" output.jpg
```

Crop:

```bash
ffmpeg -hide_banner -i input.jpg -vf "crop=800:800:100:0" output.jpg
```

Generate thumbnail from video:

```bash
ffmpeg -hide_banner -ss 00:00:03 -i input.mp4 -frames:v 1 -vf "scale=640:-2" thumbnail.jpg
```

Create optimized GIF with palette:

```bash
ffmpeg -hide_banner -i input.mp4 -vf "fps=12,scale=480:-1:flags=lanczos,palettegen" palette.png
ffmpeg -hide_banner -i input.mp4 -i palette.png -lavfi "fps=12,scale=480:-1:flags=lanczos[x];[x][1:v]paletteuse" output.gif
```

Create animated WebP:

```bash
ffmpeg -hide_banner -i input.mp4 -vf "fps=12,scale=480:-2" -c:v libwebp -quality 80 -loop 0 output.webp
```

Create APNG:

```bash
ffmpeg -hide_banner -i input.mp4 -vf "fps=12,scale=480:-2" -plays 0 output.apng
```

View or edit image metadata:

```bash
ffprobe -hide_banner -show_format -show_streams input.jpg
ffmpeg -hide_banner -i input.jpg -metadata title="Image title" output.jpg
ffmpeg -hide_banner -i input.jpg -map_metadata -1 clean.jpg
```

For detailed EXIF, IPTC, or XMP preservation and editing, verify format support carefully. FFmpeg metadata support varies by image format.
