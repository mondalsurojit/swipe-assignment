// hooks/useDashboard.js
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { dashboardActions } from '../store';
import ApiService from '../services/api';
import { message } from 'antd';

export const useDashboard = () => {
  const dispatch = useDispatch();
  const dashboard = useSelector(state => state.dashboard);
  const debounceTimer = useRef(null);

  const fetchCandidates = async () => {
    try {
      dispatch(dashboardActions.setLoading(true));
      const params = {
        search: dashboard.searchTerm,
        sortBy: dashboard.sortBy,
        order: dashboard.sortOrder
      };
      
      const result = await ApiService.getCandidates(params);
      dispatch(dashboardActions.setCandidates(result));
    } catch (error) {
      message.error(error.message || 'Failed to fetch candidates');
    } finally {
      dispatch(dashboardActions.setLoading(false));
    }
  };

  const getCandidateDetails = async (sessionId) => {
    try {
      const result = await ApiService.getCandidateDetails(sessionId);
      dispatch(dashboardActions.setSelectedCandidate(result));
    } catch (error) {
      message.error(error.message || 'Failed to fetch candidate details');
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchCandidates();
    }, 500); // 500ms delay for search

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [dashboard.searchTerm]);

  // Immediate fetch for sort changes
  useEffect(() => {
    fetchCandidates();
  }, [dashboard.sortBy, dashboard.sortOrder]);

  return {
    ...dashboard,
    fetchCandidates,
    getCandidateDetails,
    setSearchTerm: (term) => dispatch(dashboardActions.setSearchTerm(term)),
    setSortBy: (sortBy) => dispatch(dashboardActions.setSortBy(sortBy)),
    setSortOrder: (order) => dispatch(dashboardActions.setSortOrder(order)),
    setSelectedCandidate: (candidate) => dispatch(dashboardActions.setSelectedCandidate(candidate))
  };
};