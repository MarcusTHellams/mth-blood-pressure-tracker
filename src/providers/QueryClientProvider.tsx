'use client';

import { PropsWithChildren } from 'react';
import { QueryClientProvider as QCP, QueryClient } from '@tanstack/react-query';

const client = new QueryClient();

export const QueryClientProvider = ({ children }: PropsWithChildren) => {
	return <QCP client={client}>{children}</QCP>;
};
