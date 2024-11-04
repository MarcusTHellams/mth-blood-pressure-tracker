'use client';

import { type Readings } from '@/db';
import { type DateRange } from 'react-day-picker';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, CartesianGrid, YAxis } from 'recharts';
import { dateFormatter } from '@/features/bp-readings/utils';
import { unparse } from 'papaparse';
import { saveAs } from 'file-saver';
import { subDays, format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
	Button,
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ToggleGroup,
	ToggleGroupItem,
	Calendar,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components';

import axios from 'axios';
import { useMemo, useState } from 'react';

const chartConfig = {
	systolic: {
		label: 'Systolic',
		color: 'red',
	},
	diastolic: {
		label: 'Diastolic',
		color: 'black',
	},
} satisfies ChartConfig;

type DaysAgo = '30' | '60' | '90' | '';

export const BPChart = () => {
	const [daysAgo, _setDaysAgo] = useState<DaysAgo>('30');
	const [dateRange, _setDateRange] = useState<DateRange>();

	const [startDate, endDate] = useMemo(() => {
		let now = new Date();
		let startDate: Date;

		if (dateRange && dateRange.from && dateRange.to) {
			startDate = dateRange.from;
			now = dateRange.to;
			return [
				startDate.toISOString().split('T')[0],
				now.toISOString().split('T')[0],
			] as const;
		}

		if (daysAgo) {
			startDate = subDays(now, +daysAgo);
			return [
				startDate.toISOString().split('T')[0],
				now.toISOString().split('T')[0],
			] as const;
		}
		return ['', ''] as const;
	}, [daysAgo, dateRange]);

	const queryEnabled = !!startDate && !!endDate;

	const { data = [] } = useQuery({
		queryKey: ['bpReadings', startDate, endDate],
		enabled: queryEnabled,
		async queryFn() {
			return (
				await axios.get<Readings[]>(
					`/api/bp-readings?startDate=${startDate}&endDate=${endDate}`
				)
			).data;
		},
		placeholderData: keepPreviousData,
	});

	const downloadCsvHandler = () => {
		const csv = unparse(
			data.map((bp) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { createdAt, readingId, ...rest } = bp;
				const _createdAt = dateFormatter(createdAt as unknown as string);
				return {
					Date: _createdAt,
					'Blood Pressure': `${rest.systolic}/${rest.diastolic}`,
				};
			})
		);
		const blob = new Blob([csv], { type: 'text/csv' });
		saveAs(
			blob,
			`marcus-hellams-bp-readings-${new Date().toISOString().split('T')[0]}.csv`
		);
	};

	function setDaysAgo(updaterOrValue: React.SetStateAction<DaysAgo>) {
		_setDaysAgo(updaterOrValue);
		_setDateRange(undefined);
	}

	function setDateRange(
		updaterOrValue: React.SetStateAction<DateRange | undefined>
	) {
		_setDateRange(updaterOrValue);
		if (updaterOrValue === undefined) {
			_setDaysAgo('30');
		} else {
			_setDaysAgo('');
		}
	}

	return (
		<>
			<div className="flex flex-col md:flex-row gap-3 justify-center mb-4">
				<ToggleGroup
					className="gap-0"
					variant="outline"
					type="single"
					value={daysAgo}
					onValueChange={(value) => setDaysAgo(value as DaysAgo)}
				>
					<ToggleGroupItem className="border-r-0 rounded-r-none" value="30">
						30 Days
					</ToggleGroupItem>
					<ToggleGroupItem
						className="border-x-0 rounded-e-none rounded-s-none"
						value="60"
					>
						60 Days
					</ToggleGroupItem>
					<ToggleGroupItem className="border-l-0 rounded-l-none" value="90">
						90 Days
					</ToggleGroupItem>
				</ToggleGroup>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant={'outline'}
							className={cn(
								'justify-start text-left font-normal',
								!dateRange && 'text-muted-foreground'
							)}
						>
							<CalendarIcon />
							{dateRange && dateRange.from && dateRange?.to ? (
								`${format(dateRange.from, 'P')}-${format(dateRange.to, 'P')}`
							) : (
								<span>Pick a custom date range</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0">
            <Calendar
              showOutsideDays
							disabled={(date) => date > new Date()}
							numberOfMonths={2}
							captionLayout="dropdown"
							className="not-prose"
							mode="range"
							selected={dateRange}
							onSelect={setDateRange}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			</div>
			<div className="flex md:justify-center">
				<ChartContainer className="w-[80vw] md:w-[50vw]" config={chartConfig}>
					<LineChart accessibilityLayer data={data}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="createdAt"
							tickLine={true}
							axisLine={true}
							tickMargin={8}
							tickFormatter={(value) => dateFormatter(value)}
						/>
						<YAxis />
						<ChartTooltip
							cursor={true}
							labelFormatter={(value) => dateFormatter(value)}
							content={<ChartTooltipContent />}
						/>
						<Line
							dataKey="systolic"
							type="monotone"
							stroke="var(--color-systolic)"
              strokeWidth={2}
							dot={true}
						/>
						<Line
							dataKey="diastolic"
							type="monotone"
							stroke="var(--color-diastolic)"
							strokeWidth={2}
							dot={true}
						/>
					</LineChart>
				</ChartContainer>
			</div>
			{!!data.length && (
				<div className="text-center mt-4">
					<Button size="lg" variant="link" onClick={downloadCsvHandler}>
						DownLoad to CSV
					</Button>
				</div>
			)}
		</>
	);
};
