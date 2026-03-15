
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const appIcon = PlaceHolderImages.find(img => img.id === 'app-icon')?.imageUrl || 'https://picsum.photos/seed/luzcontrol-bulb/512/512';

export const metadata: Metadata = {
  title: 'Luz Control',
  description: 'Asistencia Motriz - Control de entorno local',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Luz Control',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: appIcon,
    shortcut: appIcon,
    apple: appIcon,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Favicon y Iconos de App */}
        <link rel="icon" type="image/png" href={appIcon} />
        <link rel="apple-touch-icon" href={appIcon} />
        <link rel="apple-touch-icon" sizes="152x152" href={appIcon} />
        <link rel="apple-touch-icon" sizes="180x180" href={appIcon} />
        <link rel="apple-touch-icon" sizes="167x167" href={appIcon} />
        
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="font-body antialiased bg-[#F4F4F9] text-foreground" suppressHydrationWarning>
        {children}
        <Toaster />
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registrado con éxito:', registration.scope);
                }).catch(function(err) {
                  console.log('Fallo al registrar ServiceWorker:', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
