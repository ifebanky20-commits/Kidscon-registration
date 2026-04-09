import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { School, Trash2, Plus, AlertCircle } from 'lucide-react';

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newSchoolName, setNewSchoolName] = useState('');
  const [addingError, setAddingError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchAvailableSchools();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('available-schools-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'available_schools' },
        () => fetchAvailableSchools()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAvailableSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('available_schools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchools(data || []);
    } catch (err) {
      console.error('Error fetching available schools:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchool = async (e) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;

    setIsAdding(true);
    setAddingError('');

    try {
      const { error } = await supabase
        .from('available_schools')
        .insert([{ name: newSchoolName.trim() }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('This school name already exists.');
        }
        throw error;
      }
      
      setNewSchoolName('');
    } catch (err) {
      setAddingError(err.message || 'Failed to add school.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSchool = async (id) => {
    if (!window.confirm('Are you sure you want to delete this school from the available list? This will not delete actual registration records, only remove it from the public dropdown.')) return;

    try {
      const { error } = await supabase
        .from('available_schools')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting school:', err);
      alert('Failed to delete school.');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-md pb-12">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-md-on-background tracking-tight">Verified Schools</h1>
          <p className="text-md-on-surface-variant font-medium mt-1">Manage the official list of verified schools. A badge is shown on the registration form when a school's name matches.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add School Form */}
        <div className="lg:col-span-1">
          <Card className="rounded-[32px] md-elevation-1 bg-md-surface-container-low border-0 sticky top-8">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-md-secondary-container text-md-on-secondary-container rounded-full flex items-center justify-center">
                  <Plus size={20} />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Add Verified School</h2>
              </div>

              {addingError && (
                <div className="flex items-center gap-2 bg-md-error/10 text-md-error p-4 rounded-xl text-sm font-semibold mb-6">
                  <AlertCircle size={18} className="shrink-0" />
                  {addingError}
                </div>
              )}

              <form onSubmit={handleAddSchool} className="space-y-6">
                <Input
                  label="Official School Name"
                  placeholder="e.g. Greenwood High School"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  required
                />
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full h-12 text-base md-elevation-1"
                  disabled={isAdding || !newSchoolName.trim()}
                >
                  {isAdding ? 'Adding...' : 'Add to Verified List'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Existing Schools List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-md-outline/20 border-t-md-primary rounded-full animate-spin" />
            </div>
          ) : (
            <Table className="rounded-[28px] overflow-hidden md-elevation-1 border border-md-outline/5 bg-md-surface-container-low">
              <TableHeader className="bg-md-surface-container">
                <TableRow className="border-md-outline/10">
                  <TableHead className="py-5 font-semibold">School Name</TableHead>
                  <TableHead className="py-5 font-semibold">Date Added</TableHead>
                  <TableHead className="py-5 text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-md-on-surface-variant font-medium">
                      No verified schools have been added yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  schools.map((school) => (
                    <TableRow key={school.id} className="group hover:bg-md-surface-container transition-colors border-md-outline/5">
                      <TableCell className="font-bold text-md-on-background py-5 flex items-center gap-3">
                        <School size={16} className="text-md-on-surface-variant/50" />
                        {school.name}
                      </TableCell>
                      <TableCell className="text-md-on-surface-variant font-medium py-5">
                        {new Date(school.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right py-5">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteSchool(school.id)}
                          className="text-md-error hover:bg-md-error/10 hover:text-md-error opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

      </div>
    </div>
  );
}
