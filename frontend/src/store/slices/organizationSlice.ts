import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface OrganizationState {
  name: string
}

const getInitialOrgName = (): string => {
  try {
    return localStorage.getItem('sidebar:orgName') || 'Organization'
  } catch {
    return 'Organization'
  }
}

const initialState: OrganizationState = {
  name: getInitialOrgName()
}

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setOrganizationName: (state, action: PayloadAction<string>) => {
      const name = action.payload.trim() || 'Organization'
      state.name = name
      try {
        localStorage.setItem('sidebar:orgName', name)
      } catch {
        // Ignore localStorage errors
      }
    }
  }
})

export const { setOrganizationName } = organizationSlice.actions
export default organizationSlice.reducer
