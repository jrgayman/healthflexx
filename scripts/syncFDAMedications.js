import { supabase } from '../src/lib/supabase.js';
import axios from 'axios';

const BATCH_SIZE = 50; // Reduced batch size
const DELAY_BETWEEN_REQUESTS = 1000; // Increased delay
const MAX_RETRIES = 3;

async function syncFDAMedications() {
  try {
    console.log('Starting FDA medications sync...');
    let totalSynced = 0;
    
    const syncStartTime = new Date().toISOString();
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      let retries = MAX_RETRIES;
      while (retries > 0) {
        try {
          const response = await axios.get('https://api.fda.gov/drug/ndc.json', {
            params: {
              limit: BATCH_SIZE,
              skip: skip
            },
            timeout: 30000
          });

          const medications = response.data.results.map(med => ({
            ndc_code: med.product_ndc,
            brand_name: med.brand_name,
            generic_name: med.generic_name,
            manufacturer: med.labeler_name,
            pharm_class: med.pharm_class?.[0] || null,
            dosage_form: med.dosage_form,
            strength: med.active_ingredients?.[0]?.strength,
            route: med.route?.[0],
            active: true,
            last_synced: syncStartTime
          }));

          const { error } = await supabase
            .from('medications')
            .upsert(medications, {
              onConflict: 'ndc_code',
              ignoreDuplicates: false
            });

          if (error) throw error;

          totalSynced += medications.length;
          skip += medications.length;
          
          console.log(`✓ Synced ${medications.length} medications (Total: ${totalSynced})`);
          hasMore = medications.length === BATCH_SIZE;
          break;

        } catch (error) {
          retries--;
          console.error(`Error on batch starting at ${skip}:`, error.message);
          
          if (retries === 0) {
            console.error(`Failed to process batch after ${MAX_RETRIES} attempts`);
            hasMore = false;
            break;
          }
          
          console.log(`Retrying... (${retries} attempts remaining)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Add delay between successful batches
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    }

    // Mark old records as inactive
    const { error: deactivateError } = await supabase
      .from('medications')
      .update({ active: false })
      .lt('last_synced', syncStartTime);

    if (deactivateError) throw deactivateError;

    console.log(`\nSync completed! Total medications synced: ${totalSynced}`);
    return true;
  } catch (error) {
    console.error('Error syncing medications:', error);
    return false;
  }
}

syncFDAMedications()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));