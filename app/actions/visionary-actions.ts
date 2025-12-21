'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { VisionaryLevel, VisionaryOptions } from '@/types/visionary'
import fs from 'fs'
import path from 'path'

/**
 * Scan the visionary images directory and return available images
 */
export async function scanVisionaryImages(): Promise<{ success: boolean; images: string[]; error?: string }> {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'assets', 'visionary')
    
    // Check if directory exists
    if (!fs.existsSync(imagesDir)) {
      return { success: false, images: [], error: 'Visionary images directory does not exist' }
    }

    // Read directory contents
    const files = fs.readdirSync(imagesDir)
    
    // Filter for image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    const images = files
      .filter((file) => imageExtensions.some((ext) => file.toLowerCase().endsWith(ext)))
      .map((file) => `/assets/visionary/${file}`)
      .sort() // Sort alphabetically for consistency

    return { success: true, images }
  } catch (error) {
    console.error('Error scanning visionary images:', error)
    return { success: false, images: [], error: 'Failed to scan images directory' }
  }
}

/**
 * Auto-generate levels for all images in the visionary directory
 * This creates levels with default options if they don't exist
 */
export async function autoGenerateVisionaryLevels(): Promise<{
  success: boolean
  created: number
  updated: number
  error?: string
}> {
  try {
    const supabase = await createServerClient()
    
    // Check if user is authenticated (optional - allows sync even without login for development)
    // In production, you might want to require authentication
    const { data: { user } } = await supabase.auth.getUser()
    
    // If not authenticated, still allow sync (for development/testing)
    // But log a warning
    if (!user) {
      console.warn('[Visionary Sync] Running without authentication - this is allowed for development')
    }
    
    // Scan for images
    const scanResult = await scanVisionaryImages()
    if (!scanResult.success || scanResult.images.length === 0) {
      const imagesDir = path.join(process.cwd(), 'public', 'assets', 'visionary')
      return { success: false, created: 0, updated: 0, error: `No images found. Checked directory: ${imagesDir}` }
    }

    // Default options for all levels
    const defaultOptions: VisionaryOptions = {
      subjects: ['Cyberpunk City', 'Medieval Castle', 'Forest', 'Desert', 'Mountain Landscape', 'Ocean Beach', 'Urban Street', 'Abstract Shapes'],
      styles: ['Neon Noir', 'Watercolor', 'Pixel Art', 'Sketch', 'Photorealistic', 'Impressionist', 'Minimalist', 'Surreal'],
      lightings: ['Volumetric', 'Flat', 'Natural', 'Studio', 'Golden Hour', 'Blue Hour', 'Midday', 'Moonlight'],
    }

    let created = 0
    let updated = 0
    const errors: string[] = []

    console.log(`[Visionary Sync] Found ${scanResult.images.length} images to process`)

    // Process each image
    for (const imagePath of scanResult.images) {
      try {
        // Check if level already exists (use maybeSingle to avoid error if not found)
        const { data: existing, error: checkError } = await supabase
          .from('visionary_levels')
          .select('id')
          .eq('image_path', imagePath)
          .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 is "not found" which is expected, ignore it
          console.error(`[Visionary Sync] Error checking for ${imagePath}:`, checkError)
          errors.push(`Check error for ${imagePath}: ${checkError.message}`)
          continue
        }

        if (existing && (existing as any).id) {
          // Update existing level (keep correct_attributes if they exist)
          const { error: updateError } = await (supabase as any)
            .from('visionary_levels')
            .update({
              options: defaultOptions,
              updated_at: new Date().toISOString(),
            })
            .eq('id', (existing as any).id)

          if (updateError) {
            console.error(`[Visionary Sync] Error updating ${imagePath}:`, updateError)
            errors.push(`Update error for ${imagePath}: ${updateError.message}`)
          } else {
            updated++
            console.log(`[Visionary Sync] Updated level for ${imagePath}`)
          }
        } else {
          // Create new level with random correct attributes (for demo)
          // In production, these should be manually set or AI-generated
          const randomSubject = defaultOptions.subjects[Math.floor(Math.random() * defaultOptions.subjects.length)]
          const randomStyle = defaultOptions.styles[Math.floor(Math.random() * defaultOptions.styles.length)]
          const randomLighting = defaultOptions.lightings[Math.floor(Math.random() * defaultOptions.lightings.length)]

          // Determine difficulty based on image index (simple heuristic)
          const imageIndex = scanResult.images.indexOf(imagePath)
          const difficulty = imageIndex < 5 ? 'Easy' : imageIndex < 10 ? 'Medium' : 'Hard'

          const { error: insertError } = await supabase.from('visionary_levels').insert({
            image_path: imagePath,
            correct_attributes: {
              subject: randomSubject,
              style: randomStyle,
              lighting: randomLighting,
            },
            options: defaultOptions,
            difficulty,
          } as any)

          if (insertError) {
            console.error(`[Visionary Sync] Error inserting ${imagePath}:`, insertError)
            errors.push(`Insert error for ${imagePath}: ${insertError.message}`)
          } else {
            created++
            console.log(`[Visionary Sync] Created level for ${imagePath}`)
          }
        }
      } catch (error: any) {
        console.error(`[Visionary Sync] Unexpected error for ${imagePath}:`, error)
        errors.push(`Unexpected error for ${imagePath}: ${error.message}`)
      }
    }

    if (errors.length > 0) {
      console.warn(`[Visionary Sync] Completed with ${errors.length} errors:`, errors)
    }

    return { 
      success: true, 
      created, 
      updated,
      ...(errors.length > 0 ? { error: `Completed with ${errors.length} errors. Check console for details.` } : {})
    }
  } catch (error: any) {
    console.error('Error auto-generating levels:', error)
    return { success: false, created: 0, updated: 0, error: `Failed to generate levels: ${error.message}` }
  }
}

/**
 * Get all available images (for admin/management purposes)
 */
export async function getAvailableVisionaryImages(): Promise<{
  success: boolean
  images: string[]
  levels: Array<{ image_path: string; id: string; difficulty: string }>
  error?: string
}> {
  try {
    const supabase = await createServerClient()
    
    // Scan for images
    const scanResult = await scanVisionaryImages()
    if (!scanResult.success) {
      return { success: false, images: [], levels: [], error: scanResult.error }
    }

    // Get existing levels
    const { data: levels } = await supabase
      .from('visionary_levels')
      .select('id, image_path, difficulty')

    return {
      success: true,
      images: scanResult.images,
      levels: (levels || []) as Array<{ image_path: string; id: string; difficulty: string }>,
    }
  } catch (error) {
    console.error('Error getting available images:', error)
    return { success: false, images: [], levels: [], error: 'Failed to get images' }
  }
}

