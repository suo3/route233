export async function decodeVIN(vin: string) {
  try {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
    const data = await response.json();
    
    // Extract relevant fields
    const results = data.Results;
    const info: Record<string, string> = {};
    
    results.forEach((item: any) => {
      if (item.Value && item.Variable) {
        info[item.Variable] = item.Value;
      }
    });
    
    return {
      make: info['Make'],
      model: info['Model'],
      year: info['Model Year'],
      type: info['Vehicle Type'],
      raw: info
    };
  } catch (error) {
    console.error('VIN Decode Error:', error);
    return null;
  }
}
