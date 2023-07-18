import React, { useState } from 'react'
import './styles.css'
import { Radio, Select, Table } from 'antd'
import { parse, unparse } from 'papaparse'
import { toast } from 'react-toastify'
import { doc, updateDoc } from "firebase/firestore";

function TransactionTable({ transactions, addTranaction, fetchTransactions }) {
    const { Option } = Select
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [sortKey, setSortKey] = useState('')
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type'
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date'
        },
        {
            title: 'Tag',
            dataIndex: 'tag',
            key: 'tag'
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount'
        },
    ]
    let reverseTransaction = [...transactions].reverse();
    
    const filterArray =
        reverseTransaction.filter((item) =>
            item.name.toLowerCase().includes(search.toLocaleLowerCase()) && item.type.includes(typeFilter)
        )

    let sortedTransactions = filterArray.sort((a, b) => {
        if (sortKey === 'date') {
            return new Date(a.date) - new Date(b.date)
        }
        else if (sortKey === 'amount') {
            return a.amount - b.amount
        }
        else {
            return 0;
        }
    })


    function exportCSV() {
        const csv = unparse({
            fields: ["name", "type", 'amount', 'date', 'tag'],
            data: transactions,
        })
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'transactions.csv'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    function importCSV(event) {
        console.log("IMPORTING")
        event.preventDefault()
        try {
            parse(event.target.files[0], {
                header: true,
                complete: async function (result) {
                    console.log(result)
                    for (const i of result.data) {
                        const newTransaction = {
                            ...i,
                            amount: parseFloat(i.amount)
                        }
                        await addTranaction(newTransaction, true)
                    }
                }
            })
            toast.success('All Transaction Added')
            fetchTransactions()
            event.target.files = null;
        } catch (e) {
            console.log('error>>>', e)
            toast.error("Unable to add CSV")
        }
    }
    const handleClear = () => {
        setSearch('')
    };
    return (
        <div style={{ padding: '0rem 2rem' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    alignItems: 'center',
                    marginBottom: '1rem',
                }}
            >
                <div className='input-flex'>
                    <span style={{ width: '16px' }} class="material-symbols-outlined">
                        search
                    </span>
                    <input
                        type='text'
                        placeholder='Search By Name'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <span onClick={handleClear} class={search ? 'material-symbols-outlined cross-icon' : ''}>
                            close
                        </span>
                    )}

                </div>
                <Select
                    className='select-input'
                    onChange={(value) => setTypeFilter(value)}
                    value={typeFilter}
                    placeholder='Filter...'
                    allowClear
                >
                    <Option value=''>All</Option>
                    <Option value='income'>Income</Option>
                    <Option value='expense'>Expense</Option>
                </Select>
            </div>
            <div className='my-table'>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '97vw',
                        alignItems: 'center',
                        marginBottom: '1rem',
                    }}
                >
                    <h2>MY Transactions</h2>
                    <Radio.Group
                        className='input-radio'
                        onChange={(e) => setSortKey(e.target.value)}
                        value={sortKey}
                    >
                        <Radio.Button value=''>No Sort</Radio.Button>
                        <Radio.Button value='date'>Sort By Date</Radio.Button>
                        <Radio.Button value='amount'>Sort By Amount</Radio.Button>
                    </Radio.Group>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '1rem',
                            width: '400px',
                            // marginRight:'-70px'
                        }}
                    >
                        <button className='btn' onClick={exportCSV}>Export To CSV</button>
                        <label for='file-csv' className='btn btn-blue'>Import from CSV</label>
                        <input
                            //onChange={importfromCsv}
                            id='file-csv'
                            type='file'
                            accept='.csv'
                            onChange={importCSV}
                            required
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>
                <Table dataSource={sortedTransactions} columns={columns} />
            </div>
        </div>
    )
}

export default TransactionTable
