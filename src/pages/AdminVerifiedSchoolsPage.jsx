import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ShieldCheck, ShieldOff, Search, X, Plus, Trash2, AlertTriangle, School } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';

export default function AdminVerifiedSchoolsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Add new school state
  const [addName, setAddName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const addInputRef = useRef(null);

  // Per-row removing state
  const [removingId, setRemovingId] = useState(null);

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
    return () => supabase.removeChannel(channel);
  }, [queryClient]);

  const handleAdd = async () => {
    const name = addName.trim();
    if (!name) return;
    setAddError('');

    // Check for duplicate
    const duplicate = verifiedSchools.find(
      (s) => s.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      setAddError(`"${name}" is already on the verified list.`);
      return;
    }

    setAdding(true);
    const { error } = await supabase.from('available_schools').insert({ name });
    if (error) {
      setAddError('Failed to add school. Please try again.');
    } else {
      setAddName('');
      queryClient.invalidateQueries({ queryKey: ['verifiedSchools'] });
    }
    setAdding(false);
  };

  const handleRemove = async (school) => {
    if (!window.confirm(`Remove "${school.name}" from the verified list?`)) return;
    setRemovingId(school.id);
    await supabase.from('available_schools').delete().eq('id', school.id);
    queryClient.invalidateQueries({ queryKey: ['verifiedSchools'] });
    setRemovingId(null);
  };

  const filtered = debouncedSearch
    ? verifiedSchools.filter((s) =>
        s.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : verifiedSchools;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-md pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-md-on-background tracking-tight flex items-center gap-3">
            <ShieldCheck size={28} className="text-emerald-500" />
            Verified Schools
          </h1>
          <p className="text-md-on-surface-variant font-medium mt-1">
            Schools on this list show a &quot;Verified&quot; badge on the registration form.
          </p>
        </div>

        {/* Count badge */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 text-center shrink-0">
          <p className="text-3xl font-extrabold text-emerald-700 leading-none">{verifiedSchools.length}</p>
          <p className="text-xs font-semibold text-emerald-600 mt-1 uppercase tracking-wide">
            Verified School{verifiedSchools.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Add new school */}
      <div className="bg-md-surface-container-low border border-md-outline/10 rounded-[24px] p-6 space-y-4">
        <p className="text-sm font-bold text-md-on-surface-variant uppercase tracking-widest">
          Add a School to the Verified List
        </p>
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <School size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant pointer-events-none" />
            <input
              ref={addInputRef}
              type="text"
              value={addName}
              onChange={(e) => { setAddName(e.target.value); setAddError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Enter school name exactly as it appears…"
              className="w-full h-12 pl-11 pr-4 bg-md-surface-container rounded-full border border-md-outline/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 text-md-on-background placeholder:text-md-on-surface-variant/50 transition-all font-medium"
            />
          </div>
          <Button
            onClick={handleAdd}
            disabled={adding || !addName.trim()}
            className="gap-2 h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding…</>
            ) : (
              <><Plus size={18} /> Add School</>
            )}
          </Button>
        </div>

        {addError && (
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl">
            <AlertTriangle size={16} className="shrink-0" />
            {addError}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant pointer-events-none" />
        <input
          type="text"
          placeholder="Search verified schools…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 pl-12 pr-10 bg-md-surface-container rounded-full border border-md-outline/10 focus:outline-none focus:ring-2 focus:ring-md-primary/50 text-md-on-background placeholder:text-md-on-surface-variant/50 transition-all font-medium"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant hover:text-md-on-background transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Count info */}
      <p className="text-sm text-md-on-surface-variant font-medium -mt-4">
        {loading
          ? 'Loading…'
          : debouncedSearch
          ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${debouncedSearch}"`
          : `${verifiedSchools.length} verified school${verifiedSchools.length !== 1 ? 's' : ''}`}
      </p>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-md-outline/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-[28px] overflow-hidden md-elevation-1 border border-md-outline/5 bg-md-surface-container-low">
          <Table className="min-w-max whitespace-nowrap">
            <TableHeader className="bg-md-surface-container">
              <TableRow className="border-md-outline/10">
                <TableHead className="py-5 w-12 text-center font-semibold">#</TableHead>
                <TableHead className="py-5 font-semibold">School Name</TableHead>
                <TableHead className="py-5 font-semibold">Date Added</TableHead>
                <TableHead className="py-5 text-right font-semibold sticky right-0 bg-md-surface-container/90 backdrop-blur-md">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-16 text-md-on-surface-variant font-medium">
                    <div className="flex flex-col items-center gap-3">
                      <ShieldCheck size={40} className="text-md-on-surface-variant/30" />
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
                    className="group hover:bg-md-surface-container transition-colors border-md-outline/5"
                  >
                    <TableCell className="text-center text-md-on-surface-variant font-medium py-5">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex items-center gap-2.5 font-bold text-md-on-background">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <ShieldCheck size={15} className="text-emerald-600" />
                        </div>
                        {school.name}
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                          Verified
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-md-on-surface-variant font-medium py-5 text-sm">
                      {new Date(school.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right py-3 sticky right-0 group-hover:bg-md-surface-container bg-md-surface-container-low transition-colors duration-200">
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
      )}
    </div>
  );
}
