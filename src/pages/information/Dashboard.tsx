import '../../css/Dashboard.css';
// import DashboardTable from "../../components/dashboard/DashboardTable";
import LineChart from "../../components/dashboard/LineChart";
import TruckTransactionTable from '../../components/trucks/TruckTransactionTable';
import SiteMap from '../../components/dashboard/SiteMap';
import { useState } from 'react';
import Axios from "axios";
import { AuthContextType, useAuth } from '../../utils/AuthContext';
// import { io } from 'socket.io-client';

// const socket = io('http://localhost:3001');
// console.log(socket);

export interface SoilData {
  site_id: number;
  soil_amount: number;
  date: string;
  project_name: string;
}

function Dashboard() {
  const { user } = useAuth() as AuthContextType;
  const [siteId, setSiteId] = useState<number>(0);
  const [lineChartData, setLineChartData] = useState<Array<SoilData>>([]);
  const [selectedDates, setSelectedDates] = useState<Array<string>>([]);
  const [dateStartString, setDateStartString] = useState('');
  const [dateEndString, setDateEndString] = useState('');

  const getLineChartData = () => {
    if(user) {
      Axios.get('http://localhost:3001/api/dashboard', {
        params: {
          id: user.id,
          date_start: dateStartString,
          date_end: dateEndString
        }
      }).then((response) => {
        setLineChartData(response.data);
        if(dateStartString && dateEndString){
          fillSelectedDates();
        }
      });
    };
  }

  function fillSelectedDates() {
    let currentDate = new Date(dateStartString);
    let stopDate = new Date(dateEndString);
    let dateRange = [];
    for(currentDate; currentDate<=stopDate; currentDate.setDate(currentDate.getDate()+1)) {
      let month = (currentDate.getUTCMonth() + 1).toString();
      if (month.length === 1) {
        month = '0' + month;
      }
      let day = currentDate.getUTCDate().toString();
      if (day.length === 1) {
        day = '0' + day;
      }
      const year = currentDate.getUTCFullYear();
      const newDate = year + "-" + month + "-" + day;
      dateRange.push(newDate);
    }
    if(dateRange.length > 0) {
      setSelectedDates(dateRange);
    }
  }

  return (
    <>
      <div className='bg-div' />
      <div className='main_div'>
        <div className='px-4 pt-3 pb-2 mb-1'>
          <h3 className='main-text site-header-text'>DASHBOARD</h3>
        </div>
        <div className='container-fluid'>
            <div className='row mb-3'>
              <div className='col-sm-12 col-md-4 col-md-4'>
                <SiteMap setSiteId={setSiteId} />
              </div>
              <div className='col-sm-12 col-md-8 col-md-8'>
                <LineChart siteId={siteId} getLineChartData={getLineChartData} lineChartData={lineChartData} selectedDates={selectedDates} setSelectedDates={setSelectedDates} setDateStartString={setDateStartString} setDateEndString={setDateEndString} />
              </div>
            </div>
            <div className='row'>
              <div className="col mb-2">
                <TruckTransactionTable getLineChartData={getLineChartData} siteId={siteId} />
              </div>
            </div>
        </div>
      </div>
    </>
  )
}

  export default Dashboard;
