import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import type { UserPersona } from '@/app/actions/resume-actions'

/**
 * Generate a professional PDF resume from user persona
 */
export async function generateResumePDF(persona: UserPersona, userId?: string): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPos = margin

  // Colors
  const primaryColor = [41, 128, 185] // Blue
  const secondaryColor = [52, 73, 94] // Dark gray
  const accentColor = [46, 204, 113] // Green

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, pageWidth, 50, 'F')

  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('DATA LEGACY', margin, 25)
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  const classText = persona.chosenClass 
    ? `${persona.chosenClass.charAt(0) + persona.chosenClass.slice(1).toLowerCase()}`
    : 'Data Professional'
  doc.text(`Certified ${classText} (Level ${persona.currentLevel})`, margin, 35)

  yPos = 60

  // Contact Info
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (persona.email) {
    doc.text(`Email: ${persona.email}`, margin, yPos)
  }
  doc.text(`Total XP: ${persona.totalXP.toLocaleString()}`, pageWidth - margin - 40, yPos)
  yPos += 10

  // Summary
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text('PROFESSIONAL SUMMARY', margin, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const summaryText = `Experienced ${classText} with ${persona.totalCodingHours} hours of hands-on practice across ${persona.totalSessions} game sessions. Demonstrated expertise in data engineering, problem-solving, and technical optimization.`
  const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 2 * margin)
  doc.text(summaryLines, margin, yPos)
  yPos += summaryLines.length * 6 + 5

  // Top Skills
  if (persona.topSkills.length > 0) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text('TECHNICAL SKILLS', margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    persona.topSkills.forEach((skill) => {
      const skillText = `${skill.skill}: Top ${skill.percentile}% (Avg Score: ${skill.avgScore})`
      doc.text(skillText, margin + 5, yPos)
      yPos += 6
    })
    yPos += 5
  }

  // Soft Skills
  if (persona.softSkills.length > 0) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text('SOFT SKILLS', margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    persona.softSkills.forEach((skill) => {
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
      doc.text(`${skill.skill}:`, margin + 5, yPos)
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2])
      doc.text(skill.proficiency, margin + 50, yPos)
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
      doc.text(`(${skill.scenarios} scenarios, Avg: ${skill.avgScore})`, margin + 80, yPos)
      yPos += 6
    })
    yPos += 5
  }

  // Achievements
  if (persona.achievements.length > 0) {
    // Check if we need a new page
    if (yPos > pageHeight - 40) {
      doc.addPage()
      yPos = margin
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text('ACHIEVEMENTS & CERTIFICATIONS', margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    persona.achievements.forEach((achievement) => {
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2])
      doc.text('•', margin + 5, yPos)
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
      doc.text(achievement, margin + 10, yPos)
      yPos += 6
    })
  }

  // Verification Link Section with QR Code
  if (yPos > pageHeight - 60) {
    doc.addPage()
    yPos = margin
  }

  yPos += 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text('VERIFICATION', margin, yPos)
  yPos += 8

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  
  // Get passport URL (changed from verify to profile)
  let passportUrl = ''
  if (typeof window !== 'undefined' && userId) {
    passportUrl = `${window.location.origin}/profile`
  } else if (typeof window !== 'undefined') {
    passportUrl = `${window.location.origin}/profile`
  } else {
    // Server-side fallback
    passportUrl = 'https://data-legacy.app/profile'
  }

  const verificationText = `View live passport online:`
  doc.text(verificationText, margin, yPos)
  yPos += 6
  
  // Add clickable link
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text(passportUrl, margin, yPos, {
    link: passportUrl,
  })
  yPos += 8

  // Generate and add QR Code
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(passportUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    
    // Add QR code image (20mm x 20mm)
    const qrSize = 20
    const qrX = pageWidth - margin - qrSize
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, yPos - 5, qrSize, qrSize)
    
    // Add label below QR code
    doc.setFontSize(7)
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text('Scan to view passport', qrX + qrSize / 2, yPos + qrSize + 3, { align: 'center' })
  } catch (error) {
    console.error('Error generating QR code:', error)
    // Continue without QR code if generation fails
  }
  
  yPos += 30

  // Footer
  const footerY = pageHeight - 15
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Generated by Data Legacy 2.0', pageWidth / 2, footerY, { align: 'center' })
  doc.text(new Date().toLocaleDateString(), pageWidth / 2, footerY + 5, { align: 'center' })

  // Save PDF
  const fileName = `Data_Legacy_Resume_${persona.email?.split('@')[0] || 'User'}_${Date.now()}.pdf`
  doc.save(fileName)
}

