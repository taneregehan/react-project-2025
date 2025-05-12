/* eslint-disable @typescript-eslint/no-unused-expressions */
import type { AxiosResponse } from "axios";
import type { Action } from "redux-actions";

import { put, takeEvery } from "redux-saga/effects";

import types from "./types";
import Logger from "../../utils/logger";
import * as actions from "./actions";
import { updateProgress } from "../ui/actions";

import type { Callbacks } from "../../utils/types";
import { scheduleReponse } from "../../constants/api";

function* asyncFetchSchedule({ payload: { onSuccess, onError } = {} }: Action<Callbacks>) {
  yield put(updateProgress());
  try {
    const response = scheduleReponse;
    yield put(actions.fetchScheduleSuccess(response.data));

    onSuccess && onSuccess(response);
  } catch (err) {
    Logger.error(err);
    onError && onError(err);

    yield put(actions.fetchScheduleFailed());
  } finally {
    yield put(updateProgress(false));
  }
}

function* asyncUpdateEventDate({
  payload,
}: Action<{
  eventId: string;
  newStart: string;
  newEnd: string;
  onSuccess?: (response: AxiosResponse) => void;
  onError?: (error: Error) => void;
}>) {
  yield put(updateProgress());
  try {
    yield put(
      actions.updateEventDateSuccess({
        eventId: payload.eventId,
        newStart: payload.newStart,
        newEnd: payload.newEnd,
      })
    );

    payload.onSuccess && payload.onSuccess({} as AxiosResponse);
  } catch (err) {
    Logger.error(err);
    payload.onError && payload.onError(err as Error);

    yield put(actions.updateEventDateFailed(err));
  } finally {
    yield put(updateProgress(false));
  }
}

const scheduleSagas = [
  takeEvery(types.FETCH_SCHEDULE, asyncFetchSchedule),
  takeEvery(types.UPDATE_EVENT_DATE, asyncUpdateEventDate),
];

export default scheduleSagas;
