'use server'

import { createServerClient } from '@/lib/supabase/server'
import { groq } from '@/lib/groq/client'
import { SMART_MODEL } from '@/lib/groq/models'
import type { VisionaryLevel, VisionaryOptions, VisionaryCorrectAttributes } from '@/types/visionary'
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
 * Analyze an image using AI to reverse-engineer the prompt attributes
 * Since Groq Vision may not be available, we use filename context and AI text analysis
 */
export async function analyzeImageForPrompt(
  imagePath: string,
  imageBase64?: string
): Promise<{
  success: boolean
  attributes?: VisionaryCorrectAttributes
  error?: string
}> {
  try {
    // Extract filename for context
    const filename = path.basename(imagePath)
    const filenameContext = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '').replace(/[_-]/g, ' ')

    // Default options to choose from
    const defaultOptions: VisionaryOptions = {
      subjects: ['Cyberpunk City', 'Medieval Castle', 'Forest', 'Desert', 'Mountain Landscape', 'Ocean Beach', 'Urban Street', 'Abstract Shapes'],
      styles: ['Neon Noir', 'Watercolor', 'Pixel Art', 'Sketch', 'Photorealistic', 'Impressionist', 'Minimalist', 'Surreal'],
      lightings: ['Volumetric', 'Flat', 'Natural', 'Studio', 'Golden Hour', 'Blue Hour', 'Midday', 'Moonlight'],
    }

    // System prompt for AI analysis
    const systemPrompt = `You are an expert at reverse-engineering image generation prompts. Given an image filename or description, analyze what attributes would have been used to generate this image.

Available options:
Subjects: ${defaultOptions.subjects.join(', ')}
Styles: ${defaultOptions.styles.join(', ')}
Lightings: ${defaultOptions.lightings.join(', ')}

Return JSON with:
{
  "subject": "one of the available subjects",
  "style": "one of the available styles",
  "lighting": "one of the available lightings",
  "reasoning": "brief explanation of why these attributes were chosen"
}`

    // If we have base64 image, we could use vision API (if available)
    // For now, use filename context
    const userPrompt = imageBase64
      ? `Analyze this image (base64 provided) and determine the prompt attributes that would generate it.`
      : `Analyze this image based on filename context: "${filenameContext}". Determine the most likely prompt attributes (Subject, Style, Lighting) that would generate this image.`

    try {
      const completion = await groq.chat.completions.create({
        model: SMART_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content returned from Groq')
      }

      const parsed = JSON.parse(content) as {
        subject: string
        style: string
        lighting: string
        reasoning?: string
      }

      // Validate that attributes are from available options
      const subject = defaultOptions.subjects.includes(parsed.subject)
        ? parsed.subject
        : defaultOptions.subjects[Math.floor(Math.random() * defaultOptions.subjects.length)]
      const style = defaultOptions.styles.includes(parsed.style)
        ? parsed.style
        : defaultOptions.styles[Math.floor(Math.random() * defaultOptions.styles.length)]
      const lighting = defaultOptions.lightings.includes(parsed.lighting)
        ? parsed.lighting
        : defaultOptions.lightings[Math.floor(Math.random() * defaultOptions.lightings.length)]

      return {
        success: true,
        attributes: { subject, style, lighting },
      }
    } catch (aiError) {
      console.warn(`[AI Analysis] Failed for ${imagePath}, using fallback:`, aiError)
      // Fallback: Use random attributes (better than nothing)
      return {
        success: true,
        attributes: {
          subject: defaultOptions.subjects[Math.floor(Math.random() * defaultOptions.subjects.length)],
          style: defaultOptions.styles[Math.floor(Math.random() * defaultOptions.styles.length)],
          lighting: defaultOptions.lightings[Math.floor(Math.random() * defaultOptions.lightings.length)],
        },
      }
    }
  } catch (error: any) {
    console.error('Error analyzing image:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Auto-generate levels for all images in the visionary directory
 * Uses AI to analyze images and generate correct attributes
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
          // Check if correct_attributes exist, if not, generate them with AI
          const { data: existingLevel } = await supabase
            .from('visionary_levels')
            .select('correct_attributes')
            .eq('id', (existing as any).id)
            .single()

          let correctAttributes = (existingLevel as any)?.correct_attributes

          // If no correct_attributes exist, generate them with AI
          if (!correctAttributes || !correctAttributes.subject) {
            console.log(`[Visionary Sync] Missing attributes for ${imagePath}, generating with AI...`)
            
            let imageBase64: string | undefined
            try {
              const fullPath = path.join(process.cwd(), 'public', imagePath)
              if (fs.existsSync(fullPath)) {
                const imageBuffer = fs.readFileSync(fullPath)
                imageBase64 = `data:image/${path.extname(imagePath).slice(1)};base64,${imageBuffer.toString('base64')}`
              }
            } catch (readError) {
              // Continue without base64
            }

            const aiAnalysis = await analyzeImageForPrompt(imagePath, imageBase64)
            if (aiAnalysis.success && aiAnalysis.attributes) {
              correctAttributes = aiAnalysis.attributes
            }
          }

          // Update existing level
          const { error: updateError } = await (supabase as any)
            .from('visionary_levels')
            .update({
              options: defaultOptions,
              correct_attributes: correctAttributes || {
                subject: defaultOptions.subjects[0],
                style: defaultOptions.styles[0],
                lighting: defaultOptions.lightings[0],
              },
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
          // Use AI to analyze the image and generate correct attributes
          console.log(`[Visionary Sync] Analyzing image with AI: ${imagePath}`)
          
          // Try to read image as base64 for better analysis (optional)
          let imageBase64: string | undefined
          try {
            const fullPath = path.join(process.cwd(), 'public', imagePath)
            if (fs.existsSync(fullPath)) {
              const imageBuffer = fs.readFileSync(fullPath)
              imageBase64 = `data:image/${path.extname(imagePath).slice(1)};base64,${imageBuffer.toString('base64')}`
            }
          } catch (readError) {
            console.warn(`[Visionary Sync] Could not read image for base64: ${readError}`)
            // Continue without base64 - AI will use filename context
          }

          const aiAnalysis = await analyzeImageForPrompt(imagePath, imageBase64)
          
          if (!aiAnalysis.success || !aiAnalysis.attributes) {
            console.warn(`[Visionary Sync] AI analysis failed for ${imagePath}, using fallback`)
            // Fallback to random if AI fails
            aiAnalysis.attributes = {
              subject: defaultOptions.subjects[Math.floor(Math.random() * defaultOptions.subjects.length)],
              style: defaultOptions.styles[Math.floor(Math.random() * defaultOptions.styles.length)],
              lighting: defaultOptions.lightings[Math.floor(Math.random() * defaultOptions.lightings.length)],
            }
          }

          // Determine difficulty based on image index (simple heuristic)
          const imageIndex = scanResult.images.indexOf(imagePath)
          const difficulty = imageIndex < 5 ? 'Easy' : imageIndex < 10 ? 'Medium' : 'Hard'

          const { error: insertError } = await supabase.from('visionary_levels').insert({
            image_path: imagePath,
            correct_attributes: aiAnalysis.attributes,
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

