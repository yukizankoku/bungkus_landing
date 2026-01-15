import React from 'react';
import { Package } from 'lucide-react';
import { iconMap } from '@/lib/iconMap';

interface FeatureItem {
  icon?: string;
  title: string;
  description: string;
}

interface FeaturesSectionProps {
  title?: string;
  subtitle?: string;
  items?: FeatureItem[];
}

export function FeaturesSection({ title, subtitle, items }: FeaturesSectionProps) {
  // Don't render if no items provided (CMS not configured)
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {title && (
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-muted-foreground text-lg">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((feature, index) => {
            const IconComponent = iconMap[feature.icon || 'Package'] || Package;
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-secondary/50 hover:shadow-lg transition-all duration-300 hover-lift"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                  <IconComponent className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
