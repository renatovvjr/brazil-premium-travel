# Carnaval Collection source images

Place approved, full-resolution Carnaval Collection photographs in this directory.

The processing script reads these files but never modifies or deletes them. Supported formats are JPG, JPEG, PNG, WebP, TIFF and AVIF.

## Naming

Use a short descriptive name for each original, for example:

- `grand-carnaval-rio.jpg`
- `rio-bahia-salvador.jpg`
- `rio-minas-ouro-preto.tif`

The filename becomes the output prefix. Accents, spaces and punctuation are normalized to lowercase hyphenated names.

Do not add variant suffixes such as `hero` or `card`; the script creates those automatically.

## Processing

From the project root, run:

```bash
npm run images:carnaval
```

Each original generates four files in `public/images/carnaval/`:

| Variant | Dimensions | Output name |
| --- | ---: | --- |
| Desktop hero | 2560×1440 | `<name>--hero-desktop.webp` |
| Mobile hero | 1200×1600 | `<name>--hero-mobile.webp` |
| Package card | 1600×1200 | `<name>--card.webp` |
| Editorial chapter | 1800×1200 | `<name>--chapter.webp` |

WebP quality defaults to 82. To use another quality between 1 and 100:

```bash
npm run images:carnaval -- --quality 85
```

## Framing

Images are auto-oriented from EXIF metadata and resized with `cover`, so they are never stretched. The default crop uses Sharp's attention strategy.

To override the crop direction for an original, add its normalized filename to `focal-points.json`. Supported values are `attention`, `entropy`, `center`, `north`, `northeast`, `east`, `southeast`, `south`, `southwest`, `west` and `northwest`.

Example:

```json
{
  "grand-carnaval-rio": "north",
  "rio-bahia-salvador": "attention"
}
```

Always review all four generated crops before connecting them to a page.
