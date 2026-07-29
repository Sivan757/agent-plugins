---
name: ffmpeg
description: Generate, execute, and verify FFmpeg and ffprobe commands for video, audio, and image media processing. Use when the user needs to compress, transcode, trim, crop, scale, extract frames, create thumbnails, watermark, concatenate, create HLS, remove or extract audio, convert formats, denoise, normalize loudness, merge media, compose complex layouts, animate overlays, or view/edit metadata for video, audio, image, WebP, GIF, or APNG files.
---

# FFmpeg

Use this skill to build practical FFmpeg/ffprobe workflows for media files. Prefer small, verified command sequences over one fragile mega-command when the task has multiple stages.

Official docs:

- FFmpeg CLI: https://ffmpeg.org/ffmpeg.html
- ffprobe: https://ffmpeg.org/ffprobe.html
- Filters: https://ffmpeg.org/ffmpeg-filters.html
- Formats/demuxers/muxers: https://ffmpeg.org/ffmpeg-formats.html
- Codecs: https://ffmpeg.org/ffmpeg-codecs.html
- Bitstream filters: https://ffmpeg.org/ffmpeg-bitstream-filters.html

If a video or audio task is not covered in this skill, check the official docs and consider whether the goal can be reached by rearranging input options, output options, stream mapping, filters, and multiple FFmpeg passes. Command order matters.

## Route By Domain

Load only the reference needed for the current task:

- Video processing: see [references/video.md](references/video.md) for compression, transcoding, trimming, cropping, scaling, frame extraction, cover generation, watermarking, concatenation, HLS, removing audio, extracting audio, and metadata.
- Audio processing: see [references/audio.md](references/audio.md) for extracting audio from video, format conversion, denoising, loudness normalization, trimming, merging, transcoding, mixing, and metadata.
- Image processing: see [references/image.md](references/image.md) for video frame extraction, image sequences, compression, scaling, cropping, format conversion, thumbnails, WebP/GIF/APNG, and metadata.

## Standard Workflow

1. Probe inputs first:

```bash
ffprobe -hide_banner -show_format -show_streams -print_format json input.mp4
```

2. Decide whether to stream-copy or transcode:

- Use `-c copy` or `-c:a copy` when changing containers, extracting streams, or trimming approximately without changing media content.
- Transcode when applying filters, changing codec, changing dimensions, changing sample rate, normalizing audio, burning subtitles, or requiring platform compatibility.

3. Map streams intentionally:

- Use `-map 0:v:0 -map 0:a?` for first video plus optional audio.
- Use `-vn` to drop video, `-an` to drop audio, `-sn` to drop subtitles.
- Use `-map 0` when preserving all streams, then override unwanted streams explicitly.

4. Place options correctly:

- Put input options before the related `-i`.
- Put output options after all inputs and before the output path.
- Put filtergraphs before codec/output options that depend on the filtered streams.

5. Verify outputs:

```bash
test -s output.mp4
ffprobe -hide_banner -show_format -show_streams -print_format json output.mp4
```

Check duration, stream count, codec, resolution, frame rate, sample rate, channel layout, metadata, and expected file size.

## Complex Composition Workflow

For complex commercial, social, or editorial requests, treat the problem as complex task decomposition plus tool orchestration. Do not start by asking "what is the one FFmpeg command?" Start with an Issue Tree / MECE breakdown, then turn it into a media pipeline DAG.

Use this reasoning frame:

1. Define the output: final resolution, duration, container, codec, visual layout, audio policy, and delivery constraints.
2. Inventory inputs: files, streams, sizes, frame rates, durations, alpha channels, subtitles, fonts, images, and metadata.
3. Normalize inputs: convert to consistent frame rate, pixel format, dimensions, sample rate, channel layout, and time base when needed.
4. Build the timeline: start times, durations, offsets, enable windows, loops, delays, fades, and ordering.
5. Build the spatial layout: canvas, regions, scaling rules, overlays, masks, captions, subtitles, and motion expressions.
6. Build the audio plan: selected track, extraction, mixing, ducking, fades, loudness normalization, and final codec.
7. Split into verifiable passes: probe -> normalize -> compose partials -> compose final -> encode -> verify.
8. Choose tools: keep FFmpeg for deterministic filtergraph work; switch tools when the work needs interactive keyframes, visual micro-adjustment, complex masks, particles, or client-directed design iteration.

Example user intent:

```text
Create one composite video:
- left side plays music lyrics
- right side has 3 videos
- the 3 right-side videos start outside the visible area
- each right-side video scrolls upward over time and plays in sequence
```

MECE breakdown:

```text
1. Canvas
   - output resolution, for example 1920x1080
   - left/right regions, for example left 720px and right 1200px

2. Input normalization
   - four video inputs
   - normalize resolution, frame rate, duration, pixel format, and time base

3. Left region
   - lyrics video, or audio plus subtitles/drawtext/ASS
   - scale to the left region and anchor at x=0,y=0

4. Right region
   - three videos
   - each has size, start time, duration, scroll speed, and overlay position

5. Audio
   - pick lyric/music audio or mix multiple sources
   - add fades or loudness normalization if required

6. Output
   - MP4, H.264, AAC, yuv420p, web-compatible fast start
```

Translate natural language into filtergraph logic:

```text
"Starts outside the frame and scrolls upward"
=> overlay.y = bottom_outside_position - (t - start_time) * speed
=> enable = between(t, start_time, end_time)

For the second right-side video starting at 5 seconds:
=> y = 1080 - (t - 5) * 220
=> enable = between(t, 5, 13)
```

Skeleton command:

```bash
ffmpeg -hide_banner \
  -i lyrics.mp4 \
  -i v1.mp4 \
  -i v2.mp4 \
  -i v3.mp4 \
  -filter_complex "
    color=c=black:s=1920x1080:r=30:d=30[base];
    [0:v]scale=720:1080,setpts=PTS-STARTPTS[left];
    [1:v]scale=1200:-2,setpts=PTS-STARTPTS[v1];
    [2:v]scale=1200:-2,setpts=PTS-STARTPTS[v2];
    [3:v]scale=1200:-2,setpts=PTS-STARTPTS[v3];
    [base][left]overlay=x=0:y=0[tmp0];
    [tmp0][v1]overlay=x=720:y='1080-(t-0)*220':enable='between(t,0,8)'[tmp1];
    [tmp1][v2]overlay=x=720:y='1080-(t-5)*220':enable='between(t,5,13)'[tmp2];
    [tmp2][v3]overlay=x=720:y='1080-(t-10)*220':enable='between(t,10,18)'[vout]
  " \
  -map "[vout]" \
  -map 0:a? \
  -c:v libx264 -crf 20 -preset medium \
  -c:a aac -b:a 192k \
  -pix_fmt yuv420p \
  -movflags +faststart \
  output.mp4
```

Treat this as a starting graph, not a final answer. For real work, probe every input, verify filter availability, test short clips first, and iterate on motion expressions with small output segments.

## Boundary Rules

Continue with FFmpeg when:

- Rules are explicit and can be represented by filters, stream mapping, or mathematical expressions.
- The result can be verified by ffprobe, visual spot checks, or short rendered segments.
- The workflow is batch-oriented or needs reproducible commands.

Read the official docs when:

- A filter expression, filtergraph label, stream mapping, concat, xfade, overlay, subtitles, or drawtext behavior is unclear.
- The error comes from filtergraph parsing or option placement.
- A format, codec, muxer, or bitstream filter has format-specific behavior.

Use another tool when:

- The work needs complex manual keyframes, masks, particles, bezier easing, visual design iteration, or frequent client review.
- The command becomes too large to understand, test, and maintain.

Ask for external help when:

- The issue depends on FFmpeg build flags, platform codec support, or filter availability.
- Official docs and minimal reproductions still do not explain the error.
- You can provide input specs, full command, full stderr, FFmpeg version, and minimal sample files.

## Safety Notes

- Do not overwrite originals unless the user explicitly asks. Write to a new path or use a temporary output first.
- Quote paths that contain spaces.
- Prefer `-map` over FFmpeg's implicit stream selection for repeatable results.
- Preserve rotation/display metadata when stream-copying; verify actual display orientation after transcode.
- Avoid `-y` unless overwriting is intentional.
- Use two-pass or constrained bitrate only when the requirement is target file size or streaming ladder control; otherwise prefer CRF/quality-based encoding.
