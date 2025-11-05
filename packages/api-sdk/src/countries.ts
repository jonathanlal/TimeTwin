import { getSupabase } from './client';
import type { Country } from './types/database';
import type { PostgrestError } from '@supabase/supabase-js';

export interface CountriesResult {
  data: Country[] | null;
  error: PostgrestError | null;
}

export interface CountryResult {
  data: Country | null;
  error: PostgrestError | null;
}

/**
 * Get all countries
 */
export async function getAllCountries(): Promise<CountriesResult> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('name', { ascending: true });

  return { data, error };
}

/**
 * Get a specific country by code
 */
export async function getCountry(code: string): Promise<CountryResult> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('code', code)
    .single();

  return { data, error };
}

/**
 * Search countries by name
 */
export async function searchCountries(query: string): Promise<CountriesResult> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name', { ascending: true });

  return { data, error };
}
