import { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Type, 
  Layout, 
  MousePointerClick,
  Star,
  Video,
  HelpCircle,
  Grid3X3,
  ChevronDown,
  ChevronUp,
  Table as TableIcon,
  RowsIcon,
  ColumnsIcon
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ImageUploader from './ImageUploader';
import RichTextEditor from './RichTextEditor';
import { cn } from '@/lib/utils';
import { useSiteSetting } from '@/hooks/useSiteSettings';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type BlockType = 'hero' | 'text' | 'table' | 'image_gallery' | 'cta' | 'features' | 'testimonial' | 'video' | 'faq' | 'pricing_table' | 'team_members' | 'stats_counter' | 'contact_form';

export interface ContentBlock {
  id: string;
  type: BlockType;
  data: Record<string, any>;
}

interface ContentBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  language?: 'en' | 'id';
}

const blockTypeConfig: Record<BlockType, { 
  icon: React.ElementType; 
  label: { en: string; id: string }; 
  description: { en: string; id: string };
}> = {
  hero: { 
    icon: Layout, 
    label: { en: 'Hero Section', id: 'Bagian Hero' },
    description: { en: 'Full-width banner with title, subtitle and buttons', id: 'Banner lebar penuh dengan judul, subjudul dan tombol' }
  },
  text: { 
    icon: Type, 
    label: { en: 'Text Content', id: 'Konten Teks' },
    description: { en: 'Rich text content block', id: 'Blok konten teks kaya' }
  },
  table: { 
    icon: TableIcon, 
    label: { en: 'Table', id: 'Tabel' },
    description: { en: 'Editable table with headers', id: 'Tabel yang dapat diedit dengan header' }
  },
  image_gallery: { 
    icon: Grid3X3, 
    label: { en: 'Image Gallery', id: 'Galeri Gambar' },
    description: { en: 'Grid of images', id: 'Grid gambar' }
  },
  cta: { 
    icon: MousePointerClick, 
    label: { en: 'Call to Action', id: 'Ajakan Bertindak' },
    description: { en: 'Prominent call to action section', id: 'Bagian ajakan bertindak yang menonjol' }
  },
  features: { 
    icon: Star, 
    label: { en: 'Features Grid', id: 'Grid Fitur' },
    description: { en: 'Grid of features with icons', id: 'Grid fitur dengan ikon' }
  },
  testimonial: { 
    icon: Star, 
    label: { en: 'Testimonial', id: 'Testimoni' },
    description: { en: 'Customer testimonial quote', id: 'Kutipan testimoni pelanggan' }
  },
  video: { 
    icon: Video, 
    label: { en: 'Video', id: 'Video' },
    description: { en: 'YouTube or embedded video', id: 'YouTube atau video tersemat' }
  },
  faq: { 
    icon: HelpCircle, 
    label: { en: 'FAQ', id: 'FAQ' },
    description: { en: 'Frequently asked questions', id: 'Pertanyaan yang sering diajukan' }
  },
  pricing_table: { 
    icon: Grid3X3, 
    label: { en: 'Pricing Table', id: 'Tabel Harga' },
    description: { en: 'Pricing plans comparison table', id: 'Tabel perbandingan paket harga' }
  },
  team_members: { 
    icon: Star, 
    label: { en: 'Team Members', id: 'Anggota Tim' },
    description: { en: 'Team member cards with photos', id: 'Kartu anggota tim dengan foto' }
  },
  stats_counter: { 
    icon: Grid3X3, 
    label: { en: 'Stats Counter', id: 'Penghitung Statistik' },
    description: { en: 'Animated statistics display', id: 'Tampilan statistik animasi' }
  },
  contact_form: { 
    icon: Type, 
    label: { en: 'Contact Form', id: 'Formulir Kontak' },
    description: { en: 'Contact form with fields', id: 'Formulir kontak dengan bidang' }
  },
};

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function getDefaultBlockData(type: BlockType): Record<string, any> {
  switch (type) {
    case 'hero':
      return { title: '', subtitle: '', background_image: '', primary_button_text: '', primary_button_link: '', secondary_button_text: '', secondary_button_link: '' };
    case 'text':
      return { content: '' };
    case 'table':
      return { headerType: 'both', rows: [['', '', ''], ['', '', ''], ['', '', '']] };
    case 'image_gallery':
      return { images: [], layout: 'grid' };
    case 'cta':
      return { 
        use_defaults: true, 
        title: '', 
        subtitle: '', 
        primary_button_text: '', 
        primary_button_link: '', 
        secondary_button_text: '', 
        secondary_button_link: '' 
      };
    case 'features':
      return { items: [] };
    case 'testimonial':
      return { quote: '', author_name: '', author_title: '', author_image: '' };
    case 'video':
      return { youtube_url: '' };
    case 'faq':
      return { items: [] };
    case 'pricing_table':
      return { plans: [] };
    case 'team_members':
      return { members: [] };
    case 'stats_counter':
      return { stats: [] };
    case 'contact_form':
      return { title: '', description: '', email_to: '', fields: ['name', 'email', 'message'] };
    default:
      return {};
  }
}

interface SortableBlockProps {
  block: ContentBlock;
  children: React.ReactNode;
  onDelete: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function SortableBlock({ block, children, onDelete, isExpanded, onToggleExpand }: SortableBlockProps) {
  const { language } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const config = blockTypeConfig[block.type];
  const Icon = config.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border rounded-lg bg-background",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="cursor-grab hover:bg-muted p-1 rounded"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-medium">{config.label[language as 'en' | 'id']}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={onToggleExpand}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      {isExpanded && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
}

// Block-specific editors
function HeroBlockEditor({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void }) {
  const { language } = useLanguage();
  return (
    <div className="space-y-4">
      <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
        <p className="text-xs text-muted-foreground">
          {language === 'en' 
            ? '💡 Hero Section is for the main banner area only. For page headings, use a Text Block with H1/H2/H3 formatting.' 
            : '💡 Bagian Hero hanya untuk area banner utama. Untuk heading halaman, gunakan Blok Teks dengan format H1/H2/H3.'}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{language === 'en' ? 'Hero Headline' : 'Judul Hero'}</Label>
          <Input 
            value={data.title || ''} 
            onChange={(e) => onChange({ ...data, title: e.target.value })} 
            placeholder={language === 'en' ? 'Main banner text' : 'Teks banner utama'}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {language === 'en' ? 'Large text displayed on the banner' : 'Teks besar ditampilkan di banner'}
          </p>
        </div>
        <div>
          <Label>{language === 'en' ? 'Hero Tagline' : 'Tagline Hero'}</Label>
          <Input 
            value={data.subtitle || ''} 
            onChange={(e) => onChange({ ...data, subtitle: e.target.value })} 
            placeholder={language === 'en' ? 'Supporting text' : 'Teks pendukung'}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {language === 'en' ? 'Smaller text below the headline' : 'Teks kecil di bawah judul'}
          </p>
        </div>
      </div>
      <div>
        <Label>{language === 'en' ? 'Background Image' : 'Gambar Latar'}</Label>
        <ImageUploader value={data.background_image || ''} onChange={(url) => onChange({ ...data, background_image: url })} folder="blocks" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{language === 'en' ? 'Primary Button Text' : 'Teks Tombol Utama'}</Label>
          <Input value={data.primary_button_text || ''} onChange={(e) => onChange({ ...data, primary_button_text: e.target.value })} />
        </div>
        <div>
          <Label>{language === 'en' ? 'Primary Button Link' : 'Link Tombol Utama'}</Label>
          <Input value={data.primary_button_link || ''} onChange={(e) => onChange({ ...data, primary_button_link: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{language === 'en' ? 'Secondary Button Text' : 'Teks Tombol Sekunder'}</Label>
          <Input value={data.secondary_button_text || ''} onChange={(e) => onChange({ ...data, secondary_button_text: e.target.value })} />
        </div>
        <div>
          <Label>{language === 'en' ? 'Secondary Button Link' : 'Link Tombol Sekunder'}</Label>
          <Input value={data.secondary_button_link || ''} onChange={(e) => onChange({ ...data, secondary_button_link: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function TextBlockEditor({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void }) {
  return (
    <RichTextEditor value={data.content || ''} onChange={(content) => onChange({ ...data, content })} />
  );
}

function ImageGalleryBlockEditor({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void }) {
  const { language } = useLanguage();
  const images = data.images || [];
  
  const addImage = () => {
    onChange({ ...data, images: [...images, ''] });
  };
  
  const updateImage = (index: number, url: string) => {
    const newImages = [...images];
    newImages[index] = url;
    onChange({ ...data, images: newImages });
  };
  
  const removeImage = (index: number) => {
    const newImages = images.filter((_: string, i: number) => i !== index);
    onChange({ ...data, images: newImages });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{language === 'en' ? 'Layout' : 'Tata Letak'}</Label>
        <Select value={data.layout || 'grid'} onValueChange={(value) => onChange({ ...data, layout: value })}>
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
            <SelectItem value="masonry">Masonry</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <Label>{language === 'en' ? 'Images' : 'Gambar'}</Label>
        {images.map((img: string, idx: number) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="flex-1">
              <ImageUploader value={img} onChange={(url) => updateImage(idx, url)} folder="gallery" />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(idx)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addImage}>
          <Plus className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Add Image' : 'Tambah Gambar'}
        </Button>
      </div>
    </div>
  );
}

function CTABlockEditor({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void }) {
  const { language, t } = useLanguage();
  const { data: ctaDefaults } = useSiteSetting('cta_defaults');
  const defaults = ctaDefaults?.value || {};
  
  const useDefaults = data.use_defaults !== false;

  return (
    <div className="space-y-4">
      {/* Toggle for using defaults */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
        <div>
          <Label className="font-medium">
            {language === 'en' ? 'Use Website Default CTA' : 'Gunakan CTA Default Website'}
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            {language === 'en' 
              ? 'Pull button content from global CTA settings. Leave fields empty to use defaults.' 
              : 'Ambil konten tombol dari pengaturan CTA global. Kosongkan field untuk menggunakan default.'}
          </p>
        </div>
        <Switch 
          checked={useDefaults} 
          onCheckedChange={(checked) => onChange({ ...data, use_defaults: checked })} 
        />
      </div>

      {/* Show preview of defaults when enabled */}
      {useDefaults && defaults.primary_button_text_id && (
        <div className="p-4 border rounded-lg bg-muted/30 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {language === 'en' ? 'Default values (from Website Settings):' : 'Nilai default (dari Pengaturan Website):'}
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">{language === 'en' ? 'Primary:' : 'Utama:'}</span>{' '}
              <span className="font-medium">{t(defaults.primary_button_text_id, defaults.primary_button_text_en)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{language === 'en' ? 'Secondary:' : 'Sekunder:'}</span>{' '}
              <span className="font-medium">{t(defaults.secondary_button_text_id, defaults.secondary_button_text_en)}</span>
            </div>
          </div>
        </div>
      )}

      <div>
        <Label>{language === 'en' ? 'Title' : 'Judul'}</Label>
        <Input 
          value={data.title || ''} 
          onChange={(e) => onChange({ ...data, title: e.target.value })} 
          placeholder={useDefaults ? (language === 'en' ? 'Leave empty for default' : 'Kosongkan untuk default') : ''}
        />
      </div>
      <div>
        <Label>{language === 'en' ? 'Subtitle / Description' : 'Subjudul / Deskripsi'}</Label>
        <Textarea 
          value={data.subtitle || ''} 
          onChange={(e) => onChange({ ...data, subtitle: e.target.value })} 
          rows={2}
          placeholder={useDefaults ? (language === 'en' ? 'Leave empty for default' : 'Kosongkan untuk default') : ''}
        />
      </div>

      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-3">{language === 'en' ? 'Primary Button' : 'Tombol Utama'}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{language === 'en' ? 'Text' : 'Teks'}</Label>
            <Input 
              value={data.primary_button_text || ''} 
              onChange={(e) => onChange({ ...data, primary_button_text: e.target.value })}
              placeholder={useDefaults ? t(defaults.primary_button_text_id, defaults.primary_button_text_en) || '' : ''}
            />
          </div>
          <div>
            <Label>{language === 'en' ? 'Link' : 'Link'}</Label>
            <Input 
              value={data.primary_button_link || ''} 
              onChange={(e) => onChange({ ...data, primary_button_link: e.target.value })}
              placeholder={useDefaults ? defaults.primary_button_link || '' : ''}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-3">{language === 'en' ? 'Secondary Button' : 'Tombol Sekunder'}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{language === 'en' ? 'Text' : 'Teks'}</Label>
            <Input 
              value={data.secondary_button_text || ''} 
              onChange={(e) => onChange({ ...data, secondary_button_text: e.target.value })}
              placeholder={useDefaults ? t(defaults.secondary_button_text_id, defaults.secondary_button_text_en) || '' : ''}
            />
          </div>
          <div>
            <Label>{language === 'en' ? 'Link' : 'Link'}</Label>
            <Input 
              value={data.secondary_button_link || ''} 
              onChange={(e) => onChange({ ...data, secondary_button_link: e.target.value })}
              placeholder={useDefaults ? defaults.secondary_button_link || '' : ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturesBlockEditor({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void }) {
  const { language } = useLanguage();
  const items = data.items || [];
  
  const addItem = () => {
    onChange({ ...data, items: [...items, { icon: '', title: '', description: '' }] });
  };
  
  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, items: newItems });
  };
  
  const removeItem = (index: number) => {
    const newItems = items.filter((_: any, i: number) => i !== index);
    onChange({ ...data, items: newItems });
  };

  return (
    <div className="space-y-4">
      {items.map((item: any, idx: number) => (
        <div key={idx} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{language === 'en' ? 'Feature' : 'Fitur'} {idx + 1}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>{language === 'en' ? 'Icon (Lucide name)' : 'Ikon (nama Lucide)'}</Label>
              <Input value={item.icon || ''} onChange={(e) => updateItem(idx, 'icon', e.target.value)} placeholder="Star, Shield, Zap..." />
            </div>
            <div>
              <Label>{language === 'en' ? 'Title' : 'Judul'}</Label>
              <Input value={item.title || ''} onChange={(e) => updateItem(idx, 'title', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>{language === 'en' ? 'Description' : 'Deskripsi'}</Label>
            <Textarea value={item.description || ''} onChange={(e) => updateItem(idx, 'description', e.target.value)} rows={2} />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="h-4 w-4 mr-2" />
        {language === 'en' ? 'Add Feature' : 'Tambah Fitur'}
      </Button>
    </div>
  );
}

function TestimonialBlockEditor({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void }) {
  const { language } = useLanguage();
  return (
    <div className="space-y-4">
      <div>
        <Label>{language === 'en' ? 'Quote' : 'Kutipan'}</Label>
        <Textarea value={data.quote || ''} onChange={(e) => onChange({ ...data, quote: e.target.value })} rows={3} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{language === 'en' ? 'Author Name' : 'Nama Penulis'}</Label>
          <Input value={data.author_name || ''} onChange={(e) => onChange({ ...data, author_name: e.target.value })} />
        </div>
        <div>
          <Label>{language === 'en' ? 'Author Title/Position' : 'Jabatan Penulis'}</Label>
          <Input value={data.author_title || ''} onChange={(e) => onChange({ ...data, author_title: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>{language === 'en' ? 'Author Image' : 'Foto Penulis'}</Label>
        <ImageUploader value={data.author_image || ''} onChange={(url) => onChange({ ...data, author_image: url })} folder="testimonials" />
      </div>
    </div>
  );
}

function VideoBlockEditor({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void }) {
  const { language } = useLanguage();
  return (
    <div className="space-y-4">
      <div>
        <Label>{language === 'en' ? 'YouTube URL' : 'URL YouTube'}</Label>
        <Input value={data.youtube_url || ''} onChange={(e) => onChange({ ...data, youtube_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
        <p className="text-xs text-muted-foreground mt-1">
          {language === 'en' ? 'Paste the full YouTube video URL' : 'Tempel URL lengkap video YouTube'}
        </p>
      </div>
    </div>
  );
}

function FAQBlockEditor({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void }) {
  const { language } = useLanguage();
  const items = data.items || [];
  
  const addItem = () => {
    onChange({ ...data, items: [...items, { question: '', answer: '' }] });
  };
  
  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, items: newItems });
  };
  
  const removeItem = (index: number) => {
    const newItems = items.filter((_: any, i: number) => i !== index);
    onChange({ ...data, items: newItems });
  };

  return (
    <div className="space-y-4">
      {items.map((item: any, idx: number) => (
        <div key={idx} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{language === 'en' ? 'Question' : 'Pertanyaan'} {idx + 1}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <div>
            <Label>{language === 'en' ? 'Question' : 'Pertanyaan'}</Label>
            <Input value={item.question || ''} onChange={(e) => updateItem(idx, 'question', e.target.value)} />
          </div>
          <div>
            <Label>{language === 'en' ? 'Answer' : 'Jawaban'}</Label>
            <Textarea value={item.answer || ''} onChange={(e) => updateItem(idx, 'answer', e.target.value)} rows={3} />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="h-4 w-4 mr-2" />
        {language === 'en' ? 'Add FAQ Item' : 'Tambah Item FAQ'}
      </Button>
    </div>
  );
}

function PricingTableBlockEditor({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void }) {
  const { language } = useLanguage();
  const plans = data.plans || [];
  
  const addPlan = () => {
    onChange({ ...data, plans: [...plans, { name: '', price: '', period: '/month', features: [], is_popular: false, button_text: '', button_link: '' }] });
  };
  
  const updatePlan = (index: number, field: string, value: any) => {
    const newPlans = [...plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    onChange({ ...data, plans: newPlans });
  };
  
  const removePlan = (index: number) => {
    const newPlans = plans.filter((_: any, i: number) => i !== index);
    onChange({ ...data, plans: newPlans });
  };

  return (
    <div className="space-y-4">
      {plans.map((plan: any, idx: number) => (
        <div key={idx} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{language === 'en' ? 'Plan' : 'Paket'} {idx + 1}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => removePlan(idx)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>{language === 'en' ? 'Plan Name' : 'Nama Paket'}</Label>
              <Input value={plan.name || ''} onChange={(e) => updatePlan(idx, 'name', e.target.value)} placeholder="Basic, Pro, Enterprise..." />
            </div>
            <div>
              <Label>{language === 'en' ? 'Price' : 'Harga'}</Label>
              <Input value={plan.price || ''} onChange={(e) => updatePlan(idx, 'price', e.target.value)} placeholder="$99, Rp500.000..." />
            </div>
            <div>
              <Label>{language === 'en' ? 'Period' : 'Periode'}</Label>
              <Input value={plan.period || ''} onChange={(e) => updatePlan(idx, 'period', e.target.value)} placeholder="/month, /year..." />
            </div>
          </div>
          <div>
            <Label>{language === 'en' ? 'Features (one per line)' : 'Fitur (satu per baris)'}</Label>
            <Textarea 
              value={(plan.features || []).join('\n')} 
              onChange={(e) => updatePlan(idx, 'features', e.target.value.split('\n').filter(Boolean))} 
              rows={4} 
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>{language === 'en' ? 'Button Text' : 'Teks Tombol'}</Label>
              <Input value={plan.button_text || ''} onChange={(e) => updatePlan(idx, 'button_text', e.target.value)} />
            </div>
            <div>
              <Label>{language === 'en' ? 'Button Link' : 'Link Tombol'}</Label>
              <Input value={plan.button_link || ''} onChange={(e) => updatePlan(idx, 'button_link', e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={plan.is_popular || false}
              onChange={(e) => updatePlan(idx, 'is_popular', e.target.checked)}
              className="h-4 w-4"
            />
            <Label>{language === 'en' ? 'Mark as Popular/Recommended' : 'Tandai sebagai Populer/Direkomendasikan'}</Label>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addPlan}>
        <Plus className="h-4 w-4 mr-2" />
        {language === 'en' ? 'Add Pricing Plan' : 'Tambah Paket Harga'}
      </Button>
    </div>
  );
}

function TeamMembersBlockEditor({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void }) {
  const { language } = useLanguage();
  const members = data.members || [];
  
  const addMember = () => {
    onChange({ ...data, members: [...members, { name: '', role: '', image: '', bio: '', social_links: [] }] });
  };
  
  const updateMember = (index: number, field: string, value: any) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    onChange({ ...data, members: newMembers });
  };
  
  const removeMember = (index: number) => {
    const newMembers = members.filter((_: any, i: number) => i !== index);
    onChange({ ...data, members: newMembers });
  };

  return (
    <div className="space-y-4">
      {members.map((member: any, idx: number) => (
        <div key={idx} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{language === 'en' ? 'Team Member' : 'Anggota Tim'} {idx + 1}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeMember(idx)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>{language === 'en' ? 'Name' : 'Nama'}</Label>
              <Input value={member.name || ''} onChange={(e) => updateMember(idx, 'name', e.target.value)} />
            </div>
            <div>
              <Label>{language === 'en' ? 'Role/Position' : 'Jabatan'}</Label>
              <Input value={member.role || ''} onChange={(e) => updateMember(idx, 'role', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>{language === 'en' ? 'Photo' : 'Foto'}</Label>
            <ImageUploader value={member.image || ''} onChange={(url) => updateMember(idx, 'image', url)} folder="team" />
          </div>
          <div>
            <Label>{language === 'en' ? 'Bio' : 'Bio'}</Label>
            <Textarea value={member.bio || ''} onChange={(e) => updateMember(idx, 'bio', e.target.value)} rows={2} />
          </div>
          <div>
            <Label>{language === 'en' ? 'LinkedIn URL' : 'URL LinkedIn'}</Label>
            <Input value={member.linkedin || ''} onChange={(e) => updateMember(idx, 'linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addMember}>
        <Plus className="h-4 w-4 mr-2" />
        {language === 'en' ? 'Add Team Member' : 'Tambah Anggota Tim'}
      </Button>
    </div>
  );
}

function StatsCounterBlockEditor({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void }) {
  const { language } = useLanguage();
  const stats = data.stats || [];
  
  const addStat = () => {
    onChange({ ...data, stats: [...stats, { value: '', label: '', prefix: '', suffix: '' }] });
  };
  
  const updateStat = (index: number, field: string, value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    onChange({ ...data, stats: newStats });
  };
  
  const removeStat = (index: number) => {
    const newStats = stats.filter((_: any, i: number) => i !== index);
    onChange({ ...data, stats: newStats });
  };

  return (
    <div className="space-y-4">
      {stats.map((stat: any, idx: number) => (
        <div key={idx} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{language === 'en' ? 'Stat' : 'Statistik'} {idx + 1}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeStat(idx)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label>{language === 'en' ? 'Prefix' : 'Awalan'}</Label>
              <Input value={stat.prefix || ''} onChange={(e) => updateStat(idx, 'prefix', e.target.value)} placeholder="$, Rp, +..." />
            </div>
            <div>
              <Label>{language === 'en' ? 'Value' : 'Nilai'}</Label>
              <Input value={stat.value || ''} onChange={(e) => updateStat(idx, 'value', e.target.value)} placeholder="1000, 50, 99..." />
            </div>
            <div>
              <Label>{language === 'en' ? 'Suffix' : 'Akhiran'}</Label>
              <Input value={stat.suffix || ''} onChange={(e) => updateStat(idx, 'suffix', e.target.value)} placeholder="+, %, K..." />
            </div>
            <div>
              <Label>{language === 'en' ? 'Label' : 'Label'}</Label>
              <Input value={stat.label || ''} onChange={(e) => updateStat(idx, 'label', e.target.value)} placeholder="Customers, Projects..." />
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addStat}>
        <Plus className="h-4 w-4 mr-2" />
        {language === 'en' ? 'Add Stat' : 'Tambah Statistik'}
      </Button>
    </div>
  );
}

function ContactFormBlockEditor({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void }) {
  const { language } = useLanguage();
  const fields = data.fields || ['name', 'email', 'message'];
  
  const availableFields = ['name', 'email', 'phone', 'company', 'subject', 'message'];

  return (
    <div className="space-y-4">
      <div>
        <Label>{language === 'en' ? 'Form Title' : 'Judul Formulir'}</Label>
        <Input value={data.title || ''} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      </div>
      <div>
        <Label>{language === 'en' ? 'Description' : 'Deskripsi'}</Label>
        <Textarea value={data.description || ''} onChange={(e) => onChange({ ...data, description: e.target.value })} rows={2} />
      </div>
      <div>
        <Label>{language === 'en' ? 'Send To Email' : 'Kirim ke Email'}</Label>
        <Input value={data.email_to || ''} onChange={(e) => onChange({ ...data, email_to: e.target.value })} placeholder="contact@example.com" />
      </div>
      <div>
        <Label>{language === 'en' ? 'Form Fields' : 'Bidang Formulir'}</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {availableFields.map((field) => (
            <label key={field} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted">
              <input
                type="checkbox"
                checked={fields.includes(field)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange({ ...data, fields: [...fields, field] });
                  } else {
                    onChange({ ...data, fields: fields.filter((f: string) => f !== field) });
                  }
                }}
                className="h-4 w-4"
              />
              <span className="capitalize">{field}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label>{language === 'en' ? 'Submit Button Text' : 'Teks Tombol Kirim'}</Label>
        <Input value={data.button_text || ''} onChange={(e) => onChange({ ...data, button_text: e.target.value })} placeholder="Send Message" />
      </div>
    </div>
  );
}

// Table Block Editor with header toggle, add/remove rows/columns, rich text cells
function TableBlockEditor({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void }) {
  const { language } = useLanguage();
  const rows: string[][] = data.rows || [['', '', ''], ['', '', ''], ['', '', '']];
  const headerType: 'row' | 'column' | 'both' | 'none' = data.headerType || 'both';

  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    const newRows = rows.map((row, ri) =>
      ri === rowIdx ? row.map((cell, ci) => (ci === colIdx ? value : cell)) : [...row]
    );
    onChange({ ...data, rows: newRows });
  };

  const addRow = () => {
    const colCount = rows[0]?.length || 3;
    const newRow = Array(colCount).fill('');
    onChange({ ...data, rows: [...rows, newRow] });
  };

  const removeRow = (idx: number) => {
    if (rows.length <= 1) return;
    onChange({ ...data, rows: rows.filter((_, i) => i !== idx) });
  };

  const addColumn = () => {
    const newRows = rows.map(row => [...row, '']);
    onChange({ ...data, rows: newRows });
  };

  const removeColumn = (colIdx: number) => {
    if ((rows[0]?.length || 0) <= 1) return;
    const newRows = rows.map(row => row.filter((_, ci) => ci !== colIdx));
    onChange({ ...data, rows: newRows });
  };

  const isHeaderCell = (rowIdx: number, colIdx: number) => {
    if (headerType === 'both') return rowIdx === 0 || colIdx === 0;
    if (headerType === 'row') return rowIdx === 0;
    if (headerType === 'column') return colIdx === 0;
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Header Type Selector */}
      <div>
        <Label>{language === 'en' ? 'Header Type' : 'Tipe Header'}</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {(['both', 'row', 'column', 'none'] as const).map((type) => (
            <Button
              key={type}
              type="button"
              variant={headerType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange({ ...data, headerType: type })}
            >
              {type === 'both' && (language === 'en' ? 'Both Row & Column' : 'Baris & Kolom')}
              {type === 'row' && (language === 'en' ? 'First Row' : 'Baris Pertama')}
              {type === 'column' && (language === 'en' ? 'First Column' : 'Kolom Pertama')}
              {type === 'none' && (language === 'en' ? 'No Headers' : 'Tanpa Header')}
            </Button>
          ))}
        </div>
      </div>

      {/* Table Editor */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full border-collapse">
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, colIdx) => {
                  const isHeader = isHeaderCell(rowIdx, colIdx);
                  return (
                    <td
                      key={colIdx}
                      className={cn(
                        "border p-0 min-w-[120px] relative",
                        isHeader && "bg-muted"
                      )}
                    >
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className={cn(
                          "min-h-[40px] p-2 focus:outline-none focus:ring-2 focus:ring-primary/50",
                          isHeader && "font-semibold"
                        )}
                        dangerouslySetInnerHTML={{ __html: cell }}
                        onBlur={(e) => updateCell(rowIdx, colIdx, e.currentTarget.innerHTML)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                          // Stop propagation for all keys to prevent dnd-kit interference
                          e.stopPropagation();
                        }}
                      />
                    </td>
                  );
                })}
                {/* Remove Row Button */}
                <td className="border-0 p-1 w-8">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeRow(rowIdx)}
                    disabled={rows.length <= 1}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {/* Remove Column Buttons Row */}
            <tr>
              {rows[0]?.map((_, colIdx) => (
                <td key={colIdx} className="border-0 p-1 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeColumn(colIdx)}
                    disabled={(rows[0]?.length || 0) <= 1}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </td>
              ))}
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add Row/Column Buttons */}
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <RowsIcon className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Add Row' : 'Tambah Baris'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addColumn}>
          <ColumnsIcon className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Add Column' : 'Tambah Kolom'}
        </Button>
      </div>
    </div>
  );
}

function BlockEditor({ block, onChange }: { block: ContentBlock; onChange: (data: Record<string, any>) => void }) {
  switch (block.type) {
    case 'hero':
      return <HeroBlockEditor data={block.data} onChange={onChange} />;
    case 'text':
      return <TextBlockEditor data={block.data} onChange={onChange} />;
    case 'table':
      return <TableBlockEditor data={block.data} onChange={onChange} />;
    case 'image_gallery':
      return <ImageGalleryBlockEditor data={block.data} onChange={onChange} />;
    case 'cta':
      return <CTABlockEditor data={block.data} onChange={onChange} />;
    case 'features':
      return <FeaturesBlockEditor data={block.data} onChange={onChange} />;
    case 'testimonial':
      return <TestimonialBlockEditor data={block.data} onChange={onChange} />;
    case 'video':
      return <VideoBlockEditor data={block.data} onChange={onChange} />;
    case 'faq':
      return <FAQBlockEditor data={block.data} onChange={onChange} />;
    case 'pricing_table':
      return <PricingTableBlockEditor data={block.data} onChange={onChange} />;
    case 'team_members':
      return <TeamMembersBlockEditor data={block.data} onChange={onChange} />;
    case 'stats_counter':
      return <StatsCounterBlockEditor data={block.data} onChange={onChange} />;
    case 'contact_form':
      return <ContactFormBlockEditor data={block.data} onChange={onChange} />;
    default:
      return null;
  }
}

export default function ContentBlockEditor({ blocks, onChange }: ContentBlockEditorProps) {
  const { language } = useLanguage();
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTableSizeDialog, setShowTableSizeDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Only use PointerSensor - remove KeyboardSensor to prevent conflicts with rich text editing
  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      onChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const addBlock = (type: BlockType) => {
    if (type === 'table') {
      setShowTableSizeDialog(true);
      setShowAddMenu(false);
      return;
    }
    
    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      data: getDefaultBlockData(type),
    };
    onChange([...blocks, newBlock]);
    setExpandedBlocks(prev => new Set([...prev, newBlock.id]));
    setShowAddMenu(false);
  };

  const addTableBlock = () => {
    const rows = Array(tableRows).fill(null).map(() => Array(tableCols).fill(''));
    const newBlock: ContentBlock = {
      id: generateId(),
      type: 'table',
      data: { headerType: 'both', rows },
    };
    onChange([...blocks, newBlock]);
    setExpandedBlocks(prev => new Set([...prev, newBlock.id]));
    setShowTableSizeDialog(false);
    setTableRows(3);
    setTableCols(3);
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
    setExpandedBlocks(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const updateBlockData = (id: string, data: Record<string, any>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, data } : b)));
  };

  const toggleExpand = (id: string) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                onDelete={() => deleteBlock(block.id)}
                isExpanded={expandedBlocks.has(block.id)}
                onToggleExpand={() => toggleExpand(block.id)}
              >
                <BlockEditor
                  block={block}
                  onChange={(data) => updateBlockData(block.id, data)}
                />
              </SortableBlock>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{language === 'en' ? 'No content blocks yet' : 'Belum ada blok konten'}</p>
          <p className="text-sm">{language === 'en' ? 'Click the button below to add your first block' : 'Klik tombol di bawah untuk menambahkan blok pertama'}</p>
        </div>
      )}

      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setShowAddMenu(!showAddMenu)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Add Content Block' : 'Tambah Blok Konten'}
        </Button>

        {showAddMenu && (
          <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg">
            <CardContent className="p-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(Object.keys(blockTypeConfig) as BlockType[]).map((type) => {
                  const config = blockTypeConfig[type];
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addBlock(type)}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-muted transition-colors text-center"
                    >
                      <Icon className="h-6 w-6 text-primary" />
                      <span className="text-sm font-medium">{config.label[language as 'en' | 'id']}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Table Size Dialog */}
      <Dialog open={showTableSizeDialog} onOpenChange={setShowTableSizeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Table Size' : 'Ukuran Tabel'}</DialogTitle>
            <DialogDescription>
              {language === 'en' ? 'Choose the number of rows and columns for your table.' : 'Pilih jumlah baris dan kolom untuk tabel Anda.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="table-rows">{language === 'en' ? 'Rows' : 'Baris'}</Label>
              <Input
                id="table-rows"
                type="number"
                min={1}
                max={20}
                value={tableRows}
                onChange={(e) => setTableRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              />
            </div>
            <div>
              <Label htmlFor="table-cols">{language === 'en' ? 'Columns' : 'Kolom'}</Label>
              <Input
                id="table-cols"
                type="number"
                min={1}
                max={10}
                value={tableCols}
                onChange={(e) => setTableCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTableSizeDialog(false)}>
              {language === 'en' ? 'Cancel' : 'Batal'}
            </Button>
            <Button onClick={addTableBlock}>
              {language === 'en' ? 'Create Table' : 'Buat Tabel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}