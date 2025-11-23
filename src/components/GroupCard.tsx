import React from 'react';
import { Link } from 'react-router-dom';

interface GroupCardProps {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  onDelete: (id: string) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ id, name, description, memberCount, onDelete }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">
        <Link to={`/groups/${id}`} className="text-indigo-600 hover:underline">
          {name}
        </Link>
      </h2>
      {description && <p className="text-gray-600">{description}</p>}
      <p className="text-sm text-gray-500 mt-2">{memberCount} members</p>
      <div className="mt-4 flex space-x-2">
        <Link to={`/groups/${id}/edit`} className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded">
          Edit
        </Link>
        <button
          onClick={() => onDelete(id)}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default GroupCard;
