import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/Logo';
import { useAuthStore } from '@/stores/authStore';
import {
  ArrowLeft,
  Users,
  Settings,
  Shield,
  BarChart3,
  Search,
  MoreVertical,
  Crown,
  Ban,
  CheckCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Placeholder users
const mockUsers = [
  { id: '1', email: 'john@example.com', name: 'John Doe', plan: 'pro', status: 'active', projects: 12 },
  { id: '2', email: 'jane@example.com', name: 'Jane Smith', plan: 'free', status: 'active', projects: 3 },
  { id: '3', email: 'bob@example.com', name: 'Bob Wilson', plan: 'free', status: 'blocked', projects: 0 },
];

const stats = [
  { label: 'Total Users', value: '1,234', icon: Users },
  { label: 'Pro Users', value: '156', icon: Crown },
  { label: 'Total Projects', value: '5,678', icon: BarChart3 },
  { label: 'Active Today', value: '89', icon: CheckCircle },
];

export default function Admin() {
  const { user, signOut } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/app" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Logo />
              <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.email}
              </span>
              <Button variant="ghost" size="icon" onClick={() => signOut()}>
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users and monitor platform activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="p-6 rounded-xl bg-card/50 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold text-gradient-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-semibold">Users</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-10" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">User</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">Plan</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">Status</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">Projects</th>
                  <th className="text-right text-sm font-medium text-muted-foreground p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-sm text-muted-foreground">{u.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={u.plan === 'pro' ? 'default' : 'secondary'}>
                        {u.plan === 'pro' && <Crown className="h-3 w-3 mr-1" />}
                        {u.plan.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={u.status === 'active' ? 'outline' : 'destructive'}>
                        {u.status === 'blocked' && <Ban className="h-3 w-3 mr-1" />}
                        {u.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{u.projects}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
