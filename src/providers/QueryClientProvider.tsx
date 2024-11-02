'use client';

import { PropsWithChildren } from 'react';
import { QueryClientProvider as QCP, QueryClient } from '@tanstack/react-query';

const client = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			refetchInterval: false,
			refetchIntervalInBackground: false,
			refetchOnMount: false,
			refetchOnReconnect: false,
			refetchOnWindowFocus: false,
		},
	},
});

export const QueryClientProvider = ({ children }: PropsWithChildren) => {
	return <QCP client={client}>{children}</QCP>;
};
