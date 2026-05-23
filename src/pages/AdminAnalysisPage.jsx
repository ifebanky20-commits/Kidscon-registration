import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  BarChart3, CalendarDays, Filter, PieChart as PieChartIcon, Activity,
  Users, School, Download
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useEvent } from '../context/EventContext';

const COLORS = ['#6750A4', '#7D5260', '#B3261E', '#4A4458', '#E8DEF8', '#21005D', '#31111D'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminAnalysisPage() {
  const { events, selectedEventId, setSelectedEventId } = useEvent();
  const [rawSchools, setRawSchools] = useState([]);
  const [rawStudents, setRawStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All'); // 0-11 string format

  // Fetch base data
  useEffect(() => {
    async function init() {
      setLoading(true);
      const [schoolsRes, studentsRes] = await Promise.all([
        supabase.from('schools').select('id, name, created_at, category, event_id, students(count), teachers(count)'),
        supabase.from('students').select('school_id, gender, created_at')
      ]);
      
      if (schoolsRes.data) setRawSchools(schoolsRes.data);
      if (studentsRes.data) setRawStudents(studentsRes.data);
      setLoading(false);
    }
    init();

    // Subscribe to changes to keep analysis live
    const channel = supabase.channel('analysis-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schools' }, init)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, init)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // Compute available years based on data
  const availableYears = useMemo(() => {
    const years = new Set();
    rawSchools.forEach(s => {
      if (s.created_at) years.add(new Date(s.created_at).getFullYear().toString());
    });
    return Array.from(years).sort().reverse();
  }, [rawSchools]);

  // Apply filters
  const filteredData = useMemo(() => {
    return rawSchools.filter(school => {
      if (selectedEventId && school.event_id !== selectedEventId) return false;
      
      const date = new Date(school.created_at);
      if (selectedYear !== 'All' && date.getFullYear().toString() !== selectedYear) return false;
      if (selectedMonth !== 'All' && date.getMonth().toString() !== selectedMonth) return false;

      return true;
    });
  }, [rawSchools, selectedEventId, selectedYear, selectedMonth]);

  // Compute Chart Data & Analytics
  const { 
    monthlyRegData, 
    dailyRegData,
    monthlyStudentData,
    categoryData, 
    demographicsData,
    genderData,
    insights 
  } = useMemo(() => {
    let totalSchools = 0;
    let totalStudents = 0;
    let totalTeachers = 0;
    let maleCount = 0;
    let femaleCount = 0;
    
    const monthsMap = {};
    const daysMap = {};
    const studentsByMonthMap = {};
    const catsMap = {};

    // Create a set of valid school IDs based on current filters
    const validSchoolIds = new Set(filteredData.map(s => s.id));

    filteredData.forEach(school => {
      totalSchools++;
      const stCount = school.students[0]?.count || 0;
      const tCount = school.teachers[0]?.count || 0;
      totalStudents += stCount;
      totalTeachers += tCount;

      const date = new Date(school.created_at);
      const mKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const mLabel = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
      
      const dKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dLabel = `${date.getDate()} ${MONTHS[date.getMonth()]}`;

      // Aggregate registrations per month
      if (!monthsMap[mKey]) monthsMap[mKey] = { name: mLabel, Schools: 0, sortKey: mKey };
      monthsMap[mKey].Schools += 1;

      // Aggregate registrations per day
      if (!daysMap[dKey]) daysMap[dKey] = { name: dLabel, Schools: 0, sortKey: dKey };
      daysMap[dKey].Schools += 1;

      // Aggregate categories
      const cat = school.category || 'Uncategorized';
      catsMap[cat] = (catsMap[cat] || 0) + 1;
    });

    // Process students belonging to the filtered schools
    rawStudents.forEach(student => {
      if (!validSchoolIds.has(student.school_id)) return;
      
      // Gender aggregation
      if (student.gender === 'Male') maleCount++;
      else if (student.gender === 'Female') femaleCount++;

      // Monthly student volume aggregation
      const date = new Date(student.created_at);
      const mKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const mLabel = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!studentsByMonthMap[mKey]) studentsByMonthMap[mKey] = { name: mLabel, Students: 0, sortKey: mKey };
      studentsByMonthMap[mKey].Students += 1;
    });

    const monthlyRegArr = Object.values(monthsMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    const dailyRegArr = Object.values(daysMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    const monthlyStudentArr = Object.values(studentsByMonthMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    
    const categoryArr = Object.keys(catsMap)
      .map(key => ({ name: key, value: catsMap[key] }))
      .sort((a, b) => b.value - a.value);

    // Generate accurate written insights
    let topMonthText = '';
    if (monthlyStudentArr.length > 0) {
      const topMonth = [...monthlyStudentArr].sort((a, b) => b.Students - a.Students)[0];
      const matchingRegs = monthlyRegArr.find(m => m.sortKey === topMonth.sortKey)?.Schools || 0;
      topMonthText = `${topMonth.name} represents your highest volume period, bringing in ${topMonth.Students} students across ${matchingRegs} schools.`;
    }

    let topCatText = '';
    if (categoryArr.length > 0) {
      const topCat = categoryArr[0];
      const pct = Math.round((topCat.value / totalSchools) * 100);
      topCatText = `${topCat.name} schools make up the majority of your registrations at ${pct}%.`;
    }

    const eventName = selectedEventId ? events.find(e => e.id === selectedEventId)?.name : 'all events';
    const timeFrame = selectedYear === 'All' ? 'overall' : `in ${selectedYear}`;

    let insightText = '';
    if (totalSchools === 0) {
      insightText = `There is currently no registration data available for the selected filters.`;
    } else {
      insightText = `For ${eventName} ${timeFrame}, a total of ${totalStudents} students and ${totalTeachers} teachers have been registered across ${totalSchools} schools. ${topMonthText} ${topCatText}`;
    }

    return {
      monthlyRegData: monthlyRegArr,
      dailyRegData: dailyRegArr,
      monthlyStudentData: monthlyStudentArr,
      categoryData: categoryArr,
      demographicsData: [
        { name: 'Students', value: totalStudents },
        { name: 'Teachers', value: totalTeachers }
      ],
      genderData: [
        { name: 'Male', value: maleCount },
        { name: 'Female', value: femaleCount }
      ].filter(d => d.value > 0),
      insights: insightText
    };

  }, [filteredData, rawStudents, selectedEventId, selectedYear, events]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 rounded-full border-4 border-md-secondary-container border-t-md-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-md pb-12">
      
      {/* ── Header & Filters ── */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-md-on-background tracking-tight">Analytics & Reporting</h1>
          <p className="text-md-on-surface-variant font-medium mt-1">Deep dive into registration metrics, trends, and demographics.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-md-surface-container-low p-2 rounded-2xl border border-md-outline/10 shadow-sm">
          <div className="flex items-center gap-2 pl-3 border-r border-md-outline/10 pr-2">
            <Filter size={16} className="text-md-on-surface-variant" />
            <span className="text-sm font-semibold text-md-on-surface-variant uppercase tracking-wider">Filters</span>
          </div>

          <select
            value={selectedEventId || ''}
            onChange={(e) => setSelectedEventId(e.target.value || null)}
            className="h-10 px-4 rounded-xl bg-md-surface-container border border-transparent text-md-on-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-md-primary/40 cursor-pointer hover:border-md-outline/20 transition"
          >
            <option value="">All Events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              if (e.target.value === 'All') setSelectedMonth('All');
            }}
            className="h-10 px-4 rounded-xl bg-md-surface-container border border-transparent text-md-on-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-md-primary/40 cursor-pointer hover:border-md-outline/20 transition"
          >
            <option value="All">All Years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={selectedYear === 'All'}
            className="h-10 px-4 rounded-xl bg-md-surface-container border border-transparent text-md-on-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-md-primary/40 cursor-pointer hover:border-md-outline/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="All">All Months</option>
            {MONTHS.map((m, i) => (
              <option key={i} value={i.toString()}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Written Analysis ── */}
      <Card className="rounded-[32px] border-none bg-gradient-to-br from-md-primary/10 via-md-tertiary/5 to-transparent shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Activity size={120} />
        </div>
        <CardContent className="p-8 md:p-10 relative z-10">
          <h2 className="text-sm font-bold text-md-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity size={18} />
            Smart Insights
          </h2>
          <p className="text-xl md:text-2xl text-md-on-background font-medium leading-relaxed tracking-tight max-w-4xl">
            {insights}
          </p>
        </CardContent>
      </Card>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* School Registrations Timeline */}
        <Card className="rounded-[32px] border border-md-outline/10 bg-md-surface-container-lowest shadow-sm">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-sm font-bold text-md-on-surface-variant uppercase tracking-wider mb-6 flex items-center gap-2">
              <School size={16} /> Schools Over Time
            </h3>
            <div className="h-[300px] w-full">
              {monthlyRegData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRegData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6750A4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6750A4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} cursor={{ stroke: '#6750A4', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    <Area type="monotone" dataKey="Schools" stroke="#6750A4" strokeWidth={4} fillOpacity={1} fill="url(#colorRegs)" activeDot={{ r: 6, fill: '#6750A4', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-md-on-surface-variant/50 font-medium">No data matching filters</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students Timeline */}
        <Card className="rounded-[32px] border border-md-outline/10 bg-md-surface-container-lowest shadow-sm">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-sm font-bold text-md-on-surface-variant uppercase tracking-wider mb-6 flex items-center gap-2">
              <Users size={16} /> Students Volume Over Time
            </h3>
            <div className="h-[300px] w-full">
              {monthlyStudentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStudentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} cursor={{ fill: '#7D5260', opacity: 0.1 }} />
                    <Bar dataKey="Students" fill="#7D5260" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-md-on-surface-variant/50 font-medium">No data matching filters</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demographics row */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Card className="rounded-[32px] border border-md-outline/10 bg-md-surface-container-lowest shadow-sm">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-sm font-bold text-md-on-surface-variant uppercase tracking-wider mb-6 flex items-center gap-2">
                <PieChartIcon size={16} /> School Categories
              </h3>
              <div className="h-[250px] w-full">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                        {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: '500' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-md-on-surface-variant/50 font-medium">No category data</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border border-md-outline/10 bg-md-surface-container-lowest shadow-sm">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-sm font-bold text-md-on-surface-variant uppercase tracking-wider mb-6 flex items-center gap-2">
                <PieChartIcon size={16} /> Gender Ratio
              </h3>
              <div className="h-[250px] w-full">
                {genderData.reduce((a, b) => a + b.value, 0) > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" stroke="none">
                        {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.name === 'Male' ? '#4A4458' : '#B3261E'} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: '500' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-md-on-surface-variant/50 font-medium">No gender data</div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Daily Registration Timeline Full Width */}
        <Card className="rounded-[32px] border border-md-outline/10 bg-md-surface-container-lowest shadow-sm lg:col-span-2">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-sm font-bold text-md-on-surface-variant uppercase tracking-wider mb-6 flex items-center gap-2">
              <Activity size={16} /> Daily Registration Trend
            </h3>
            <div className="h-[300px] w-full">
              {dailyRegData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyRegData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B3261E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#B3261E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} cursor={{ stroke: '#B3261E', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    <Area type="monotone" dataKey="Schools" stroke="#B3261E" strokeWidth={3} fillOpacity={1} fill="url(#colorDaily)" activeDot={{ r: 6, fill: '#B3261E', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-md-on-surface-variant/50 font-medium">No data matching filters</div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
