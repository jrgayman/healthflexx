import { supabase } from './supabase';

export async function executeSQL(sql) {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error executing SQL:', error);
    return false;
  }
}

export async function executeSQLWithResults(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql_with_results', { sql });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error executing SQL with results:', error);
    return null;
  }
}