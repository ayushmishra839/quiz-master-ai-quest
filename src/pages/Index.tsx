
import { useState, useEffect } from "react";
import { AuthForm } from "@/components/AuthForm";
import { AdminDashboard } from "@/components/AdminDashboard";
import { UserDashboard } from "@/components/UserDashboard";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
};

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('quiz_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('quiz_user', JSON.stringify(userData));
    toast({
      title: "Welcome back!",
      description: `Logged in as ${userData.role}`,
    });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('quiz_user');
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-pulse text-xl font-semibold text-indigo-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {user.role === 'admin' ? (
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : (
        <UserDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default Index;
