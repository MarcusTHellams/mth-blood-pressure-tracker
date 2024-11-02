'use client';

import { type Readings } from '@/db';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, CartesianGrid, YAxis } from 'recharts';
import { dateFormatter } from '@/features/bp-readings/utils';
import { unparse } from 'papaparse';
import { saveAs } from 'file-saver';
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	Button,
} from '@/components';

import axios from 'axios';

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

export const BPChart = () => {
	const { data = [] } = useQuery({
		queryKey: ['bpReadings'],
		async queryFn() {
			return (await axios.get<Readings[]>('/api/bp-readings')).data;
		},
	});

	const downloadCsvHandler = () => {
		const csv = unparse(
			data.map((bp) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { createdAt, readingId, ...rest } = bp;
				const _createdAt = dateFormatter(createdAt as unknown as string);
				return { ...rest, createdAt: _createdAt };
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
			<div className="flex justify-center">
				<ChartContainer className="h-[60vh]" config={chartConfig}>
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
			<div className="text-end mt-4">
				<Button size="lg" variant="link" onClick={downloadCsvHandler}>
					DownLoad Csv
				</Button>
			</div>
		</>
	);
};
