import { AbstractSessionModel, AppRootModel } from '@jbrowse/core/util'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core'
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid'
import { getRoot } from 'mobx-state-tree'
import React, { useEffect, useState } from 'react'
import useCollapse from 'react-collapsed'

import { ApolloInternetAccountModel } from '../ApolloInternetAccount/model'

interface ViewChangeLogProps {
  session: AbstractSessionModel
  handleClose(): void
}

interface Collection {
  _id: string
  name: string
}

export function ViewChangeLog({ session, handleClose }: ViewChangeLogProps) {
  const { internetAccounts } = getRoot(session) as AppRootModel
  const { notify } = session
  const apolloInternetAccount = internetAccounts.find(
    (ia) => ia.type === 'ApolloInternetAccount',
  ) as ApolloInternetAccountModel | undefined
  if (!apolloInternetAccount) {
    throw new Error('No Apollo internet account found')
  }
  const { baseURL } = apolloInternetAccount
  const [assemblyName, setAssemblyName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [collection, setCollection] = useState<Collection[]>([])
  const [assemblyId, setAssemblyId] = useState('')
  const [typeName, setChangeType] = useState('')
  const [userName, setUserName] = useState('')
  const [disableUndo, setDisableUndo] = useState<boolean>(true)
  const [displayGridData, setDisplayGridData] = useState<GridRowsProp[]>([])
  const [isExpanded, setExpanded] = useState(false)
  const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded })

  const gridColumns: GridColDef[] = [
    {
      field: '_id',
      headerName: 'Revert',
      width: 150,
      renderCell: (params) => (
        <strong>
          <Button
            variant="contained"
            size="small"
            style={{ marginLeft: 16 }}
            tabIndex={params.hasFocus ? 0 : -1}
            disabled={disableUndo}
          >
            Undo
          </Button>
        </strong>
      ),
    },
    { field: 'assembly', headerName: 'AssemblyId', width: 200 },
    { field: 'typeName', headerName: 'Change type', width: 200 },
    { field: 'user', headerName: 'User', width: 100 },
    { field: 'createdAt', headerName: 'DateTime', width: 200 },
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
          let msg
          try {
            msg = await response.text()
          } catch (e) {
            msg = ''
          }
          setErrorMessage(
            `Error when retrieving assemblies from server — ${
              response.status
            } (${response.statusText})${msg ? ` (${msg})` : ''}`,
          )
          return
        }
        const data = await response.json()
        data.forEach((item: Collection) => {
          setCollection((result) => [
            ...result,
            {
              _id: item._id,
              name: item.name,
            },
          ])
        })
      }
    }
    getAssemblies()
    return () => {
      setCollection([{ _id: '', name: '' }])
    }
  }, [apolloInternetAccount, baseURL])

  function handleOnClickExpanded() {
    setExpanded(!isExpanded)
  }

  function handleChangeAssembly(
    e: React.ChangeEvent<{
      name?: string | undefined
      value: unknown
    }>,
  ) {
    setAssemblyId(e.target.value as string)
    setAssemblyName(
      collection.find((i) => i._id === e.target.value)?.name as string,
    )
  }

  function handleChangeType(
    e: React.ChangeEvent<{
      name?: string | undefined
      value: unknown
    }>,
  ) {
    setChangeType(e.target.value as string)
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    console.log(`Assembly: "${assemblyId}"`)
    console.log(`Change: "${typeName}"`)
    console.log(`Username: "${userName}"`)

    setErrorMessage('')
    let msg

    // Get changes
    const uri = new URL('/changes/getChange', baseURL).href
    const apolloFetch = apolloInternetAccount?.getFetcher({
      locationType: 'UriLocation',
      uri,
    })
    if (apolloFetch) {
      const res = await apolloFetch(uri, {
        method: 'POST',
        body: JSON.stringify({
          assemblyId,
          typeName,
          userName,
        }),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      })
      if (!res.ok) {
        try {
          msg = await res.text()
        } catch (e) {
          msg = ''
        }
        setErrorMessage(
          `Error when retrieving changes — ${res.status} (${res.statusText})${
            msg ? ` (${msg})` : ''
          }`,
        )
        return
      }
      const data = await res.json()
      setDisplayGridData(data)
      console.log(`Data: "${JSON.stringify(data)}"`)
    }
    // handleClose()
    // event.preventDefault()
  }

  return (
    <Dialog open maxWidth="xl" data-testid="login-apollo">
      <DialogTitle>View Change Log</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="collapsible">
            <div
              className="header"
              {...getToggleProps({ onClick: handleOnClickExpanded })}
            >
              <h3>
                <div
                  className="content"
                  dangerouslySetInnerHTML={
                    isExpanded
                      ? {
                          __html:
                            '<strong><u>Click me</u></strong> to hide filters',
                        }
                      : {
                          __html:
                            '<strong><u>Click me</u></strong> to hide filters',
                        }
                  }
                ></div>
                {/* {isExpanded
                  ? 'Click me to hide filters'
                  : 'Click me to show filters'} */}
              </h3>
            </div>
            {/* *** CHEVRON IS NOT WORKING *** */}
            <i className="fa fa-chevron-circle-up" aria-hidden="true"></i>
            <div {...getCollapseProps()}>
              <div className="icon">
                <i
                  className={`fas fa-chevron-circle-${
                    isExpanded ? 'up' : 'down'
                  }`}
                ></i>
              </div>
              <div className="content">
                <table>
                  <tr>
                    <th style={{ width: 200, alignItems: 'flex-start' }}>
                      Filter by assembly
                    </th>
                    <th style={{ width: 200, alignItems: 'flex-start' }}>
                      Filter by change
                    </th>
                    <th style={{ width: 200, alignItems: 'flex-start' }}>
                      Filter by username
                    </th>
                  </tr>
                  <tr>
                    <td>
                      <Select
                        style={{ width: 200, alignItems: 'flex-start' }}
                        labelId="label"
                        value={assemblyId}
                        onChange={handleChangeAssembly}
                      >
                        {collection.map((option) => (
                          <MenuItem key={option._id} value={option._id}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </td>
                    <td>
                      <Select
                        style={{ width: 200, alignItems: 'flex-start' }}
                        value={typeName}
                        onChange={handleChangeType}
                      >
                        <option value="">Any</option>
                        <option value="LocationStartChange">
                          Location start change
                        </option>
                        <option value="LocationEndChange">
                          Location end change
                        </option>
                        <option value="AddAssemblyFromFileChange">
                          Add assembly from file
                        </option>
                        <option value="AddAssemblyAndFeaturesFromFileChange">
                          Add assembly and features from file
                        </option>
                        <option value="AddFeaturesFromFileChange">
                          Add features from file
                        </option>
                      </Select>
                    </td>
                    <td>
                      <TextField
                        id="name"
                        type="TextField"
                        style={{ width: 200, alignItems: 'flex-end' }}
                        variant="outlined"
                        onChange={(e) => setUserName(e.target.value)}
                      />
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" type="submit">
            Submit
          </Button>
          <Button
            variant="outlined"
            type="submit"
            onClick={() => {
              handleClose()
            }}
          >
            Cancel
          </Button>
        </DialogActions>
        <div style={{ height: 700, width: 700 }}>
          <DataGrid
            autoPageSize
            pagination
            rows={displayGridData}
            columns={gridColumns}
            getRowId={(row) => row._id}
          />
        </div>
      </form>
      {errorMessage ? (
        <DialogContent>
          <DialogContentText color="error">{errorMessage}</DialogContentText>
        </DialogContent>
      ) : null}
    </Dialog>
  )
}
