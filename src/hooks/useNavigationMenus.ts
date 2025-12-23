import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NavigationMenu {
  id: string;
  label_en: string;
  label_id: string;
  href: string | null;
  parent_id: string | null;
  sort_order: number;
  is_visible: boolean;
  icon: string | null;
  created_at: string;
  updated_at: string;
  children?: NavigationMenu[];
}

export function useNavigationMenus() {
  return useQuery({
    queryKey: ['navigation-menus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('navigation_menus')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as NavigationMenu[];
    },
  });
}

export function useNavigationMenusHierarchy() {
  const { data: menus, ...rest } = useNavigationMenus();

  const buildHierarchy = (items: NavigationMenu[]): NavigationMenu[] => {
    const itemMap = new Map<string, NavigationMenu>();
    const roots: NavigationMenu[] = [];

    // First pass: create map
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: build hierarchy
    items.forEach(item => {
      const node = itemMap.get(item.id)!;
      if (item.parent_id && itemMap.has(item.parent_id)) {
        itemMap.get(item.parent_id)!.children!.push(node);
      } else if (!item.parent_id) {
        roots.push(node);
      }
    });

    // Sort children by sort_order
    roots.forEach(root => {
      if (root.children) {
        root.children.sort((a, b) => a.sort_order - b.sort_order);
      }
    });

    return roots.sort((a, b) => a.sort_order - b.sort_order);
  };

  return {
    ...rest,
    data: menus ? buildHierarchy(menus) : undefined,
    rawData: menus,
  };
}

export function useCreateNavigationMenu() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (menu: Omit<NavigationMenu, 'id' | 'created_at' | 'updated_at' | 'children'>) => {
      const { data, error } = await supabase
        .from('navigation_menus')
        .insert(menu)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-menus'] });
      toast({ title: 'Menu item created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating menu item', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateNavigationMenu() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NavigationMenu> & { id: string }) => {
      const { data, error } = await supabase
        .from('navigation_menus')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-menus'] });
      toast({ title: 'Menu item updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating menu item', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteNavigationMenu() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('navigation_menus')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-menus'] });
      toast({ title: 'Menu item deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting menu item', description: error.message, variant: 'destructive' });
    },
  });
}

export function useReorderNavigationMenus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (items: { id: string; sort_order: number }[]) => {
      const updates = items.map(item => 
        supabase
          .from('navigation_menus')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw new Error('Failed to reorder some items');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-menus'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error reordering menu', description: error.message, variant: 'destructive' });
    },
  });
}
