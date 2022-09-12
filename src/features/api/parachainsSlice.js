import {
  createAction,
  createSlice,
  createEntityAdapter,
  isAnyOf
} from '@reduxjs/toolkit'
import apiSlice from './apiSlice'
import { socketActions } from './socketSlice'
import { 
  selectSessionByIndex } from './sessionsSlice'

export const extendedApi = apiSlice.injectEndpoints({
  tagTypes: ['Parachains'],
  endpoints: (builder) => ({
    getParachains: builder.query({
      query: ({session}) => ({
        url: `/parachains`,
        params: { session }
      }),
      providesTags: (result, error, arg) => [{ type: 'Parachains', id: arg }],
      // transformResponse: responseData => {
      //   return responseData.data
      // },
      async onQueryStarted(params, { getState, dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          // `onSuccess` subscribe for updates
          const session = selectSessionByIndex(getState(), params.session)
          if (session.is_current) {
            const msg = JSON.stringify({ method: 'subscribe_parachains', params: [params.session.toString()] });
            dispatch(socketActions.messageQueued(msg))
          }       
        } catch (err) {
          // `onError` side-effect
          // dispatch(socketActions.messageQueued(msg))
        }
      },
    }),
  }),
})

export const {
  useGetParachainsQuery,
} = extendedApi

// Actions
export const socketParachainsReceived = createAction(
  'parachains/parachainsReceived'
)

// Slice
const adapter = createEntityAdapter({
  selectId: (data) => `${data.session}_${data.pid}`,
})

export const matchParachainsReceived = isAnyOf(
  socketParachainsReceived,
  extendedApi.endpoints.getParachains.matchFulfilled
)

const parachainsSlice = createSlice({
  name: 'parachains',
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers(builder) {
    builder
    // .addMatcher(matchValidatorReceived, (state, action) => {
    //   adapter.upsertOne(state, { ...action.payload, _ts: + new Date()})
    // })
    .addMatcher(matchParachainsReceived, (state, action) => {
      const parachains = action.payload.data.map(parachain => ({
        ...parachain,
        session: action.payload.session,
        _ts: + new Date()
      }))
      adapter.upsertMany(state, parachains)
    })
  }
})

export default parachainsSlice;

// Selectors
const { 
  selectById,
} = adapter.getSelectors(state => state.parachains)

export const selectParachainBySessionAndParaId = (state, session, paraId) => !!selectById(state, `${session}_${paraId}`) ? 
  selectById(state, `${session}_${paraId}`)  : undefined;
