import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createCampaign } from '@/services/CampaignService';
import { CreateCampaignSchema } from '@/validations/CampaignValidation';

/**
 * POST /api/campaigns/submit
 * Submit a new campaign (user submission)
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 8.4
 *
 * Note: If platform doesn't exist, the new platform info is stored in pendingPlatform
 * and will be reviewed together with the campaign. Platform is NOT auto-created.
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication (Requirement 4.1)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Authentication required',
            statusCode: 401,
          },
        },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Handle new platform - store as pendingPlatform for review instead of creating directly
    const platformId = body.platformId;
    let pendingPlatform = null;

    if (!platformId && body.platformName) {
      // Don't create platform directly - store it for review
      const platformSlug = body.platformName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      pendingPlatform = {
        name: body.platformName,
        slug: platformSlug,
        website: body.platformWebsite && body.platformWebsite.trim() !== '' ? body.platformWebsite : undefined,
        description: body.platformDescription && body.platformDescription.trim() !== '' ? body.platformDescription : undefined,
      };
    }

    // Validate input (Requirement 4.2)
    const dataToValidate = {
      ...body,
      platformId: platformId || null,
      pendingPlatform,
      status: 'pending', // Force pending status (Requirement 4.3)
      submittedBy: userId, // Record submitter (Requirement 4.4)
    };

    const validationResult = CreateCampaignSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed',
            details: validationResult.error.issues,
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    // Create campaign with auto-translation (Requirement 8.4)
    const campaign = await createCampaign({
      ...validationResult.data,
      status: 'pending', // Ensure pending status
      submittedBy: userId, // Ensure submitter is recorded
      autoTranslate: true, // Enable AI translation
    });

    const message = pendingPlatform
      ? 'Campaign and new platform submitted successfully and are pending review'
      : 'Campaign submitted successfully and is pending review';

    return NextResponse.json(
      {
        success: true,
        data: campaign,
        message,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Campaign submission error:', error);

    // Handle specific errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation error',
            details: error.issues,
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error',
          statusCode: 500,
        },
      },
      { status: 500 },
    );
  }
}
