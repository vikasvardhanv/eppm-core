'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'ADMIN' | 'TEAM_MEMBER';

interface UserContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('ADMIN');

  return (
    <UserContext.Provider value={{ role, setRole }}>
      <div className="fixed top-0 right-0 p-2 z-50 bg-white border-b border-l rounded-bl shadow-md flex items-center gap-2">
        <span className="text-xs font-bold text-gray-500">SIMULATE ROLE:</span>
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="text-xs border rounded p-1"
        >
          <option value="ADMIN">Admin (Full Access)</option>
          <option value="TEAM_MEMBER">Team Member (Restricted)</option>
        </select>
      </div>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
