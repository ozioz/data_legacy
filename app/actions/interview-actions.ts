'use server'

import { groq } from '@/lib/groq/client'
import { SMART_MODEL } from '@/lib/groq/models'
import { createServerClient } from '@/lib/supabase/server'
import { getCachedResponse, cacheResponse } from '@/lib/interview/cache'
import type { AIInterviewSessionUpdate, TranscriptMessage } from '@/types/supabase'

export interface InterviewerResponse {
  question: string
  feedback?: string
  isComplete?: boolean
}

// Import InterviewFeedback from types/supabase.ts to match database schema
import type { InterviewFeedback } from '@/types/supabase'

/**
 * Generate interviewer response based on conversation history
 * Acts as a tough but fair tech interviewer
 */
export async function generateInterviewerResponse(
  history: TranscriptMessage[],
  role: string,
  level: 'junior' | 'mid' | 'senior' | 'lead' | 'architect',
  language: 'tr' | 'en' | 'es' | 'fr' | 'de' = 'tr',
  emotionalContext?: string // Optional emotional state from video analysis
): Promise<InterviewerResponse> {
  try {
    // Limit history to last 6 messages to reduce token usage
    const limitedHistory = history.slice(-6)
    
    // Check cache first (only for non-first questions)
    if (limitedHistory.length > 1) {
      const cached = getCachedResponse(limitedHistory, role, level)
      if (cached) {
        console.log('Using cached response')
        try {
          const cachedResponse = JSON.parse(cached) as InterviewerResponse
          return cachedResponse
        } catch {
          // If cache is invalid JSON, continue to API call
        }
      }
    }
    
    // Build conversation context (only include last 6 messages)
    // Format: "Candidate: x, Interviewer: y" for clarity
    const conversationContext = limitedHistory
      .map((msg) => {
        const speaker = msg.role === 'user' ? 'Candidate' : 'Interviewer'
        return `${speaker}: ${msg.content}`
      })
      .join('\n')

    // Language-specific instructions
    const languageInstructions: Record<string, string> = {
      tr: `Sen bir CTO'sun ve ${level} seviyesinde bir ${role} adayını mülakat ediyorsun. 
Sert ama adil olmalısın. Amacın teknik derinlik, problem çözme yeteneği ve iletişim becerilerini değerlendirmek.

Yönergeler:
- Şimdiye kadarki konuşmaya dayanarak 1 kısa teknik soru sor
- Bu ilk soruysa, ${role} temel konuları hakkında sor
- Aday iyi cevap verdiysen, daha derine inen bir takip sorusu sor
- Cevap zayıfsa, açıklayıcı bir soru sor veya ilgili bir konuya geç
- Soruları sohbet tarzında ve gerçekçi tut (trivia değil)
- 6-8 soru sonrası veya yeterli veri toplandığında görüşmeyi bitir
- Bitirme sinyali: "Teşekkürler. Teknik görüşmemiz burada sona eriyor." ve isComplete: true döndür
${emotionalContext ? `\n- Duygusal durum: ${emotionalContext} Bu duruma göre sorunun başında veya sonunda kısa bir duygusal geri bildirim ekle (örn: "Heyecanlı görünüyorsunuz, hiç stres olmayın" veya "Rahat görünüyorsunuz, güzel gidiyor").` : ''}

Mevcut konuşma:
${conversationContext || 'Önceki konuşma yok.'}

ÖNEMLİ: SADECE ve SADECE geçerli bir JSON objesi döndür. Başka hiçbir metin, markdown, açıklama veya ek karakter ekleme. 

JSON formatı şu şekilde olmalı (tırnak işaretleri dahil):
{"question":"Sorunuz burada","isComplete":false}

Lütfen sadece JSON döndür, başka hiçbir şey ekleme. JSON dışında hiçbir karakter olmamalı.`,
      en: `You are a CTO interviewing a ${role} candidate at the ${level} level. 
You are professional but challenge the candidate. Be tough but fair. Your goal is to assess technical depth, problem-solving ability, and communication skills.

Guidelines:
- Ask 1 concise technical question based on the conversation so far (keep it brief for spoken conversation)
- If this is the first question, ask about core ${role} fundamentals
- If the candidate answered well, ask a follow-up that goes deeper
- If the answer was weak, ask a clarifying question or pivot to a related topic
- Keep questions conversational and realistic (not trivia)
- Keep responses concise for spoken conversation
- After 6-8 questions or when sufficient data is collected, end the interview
- End signal: "Thank you. That concludes our technical discussion." and return isComplete: true
${emotionalContext ? `\n- Emotional state: ${emotionalContext} Based on this, add a brief emotional feedback at the start or end of your question (e.g., "You seem a bit nervous, don't worry" or "You look confident, that's great").` : ''}

Current conversation:
${conversationContext || 'No previous conversation.'}

IMPORTANT: Return ONLY a valid JSON object. Do not add any other text, markdown, or characters.

JSON format must be (with quotes):
{"question":"Your question here","isComplete":false}

Please return only JSON, nothing else. No characters outside the JSON object.`,
      es: `Eres un CTO entrevistando a un candidato ${role} de nivel ${level}. 
Eres duro pero justo. Tu objetivo es evaluar la profundidad técnica, la capacidad de resolución de problemas y las habilidades de comunicación.

Pautas:
- Haz 1 pregunta técnica concisa basada en la conversación hasta ahora
- Si esta es la primera pregunta, pregunta sobre los fundamentos básicos de ${role}
- Si el candidato respondió bien, haz una pregunta de seguimiento que profundice
- Si la respuesta fue débil, haz una pregunta aclaratoria o cambia a un tema relacionado
- Mantén las preguntas conversacionales y realistas (no trivialidades)
- Después de 5-6 intercambios, puedes concluir con: "Gracias. Eso concluye nuestra discusión técnica."

Conversación actual:
${conversationContext || 'No hay conversación previa.'}

IMPORTANTE: Devuelve SOLO un objeto JSON válido. No agregues ningún otro texto. El formato debe ser:
{
  "question": "Tu pregunta aquí",
  "feedback": "Nota interna breve (opcional)",
  "isComplete": false
}

Por favor devuelve solo JSON, sin markdown ni explicaciones.`,
      fr: `Vous êtes un CTO interviewant un candidat ${role} de niveau ${level}. 
Vous êtes dur mais juste. Votre objectif est d'évaluer la profondeur technique, la capacité de résolution de problèmes et les compétences en communication.

Directives:
- Posez 1 question technique concise basée sur la conversation jusqu'à présent
- Si c'est la première question, posez des questions sur les fondamentaux de ${role}
- Si le candidat a bien répondu, posez une question de suivi qui va plus en profondeur
- Si la réponse était faible, posez une question de clarification ou passez à un sujet connexe
- Gardez les questions conversationnelles et réalistes (pas de trivia)
- Après 5-6 échanges, vous pouvez conclure par: "Merci. Cela conclut notre discussion technique."

Conversation actuelle:
${conversationContext || 'Aucune conversation précédente.'}

IMPORTANT: Répondez UNIQUEMENT avec un objet JSON valide. N'ajoutez aucun autre texte. Le format doit être:
{
  "question": "Votre question ici",
  "feedback": "Note interne brève (optionnel)",
  "isComplete": false
}

Veuillez retourner uniquement du JSON, sans markdown ni explications.`,
      de: `Sie sind ein CTO, der einen ${role}-Kandidaten auf ${level}-Niveau interviewt. 
Sie sind hart aber fair. Ihr Ziel ist es, technische Tiefe, Problemlösungsfähigkeit und Kommunikationsfähigkeiten zu bewerten.

Richtlinien:
- Stellen Sie 1 prägnante technische Frage basierend auf dem bisherigen Gespräch
- Wenn dies die erste Frage ist, fragen Sie nach ${role}-Grundlagen
- Wenn der Kandidat gut geantwortet hat, stellen Sie eine Nachfrage, die tiefer geht
- Wenn die Antwort schwach war, stellen Sie eine Klärungsfrage oder wechseln Sie zu einem verwandten Thema
- Halten Sie Fragen gesprächig und realistisch (kein Trivia)
- Nach 5-6 Austauschen können Sie abschließen mit: "Danke. Das beendet unsere technische Diskussion."

Aktuelles Gespräch:
${conversationContext || 'Kein vorheriges Gespräch.'}

WICHTIG: Antworten Sie NUR mit einem gültigen JSON-Objekt. Fügen Sie keinen anderen Text hinzu. Das Format muss sein:
{
  "question": "Ihre Frage hier",
  "feedback": "Kurze interne Notiz (optional)",
  "isComplete": false
}

Bitte geben Sie nur JSON zurück, kein Markdown oder Erklärungen.`,
    }

    const systemPrompt = languageInstructions[language] || languageInstructions.en

    console.log('=== Calling Groq API ===')
    console.log('Model:', SMART_MODEL)
    console.log('History length:', limitedHistory.length)
    console.log('Language:', language)
    console.log('Role:', role)
    console.log('Level:', level)
    console.log('Conversation context length:', conversationContext.length)
    console.log('System prompt length:', systemPrompt.length)
    
    // Ensure we have conversation context for better responses
    const userPrompts: Record<string, { continue: string; start: string }> = {
      tr: {
        continue: `Yukarıdaki konuşmaya dayanarak mülakatı devam ettir. Adayın son cevabına göre bir sonraki teknik soruyu sor.`,
        start: `Mülakata açılış teknik sorusuyla başla. ${role} pozisyonu için ${level} seviyesinde uygun bir soru sor.`,
      },
      en: {
        continue: `Continue the interview based on the conversation above. Ask the next technical question based on the candidate's last answer.`,
        start: `Start the interview with an opening technical question. Ask an appropriate question for a ${level} level ${role} position.`,
      },
      es: {
        continue: `Continúa la entrevista basándote en la conversación anterior. Haz la siguiente pregunta técnica basada en la última respuesta del candidato.`,
        start: `Comienza la entrevista con una pregunta técnica de apertura. Haz una pregunta apropiada para un puesto de ${role} de nivel ${level}.`,
      },
      fr: {
        continue: `Continuez l'entretien en vous basant sur la conversation ci-dessus. Posez la prochaine question technique basée sur la dernière réponse du candidat.`,
        start: `Commencez l'entretien par une question technique d'ouverture. Posez une question appropriée pour un poste de ${role} de niveau ${level}.`,
      },
      de: {
        continue: `Setzen Sie das Vorstellungsgespräch basierend auf dem obigen Gespräch fort. Stellen Sie die nächste technische Frage basierend auf der letzten Antwort des Kandidaten.`,
        start: `Beginnen Sie das Vorstellungsgespräch mit einer eröffnenden technischen Frage. Stellen Sie eine angemessene Frage für eine ${role}-Position auf ${level}-Niveau.`,
      },
    }
    const prompts = userPrompts[language] || userPrompts.en
    const userPrompt = conversationContext ? prompts.continue : prompts.start

    const completion = await groq.chat.completions.create({
      model: SMART_MODEL, // Use SMART_MODEL for AI interviewer requiring persona maintenance and context awareness
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.5, // Lower temperature for more consistent JSON output
      max_tokens: 600, // Increased further to ensure complete JSON response
      response_format: { type: 'json_object' },
    })
    
    console.log('=== Groq API Call Successful ===')
    console.log('Choices count:', completion.choices?.length || 0)
    console.log('Usage:', completion.usage)

    const rawResponse = completion.choices[0]?.message?.content
    
    if (!rawResponse) {
      console.error('No response from Groq API')
      throw new Error('No response from Groq API')
    }

    // Clean response: Remove markdown code blocks if present
    let responseText = rawResponse.trim()
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    console.log('=== Groq API Response ===')
    console.log('Raw (first 500 chars):', rawResponse?.substring(0, 500))
    console.log('Cleaned (first 500 chars):', responseText?.substring(0, 500))
    console.log('Full cleaned response length:', responseText?.length)
    console.log('Full cleaned response:', responseText)
    
    try {
      let response: InterviewerResponse
      
      // Try to parse JSON
      try {
        response = JSON.parse(responseText) as InterviewerResponse
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError)
        console.error('Response text:', responseText)
        
        // Try multiple regex patterns to extract question from raw text
        let questionMatch = responseText.match(/"question"\s*:\s*"([^"]+)"/)
        if (!questionMatch) {
          // Try with escaped quotes and newlines
          questionMatch = responseText.match(/"question"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/)
        }
        if (!questionMatch) {
          // Try with unicode characters (Turkish, etc.)
          questionMatch = responseText.match(/"question"\s*:\s*"([^"]*[ÇĞİÖŞÜçğıöşü][^"]*)"/)
        }
        if (!questionMatch) {
          // Try without quotes
          questionMatch = responseText.match(/question["\s:]+([^"}\n,]+)/i)
        }
        if (!questionMatch) {
          // Try to find any text that looks like a question (with Turkish chars)
          questionMatch = responseText.match(/([A-ZÇĞİÖŞÜ][^}]{20,200}[?])/)
        }
        
        if (questionMatch && questionMatch[1]) {
          let extractedQuestion = questionMatch[1].trim()
          // Clean up escape sequences
          extractedQuestion = extractedQuestion
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, '\\')
          
          console.log('✅ Extracted question from text:', extractedQuestion)
          response = {
            question: extractedQuestion,
            isComplete: false,
          }
        } else {
          // If no question found, return a default error message
          console.error('❌ Could not extract question from response text')
          console.error('Response text for debugging:', JSON.stringify(responseText))
          const errorMessages: Record<string, string> = {
            tr: 'Teknik bir sorun yaşadım. Lütfen tekrar deneyin.',
            en: 'I encountered a technical issue. Please try again.',
            es: 'Encontré un problema técnico. Por favor, inténtalo de nuevo.',
            fr: 'J\'ai rencontré un problème technique. Veuillez réessayer.',
            de: 'Ich habe ein technisches Problem festgestellt. Bitte versuchen Sie es erneut.',
          }
          throw new Error(errorMessages[language] || errorMessages.en)
        }
      }
      
      // Validate response structure
      if (!response || typeof response !== 'object') {
        console.error('❌ Invalid response structure:', response)
        throw new Error('Invalid response structure')
      }
      
      // Validate question field
      if (!response.question || typeof response.question !== 'string' || response.question.trim().length === 0) {
        console.error('❌ Missing or invalid question field:', response)
        throw new Error('Missing or invalid question field')
      }
      
      console.log('✅ Successfully parsed JSON response')
      console.log('Question:', response.question)
      console.log('Has Feedback:', !!response.feedback)
      console.log('Is Complete:', response.isComplete)
      
      // Cache the response for future similar questions
      if (limitedHistory.length > 1) {
        cacheResponse(limitedHistory, role, level, responseText)
      }
      
      // Fallback messages in different languages
      const fallbackMessages: Record<string, string> = {
        tr: 'Bu rol hakkındaki deneyiminizden bahsedebilir misiniz?',
        en: 'Could you tell me about your experience with this role?',
        es: '¿Podrías contarme sobre tu experiencia con este rol?',
        fr: 'Pourriez-vous me parler de votre expérience avec ce rôle?',
        de: 'Könnten Sie mir von Ihrer Erfahrung mit dieser Rolle erzählen?',
      }

      return {
        question: response.question || fallbackMessages[language] || fallbackMessages.en,
        feedback: response.feedback,
        isComplete: response.isComplete || false,
      }
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError)
      console.error('Raw response:', responseText)
      
      // Try to extract question from text even if JSON parse fails
      let extractedQuestion = ''
      try {
        // Try to find question in text
        const questionMatch = responseText.match(/"question"\s*:\s*"([^"]+)"/i) || 
                             responseText.match(/question["\s:]+([^"}\n]+)/i)
        if (questionMatch && questionMatch[1]) {
          extractedQuestion = questionMatch[1].trim()
        }
      } catch (e) {
        // Ignore extraction errors
      }
      
      if (extractedQuestion) {
        console.log('Extracted question from text:', extractedQuestion)
        return {
          question: extractedQuestion,
          isComplete: false,
        }
      }
      
      // Fallback error messages
      const errorMessages: Record<string, string> = {
        tr: 'Özür dilerim, bir sorun yaşadım. Cevabınızı tekrar edebilir misiniz?',
        en: "I apologize, but I'm having trouble processing that. Could you repeat your answer?",
        es: 'Lo siento, pero estoy teniendo problemas para procesar eso. ¿Podrías repetir tu respuesta?',
        fr: "Je m'excuse, mais j'ai du mal à traiter cela. Pourriez-vous répéter votre réponse?",
        de: 'Es tut mir leid, aber ich habe Schwierigkeiten, das zu verarbeiten. Könnten Sie Ihre Antwort wiederholen?',
      }
      
      return {
        question: errorMessages[language] || errorMessages.en,
        isComplete: false,
      }
    }
  } catch (error: any) {
    console.error('Error generating interviewer response:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })
    
    // Check if it's a Groq API error
    if (error?.status || error?.code) {
      console.error('Groq API Error:', {
        status: error.status,
        code: error.code,
        message: error.message,
      })
    }
    
    const errorMessages: Record<string, string> = {
      tr: 'Özür dilerim, bir sorun yaşadım. Cevabınızı tekrar edebilir misiniz?',
      en: "I apologize, but I'm having trouble processing that. Could you repeat your answer?",
      es: 'Lo siento, pero estoy teniendo problemas para procesar eso. ¿Podrías repetir tu respuesta?',
      fr: "Je m'excuse, mais j'ai du mal à traiter cela. Pourriez-vous répéter votre réponse?",
      de: 'Es tut mir leid, aber ich habe Schwierigkeiten, das zu verarbeiten. Könnten Sie Ihre Antwort wiederholen?',
    }
    
    return {
      question: errorMessages[language] || errorMessages.en,
      isComplete: false,
    }
  }
}

/**
 * Save interview session transcript to database
 */
export async function saveInterviewTranscript(
  sessionId: string,
  transcript: TranscriptMessage[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()

    const { error } = await (supabase as any)
      .from('ai_interview_sessions')
      .update({
        transcript_json: JSON.parse(JSON.stringify(transcript)),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (error) {
      console.error('Error saving transcript:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving transcript:', error)
    return { success: false, error: 'Failed to save transcript' }
  }
}

/**
 * Complete interview session and save feedback
 */
/**
 * Generate comprehensive interview feedback with SWOT analysis using AI
 */
export async function generateInterviewFeedback(
  transcript: TranscriptMessage[],
  role: string,
  level: 'junior' | 'mid' | 'senior' | 'lead' | 'architect',
  language: 'tr' | 'en' | 'es' | 'fr' | 'de' = 'tr'
): Promise<InterviewFeedback> {
  try {
    // Build conversation summary
    const conversationSummary = transcript
      .map((msg) => {
        const speaker = msg.role === 'user' ? 'Candidate' : 'Interviewer'
        return `${speaker}: ${msg.content}`
      })
      .join('\n\n')

    const languageInstructions: Record<string, string> = {
      tr: `Sen bir CTO'sun ve ${level} seviyesinde bir ${role} adayını mülakat ettin. 
Şimdi adayın performansını değerlendir ve kapsamlı bir geri bildirim hazırla.

ÖNEMLİ: ÇOK ACIMASIZ VE GERÇEKÇİ OL. Puanlama yaparken:
- "Bilmiyorum", "Hatırlamıyorum", "Emin değilim" gibi cevaplar DÜŞÜK PUAN demektir (20-40 arası)
- Teknik sorulara doğru cevap veremeyen aday DÜŞÜK PUAN almalı (30-50 arası)
- Kısmi doğru cevaplar ORTA PUAN (50-70 arası)
- Sadece mükemmel cevaplar YÜKSEK PUAN (80-100 arası)
- Gerçekçi ol: Çoğu soruya "bilmiyorum" diyen aday 75 değil, 25-35 arası puan almalı
- Doğruluk oranını hesapla: Doğru cevap sayısı / Toplam soru sayısı = Puan temeli

Görev:
1. Adayın cevaplarını DETAYLI analiz et:
   - Her cevabın doğruluğunu değerlendir
   - "Bilmiyorum" cevaplarını NEGATİF olarak say
   - Teknik derinliği ölç
   - İletişim kalitesini değerlendir
2. 100 üzerinden GERÇEKÇİ genel puan ver (0-100):
   - Doğruluk oranına göre hesapla
   - Acımasız ol ama adil ol
3. SWOT analizi yap:
   - Strengths (Güçlü yönler): 3-5 madde
   - Weaknesses (Zayıf yönler): 3-5 madde (DETAYLI ve ACIMASIZ)
   - Opportunities (Fırsatlar): 2-3 madde
   - Threats (Tehditler): 2-3 madde
4. Öneriler sun (3-5 madde) - GERÇEKÇİ ve UYGULANABİLİR
5. Detaylı SWOT özeti yaz (2-3 cümle)

Mülakat transkripti:
${conversationSummary}

ÖNEMLİ: SADECE geçerli JSON döndür. Format:
{
  "overall_score": 75,
  "technical_score": 80,
  "communication_score": 70,
  "problem_solving_score": 75,
  "strengths": ["Güçlü yön 1", "Güçlü yön 2"],
  "weaknesses": ["Zayıf yön 1", "Zayıf yön 2"],
  "opportunities": ["Fırsat 1", "Fırsat 2"],
  "threats": ["Tehdit 1", "Tehdit 2"],
  "recommendations": ["Öneri 1", "Öneri 2"],
  "overall_assessment": "Genel değerlendirme metni",
  "swot_analysis": "Detaylı SWOT özeti"
}`,
      en: `You are a CTO who just interviewed a ${role} candidate at the ${level} level. 
Now evaluate the candidate's performance and provide comprehensive feedback.

CRITICAL: BE VERY HARSH AND REALISTIC. When scoring:
- Answers like "I don't know", "I don't remember", "I'm not sure" = LOW SCORE (20-40)
- Candidate who cannot answer technical questions correctly = LOW SCORE (30-50)
- Partially correct answers = MEDIUM SCORE (50-70)
- Only perfect answers = HIGH SCORE (80-100)
- Be realistic: A candidate who says "I don't know" to most questions should get 25-35, NOT 75
- Calculate accuracy rate: Correct answers / Total questions = Score basis

Task:
1. Analyze candidate's answers IN DETAIL:
   - Evaluate correctness of each answer
   - Count "I don't know" answers as NEGATIVE
   - Measure technical depth
   - Assess communication quality
2. Give a REALISTIC overall score out of 100 (0-100):
   - Calculate based on accuracy rate
   - Be harsh but fair
3. Perform SWOT analysis:
   - Strengths: 3-5 items
   - Weaknesses: 3-5 items (DETAILED and HARSH)
   - Opportunities: 2-3 items
   - Threats: 2-3 items
4. Provide recommendations (3-5 items) - REALISTIC and ACTIONABLE
5. Write detailed SWOT summary (2-3 sentences)

Interview transcript:
${conversationSummary}

IMPORTANT: Return ONLY valid JSON. Format:
{
  "overall_score": 75,
  "technical_score": 80,
  "communication_score": 70,
  "problem_solving_score": 75,
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "threats": ["Threat 1", "Threat 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "overall_assessment": "Overall assessment text",
  "swot_analysis": "Detailed SWOT summary"
}`,
    }

    const systemPrompt = languageInstructions[language] || languageInstructions.en

    const completion = await groq.chat.completions.create({
      model: SMART_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Evaluate this interview and provide comprehensive feedback with SWOT analysis.`,
        },
      ],
      temperature: 0.3, // Lower temperature for consistent evaluation
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const rawResponse = completion.choices[0]?.message?.content?.trim() || '{}'
    let responseText = rawResponse
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    const feedback = JSON.parse(responseText) as InterviewFeedback

    // Calculate accuracy-based score if AI didn't provide realistic scores
    // Count "I don't know" type answers
    const userMessages = transcript.filter(m => m.role === 'user')
    const negativeAnswers = userMessages.filter(m => {
      const content = m.content.toLowerCase()
      return content.includes('bilmiyorum') || 
             content.includes('i don\'t know') || 
             content.includes('no sé') ||
             content.includes('je ne sais pas') ||
             content.includes('ich weiß nicht') ||
             content.includes('hatırlamıyorum') ||
             content.includes('don\'t remember') ||
             content.includes('emin değilim') ||
             content.includes('not sure')
    }).length

    const totalQuestions = transcript.filter(m => m.role === 'assistant').length
    const accuracyRate = totalQuestions > 0 ? (totalQuestions - negativeAnswers) / totalQuestions : 0
    const calculatedScore = Math.round(accuracyRate * 100)

    // Use AI score if provided, otherwise use calculated score
    // But ensure it's realistic (not inflated)
    const aiOverallScore = (feedback as any).overall_score || calculatedScore
    const finalOverallScore = Math.max(0, Math.min(100, Math.min(aiOverallScore, calculatedScore + 10))) // Cap at calculated + 10

    // Validate and ensure all required fields (match database schema with snake_case)
    return {
      overall_score: finalOverallScore,
      technical_score: Math.max(0, Math.min(100, (feedback as any).technical_score || Math.round(finalOverallScore * 0.9))),
      communication_score: Math.max(0, Math.min(100, (feedback as any).communication_score || Math.round(finalOverallScore * 0.95))),
      problem_solving_score: Math.max(0, Math.min(100, (feedback as any).problem_solving_score || Math.round(finalOverallScore * 0.85))),
      strengths: feedback.strengths || [],
      weaknesses: feedback.weaknesses || [],
      opportunities: feedback.opportunities || [],
      threats: feedback.threats || [],
      recommendations: feedback.recommendations || [],
      overall_assessment: (feedback as any).overall_assessment || 'Assessment completed.',
      swot_analysis: (feedback as any).swot_analysis || 'SWOT analysis completed.',
    } as InterviewFeedback
  } catch (error) {
    console.error('Error generating interview feedback:', error)
    throw error
  }
}

export async function completeInterviewSession(
  sessionId: string,
  transcript: TranscriptMessage[],
  feedback: InterviewFeedback
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()

    const { error } = await (supabase as any)
      .from('ai_interview_sessions')
      .update({
        transcript_json: JSON.parse(JSON.stringify(transcript)),
        feedback_json: JSON.parse(JSON.stringify(feedback)),
        overall_score: feedback.overall_score,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (error) {
      console.error('Error completing session:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error completing session:', error)
    return { success: false, error: 'Failed to complete session' }
  }
}

/**
 * Create a new interview session
 */
export async function createInterviewSession(
  jobRole: string,
  jobLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'architect'
): Promise<{ sessionId: string | null; error?: string }> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { sessionId: null, error: 'Not authenticated' }
    }

    const { data, error } = await (supabase as any)
      .from('ai_interview_sessions')
      .insert({
        user_id: user.id,
        job_role: jobRole,
        job_level: jobLevel,
        transcript_json: [],
        feedback_json: {},
        status: 'in_progress',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return { sessionId: null, error: error.message }
    }

    return { sessionId: (data as any)?.id || null }
  } catch (error) {
    console.error('Error creating session:', error)
    return { sessionId: null, error: 'Failed to create session' }
  }
}

