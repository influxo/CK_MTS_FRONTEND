import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFormById, selectCurrentForm, selectFormsLoading, selectFormsError } from "../../store/slices/formsSlice";
import type { AppDispatch } from "../../store";

export function FormDetails() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const form = useSelector(selectCurrentForm);
  const isLoading = useSelector(selectFormsLoading);
  const error = useSelector(selectFormsError);

  useEffect(() => {
    if (id) {
      dispatch(fetchFormById(id));
    }
  }, [id, dispatch]);

  if (isLoading) {
    return <div>Loading form details...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!form) {
    return <div>No form found</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">{form.name}</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Form Details</h2>
          <p className="text-gray-600">{form.description || 'No description available'}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium">Created At</h3>
            <p className="text-gray-700">
              {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
          <div>
            <h3 className="font-medium">Status</h3>
            <span className={`px-2 py-1 rounded text-sm ${
              form.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {form.status}
            </span>
          </div>
        </div>

        {/* Add more form details as needed */}
      </div>
    </div>
  );
}