'use client';

import type { Platform } from '@/types/Platform';
import { useState } from 'react';

type PlatformListProps = {
  initialPlatforms: Platform[];
  onEdit: (platform: Platform) => void;
  onDelete: (id: string) => void;
};

export function PlatformList({ initialPlatforms, onEdit, onDelete }: PlatformListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredPlatforms = initialPlatforms.filter((platform) => {
    const matchesSearch = platform.name.toLowerCase().includes(searchTerm.toLowerCase())
      || platform.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || platform.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search platforms..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Platform List */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Website
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredPlatforms.length === 0
              ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No platforms found
                    </td>
                  </tr>
                )
              : (
                  filteredPlatforms.map(platform => (
                    <tr key={platform.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {platform.logo && (
                            <img
                              src={platform.logo}
                              alt={platform.name}
                              className="mr-3 size-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{platform.name}</div>
                            <div className="text-sm text-gray-500">{platform.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            platform.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {platform.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {platform.website
                          ? (
                              <a
                                href={platform.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Visit
                              </a>
                            )
                          : (
                              <span className="text-gray-400">-</span>
                            )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(platform.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => onEdit(platform)}
                          className="mr-3 text-blue-600 hover:text-blue-900"
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${platform.name}?`)) {
                              onDelete(platform.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
