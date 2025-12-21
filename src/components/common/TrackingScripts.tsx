import { Helmet } from 'react-helmet-async';
import { useSiteSetting } from '@/hooks/useSiteSettings';
import { useEffect } from 'react';

interface SeoSettings {
  google_analytics_id?: string;
  google_tag_manager_id?: string;
  google_search_console?: string;
  meta_pixel_id?: string;
  google_ads_id?: string;
  google_ads_conversion_label?: string;
  tiktok_pixel_id?: string;
  meta_domain_verification?: string;
  tiktok_domain_verification?: string;
}

export function TrackingScripts() {
  const { data: seoSetting } = useSiteSetting('seo');
  const seo = seoSetting?.value as SeoSettings | undefined;

  const gaId = seo?.google_analytics_id;
  const gtmId = seo?.google_tag_manager_id;
  const gscVerification = seo?.google_search_console;
  const metaPixelId = seo?.meta_pixel_id;
  const googleAdsId = seo?.google_ads_id;
  const tiktokPixelId = seo?.tiktok_pixel_id;
  const metaDomainVerification = seo?.meta_domain_verification;
  const tiktokDomainVerification = seo?.tiktok_domain_verification;

  // Inject GTM noscript iframe into body
  useEffect(() => {
    if (!gtmId) return;

    const existingNoscript = document.getElementById('gtm-noscript-iframe');
    if (existingNoscript) return;

    const noscript = document.createElement('noscript');
    noscript.id = 'gtm-noscript-iframe';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);

    return () => {
      const el = document.getElementById('gtm-noscript-iframe');
      if (el) el.remove();
    };
  }, [gtmId]);

  // Inject Meta Pixel noscript
  useEffect(() => {
    if (!metaPixelId) return;

    const existingNoscript = document.getElementById('meta-pixel-noscript');
    if (existingNoscript) return;

    const noscript = document.createElement('noscript');
    noscript.id = 'meta-pixel-noscript';
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`;
    noscript.appendChild(img);
    document.body.insertBefore(noscript, document.body.firstChild);

    return () => {
      const el = document.getElementById('meta-pixel-noscript');
      if (el) el.remove();
    };
  }, [metaPixelId]);

  const hasAnyTracking = gaId || gtmId || gscVerification || metaPixelId || googleAdsId || tiktokPixelId || metaDomainVerification || tiktokDomainVerification;

  if (!hasAnyTracking) {
    return null;
  }

  return (
    <Helmet>
      {/* Domain Verification Tags */}
      {gscVerification && (
        <meta name="google-site-verification" content={gscVerification} />
      )}
      {metaDomainVerification && (
        <meta name="facebook-domain-verification" content={metaDomainVerification} />
      )}
      {tiktokDomainVerification && (
        <meta name="tiktok-domain-verification" content={tiktokDomainVerification} />
      )}

      {/* Google Analytics 4 */}
      {gaId && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      )}
      {gaId && (
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `}
        </script>
      )}

      {/* Google Ads */}
      {googleAdsId && !gaId && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`} />
      )}
      {googleAdsId && (
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            ${!gaId ? "gtag('js', new Date());" : ''}
            gtag('config', '${googleAdsId}');
          `}
        </script>
      )}

      {/* Google Tag Manager */}
      {gtmId && (
        <script>
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </script>
      )}

      {/* Meta (Facebook) Pixel */}
      {metaPixelId && (
        <script>
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </script>
      )}

      {/* TikTok Pixel */}
      {tiktokPixelId && (
        <script>
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var i=document.createElement("script");i.type="text/javascript",i.async=!0,i.src=r+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(i,a)};
              ttq.load('${tiktokPixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </script>
      )}
    </Helmet>
  );
}
