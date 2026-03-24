import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { startOfDay, subDays } from 'date-fns'

export type DateRangeTab = '1d' | '3d' | '7d' | '30d' | 'custom'

export interface DateRange {
  from: Date
  to: Date
}

interface DateRangeState {
  activeTab: DateRangeTab
  dateRange: DateRange
  isDatePickerOpen: boolean
}

const initialState: DateRangeState = {
  activeTab: '1d',
  dateRange: {
    from: startOfDay(new Date()),
    to: startOfDay(new Date())
  },
  isDatePickerOpen: false
}

const dateRangeSlice = createSlice({
  name: 'dateRange',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<DateRangeTab>) => {
      state.activeTab = action.payload
      const today = startOfDay(new Date())
      
      switch (action.payload) {
        case '1d':
          state.dateRange = { from: today, to: today }
          break
        case '3d':
          state.dateRange = { from: subDays(today, 2), to: today }
          break
        case '7d':
          state.dateRange = { from: subDays(today, 6), to: today }
          break
        case '30d':
          state.dateRange = { from: subDays(today, 29), to: today }
          break
        case 'custom':
          // Keep current date range for custom
          break
      }
    },
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload
      state.activeTab = 'custom'
    },
    setDatePickerOpen: (state, action: PayloadAction<boolean>) => {
      state.isDatePickerOpen = action.payload
    }
  }
})

export const { setActiveTab, setDateRange, setDatePickerOpen } = dateRangeSlice.actions
export default dateRangeSlice.reducer
