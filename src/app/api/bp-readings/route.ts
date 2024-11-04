import { db, readingsTable } from '@/db';
import { NextRequest, NextResponse } from 'next/server';
import { subDays } from 'date-fns';

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const now = new Date();

	// Default 30 days Search
	const startDate =
		searchParams.get('startDate') ||
		subDays(now, 30).toISOString().split('T')[0];
	const endDate =
		searchParams.get('endDate') || now.toISOString().split('T')[0];
	const readings = await db.query.readingsTable.findMany({
		where({ createdAt }, { and, gte, lte }) {
			return and(
				gte(createdAt, new Date(startDate)),
				lte(createdAt, new Date(endDate))
			);
		},
		orderBy({ createdAt }, { asc }) {
			return asc(createdAt);
		},
	});
	return NextResponse.json(readings, { status: 200 });
}

export async function POST(request: NextRequest) {
	const { diastolic, systolic } = await request.json();
	const [reading] = await db
		.insert(readingsTable)
		.values({ diastolic, systolic, createdAt: new Date() })
		.returning();
	return NextResponse.json(reading);
}
