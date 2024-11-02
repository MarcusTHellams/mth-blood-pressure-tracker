import { db, readingsTable } from '@/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
	const readings = await db.query.readingsTable.findMany();
	return NextResponse.json(readings, { status: 200 });
}

export async function POST(request: NextRequest) {
	const { diastolic, systolic } = await request.json();
	const [reading] = await db
		.insert(readingsTable)
		.values({ diastolic, systolic })
		.returning();
	return NextResponse.json(reading);
}
