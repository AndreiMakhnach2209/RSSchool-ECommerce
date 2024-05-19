type Address = {
  country: string;
  city: string;
  street: string;
  postalCode: string;
};

export type FormTypeRegister = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  password: string;
  confirmPassword: string;
  shippingAddress: Address;
  billingAddress: Address;
};