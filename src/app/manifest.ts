import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aninda Payu',
    short_name: 'Aninda Payu',
    description: 'Aplikasi stock opname batik Aninda Payu',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f1e9',
    theme_color: '#24406b',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
