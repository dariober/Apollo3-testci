import { Button, makeStyles } from '@material-ui/core'
import { observer } from 'mobx-react'
import React, { useState, useEffect } from 'react'
import { AplInputProps, ApolloFeature } from '../ApolloFeatureDetail'
import AttributeModal from './AttributeModal'
import { DataGrid, GridSortDirection } from '@material-ui/data-grid'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import TextImportModal from './TextImportModal'

interface Attribute {
  [key: string]: string
}
const useStyles = makeStyles(() => ({
  buttons: {
    marginRight: 10,
  },
}))

const AttributeEditingTabDetail = ({
  clickedFeature,
  props,
}: {
  clickedFeature: ApolloFeature
  props: AplInputProps
}) => {
  const { model } = props
  const classes = useStyles()
  const [attributes, setAttributes] = useState([])
  const [attributeDialogInfo, setAttributeDialogInfo] = useState({
    open: false,
    data: {},
  })
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false)
  const [openImportModal, setOpenImportModal] = useState(false)

  const handleClose = () => {
    setAttributeDialogInfo({ open: false, data: {} })
  }

  useEffect(() => {
    async function fetchAttributes() {
      const data = {
        username: sessionStorage.getItem(`${model.apolloId}-apolloUsername`), // get from renderProps later
        password: sessionStorage.getItem(`${model.apolloId}-apolloPassword`),
        sequence: clickedFeature.sequence,
        organism: 'Fictitious', // need to find where in code is organism name
        uniquename: clickedFeature.uniquename,
      }

      const response = await fetch(
        `${model.apolloUrl}/annotationEditor/getAttributes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      )
      const json = await response.json()
      setAttributes(json.annotations || [])
    }
    fetchAttributes()
  }, [
    clickedFeature.uniquename,
    model.apolloUrl,
    model.apolloId,
    clickedFeature.sequence,
  ])

  const [selectedAnnotation, setSelectedAnnotation] = useState({})

  const columns = [
    { field: 'prefix', headerName: 'Prefix' },
    { field: 'accession', headerName: 'Accession' },
  ]

  const rows = attributes.map((annotation: Attribute, index: number) => ({
    id: index,
    prefix: annotation.tag,
    accession: annotation.value,
  }))

  return (
    <>
      <div style={{ height: 400, width: '100%' }}>
        <div style={{ display: 'flex', height: '100%' }}>
          <DataGrid
            disableColumnMenu
            hideFooterSelectedRowCount
            pageSize={25}
            rows={rows}
            columns={columns}
            sortModel={[{ field: 'prefix', sort: 'asc' as GridSortDirection }]}
            onRowClick={rowData => {
              setSelectedAnnotation(attributes[rowData.row.id as number])
            }}
          />
        </div>
      </div>
      <div style={{ margin: 5 }}>
        <Button
          color="secondary"
          variant="contained"
          className={classes.buttons}
          onClick={async () => setAttributeDialogInfo({ open: true, data: {} })}
        >
          New
        </Button>
        <Button
          color="secondary"
          variant="contained"
          className={classes.buttons}
          disabled={Object.keys(selectedAnnotation).length === 0}
          onClick={async () => {
            setAttributeDialogInfo({
              open: true,
              data: {
                selectedAnnotation,
              },
            })
          }}
        >
          Edit
        </Button>
        <Button
          color="secondary"
          variant="contained"
          className={classes.buttons}
          disabled={Object.keys(selectedAnnotation).length === 0}
          onClick={() => {
            setOpenConfirmDeleteModal(true)
          }}
        >
          Delete
        </Button>
        <Button
          color="secondary"
          variant="contained"
          className={classes.buttons}
          onClick={() => {
            setOpenImportModal(true)
          }}
        >
          Import From Text
        </Button>
        {attributeDialogInfo.open && (
          <AttributeModal
            handleClose={handleClose}
            model={model}
            clickedFeature={clickedFeature}
            loadData={attributeDialogInfo.data}
          />
        )}
        {openConfirmDeleteModal && (
          <ConfirmDeleteModal
            handleClose={() => setOpenConfirmDeleteModal(false)}
            deleteFunc={async () => {
              const data = {
                username: sessionStorage.getItem(
                  `${model.apolloId}-apolloUsername`,
                ),
                password: sessionStorage.getItem(
                  `${model.apolloId}-apolloPassword`,
                ),
                sequence: clickedFeature.sequence,
                organism: 'Ficticious',
                features: [
                  {
                    uniquename: clickedFeature.uniquename,
                    non_reserved_properties: [
                      {
                        db: (selectedAnnotation as Attribute).prefix,
                        accession: (selectedAnnotation as Attribute).accession,
                      },
                    ],
                  },
                ],
              }
              await fetch(
                `${model.apolloUrl}/annotationEditor/deleteAttribute`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data),
                },
              )
            }}
            objToDeleteName={`Attribute: ${
              (selectedAnnotation as Attribute).prefix
            }`}
          />
        )}
        {openImportModal && (
          <TextImportModal
            model={model}
            handleClose={() => {
              setOpenImportModal(false)
            }}
            endpointUrl={`${model.apolloUrl}/annotationEditor/addAttribute`}
            from="Attribute"
            helpText={`Format is:
            {
                "sequence": "",
                "organism": "",
                "features": [{"uniquename": "", "non_reserved_properties": [{ "db": "", "accession": "" }]}]
            }`}
          />
        )}
      </div>
    </>
  )
}

export default observer(AttributeEditingTabDetail)
