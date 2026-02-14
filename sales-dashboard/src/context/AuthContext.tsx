import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import type { User, IdTokenResult } from 'firebase/auth';
import { app } from '@qrseva/firebase-config';

interface AuthContextType {
    user: User | null;
    role: string | null;
    loading: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    const tokenResult: IdTokenResult = await firebaseUser.getIdTokenResult();
                    setRole(tokenResult.claims.role as string || null);
                } catch (error) {
                    console.error("Error fetching custom claims:", error);
                    setRole(null);
                }
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const isAdmin = role === 'SALES_ADMIN';

    return (
        <AuthContext.Provider value={{ user, role, loading, isAdmin }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
