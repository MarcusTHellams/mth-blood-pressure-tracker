'use client';

import { createContext, PropsWithChildren, useContext, useRef } from 'react';
import { createStore, useStore } from 'zustand';
import { produce } from 'immer';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';

type DaysAgo = '30' | '60' | '90' | '';

export const getStartAndEndDates = ({
	daysAgo,
	dateRange,
}: {
	daysAgo: DaysAgo;
	dateRange: DateRange | undefined;
}) => {
	let now = new Date();
	let startDate: Date;

	if (dateRange && dateRange.from && dateRange.to) {
		startDate = dateRange.from;
		now = dateRange.to;
		return [
			startDate.toISOString(),
			now.toISOString(),
		] as const;
	}

	if (daysAgo) {
		startDate = subDays(now, +daysAgo);
		return [
			startDate.toISOString(),
			now.toISOString(),
		] as const;
	}
	return ['', ''] as const;
};

export const QueryKeyContext = createContext<QueryKeyApi | undefined>(
	undefined
);

export type QueryKeyApi = ReturnType<typeof getQueryKeyStore>;

export const useQueryKeyStore = <T,>(selector: (store: QueryKeyStore) => T) => {
	const context = useContext(QueryKeyContext);
	if (!context) {
		throw new Error();
	}
	return useStore(context, selector);
};

export type QueryKeyState = {
	queryKey: [string, string, string];
	startDate: string;
	endDate: string;
	dateRange: DateRange | undefined;
	daysAgo: DaysAgo;
};

export type QueryKeyActions = {
	updateState: (updateFn: (state: QueryKeyState) => void) => void;
	updateDaysAgo: (newDaysAgo: DaysAgo) => void;
	updateDateRange: (newDateRange: DateRange | undefined) => void;
	reset: () => void;
};

export type QueryKeyStore = QueryKeyState & QueryKeyActions;

const [startDate, endDate] = getStartAndEndDates({
	daysAgo: '30',
	dateRange: undefined,
});

export const initialQueryKeyState: QueryKeyState = {
	queryKey: ['bpReadings', startDate, endDate],
	startDate,
	endDate,
	dateRange: undefined,
	daysAgo: '30',
};

export const getQueryKeyStore = (
	initialState: QueryKeyState = initialQueryKeyState
) => {
	return createStore<QueryKeyStore>()((set) => ({
		...initialState,
		updateState: (updateFn: (state: QueryKeyStore) => void) =>
			set((state) => produce(state, updateFn)),
		updateDaysAgo: (newDaysAgo) => {
			set((state) => {
				return produce(state, (draft) => {
					draft.daysAgo = newDaysAgo;
					draft.dateRange = undefined;
					const [startDate, endDate] = getStartAndEndDates({
						dateRange: draft.dateRange,
						daysAgo: draft.daysAgo,
					});
					draft.queryKey[1] = startDate;
					draft.queryKey[2] = endDate;
				});
			});
		},
		updateDateRange: (newDateRange) => {
			set((state) => {
				return produce(state, (draft) => {
					draft.dateRange = newDateRange;
					draft.daysAgo = '';
					const [startDate, endDate] = getStartAndEndDates({
						dateRange: draft.dateRange,
						daysAgo: draft.daysAgo,
					});
					draft.queryKey[1] = startDate;
					draft.queryKey[2] = endDate;
				});
			});
		},
		reset: () => {
			set((state) => {
				return produce(state, (draft) => {
					draft.daysAgo = '30';
					draft.dateRange = undefined;
					const [startDate, endDate] = getStartAndEndDates({
						dateRange: draft.dateRange,
						daysAgo: draft.daysAgo,
					});
					draft.queryKey[1] = startDate;
					draft.queryKey[2] = endDate;
				});
			});
		},
	}));
};

export const QueryKeyProvider = ({ children }: PropsWithChildren) => {
	const store = useRef(getQueryKeyStore());
	return (
		<QueryKeyContext.Provider value={store.current}>
			{children}
		</QueryKeyContext.Provider>
	);
};
