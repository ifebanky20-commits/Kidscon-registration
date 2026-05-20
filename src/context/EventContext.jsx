import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    supabase
      .from('events')
      .select('id, name, date')
      .order('date', { ascending: false })
      .then(({ data }) => {
        const evts = data || [];
        setEvents(evts);
        // Default to the most recent event
        if (evts.length > 0) setSelectedEventId(evts[0].id);
      });
  }, []);

  return (
    <EventContext.Provider value={{ events, selectedEventId, setSelectedEventId }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEvent must be used within an EventProvider');
  return context;
}
