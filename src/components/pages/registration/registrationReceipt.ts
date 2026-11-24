type RegistrationReceipt = {
  totalStudents: number;
  schoolName: string;
  registrationId: string;
};

const receiptKey = "kidscon_registration_receipt";
let currentReceipt: RegistrationReceipt | null = null;

export function saveRegistrationReceipt(receipt: RegistrationReceipt) {
  currentReceipt = receipt;
  try {
    sessionStorage.setItem(receiptKey, JSON.stringify(receipt));
  } catch {
    // The receipt remains available for this navigation if storage is disabled.
  }
}

export function readRegistrationReceipt(): RegistrationReceipt | null {
  if (currentReceipt) return currentReceipt;

  try {
    const stored = sessionStorage.getItem(receiptKey);
    if (stored) currentReceipt = JSON.parse(stored) as RegistrationReceipt;
  } catch {
    return null;
  }
  return currentReceipt;
}
