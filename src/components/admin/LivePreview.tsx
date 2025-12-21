import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw, Monitor, Smartphone, Tablet } from 'lucide-react';

interface LivePreviewProps {
  path: string;
  title?: string;
}

type DeviceSize = 'desktop' | 'tablet' | 'mobile';

const deviceSizes: Record<DeviceSize, { width: string; icon: React.ElementType }> = {
  desktop: { width: '100%', icon: Monitor },
  tablet: { width: '768px', icon: Tablet },
  mobile: { width: '375px', icon: Smartphone },
};

export default function LivePreview({ path, title = 'Live Preview' }: LivePreviewProps) {
  const [key, setKey] = useState(0);
  const [device, setDevice] = useState<DeviceSize>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-refresh on path change
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [path]);

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  const handleOpenInNewTab = () => {
    window.open(path, '_blank');
  };

  const previewUrl = `${window.location.origin}${path}`;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {/* Device Selector */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {(Object.keys(deviceSizes) as DeviceSize[]).map((size) => {
                const { icon: Icon } = deviceSizes[size];
                return (
                  <Button
                    key={size}
                    variant={device === size ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setDevice(size)}
                    title={size.charAt(0).toUpperCase() + size.slice(1)}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
            
            <Button variant="outline" size="sm" onClick={handleRefresh} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleOpenInNewTab} title="Open in new tab">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 overflow-hidden">
        <div 
          className="h-full bg-muted rounded-lg overflow-hidden flex justify-center"
          style={{ minHeight: '400px' }}
        >
          <div
            className="h-full transition-all duration-300 bg-background"
            style={{ 
              width: deviceSizes[device].width,
              maxWidth: '100%'
            }}
          >
            <iframe
              ref={iframeRef}
              key={key}
              src={previewUrl}
              className="w-full h-full border-0"
              title={title}
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}