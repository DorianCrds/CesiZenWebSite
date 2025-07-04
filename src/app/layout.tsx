import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { AuthProvider } from './context/AuthContext';

// Import du menu
import NavigationMenu from './components/Menu';
import {MenuProvider} from "@/app/admin/content/MenuContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "CesiZen",
    description: "Plateforme de gestion du stress pour les étudiants Cesi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
            <MenuProvider>
                <NavigationMenu />
                {children}
            </MenuProvider>
        </AuthProvider>
        </body>
        </html>
    );
}
