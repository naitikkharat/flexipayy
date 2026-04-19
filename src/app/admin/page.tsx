import type { Metadata } from 'next';
import AdminClient from './AdminClient';

export const metadata: Metadata = {
  title: 'FlexiPay Admin',
  description: 'Admin panel for FlexiPay operations.',
};

export default function AdminPage() {
  return <AdminClient />;
}
