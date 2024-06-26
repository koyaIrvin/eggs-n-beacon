import { Card } from "react-bootstrap";
import { ReactTabulator, reactFormatter } from "react-tabulator";
import 'react-tabulator/lib/styles.css';
import 'react-tabulator/css/tabulator_materialize.min.css';
import Axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, ButtonBase, InputAdornment, TextField, ThemeProvider } from "@mui/material";
import { Delete, Edit, FilterAltRounded, SearchRounded, SettingsRounded } from "@mui/icons-material";
import '../../css/TabulatorTables.css';
import { blackTheme, greenTheme, redTheme } from "../MaterialThemes";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { AuthContextType, useAuth } from "../../utils/AuthContext";
import TransactionModal from "./TransactionModal";
import { ReactTabulatorProps } from "react-tabulator/lib/ReactTabulator";
import TransactionModalConfirm from "./TransactionModalConfirm";
import { Dayjs } from "dayjs";

function TruckTransactionTable({ getLineChartData, siteId }:{ getLineChartData?:() => void, siteId?:number }) {
  const { user } = useAuth() as AuthContextType;
  const [listOfTruckTransactions, setListOfTruckTransactions] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [confirmModalShow, setConfirmModalShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [rowData, setRowData] = useState<Object>({});
  const [toggleVisibility, setToggleVisibility] = useState<boolean>(false);
  const [tableRef, setTableRef] = useState<ReactTabulatorProps | null>(null);
  const [projectNameFilter, setProjectNameFilter] = useState('');
  const [truckFilter, setTruckFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);
  const [pageSize, setPageSize] = useState(0);

  useEffect(() => {
    getTruckTransactions();
    siteId != null ? setPageSize(5) : setPageSize(10);
  }, []);

  useEffect(() => {
    toggleDisplay();
  }, [siteId]);

  useEffect(() => {
    filterTable();
  }, [projectNameFilter, truckFilter, dateFilter]);

  const toggleDisplay = () => {
    siteId != 0 ?
    tableRef?.setFilter([
      { field: 'site_id', type: '=', value: siteId }
    ])
    :
    tableRef?.setFilter([
      { field: 'site_id', type: '!=', value: siteId }
    ])
    ;
  };

  const getTruckTransactions = () => {
    if(user) {
      Axios.get('http://localhost:3001/api/truck-transactions', {
        params: {
          id: user.id,
          role: user.role
        }
      }).then((response) => {
        setListOfTruckTransactions(response.data);
        setToggleVisibility(false);
      });
    }
  };

  const editRow = (row:ReactTabulatorProps, tabRow:ReactTabulatorProps) => {
    tabRow.select();
    setIsEdit(true);
    setRowData(row);
    setModalShow(true);
  }

  const deleteRow = (row:ReactTabulatorProps, tabRow:ReactTabulatorProps) => {
    tabRow.select();
    setRowData(row);
    setConfirmModalShow(true);
  }

  const showActions = () => {
    tableRef?.showColumn('truck_transaction_id');
  }

  const hideActions = () => {
    tableRef?.hideColumn('truck_transaction_id');
    tableRef?.redraw();
  }

  const OptionsFormat = (props:ReactTabulatorProps) => {
    const tabRow = props.cell.getRow();
    const row = props.cell.getData();
    return (
      <div className='actions-div'>
        <ButtonBase onClick={() => editRow(row, tabRow)} centerRipple={true} sx={{ borderRadius: 25, padding: 0.5 }}><Edit fontSize='small' sx={{ color: '#019B63' }} /></ButtonBase>
        <ButtonBase onClick={() => deleteRow(row, tabRow)} centerRipple={true} sx={{ borderRadius: 25, padding: 0.5 }}><Delete fontSize='small' sx={{ color: '#E72423' }} /></ButtonBase>
      </div>
    );
  }

  const filterTable = () => {
    let filterDate = '';
    if(dateFilter) {
      filterDate = dateFilter.format('YYYY-MM-DD');
    }
    tableRef?.setFilter([
      {field: 'project_name', type: 'like', value: projectNameFilter},
      {field: 'license_plate', type: 'like', value: truckFilter},
      {field: 'in_time', type: 'like', value: filterDate}
    ]);
  }

  const options = {
    layout: 'fitColumns',
    pagination: true,
    paginationSize: pageSize,
    paginationSizeSelector: [5, 10, 50, 100, 1000],
    paginationCounter: 'rows',
    paginationButtonCount: 3,
    selectableRows: true
  }

  const columns:any = [
    {field: 'truck_transaction_id', visible: false, hozAlign: 'center', headerSort: false, formatter: reactFormatter(<OptionsFormat />)},
    {field: 'site_id', visible: false},
    {title: 'Project', field: 'project_name', headerHozAlign: 'center', headerSort: true, widthGrow: 1.5},
    {field: 'truck_id', visible: false},
    {title: 'License Plate', field: 'license_plate', headerHozAlign: 'center', headerSort: false},
    {title: 'Amount of Soil', field: 'soil_amount', headerHozAlign: 'center', headerSort: true, editor: 'number'},
    {
      title: 'Direction',
      headerHozAlign: 'center',
      columns: [
        {title: 'Inside', field: 'in', headerHozAlign: 'center', hozAlign: 'center', headerSort: false, formatter: 'tickCross'},
        {title: 'Outside', field: 'out', headerHozAlign: 'center', hozAlign: 'center', headerSort: false, formatter: 'tickCross'}
      ]
    },
    {
      title: 'Timestamp',
      headerHozAlign: 'center',
      columns: [
        {title: 'Inside', field: 'in_time', headerHozAlign: 'center', widthGrow: 1.5} ,
        {title: 'Outside', field: 'out_time', headerHozAlign: 'center', widthGrow: 1.5}
      ]
    }
  ];

  return (
    <Card className="site-table-card shadow-sm">
      <Card.Header>
        <Card.Title>
          <ThemeProvider theme={blackTheme}>
            <div className='title-wrap'>
              Soil Tracking Table
              <div className='actions-wrap'>
                <div className='filters-wrap'>
                    <TextField label='Project Name'
                      onChange={(event) => {
                        setProjectNameFilter(event.target.value);
                      }}
                      size='small'
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <SearchRounded />
                          </InputAdornment>
                        ) }}
                      autoComplete='off'
                    />
                    <TextField label='License Plate'
                      onChange={(event) => {
                        setTruckFilter(event.target.value);
                      }}
                      size='small'
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <SearchRounded />
                          </InputAdornment>
                        ) }}
                      autoComplete='off'
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker label='Date' format='YYYY-MM-DD' disableFuture={true} onChange={(date) => setDateFilter(date)} slotProps={{ textField: { size: 'small' } }} />
                    </LocalizationProvider>
                    <FilterAltRounded sx={{ color: '#757575' }} />
                </div>
                <div className='d-flex justify-content-between align-items-center settings-wrap'>
                  <ThemeProvider theme={greenTheme}>
                    <ThemeProvider theme={blackTheme}>
                      { toggleVisibility ? (
                        <Button
                            onClick={() => {
                              setToggleVisibility(false)
                              hideActions()
                            }}
                            variant='outlined'
                          >
                            Hide Actions
                        </Button>
                      ) : (
                        <Button
                            onClick={() => {
                              setToggleVisibility(true)
                              showActions()
                            }}
                            variant='outlined'
                          >
                            Show Actions
                        </Button>
                      ) }
                    </ThemeProvider>
                    <Button
                      onClick={() => {
                        setModalShow(true);
                        setIsEdit(false);
                      }}
                      variant='contained'
                    >
                      Create Transaction
                    </Button>
                    <TransactionModal
                      show={modalShow}
                      onHide={() => {
                        tableRef?.deselectRow();
                        setModalShow(false);
                        setIsEdit(false);
                      }}
                      isEdit={isEdit}
                      rowData={rowData}
                      updateTable={getTruckTransactions}
                      updateChart={getLineChartData}
                    />
                    <ThemeProvider theme={redTheme}>
                      <TransactionModalConfirm
                        show={confirmModalShow}
                        onHide={() => {
                          tableRef?.deselectRow();
                          setConfirmModalShow(false);
                        }}
                        rowData={rowData}
                        updateTable={getTruckTransactions}
                        updateChart={getLineChartData}
                      />
                    </ThemeProvider>
                    <SettingsRounded sx={{ color: '#757575' }} />
                  </ThemeProvider>
                </div>
              </div>
            </div>
          </ThemeProvider>
        </Card.Title>
      </Card.Header>
      <Card.Body className='manager-cards'>
        <ReactTabulator
            onRef={(ref) => setTableRef(ref.current)}
            data={listOfTruckTransactions}
            columns={columns}
            options={options}
        />
      </Card.Body>      
    </Card>
  )
}

export default TruckTransactionTable;
