
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Icono personalizado para evitar el logo de Firebase
const appIcon = PlaceHolderImages.find(img => img.id === 'app-icon')?.imageUrl || 'https://picsum.photos/seed/smart-bulb-99/512/512';

export const metadata: Metadata = {
  title: 'Luz Control',
  description: 'Asistencia Motriz - Control de entorno local',
  icons: {
    icon: [
      { url: appIcon, type: 'image/png' },
      { url: appIcon, sizes: '32x32', type: 'image/png' },
      { url: appIcon, sizes: '16x16', type: 'image/png' },
    ],
    shortcut: [{ url: appIcon }],
    apple: [{ url: appIcon }],
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
        
        {/* Forzar icono en pestaña del navegador (favicon) - Sobrescribe cualquier favicon.ico local */}
        <link rel="icon" type="image/png" href={appIcon} />
        <link rel="shortcut icon" type="image/png" href={appIcon} />
        <link rel="apple-touch-icon" href={appIcon} />
        
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-body antialiased bg-[#F4F4F9] text-foreground" suppressHydrationWarning>
        {children}
        <Toaster />
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registrado:', registration.scope);
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
