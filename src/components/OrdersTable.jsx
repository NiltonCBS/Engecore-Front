

export default function OrdersTable() {

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <p className="text-gray-600 text-sm">Latest customer orders and transactions</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <i className="fas fa-download mr-2"></i>Export
          </button>
          <button className="px-4 py-2 bg-cordes-blue text-white rounded-lg hover:bg-cordes-dark transition-colors">
            <i className="fas fa-plus mr-2"></i>Add Order
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Order ID</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Product</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4">#15847</td>
              <td className="px-6 py-4">John Doe</td>
              <td className="px-6 py-4">iPhone 15 Pro</td>
              <td className="px-6 py-4 font-semibold">$1,299</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                  Completed
                </span>
              </td>
              <td className="px-6 py-4">May 22, 2025</td>
              <td className="px-6 py-4 flex space-x-2">
                <button className="text-cordes-blue"><i className="fas fa-eye"></i></button>
                <button className="text-gray-600"><i className="fas fa-edit"></i></button>
                <button className="text-red-600"><i className="fas fa-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
