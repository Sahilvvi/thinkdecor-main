import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/brand/Logo';
import { useAuthStore } from '@/stores/authStore';
import { useProjects, useCreateProject, useDeleteProject, useDuplicateProject } from '@/hooks/useProjects';
import { useProfile, usePlanLimits } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  Settings, 
  LogOut,
  FolderOpen,
  MoreVertical,
  Clock,
  Loader2,
  Copy,
  Trash2,
  Edit3,
  Crown,
  Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useIsAdmin } from '@/hooks/useProfile';

export default function Dashboard() {
  const { user, signOut } = useAuthStore();
  const { data: projects, isLoading } = useProjects();
  const { data: profile } = useProfile();
  const { data: isAdmin } = useIsAdmin();
  const planLimits = usePlanLimits();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const duplicateProject = useDuplicateProject();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleCreateProject = async () => {
    // Check plan limits
    if (projects && projects.length >= planLimits.maxProjects) {
      toast.error(`You've reached the maximum of ${planLimits.maxProjects} projects on the free plan. Upgrade to Pro for unlimited projects.`);
      return;
    }

    try {
      const project = await createProject.mutateAsync({});
      navigate(`/app/editor/${project.id}`);
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleDuplicateProject = async (projectId: string) => {
    if (projects && projects.length >= planLimits.maxProjects) {
      toast.error(`You've reached the maximum of ${planLimits.maxProjects} projects on the free plan.`);
      return;
    }

    try {
      await duplicateProject.mutateAsync(projectId);
      toast.success('Project duplicated');
    } catch (error) {
      toast.error('Failed to duplicate project');
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      await deleteProject.mutateAsync(projectToDelete);
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const filteredProjects = projects?.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo />
              {profile?.plan === 'pro' && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {profile?.name || user?.email}
              </span>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Shield className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" asChild>
                <Link to="/app/settings">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Your Projects</h1>
            <p className="text-muted-foreground">
              {projects?.length || 0} / {planLimits.maxProjects === Infinity ? '∞' : planLimits.maxProjects} projects
            </p>
          </div>

          <Button 
            variant="hero" 
            size="lg" 
            onClick={handleCreateProject}
            disabled={createProject.isPending}
          >
            {createProject.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            New Project
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && filteredProjects.length > 0 && (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'flex flex-col gap-3'
          }>
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`group ${
                  viewMode === 'grid'
                    ? 'block'
                    : 'flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card transition-all'
                }`}
              >
                {viewMode === 'grid' ? (
                  <div className="rounded-xl overflow-hidden border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card transition-all">
                    {/* Thumbnail */}
                    <Link to={`/app/editor/${project.id}`}>
                      <div className="aspect-video bg-secondary/30 flex items-center justify-center relative cursor-pointer">
                        {project.thumbnail_url ? (
                          <img 
                            src={project.thumbnail_url} 
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,hsl(var(--secondary))_0%_50%)] bg-[length:16px_16px] opacity-30" />
                            <FolderOpen className="h-12 w-12 text-muted-foreground/50 relative z-10" />
                          </>
                        )}
                      </div>
                    </Link>
                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <Link to={`/app/editor/${project.id}`} className="flex-1 min-w-0">
                          <h3 className="font-medium truncate hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/app/editor/${project.id}`}>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Open
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateProject(project.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setProjectToDelete(project.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link to={`/app/editor/${project.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {project.thumbnail_url ? (
                          <img 
                            src={project.thumbnail_url} 
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FolderOpen className="h-6 w-6 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium truncate hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/app/editor/${project.id}`}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Open
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateProject(project.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setProjectToDelete(project.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-2xl bg-secondary/50 flex items-center justify-center mb-6">
              <FolderOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              {searchQuery 
                ? 'Try a different search term'
                : 'Create your first texture composition to get started.'
              }
            </p>
            {!searchQuery && (
              <Button variant="hero" onClick={handleCreateProject} disabled={createProject.isPending}>
                {createProject.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                Create First Project
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
              All layers and exports will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProject.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
