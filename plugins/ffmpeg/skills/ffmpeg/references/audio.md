# Audio Processing

Use these recipes for audio tasks. Probe before choosing a command and verify the output afterward.

Extract audio from video:

```bash
ffmpeg -hide_banner -i input.mp4 -vn -c:a copy audio.m4a
```

Convert format:

```bash
ffmpeg -hide_banner -i input.wav -c:a libmp3lame -b:a 192k output.mp3
ffmpeg -hide_banner -i input.mp3 -c:a flac output.flac
```

Denoise:

```bash
ffmpeg -hide_banner -i input.wav -af "afftdn" output.wav
```

Normalize loudness:

```bash
ffmpeg -hide_banner -i input.wav -af "loudnorm=I=-16:LRA=11:TP=-1.5" output.wav
```

Trim:

```bash
ffmpeg -hide_banner -ss 00:00:05 -to 00:00:20 -i input.wav output.wav
```

Concatenate matching audio files:

```bash
printf "file '%s'\n" a.wav b.wav > concat.txt
ffmpeg -hide_banner -f concat -safe 0 -i concat.txt -c copy merged.wav
```

Mix multiple tracks:

```bash
ffmpeg -hide_banner -i voice.wav -i music.wav -filter_complex "[0:a][1:a]amix=inputs=2:duration=longest:normalize=0" mixed.wav
```

Transcode sample rate and channels:

```bash
ffmpeg -hide_banner -i input.wav -ar 48000 -ac 2 -c:a aac -b:a 160k output.m4a
```

View or edit metadata:

```bash
ffprobe -hide_banner -show_format -show_streams input.mp3
ffmpeg -hide_banner -i input.mp3 -c copy -metadata artist="Artist" -metadata title="Track title" output.mp3
ffmpeg -hide_banner -i input.mp3 -c copy -map_metadata -1 clean.mp3
```
