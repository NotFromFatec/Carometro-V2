// src/AppContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Egresso, Admin, EgressoData, api } from './api'; 

interface AppContextProps {
    isLoggedIn: boolean;
    isAdminLoggedIn: boolean;
    egressoUser: Egresso | null;
    adminUser: Admin | null;
    loginEgresso: (user: Egresso, firstLogin?: boolean) => void;
    loginAdmin: (admin: Admin) => void;
    logout: () => void;
    loading: boolean; 
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    allCourses: string[]; 
    setAllCourses: React.Dispatch<React.SetStateAction<string[]>>;
    firstLogin: boolean;
    setFirstLogin: React.Dispatch<React.SetStateAction<boolean>>;
    allEgressosForAutocomplete: Egresso[]; 
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [egressoUser, setEgressoUser] = useState<Egresso | null>(null);
    const [adminUser, setAdminUser] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true); 
    const [allCourses, setAllCourses] = useState<string[]>([]);
    const [firstLogin, setFirstLogin] = useState(false);
    const [allEgressosForAutocomplete, setAllEgressosForAutocomplete] = useState<Egresso[]>([]);


    useEffect(() => {
        setLoading(true); 
        const performInitialLoad = async () => {
            try {
                const storedEgressoUser = localStorage.getItem('egressoUser');
                const storedAdminUser = localStorage.getItem('adminUser');
                const storedFirstLogin = localStorage.getItem('firstLogin');

                if (storedEgressoUser && storedAdminUser) {
                    localStorage.removeItem('adminUser');
                    setEgressoUser(new Egresso(JSON.parse(storedEgressoUser)));
                    setIsLoggedIn(true);
                    if (storedFirstLogin) setFirstLogin(JSON.parse(storedFirstLogin));
                } else if (storedEgressoUser) {
                    setEgressoUser(new Egresso(JSON.parse(storedEgressoUser)));
                    setIsLoggedIn(true);
                    if (storedFirstLogin) setFirstLogin(JSON.parse(storedFirstLogin));
                } else if (storedAdminUser) {
                    setAdminUser(new Admin(JSON.parse(storedAdminUser)));
                    setIsAdminLoggedIn(true);
                }

                const [fetchedCourses, fetchedEgressos] = await Promise.all([
                    api.getCourses(),
                    api.getEgressos()
                ]);
                setAllCourses(fetchedCourses);
                setAllEgressosForAutocomplete(fetchedEgressos.filter(e => e.verified || isAdminLoggedIn)); 

            } catch (error) {
                console.error("Error during initial app load:", error);
            } finally {
                setLoading(false); 
            }
        };
        performInitialLoad();
    }, [isAdminLoggedIn]); 

    const loginEgresso = useCallback((user: Egresso, firstLoginFlag: boolean = false) => {
        if (adminUser) { 
            setAdminUser(null);
            setIsAdminLoggedIn(false);
            localStorage.removeItem('adminUser');
        }
        setEgressoUser(user);
        setIsLoggedIn(true);
        localStorage.setItem('egressoUser', JSON.stringify(user.toJson()));
        setFirstLogin(firstLoginFlag);
        localStorage.setItem('firstLogin', JSON.stringify(firstLoginFlag));
    }, [adminUser]);

    const loginAdmin = useCallback((admin: Admin) => {
        if (egressoUser) { 
            setEgressoUser(null);
            setIsLoggedIn(false);
            localStorage.removeItem('egressoUser');
            localStorage.removeItem('firstLogin');
            setFirstLogin(false);
        }
        setAdminUser(admin);
        setIsAdminLoggedIn(true);
        localStorage.setItem('adminUser', JSON.stringify(admin.toJson()));
    }, [egressoUser]);

    const logout = useCallback(() => {
        setEgressoUser(null);
        setAdminUser(null);
        setIsLoggedIn(false);
        setIsAdminLoggedIn(false);
        setFirstLogin(false);
        localStorage.removeItem('egressoUser');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('firstLogin');
    }, []);

    const contextValue: AppContextProps = {
        isLoggedIn,
        isAdminLoggedIn,
        egressoUser,
        adminUser,
        loginEgresso,
        loginAdmin,
        logout,
        loading,
        setLoading,
        allCourses, 
        setAllCourses,
        firstLogin,
        setFirstLogin,
        allEgressosForAutocomplete
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};