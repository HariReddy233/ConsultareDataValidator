import React from 'react';

export interface Column<T = any> {
  key: string;
  label: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowKey?: keyof T | ((record: T) => string | number);
  onRowClick?: (record: T, index: number) => void;
  striped?: boolean;
  hover?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  rowKey = 'id',
  onRowClick,
  striped = true,
  hover = true,
  size = 'md',
}: DataTableProps<T>) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index;
  };

  const getValue = (record: T, key: string): any => {
    return key.split('.').reduce((obj, k) => obj?.[k], record);
  };

  if (loading) {
    return (
      <div className={`overflow-hidden rounded-lg border border-gray-200 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`overflow-hidden rounded-lg border border-gray-200 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${sizeClasses[size]} ${column.className || ''}`}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`bg-white divide-y divide-gray-200 ${striped ? 'divide-y' : ''}`}>
            {data.map((record, index) => (
              <tr
                key={getRowKey(record, index)}
                onClick={() => onRowClick?.(record, index)}
                className={`${hover ? 'hover:bg-gray-50' : ''} ${onRowClick ? 'cursor-pointer' : ''} ${striped && index % 2 === 1 ? 'bg-gray-50' : ''}`}
              >
                {columns.map((column) => {
                  const value = getValue(record, column.key);
                  const alignClass = column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left';
                  
                  return (
                    <td
                      key={column.key}
                      className={`px-6 py-4 whitespace-nowrap ${sizeClasses[size]} ${alignClass} ${column.className || ''}`}
                    >
                      {column.render ? column.render(value, record, index) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;





