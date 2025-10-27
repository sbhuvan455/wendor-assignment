'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'customer' | 'provider';
    serviceType?: 'Electrician' | 'Carpentry' | 'CarWasher' | 'Plumbing' | 'ApplianceRepair';
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: {
        name: string;
        email: string;
        password: string;
        role: 'customer' | 'provider';
        serviceType?: 'Electrician' | 'Carpentry' | 'CarWasher' | 'Plumbing' | 'ApplianceRepair';
    }) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const userData = await authApi.getCurrentUser();
            setUser(userData.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await authApi.login({ email, password });
            setUser(response.user);
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData: {
        name: string;
        email: string;
        password: string;
        role: 'customer' | 'provider';
        serviceType?: 'Electrician' | 'Carpentry' | 'CarWasher' | 'Plumbing' | 'ApplianceRepair';
    }) => {
        try {
            const response = await authApi.register(userData);
            setUser(response.user);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
            setUser(null);
        } catch (error) {
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
