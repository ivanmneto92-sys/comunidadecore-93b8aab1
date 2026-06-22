import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Hash,
  GraduationCap,
  Users,
  MessageSquare,
  LayoutDashboard,
  BarChart3,
  Trophy,
  BookOpen,
  Settings,
  Wallet,
  Flame,
} from "lucide-react";

type Channel = { id: string; name: string; slug: string | null };
type Tutorial = { id: string; title: string };
type Profile = { id: string; display_name: string | null; avatar_url: string | null };
type Post = { id: string; content: string };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Preload channels once when opened
  useEffect(() => {
    if (!open || channels.length > 0) return;
    supabase
      .from("channels")
      .select("id, name, slug")
      .order("sort_order")
      .then(({ data }) => setChannels((data as Channel[]) ?? []));
  }, [open, channels.length]);

  // Debounced dynamic search
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setTutorials([]);
      setUsers([]);
      setPosts([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const like = `%${q}%`;
      const [tut, prof, msg] = await Promise.all([
        supabase.from("tutorials").select("id, title").ilike("title", like).limit(6),
        supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .ilike("display_name", like)
          .limit(6),
        supabase
          .from("community_posts")
          .select("id, content")
          .ilike("content", like)
          .limit(6),
      ]);
      setTutorials((tut.data as Tutorial[]) ?? []);
      setUsers((prof.data as Profile[]) ?? []);
      setPosts((msg.data as Post[]) ?? []);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [query, open]);

  const go = (path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  const quickActions = useMemo(
    () => [
      { label: "Dashboard", icon: LayoutDashboard, path: "/app" },
      { label: "Comunidade", icon: MessageSquare, path: "/community" },
      { label: "Academy", icon: BookOpen, path: "/academy" },
      { label: "Resultados", icon: BarChart3, path: "/results" },
      { label: "Conquistas", icon: Trophy, path: "/achievements" },
      { label: "Temporadas", icon: Flame, path: "/seasons" },
      { label: "Afiliados", icon: Wallet, path: "/affiliates" },
      { label: "Perfil", icon: Settings, path: "/profile" },
    ],
    []
  );

  if (!user) return null;

  const filteredChannels = query
    ? channels.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : channels.slice(0, 6);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Buscar canais, tutoriais, usuários, posts..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? "Buscando..." : "Nenhum resultado encontrado."}
        </CommandEmpty>

        {!query && (
          <>
            <CommandGroup heading="Navegar">
              {quickActions.map((a) => (
                <CommandItem
                  key={a.path}
                  value={`nav-${a.label}`}
                  onSelect={() => go(a.path)}
                >
                  <a.icon className="mr-2 h-4 w-4" />
                  {a.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {filteredChannels.length > 0 && (
          <CommandGroup heading="Canais">
            {filteredChannels.map((c) => (
              <CommandItem
                key={c.id}
                value={`channel-${c.name}`}
                onSelect={() => go(`/community?channel=${c.slug ?? c.id}`)}
              >
                <Hash className="mr-2 h-4 w-4" />
                {c.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {tutorials.length > 0 && (
          <CommandGroup heading="Tutoriais">
            {tutorials.map((t) => (
              <CommandItem
                key={t.id}
                value={`tutorial-${t.title}`}
                onSelect={() => go(`/academy?tutorial=${t.id}`)}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                {t.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {users.length > 0 && (
          <CommandGroup heading="Usuários">
            {users.map((u) => (
              <CommandItem
                key={u.id}
                value={`user-${u.display_name}-${u.id}`}
                onSelect={() => go(`/profile?user=${u.id}`)}
              >
                <Users className="mr-2 h-4 w-4" />
                {u.display_name ?? "Sem nome"}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {posts.length > 0 && (
          <CommandGroup heading="Posts">
            {posts.map((p) => (
              <CommandItem
                key={p.id}
                value={`post-${p.id}`}
                onSelect={() => go(`/community?post=${p.id}`)}
              >
                <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">{p.content.slice(0, 80)}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
