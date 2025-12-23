import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CustomPage {
  id: string;
  title_en: string;
  title_id: string;
  slug: string;
  parent_id: string | null;
  template: string;
  status: string;
  content_en: any[];
  content_id: any[];
  meta_title_en: string | null;
  meta_title_id: string | null;
  meta_description_en: string | null;
  meta_description_id: string | null;
  og_image: string | null;
  sort_order: number;
  is_in_menu: boolean;
  created_at: string;
  updated_at: string;
  children?: CustomPage[];
}

export function useCustomPages() {
  return useQuery({
    queryKey: ['custom-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data as CustomPage[];
    },
  });
}

export function usePublishedCustomPages() {
  return useQuery({
    queryKey: ['custom-pages', 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('status', 'published')
        .order('sort_order');
      
      if (error) throw error;
      return data as CustomPage[];
    },
  });
}

export function useCustomPageBySlug(slug: string) {
  return useQuery({
    queryKey: ['custom-pages', 'slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data as CustomPage;
    },
    enabled: !!slug,
  });
}

export function useCustomPageById(id: string) {
  return useQuery({
    queryKey: ['custom-pages', 'id', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as CustomPage;
    },
    enabled: !!id,
  });
}

export function useCustomPagesHierarchy() {
  const { data: pages, ...rest } = useCustomPages();
  
  const buildHierarchy = (items: CustomPage[], parentId: string | null = null): CustomPage[] => {
    return items
      .filter(item => item.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(item => ({
        ...item,
        children: buildHierarchy(items, item.id),
      }));
  };

  const hierarchicalPages = pages ? buildHierarchy(pages) : [];

  return {
    ...rest,
    data: hierarchicalPages,
    flatData: pages,
  };
}

export function useCreateCustomPage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (page: Omit<CustomPage, 'id' | 'created_at' | 'updated_at' | 'children'>) => {
      const { data, error } = await supabase
        .from('custom_pages')
        .insert(page)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-pages'] });
      toast({
        title: 'Success',
        description: 'Page created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create page',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateCustomPage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CustomPage>) => {
      const { data, error } = await supabase
        .from('custom_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-pages'] });
      toast({
        title: 'Success',
        description: 'Page updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update page',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteCustomPage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_pages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-pages'] });
      toast({
        title: 'Success',
        description: 'Page deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete page',
        variant: 'destructive',
      });
    },
  });
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
