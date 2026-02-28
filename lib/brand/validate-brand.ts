import type { BrandGuidelines, BrandValidationResult } from '@/lib/types'

function validateColors(content: string, guidelines: BrandGuidelines): { violations: string[]; warnings: string[] } {
  const violations: string[] = []
  const warnings: string[] = []

  const hexPattern = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/g
  const rgbPattern = /rgb\s*\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)/gi
  const foundColors = [...(content.match(hexPattern) || []), ...(content.match(rgbPattern) || [])]

  const approved = [...guidelines.primary_colors, ...guidelines.secondary_colors].map((c) => c.toUpperCase())

  for (const color of foundColors) {
    if (!approved.includes(color.toUpperCase())) {
      violations.push(`Niezatwierdzony kolor: ${color}`)
    }
  }

  return { violations, warnings }
}

function validateFonts(content: string, guidelines: BrandGuidelines): { violations: string[]; warnings: string[] } {
  const violations: string[] = []
  const warnings: string[] = []

  const fontPatterns = [
    /font-family\s*:\s*['"]?([^;'"]+)['"]?/gi,
    /font:\s*[^;]*\s+([A-Za-z][A-Za-z\s]+)(?:,|;|\s+\d)/gi,
  ]

  const foundFonts: string[] = []
  for (const pattern of fontPatterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      foundFonts.push(match[1])
    }
  }

  for (const font of foundFonts) {
    const fontClean = font.trim().toLowerCase()
    const isApproved = guidelines.fonts.some((f) => fontClean.includes(f.toLowerCase()))
    if (!isApproved) {
      violations.push(`Niezatwierdzona czcionka: ${font.trim()}`)
    }
  }

  return { violations, warnings }
}

function validateTone(content: string, guidelines: BrandGuidelines): { violations: string[]; warnings: string[] } {
  const violations: string[] = []
  const warnings: string[] = []
  const lower = content.toLowerCase()

  for (const word of guidelines.prohibited_words) {
    if (lower.includes(word.toLowerCase())) {
      violations.push(`Zabronione slowo: '${word}'`)
    }
  }

  const toneMatches = guidelines.tone_keywords.filter((kw) => lower.includes(kw.toLowerCase()))
  if (toneMatches.length === 0 && content.length > 100) {
    warnings.push(
      `Tresc moze nie byc zgodna z tonem marki. Rozważ uzycie slow: ${guidelines.tone_keywords.slice(0, 5).join(', ')}`,
    )
  }

  return { violations, warnings }
}

function validateBrandName(content: string, guidelines: BrandGuidelines): { violations: string[]; warnings: string[] } {
  const violations: string[] = []
  const warnings: string[] = []

  const pattern = new RegExp(guidelines.brand_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  const matches = content.match(pattern) || []

  for (const match of matches) {
    if (match !== guidelines.brand_name) {
      violations.push(`Nieprawidlowa wielkosc liter: '${match}' powinno byc '${guidelines.brand_name}'`)
    }
  }

  return { violations, warnings }
}

export function validateBrand(content: string, guidelines: BrandGuidelines): BrandValidationResult {
  const allViolations: string[] = []
  const allWarnings: string[] = []

  const checks = [
    validateColors(content, guidelines),
    validateFonts(content, guidelines),
    validateTone(content, guidelines),
    validateBrandName(content, guidelines),
  ]

  for (const check of checks) {
    allViolations.push(...check.violations)
    allWarnings.push(...check.warnings)
  }

  const violationPenalty = allViolations.length * 10
  const warningPenalty = allWarnings.length * 3
  const score = Math.max(0, 100 - violationPenalty - warningPenalty)

  const suggestions: string[] = []
  if (allViolations.some((v) => v.toLowerCase().includes('kolor'))) {
    suggestions.push(`Uzyj zatwierdzonych kolorow: ${guidelines.primary_colors.slice(0, 3).join(', ')}`)
  }
  if (allViolations.some((v) => v.toLowerCase().includes('czcionka'))) {
    suggestions.push(`Uzyj zatwierdzonych czcionek: ${guidelines.fonts.join(', ')}`)
  }
  if (allWarnings.some((w) => w.toLowerCase().includes('ton'))) {
    suggestions.push(`Wlacz slowa kluczowe marki: ${guidelines.tone_keywords.slice(0, 5).join(', ')}`)
  }
  if (allViolations.some((v) => v.toLowerCase().includes('liter'))) {
    suggestions.push(`Zawsze zapisuj nazwe marki jako: ${guidelines.brand_name}`)
  }

  return {
    passed: allViolations.length === 0,
    score,
    violations: allViolations,
    warnings: allWarnings,
    suggestions,
  }
}

export function getDefaultGuidelines(): BrandGuidelines {
  return {
    brand_name: 'Acme Corporation',
    primary_colors: ['#0066CC', '#003366', '#FFFFFF'],
    secondary_colors: ['#28A745', '#FFC107', '#DC3545', '#6C757D', '#F8F9FA'],
    fonts: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
    tone_keywords: ['innovation', 'excellence', 'professional', 'solutions', 'trusted', 'reliable'],
    prohibited_words: ['cheap', 'outdated', 'inferior', 'unprofessional', 'sloppy'],
    tagline: 'Innovation Through Excellence',
  }
}
