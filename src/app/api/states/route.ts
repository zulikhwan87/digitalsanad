import { NextResponse } from 'next/server';
import { MALAYSIAN_STATES } from '@/lib/constants/malaysia-data';

export async function GET() {
  return NextResponse.json({
    totalStates: 13,
    totalFederalTerritories: 3,
    totalRegions: 16,
    states: MALAYSIAN_STATES,
  });
}
