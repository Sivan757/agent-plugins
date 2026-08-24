import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "ffmpeg",
  version: "0.1.0",
  description: "Generate, execute, and verify FFmpeg and ffprobe commands for video, audio, and image media processing. Use when the user needs to compress, transcode, trim, crop, scale, extract frames, create thumbnails, watermark, concatenate, create HLS, remove or extract audio, convert formats, denoise, normalize loudness, merge media, compose complex layouts, animate overlays, or view/edit metadata for video, audio, image, WebP, GIF, or APNG files.",
  author: { name: "Agent Plugins" },
  category: "Coding",
  interface: {
    displayName: "ffmpeg",
    shortDescription: "Generate, execute, and verify FFmpeg and ffprobe commands for video, audio, and image media processing. Use when the user needs to compress, transcode, trim, crop, scale, extract frames, create thumbnails, watermark, concatenate, create HLS, remove or extract audio, convert formats, denoise, normalize loudness, merge media, compose complex layouts, animate overlays, or view/edit metadata for video, audio, image, WebP, GIF, or APNG files.",
    longDescription: "Generate, execute, and verify FFmpeg and ffprobe commands for video, audio, and image media processing. Use when the user needs to compress, transcode, trim, crop, scale, extract frames, create thumbnails, watermark, concatenate, create HLS, remove or extract audio, convert formats, denoise, normalize loudness, merge media, compose complex layouts, animate overlays, or view/edit metadata for video, audio, image, WebP, GIF, or APNG files.",
    developerName: "Agent Plugins",
    category: "Coding",
  },
  surfaces: {
    skills: true,
  },
  marketplace: {
    claude: {
      description: "Generate, execute, and verify FFmpeg and ffprobe commands for video, audio, and image media processing. Use when the user needs to compress, transcode, trim, crop, scale, extract frames, create thumbnails, watermark, concatenate, create HLS, remove or extract audio, convert formats, denoise, normalize loudness, merge media, compose complex layouts, animate overlays, or view/edit metadata for video, audio, image, WebP, GIF, or APNG files.",
    },
  },
} satisfies PluginConfig;
