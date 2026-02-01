import { useState, useEffect } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';
import { supabase } from '../lib/supabase';

export interface Appointment {
  id: string;
  user_id: string;
  doctor_name: string;
  doctor_specialty: string;
  doctor_avatar: string;
  hospital_name: string;
  appointment_date: string;
  appointment_time: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  symptoms: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentData {
  doctor_name: string;
  doctor_specialty: string;
  doctor_avatar?: string;
  hospital_name: string;
  appointment_date: string;
  appointment_time: string | Date;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  symptoms?: string;
}

export const useAppointments = () => {
  const { user } = useFirebaseAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user?.uid) {
        console.log('Fetching appointments for user:', user.uid);
        
        // Try to fetch from Supabase database first
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', user.uid)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Fetched appointments from database:', data);
        setAppointments(data || []);
      } else {
        setAppointments([]);
      }
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new appointment
  const createAppointment = async (appointmentData: CreateAppointmentData): Promise<Appointment | null> => {
    try {
      setError(null);

      // Validate user authentication
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      // Validate required appointment data
      if (!appointmentData.doctor_name?.trim()) {
        throw new Error('Doctor name is required');
      }
      if (!appointmentData.doctor_specialty?.trim()) {
        throw new Error('Doctor specialty is required');
      }
      if (!appointmentData.hospital_name?.trim()) {
        throw new Error('Hospital name is required');
      }
      if (!appointmentData.appointment_date?.trim()) {
        throw new Error('Appointment date is required');
      }
      if (!appointmentData.appointment_time) {
        throw new Error('Appointment time is required');
      }
      if (!appointmentData.patient_name?.trim()) {
        throw new Error('Patient name is required');
      }
      if (!appointmentData.patient_phone?.trim()) {
        throw new Error('Patient phone is required');
      }
      if (!appointmentData.patient_email?.trim()) {
        throw new Error('Patient email is required');
      }

      // Validate date format (should be YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(appointmentData.appointment_date)) {
        throw new Error('Invalid date format. Expected YYYY-MM-DD');
      }

      // Process and validate appointment time
      let formattedTime: string;
      
      if (appointmentData.appointment_time instanceof Date) {
        // Convert Date object to HH:mm format
        const hours = appointmentData.appointment_time.getHours().toString().padStart(2, '0');
        const minutes = appointmentData.appointment_time.getMinutes().toString().padStart(2, '0');
        formattedTime = `${hours}:${minutes}`;
      } else if (typeof appointmentData.appointment_time === 'string') {
        const timeString = appointmentData.appointment_time.trim();
        
        // Check if it's already in HH:mm format
        const hhmmRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (hhmmRegex.test(timeString)) {
          // Ensure it's properly zero-padded
          const [hours, minutes] = timeString.split(':');
          formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        } else {
          // Check if it's in HH:mm AM/PM format
          const ampmRegex = /^(1[0-2]|0?[1-9]):([0-5][0-9])\s?(AM|PM)$/i;
          const match = timeString.match(ampmRegex);
          
          if (match) {
            let hours = parseInt(match[1]);
            const minutes = match[2];
            const period = match[3].toUpperCase();
            
            // Convert to 24-hour format
            if (period === 'PM' && hours !== 12) {
              hours += 12;
            } else if (period === 'AM' && hours === 12) {
              hours = 0;
            }
            
            formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
          } else {
            throw new Error('Invalid time format. Expected HH:mm or HH:mm AM/PM');
          }
        }
      } else {
        throw new Error('Appointment time must be a Date object or string');
      }

      console.log('Creating appointment with user ID:', user.uid);
      console.log('Validated appointment data:', appointmentData);
      console.log('Formatted time:', formattedTime);
      console.log('User object:', user);
      
      // Insert into Supabase database
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          user_id: user.uid,
          doctor_name: appointmentData.doctor_name.trim(),
          doctor_specialty: appointmentData.doctor_specialty.trim(),
          doctor_avatar: appointmentData.doctor_avatar || '',
          hospital_name: appointmentData.hospital_name.trim(),
          appointment_date: appointmentData.appointment_date.trim(),
          appointment_time: formattedTime,
          patient_name: appointmentData.patient_name.trim(),
          patient_phone: appointmentData.patient_phone.trim(),
          patient_email: appointmentData.patient_email.trim(),
          symptoms: appointmentData.symptoms || '',
          status: 'scheduled'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        throw new Error(`Failed to create appointment: ${error.message}`);
      }

      console.log('Appointment created successfully:', data);

      // Create notification
      try {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            user_id: user.uid,
            title: 'Appointment Confirmed',
            message: `Your appointment with ${appointmentData.doctor_name.trim()} on ${appointmentData.appointment_date.trim()} at ${appointmentData.appointment_time.trim()} has been confirmed.`,
            type: 'appointment',
            read: false
          }]);

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
          // Don't throw here - notification failure shouldn't fail the appointment creation
        }
      } catch (notifError) {
        console.error('Notification creation failed:', notifError);
        // Don't throw here - notification failure shouldn't fail the appointment creation
      }

      // Refresh appointments list
      await fetchAppointments();
      
      return data;
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      const errorMessage = err.message || 'Failed to create appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    try {
      setError(null);

      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', appointmentId)
        .eq('user_id', user.uid);

      if (error) {
        throw error;
      }

      // Refresh appointments list
      await fetchAppointments();
    } catch (err: any) {
      console.error('Error updating appointment:', err);
      setError(err.message);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId: string) => {
    await updateAppointmentStatus(appointmentId, 'cancelled');
  };

  // Get upcoming appointments (scheduled and future dates)
  const getUpcomingAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return appointments.filter(appointment => {
      if (appointment.status !== 'scheduled') return false;
      
      const appointmentDate = new Date(appointment.appointment_date);
      appointmentDate.setHours(0, 0, 0, 0);
      
      return appointmentDate >= today;
    });
  };

  // Get next upcoming appointment
  const getNextAppointment = (): Appointment | null => {
    const upcoming = getUpcomingAppointments();
    if (upcoming.length === 0) return null;
    
    // Sort by date and time
    const sorted = upcoming.sort((a, b) => {
      const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`);
      const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    return sorted[0];
  };

  // Format date for display
  const formatAppointmentDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time for comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchAppointments();
    }
  }, [user?.uid]);

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    getUpcomingAppointments,
    getNextAppointment,
    formatAppointmentDate,
    refetch: fetchAppointments
  };
};