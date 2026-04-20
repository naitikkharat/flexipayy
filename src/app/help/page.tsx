import type { Metadata } from 'next';
import HelpClient from './HelpClient';

export const metadata: Metadata = {
  title: 'Help & Support | FlexiPay',
  description: 'Generate a support ticket and get help from our team.',
};

export default function HelpPage() {
  return <HelpClient />;
}
