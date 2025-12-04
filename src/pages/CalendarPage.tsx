import { useEffect, useState } from 'react'
import { fetchTrainingsWithCustomer } from '../api'
import type { TrainingWithCustomer } from '../types'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'

export default function CalendarPage() {
  const [trainings, setTrainings] = useState<TrainingWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchTrainingsWithCustomer()
      .then((data) => {
        if (mounted) setTrainings(data)
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const events = trainings.map((t) => ({
    id: String(t.id),
    title: `${t.activity} (${t.customer?.firstname} ${t.customer?.lastname})`,
    start: t.date,
    end: new Date(new Date(t.date).getTime() + t.duration * 60000).toISOString(),
    extendedProps: {
      customerId: t.customer?.id,
      duration: t.duration,
      activity: t.activity,
    },
  }))

  if (loading) return <div>Loading trainings...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Training Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        height="auto"
        eventDisplay="block"
      />
    </div>
  )
}
