import { supabase } from '../src/lib/supabase.js';
import axios from 'axios';

const BATCH_SIZE = 100;
const MAX_RETRIES = 5;
const DELAY_BETWEEN_REQUESTS = 500;
const RETRY_DELAY = 2000;

async function importFDAMedications() {
  try {
    console.log('Starting FDA medications import...');
    let totalImported = 0;
    let skipCount = 0;
    let hasMore = true;

    // First, get total count
    const countResponse = await axios.get(
      'https://api.fda.gov/drug/ndc.json?limit=1'
    );

    const totalRecords = countResponse.data.meta.results.total;
    console.log(`Total FDA records available: ${totalRecords}`);

    // Import all records with pagination
    while (hasMore) {
      let retries = MAX_RETRIES;
      while (retries > 0) {
        try {
          const response = await axios.get('https://api.fda.gov/drug/ndc.json', {
            params: {
              limit: BATCH_SIZE,
              skip: skipCount
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
            last_synced: new Date().toISOString()
          }));

          const { error } = await supabase
            .from('medications')
            .upsert(medications, {
              onConflict: 'ndc_code',
              ignoreDuplicates: false
            });

          if (error) throw error;

          totalImported += medications.length;
          skipCount += medications.length;
          
          const progress = ((skipCount / totalRecords) * 100).toFixed(1);
          console.log(`✓ Imported ${medications.length} medications (Total: ${totalImported}, Progress: ${progress}%)`);

          hasMore = skipCount < totalRecords;
          break;

        } catch (error) {
          retries--;
          console.error(`Error on batch starting at ${skipCount}:`, error.message);
          
          if (retries === 0) {
            console.error(`Failed to process batch after ${MAX_RETRIES} attempts`);
            skipCount += BATCH_SIZE;
          } else {
            console.log(`Retrying... (${retries} attempts remaining)`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    }

    console.log(`\nImport completed! Total medications imported: ${totalImported}`);
    return true;
  } catch (error) {
    console.error('Error importing medications:', error);
    return false;
  }
}

importFDAMedications()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));