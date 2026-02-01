import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          doctor_name: string;
          doctor_specialty: string;
          doctor_avatar?: string;
          hospital_name: string;
          appointment_date: string;
          appointment_time: string;
          patient_name: string;
          patient_phone: string;
          patient_email: string;
          symptoms?: string;
          status?: 'scheduled' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          doctor_name?: string;
          doctor_specialty?: string;
          doctor_avatar?: string;
          hospital_name?: string;
          appointment_date?: string;
          appointment_time?: string;
          patient_name?: string;
          patient_phone?: string;
          patient_email?: string;
          symptoms?: string;
          status?: 'scheduled' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};