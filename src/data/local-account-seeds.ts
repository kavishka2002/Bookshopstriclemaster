export interface ProvisionedAccountSeed {
  id: string;
  username: string;
  shopName: string;
  ownerContact: string;
  passwordHash: string;
  salt: string;
  active: boolean;
  createdAt: number;
  role?: "admin" | "shop";
  mustChangePassword?: boolean;
}

export const provisionedAccountSeeds: ProvisionedAccountSeed[] = [
  {
    id: "admin-p321",
    username: "P321",
    shopName: "Little Paper Bookshop",
    ownerContact: "",
    passwordHash: "iwbRXrlnVVAAKGuhtOvj2ArW736A62jZooTr3Y9MaTM=",
    salt: "i0BGr6kR/6/wbXAYMynwGA==",
    active: true,
    createdAt: 1792755911000,
    role: "admin",
    mustChangePassword: false
  }
];
