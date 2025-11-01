export interface PincodeData {
  pincode: string;
  city: string;
  state: string;
  district: string;
}

/**
 * Fetches address details based on Indian pincode
 * Uses India Post Pincode API
 */
export async function fetchPincodeData(pincode: string): Promise<PincodeData | null> {
  try {
    // Remove any non-digit characters
    const cleanPincode = pincode.replace(/\D/g, '');
    
    // Validate pincode format (6 digits)
    if (cleanPincode.length !== 6) {
      return null;
    }

    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPincode}`);
    const data = await response.json();

    if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
      const postOffice = data[0].PostOffice[0];
      // Priority: Block (sub-district) > Region > Name > District
      // This gives the most accurate city/town matching the pincode
      const city = postOffice.Block || postOffice.Region || postOffice.Name || postOffice.District || '';
      return {
        pincode: cleanPincode,
        city: city,
        state: postOffice.State || '',
        district: postOffice.District || '',
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching pincode data:', error);
    return null;
  }
}

/**
 * Formats phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

/**
 * Validates Indian mobile number
 */
export function validateMobileNumber(mobile: string): boolean {
  const cleaned = mobile.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validates Indian pincode
 */
export function validatePincode(pincode: string): boolean {
  const cleaned = pincode.replace(/\D/g, '');
  return /^\d{6}$/.test(cleaned);
}

