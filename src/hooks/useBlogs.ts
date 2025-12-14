import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Blog {
  id: string;
  title_en: string;
  title_id: string;
  slug: string;
  excerpt_en: string | null;
  excerpt_id: string | null;
  content_en: string | null;
  content_id: string | null;
  featured_image: string | null;
  category: string | null;
  is_published: boolean | null;
  author_id: string | null;
  meta_title_en: string | null;
  meta_title_id: string | null;
  meta_description_en: string | null;
  meta_description_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useBlogs(publishedOnly = false) {
  return useQuery({
    queryKey: ['blogs', publishedOnly],
    queryFn: async () => {
      let query = supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (publishedOnly) {
        query = query.eq('is_published', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Blog[];
    }
  });
}

export function useBlog(id: string) {
  return useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Blog;
    },
    enabled: !!id
  });
}

export function useBlogBySlug(slug: string) {
  return useQuery({
    queryKey: ['blog', 'slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      
      if (error) throw error;
      return data as Blog;
    },
    enabled: !!slug
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (blog: Omit<Blog, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('blogs')
        .insert(blog)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast({
        title: 'Blog created',
        description: 'Your blog post has been created.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create blog post.',
        variant: 'destructive'
      });
    }
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...blog }: Partial<Blog> & { id: string }) => {
      const { data, error } = await supabase
        .from('blogs')
        .update(blog)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', variables.id] });
      toast({
        title: 'Blog updated',
        description: 'Your changes have been saved.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update blog post.',
        variant: 'destructive'
      });
    }
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast({
        title: 'Blog deleted',
        description: 'The blog post has been deleted.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete blog post.',
        variant: 'destructive'
      });
    }
  });
}
