import React, { useState } from 'react';
import { 
  Package, Shield, Users, Zap, Building2, TrendingUp, Truck, Award,
  DollarSign, Lightbulb, Heart, Sparkles, Target, Eye, Compass,
  Coffee, ShoppingBag, Recycle, Leaf, Star, CheckCircle, Clock,
  Globe, Phone, Mail, MapPin, Calendar, FileText, Image, Video,
  Settings, Search, Filter, Grid, List, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const iconMap = {
  Package, Shield, Users, Zap, Building2, TrendingUp, Truck, Award,
  DollarSign, Lightbulb, Heart, Sparkles, Target, Eye, Compass,
  Coffee, ShoppingBag, Recycle, Leaf, Star, CheckCircle, Clock,
  Globe, Phone, Mail, MapPin, Calendar, FileText, Image, Video,
  Settings, Search, Filter, Grid, List
};

type IconName = keyof typeof iconMap;

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function IconSelector({ value, onChange }: IconSelectorProps) {
  const [open, setOpen] = useState(false);
  
  const SelectedIcon = iconMap[value as IconName] || Package;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <SelectedIcon className="h-4 w-4" />
            {value || 'Select Icon'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 bg-background border shadow-lg z-50" align="start">
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(iconMap).map(([name, Icon]) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                onChange(name);
                setOpen(false);
              }}
              className={cn(
                "p-2.5 rounded-lg flex items-center justify-center hover:bg-muted transition-colors",
                value === name && "bg-primary text-primary-foreground"
              )}
              title={name}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
