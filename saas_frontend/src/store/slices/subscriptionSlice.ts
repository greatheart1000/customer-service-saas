/**
 * 订阅状态管理
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subscriptionAPI } from '../../services/api';

interface Subscription {
  id: string;
  organization_id: string;
  plan_type: string;
  status: string;
  billing_cycle: string;
  current_period_end: string;
}

interface SubscriptionState {
  subscription: Subscription | null;
  plans: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  subscription: null,
  plans: [],
  isLoading: false,
  error: null,
};

// 异步 Actions
export const fetchPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async () => {
    const response = await subscriptionAPI.getPlans();
    return response.data.plans;
  }
);

export const fetchCurrentSubscription = createAsyncThunk(
  'subscription/fetchCurrent',
  async (organizationId: string) => {
    const response = await subscriptionAPI.getCurrent(organizationId);
    return response.data;
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.plans = action.payload;
      })
      .addCase(fetchCurrentSubscription.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscription = action.payload;
      })
      .addCase(fetchCurrentSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '加载订阅信息失败';
      });
  },
});

export const { clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
