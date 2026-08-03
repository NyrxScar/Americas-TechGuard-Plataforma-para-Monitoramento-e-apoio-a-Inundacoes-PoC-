import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'visitor' | 'citizen' | 'civil_defense' | 'administrator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoggedIn: boolean;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
  setVisitor: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>('visitor');

  const login = (email: string, userRole: UserRole = 'citizen') => {
    const isCivilDefense = email.includes('defesa') || email.includes('civil') || userRole === 'civil_defense';
    const activeRole = isCivilDefense ? 'civil_defense' : 'citizen';
    setUser({
      id: isCivilDefense ? '22222222-2222-2222-2222-222222222222' : '11111111-1111-1111-1111-111111111111',
      name: isCivilDefense ? 'Operador Defesa Civil' : 'Cidadão Blumenau',
      email,
      role: activeRole,
      phone: '(47) 99999-0000'
    });
    setRoleState(activeRole);
  };

  const logout = () => {
    setUser(null);
    setRoleState('visitor');
  };

  const setVisitor = () => {
    setUser(null);
    setRoleState('visitor');
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoggedIn: !!user, login, logout, setVisitor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
