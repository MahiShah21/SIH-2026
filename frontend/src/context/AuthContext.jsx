import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export const USERS_BY_ROLE = {
  citizen: {
    role: 'citizen',
    roleLabel: 'Citizen Innovator',
    name: 'Citizen User',
    email: 'citizen@jansetu.gov.in',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    district: 'Ranchi, Jharkhand',
    karmaPoints: 0,
    badgesCount: 0,
    homeRoute: '/citizen/dashboard'
  },
  university: {
    role: 'university',
    roleLabel: 'University Researcher / Dean',
    name: 'University Researcher',
    email: 'university@jansetu.gov.in',
    institution: 'Birla Institute of Technology (BIT) Mesra',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    district: 'Ranchi, Jharkhand',
    activeGrants: '₹0',
    homeRoute: '/university/dashboard'
  },
  industry: {
    role: 'industry',
    roleLabel: 'Industry & CSR Partner',
    name: 'Industry Partner',
    email: 'industry@jansetu.gov.in',
    company: 'CSR & Innovation Division',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    district: 'Jamshedpur, Jharkhand',
    csrBudget: '₹0',
    homeRoute: '/industry/dashboard'
  },
  admin: {
    role: 'admin',
    roleLabel: 'Government Officer & IAS Nodal Director',
    name: 'Dr. Sunita Murmu, IAS',
    email: 'admin@jansetu.gov.in',
    department: 'State Innovation Directorate, Govt. of Jharkhand',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    district: 'Govt. of Jharkhand, Ranchi',
    pendingReviews: 0,
    homeRoute: '/government/dashboard'
  },
  government: {
    role: 'admin',
    roleLabel: 'Government Officer & IAS Nodal Director',
    name: 'Dr. Sunita Murmu, IAS',
    email: 'admin@jansetu.gov.in',
    department: 'State Innovation Directorate, Govt. of Jharkhand',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    district: 'Govt. of Jharkhand, Ranchi',
    pendingReviews: 0,
    homeRoute: '/government/dashboard'
  }
};

export function AuthProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('jansetu_user_role') || localStorage.getItem('jhar_user_role') || null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('jansetu_jwt_token') || localStorage.getItem('jhar_jwt_token') || null;
  });
  const [userData, setUserData] = useState(() => {
    const role = localStorage.getItem('jansetu_user_role') || localStorage.getItem('jhar_user_role');
    const savedUserStr = localStorage.getItem('jansetu_user_data');
    if (savedUserStr) {
      try {
        return JSON.parse(savedUserStr);
      } catch (e) {}
    }
    return role ? USERS_BY_ROLE[role] : null;
  });

  // Save userData to local storage whenever it changes
  useEffect(() => {
    if (userData) {
      localStorage.setItem('jansetu_user_data', JSON.stringify(userData));
    } else {
      localStorage.removeItem('jansetu_user_data');
    }
  }, [userData]);

  // Verify stored token on mount
  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then(res => {
          if (res.success && res.user) {
            setUserData(prev => ({ ...(prev || {}), ...res.user }));
            if (res.user.role) {
              setCurrentRole(res.user.role);
              localStorage.setItem('jansetu_user_role', res.user.role);
            }
          }
        })
        .catch(() => {
          // Token expired or server restarting
        });
    }
  }, [token]);

  // Authenticate with form credentials
  const loginWithCredentials = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      if (response.success && response.token) {
        setToken(response.token);
        localStorage.setItem('jansetu_jwt_token', response.token);
        localStorage.setItem('jhar_jwt_token', response.token);
        const role = response.user?.role || credentials.role || 'citizen';
        setCurrentRole(role);
        localStorage.setItem('jansetu_user_role', role);
        localStorage.setItem('jhar_user_role', role);
        const roleDefault = USERS_BY_ROLE[role] || USERS_BY_ROLE.citizen;
        const freshUser = { ...roleDefault, ...response.user };
        setUserData(freshUser);
        return roleDefault?.homeRoute || '/';
      }
    } catch (err) {
      console.warn('Backend login error, using client fallback:', err.message);
    }

    // Local fallback
    const role = credentials.role || 'citizen';
    setCurrentRole(role);
    localStorage.setItem('jansetu_user_role', role);
    localStorage.setItem('jhar_user_role', role);
    const userFallback = {
      ...(USERS_BY_ROLE[role] || USERS_BY_ROLE.citizen),
      email: credentials.identifier || credentials.email || USERS_BY_ROLE[role]?.email,
      name: credentials.name || USERS_BY_ROLE[role]?.name
    };
    setUserData(userFallback);
    return USERS_BY_ROLE[role]?.homeRoute || '/';
  };

  // Quick 1-click Demo Persona Login
  const quickDemoLogin = async (role) => {
    try {
      const response = await authApi.quickDemo(role);
      if (response.success && response.token) {
        setToken(response.token);
        localStorage.setItem('jansetu_jwt_token', response.token);
        localStorage.setItem('jhar_jwt_token', response.token);
        setCurrentRole(role);
        localStorage.setItem('jansetu_user_role', role);
        localStorage.setItem('jhar_user_role', role);
        const roleDefault = USERS_BY_ROLE[role] || USERS_BY_ROLE.citizen;
        const freshUser = { ...roleDefault, ...response.user };
        setUserData(freshUser);
        return roleDefault?.homeRoute || '/';
      }
    } catch (err) {
      console.warn('Quick demo API fallback:', err.message);
    }

    // Local fallback
    setCurrentRole(role);
    localStorage.setItem('jansetu_user_role', role);
    localStorage.setItem('jhar_user_role', role);
    setUserData(USERS_BY_ROLE[role]);
    return USERS_BY_ROLE[role]?.homeRoute || '/';
  };

  // Register a new custom user
  const registerUser = async (registrationData) => {
    try {
      const response = await authApi.register(registrationData);
      if (response.success && response.token) {
        setToken(response.token);
        localStorage.setItem('jansetu_jwt_token', response.token);
        localStorage.setItem('jhar_jwt_token', response.token);
        const role = response.user?.role || registrationData.role || 'citizen';
        setCurrentRole(role);
        localStorage.setItem('jansetu_user_role', role);
        localStorage.setItem('jhar_user_role', role);
        const baseRoleData = USERS_BY_ROLE[role] || USERS_BY_ROLE.citizen;
        const newCleanUser = {
          role: role,
          roleLabel: baseRoleData.roleLabel,
          name: response.user?.name || registrationData.name,
          email: response.user?.email || registrationData.email,
          phone: response.user?.phone || registrationData.phone || '',
          district: response.user?.organization_or_district || registrationData.organization_or_district || 'Jharkhand',
          karmaPoints: 0,
          badgesCount: 0,
          homeRoute: baseRoleData.homeRoute,
          avatar: response.user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(registrationData.name || 'User')}`,
          ...response.user
        };
        setUserData(newCleanUser);
        return baseRoleData.homeRoute || '/';
      }
      return { error: response.message || 'Registration failed' };
    } catch (err) {
      console.warn('Registration error:', err.message);
      // Fallback local registration
      const role = registrationData.role || 'citizen';
      const baseRoleData = USERS_BY_ROLE[role] || USERS_BY_ROLE.citizen;
      setCurrentRole(role);
      localStorage.setItem('jansetu_user_role', role);
      const cleanLocalUser = {
        role: role,
        roleLabel: baseRoleData.roleLabel,
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone || '',
        district: registrationData.organization_or_district || 'Jharkhand',
        karmaPoints: 0,
        badgesCount: 0,
        homeRoute: baseRoleData.homeRoute,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(registrationData.name || 'User')}`
      };
      setUserData(cleanLocalUser);
      return baseRoleData.homeRoute || '/';
    }
  };

  // Backward compatible login method
  const login = (role) => {
    return quickDemoLogin(role);
  };

  const logout = () => {
    setCurrentRole(null);
    setToken(null);
    setUserData(null);
    localStorage.removeItem('jansetu_user_role');
    localStorage.removeItem('jansetu_jwt_token');
    localStorage.removeItem('jansetu_user_data');
    localStorage.removeItem('jhar_user_role');
    localStorage.removeItem('jhar_jwt_token');
  };

  const currentUser = userData || (currentRole ? USERS_BY_ROLE[currentRole] : null);

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        currentUser,
        token,
        login,
        loginWithCredentials,
        quickDemoLogin,
        registerUser,
        logout,
        isAuth: !!currentRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
