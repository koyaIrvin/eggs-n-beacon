import { Button, Checkbox, Divider, FormControl, FormControlLabel, FormHelperText, FormLabel, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Modal } from "react-bootstrap";
import { AuthContextType, useAuth } from "../../utils/AuthContext";
import Axios from "axios";
import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { LoadingButton } from "@mui/lab";

interface SelectData {
    project_name: string,
    license_plate: string,
    site_id: number,
    truck_id: number,
    weight_capacity: number
}

function TransactionModalAdd(props:any) {
    const { user } = useAuth() as AuthContextType;
    const [listOfSelectData, setListOfSelectData] = useState<Array<SelectData>>([]);
    const [listOfProjects, setListOfProjects] = useState<Array<SelectData>>([]);
    const [listOfTrucks, setListOfTrucks] = useState<Array<SelectData>>([]);
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [selectedTruck, setSelectedTruck] = useState<string>('');
    const [soilAmount, setSoilAmount] = useState('');
    const [checkedIn, setCheckedIn] = useState(true);
    const [checkedOut, setCheckedOut] = useState(true);
    const [inTime, setInTime] = useState<Dayjs | null>(null);
    const [outTime, setOutTime] = useState<Dayjs | null>(null);
    const [addLoading, setAddLoading] = useState(false);

    useEffect(() => {
      getSelectData();
    }, [])

    useEffect(() => {
        setListOfProjects(listOfSelectData.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.project_name === value.project_name
            ))
        ));
        const currDate = dayjs();
        setInTime(currDate);
        setOutTime(currDate);
    }, [listOfSelectData]);

    useEffect(() => {
        const license_plate_list = listOfSelectData.filter((project) => project.site_id === parseFloat(selectedProject));
        setListOfTrucks(license_plate_list);
    }, [selectedProject]);

    useEffect(() => {
        if(selectedTruck) {
            const weightCapObj = listOfSelectData.filter((project) => project.truck_id === parseFloat(selectedTruck));
            const weightCapOfTruck = weightCapObj[0].weight_capacity.toString();
            setSoilAmount(weightCapOfTruck);
        }
    }, [selectedTruck]);

    const setMaxDate = (daysToAdd: number) => {
        const now = new Date();
        const nowPlusDays = now.setDate(now.getDate() + daysToAdd);
        return dayjs(dayjs(nowPlusDays).format("YYYY-MM-DD"), 'YYYY-MM-DD');
    };

    const getSelectData = () => {
        if(user) {
            const userId = user.id;
            Axios.get('http://localhost:3001/api/transactions-select-data', {
            params: {
                id: userId
            }
            }).then((response) => {
                setListOfSelectData(() => {
                    return response.data.map((entry:any) => {
                    return {...entry}
                    })
                });
            });
        }
    };

    const addTransaction = () => {
        setAddLoading(true);
        const in_num = (+ checkedIn);
        const out_num = (+ checkedOut);
        const soil_amount = parseFloat(soilAmount);
        const in_time = dayjs(inTime).format('YYYY-MM-DD hh:mm:ss');
        const out_time = dayjs(outTime).format('YYYY-MM-DD hh:mm:ss');
        Axios.post('http://localhost:3001/api/add-transaction', {
            truck_id: selectedTruck,
            site_id: selectedProject,
            soil_amount: soil_amount,
            in: in_num,
            out: out_num,
            in_time: in_time,
            out_time: out_time
        
        }).then((response) => {
            if(response.data.status === 'success') {
                setSelectedProject('');
                setSelectedTruck('');
                setSoilAmount('');
                props.onHide();
            }
            setAddLoading(false);
        });
    }

    const handleChangeProj = (event: SelectChangeEvent) => {
        if(selectedTruck) {
            setSelectedTruck('');
        }
        if(soilAmount) {
            setSoilAmount('');
        }
        setSelectedProject(event.target.value as string);
    }

    const handleChangeTruck = (event: SelectChangeEvent) => {
        setSelectedTruck(event.target.value as string);
    }

    const handleInCheckChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCheckedIn(event.target.checked);
    }

    const handleOutCheckChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCheckedOut(event.target.checked);
    }

  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className='main-text'
    >
      <Modal.Header className='border-0'>
        <Modal.Title id="contained-modal-title-vcenter">
          Create New Transaction
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='d-flex flex-column'>
        <div className='form-wrap'>
            <FormControl fullWidth size='small'>
                <InputLabel id='project-name'>Project Name</InputLabel>
                <Select label='Project Name' labelId='project-name' value={selectedProject} onChange={handleChangeProj}>
                    { listOfProjects.length ? ('') : (
                        <MenuItem value=''>
                            <em>No projects found</em>
                        </MenuItem>
                    ) }
                    { listOfProjects.map((project) => {
                        return (
                            <MenuItem key={project.site_id} value={project.site_id}>{project.project_name}</MenuItem>
                        );
                    }) }
                </Select>
            </FormControl>
            <FormControl fullWidth size='small'>
                <InputLabel id='license-plate'>License Plate</InputLabel>
                <Select label='License Plate' labelId='license-plate' value={selectedTruck} onChange={handleChangeTruck}>
                    { listOfTrucks.length ? ('') : (
                        <MenuItem value=''>
                            <em>No trucks found</em>
                        </MenuItem>
                    ) }
                    { listOfTrucks.map((project) => {
                        return (
                            <MenuItem key={project.truck_id} value={project.truck_id}>{project.license_plate}</MenuItem>
                        );
                    }) }
                </Select>
                {selectedProject ? ('') : (
                    <FormHelperText>Select a project name to view license plates</FormHelperText>
                )}
            </FormControl>
            <TextField label='Amount of Soil' variant='outlined' size='small' type='number' value={soilAmount} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSoilAmount(event.target.value)} autoComplete='off' />
            <Divider />
                <FormLabel component='legend'>Direction</FormLabel>
            <div className='form-row-wrap'>
                <FormControlLabel control={<Checkbox defaultChecked onChange={handleInCheckChange} size='small' />} label='Inside' />
                <FormControlLabel control={<Checkbox defaultChecked onChange={handleOutCheckChange} size='small' />} label='Outside' />
            </div>
            <Divider />
            <FormLabel component='legend'>Timestamp</FormLabel>
            <div className='form-row-wrap'>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker label='Inside' format='YYYY-MM-DD hh:mm' value={inTime} onChange={(newValue) => setInTime(newValue)} maxDate={setMaxDate(0)} slotProps={{ textField: { size: 'small' } }} />
                    <DateTimePicker label='Outside' format='YYYY-MM-DD hh:mm' value={outTime} onChange={(newValue) => setOutTime(newValue)} maxDate={setMaxDate(0)} slotProps={{ textField: { size: 'small' } }} />
                </LocalizationProvider>
            </div>
        </div>
      </Modal.Body>
      <Modal.Footer className='border-0 button-row-wrap'>
            <Button onClick={props.onHide} variant='outlined'>Cancel</Button>
            { addLoading ? (
                <LoadingButton variant='contained' loading>Save</LoadingButton>
            ) : (
                <Button onClick={addTransaction} variant='contained' type='submit' disableElevation>Save</Button>
            ) }
      </Modal.Footer>
    </Modal>
  );
}

export default TransactionModalAdd;
