import { AxiosResponse } from 'axios';
import { call, put, select } from 'redux-saga/effects';
import {
  fetchMovieRecommendationsSuccess,
  FetchMovieRecommendationsRequest,
  FetchDetailedMovieRequest,
  addMovies,
  fetchDetailedMovieSuccess,
  ChangeMovieStatusRequest,
  changeMovieStatusSuccess,
  changeMovieStatusFailure,
  FetchMovieAccountStateRequest,
  fetchMovieAccountStateSuccess,
} from './actions';
import {
  getMovieDetailsApi,
  getMovieRecommendationsApi,
  MovieListApiResponse,
  changeMovieStatusApi,
  getMovieAccountStateApi,
  GetMovieAccountStateApiResponse,
} from '../../api/movies';
import { UserIdsParams, MovieDetailed } from '../../api/types';
import { userIdParamsSelector } from '../auth/selectors';
import { normalizeMovies } from '../../utils/movies';
import { handleNetworkReduxError } from '../network/actions';

export function* fetchDetailedMovieSaga(action: FetchDetailedMovieRequest) {
  const { movieId, onSuccess, onError } = action;

  try {
    const { data }: AxiosResponse<MovieDetailed> = yield call(getMovieDetailsApi, { movieId });
    yield put(fetchDetailedMovieSuccess({ movieId, movieDetailed: data }));
    onSuccess && onSuccess();
  } catch (error) {
    onError && onError();
    yield put(handleNetworkReduxError(error, action));
  }
}

export function* fetchMovieAccountStateSaga(action: FetchMovieAccountStateRequest) {
  const { movieId, onSuccess, onError } = action;

  try {
    const userIds: UserIdsParams = yield select(userIdParamsSelector);
    const {
      data: { favorite, watchlist },
    }: AxiosResponse<GetMovieAccountStateApiResponse> = yield call(getMovieAccountStateApi, {
      movieId,
      ...userIds,
    });

    yield put(fetchMovieAccountStateSuccess({ movieId, favorite, watchlist }));
    onSuccess && onSuccess();
  } catch (error) {
    onError && onError();
    yield put(handleNetworkReduxError(error, action));
  }
}

export function* fetchMovieRecommendationsSaga(action: FetchMovieRecommendationsRequest) {
  const { movieId, onSuccess, onError } = action;

  try {
    const { data }: AxiosResponse<MovieListApiResponse> = yield call(getMovieRecommendationsApi, {
      movieId,
      page: 1,
    });

    const movies = normalizeMovies(data.results);
    const movieIds = movies.map(movie => movie.id);
    yield put(addMovies(movies));

    yield put(fetchMovieRecommendationsSuccess({ movieId, recommendedMovieIds: movieIds }));
    onSuccess && onSuccess();
  } catch (error) {
    onError && onError();
    yield put(handleNetworkReduxError(error, action));
  }
}

export function* changeMovieStatusSaga({ movieId, status, statusType, onSuccess, onError }: ChangeMovieStatusRequest) {
  try {
    const userIds: UserIdsParams = yield select(userIdParamsSelector);
    yield call(changeMovieStatusApi, { movieId, statusType, status, ...userIds });
    yield put(changeMovieStatusSuccess({ movieId, statusType, status }));
    onSuccess && onSuccess();
  } catch (error) {
    yield put(changeMovieStatusFailure({ movieId, statusType, status }));
    onError && onError();
  }
}