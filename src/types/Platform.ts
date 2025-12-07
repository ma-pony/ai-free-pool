// Platform types for AI Free Pool

export type Platform = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  website?: string | null;
  description?: string | null;
  socialLinks?: {
    twitter?: string;
    github?: string;
    discord?: string;
  } | null;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
};

export type CreatePlatformInput = {
  name: string;
  slug: string;
  logo?: string | null;
  website?: string | null;
  description?: string | null;
  socialLinks?: {
    twitter?: string;
    github?: string;
    discord?: string;
  } | null;
  status?: 'active' | 'inactive';
};

export type UpdatePlatformInput = Partial<CreatePlatformInput>;

export type PlatformListFilters = {
  status?: 'active' | 'inactive';
  search?: string;
};
