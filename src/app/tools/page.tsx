import { redirect } from 'next/navigation';

export default function ToolsPage() {
  redirect('/marketplace?tab=tools');
}
