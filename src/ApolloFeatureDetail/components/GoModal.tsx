import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  makeStyles,
  TextField,
  MenuItem,
  Button,
  IconButton,
} from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'
import WarningIcon from '@material-ui/icons/Warning'
import CloseIcon from '@material-ui/icons/Close'
import { ApolloFeature } from '../ApolloFeatureDetail'
import GOEvidenceCodes from './GOEvidenceCodes'
import copy from 'copy-to-clipboard'

interface GoResults {
  id: string
  label: string[]
}

interface EvidenceResults extends GoResults {
  code: string
}

const useStyles = makeStyles(theme => ({
  main: {
    textAlign: 'center',
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    borderWidth: 2,
    borderRadius: 2,
  },
  buttons: {
    margin: theme.spacing(2),
    color: theme.palette.text.primary,
  },
  root: {
    width: '100%',
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  prefixIdField: {
    '& .MuiTextField-root': {
      marginRight: theme.spacing(1),
    },
  },
  errorText: {
    color: theme.palette.error.main,
  },
}))

// geneonotogy endpoing for GO Term and evidence autocompletes
// may move to a utils file if used for more than one folder
const fetchGOAutocompleteResults = async (
  prefix: string,
  currentText: string,
  aspect?: string,
) => {
  const data = {
    rows: 40,
    prefix,
  }

  if (prefix === 'GO') {
    // @ts-ignore
    data.category = aspect
  }

  let params = Object.entries(data)
    .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
    .join('&')

  const response = await fetch(
    `https://api.geneontology.org/api/search/entity/autocomplete/${currentText}?${params}`,
    {
      method: 'GET',
    },
  )

  const results = await response.json()
  return results
}

// error if form filled out incorrectly, tells user why
function GoModalError({
  handleClose,
  errorMessageArray,
}: {
  handleClose: () => void
  errorMessageArray: string[]
}) {
  const classes = useStyles()

  return (
    <Dialog
      open
      aria-labelledby="error-dialog-title"
      aria-describedby="error-dialog-description"
      data-testid="go-editing-modal-error"
      fullWidth={true}
      style={{ zIndex: 2000 }}
    >
      <DialogTitle id="alert-dialog-title">
        <IconButton>
          <WarningIcon />
        </IconButton>
        Invalid Go Annotation
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText className={classes.errorText}>
          Reasons:
        </DialogContentText>
        {errorMessageArray.map(reason => (
          <DialogContentText key={reason} className={classes.errorText}>
            {reason}
          </DialogContentText>
        ))}
      </DialogContent>
      <Button
        color="primary"
        variant="contained"
        onClick={() => {
          handleClose()
        }}
      >
        Ok
      </Button>
    </Dialog>
  )
}
export default function GoModal({
  handleClose,
  model,
  clickedFeature,
  loadData = {},
}: {
  handleClose: () => void
  model: any
  clickedFeature: ApolloFeature
  loadData: any
}) {
  const classes = useStyles()

  // form field hooks
  const [aspect, setAspect] = useState('')
  const [goFormInfo, setGoFormInfo] = useState({
    goTerm: { label: '', id: '' },
    relationship: '',
    not: false,
    evidence: { label: '', id: '', code: '' },
    allECOEvidence: false,
  })
  const [goTermAutocomplete, setGoTermAutocomplete] = useState<GoResults[]>([])
  const [evidenceAutocomplete, setEvidenceAutocomplete] = useState<
    EvidenceResults[]
  >([])
  const initialPrefixId = { prefix: '', id: '' }
  const [withInfo, setWithInfo] = useState(initialPrefixId)
  const [withArray, setWithArray] = useState<string[]>([])
  const [referenceInfo, setReferenceInfo] = useState({ prefix: '', id: '' })
  const [noteString, setNoteString] = useState('')
  const [noteArray, setNoteArray] = useState<string[]>([])

  const [openErrorModal, setOpenErrorModal] = useState(false)

  const relationValueText = [
    {
      selectedAspect: 'biological process',
      choices: [
        { text: 'involved in', value: 'RO:0002331' },
        { text: 'acts upstream of', value: 'RO:0002263' },
        { text: 'acts upstream of positive effect', value: 'RO:0004034' },
        { text: 'acts upstream of negative effect', value: 'RO:0004035' },
        { text: 'acts upstream of or within', value: 'RO:0002264' },
        {
          text: 'acts upstream of or within positive effect',
          value: 'RO:0004032',
        },
        {
          text: 'acts upstream of or within negative effect',
          value: 'RO:0004033',
        },
      ],
    },
    {
      selectedAspect: 'molecular function',
      choices: [
        { text: 'enables', value: 'RO:0002327' },
        { text: 'contributes to', value: 'RO:0002326' },
      ],
    },
    {
      selectedAspect: 'cellular component',
      choices: [
        { text: 'part of', value: 'BFO:0000050' },
        { text: 'colocalizes with', value: 'RO:0002325' },
        { text: 'is active in', value: 'RO:0002432' },
      ],
    },
  ]

  const formValidation = () => {
    const errorMessageArray = []
    if (!goFormInfo.goTerm) {
      errorMessageArray.push('You must provide a GO term')
    } else if (!goFormInfo.goTerm.id.includes(':')) {
      errorMessageArray.push(
        'You must provide a prefix and suffix for the GO term',
      )
    }

    if (!goFormInfo.evidence) {
      errorMessageArray.push('You must provide an ECO term')
    } else if (
      !goFormInfo.evidence.id.includes(':') &&
      !goFormInfo.allECOEvidence
    ) {
      errorMessageArray.push(
        'You must provide a prefix and suffix for the ECO term',
      )
    }

    if (!goFormInfo.relationship) {
      errorMessageArray.push('You must provide a Gene Relationship')
    }
    if (!referenceInfo.prefix || !referenceInfo.id) {
      errorMessageArray.push(
        'You must provide atleast one reference prefix and id',
      )
    }
    if (withArray.length <= 0) {
      errorMessageArray.push(
        'You must provide at least 1 with for the evidence code',
      )
    }
    return errorMessageArray
  }

  const clearForm = () => {
    setGoFormInfo({
      goTerm: { label: '', id: '' },
      relationship: '',
      not: false,
      evidence: { label: '', id: '', code: '' },
      allECOEvidence: false,
    })
    setGoTermAutocomplete([])
    setEvidenceAutocomplete([])
    setWithInfo(initialPrefixId)
    setWithArray([])
    setReferenceInfo(initialPrefixId)
    setNoteString('')
    setNoteArray([])
  }

  // loads annotation if selected in datagrid and edit clicked
  useEffect(() => {
    if (Object.keys(loadData).length) {
      const infoToLoad = loadData.selectedAnnotation
      switch (infoToLoad.aspect) {
        case 'BP':
          setAspect('biological process')
          break
        case 'MF':
          setAspect('molecular function')
          break
        case 'CC':
          setAspect('cellular component')
          break
      }

      setGoFormInfo({
        goTerm: {
          label: infoToLoad.goTermLabel || '',
          id: infoToLoad.goTerm || '',
        },
        relationship: infoToLoad.geneRelationship || '',
        not: infoToLoad.negate,
        evidence: {
          label: infoToLoad.evidenceCodeLabel || '',
          id: infoToLoad.evidenceCode || '',
          code: '',
        },
        allECOEvidence: false,
      })
      setWithArray(
        infoToLoad.withOrFrom ? JSON.parse(infoToLoad.withOrFrom) : [],
      )
      setReferenceInfo({
        prefix: infoToLoad.reference?.split(':')[0],
        id: infoToLoad.reference?.split(':')[1], // probably a better way to do this, fails if they put a colon in prefix name
      })
      setNoteArray(infoToLoad.notes ? JSON.parse(infoToLoad.notes) : [])
    }
  }, [loadData])

  return (
    <Dialog
      open
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      data-testid="go-editing-modal"
      fullWidth={true}
    >
      <DialogTitle id="alert-dialog-title">
        Add new Go Annotations to {clickedFeature.name}
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <div>
        <DialogContent>
          <DialogContentText>
            <a
              href="http://geneontology.org/docs/go-annotations/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Go Annotation Guidance
            </a>
          </DialogContentText>
        </DialogContent>
      </div>
      <div className={classes.root}>
        <form>
          <TextField
            select
            label="Aspect"
            value={aspect}
            onChange={event => {
              setAspect(event.target.value)
              clearForm()
            }}
            style={{ width: '30%', marginRight: 10 }}
            helperText={aspect || ''}
          >
            <MenuItem value="" />
            <MenuItem value="biological process">
              Biological Process (BP)
            </MenuItem>
            <MenuItem value="molecular function">
              Molecular Function (MF)
            </MenuItem>
            <MenuItem value="cellular component">
              Cellular Component (CC)
            </MenuItem>
          </TextField>
          <Autocomplete
            id="goTerm-autocomplete"
            freeSolo
            options={goTermAutocomplete}
            value={goFormInfo.goTerm.id}
            getOptionLabel={option => {
              if (typeof option === 'string') {
                return option
              }
              if (option.label) {
                return `${option.label[0]} (${option.id})`
              }
              return option.id
            }}
            onChange={(event, value, reason) => {
              if (reason === 'clear') {
                setGoFormInfo({
                  ...goFormInfo,
                  goTerm: {
                    label: '',
                    id: '',
                  },
                })
              }
              if (value) {
                setGoFormInfo({
                  ...goFormInfo,
                  goTerm: {
                    label: (value as GoResults).label[0],
                    id: (value as GoResults).id,
                  },
                })
              }
            }}
            selectOnFocus
            disabled={!aspect}
            renderInput={params => (
              <TextField
                {...params}
                onChange={async event => {
                  setGoFormInfo({
                    ...goFormInfo,
                    goTerm: {
                      label: '',
                      id: event.target.value,
                    },
                  })

                  const result = await fetchGOAutocompleteResults(
                    'GO',
                    event.target.value,
                    aspect,
                  )
                  setGoTermAutocomplete(result.docs)
                }}
                label="Go term"
                autoComplete="off"
                disabled={!aspect}
                style={{ width: '60%' }}
                helperText={
                  goFormInfo.goTerm.label &&
                  goFormInfo.goTerm.id && (
                    <a
                      href={`http://amigo.geneontology.org/amigo/term/${goFormInfo.goTerm.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {goFormInfo.goTerm.label} ({goFormInfo.goTerm.id})
                    </a>
                  )
                }
              />
            )}
          />
          <br />
          <TextField
            select
            label="Relationship between Gene Product and GO Term"
            value={goFormInfo.relationship}
            onChange={event => {
              setGoFormInfo({
                ...goFormInfo,
                relationship: event.target.value,
              })
            }}
            style={{ width: '70%' }}
            disabled={!aspect}
            helperText={
              goFormInfo.relationship && (
                <a
                  href={`http://www.ontobee.org/ontology/RO?iri=http://purl.obolibrary.org/obo/${goFormInfo.relationship.replace(
                    ':',
                    '_',
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {goFormInfo.relationship}
                </a>
              )
            }
          >
            <MenuItem value="" />
            {relationValueText
              .find(obj => obj.selectedAspect === aspect)
              ?.choices.map(choice => (
                <MenuItem key={choice.value} value={choice.value}>
                  {choice.text} ({choice.value})
                </MenuItem>
              ))}
          </TextField>
          <input
            id="not"
            type="checkbox"
            checked={goFormInfo.not}
            onChange={event => {
              setGoFormInfo({ ...goFormInfo, not: event.target.checked })
            }}
            style={{ marginTop: 40 }}
          />
          <label htmlFor="not">Not</label>
          <Autocomplete
            id="evidence-autocomplete"
            freeSolo
            options={evidenceAutocomplete}
            value={goFormInfo.evidence.id}
            getOptionLabel={option => {
              if (typeof option === 'string') {
                return option
              }
              if (option.label) {
                return !option.code
                  ? `${option.label[0]} (${option.id})`
                  : `${option.code} (${option.id}): ${option.label[0]}`
              }
              return option.id
            }}
            disabled={!aspect}
            onChange={(event, value, reason) => {
              if (reason === 'clear') {
                setGoFormInfo({
                  ...goFormInfo,
                  evidence: {
                    label: '',
                    id: '',
                    code: '',
                  },
                })
              }
              if (value) {
                setGoFormInfo({
                  ...goFormInfo,
                  evidence: {
                    label: (value as EvidenceResults).label[0],
                    id: (value as EvidenceResults).id,
                    code: (value as EvidenceResults).code || '',
                  },
                })
              }
            }}
            selectOnFocus
            renderInput={params => (
              <TextField
                {...params}
                // value={goFormInfo.evidence.id}
                onChange={async event => {
                  setGoFormInfo({
                    ...goFormInfo,
                    evidence: {
                      label: '',
                      code: '',
                      id: event.target.value,
                    },
                  })

                  if (goFormInfo.allECOEvidence) {
                    const result = await fetchGOAutocompleteResults(
                      'ECO',
                      event.target.value,
                    )
                    setEvidenceAutocomplete(result.docs)
                  } else {
                    setEvidenceAutocomplete(
                      GOEvidenceCodes.filter(
                        info =>
                          info.code.includes(event.target.value) ||
                          info.label[0].includes(event.target.value),
                      ),
                    )
                  }
                }}
                label="Evidence"
                autoComplete="off"
                disabled={!aspect}
                style={{ width: '70%' }}
                helperText={
                  <>
                    {goFormInfo.evidence.label && goFormInfo.evidence.id && (
                      <a
                        href={`https://evidenceontology.org/term/${goFormInfo.evidence.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {goFormInfo.evidence.label} ({goFormInfo.evidence.id})
                      </a>
                    )}
                    {goFormInfo.evidence.label && goFormInfo.evidence.id && (
                      <br />
                    )}
                    <a
                      href="http://geneontology.org/docs/guide-go-evidence-codes/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Evidence Code Info
                    </a>
                  </>
                }
              />
            )}
          />

          <input
            id="allECOEvidence"
            type="checkbox"
            checked={goFormInfo.allECOEvidence}
            onChange={event => {
              setGoFormInfo({
                ...goFormInfo,
                allECOEvidence: event.target.checked,
              })
            }}
            style={{ marginTop: 40, marginRight: 10 }}
          />
          <label htmlFor="allECOEvidence">All ECO Evidence</label>
          <br />
          <div className={classes.prefixIdField}>
            <TextField
              value={withInfo.prefix}
              onChange={event => {
                setWithInfo({ ...withInfo, prefix: event.target.value })
              }}
              label="With"
              autoComplete="off"
              disabled={!aspect}
              placeholder="Prefix"
            />
            <TextField
              value={withInfo.id}
              onChange={event => {
                setWithInfo({ ...withInfo, id: event.target.value })
              }}
              label="With Id"
              autoComplete="off"
              disabled={!aspect}
              placeholder="id"
            />
            <Button
              color="primary"
              variant="contained"
              style={{ marginTop: 20 }}
              onClick={() => {
                if (withInfo !== initialPrefixId) {
                  const prefixIdString = `${withInfo.prefix}:${withInfo.id}`
                  withArray.length > 0
                    ? setWithArray([...withArray, prefixIdString])
                    : setWithArray([prefixIdString])
                  setWithInfo(initialPrefixId)
                }
              }}
            >
              Add
            </Button>
            {withArray.map((value: string) => {
              return (
                <div key={value}>
                  {value}
                  <IconButton
                    aria-label="close"
                    onClick={() => {
                      setWithArray(
                        withArray.filter(withString => withString !== value),
                      )
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              )
            })}
          </div>
          <div className={classes.prefixIdField}>
            <TextField
              value={referenceInfo.prefix}
              onChange={event => {
                setReferenceInfo({
                  ...referenceInfo,
                  prefix: event.target.value,
                })
              }}
              label="Reference"
              autoComplete="off"
              disabled={!aspect}
              placeholder="Prefix"
            />
            <TextField
              value={referenceInfo.id}
              onChange={event => {
                setReferenceInfo({ ...referenceInfo, id: event.target.value })
              }}
              label="Reference Id"
              autoComplete="off"
              disabled={!aspect}
              placeholder="id"
            />
          </div>
          <TextField
            value={noteString}
            onChange={event => {
              setNoteString(event.target.value)
            }}
            label="Note"
            autoComplete="off"
            disabled={!aspect}
          />
          <Button
            color="primary"
            variant="contained"
            style={{ marginTop: 20 }}
            onClick={() => {
              if (noteString !== '') {
                noteArray.length > 0
                  ? setNoteArray([...noteArray, noteString])
                  : setNoteArray([noteString])
              }
            }}
          >
            Add
          </Button>
          {noteArray.map(value => {
            return (
              <div key={value}>
                {value}
                <IconButton
                  aria-label="close"
                  onClick={() => {
                    setNoteArray(noteArray.filter(note => note !== value))
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </div>
            )
          })}
        </form>
      </div>
      <div className={classes.buttons}>
        <Button
          color="primary"
          variant="contained"
          style={{ marginRight: 5 }}
          onClick={async () => {
            const validate = formValidation()
            if (validate.length > 0) {
              setOpenErrorModal(true)
            } else {
              const data = {
                username: sessionStorage.getItem(
                  `${model.apolloId}-apolloUsername`,
                ),
                password: sessionStorage.getItem(
                  `${model.apolloId}-apolloPassword`,
                ),
                feature: clickedFeature.uniquename,
                aspect: aspect
                  .match(/\b(\w)/g)
                  ?.join('')
                  .toUpperCase(), // gets acronym of aspect, ex. biological process => BP
                goTerm: goFormInfo.goTerm.id,
                goTermLabel: goFormInfo.goTerm.label,
                geneRelationship: goFormInfo.relationship,
                evidenceCode: goFormInfo.evidence.id,
                evidenceCodeLabel: goFormInfo.evidence.code
                  ? `${goFormInfo.evidence.code} (${goFormInfo.evidence.id}): ${goFormInfo.evidence.label}`
                  : `${goFormInfo.evidence.label} (${goFormInfo.evidence.id})`,
                negate: goFormInfo.not,
                withOrFrom: withArray,
                reference: `${referenceInfo.prefix}:${referenceInfo.id}`,
                id: loadData.selectedAnnotation?.id || null,
                notes: noteArray,
              }

              const endpointUrl = Object.keys(loadData).length
                ? `${model.apolloUrl}/goAnnotation/update`
                : `${model.apolloUrl}/goAnnotation/save`
              await fetch(endpointUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              })
              handleClose()
            }
          }}
        >
          Save
        </Button>
        <Button
          variant="contained"
          style={{ marginRight: 5 }}
          onClick={() => {
            handleClose()
          }}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            const goString = {
              feature: clickedFeature.uniquename,
              aspect:
                aspect
                  .match(/\b(\w)/g)
                  ?.join('')
                  .toUpperCase() || '', // gets acronym of aspect, ex. biological process => BP
              goTerm: goFormInfo.goTerm.id,
              goTermLabel: goFormInfo.goTerm.label,
              geneRelationship: goFormInfo.relationship,
              evidenceCode: goFormInfo.evidence.id,
              evidenceCodeLabel: goFormInfo.evidence.code
                ? `${goFormInfo.evidence.code} (${goFormInfo.evidence.id}): ${goFormInfo.evidence.label}`
                : `${goFormInfo.evidence.label} (${goFormInfo.evidence.id})`,
              negate: goFormInfo.not,
              withOrFrom: withArray,
              reference: `${referenceInfo.prefix}:${referenceInfo.id}`,
              notes: noteArray,
            }
            copy(JSON.stringify(goString, null, 4))
          }}
        >
          Copy JSON to Clipboard
        </Button>
      </div>
      {openErrorModal && (
        <GoModalError
          handleClose={() => setOpenErrorModal(false)}
          errorMessageArray={formValidation()}
        />
      )}
    </Dialog>
  )
}
