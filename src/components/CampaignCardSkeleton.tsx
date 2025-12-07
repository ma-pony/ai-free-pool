/**
 * Campaign Card Skeleton Component
 * 用于加载状态的骨架屏
 */
export default function CampaignCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-md">
      {/* Platform Info Skeleton */}
      <div className="p-4 sm:p-6">
        <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
          <div className="size-10 rounded-lg bg-gray-200 sm:size-12" />
          <div className="h-4 w-24 rounded bg-gray-200" />
        </div>

        {/* Title Skeleton */}
        <div className="mb-2 space-y-2 sm:mb-3">
          <div className="h-6 w-full rounded bg-gray-200" />
          <div className="h-6 w-3/4 rounded bg-gray-200" />
        </div>

        {/* Description Skeleton */}
        <div className="mb-3 space-y-2 sm:mb-4">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
        </div>

        {/* Tags Skeleton */}
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-lg bg-gray-200" />
          <div className="h-8 w-24 rounded-lg bg-gray-200" />
          <div className="h-8 w-16 rounded-lg bg-gray-200" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 sm:px-6 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="size-8 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
