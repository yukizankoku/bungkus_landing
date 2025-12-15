import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon, Loader2, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
}

export default function ImageUploader({ value, onChange, folder = 'general', className }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [imageError, setImageError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      setImageError(false);
      toast({
        title: 'Image uploaded',
        description: 'Your image has been uploaded successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    setImageError(false);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setImageError(false);
      toast({
        title: 'Image URL added',
        description: 'Image URL has been set successfully.'
      });
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      
      {value ? (
        <div className="space-y-3">
          <div className="relative group">
            {imageError ? (
              <div className="w-full h-48 rounded-lg border border-border bg-muted flex items-center justify-center">
                <div className="text-center p-4">
                  <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Image failed to load</p>
                </div>
              </div>
            ) : (
              <img
                src={value}
                alt="Uploaded"
                className="w-full h-48 object-cover rounded-lg border border-border"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Current URL Display and Edit */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Current Image URL</label>
            <div className="flex gap-2">
              <Input
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  setImageError(false);
                }}
                placeholder="Image URL"
                className="text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-3">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                dragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-muted rounded-full">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Drop image here or click to upload</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG, WebP up to 5MB</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="url" className="mt-3">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                <Button type="button" onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Enter a direct URL to an image</p>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}