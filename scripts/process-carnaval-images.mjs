import { mkdir, readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'

const projectRoot = path.resolve(import.meta.dirname, '..')
const defaults = {
  source: path.join(projectRoot, 'assets', 'carnaval-originals'),
  output: path.join(projectRoot, 'public', 'images', 'carnaval'),
  quality: 82,
  files: [],
}

const presets = [
  { suffix: 'hero-mobile', width: 768, height: 1024 },
  { suffix: 'hero-tablet', width: 1280, height: 720 },
  { suffix: 'hero-desktop', width: 1920, height: 1080 },
  { suffix: 'card', width: 1600, height: 1200 },
  { suffix: 'chapter', width: 1800, height: 1200 },
]

const heroSourceNames = new Set([
  'sambodromo_hero.png',
  'frevo_hero.png',
  'carnaval_minas_hero.png',
  'camarote_premium_hero.png',
])

const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.avif'])
const supportedPositions = new Set([
  'attention',
  'entropy',
  'center',
  'centre',
  'north',
  'northeast',
  'east',
  'southeast',
  'south',
  'southwest',
  'west',
  'northwest',
])

function printHelp() {
  console.log(`Process Carnaval Collection source images into responsive WebP variants.

Usage:
  npm run images:carnaval
  npm run images:carnaval -- --source <directory> --output <directory> --quality <1-100>
  npm run images:carnaval -- --files image-one.jpg,image-two.jpg

Defaults:
  source   assets/carnaval-originals
  output   public/images/carnaval
  quality  82

The source files are never changed or deleted.`)
}

function readArguments(args) {
  const options = { ...defaults }

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]

    if (argument === '--help' || argument === '-h') {
      printHelp()
      process.exit(0)
    }

    if (!['--source', '--output', '--quality', '--files'].includes(argument)) {
      throw new Error(`Unknown argument: ${argument}`)
    }

    const value = args[index + 1]
    if (!value) throw new Error(`Missing value for ${argument}`)
    index += 1

    if (argument === '--source') options.source = path.resolve(value)
    if (argument === '--output') options.output = path.resolve(value)
    if (argument === '--quality') options.quality = Number(value)
    if (argument === '--files') options.files = value.split(',').map((item) => item.trim()).filter(Boolean)
  }

  if (!Number.isInteger(options.quality) || options.quality < 1 || options.quality > 100) {
    throw new Error('--quality must be an integer between 1 and 100')
  }

  if (options.source === options.output) {
    throw new Error('Source and output directories must be different')
  }

  return options
}

function toSlug(filename) {
  return path
    .parse(filename)
    .name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function readFocalPoints(sourceDirectory) {
  const focalPointPath = path.join(sourceDirectory, 'focal-points.json')

  try {
    return JSON.parse(await readFile(focalPointPath, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return {}
    throw new Error(`Could not read ${focalPointPath}: ${error.message}`)
  }
}

function resolvePosition(slug, focalPoints) {
  const requestedPosition = focalPoints[slug] || 'attention'

  if (!supportedPositions.has(requestedPosition)) {
    console.warn(`  Warning: unsupported focal position "${requestedPosition}" for ${slug}; using attention.`)
    return 'attention'
  }

  return requestedPosition
}

async function processImage({ sourcePath, filename, slug, position, outputDirectory, quality }) {
  const metadata = await sharp(sourcePath, { failOn: 'warning' }).metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not determine dimensions for ${filename}`)
  }

  console.log(`\n${filename} (${metadata.width}×${metadata.height}, focus: ${position})`)

  const selectedPresets = heroSourceNames.has(filename)
    ? presets.filter((preset) => preset.suffix.startsWith('hero-'))
    : presets.filter((preset) => preset.suffix !== 'hero-tablet')

  for (const preset of selectedPresets) {
    const outputName = `${slug}--${preset.suffix}.webp`
    const outputPath = path.join(outputDirectory, outputName)

    await sharp(sourcePath, { failOn: 'warning' })
      .rotate()
      .resize(preset.width, preset.height, {
        fit: 'cover',
        position,
        background: { r: 0, g: 39, b: 30, alpha: 1 },
        // Keep supplied source imagery at its native resolution when it is smaller
        // than a preset. Responsive variants should optimise, never invent detail.
        withoutEnlargement: true,
      })
      .linear(1.02, -1)
      .modulate({ saturation: 1.025 })
      .sharpen({ sigma: 0.55, m1: 0.35, m2: 1.2 })
      .webp({ quality, effort: 5, smartSubsample: true })
      .toFile(outputPath)

    const outputStats = await stat(outputPath)
    const outputMetadata = await sharp(outputPath).metadata()
    console.log(`  ${outputName}  ${outputMetadata.width}x${outputMetadata.height}  ${(outputStats.size / 1024).toFixed(1)} KiB`)
  }
}

async function main() {
  const options = readArguments(process.argv.slice(2))
  const sourceDirectory = path.resolve(options.source)
  const outputDirectory = path.resolve(options.output)

  await mkdir(sourceDirectory, { recursive: true })
  await mkdir(outputDirectory, { recursive: true })

  const entries = await readdir(sourceDirectory, { withFileTypes: true })
  let imageFiles = entries
    .filter((entry) => entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((first, second) => first.localeCompare(second))

  if (options.files.length) {
    const requested = new Set(options.files)
    imageFiles = imageFiles.filter((filename) => requested.has(filename))
    const missing = options.files.filter((filename) => !imageFiles.includes(filename))
    if (missing.length) throw new Error(`Requested source image(s) not found: ${missing.join(', ')}`)
  }

  if (!imageFiles.length) {
    console.log(`No source images found in ${sourceDirectory}`)
    console.log('Add JPG, JPEG, PNG, WebP, TIFF or AVIF files and run the command again.')
    return
  }

  const slugOwners = new Map()
  for (const filename of imageFiles) {
    const slug = toSlug(filename)
    if (!slug) throw new Error(`Could not create a safe output name for ${filename}`)
    if (slugOwners.has(slug)) {
      throw new Error(`Duplicate output slug "${slug}" from ${slugOwners.get(slug)} and ${filename}`)
    }
    slugOwners.set(slug, filename)
  }

  const focalPoints = await readFocalPoints(sourceDirectory)
  console.log(`Processing ${imageFiles.length} image(s) at WebP quality ${options.quality}.`)
  console.log(`Source: ${sourceDirectory}`)
  console.log(`Output: ${outputDirectory}`)

  for (const filename of imageFiles) {
    const slug = toSlug(filename)
    await processImage({
      sourcePath: path.join(sourceDirectory, filename),
      filename,
      slug,
      position: resolvePosition(slug, focalPoints),
      outputDirectory,
      quality: options.quality,
    })
  }

  const generatedCount = imageFiles.reduce((total, filename) => total + (heroSourceNames.has(filename) ? 3 : 4), 0)
  console.log(`\nDone. Generated ${generatedCount} optimized image(s).`)
  console.log('Original files were not modified.')
}

main().catch((error) => {
  console.error(`Carnaval image processing failed: ${error.message}`)
  process.exitCode = 1
})
