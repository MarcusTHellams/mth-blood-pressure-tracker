import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { QueryClientProvider } from '@/providers';
import { Toaster } from '@/components';

const geistSans = localFont({
	src: './fonts/GeistVF.woff',
	variable: '--font-geist-sans',
	weight: '100 900',
});
const geistMono = localFont({
	src: './fonts/GeistMonoVF.woff',
	variable: '--font-geist-mono',
	weight: '100 900',
});

export const metadata: Metadata = {
	title: 'MTH Blood Pressure Tracker',
	description: 'Generated by create next app',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased prose max-w-none`}
			>
				<QueryClientProvider>{children}</QueryClientProvider>
				<Toaster richColors position="top-center" />
			</body>
		</html>
	);
}
