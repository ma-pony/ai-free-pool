import { redirect } from 'next/navigation';

export default async function Dashboard(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  // Redirect to profile page
  redirect(`/${locale}/dashboard/profile`);
}
