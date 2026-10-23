export interface ProvisionedAccountSeed {
  id: string;
  username: string;
  shopName: string;
  ownerContact: string;
  passwordHash: string;
  salt: string;
  active: boolean;
  createdAt: number;
}

export const provisionedAccountSeeds: ProvisionedAccountSeed[] = [
  // Add generated hash/salt records here. Never place plaintext passwords in this file.
];
