import { AdminPageHeading } from "@/components/admin/ui/AdminPageHeading";
import { House, LoaderCircle } from "lucide-react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, School, Search, ShieldCheck, ShieldOff, X } from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { supabase } from '@/lib/supabase';

export default function AdminVerifiedSchoolsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Add new school state
  const [addName, setAddName] = useState('');
  const [adding, setAdding] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);

  // Per-row removing state
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: verifiedSchoolsData, isLoading: loading } = useQuery({
    queryKey: ['verifiedSchools'],
    queryFn: async () => {
      const { data } = await supabase
        .from('available_schools')
        .select('id, name, created_at')
        .order('name', { ascending: true });
      return data || [];
    }
  });

  const verifiedSchools = verifiedSchoolsData || [];

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('verified-schools-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'available_schools' }, () => {
        queryClient.invalidateQueries({ queryKey: ['verifiedSchools'] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [queryClient]);

  const handleAdd = async () => {
    const name = addName.trim();
    if (!name) return;

    // Check for duplicate
    const duplicate = verifiedSchools.find(
      (s) => s.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      toast.error(`"${name}" is already on the verified list.`);
      return;
    }

    setAdding(true);
    const { error } = await supabase.from('available_schools').insert({ name });
    if (error) {
      toast.error('Failed to add school. Please try again.');
    } else {
      toast.success(`"${name}" added to verified list!`);
      setAddName('');
      queryClient.invalidateQueries({ queryKey: ['verifiedSchools'] });
    }
    setAdding(false);
  };

  const handleRemove = async (school: { id: string; name: string; }) => {
    if (!window.confirm(`Remove "${school.name}" from the verified list?`)) return;
    setRemovingId(school.id);
    await supabase.from('available_schools').delete().eq('id', school.id);
    toast.success(`"${school.name}" removed from verified list.`);
    queryClient.invalidateQueries({ queryKey: ['verifiedSchools'] });
    setRemovingId(null);
  };

  const filtered = debouncedSearch
    ? verifiedSchools.filter((s) =>
      s.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    : verifiedSchools;

  return (
    <div className="space-y-7 motion-safe:animate-enter [--enter-y:1.0rem] duration-300 ease-md pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <AdminPageHeading title="Verified schools" description="Manage the recognized school names shown with a verified badge during registration." />

        {/* Count badge */}
        <div className="bg-brand-wash border border-brand-line rounded-2xl px-5 py-3 text-center shrink-0">
          <p className="text-3xl font-medium text-brand-primary leading-none">{verifiedSchools.length}</p>
          <p className="text-xs font-semibold text-brand-primary mt-1 uppercase tracking-wide">
            Verified School{verifiedSchools.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Add new school */}
      <div className="bg-brand-surface border border-brand-line rounded-2xl p-6 space-y-4">
        <p className="text-sm font-medium text-brand-muted uppercase tracking-widest">
          Add a School to the Verified List
        </p>
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <House size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
            <input
              ref={addInputRef}
              type="text"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Enter school name exactly as it appears…"
              className="w-full h-12 pl-11 pr-4 bg-brand-wash rounded-xl border border-brand-line focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-brand-ink placeholder:text-brand-muted/50 transition-all font-medium"
            />
          </div>
          <Button
            onClick={handleAdd}
            disabled={adding || !addName.trim()}
            className="rounded-xl gap-2 h-12 px-6 bg-brand-action hover:bg-brand-action-hover text-white rounded-xl font-semibold shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? (
              <><span role="status" className="inline-flex items-center gap-2 text-sm"><LoaderCircle size={20} strokeWidth={1.6} className="motion-safe:animate-spin" aria-hidden="true" /><span className="sr-only">Loading</span></span> Adding…</>
            ) : (
              <><Plus size={18} /> Add School</>
            )}
          </Button>
        </div>

      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Search verified schools…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 pl-12 pr-10 bg-brand-wash rounded-xl border border-brand-line focus:outline-none focus:ring-2 focus:ring-md-primary/50 text-brand-ink placeholder:text-brand-muted/50 transition-all font-medium"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-ink transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Count info */}
      <p className="text-sm text-brand-muted font-medium -mt-4">
        {loading
          ? 'Loading…'
          : debouncedSearch
            ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${debouncedSearch}"`
            : `${verifiedSchools.length} verified school${verifiedSchools.length !== 1 ? 's' : ''}`}
      </p>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden shadow-none border border-brand-line bg-brand-surface">
        <Table className="min-w-max whitespace-nowrap">
          <TableHeader className="bg-brand-wash">
            <TableRow className="border-brand-line">
              <TableHead className="py-5 w-12 text-center font-semibold">#</TableHead>
              <TableHead className="py-5 font-semibold">School Name</TableHead>
              <TableHead className="py-5 font-semibold">Date Added</TableHead>
              <TableHead className="py-5 text-right font-semibold sticky right-0 bg-brand-wash/90 backdrop-blur-md">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell className="py-5"><Skeleton className="h-6 w-6 mx-auto rounded-full" /></TableCell>
                  <TableCell className="py-5"><Skeleton className="h-6 w-48" /></TableCell>
                  <TableCell className="py-5"><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell className="py-5 flex justify-end"><Skeleton className="h-6 w-20" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16 text-brand-muted font-medium">
                  <div className="flex flex-col items-center gap-3">
                    <ShieldCheck size={40} className="text-brand-muted/30" />
                    {debouncedSearch
                      ? `No verified schools match "${debouncedSearch}".`
                      : 'No verified schools yet. Add one above.'}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((school, idx) => (
                <TableRow
                  key={school.id}
                  className="group hover:bg-brand-wash transition-colors border-brand-line"
                >
                  <TableCell className="text-center text-brand-muted font-medium py-5">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-2.5 font-medium text-brand-ink">
                      <div className="w-8 h-8 rounded-full bg-brand-tint flex items-center justify-center shrink-0">
                        <ShieldCheck size={15} className="text-brand-primary" />
                      </div>
                      {school.name}
                      <span className="inline-flex items-center gap-1 bg-brand-tint text-brand-primary text-[10px] font-medium px-2 py-0.5 rounded-full tracking-wide">
                        Verified
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-brand-muted font-medium py-5 text-sm">
                    {new Date(school.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right py-3 sticky right-0 group-hover:bg-brand-wash bg-brand-surface transition-colors duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(school)}
                      disabled={removingId === school.id}
                      className="gap-1.5 text-md-error hover:bg-md-error/10 hover:text-md-error opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    >
                      {removingId === school.id ? (
                        <div className="w-4 h-4 border-2 border-md-error/30 border-t-md-error rounded-full animate-spin" />
                      ) : (
                        <ShieldOff size={15} />
                      )}
                      Unverify
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
