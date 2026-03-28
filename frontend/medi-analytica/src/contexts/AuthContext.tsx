"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";


interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkAuth = useCallback(() => {
        const auth = localStorage.getItem("isAuthenticated");
        const userJson = localStorage.getItem("currentUser");

        if (auth === "true" && userJson) {
            try {
                const parsedUser = JSON.parse(userJson);
                setUser(parsedUser);
                setIsAuthenticated(true);
            } catch (e) {
                console.error("Failed to parse user data", e);
                localStorage.removeItem("isAuthenticated");
                localStorage.removeItem("currentUser");
                setIsAuthenticated(false);
                setUser(null);
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        checkAuth();
        
        // Listen for custom events to sync state across components or tabs
        const handleSync = () => checkAuth();
        window.addEventListener("userUpdated", handleSync);
        window.addEventListener("storage", handleSync);
        
        return () => {
            window.removeEventListener("userUpdated", handleSync);
            window.removeEventListener("storage", handleSync);
        };
    }, [checkAuth]);

    const login = (userData: User) => {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUser", JSON.stringify(userData));
        
        // Middleware için cookie ekle
        document.cookie = `auth_status=true; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 gün
        document.cookie = `user_role=${userData.role}; path=/; max-age=${60 * 60 * 24 * 7}`;
        
        setUser(userData);
        setIsAuthenticated(true);
        
        const dashboard = userData.role === "doktor" ? "/doctor-dashboard" : "/dashboard";
        router.push(dashboard);
    };

    const logout = () => {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("currentUser");
        
        // Cookie'leri temizle
        document.cookie = "auth_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = "/";
    };

    const updateUser = (userData: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...userData };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Dispatch event for components that might not be using this context
        window.dispatchEvent(new Event("userUpdated"));
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
