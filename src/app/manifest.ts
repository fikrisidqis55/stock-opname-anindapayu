import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aninda Payu',
    short_name: 'Aninda Payu',
    description: 'Aplikasi stock opname batik Aninda Payu',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7c2d12',
    icons: [{ src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
