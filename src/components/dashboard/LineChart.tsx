import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Colors } from 'chart.js';
import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import Axios from "axios";
import { AuthContextType, useAuth } from "../../utils/AuthContext";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Button, ThemeProvider } from "@mui/material";
import { greenTheme } from "../../components/MaterialThemes";
import { FilterAltRounded } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";

  interface SoilData {
    soil_amount: number;
    date: string;
    project_name: string;
  }

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Colors
  );

function LineChart() {
  const { user } = useAuth() as AuthContextType;
  const [lineChartData, setLineChartData] = useState<Array<SoilData>>([]);
  const [groupedData, setGroupedData] = useState<Array<any>>([]);
  const [selectedDates, setSelectedDates] = useState(getPastSevenDays());
  const [dateStart, setDateStart] = useState<Dayjs | null>(null);
  const [dateEnd, setDateEnd] = useState<Dayjs | null>(null);
  const [dateStartString, setDateStartString] = useState('');
  const [dateEndString, setDateEndString] = useState('');

  useEffect(() => {
    getLineChartData();
  }, [selectedDates]);

  useEffect(() => {
    groupTheData();
  }, [lineChartData]);

  const getLineChartData = () => {
    if(user) {
      const userId = user.id;
        Axios.get('http://localhost:3001/api/dashboard', {
          params: {
            id: userId,
            date_start: dateStartString,
            date_end: dateEndString
          }
        }).then((response) => {
          setLineChartData(() => {
            return response.data.map((entry:any) => {
              return {...entry}
            });
          });
        });
    };
  }

  function groupTheData() {
    const length: number = lineChartData.length;
    let dataGroup: Array<Array<SoilData>> = [];
    dataGroup = Array.from({ length }, () => []);

    if (length > 0) {
      const groupedData: Record<string, SoilData[]> = {};
      lineChartData.forEach((data) => {
        const projectName = data.project_name;
        if (!groupedData[projectName]) {
          groupedData[projectName] = [];
        }
        groupedData[projectName].push(data);
      });

      Object.values(groupedData).forEach((group) => {
        const index = dataGroup.findIndex((arr) => arr.length === 0);
        const single_projName = group[0].project_name
        for(let i=0; i<selectedDates.length; i++) {
          let single = group.find((arr) => arr.date === selectedDates[i]);
          if (!single) {
            group.push({ project_name: single_projName, soil_amount: 0, date: selectedDates[i] });
          }
        }
        group.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
        if (index !== -1) {
          dataGroup[index] = group;
        }
      });
    }

    dataGroup = dataGroup.filter((arr) => arr.length > 0);
    setGroupedData(dataGroup);
  };

  function fillSelectedDates() {
    const dateStartS = dayjs(dateStart).format('YYYY-MM-DD');
    const dateEndS = dayjs(dateEnd).format('YYYY-MM-DD');
    setDateStartString(dateStartS);
    setDateEndString(dateEndS);
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
    setSelectedDates(dateRange);
  }

  function getPastSevenDays() {
    var pastDays = [];
    var today = new Date();
    
    for (var i = 0; i < 7; i++) {
      let pastDay = new Date(today);
      pastDay.setDate(today.getDate() - i);
      let month = (pastDay.getUTCMonth() + 1).toString();
      if (month.length === 1) {
        month = '0' + month;
      }
      let day = pastDay.getUTCDate().toString();
      if (day.length === 1) {
        day = '0' + day;
      }
      const year = pastDay.getUTCFullYear();
      const newDate = year + "-" + month + "-" + day;
      pastDays.push(newDate);
    }
    pastDays.reverse();
    return pastDays;
  }

  return (
    <Card className="shadow-sm border-0 p-1 h-100">
      <Card.Header style={{ background: 'none', borderWidth: 0 }}>
        <Card.Title className="card-text">
          <div className="title-wrap">
            Amount of Soil
            <div className='date-range'>
              <LocalizationProvider dateAdapter={ AdapterDayjs }>
                <DatePicker label='From' format='YYYY-MM-DD' value={dateStart} onChange={(newValue) => setDateStart(newValue)} slotProps={{ textField: { size: 'small' } }} />
                -
                <DatePicker label='To' format='YYYY-MM-DD' value={dateEnd} onChange={(newValue) => setDateEnd(newValue)} slotProps={{ textField: { size: 'small' } }} />
              </LocalizationProvider>
              <ThemeProvider theme={greenTheme}>
                { dateStart && dateEnd ? (
                  <Button onClick={fillSelectedDates} endIcon={<FilterAltRounded />} variant="contained">Filter</Button>
                ) : (
                  <Button endIcon={<FilterAltRounded />} sx={{ backgroundColor: 'none' ,borderWidth: '0.1rem' ,borderStyle: 'dashed', width: '6.2rem' }} disabled>Filter</Button>
                ) }
              </ThemeProvider>
            </div>
          </div>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        { groupedData.length ?
        (
          <Line
            data={{
              labels: selectedDates,
              datasets: groupedData.map((row) => {
                return ({
                  label: row[0].project_name,
                  data: row.map((cell:SoilData) => cell.soil_amount),
                  tension: 0.2,
                  borderJoinStyle: 'round',
                  borderWidth: 3,
                  // borderColor: '#FFCF8B',
                  // backgroundColor: '#FFCF8B',
                  pointBorderColor: 'black',
                  pointBorderWidth: 2
                });
              })
            }}
            options={{
              maintainAspectRatio: false,
            }}
          />
        ) : (
          <div className="d-flex justify-content-center align-items-center h-100">no data found</div>
        ) }
      </Card.Body>
      {/* <Card.Footer className="border-0">
        <div className="main-text"><p className="mb-0" style={{ textAlign: 'right' }}>Total Amount of Soil in Tons: 20XX</p></div>
      </Card.Footer> */}
    </Card>
  )
}

export default LineChart;
