import {
  createAction,
  createSlice,
  createEntityAdapter,
  isAnyOf,
  current
} from '@reduxjs/toolkit'
import uniq from 'lodash/uniq'
import isUndefined from 'lodash/isUndefined'
import isNull from 'lodash/isNull'
import toNumber from 'lodash/toNumber'
import isArray from 'lodash/isArray'
import forEach from 'lodash/forEach'
import groupBy from 'lodash/groupBy'
import union from 'lodash/union'
import apiSlice from './apiSlice'
import { socketActions } from './socketSlice'
import { 
  matchValidatorsReceived,
} from './validatorsSlice'
import { 
  selectParachainBySessionAndParaId,
  matchParachainsReceived,
} from './parachainsSlice'
import { 
  matchPoolsReceived,
  selectPoolBySessionAndPoolId
} from './poolsSlice'
import { 
  selectValGroupBySessionAndGroupId,
  selectValidatorsBySessionAndGroupId,
  selectValidatorIdsBySessionAndGroupId,
} from './valGroupsSlice'
import { 
  selectFinalizedBlock 
} from './blocksSlice'
import { calculateMvr } from '../../util/mvr'
import { grade } from '../../util/grade';

export const extendedApi = apiSlice.injectEndpoints({
  tagTypes: ['Sessions'],
  endpoints: (builder) => ({
    getSessions: builder.query({
      query: ({number_last_sessions, from, to, show_stats, show_netstats}) => ({
        url: `/sessions`,
        params: { number_last_sessions, from, to, show_stats, show_netstats }
      }),
      providesTags: (result, error, arg) => [{ type: 'Sessions', id: arg }],
      transformResponse: responseData => {
        return responseData.data
      },
    }),
    getSessionByIndex: builder.query({
      query: (index) => `/sessions/${index}`,
      providesTags: (result, error, arg) => [{ type: 'Sessions', id: arg }],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          // `onSuccess` subscribe for updates
          if (id === "current") {
            const msg = JSON.stringify({ method: "subscribe_session", params: ["new"] });
            dispatch(socketActions.messageQueued(msg))
            // Fetch previous sessions stats for the current era
            dispatch(extendedApi.endpoints.getSessions.initiate({number_last_sessions: data.esix - 1, show_stats: true}))
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
  useGetSessionsQuery,
  useGetSessionByIndexQuery,
} = extendedApi

// Actions
export const socketSessionReceived = createAction(
  'sessions/sessionReceived'
)

export const socketSessionsReceived = createAction(
  'sessions/sessionsReceived'
)

// Slice
const adapter = createEntityAdapter({
  selectId: (data) => data.six,
  sortComparer: (a, b) => a.six > b.six,
})

const matchSessionReceived = isAnyOf(
  socketSessionReceived,
  extendedApi.endpoints.getSessionByIndex.matchFulfilled
)

export const matchSessionsReceived = isAnyOf(
  socketSessionsReceived,
  extendedApi.endpoints.getSessions.matchFulfilled
)

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState: {
    current: "current",
    ...adapter.getInitialState()
  },
  reducers: {
    sessionHistoryChanged: (state, action) => {
      state.history = action.payload;
    },
    sessionHistoryRangeChanged: (state, action) => {
      state.history_range = action.payload;
    },
    sessionHistoryIdsChanged: (state, action) => {
      state.history_ids = action.payload;
    },
    sessionChanged: (state, action) => {
      state.current = action.payload;
    },
  },
  extraReducers(builder) {
    builder
    .addMatcher(matchSessionReceived, (state, action) => {
      // update session current from sessionReceived (needed when new session is received)
      if (action.payload.is_current) {
        state.current = action.payload.six
      }
      // update session with timestamp
      adapter.upsertOne(state, { ...action.payload, _ts: + new Date()})
    })
    .addMatcher(matchSessionsReceived, (state, action) => {
      const sessions = action.payload.map(session => ({
        ...session,
        _mvr: !isUndefined(session.stats) ? calculateMvr(session.stats.ev, session.stats.iv, session.stats.mv) : undefined,
        _ts: + new Date()
      }))
      adapter.upsertMany(state, sessions)
    })
    .addMatcher(matchValidatorsReceived, (state, action) => {

      const setKey = (action, prefix) => {
        if (!isUndefined(action)) {
          if (!isUndefined(action.meta)) {
            if (!isUndefined(action.meta.arg)) {
              if (!isUndefined(action.meta.arg.originalArgs)) {
                if (!isUndefined(action.meta.arg.originalArgs.sessions)) {
                  return `${prefix}_insights`
                }
              }
            }
          }
        }
        return prefix
      }
      // Filter validators if authority and p/v
      const filtered = action.payload.data.filter(v => v.is_auth);

      // Group validators by session first
      const groupedBySession = groupBy(filtered, v => !!v.session ? v.session : action.payload.session)


      let currentState = current(state);

      forEach(groupedBySession, (validators, session) => {
        const filtered = validators.filter(v => v.is_auth && v.is_para && !isUndefined(v.para_summary));
        const _group_ids = uniq(filtered.map(v => toNumber(v.para.group))).sort((a, b) => a - b)
        const _mvrs = filtered.map(v => calculateMvr(v.para_summary.ev, v.para_summary.iv, v.para_summary.mv));
        const _validity_votes = filtered.map(v => v.para_summary.ev + v.para_summary.iv + v.para_summary.mv);
        const _backing_points = filtered.map(v => ((v.auth.ep - v.auth.sp) - (v.auth.ab.length * 20)) > 0 ? (v.auth.ep - v.auth.sp) - (v.auth.ab.length * 20) : 0);
        const _current_stashes = !isUndefined(currentState.entities[session]) ? (!isUndefined(currentState.entities[session]._stashes) ? currentState.entities[session]._stashes : []) : [];
        const _stashes  = union(_current_stashes, validators.map(v => v.address));
        const _dispute_stashes = filtered.filter(v => !isUndefined(v.para.disputes)).map(v => v.address);
        const _f_grade_stashes = filtered.filter(v => grade(1 - calculateMvr(v.para_summary.ev, v.para_summary.iv, v.para_summary.mv)) === "F").map(v => v.address);
        
        adapter.upsertOne(state, { six: parseInt(session, 10), 
          [setKey(action, "_group_ids")]: _group_ids, 
          [setKey(action, "_mvrs")]: _mvrs, 
          [setKey(action, "_validity_votes")]: _validity_votes, 
          [setKey(action, "_backing_points")]: _backing_points, 
          [setKey(action, "_stashes")]: _stashes, 
          [setKey(action, "_dispute_stashes")]: _dispute_stashes,   
          [setKey(action, "_f_grade_stashes")]: _f_grade_stashes,   
        })
      })

    })
    .addMatcher(matchParachainsReceived, (state, action) => {
      adapter.upsertOne(state, { six: action.payload.session, _parachain_ids: action.payload.data.map(p => p.pid)})
    })
    .addMatcher(matchPoolsReceived, (state, action) => {

      // verify that query was not for a single pool
      if (!isUndefined(action)) {
        if (!isUndefined(action.meta)) {
          if (!isUndefined(action.meta.arg)) {
            if (!isUndefined(action.meta.arg.originalArgs)) {
              if (!isUndefined(action.meta.arg.originalArgs.pool)) {
                return
              }
            }
          }
        }
      }
      
      // Group pools by session first
      const groupedBySession = groupBy(action.payload.data, v => !!v.session ? v.session : action.payload.session)

      forEach(groupedBySession, (pools, session) => {
        if (!isUndefined(session)) {
          adapter.upsertOne(state, { six: parseInt(session, 10), _pool_ids: pools.map(p => p.id)})
        }
      })

    })
  }
})

// Selectors
export const { 
  selectAll: selectSessionsAll,
  selectById: selectSessionByIndex
} = adapter.getSelectors(state => state.sessions)

export const selectSessionCurrent = (state) => state.sessions.current;
export const selectSessionHistory = (state) => state.sessions.history;
export const selectSessionHistoryRange = (state) => isUndefined(state.sessions.history_range) ?
  [state.sessions.current - 6, state.sessions.current - 1] : state.sessions.history_range;
export const selectSessionHistoryRangeIds = (state) => buildSessionIdsArrayHelper(selectSessionHistoryRange(state)[1], 1 + selectSessionHistoryRange(state)[1] - selectSessionHistoryRange(state)[0])
export const selectSessionHistoryIds = (state) => isUndefined(state.sessions.history_ids) ? 
  buildSessionIdsArrayHelper(state.sessions.current - 1, 6) : state.sessions.history_ids;
export const selectSessionsByIds = (state, sessionIds = []) => sessionIds.map(id => selectSessionByIndex(state, id));


export const selectValGroupIdsBySession = (state, session) => !!selectSessionByIndex(state, session) ? 
  (isArray(selectSessionByIndex(state, session)._group_ids) ? 
    selectSessionByIndex(state, session)._group_ids : []) : [];

export const selectValGroupIdsBySessionSortedBy = (state, session, sortBy) => {
  switch (sortBy) {
    case 'backing_points': {
      const group_ids = selectValGroupIdsBySession(state, session)
        .map(group_id => selectValGroupBySessionAndGroupId(state, session, group_id))
        .sort((a, b) => b._backing_points - a._backing_points)
        .map(o => o._group_id);
      return group_ids
    }
    case 'mvr': {
      const group_ids = selectValGroupIdsBySession(state, session)
        .map(group_id => selectValGroupBySessionAndGroupId(state, session, group_id))
        .sort((a, b) => b._mvr - a._mvr)
        .map(o => o._group_id);
      return group_ids
    }
    default: {
      return selectValGroupIdsBySession(state, session)
    }
  }
};

export const selectPoolIdsBySession = (state, session) => !!selectSessionByIndex(state, session) ? 
    (isArray(selectSessionByIndex(state, session)._pool_ids) ? 
      selectSessionByIndex(state, session)._pool_ids : []) : [];

export const selectPoolIdsBySessionSortedBy = (state, session, sortBy, stateFilter = 'Open') => {
  switch (sortBy) {
    case 'apr': {
      const pool_ids = selectPoolIdsBySession(state, session)
        .map(pool_id => selectPoolBySessionAndPoolId(state, session, pool_id))
        .filter(f => f.state === stateFilter)
        .sort((a, b) => !isUndefined(a.nomstats) && !isUndefined(b.nomstats)  ? b.nomstats.apr - a.nomstats.apr : 0)
        .map(o => o.id);
      return pool_ids
    }
    case 'members': {
      const pool_ids = selectPoolIdsBySession(state, session)
        .map(pool_id => selectPoolBySessionAndPoolId(state, session, pool_id))
        .filter(f => f.state === stateFilter)
        .sort((a, b) => !isUndefined(a.stats) && !isUndefined(b.stats)  ? b.stats.member_counter - a.stats.member_counter : 0)
        .map(o => o.id);
      return pool_ids
    }
    case 'points': {
      const pool_ids = selectPoolIdsBySession(state, session)
        .map(pool_id => selectPoolBySessionAndPoolId(state, session, pool_id))
        .filter(f => f.state === stateFilter)
        .sort((a, b) => !isUndefined(a.stats) && !isUndefined(b.stats)  ? b.stats.points - a.stats.points : 0)
        .map(o => o.id);
      return pool_ids
    }
    default: {
      return selectPoolIdsBySession(state, session)
    }
  }
};

export const selectParachainIdsBySession = (state, session) => !!selectSessionByIndex(state, session) ? 
  (isArray(selectSessionByIndex(state, session)._parachain_ids) ? 
    selectSessionByIndex(state, session)._parachain_ids : []) : [];

export const selectParachainIdsBySessionSortedBy = (state, session, sortBy) => {
  switch (sortBy) {
    case 'backing_points': {
      const para_ids = selectParachainIdsBySession(state, session)
        .map(para_id => selectParachainBySessionAndParaId(state, session, para_id))
        .sort((a, b) => b._backing_points - a._backing_points)
        .map(o => o.pid);
      return para_ids
    }
    case 'mvr': {
      const para_ids = selectParachainIdsBySession(state, session)
        .map(para_id => selectParachainBySessionAndParaId(state, session, para_id))
        .sort((a, b) => b._mvr - a._mvr)
        .map(o => o.pid);
      return para_ids
    }
    default: {
      return selectParachainIdsBySession(state, session)
    }
  }
};

export const selectScheduledParachainsBySession = (state, session) => {
  return selectParachainIdsBySession(state, session)
        .map(para_id => selectParachainBySessionAndParaId(state, session, para_id))
        .filter(para => !isUndefined(para) && !isNull(para.group))
        .length
}

export const selectMVRsBySession = (state, session) => !!selectSessionByIndex(state, session) ? 
  (isArray(selectSessionByIndex(state, session)._mvrs) ? 
    selectSessionByIndex(state, session)._mvrs : []) : [];

export const selectDisputesBySession = (state, session) => !!selectSessionByIndex(state, session) ? 
  (isArray(selectSessionByIndex(state, session)._dispute_stashes) ? 
    selectSessionByIndex(state, session)._dispute_stashes : []) : [];

export const selectLowGradesBySession = (state, session) => !!selectSessionByIndex(state, session) ? 
  (isArray(selectSessionByIndex(state, session)._f_grade_stashes) ? 
    selectSessionByIndex(state, session)._f_grade_stashes : []) : [];

export const selectValidityVotesBySession = (state, session) => !!selectSessionByIndex(state, session) ? 
  (isArray(selectSessionByIndex(state, session)._validity_votes) ? 
    selectSessionByIndex(state, session)._validity_votes : []) : [];

export const selectBackingPointsBySession = (state, session) => !!selectSessionByIndex(state, session) ? 
  (isArray(selectSessionByIndex(state, session)._backing_points) ? 
    selectSessionByIndex(state, session)._backing_points : []) : [];

export const selectParaValidatorIdsBySessionGrouped = (state, session) => !!selectSessionByIndex(state, session) ? 
  selectSessionByIndex(state, session)._group_ids.map(groupId => selectValidatorIdsBySessionAndGroupId(state, session, groupId)) : [];

export const selectParaValidatorsBySessionGrouped = (state, session) => !!selectSessionByIndex(state, session) ? 
  selectSessionByIndex(state, session)._group_ids.map(groupId => selectValidatorsBySessionAndGroupId(state, session, groupId)) : [];

export const selectMvrBySessions = (state, sessionIds = []) => sessionIds.map(id => {
  const session = selectSessionByIndex(state, id);
  if (!isUndefined(session)) {
    return session._mvr
  }
})

export const selectBackingPointsBySessions = (state, sessionIds = []) => sessionIds.map(id => {
  const session = selectSessionByIndex(state, id);
  if (!isUndefined(session)) {
    if (!isUndefined(session.stats)) {
      return session.stats.pt - (session.stats.ab * 20); 
    }
  }
}).filter(v => !isUndefined(v))

export const selectTotalPointsBySessions = (state, sessionIds = []) => sessionIds.map(id => {
  const session = selectSessionByIndex(state, id);
  if (!isUndefined(session)) {
    if (!isUndefined(session.stats)) {
      return session.stats.pt; 
    }
  }
}).filter(v => !isUndefined(v))

export const  selectAuthoredBlocksBySessions = (state, sessionIds = []) => sessionIds.map(id => {
  const session = selectSessionByIndex(state, id);
  if (!isUndefined(session)) {
    if (!isUndefined(session.stats)) {
      return session.stats.ab; 
    }
  }
}).filter(v => !isUndefined(v))

export const  selectDisputesBySessions = (state, sessionIds = []) => sessionIds.map(id => {
  const session = selectSessionByIndex(state, id);
  if (!isUndefined(session)) {
    if (!isUndefined(session.stats)) {
      return session.stats.di
    }
  }
}).filter(v => !isUndefined(v))

// Era
export const selectEraPointsBySession = (state, sessionId) => {
  const session = selectSessionByIndex(state, sessionId)
  if (!isUndefined(session)) {
    // Calculate previous sessions points
    let sessionIds = []
    for (let i = 1; i < session.esix; i++) {
      sessionIds.push(session.six - i);
    }
    let previousSessionsPoints = selectTotalPointsBySessions(state, sessionIds).reduce((a, b) => a + b, 0);
    // Get current session points from last finalized block
    const block = selectFinalizedBlock(state)
    if (!isUndefined(block)) {
      if (!isUndefined(block.stats)) {
        return previousSessionsPoints + block.stats.pt
      }
    }
    return previousSessionsPoints
  }
  return 0
}

export const buildSessionIdsArrayHelper = (startSession, max = 0) => {
  if (isNaN(startSession)) {
    return []
  }
  let out = [];
  for (let i = max - 1; i >= 0; i--) {
    out.push(startSession-i);
  }
  return out;
}

export const { sessionHistoryChanged, sessionHistoryRangeChanged, sessionHistoryIdsChanged } = sessionsSlice.actions;

export default sessionsSlice;