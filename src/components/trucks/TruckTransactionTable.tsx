import { Card } from "react-bootstrap";
import { ReactTabulator, reactFormatter } from "react-tabulator";
import 'react-tabulator/lib/styles.css';
import 'react-tabulator/css/tabulator_materialize.min.css';
import Axios from 'axios';
import { useEffect, useState } from 'react';
import { Button } from "@mui/material";
import { Edit } from "@mui/icons-material";
import '../../css/TabulatorTables.css';

function TruckTransactionTable() {
  const [listOfTruckTransactions, setListOfTruckTransactions] = useState([]);

  useEffect(() => {
    getTruckTransactions();
  }, []);

  const getTruckTransactions = () =>{
    Axios.get('http://localhost:3001/api/truck-transactions').then((response) => {
      setListOfTruckTransactions(() => {
        return response.data.map((entry:any) => {
          return {...entry}
        })          
      });
    });
  };

  return (
    <Card className="site-table-card shadow-sm">
      <Card.Body className='manager-cards'>
        <ReactTabulator
            data={listOfTruckTransactions}
            columns={columns}
            options={options}
        />
      </Card.Body>      
    </Card>
  )
}

export default TruckTransactionTable;

const testTickleZ = (cellData:any) => {
  alert(cellData);
}

const EditFormat = (props:any) => {
  let deezNuts = props.cell.getData();
  deezNuts = deezNuts.truck_transaction_id;
  return (
    <Button variant='outlined' color='error' startIcon={<Edit />} onClick={() => {testTickleZ(deezNuts)}}>
      ACTION
    </Button>
  );
}

const options = {
  layout: 'fitDataStretch',
  pagination: true,
  paginationSize: 5,
  paginationSizeSelector: [5, 10, 50, 100, 1000],
  paginationCounter: 'rows',
  paginationButtonCount: 3
}

const columns = [
  // {field: 'truck_transaction_id', width: '8%', hozAlign: 'center', headerSort: false, formatter: reactFormatter(<EditFormat />)},
  {title: 'Project', field: 'project_name', headerHozAlign: 'center', width: '17%'},
  {title: 'License Plate', field: 'license_plate', headerHozAlign: 'center', width: '15%', headerSort: false},
  {
    title: 'Direction',
    headerHozAlign: 'center',
    columns: [
      {title: 'Inside', field: 'in', width: '7%', headerHozAlign: 'center', hozAlign: 'center', headerSort: false, formatter: 'tickCross'},
      {title: 'Outside', field: 'out', width: '7%', headerHozAlign: 'center', hozAlign: 'center', headerSort: false, formatter: 'tickCross'}
    ]
  },
  {title: 'Amount of Soil', field: 'soil_amount', headerHozAlign: 'center', width: '12%'},
  {
    title: 'Timestamp',
    headerHozAlign: 'center',
    columns: [
      {title: 'Inside', field: 'in_time', headerHozAlign: 'center', width: '17%'},
      {title: 'Outside', field: 'out_time', headerHozAlign: 'center', width: '17%'}
    ]
  }
];
