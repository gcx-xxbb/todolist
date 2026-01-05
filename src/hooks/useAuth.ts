import { useState, useEffect } from 'react';

const useAuth = () => {
  const [auth, setAuth] = useState<string[]>([]);

  const hasPermission = (permission: string) => {
    return auth?.includes(permission);
  };

  useEffect(() => {
    const permissions = localStorage.getItem('permissions');
    if (permissions) {
      try {
        let permissionsArray = JSON.parse(permissions);
        if (permissionsArray.length > 0) {
          setAuth(permissionsArray);
        } else {
          setAuth([]);
        }
      } catch (e) {
        setAuth([]);
      }
    }
  }, []);

  return { auth, hasPermission };
};

export default useAuth;
