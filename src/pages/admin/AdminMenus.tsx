import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Loader2, 
  Plus, 
  GripVertical, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff,
  ChevronRight,
  Menu as MenuIcon
} from 'lucide-react';
import { 
  useAllNavigationMenus,
  useNavigationMenusHierarchy,
  useCreateNavigationMenu,
  useUpdateNavigationMenu,
  useDeleteNavigationMenu,
  useReorderNavigationMenus,
  NavigationMenu 
} from '@/hooks/useNavigationMenus';
import PageLinkSelector from '@/components/admin/PageLinkSelector';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MenuFormData {
  label_en: string;
  label_id: string;
  href: string;
  parent_id: string | null;
  is_visible: boolean;
}

const defaultFormData: MenuFormData = {
  label_en: '',
  label_id: '',
  href: '',
  parent_id: null,
  is_visible: true,
};

interface SortableMenuItemProps {
  menu: NavigationMenu;
  level: number;
  onEdit: (menu: NavigationMenu) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (menu: NavigationMenu) => void;
  onAddChild: (parentId: string) => void;
  language: 'en' | 'id';
  isPending: boolean;
}

function SortableMenuItem({ 
  menu, 
  level, 
  onEdit, 
  onDelete, 
  onToggleVisibility, 
  onAddChild,
  language,
  isPending 
}: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: level * 24,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div 
        className={cn(
          "flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors mb-2",
          !menu.is_visible && "opacity-50",
          isDragging && "shadow-lg ring-2 ring-primary"
        )}
      >
        <button
          className="cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        
        {level > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">
            {language === 'en' ? menu.label_en : menu.label_id}
          </div>
          {menu.href && (
            <div className="text-xs text-muted-foreground truncate">{menu.href}</div>
          )}
          {!menu.href && (
            <div className="text-xs text-muted-foreground italic">
              {language === 'en' ? 'Dropdown parent (no link)' : 'Parent dropdown (tanpa link)'}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleVisibility(menu)}
            disabled={isPending}
          >
            {menu.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(menu)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(menu.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {menu.children && menu.children.length > 0 && (
        <div className="space-y-0">
          <SortableMenuList
            items={menu.children}
            level={level + 1}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleVisibility={onToggleVisibility}
            onAddChild={onAddChild}
            language={language}
            isPending={isPending}
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            style={{ marginLeft: (level + 1) * 24 }}
            onClick={() => onAddChild(menu.id)}
          >
            <Plus className="h-4 w-4 mr-1" />
            {language === 'en' ? 'Add sub-menu' : 'Tambah sub-menu'}
          </Button>
        </div>
      )}
      
      {(!menu.children || menu.children.length === 0) && !menu.parent_id && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground mb-2"
          style={{ marginLeft: 24 }}
          onClick={() => onAddChild(menu.id)}
        >
          <Plus className="h-4 w-4 mr-1" />
          {language === 'en' ? 'Add sub-menu' : 'Tambah sub-menu'}
        </Button>
      )}
    </div>
  );
}

interface SortableMenuListProps {
  items: NavigationMenu[];
  level: number;
  onEdit: (menu: NavigationMenu) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (menu: NavigationMenu) => void;
  onAddChild: (parentId: string) => void;
  language: 'en' | 'id';
  isPending: boolean;
}

function SortableMenuList({ 
  items, 
  level, 
  onEdit, 
  onDelete, 
  onToggleVisibility, 
  onAddChild,
  language,
  isPending 
}: SortableMenuListProps) {
  return (
    <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
      {items.map(menu => (
        <SortableMenuItem
          key={menu.id}
          menu={menu}
          level={level}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleVisibility={onToggleVisibility}
          onAddChild={onAddChild}
          language={language}
          isPending={isPending}
        />
      ))}
    </SortableContext>
  );
}

export default function AdminMenus() {
  const { language } = useLanguage();
  const { data: hierarchicalMenus, isLoading, refetch } = useNavigationMenusHierarchy(true); // Include hidden items
  const { data: flatMenus } = useAllNavigationMenus();
  const createMenu = useCreateNavigationMenu();
  const updateMenu = useUpdateNavigationMenu();
  const deleteMenu = useDeleteNavigationMenu();
  const reorderMenus = useReorderNavigationMenus();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<NavigationMenu | null>(null);
  const [deleteMenuId, setDeleteMenuId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MenuFormData>(defaultFormData);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOpenCreate = (parentId?: string) => {
    setEditingMenu(null);
    setFormData({ ...defaultFormData, parent_id: parentId || null });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (menu: NavigationMenu) => {
    setEditingMenu(menu);
    setFormData({
      label_en: menu.label_en,
      label_id: menu.label_id,
      href: menu.href || '',
      parent_id: menu.parent_id,
      is_visible: menu.is_visible,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingMenu) {
      await updateMenu.mutateAsync({
        id: editingMenu.id,
        ...formData,
        href: formData.href || null,
      });
    } else {
      const maxSortOrder = flatMenus?.filter(m => m.parent_id === formData.parent_id)
        .reduce((max, m) => Math.max(max, m.sort_order), -1) ?? -1;
      
      await createMenu.mutateAsync({
        ...formData,
        href: formData.href || null,
        sort_order: maxSortOrder + 1,
        icon: null,
      });
    }
    setIsDialogOpen(false);
    setFormData(defaultFormData);
  };

  const handleDelete = async () => {
    if (deleteMenuId) {
      await deleteMenu.mutateAsync(deleteMenuId);
      setDeleteMenuId(null);
    }
  };

  const handleToggleVisibility = async (menu: NavigationMenu) => {
    await updateMenu.mutateAsync({
      id: menu.id,
      is_visible: !menu.is_visible,
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id || !flatMenus) return;

    const activeMenu = flatMenus.find(m => m.id === active.id);
    const overMenu = flatMenus.find(m => m.id === over.id);
    
    if (!activeMenu || !overMenu) return;
    
    // Only allow reordering within same parent level
    if (activeMenu.parent_id !== overMenu.parent_id) return;

    const siblings = flatMenus.filter(m => m.parent_id === activeMenu.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order);
    
    const oldIndex = siblings.findIndex(m => m.id === active.id);
    const newIndex = siblings.findIndex(m => m.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(siblings, oldIndex, newIndex);
    
    const updates = newOrder.map((menu, index) => ({
      id: menu.id,
      sort_order: index,
    }));

    await reorderMenus.mutateAsync(updates);
  };

  const parentOptions = flatMenus?.filter(m => !m.parent_id) || [];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MenuIcon className="h-6 w-6" />
              {language === 'en' ? 'Navigation Menu' : 'Menu Navigasi'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'en' 
                ? 'Drag and drop to reorder menu items' 
                : 'Seret dan lepas untuk mengatur urutan menu'}
            </p>
          </div>
          <Button onClick={() => handleOpenCreate()}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'en' ? 'Add Menu Item' : 'Tambah Menu'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'en' ? 'Menu Structure' : 'Struktur Menu'}</CardTitle>
            <CardDescription>
              {language === 'en' 
                ? 'Drag the grip icon to reorder items within the same level' 
                : 'Seret ikon grip untuk mengatur urutan item di level yang sama'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hierarchicalMenus && hierarchicalMenus.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableMenuList
                  items={hierarchicalMenus}
                  level={0}
                  onEdit={handleOpenEdit}
                  onDelete={setDeleteMenuId}
                  onToggleVisibility={handleToggleVisibility}
                  onAddChild={handleOpenCreate}
                  language={language as 'en' | 'id'}
                  isPending={updateMenu.isPending}
                />
              </DndContext>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {language === 'en' ? 'No menu items yet. Add your first menu item.' : 'Belum ada menu. Tambahkan menu pertama Anda.'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMenu 
                ? (language === 'en' ? 'Edit Menu Item' : 'Edit Menu')
                : (language === 'en' ? 'Add Menu Item' : 'Tambah Menu')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Label (English)</Label>
                <Input
                  value={formData.label_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, label_en: e.target.value }))}
                  placeholder="Home"
                />
              </div>
              <div>
                <Label>Label (Indonesian)</Label>
                <Input
                  value={formData.label_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, label_id: e.target.value }))}
                  placeholder="Beranda"
                />
              </div>
            </div>

            <div>
              <Label>Link URL</Label>
              <PageLinkSelector
                value={formData.href}
                onChange={(value) => setFormData(prev => ({ ...prev, href: value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'en' 
                  ? 'Leave empty if this is a dropdown parent with sub-menus' 
                  : 'Kosongkan jika ini adalah parent dropdown dengan sub-menu'}
              </p>
            </div>

            <div>
              <Label>{language === 'en' ? 'Parent Menu' : 'Menu Induk'}</Label>
              <Select
                value={formData.parent_id || 'none'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value === 'none' ? null : value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="none">
                    {language === 'en' ? '— No parent (top level)' : '— Tanpa induk (level atas)'}
                  </SelectItem>
                  {parentOptions.map(parent => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {language === 'en' ? parent.label_en : parent.label_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>{language === 'en' ? 'Visible' : 'Tampilkan'}</Label>
              <Switch
                checked={formData.is_visible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {language === 'en' ? 'Cancel' : 'Batal'}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.label_en || !formData.label_id || createMenu.isPending || updateMenu.isPending}
            >
              {(createMenu.isPending || updateMenu.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {language === 'en' ? 'Save' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteMenuId} onOpenChange={() => setDeleteMenuId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en' ? 'Delete Menu Item?' : 'Hapus Menu?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en' 
                ? 'This will also delete all sub-menu items. This action cannot be undone.'
                : 'Ini juga akan menghapus semua sub-menu. Tindakan ini tidak dapat dibatalkan.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'en' ? 'Cancel' : 'Batal'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMenu.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {language === 'en' ? 'Delete' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
