import Sidebar from "../../components/SideBar";
import Header from "../../components/Header";
import StatCard from "../../components/StatCard";
import RevenueChart from "../../components/RevenueChart";
import OrdersTable from "../../components/OrdersTable";
import  Footer  from "../../components/Footer";

export default function Dashboard() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6 space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Lucro" value="$48.291" icon="fa-dollar-sign" percent="12%" color="bg-blue-100 text-cordes-blue" />
            <StatCard title="Total Users" value="15.847" icon="fa-users" percent="8%" color="bg-green-100 text-green-600" />
            <StatCard title="Total Orders" value="2.847" icon="fa-shopping-cart" percent="15%" color="bg-orange-100 text-orange-600" />
            <StatCard title="Products" value="1.247" icon="fa-box" percent="5%" color="bg-purple-100 text-purple-600" />
          </div>

          {/* Chart + Table */}
          <div className="flex flex-col gap-6">
             <div>
                <OrdersTable />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantidade de obras por mês:</h3>
                <RevenueChart />
              </div>
            </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
