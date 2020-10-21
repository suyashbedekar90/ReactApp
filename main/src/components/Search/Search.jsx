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
import Alert from '@material-ui/lab/Alert';
import styled from 'styled-components';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const SearchWrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-items: center;
    width: 700px;
`

const AutoCompleteWrapper = styled.div`
   width: 500px;  
`

const ButtonWrapper = styled.div`
   width: 100px;
`

const ErrorWrapper = styled.div`
   width: 635px;
   margin-left: 35px;
`

const TableWrapper = styled.div`
   min-width: 690px;
`

const HeaderWrapper = styled.div`
   min-width: 690px;
`

const Search = () => {
    const [value, setValue] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);
    const [rows, setRows] = useState([]);
    const [error, setError] = useState(false);
    const [isOptionsLoading, setIsOptionsLoading] = useState(false);

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

        if (!inputValue) {
            setError(false);
        } else if (inputValue) {
            setIsOptionsLoading(true);
        }
    }, [value, inputValue])

    useDebounce(
        () => {
            if(inputValue && !value) {
                setIsOptionsLoading(false);
                axios.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${inputValue}&apikey=3PG1EIX2R15JB4FB`)
                    .then(res => {
                        const apiData = res.data;
                        setOptions(apiData?.bestMatches?.map(stockData => stockData['1. symbol'] + ' | ' +  stockData['2. name']));
                        if (apiData?.bestMatches.length === 0) {
                            setError(true);
                        }
                })
            }
        },
        750,
        [inputValue]
    )

    return (
        <div>
            <HeaderWrapper>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6">
                            Stocks Explorer
                        </Typography>
                    </Toolbar>
                </AppBar>
            </HeaderWrapper>
            <SearchWrapper>
                <AutoCompleteWrapper>
                    <Autocomplete
                        id="stock_search_typeahead"
                        freeSolo
                        loading={isOptionsLoading}
                        options={options}
                        onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
                        onChange={(event, newValue) => {
                            setValue(newValue);
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Search stocks" margin="normal" variant="outlined" />
                        )}
                    />
                </AutoCompleteWrapper>
                <ButtonWrapper>
                    <Button
                        variant="contained"
                        color="primary"
                    >
                        Search
                    </Button>
                </ButtonWrapper>
            </SearchWrapper>
            <TableWrapper>
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
                                    <TableCell align="right">{row.open + ' USD'}</TableCell>
                                    <TableCell align="right">{row.close + ' USD'}</TableCell>
                                    <TableCell align="right">{row.price + ' USD'}</TableCell>
                                    <TableCell align="right">{row.volume}</TableCell>
                                    <TableCell align="right">{row.high + ' USD'}</TableCell>
                                    <TableCell align="right">{row.low + ' USD'}</TableCell>
                                </TableRow>
                            ))}

                        </TableBody>
                    </Table>
                </TableContainer>}
            </TableWrapper>
            <ErrorWrapper>
                {error && <Alert severity="error">Sorry no stock match found for your search term.</Alert>}
            </ErrorWrapper>
        </div>
    );
}

export default Search;
