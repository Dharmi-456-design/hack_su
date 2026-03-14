/**
 * useApi — Generic CRUD hook for any API endpoint
 * Usage: const { data, loading, error, create, update, remove, reload } = useApi('/machines');
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export function useApi(endpoint, options = {}) {
  const { autoFetch = true, transform = null } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint);
      const raw = res.data?.data ?? res.data;
      setData(transform ? (Array.isArray(raw) ? raw.map(transform) : transform(raw)) : raw);
    } catch (err) {
      const msg = err.response?.data?.error || `Failed to load ${endpoint}`;
      setError(msg);
      console.error(`useApi[${endpoint}]:`, msg);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (autoFetch) fetchData();
  }, [fetchData, autoFetch]);

  const create = useCallback(async (payload) => {
    try {
      const res = await api.post(endpoint, payload);
      toast.success('Created successfully');
      fetchData();
      return res.data?.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Create failed';
      toast.error(msg);
      throw err;
    }
  }, [endpoint, fetchData]);

  const update = useCallback(async (id, payload) => {
    try {
      const res = await api.put(`${endpoint}/${id}`, payload);
      toast.success('Updated successfully');
      fetchData();
      return res.data?.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Update failed';
      toast.error(msg);
      throw err;
    }
  }, [endpoint, fetchData]);

  const remove = useCallback(async (id) => {
    try {
      await api.delete(`${endpoint}/${id}`);
      toast.success('Deleted successfully');
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Delete failed';
      toast.error(msg);
      throw err;
    }
  }, [endpoint, fetchData]);

  return { data, loading, error, reload: fetchData, create, update, remove, setData };
}
