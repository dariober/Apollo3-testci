import { AbstractSessionModel, AppRootModel } from '@jbrowse/core/util'
import UndoIcon from '@mui/icons-material/Undo'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material'
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowsProp,
  GridToolbar,
} from '@mui/x-data-grid'
import { changeRegistry } from 'apollo-common'
import { getRoot } from 'mobx-state-tree'
import React, { useEffect, useState } from 'react'

import { ApolloInternetAccountModel } from '../ApolloInternetAccount/model'
import { createFetchErrorMessage } from '../util'

interface ViewChangeLogProps {
  session: AbstractSessionModel
  handleClose(): void
}

interface AssemblyDocument {
  _id: string
  name: string
}

export function ViewChangeLog({ handleClose, session }: ViewChangeLogProps) {
  const { internetAccounts } = getRoot<AppRootModel>(session)
  const apolloInternetAccount =
    internetAccounts.find<ApolloInternetAccountModel>(
      (ia): ia is ApolloInternetAccountModel =>
        ia.type === 'ApolloInternetAccount',
    )
  if (!apolloInternetAccount) {
    throw new Error('No Apollo internet account found')
  }
  const { baseURL } = apolloInternetAccount
  const [errorMessage, setErrorMessage] = useState<string>()
  const [assemblyCollection, setAssemblyCollection] = useState<
    AssemblyDocument[]
  >([])
  const [assemblyId, setAssemblyId] = useState<string>()
  const [displayGridData, setDisplayGridData] = useState<GridRowsProp[]>([])

  const gridColumns: GridColDef[] = [
    {
      field: 'actions',
      type: 'actions',
      width: 40,
      getActions: (/* params */) => [
        <GridActionsCellItem
          icon={<UndoIcon />}
          label="Undo"
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log('click')
          }}
          disabled
          showInMenu
        />,
      ],
    },
    { field: 'sequence' },
    {
      field: 'typeName',
      headerName: 'Change type',
      width: 200,
      type: 'singleSelect',
      // TODO: Get these from change manager once it's on the session
      valueOptions: Array.from(changeRegistry.changes.keys()),
    },
    {
      field: 'changes',
      headerName: 'Change JSON',
      width: 600,
      renderCell: ({ value }) => (
        <div style={{ fontFamily: 'monospace' }}>{JSON.stringify(value)}</div>
      ),
      valueFormatter: ({ value }) => JSON.stringify(value),
    },
    { field: 'user', headerName: 'User', width: 140 },
    {
      field: 'createdAt',
      headerName: 'Time',
      width: 160,
      type: 'dateTime',
      valueGetter: ({ value }) => value && new Date(value),
    },
  ]

  useEffect(() => {
    async function getAssemblies() {
      const uri = new URL('/assemblies', baseURL).href
      const apolloFetch = apolloInternetAccount?.getFetcher({
        locationType: 'UriLocation',
        uri,
      })
      if (apolloFetch) {
        const response = await apolloFetch(uri, {
          method: 'GET',
        })
        if (!response.ok) {
          const newErrorMessage = await createFetchErrorMessage(
            response,
            'Error when retrieving assemblies from server',
          )
          setErrorMessage(newErrorMessage)
          return
        }
        const data = (await response.json()) as AssemblyDocument[]
        setAssemblyCollection(data)
      }
    }
    getAssemblies().catch((e) => setErrorMessage(String(e)))
  }, [apolloInternetAccount, baseURL])

  useEffect(() => {
    if (!assemblyId && assemblyCollection.length) {
      setAssemblyId(assemblyCollection[0]._id)
    }
  }, [assemblyId, assemblyCollection])

  useEffect(() => {
    async function getGridData() {
      if (!assemblyId) {
        return
      }

      // Get changes
      const url = new URL('changes', baseURL)
      const searchParams = new URLSearchParams({ assembly: assemblyId })
      url.search = searchParams.toString()
      const uri = url.toString()
      const apolloFetch = apolloInternetAccount?.getFetcher({
        locationType: 'UriLocation',
        uri,
      })
      if (apolloFetch) {
        const response = await apolloFetch(uri, {
          headers: new Headers({ 'Content-Type': 'application/json' }),
        })
        if (!response.ok) {
          const newErrorMessage = await createFetchErrorMessage(
            response,
            'Error when retrieving changes',
          )
          setErrorMessage(newErrorMessage)
          return
        }
        const data = await response.json()
        setDisplayGridData(data)
      }
    }
    getGridData().catch((e) => setErrorMessage(String(e)))
  }, [assemblyId, apolloInternetAccount, baseURL])

  function handleChangeAssembly(e: SelectChangeEvent<string>) {
    setAssemblyId(e.target.value)
  }

  return (
    <Dialog open maxWidth="xl" data-testid="login-apollo" fullScreen>
      <DialogTitle>
        View change log
        <Select
          style={{ width: 200, marginLeft: 40 }}
          value={assemblyId}
          onChange={handleChangeAssembly}
        >
          {assemblyCollection.map((option) => (
            <MenuItem key={option._id} value={option._id}>
              {option.name}
            </MenuItem>
          ))}
        </Select>
      </DialogTitle>

      <DialogContent>
        <div style={{ height: '100%', width: '100%' }}>
          <DataGrid
            // className={classes.root}
            autoPageSize
            pagination
            rows={displayGridData}
            columns={gridColumns}
            getRowId={(row) => row._id}
            components={{ Toolbar: GridToolbar }}
            getRowHeight={() => 'auto'}
            initialState={{
              sorting: { sortModel: [{ field: 'sequence', sort: 'desc' }] },
              columns: { columnVisibilityModel: { sequence: false } },
            }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          type="submit"
          onClick={() => {
            handleClose()
          }}
        >
          Close
        </Button>
      </DialogActions>
      {errorMessage ? (
        <DialogContent>
          <DialogContentText color="error">{errorMessage}</DialogContentText>
        </DialogContent>
      ) : null}
    </Dialog>
  )
}
