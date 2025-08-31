'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface MenuItem {
    id: number;
    label: string;
    slug: string;
    order: number;
    requiredRole?: number | string;
}

interface MenuContextType {
    items: MenuItem[];
    refreshMenu: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
    const [items, setItems] = useState<MenuItem[]>([]);

    const refreshMenu = async () => {
        const res = await fetch('http://localhost:4000/cesizen/api/v1/public-menu');
        const data = await res.json();
        setItems(data);
    };

    useEffect(() => {
        refreshMenu();
    }, []);

    return (
        <MenuContext.Provider value={{ items, refreshMenu }}>
            {children}
        </MenuContext.Provider>
    );
};

export const useMenu = () => {
    const context = useContext(MenuContext);
    if (!context) throw new Error('useMenu must be used within MenuProvider');
    return context;
};
