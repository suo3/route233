import { decodeVIN } from './vin-utils';

const PROHIBITED_KEYWORDS = [
  'liquid', 'chemical', 'battery', 'perfume', 'aerosol', 'explosive', 
  'firearm', 'ammo', 'drug', 'narcotic'
];

const MAX_CAR_AGE_YEARS = 10;

export async function preScreenInquiry(inquiry: {
  category: string;
  description: string;
  vin?: string;
  source_url?: string;
}) {
  const { category, description, vin, source_url } = inquiry;
  const descLower = description.toLowerCase();

  // 1. Check for prohibited items
  for (const keyword of PROHIBITED_KEYWORDS) {
    if (descLower.includes(keyword)) {
      return {
        rejected: true,
        reason: `Item contains prohibited material: ${keyword}. These items cannot be shipped via our standard lanes.`
      };
    }
  }

  // 2. Automotive Logic: Check VIN for car age
  if (category === 'automotive' && vin) {
    const vinData = await decodeVIN(vin);
    if (vinData && vinData.year) {
      const year = parseInt(vinData.year);
      const currentYear = new Date().getFullYear();
      if (currentYear - year > MAX_CAR_AGE_YEARS) {
        return {
          rejected: true,
          reason: `Vehicle/Part is from ${year}. Ghana customs regulations penalize or prohibit imports older than ${MAX_CAR_AGE_YEARS} years.`
        };
      }
    }
  }

  // 3. Category specific checks
  if (category === 'electronics' && !source_url) {
    return {
      rejected: false, // Not hard reject, but maybe flag for admin
      flagged: true,
      reason: 'No source URL provided for electronics. Admin will need to source manually.'
    };
  }

  return { rejected: false, flagged: false };
}
