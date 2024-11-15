'use client';

import {
	Button,
	Calendar,
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	Popover,
	PopoverContent,
	PopoverTrigger,
	ToggleGroup,
	ToggleGroupItem,
} from '@/components';
import { type Readings } from '@/db';
import { dateFormatter } from '@/features/bp-readings/utils';
import { cn } from '@/lib/utils';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { saveAs } from 'file-saver';
import { CalendarIcon } from 'lucide-react';
import { unparse } from 'papaparse';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import axios from 'axios';
import { useQueryKeyStore } from '../contexts';

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
	const [readingsKey, startDate, endDate] = useQueryKeyStore(
		(state) => state.queryKey
	);
	const updateDateRange = useQueryKeyStore((state) => state.updateDateRange);
	const updateDaysAgo = useQueryKeyStore((state) => state.updateDaysAgo);
	const daysAgo = useQueryKeyStore((state) => state.daysAgo);
	const dateRange = useQueryKeyStore((state) => state.dateRange);

	const queryEnabled = !!startDate && !!endDate;

	const { data = [] } = useQuery({
		queryKey: [readingsKey, startDate, endDate],
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
			data
				.map((bp) => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { createdAt, readingId, ...rest } = bp;
					const _createdAt = dateFormatter(createdAt as unknown as string);
					return {
						Date: _createdAt,
						'Blood Pressure': `${rest.systolic}/${rest.diastolic}`,
					};
				})
				.sort((a, b) => {
					if (a.Date > b.Date) {
						return -1;
					}

					if (a.Date < b.Date) {
						return 1;
					}

					return 0;
				})
		);
		const blob = new Blob([csv], { type: 'text/csv' });
		saveAs(
			blob,
			`marcus-hellams-bp-readings-${new Date().toISOString().split('T')[0]}.csv`
		);
	};

	return (
		<>
			<div className="flex flex-col md:flex-row gap-3 justify-center mb-4">
				<ToggleGroup
					className="gap-0"
					variant="outline"
					type="single"
					value={daysAgo}
					onValueChange={(value) => updateDaysAgo(value as DaysAgo)}
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
							disabled={(date) => date > addDays(new Date(), 1)}
							numberOfMonths={2}
							captionLayout="dropdown"
							className="not-prose"
							mode="range"
							selected={dateRange}
							onSelect={updateDateRange}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			</div>
			{data.length ? (
				<>
					<div className="flex md:justify-center">
						<ChartContainer
							className="w-[80vw] md:w-[50vw]"
							config={chartConfig}
						>
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
								<ChartLegend
									iconType="square"
									verticalAlign="top"
									height={36}
								/>
								<Line
									name="Systolic"
									dataKey="systolic"
									type="monotone"
									stroke="var(--color-systolic)"
									strokeWidth={2}
									dot={true}
								/>
								<Line
									name="Diastolic"
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
			) : (
				<h3 className="text-center">No Data to Show</h3>
			)}
		</>
	);
};
