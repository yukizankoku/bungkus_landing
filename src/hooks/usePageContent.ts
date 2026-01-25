import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PageContent {
  id: string;
  page_key: string;
  content_en: Record<string, any>;
  content_id: Record<string, any>;
  updated_at: string;
  slug?: string;
  use_prefix?: boolean;
}

export function usePageContent(pageKey: string) {
  return useQuery({
    queryKey: ['page-content', pageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_key', pageKey)
        .maybeSingle();
      
      if (error) throw error;
      return data as PageContent | null;
    }
  });
}

export function useAllPageContent() {
  return useQuery({
    queryKey: ['page-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .order('page_key');
      
      if (error) throw error;
      return data as PageContent[];
    }
  });
}

export function useUpdatePageContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      pageKey, 
      contentEn, 
      contentId,
      slug,
      usePrefix
    }: { 
      pageKey: string; 
      contentEn: Record<string, any>; 
      contentId: Record<string, any>;
      slug?: string;
      usePrefix?: boolean;
    }) => {
      const updateData: Record<string, any> = {
        content_en: contentEn,
        content_id: contentId,
        updated_at: new Date().toISOString()
      };
      
      // Only include slug and use_prefix if they're provided
      if (slug !== undefined) {
        updateData.slug = slug;
      }
      if (usePrefix !== undefined) {
        updateData.use_prefix = usePrefix;
      }

      const { data, error } = await supabase
        .from('page_content')
        .update(updateData)
        .eq('page_key', pageKey)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['page-content'] });
      queryClient.invalidateQueries({ queryKey: ['page-content', variables.pageKey] });
      queryClient.invalidateQueries({ queryKey: ['page-routes'] });
      toast({
        title: 'Page updated',
        description: 'Your changes have been saved.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update page.',
        variant: 'destructive'
      });
    }
  });
}

export function usePageRoutes() {
  return useQuery({
    queryKey: ['page-routes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_content')
        .select('page_key, slug, use_prefix')
        .not('slug', 'is', null);
      
      if (error) throw error;
      return data as Array<{ page_key: string; slug: string; use_prefix: boolean }>;
    }
  });
}
