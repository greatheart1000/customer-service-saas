/**
 * 组织状态管理
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { organizationAPI } from '../../services/api';

interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  plan_type: string;
  created_at: string;
}

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrganizationState = {
  organizations: [],
  currentOrganization: null,
  isLoading: false,
  error: null,
};

// 异步 Actions
export const fetchOrganizations = createAsyncThunk(
  'organization/fetchOrganizations',
  async () => {
    const response = await organizationAPI.list();
    return response.data;
  }
);

export const createOrganization = createAsyncThunk(
  'organization/create',
  async (data: { name: string; logo_url?: string }) => {
    const response = await organizationAPI.create(data);
    return response.data;
  }
);

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setCurrentOrganization: (state, action) => {
      state.currentOrganization = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.organizations = action.payload;
        if (!state.currentOrganization && action.payload.length > 0) {
          state.currentOrganization = action.payload[0];
        }
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '加载组织列表失败';
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.organizations.push(action.payload);
      });
  },
});

export const { setCurrentOrganization, clearError } = organizationSlice.actions;
export default organizationSlice.reducer;
