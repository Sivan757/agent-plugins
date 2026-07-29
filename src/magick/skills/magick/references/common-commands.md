# Common ImageMagick Commands

Use these command templates for routine work. Adapt paths, sizes, quality, gravity, and format-specific options to the task.

## Probe And Verify

```bash
magick identify input.png
magick identify -verbose input.png
magick identify -format 'format=%m size=%wx%h channels=%[channels] colorspace=%[colorspace] depth=%z bytes=%b\n' input.png
magick -version
magick -list format
magick -list configure
```

Check for alpha:

```bash
magick identify -format '%[channels]\n' input.png
```

## Format Conversion

Single file:

```bash
magick input.jpg output.png
magick input.png -quality 85 output.webp
magick input.png -quality 45 output.avif
magick input.heic output.jpg
```

Batch to a new directory:

```bash
mkdir -p out
for f in *.jpg; do
  magick "$f" -auto-orient -strip -quality 85 "out/${f%.*}.webp"
done
```

Batch with `mogrify`:

```bash
mkdir -p out
magick mogrify -path out -format webp -quality 85 *.jpg
```

## Create A Solid-Color Image

```bash
magick -size 200x200 xc:red out.png
```

`canvas:red` is equivalent to `xc:red` in ImageMagick 7.

## Resize, Thumbnail, And Compress

Keep aspect ratio:

```bash
magick input.jpg -auto-orient -resize 1200x1200\> -strip -quality 85 output.jpg
```

Fast thumbnail:

```bash
magick input.jpg -thumbnail 400x400 output.jpg
```

WebP/AVIF:

```bash
magick input.png -resize 1600x1600\> -strip -quality 82 -define webp:method=6 output.webp
magick input.png -resize 1600x1600\> -strip -quality 45 output.avif
```

## Normalize Product Or Social Images

White square canvas:

```bash
magick input.jpg -auto-orient -resize 1000x1000\> \
  -background white -gravity center -extent 1000x1000 \
  -strip -quality 88 output.jpg
```

Transparent square canvas:

```bash
magick input.png -resize 1000x1000\> \
  -background none -gravity center -extent 1000x1000 \
  output.png
```

Trim transparent or flat border, then add padding:

```bash
magick input.png -trim +repage -background none -gravity center -bordercolor none -border 32 output.png
```

## Transparency And Backgrounds

Flatten transparency onto white:

```bash
magick input.png -background white -alpha remove -alpha off output.jpg
```

Place a transparent asset on a fixed transparent canvas:

```bash
magick input.png -resize 1000x1000\> \
  -background none -gravity center -extent 1000x1000 \
  output.png
```

## Watermark, Logo, Badges, And Text

Logo watermark:

```bash
magick base.jpg \( logo.png -resize 160x160 \) \
  -gravity southeast -geometry +32+32 -compose over -composite output.jpg
```

Semi-transparent watermark:

```bash
magick base.jpg \( logo.png -alpha set -channel A -evaluate multiply 0.35 +channel \) \
  -gravity southeast -geometry +32+32 -compose over -composite output.jpg
```

Text label:

```bash
magick base.jpg -gravity south -pointsize 42 -fill white -undercolor '#0008' \
  -annotate +0+40 'SKU 12345' output.jpg
```

## Compose Prints Or Stickers Onto Mockups

Simple overlay:

```bash
magick shirt.png \( print.png -resize 320x320 \) \
  -geometry +340+420 -compose over -composite mockup.png
```

Line art on a light garment often looks more natural with multiply:

```bash
magick shirt.png \( print.png -resize 320x320 \) \
  -geometry +340+420 -compose multiply -composite mockup.png
```

## Montage, Contact Sheets, And Comparisons

Contact sheet:

```bash
magick montage *.jpg -thumbnail 220x220 -tile 5x -geometry +12+12 contact-sheet.jpg
```

Before/after side by side:

```bash
magick +append before.png after.png comparison.png
```

Difference image and metric:

```bash
magick compare -metric RMSE before.png after.png diff.png
```

## PDF And SVG Rasterization

PDF first page preview:

```bash
magick -density 300 input.pdf[0] -background white -alpha remove -resize 1200x output.png
```

SVG preview:

```bash
magick -background none -density 300 input.svg output.png
```

If PDF/SVG fails, check delegate support and security policy before changing the command.

## Metadata

Strip profiles and metadata:

```bash
magick input.jpg -strip output.jpg
```

Keep ICC but remove other metadata:

```bash
magick input.jpg +profile '!icc,*' output.jpg
```
