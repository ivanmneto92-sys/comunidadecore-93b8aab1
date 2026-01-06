import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Crown, Shield, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserWithDetails {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  role: 'admin' | 'moderator' | 'user';
  tier: 'free' | 'plus' | 'elite';
}

export function UserManager() {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Fetch memberships
      const { data: memberships } = await supabase
        .from('memberships')
        .select('user_id, tier');

      const usersWithDetails: UserWithDetails[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        const userMembership = memberships?.find(m => m.user_id === profile.id);
        
        return {
          ...profile,
          role: (userRole?.role as 'admin' | 'moderator' | 'user') || 'user',
          tier: (userMembership?.tier as 'free' | 'plus' | 'elite') || 'free'
        };
      });

      setUsers(usersWithDetails);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    setUpdating(true);
    try {
      // First delete existing role
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (error) throw error;

      // Log the action
      await supabase.from('admin_activity_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'role_change',
        target_user_id: userId,
        details: { new_role: newRole }
      });

      toast.success('Role atualizada com sucesso');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Erro ao atualizar role');
    } finally {
      setUpdating(false);
    }
  };

  const updateUserTier = async (userId: string, newTier: 'free' | 'plus' | 'elite') => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('memberships')
        .update({ tier: newTier, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;

      // Log the action
      await supabase.from('admin_activity_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'membership_change',
        target_user_id: userId,
        details: { new_tier: newTier }
      });

      toast.success('Membership atualizada com sucesso');
      fetchUsers();
    } catch (error) {
      console.error('Error updating tier:', error);
      toast.error('Erro ao atualizar membership');
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = search === '' || 
      user.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.username?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesTier = tierFilter === 'all' || user.tier === tierFilter;
    return matchesSearch && matchesRole && matchesTier;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500/20 text-red-500"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-500/20 text-blue-500"><Shield className="h-3 w-3 mr-1" />Mod</Badge>;
      default:
        return <Badge variant="outline"><User className="h-3 w-3 mr-1" />User</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'elite':
        return <Badge className="bg-yellow-500/20 text-yellow-500"><Crown className="h-3 w-3 mr-1" />Elite</Badge>;
      case 'plus':
        return <Badge className="bg-primary/20 text-primary"><Crown className="h-3 w-3 mr-1" />Plus</Badge>;
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderador</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="plus">Plus</SelectItem>
                <SelectItem value="elite">Elite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Usuários
            <Badge variant="outline">{filteredUsers.length} usuários</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>{user.display_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.display_name || 'Sem nome'}</p>
                          <p className="text-xs text-muted-foreground">@{user.username || 'sem-username'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getTierBadge(user.tier)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.created_at), "dd MMM yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedUser(user)}
                          >
                            Gerenciar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Gerenciar Usuário</DialogTitle>
                          </DialogHeader>
                          {selectedUser && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={selectedUser.avatar_url || undefined} />
                                  <AvatarFallback>{selectedUser.display_name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{selectedUser.display_name}</p>
                                  <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">Alterar Role</label>
                                <Select 
                                  defaultValue={selectedUser.role}
                                  onValueChange={(value) => updateUserRole(selectedUser.id, value as any)}
                                  disabled={updating}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">Usuário</SelectItem>
                                    <SelectItem value="moderator">Moderador</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">Alterar Membership</label>
                                <Select 
                                  defaultValue={selectedUser.tier}
                                  onValueChange={(value) => updateUserTier(selectedUser.id, value as any)}
                                  disabled={updating}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="free">Free</SelectItem>
                                    <SelectItem value="plus">Plus</SelectItem>
                                    <SelectItem value="elite">Elite</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
