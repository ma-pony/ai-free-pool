import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createCampaign } from '@/services/CampaignService';
import { createPlatform } from '@/services/PlatformService';
import { CreateCampaignSchema } from '@/validations/CampaignValidation';

/**
 * POST /api/campaigns/submit
 * Submit a new campaign (user submission)
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 8.4
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

    // Handle new platform creation if needed
    let platformId = body.platformId;
    if (!platformId && body.platformName) {
      // Create new platform
      try {
        const newPlatform = await createPlatform({
          name: body.platformName,
          slug: body.platformName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim(),
          status: 'active',
        });
        platformId = newPlatform.id;
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Failed to create platform',
              statusCode: 400,
            },
          },
          { status: 400 },
        );
      }
    }

    // Validate input (Requirement 4.2)
    const validationResult = CreateCampaignSchema.safeParse({
      ...body,
      platformId,
      status: 'pending', // Force pending status (Requirement 4.3)
      submittedBy: userId, // Record submitter (Requirement 4.4)
    });

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

    return NextResponse.json(
      {
        success: true,
        data: campaign,
        message: 'Campaign submitted successfully and is pending review',
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
