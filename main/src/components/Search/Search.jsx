import React, { useState, useEffect } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { useDebounce } from 'react-use';
import axios from 'axios';

const Search = () => {
    const [value, setValue] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);
    const [rows, setRows] = useState([]);
    //const [isOptionsLoading, setIsOptionsLoading] = useState(true);

    useEffect(() => {
        if (value) {
            const targetSymbol = value.split('|')[0].replace(" ", "");
            axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${targetSymbol}&apikey=3PG1EIX2R15JB4FB`)
                .then(res => {
                    const apiData = res.data;
                    setRows([
                        {
                            symbol: apiData['Global Quote']['01. symbol'],
                            open: apiData['Global Quote']['02. open'],
                            close: apiData['Global Quote']['08. previous close'],
                            price: apiData['Global Quote']['05. price'],
                            volume: apiData['Global Quote']['06. volume'],
                            high: apiData['Global Quote']['03. high'],
                            low: apiData['Global Quote']['04. low']
                        }
                    ]);
                })
        }
    }, [value])

    useDebounce(
        () => {
            if(inputValue && !value) {
                //setIsOptionsLoading(false);
                axios.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${inputValue}&apikey=3PG1EIX2R15JB4FB`)
                    .then(res => {
                        const apiData = res.data;
                        setOptions(apiData?.bestMatches?.map(stockData => stockData['1. symbol'] + ' | ' +  stockData['2. name']));
                })
            }
        },
        750,
        [inputValue]
    )

    return (
        <div>
            <h3>{'Value is' + value}</h3>
            <h3>{'InputValue: ' + inputValue}</h3>
            <Autocomplete
                id="stock_search_typeahead"
                freeSolo
                /*loading={inputValue ?
                    isOptionsLoading ? true : setIsOptionsLoading(true) :
                    false}*/
                options={options}
                onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
                onChange={(event, newValue) => {
                    setValue(newValue);
                }}
                renderInput={(params) => (
                    <TextField {...params} label="Search stocks" margin="normal" variant="outlined" />
                )}
            />
            <Button
                variant="contained"
                color="primary"
            >
                    Search
            </Button>
            {value && <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Stock Symbol</TableCell>
                            <TableCell align="right">Open at</TableCell>
                            <TableCell align="right">Close at</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Volume</TableCell>
                            <TableCell align="right">High</TableCell>
                            <TableCell align="right">Low</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                    {row.symbol}
                                </TableCell>
                                <TableCell align="right">{row.open}</TableCell>
                                <TableCell align="right">{row.close}</TableCell>
                                <TableCell align="right">{row.price}</TableCell>
                                <TableCell align="right">{row.volume}</TableCell>
                                <TableCell align="right">{row.high}</TableCell>
                                <TableCell align="right">{row.low}</TableCell>
                            </TableRow>
                        ))}

                    </TableBody>
                </Table>
            </TableContainer>}
        </div>
    );
}

export default Search;
