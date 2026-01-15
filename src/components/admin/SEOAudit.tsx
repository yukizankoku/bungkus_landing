import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  TrendingUp,
  FileText,
  Search,
  Link2,
  Image,
  Type,
  Sparkles,
  Eye,
  BookOpen,
  Shield,
  Clock,
  MessageSquare,
  Target,
  Layers,
  Quote,
  Lightbulb,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SEOAuditProps {
  title: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  focusKeyword?: string;
  language?: 'en' | 'id';
  url?: string;
}

interface SEOCheck {
  id: string;
  name: string;
  category: 'keyword' | 'structure' | 'technical' | 'readability' | 'trust';
  status: 'pass' | 'warning' | 'fail';
  message: string;
  points: number;
  maxPoints: number;
  icon: React.ReactNode;
}

interface GEOCheck {
  id: string;
  name: string;
  category: 'answer-first' | 'entity' | 'extractable' | 'authority' | 'freshness' | 'source-worthy' | 'multi-query';
  status: 'pass' | 'fail';
  message: string;
  icon: React.ReactNode;
}

// Helper functions
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

function extractHeadings(html: string): { h1: string[]; h2: string[]; h3: string[] } {
  const h1Matches = html.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
  const h2Matches = html.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
  const h3Matches = html.match(/<h3[^>]*>(.*?)<\/h3>/gi) || [];
  
  return {
    h1: h1Matches.map(h => stripHtml(h)),
    h2: h2Matches.map(h => stripHtml(h)),
    h3: h3Matches.map(h => stripHtml(h)),
  };
}

function countInternalLinks(html: string): number {
  const linkMatches = html.match(/<a[^>]*href=["'][^"']*["'][^>]*>/gi) || [];
  return linkMatches.filter(link => 
    !link.includes('http://') && !link.includes('https://') || 
    link.includes('bungkusin.co.id') || link.includes('bungkusindonesia.com')
  ).length;
}

function countExternalLinks(html: string): number {
  const linkMatches = html.match(/<a[^>]*href=["']https?:\/\/[^"']*["'][^>]*>/gi) || [];
  return linkMatches.filter(link => 
    !link.includes('bungkusin.co.id') && !link.includes('bungkusindonesia.com')
  ).length;
}

function countImages(html: string): { total: number; withAlt: number } {
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  const withAlt = imgMatches.filter(img => /alt=["'][^"']+["']/.test(img)).length;
  return { total: imgMatches.length, withAlt };
}

function getFirst100Words(text: string): string {
  return text.split(/\s+/).slice(0, 100).join(' ');
}

function countLists(html: string): number {
  const ulMatches = html.match(/<ul[^>]*>/gi) || [];
  const olMatches = html.match(/<ol[^>]*>/gi) || [];
  return ulMatches.length + olMatches.length;
}

function countTables(html: string): number {
  const tableMatches = html.match(/<table[^>]*>/gi) || [];
  return tableMatches.length;
}

function countParagraphs(html: string): { total: number; longParagraphs: number } {
  const pMatches = html.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
  const longParagraphs = pMatches.filter(p => countWords(stripHtml(p)) > 100).length;
  return { total: pMatches.length, longParagraphs };
}

function hasHedgingLanguage(text: string): boolean {
  const hedgingWords = ['may', 'might', 'could', 'possibly', 'perhaps', 'probably', 'seems', 'appears', 'mungkin', 'sepertinya', 'kemungkinan'];
  const lowerText = text.toLowerCase();
  let count = 0;
  hedgingWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) count += matches.length;
  });
  return count > 5; // More than 5 instances is excessive
}

function hasAmbiguousPronouns(text: string): boolean {
  const ambiguousPronouns = ['this', 'that', 'it', 'these', 'those', 'ini', 'itu'];
  const sentences = text.split(/[.!?]/);
  let ambiguousCount = 0;
  
  sentences.forEach(sentence => {
    const words = sentence.trim().toLowerCase().split(/\s+/);
    if (words.length > 0 && ambiguousPronouns.includes(words[0])) {
      ambiguousCount++;
    }
  });
  
  return ambiguousCount > 3;
}

function hasCurrentYearReference(text: string): boolean {
  const currentYear = new Date().getFullYear();
  const recentYears = [currentYear, currentYear - 1].map(String);
  return recentYears.some(year => text.includes(year));
}

function hasQuestionWords(text: string): number {
  const questionIndicators = ['why', 'how', 'what', 'when', 'where', 'which', 'mengapa', 'bagaimana', 'apa', 'kapan', 'dimana', 'mana'];
  let count = 0;
  questionIndicators.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) count += matches.length;
  });
  return count;
}

const CATEGORY_INFO = {
  keyword: { name: 'Keyword & Intent', maxPoints: 30, icon: <Target className="h-4 w-4" /> },
  structure: { name: 'Content Structure', maxPoints: 25, icon: <Layers className="h-4 w-4" /> },
  technical: { name: 'Technical SEO', maxPoints: 20, icon: <FileCheck className="h-4 w-4" /> },
  readability: { name: 'Readability & UX', maxPoints: 15, icon: <Eye className="h-4 w-4" /> },
  trust: { name: 'Trust & Credibility', maxPoints: 10, icon: <Shield className="h-4 w-4" /> },
};

const GEO_CATEGORY_INFO = {
  'answer-first': { name: 'Answer-First Structure', icon: <MessageSquare className="h-4 w-4" /> },
  'entity': { name: 'Entity Clarity', icon: <Target className="h-4 w-4" /> },
  'extractable': { name: 'Extractable Structures', icon: <Layers className="h-4 w-4" /> },
  'authority': { name: 'Opinionated Authority', icon: <Quote className="h-4 w-4" /> },
  'freshness': { name: 'Freshness & Context', icon: <RefreshCw className="h-4 w-4" /> },
  'source-worthy': { name: 'Source-Worthy Language', icon: <FileText className="h-4 w-4" /> },
  'multi-query': { name: 'Multi-Query Coverage', icon: <Lightbulb className="h-4 w-4" /> },
};

export default function SEOAudit({ 
  title, 
  metaTitle, 
  metaDescription, 
  content,
  focusKeyword = '',
  language = 'id',
  url = ''
}: SEOAuditProps) {
  const [activeTab, setActiveTab] = useState<'seo' | 'geo'>('seo');

  // SEO Checks with new weighted scoring
  const seoChecks = useMemo<SEOCheck[]>(() => {
    const results: SEOCheck[] = [];
    const plainContent = stripHtml(content);
    const wordCount = countWords(plainContent);
    const headings = extractHeadings(content);
    const internalLinks = countInternalLinks(content);
    const externalLinks = countExternalLinks(content);
    const images = countImages(content);
    const first100Words = getFirst100Words(plainContent);
    const lists = countLists(content);
    const paragraphs = countParagraphs(content);

    // ============================================
    // CATEGORY 1: Keyword & Search Intent (30 pts)
    // ============================================
    
    // Primary keyword in title (8 pts)
    if (focusKeyword) {
      const keywordInTitle = metaTitle.toLowerCase().includes(focusKeyword.toLowerCase());
      results.push({
        id: 'keyword-title',
        name: 'Keyword in Title',
        category: 'keyword',
        status: keywordInTitle ? 'pass' : 'fail',
        message: keywordInTitle 
          ? 'Focus keyword appears in meta title.' 
          : `"${focusKeyword}" not found in meta title.`,
        points: keywordInTitle ? 8 : 0,
        maxPoints: 8,
        icon: <Search className="h-4 w-4" />
      });

      // Keyword in H1 (7 pts)
      const keywordInH1 = title.toLowerCase().includes(focusKeyword.toLowerCase());
      results.push({
        id: 'keyword-h1',
        name: 'Keyword in H1',
        category: 'keyword',
        status: keywordInH1 ? 'pass' : 'fail',
        message: keywordInH1 
          ? 'Focus keyword appears in page title/H1.' 
          : `"${focusKeyword}" not found in H1 heading.`,
        points: keywordInH1 ? 7 : 0,
        maxPoints: 7,
        icon: <Type className="h-4 w-4" />
      });

      // Keyword in first 100 words (7 pts)
      const keywordInIntro = first100Words.toLowerCase().includes(focusKeyword.toLowerCase());
      results.push({
        id: 'keyword-intro',
        name: 'Keyword in Introduction',
        category: 'keyword',
        status: keywordInIntro ? 'pass' : 'warning',
        message: keywordInIntro 
          ? 'Keyword appears in the first 100 words.' 
          : 'Add keyword to the introduction for better relevance.',
        points: keywordInIntro ? 7 : 3,
        maxPoints: 7,
        icon: <Search className="h-4 w-4" />
      });

      // Keyword in H2 (5 pts)
      const keywordInH2 = headings.h2.some(h2 => 
        h2.toLowerCase().includes(focusKeyword.toLowerCase())
      );
      results.push({
        id: 'keyword-h2',
        name: 'Keyword in H2',
        category: 'keyword',
        status: keywordInH2 ? 'pass' : 'warning',
        message: keywordInH2 
          ? 'Keyword or variation found in H2 heading.' 
          : 'Consider adding keyword to an H2 subheading.',
        points: keywordInH2 ? 5 : 2,
        maxPoints: 5,
        icon: <Type className="h-4 w-4" />
      });

      // URL contains keyword (3 pts) - Check if URL is clean and contains keyword
      const cleanUrl = url.toLowerCase().replace(/[^a-z0-9]/g, ' ');
      const keywordInUrl = cleanUrl.includes(focusKeyword.toLowerCase().replace(/[^a-z0-9]/g, ' '));
      results.push({
        id: 'keyword-url',
        name: 'Keyword in URL',
        category: 'keyword',
        status: keywordInUrl || !url ? 'pass' : 'warning',
        message: keywordInUrl || !url
          ? 'URL structure is optimized.' 
          : 'Consider including keyword in URL slug.',
        points: keywordInUrl || !url ? 3 : 1,
        maxPoints: 3,
        icon: <Link2 className="h-4 w-4" />
      });
    } else {
      // No focus keyword set - give partial points but warn
      results.push({
        id: 'keyword-missing',
        name: 'Focus Keyword',
        category: 'keyword',
        status: 'warning',
        message: 'No focus keyword set. Add one for better optimization.',
        points: 15,
        maxPoints: 30,
        icon: <Search className="h-4 w-4" />
      });
    }

    // ============================================
    // CATEGORY 2: Content Structure & Depth (25 pts)
    // ============================================
    
    // Content length appropriate for intent (10 pts)
    let contentLengthPoints = 0;
    let contentLengthStatus: 'pass' | 'warning' | 'fail' = 'fail';
    let contentLengthMsg = '';
    
    if (wordCount >= 800) {
      contentLengthPoints = 10;
      contentLengthStatus = 'pass';
      contentLengthMsg = `Comprehensive content with ${wordCount} words.`;
    } else if (wordCount >= 500) {
      contentLengthPoints = 8;
      contentLengthStatus = 'pass';
      contentLengthMsg = `Good content depth with ${wordCount} words.`;
    } else if (wordCount >= 300) {
      contentLengthPoints = 5;
      contentLengthStatus = 'warning';
      contentLengthMsg = `${wordCount} words. Consider expanding for better depth.`;
    } else if (wordCount >= 100) {
      contentLengthPoints = 2;
      contentLengthStatus = 'warning';
      contentLengthMsg = `Only ${wordCount} words. Add more content.`;
    } else {
      contentLengthMsg = `Only ${wordCount} words. Significantly more content needed.`;
    }
    
    results.push({
      id: 'content-length',
      name: 'Content Depth',
      category: 'structure',
      status: contentLengthStatus,
      message: contentLengthMsg,
      points: contentLengthPoints,
      maxPoints: 10,
      icon: <FileText className="h-4 w-4" />
    });

    // Heading hierarchy (8 pts)
    const hasH1 = headings.h1.length > 0 || title.length > 0;
    const hasH2 = headings.h2.length > 0;
    const hasH3 = headings.h3.length > 0;
    const properHierarchy = hasH1 && hasH2;
    
    let hierarchyPoints = 0;
    if (hasH1) hierarchyPoints += 3;
    if (hasH2) hierarchyPoints += 3;
    if (hasH3) hierarchyPoints += 2;
    
    results.push({
      id: 'heading-hierarchy',
      name: 'Heading Hierarchy',
      category: 'structure',
      status: properHierarchy ? 'pass' : hasH1 ? 'warning' : 'fail',
      message: properHierarchy 
        ? `Clear hierarchy: H1 → ${headings.h2.length} H2s → ${headings.h3.length} H3s`
        : 'Add proper heading structure (H1 → H2 → H3).',
      points: hierarchyPoints,
      maxPoints: 8,
      icon: <Layers className="h-4 w-4" />
    });

    // Scannable sections (7 pts)
    const hasLists = lists > 0;
    const hasShortParagraphs = paragraphs.longParagraphs === 0;
    const scannabilityScore = (hasLists ? 3 : 0) + (hasShortParagraphs ? 4 : 2);
    
    results.push({
      id: 'scannability',
      name: 'Scannable Content',
      category: 'structure',
      status: scannabilityScore >= 5 ? 'pass' : 'warning',
      message: scannabilityScore >= 5 
        ? 'Content is well-organized and scannable.'
        : 'Add lists or break up long paragraphs for better readability.',
      points: scannabilityScore,
      maxPoints: 7,
      icon: <Eye className="h-4 w-4" />
    });

    // ============================================
    // CATEGORY 3: On-Page Technical SEO (20 pts)
    // ============================================
    
    // Meta title length (5 pts)
    const metaTitleLen = metaTitle.length;
    let metaTitlePoints = 0;
    let metaTitleStatus: 'pass' | 'warning' | 'fail' = 'fail';
    let metaTitleMsg = '';
    
    if (metaTitleLen === 0) {
      metaTitleMsg = 'Missing meta title. Add one (50-60 characters).';
    } else if (metaTitleLen >= 50 && metaTitleLen <= 60) {
      metaTitlePoints = 5;
      metaTitleStatus = 'pass';
      metaTitleMsg = `Perfect length (${metaTitleLen}/60 characters).`;
    } else if (metaTitleLen >= 30 && metaTitleLen <= 70) {
      metaTitlePoints = 3;
      metaTitleStatus = 'warning';
      metaTitleMsg = `${metaTitleLen} chars. Ideal is 50-60 characters.`;
    } else {
      metaTitlePoints = 1;
      metaTitleStatus = 'warning';
      metaTitleMsg = metaTitleLen < 30 
        ? `Too short (${metaTitleLen}/60).` 
        : `Too long (${metaTitleLen}/60). Will be truncated.`;
    }
    
    results.push({
      id: 'meta-title',
      name: 'Meta Title',
      category: 'technical',
      status: metaTitleStatus,
      message: metaTitleMsg,
      points: metaTitlePoints,
      maxPoints: 5,
      icon: <Type className="h-4 w-4" />
    });

    // Meta description (4 pts)
    const metaDescLen = metaDescription.length;
    let metaDescPoints = 0;
    let metaDescStatus: 'pass' | 'warning' | 'fail' = 'fail';
    let metaDescMsg = '';
    
    if (metaDescLen === 0) {
      metaDescMsg = 'Missing meta description. Add one (120-160 characters).';
    } else if (metaDescLen >= 120 && metaDescLen <= 160) {
      metaDescPoints = 4;
      metaDescStatus = 'pass';
      metaDescMsg = `Great length (${metaDescLen}/160 characters).`;
    } else if (metaDescLen >= 80 && metaDescLen <= 180) {
      metaDescPoints = 2;
      metaDescStatus = 'warning';
      metaDescMsg = `${metaDescLen} chars. Ideal is 120-160 characters.`;
    } else {
      metaDescPoints = 1;
      metaDescStatus = 'warning';
      metaDescMsg = metaDescLen < 80 
        ? `Too short (${metaDescLen}/160).` 
        : `Too long (${metaDescLen}/160). Will be truncated.`;
    }
    
    results.push({
      id: 'meta-desc',
      name: 'Meta Description',
      category: 'technical',
      status: metaDescStatus,
      message: metaDescMsg,
      points: metaDescPoints,
      maxPoints: 4,
      icon: <FileText className="h-4 w-4" />
    });

    // Internal links (4 pts)
    results.push({
      id: 'internal-links',
      name: 'Internal Links',
      category: 'technical',
      status: internalLinks >= 2 ? 'pass' : internalLinks >= 1 ? 'warning' : 'fail',
      message: internalLinks >= 2 
        ? `${internalLinks} internal links found.`
        : internalLinks === 1 
          ? '1 internal link. Add more for better navigation.'
          : 'No internal links. Add links to related pages.',
      points: internalLinks >= 2 ? 4 : internalLinks >= 1 ? 2 : 0,
      maxPoints: 4,
      icon: <Link2 className="h-4 w-4" />
    });

    // External/credible links (3 pts)
    results.push({
      id: 'external-links',
      name: 'External Links',
      category: 'technical',
      status: externalLinks >= 1 ? 'pass' : 'warning',
      message: externalLinks >= 1 
        ? `${externalLinks} external link(s) to credible sources.`
        : 'Consider adding links to credible external sources.',
      points: externalLinks >= 1 ? 3 : 1,
      maxPoints: 3,
      icon: <Link2 className="h-4 w-4" />
    });

    // Image alt text (4 pts)
    if (images.total > 0) {
      const allHaveAlt = images.withAlt === images.total;
      const mostHaveAlt = images.withAlt >= images.total * 0.8;
      results.push({
        id: 'image-alt',
        name: 'Image Alt Text',
        category: 'technical',
        status: allHaveAlt ? 'pass' : mostHaveAlt ? 'warning' : 'fail',
        message: allHaveAlt 
          ? 'All images have descriptive alt text.'
          : `${images.total - images.withAlt}/${images.total} images missing alt text.`,
        points: allHaveAlt ? 4 : mostHaveAlt ? 2 : 0,
        maxPoints: 4,
        icon: <Image className="h-4 w-4" />
      });
    } else {
      results.push({
        id: 'image-alt',
        name: 'Images',
        category: 'technical',
        status: 'warning',
        message: 'No images found. Consider adding relevant visuals.',
        points: 2,
        maxPoints: 4,
        icon: <Image className="h-4 w-4" />
      });
    }

    // ============================================
    // CATEGORY 4: Readability & UX (15 pts)
    // ============================================
    
    // Short paragraphs (5 pts)
    results.push({
      id: 'short-paragraphs',
      name: 'Paragraph Length',
      category: 'readability',
      status: paragraphs.longParagraphs === 0 ? 'pass' : 'warning',
      message: paragraphs.longParagraphs === 0 
        ? 'All paragraphs are concise and readable.'
        : `${paragraphs.longParagraphs} paragraphs are too long. Break them up.`,
      points: paragraphs.longParagraphs === 0 ? 5 : 2,
      maxPoints: 5,
      icon: <FileText className="h-4 w-4" />
    });

    // Lists/bullets used (5 pts)
    results.push({
      id: 'lists-used',
      name: 'Lists & Bullets',
      category: 'readability',
      status: lists >= 2 ? 'pass' : lists >= 1 ? 'warning' : 'warning',
      message: lists >= 2 
        ? `${lists} lists used for better scannability.`
        : lists >= 1 
          ? '1 list found. Consider adding more where helpful.'
          : 'No lists found. Use bullets for key points.',
      points: lists >= 2 ? 5 : lists >= 1 ? 3 : 1,
      maxPoints: 5,
      icon: <Layers className="h-4 w-4" />
    });

    // Clear spacing/structure (5 pts) - Based on heading usage and paragraph count
    const hasGoodStructure = headings.h2.length >= 2 && paragraphs.total >= 3;
    results.push({
      id: 'clear-structure',
      name: 'Content Spacing',
      category: 'readability',
      status: hasGoodStructure ? 'pass' : 'warning',
      message: hasGoodStructure 
        ? 'Content has clear sections and spacing.'
        : 'Add more sections and headings for better organization.',
      points: hasGoodStructure ? 5 : 2,
      maxPoints: 5,
      icon: <Eye className="h-4 w-4" />
    });

    // ============================================
    // CATEGORY 5: Trust & Credibility (10 pts)
    // ============================================
    
    // Author/brand attribution (4 pts) - Check for author mentions or brand name
    const hasAuthorSignals = content.toLowerCase().includes('author') || 
                            content.toLowerCase().includes('penulis') ||
                            content.toLowerCase().includes('bungkus') ||
                            content.toLowerCase().includes('ditulis oleh');
    results.push({
      id: 'author-attribution',
      name: 'Author Attribution',
      category: 'trust',
      status: hasAuthorSignals ? 'pass' : 'warning',
      message: hasAuthorSignals 
        ? 'Author or brand attribution present.'
        : 'Consider adding author name or brand attribution.',
      points: hasAuthorSignals ? 4 : 1,
      maxPoints: 4,
      icon: <Shield className="h-4 w-4" />
    });

    // Date signals (3 pts)
    const hasDateSignals = hasCurrentYearReference(plainContent) ||
                          content.toLowerCase().includes('updated') ||
                          content.toLowerCase().includes('diperbarui') ||
                          content.toLowerCase().includes('published');
    results.push({
      id: 'date-signals',
      name: 'Date Signals',
      category: 'trust',
      status: hasDateSignals ? 'pass' : 'warning',
      message: hasDateSignals 
        ? 'Content shows freshness signals.'
        : 'Add publish or update date for credibility.',
      points: hasDateSignals ? 3 : 1,
      maxPoints: 3,
      icon: <Clock className="h-4 w-4" />
    });

    // Schema/structured data hints (3 pts) - This is a recommendation
    results.push({
      id: 'schema-hint',
      name: 'Structured Data',
      category: 'trust',
      status: 'warning',
      message: 'Ensure Article/FAQ schema is added via site settings.',
      points: 2,
      maxPoints: 3,
      icon: <FileCheck className="h-4 w-4" />
    });

    return results;
  }, [title, metaTitle, metaDescription, content, focusKeyword, url]);

  // GEO Checks (Pass/Fail only, no scoring)
  const geoChecks = useMemo<GEOCheck[]>(() => {
    const results: GEOCheck[] = [];
    const plainContent = stripHtml(content);
    const headings = extractHeadings(content);
    const lists = countLists(content);
    const tables = countTables(content);
    const wordCount = countWords(plainContent);

    // ============================================
    // 1. Answer-First Structure
    // ============================================
    
    // Key questions answered immediately after headings
    const h2Count = headings.h2.length;
    const contentSections = content.split(/<h2[^>]*>/gi);
    const hasAnswerFirst = contentSections.length > 1 && contentSections.slice(1).every(section => {
      const firstParagraph = section.match(/<\/h2>(.*?)<(?:p|ul|ol)/si);
      return firstParagraph && countWords(stripHtml(firstParagraph[1] || '')) > 5;
    });
    
    results.push({
      id: 'answer-first',
      name: 'Answers After Headings',
      category: 'answer-first',
      status: h2Count === 0 || hasAnswerFirst ? 'pass' : 'fail',
      message: hasAnswerFirst || h2Count === 0
        ? 'Key information follows headings immediately.'
        : 'Start each section with the key answer, not build-up.',
      icon: <MessageSquare className="h-4 w-4" />
    });

    // Concise definitions
    const hasDefinitions = plainContent.includes(' is ') || 
                          plainContent.includes(' are ') ||
                          plainContent.includes(' adalah ') ||
                          plainContent.includes(' merupakan ');
    results.push({
      id: 'definitions',
      name: 'Explicit Definitions',
      category: 'answer-first',
      status: hasDefinitions ? 'pass' : 'fail',
      message: hasDefinitions 
        ? 'Content includes clear definitions.'
        : 'Add explicit definitions for key terms.',
      icon: <BookOpen className="h-4 w-4" />
    });

    // ============================================
    // 2. Entity Clarity
    // ============================================
    
    // Consistent terminology - Check for brand/product names used consistently
    const hasAmbiguousPronouns_ = hasAmbiguousPronouns(plainContent);
    results.push({
      id: 'entity-clarity',
      name: 'Minimal Ambiguous Pronouns',
      category: 'entity',
      status: !hasAmbiguousPronouns_ ? 'pass' : 'fail',
      message: !hasAmbiguousPronouns_
        ? 'Uses clear entity references, minimal ambiguity.'
        : 'Reduce "this", "that", "it" at sentence starts. Use specific names.',
      icon: <Target className="h-4 w-4" />
    });

    // Full names used
    const usesFullNames = !plainContent.match(/\b(it|they|this|that)\s+(is|are|was|were|has|have)\b/gi) || 
                         (plainContent.match(/\b(it|they|this|that)\s+(is|are|was|were|has|have)\b/gi)?.length || 0) < 5;
    results.push({
      id: 'full-names',
      name: 'Full Entity Names',
      category: 'entity',
      status: usesFullNames ? 'pass' : 'fail',
      message: usesFullNames 
        ? 'Uses full names for tools, brands, and concepts.'
        : 'Replace vague references with full entity names.',
      icon: <Type className="h-4 w-4" />
    });

    // ============================================
    // 3. Extractable Structures
    // ============================================
    
    // Step-by-step lists, frameworks, or tables
    const hasExtractableStructures = lists >= 1 || tables >= 1;
    results.push({
      id: 'extractable',
      name: 'Lists/Tables/Steps',
      category: 'extractable',
      status: hasExtractableStructures ? 'pass' : 'fail',
      message: hasExtractableStructures 
        ? `Content has ${lists} list(s) and ${tables} table(s) for AI extraction.`
        : 'Add step-by-step lists, comparisons, or tables.',
      icon: <Layers className="h-4 w-4" />
    });

    // Standalone sections
    const hasMultipleSections = headings.h2.length >= 2;
    results.push({
      id: 'standalone-sections',
      name: 'Standalone Sections',
      category: 'extractable',
      status: hasMultipleSections ? 'pass' : 'fail',
      message: hasMultipleSections 
        ? 'Content has distinct sections that can stand alone.'
        : 'Structure content so each section can be quoted independently.',
      icon: <FileText className="h-4 w-4" />
    });

    // ============================================
    // 4. Opinionated Authority
    // ============================================
    
    // Clear, confident statements (no excessive hedging)
    const hasExcessiveHedging = hasHedgingLanguage(plainContent);
    results.push({
      id: 'confident-statements',
      name: 'Confident Statements',
      category: 'authority',
      status: !hasExcessiveHedging ? 'pass' : 'fail',
      message: !hasExcessiveHedging 
        ? 'Uses clear, confident language.'
        : 'Reduce hedging words (may, might, could, perhaps).',
      icon: <Quote className="h-4 w-4" />
    });

    // ============================================
    // 5. Freshness & Context
    // ============================================
    
    // References current year
    const hasFreshnessSignals = hasCurrentYearReference(plainContent);
    results.push({
      id: 'freshness',
      name: 'Current Year References',
      category: 'freshness',
      status: hasFreshnessSignals ? 'pass' : 'fail',
      message: hasFreshnessSignals 
        ? 'Content references current timeframe.'
        : 'Add current year or recent industry context.',
      icon: <RefreshCw className="h-4 w-4" />
    });

    // ============================================
    // 6. Source-Worthy Language
    // ============================================
    
    // Professional tone & high information density
    const informationDensity = wordCount > 0 ? (lists + tables + headings.h2.length + headings.h3.length) / (wordCount / 100) : 0;
    const hasHighDensity = informationDensity >= 0.5 || wordCount < 200;
    results.push({
      id: 'info-density',
      name: 'Information Density',
      category: 'source-worthy',
      status: hasHighDensity ? 'pass' : 'fail',
      message: hasHighDensity 
        ? 'Content has high information density, minimal fluff.'
        : 'Increase useful structures (lists, headings) and reduce filler.',
      icon: <FileText className="h-4 w-4" />
    });

    // ============================================
    // 7. Multi-Query Coverage
    // ============================================
    
    // Answers related follow-up questions (has "why" and "how" explanations)
    const questionCoverage = hasQuestionWords(plainContent);
    const answersMultipleQueries = questionCoverage >= 3 || (headings.h2.length >= 3 && wordCount >= 500);
    results.push({
      id: 'multi-query',
      name: 'Follow-up Coverage',
      category: 'multi-query',
      status: answersMultipleQueries ? 'pass' : 'fail',
      message: answersMultipleQueries 
        ? 'Addresses related questions and explains reasoning.'
        : 'Add "why" and "how" explanations for better coverage.',
      icon: <Lightbulb className="h-4 w-4" />
    });

    return results;
  }, [content]);

  // Calculate SEO score
  const seoScore = useMemo(() => {
    const totalPoints = seoChecks.reduce((sum, check) => sum + check.points, 0);
    const maxPoints = seoChecks.reduce((sum, check) => sum + check.maxPoints, 0);
    return maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
  }, [seoChecks]);

  // Calculate category scores
  const categoryScores = useMemo(() => {
    const scores: Record<string, { points: number; maxPoints: number }> = {};
    Object.keys(CATEGORY_INFO).forEach(cat => {
      scores[cat] = { points: 0, maxPoints: 0 };
    });
    seoChecks.forEach(check => {
      scores[check.category].points += check.points;
      scores[check.category].maxPoints += check.maxPoints;
    });
    return scores;
  }, [seoChecks]);

  // GEO readiness
  const geoStats = useMemo(() => {
    const passed = geoChecks.filter(c => c.status === 'pass').length;
    const failed = geoChecks.filter(c => c.status === 'fail').length;
    return { passed, failed, total: geoChecks.length };
  }, [geoChecks]);

  const seoScoreColor = seoScore >= 80 ? 'text-green-600' : seoScore >= 50 ? 'text-yellow-600' : 'text-red-600';
  const seoScoreLabel = seoScore >= 90 ? 'Excellent' : seoScore >= 80 ? 'Strong' : seoScore >= 50 ? 'Needs Work' : 'Poor';
  const progressColor = seoScore >= 80 ? 'bg-green-500' : seoScore >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  const passCount = seoChecks.filter(c => c.status === 'pass').length;
  const warningCount = seoChecks.filter(c => c.status === 'warning').length;
  const failCount = seoChecks.filter(c => c.status === 'fail').length;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'seo' | 'geo')}>
          <div className="flex items-center justify-between mb-3">
            <TabsList className="grid grid-cols-2 w-[200px]">
              <TabsTrigger value="seo" className="text-xs">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                SEO
              </TabsTrigger>
              <TabsTrigger value="geo" className="text-xs">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                GEO
              </TabsTrigger>
            </TabsList>
            {activeTab === 'seo' ? (
              <div className="flex items-center gap-2">
                <span className={cn("text-2xl font-bold", seoScoreColor)}>{seoScore}</span>
                <span className="text-muted-foreground text-sm">/100</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {geoStats.passed}/{geoStats.total} passed
                </span>
              </div>
            )}
          </div>

          <TabsContent value="seo" className="mt-0 space-y-3">
            <div className="space-y-2">
              <Progress value={seoScore} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <span className={cn("font-medium", seoScoreColor)}>{seoScoreLabel}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-3 w-3" /> {passCount}
                  </span>
                  <span className="flex items-center gap-1 text-yellow-600">
                    <AlertCircle className="h-3 w-3" /> {warningCount}
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircle className="h-3 w-3" /> {failCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="grid grid-cols-5 gap-1.5 text-xs">
              {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                const score = categoryScores[key];
                const pct = score.maxPoints > 0 ? Math.round((score.points / score.maxPoints) * 100) : 0;
                const color = pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600';
                return (
                  <div key={key} className="text-center p-1.5 rounded bg-muted/50">
                    <div className={cn("font-bold", color)}>{score.points}/{score.maxPoints}</div>
                    <div className="text-muted-foreground text-[10px] leading-tight truncate" title={info.name}>
                      {info.name.split(' ')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="geo" className="mt-0 space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Readiness Checklist</span>
              </div>
              <Badge variant={geoStats.passed >= geoStats.total * 0.7 ? 'default' : 'secondary'}>
                {geoStats.passed >= geoStats.total * 0.7 ? 'Ready' : 'Needs Work'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              GEO (Generative Engine Optimization) evaluates how well your content can be extracted, quoted, and referenced by AI systems.
            </p>
          </TabsContent>
        </Tabs>
      </CardHeader>

      <CardContent className="pt-0">
        {activeTab === 'seo' ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {Object.entries(CATEGORY_INFO).map(([catKey, catInfo]) => {
              const catChecks = seoChecks.filter(c => c.category === catKey);
              if (catChecks.length === 0) return null;
              
              return (
                <Collapsible key={catKey} defaultOpen={catChecks.some(c => c.status !== 'pass')}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      {catInfo.icon}
                      <span className="font-medium text-sm">{catInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {categoryScores[catKey].points}/{categoryScores[catKey].maxPoints} pts
                      </span>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1.5 pl-2 pt-1">
                    {catChecks
                      .sort((a, b) => {
                        const statusOrder = { fail: 0, warning: 1, pass: 2 };
                        return statusOrder[a.status] - statusOrder[b.status];
                      })
                      .map((check) => (
                        <div 
                          key={check.id}
                          className={cn(
                            "flex items-start gap-2 p-2 rounded-lg border text-sm",
                            check.status === 'pass' && "bg-green-50/50 border-green-200/50 dark:bg-green-950/20 dark:border-green-900/30",
                            check.status === 'warning' && "bg-yellow-50/50 border-yellow-200/50 dark:bg-yellow-950/20 dark:border-yellow-900/30",
                            check.status === 'fail' && "bg-red-50/50 border-red-200/50 dark:bg-red-950/20 dark:border-red-900/30"
                          )}
                        >
                          <div className={cn(
                            "mt-0.5 shrink-0",
                            check.status === 'pass' && "text-green-600",
                            check.status === 'warning' && "text-yellow-600",
                            check.status === 'fail' && "text-red-600"
                          )}>
                            {check.status === 'pass' && <CheckCircle2 className="h-3.5 w-3.5" />}
                            {check.status === 'warning' && <AlertCircle className="h-3.5 w-3.5" />}
                            {check.status === 'fail' && <XCircle className="h-3.5 w-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-xs">{check.name}</span>
                              <Badge variant="outline" className="text-[9px] px-1 py-0">
                                {check.points}/{check.maxPoints}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{check.message}</p>
                          </div>
                        </div>
                      ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {Object.entries(GEO_CATEGORY_INFO).map(([catKey, catInfo]) => {
              const catChecks = geoChecks.filter(c => c.category === catKey);
              if (catChecks.length === 0) return null;
              
              const allPassed = catChecks.every(c => c.status === 'pass');
              
              return (
                <Collapsible key={catKey} defaultOpen={!allPassed}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      {catInfo.icon}
                      <span className="font-medium text-sm">{catInfo.name}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px]",
                        allPassed ? "border-green-300 text-green-700 dark:border-green-800 dark:text-green-400" : "border-red-300 text-red-700 dark:border-red-800 dark:text-red-400"
                      )}
                    >
                      {allPassed ? 'Pass' : 'Fail'}
                    </Badge>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1.5 pl-2 pt-1">
                    {catChecks.map((check) => (
                      <div 
                        key={check.id}
                        className={cn(
                          "flex items-start gap-2 p-2 rounded-lg border text-sm",
                          check.status === 'pass' && "bg-green-50/50 border-green-200/50 dark:bg-green-950/20 dark:border-green-900/30",
                          check.status === 'fail' && "bg-red-50/50 border-red-200/50 dark:bg-red-950/20 dark:border-red-900/30"
                        )}
                      >
                        <div className={cn(
                          "mt-0.5 shrink-0",
                          check.status === 'pass' && "text-green-600",
                          check.status === 'fail' && "text-red-600"
                        )}>
                          {check.status === 'pass' && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {check.status === 'fail' && <XCircle className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-xs">{check.name}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{check.message}</p>
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
