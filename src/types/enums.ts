// src/types/enums.ts
export const UserRole = {
  ADMIN:     'ADMIN',
  SELLER:    'SELLER',
  WAREHOUSE: 'WAREHOUSE',
  BILLING:   'BILLING',
} as const
export type UserRole = typeof UserRole[keyof typeof UserRole]

export const PaymentStatus = {
  PENDING:  'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus]

export const SunatStatus = {
  PENDING:  'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const
export type SunatStatus = typeof SunatStatus[keyof typeof SunatStatus]