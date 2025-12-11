/**
 * Mock API responses for testing
 * These represent the structure of responses from the Pipedrive API
 */

import type { PipedriveResponse, Pagination } from '../../types/common.js';
import {
  mockDeal,
  mockDeals,
  mockPerson,
  mockPersons,
  mockOrganization,
  mockOrganizations,
  mockActivity,
  mockActivities,
  mockPipeline,
  mockPipelines,
  mockStage,
  mockStages,
  mockUser,
  mockUsers,
  mockFile,
  mockFiles,
  mockNote,
  mockNotes,
  mockProduct,
  mockProducts,
  mockPagination,
  mockPaginationWithMore,
} from './data.mock.js';

/**
 * Generic success response helper
 */
export const createSuccessResponse = <T>(
  data: T,
  pagination?: Pagination
): PipedriveResponse<T> => ({
  success: true,
  data,
  ...(pagination && {
    additional_data: {
      pagination,
    },
  }),
});

/**
 * Generic error response helper
 */
export const createErrorResponse = (
  error: string,
  errorInfo?: string
): { success: false; error: string; error_info?: string } => ({
  success: false,
  error,
  ...(errorInfo && { error_info: errorInfo }),
});

/**
 * Deal responses
 */
export const mockDealResponse = createSuccessResponse(mockDeal);
export const mockDealsResponse = createSuccessResponse(mockDeals, mockPagination);
export const mockDealsResponseWithMore = createSuccessResponse(mockDeals, mockPaginationWithMore);

export const mockDealCreateResponse = createSuccessResponse({
  ...mockDeal,
  id: 999,
});

export const mockDealUpdateResponse = createSuccessResponse({
  ...mockDeal,
  title: 'Updated Deal Title',
  update_time: new Date().toISOString(),
});

export const mockDealDeleteResponse = createSuccessResponse({
  id: mockDeal.id,
  success: true,
});

/**
 * Person responses
 */
export const mockPersonResponse = createSuccessResponse(mockPerson);
export const mockPersonsResponse = createSuccessResponse(mockPersons, mockPagination);
export const mockPersonsResponseWithMore = createSuccessResponse(
  mockPersons,
  mockPaginationWithMore
);

export const mockPersonCreateResponse = createSuccessResponse({
  ...mockPerson,
  id: 999,
});

export const mockPersonUpdateResponse = createSuccessResponse({
  ...mockPerson,
  name: 'Updated Person Name',
  update_time: new Date().toISOString(),
});

export const mockPersonDeleteResponse = createSuccessResponse({
  id: mockPerson.id,
  success: true,
});

/**
 * Organization responses
 */
export const mockOrganizationResponse = createSuccessResponse(mockOrganization);
export const mockOrganizationsResponse = createSuccessResponse(mockOrganizations, mockPagination);
export const mockOrganizationsResponseWithMore = createSuccessResponse(
  mockOrganizations,
  mockPaginationWithMore
);

export const mockOrganizationCreateResponse = createSuccessResponse({
  ...mockOrganization,
  id: 999,
});

export const mockOrganizationUpdateResponse = createSuccessResponse({
  ...mockOrganization,
  name: 'Updated Organization Name',
  update_time: new Date().toISOString(),
});

export const mockOrganizationDeleteResponse = createSuccessResponse({
  id: mockOrganization.id,
  success: true,
});

/**
 * Activity responses
 */
export const mockActivityResponse = createSuccessResponse(mockActivity);
export const mockActivitiesResponse = createSuccessResponse(mockActivities, mockPagination);
export const mockActivitiesResponseWithMore = createSuccessResponse(
  mockActivities,
  mockPaginationWithMore
);

export const mockActivityCreateResponse = createSuccessResponse({
  ...mockActivity,
  id: 999,
});

export const mockActivityUpdateResponse = createSuccessResponse({
  ...mockActivity,
  subject: 'Updated Activity Subject',
  update_time: new Date().toISOString(),
});

export const mockActivityDeleteResponse = createSuccessResponse({
  id: mockActivity.id,
  success: true,
});

export const mockActivityMarkDoneResponse = createSuccessResponse({
  ...mockActivity,
  done: true,
  marked_as_done_time: new Date().toISOString(),
});

/**
 * Pipeline responses
 */
export const mockPipelineResponse = createSuccessResponse(mockPipeline);
export const mockPipelinesResponse = createSuccessResponse(mockPipelines);

export const mockPipelineCreateResponse = createSuccessResponse({
  ...mockPipeline,
  id: 999,
});

export const mockPipelineUpdateResponse = createSuccessResponse({
  ...mockPipeline,
  name: 'Updated Pipeline Name',
  update_time: new Date().toISOString(),
});

export const mockPipelineDeleteResponse = createSuccessResponse({
  id: mockPipeline.id,
  success: true,
});

/**
 * Stage responses
 */
export const mockStageResponse = createSuccessResponse(mockStage);
export const mockStagesResponse = createSuccessResponse(mockStages);

export const mockStageCreateResponse = createSuccessResponse({
  ...mockStage,
  id: 999,
});

export const mockStageUpdateResponse = createSuccessResponse({
  ...mockStage,
  name: 'Updated Stage Name',
  update_time: new Date().toISOString(),
});

export const mockStageDeleteResponse = createSuccessResponse({
  id: mockStage.id,
  success: true,
});

/**
 * User responses
 */
export const mockUserResponse = createSuccessResponse(mockUser);
export const mockUsersResponse = createSuccessResponse(mockUsers);

export const mockCurrentUserResponse = createSuccessResponse({
  ...mockUser,
  is_you: true,
});

/**
 * File responses
 */
export const mockFileResponse = createSuccessResponse(mockFile);
export const mockFilesResponse = createSuccessResponse(mockFiles, mockPagination);

export const mockFileUploadResponse = createSuccessResponse({
  ...mockFile,
  id: 999,
});

export const mockFileUpdateResponse = createSuccessResponse({
  ...mockFile,
  name: 'updated-file.pdf',
  update_time: new Date().toISOString(),
});

export const mockFileDeleteResponse = createSuccessResponse({
  id: mockFile.id,
  success: true,
});

export const mockFileDownloadResponse = {
  url: 'https://files.pipedrive.com/proposal.pdf',
  data: Buffer.from('mock-file-content'),
};

/**
 * Note responses
 */
export const mockNoteResponse = createSuccessResponse(mockNote);
export const mockNotesResponse = createSuccessResponse(mockNotes, mockPagination);

export const mockNoteCreateResponse = createSuccessResponse({
  ...mockNote,
  id: 999,
});

export const mockNoteUpdateResponse = createSuccessResponse({
  ...mockNote,
  content: 'Updated note content',
  update_time: new Date().toISOString(),
});

export const mockNoteDeleteResponse = createSuccessResponse({
  id: mockNote.id,
  success: true,
});

/**
 * Product responses
 */
export const mockProductResponse = createSuccessResponse(mockProduct);
export const mockProductsResponse = createSuccessResponse(mockProducts, mockPagination);

export const mockProductCreateResponse = createSuccessResponse({
  ...mockProduct,
  id: 999,
});

export const mockProductUpdateResponse = createSuccessResponse({
  ...mockProduct,
  name: 'Updated Product Name',
  update_time: new Date().toISOString(),
});

export const mockProductDeleteResponse = createSuccessResponse({
  id: mockProduct.id,
  success: true,
});

/**
 * Search responses
 */
export const mockSearchResponse = createSuccessResponse({
  items: [
    {
      item: mockDeal,
      result_score: 0.95,
    },
    {
      item: mockPerson,
      result_score: 0.85,
    },
  ],
});

export const mockEmptySearchResponse = createSuccessResponse({
  items: [],
});

/**
 * Error responses
 */
export const mockNotFoundResponse = createErrorResponse(
  'Resource not found',
  'The requested resource does not exist'
);

export const mockUnauthorizedResponse = createErrorResponse(
  'Unauthorized',
  'Invalid or missing API token'
);

export const mockBadRequestResponse = createErrorResponse(
  'Bad Request',
  'Invalid request parameters'
);

export const mockRateLimitResponse = createErrorResponse(
  'Rate Limit Exceeded',
  'Too many requests, please try again later'
);

export const mockServerErrorResponse = createErrorResponse(
  'Internal Server Error',
  'An unexpected error occurred on the server'
);

export const mockValidationErrorResponse = createErrorResponse(
  'Validation Error',
  'Required field is missing: title'
);

/**
 * System/Health responses
 */
export const mockHealthResponse = createSuccessResponse({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  uptime: 123456,
});

export const mockMetricsResponse = createSuccessResponse({
  requests: {
    total: 1000,
    successful: 950,
    failed: 50,
  },
  cache: {
    hits: 500,
    misses: 500,
    size: 250,
  },
  rateLimiter: {
    RECEIVED: 1000,
    QUEUED: 50,
    RUNNING: 5,
    EXECUTING: 2,
    DONE: 943,
  },
});

export const mockCurrenciesResponse = createSuccessResponse([
  {
    id: 1,
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimal_points: 2,
    is_custom_flag: false,
    active_flag: true,
  },
  {
    id: 2,
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    decimal_points: 2,
    is_custom_flag: false,
    active_flag: true,
  },
]);

/**
 * Field responses
 */
export const mockFieldResponse = createSuccessResponse({
  id: 1,
  key: 'custom_field_1',
  name: 'Custom Field',
  field_type: 'varchar',
  add_time: '2024-01-01T00:00:00Z',
  update_time: '2025-01-01T00:00:00Z',
  active_flag: true,
  edit_flag: true,
  index_visible_flag: true,
  details_visible_flag: true,
  add_visible_flag: true,
  important_flag: false,
  bulk_edit_allowed: true,
  mandatory_flag: false,
  options: [],
});

export const mockFieldsResponse = createSuccessResponse([
  mockFieldResponse.data,
  {
    ...mockFieldResponse.data,
    id: 2,
    key: 'custom_field_2',
    name: 'Another Custom Field',
    field_type: 'text',
  },
]);

/**
 * Follower responses
 */
export const mockFollowerResponse = createSuccessResponse({
  id: 1,
  user_id: 2,
  add_time: '2025-01-15T10:00:00Z',
});

export const mockFollowersResponse = createSuccessResponse([
  mockFollowerResponse.data,
  {
    id: 2,
    user_id: 3,
    add_time: '2025-01-16T11:00:00Z',
  },
]);

export const mockAddFollowerResponse = createSuccessResponse({
  success: true,
  id: 999,
  user_id: 5,
});

export const mockRemoveFollowerResponse = createSuccessResponse({
  success: true,
});
