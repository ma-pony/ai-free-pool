import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { getTagSuggestions } from '@/services/TagService';

/**
 * GET /api/tags/autocomplete
 * Get tag suggestions for autocomplete
 * Validates: Requirements 10.2
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') as 'category' | 'ai_model' | 'general' | null;
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);

    if (!query || query.length < 1) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const suggestions = await getTagSuggestions(query, type || undefined, limit);

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error`Error fetching tag suggestions: ${error}`;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tag suggestions',
      },
      { status: 500 },
    );
  }
}
