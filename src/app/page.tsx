// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirige vers la page avec slug 'accueil' (publique)
  redirect('/accueil');
}
