/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Action } from "redux-actions";

import { handleActions } from "redux-actions";

import types from "./types";

import type { ErrorBE } from "../../utils/types";
import type { ScheduleInstance } from "../../models/schedule";

export interface ScheduleState {
  errors: ErrorBE;
  loading: boolean;
  schedule: ScheduleInstance;
}

const initialState: ScheduleState = {
  loading: false,
  errors: {},
  schedule: {} as ScheduleInstance,
};

const scheduleReducer: any = {
  [types.FETCH_SCHEDULE_SUCCESS]: (
    state: ScheduleState,
    { payload }: Action<typeof state.schedule>
  ): ScheduleState => ({
    ...state,
    loading: false,
    errors: {},
    schedule: payload,
  }),

  [types.FETCH_SCHEDULE_FAILED]: (
    state: ScheduleState,
    { payload }: Action<typeof state.errors>
  ): ScheduleState => ({
    ...state,
    loading: false,
    errors: payload,
  }),

  [types.UPDATE_EVENT_DATE]: (state: ScheduleState): ScheduleState => ({
    ...state,
    loading: true,
    errors: {},
  }),

  [types.UPDATE_EVENT_DATE_SUCCESS]: (
    state: ScheduleState,
    {
      payload,
    }: Action<{
      eventId: string;
      newStart: string;
      newEnd: string;
    }>
  ): ScheduleState => {
    const updatedSchedule = { ...state.schedule };

    if (updatedSchedule.assignments) {
      updatedSchedule.assignments = updatedSchedule.assignments.map((assignment) => {
        if (assignment.id === payload.eventId) {
          return {
            ...assignment,
            shiftStart: payload.newStart,
            shiftEnd: payload.newEnd,
            isUpdated: true,
          };
        }
        return assignment;
      });
    }

    return {
      ...state,
      loading: false,
      errors: {},
      schedule: updatedSchedule,
    };
  },

  [types.UPDATE_EVENT_DATE_FAILED]: (
    state: ScheduleState,
    { payload }: Action<typeof state.errors>
  ): ScheduleState => ({
    ...state,
    loading: false,
    errors: payload,
  }),
};

export default handleActions(scheduleReducer, initialState) as any;
