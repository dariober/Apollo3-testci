import { getSession, isAbortException } from '@jbrowse/core/util'
import {
  Autocomplete,
  AutocompleteRenderGetTagProps,
  Chip,
  Grid,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { debounce } from '@mui/material/utils'
import highlightMatch from 'autosuggest-highlight/match'
import highlightParse from 'autosuggest-highlight/parse'
import { getParent } from 'mobx-state-tree'
import * as React from 'react'

import {
  OntologyManager,
  OntologyRecord,
  OntologyTerm,
  isOntologyClass,
} from '../OntologyManager'
import { Match } from '../OntologyManager/OntologyStore/fulltext'
import {
  OntologyDBNode,
  isDeprecated,
} from '../OntologyManager/OntologyStore/indexeddb-schema'

interface TermValue {
  term: OntologyTerm
  matches?: Match[]
}

// interface TermAutocompleteResult extends TermValue {
//   label: string[]
//   match: string
//   category: string[]
//   taxon: string
//   taxon_label: string
//   highlight: string
//   has_highlight: boolean
// }

// interface TermAutocompleteResponse {
//   docs: TermAutocompleteResult[]
// }

// const hiliteRegex = /(?<=<em class="hilite">)(.*?)(?=<\/em>)/g

function TermTagWithTooltip({
  termId,
  index,
  getTagProps,
  ontology,
}: {
  termId: string
  index: number
  getTagProps: AutocompleteRenderGetTagProps
  ontology: OntologyRecord
}) {
  const manager = getParent<OntologyManager>(ontology, 2)

  const [description, setDescription] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')

  React.useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    async function fetchDescription() {
      const termUrl = manager.expandPrefixes(termId)
      const db = await ontology.dataStore?.db
      if (!db || signal.aborted) {
        return
      }
      const term = await db
        .transaction('nodes')
        .objectStore('nodes')
        .get(termUrl)

      if (term && term.lbl && !signal.aborted) {
        setDescription(term.lbl || 'no label')
      }
    }
    fetchDescription().catch((e) => {
      if (!signal.aborted) {
        setErrorMessage(String(e))
      }
    })

    return () => {
      controller.abort()
    }
  }, [termId, ontology, manager])

  return (
    <Tooltip title={description}>
      <div>
        <Chip
          label={errorMessage || manager.applyPrefixes(termId)}
          color={errorMessage ? 'error' : 'default'}
          size="small"
          {...getTagProps({ index })}
        />
      </div>
    </Tooltip>
  )
}

export function OntologyTermMultiSelect({
  value: initialValue,
  session,
  onChange,
  ontologyName,
  ontologyVersion,
  includeDeprecated,
}: {
  session: ReturnType<typeof getSession>
  value: string[]
  ontologyName: string
  ontologyVersion?: string
  /** if true, include deprecated/obsolete terms */
  includeDeprecated?: boolean
  onChange(newValue: string[]): void
}) {
  const ontologyManager = session.apolloDataStore
    .ontologyManager as OntologyManager
  const ontology = ontologyManager.findOntology(ontologyName, ontologyVersion)

  const [value, setValue] = React.useState<TermValue[]>(
    initialValue.map((id) => ({ term: { id, type: 'CLASS' } })),
  )
  const [inputValue, setInputValue] = React.useState('')
  const [options, setOptions] = React.useState<readonly TermValue[]>([])
  const [loading, setLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')

  const getOntologyTerms = React.useMemo(
    () =>
      debounce(
        async (
          request: { input: string; signal: AbortSignal },
          callback: (results: OntologyDBNode[]) => void,
        ) => {
          if (!ontology) {
            return undefined
          }
          const { dataStore } = ontology
          if (!dataStore) {
            return undefined
          }
          const { input, signal } = request
          try {
            const matches: OntologyTerm[] = []
            const tx = (await dataStore.db).transaction('nodes')
            for await (const cursor of tx.objectStore('nodes')) {
              if (signal.aborted) {
                return
              }
              const node = cursor.value
              if (
                (node.lbl ?? '').toLowerCase().includes(input.toLowerCase())
              ) {
                matches.push(node)
              }
            }
            callback(matches)
          } catch (error) {
            setErrorMessage(String(error))
          }
        },
        400,
      ),
    [ontology],
  )

  React.useEffect(() => {
    const aborter = new AbortController()
    const { signal } = aborter

    if (inputValue === '') {
      setOptions([])
      return undefined
    }

    setLoading(true)

    if (!ontology) {
      return undefined
    }
    const { dataStore } = ontology
    if (!dataStore) {
      return undefined
    }

    ;(async () => {
      const matches = await dataStore.getTermsByFulltext(
        inputValue,
        undefined,
        signal,
      )
      // aggregate the matches by term
      const byTerm = new Map<string, Required<TermValue>>()
      const options: Required<TermValue>[] = []
      for (const match of matches) {
        if (
          !isOntologyClass(match.term) ||
          (!includeDeprecated && isDeprecated(match.term))
        ) {
          continue
        }
        let slot = byTerm.get(match.term.id)
        if (!slot) {
          slot = {
            term: match.term,
            matches: [],
          }
          byTerm.set(match.term.id, slot)
          options.push(slot)
        }
        slot.matches.push(match)
      }
      setOptions(options)
      setLoading(false)
    })().catch((error) => {
      if (!isAbortException(error)) {
        setErrorMessage(String(error))
      }
    })

    return () => {
      aborter.abort()
    }
  }, [getOntologyTerms, ontology, includeDeprecated, inputValue, value])

  if (!ontology) {
    return null
  }

  const extraTextFieldParams: { error?: boolean; helperText?: string } = {}
  if (errorMessage) {
    extraTextFieldParams.error = true
    extraTextFieldParams.helperText = errorMessage
  }

  return (
    <Autocomplete
      getOptionLabel={(option) => ontologyManager.applyPrefixes(option.term.id)}
      filterOptions={(terms) => terms.filter((t) => isOntologyClass(t.term))}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value}
      loading={loading}
      isOptionEqualToValue={(option, v) => option.term.id === v.term.id}
      noOptionsText={inputValue ? 'No matches' : 'Start typing to search'}
      onChange={(_, newValue) => {
        setOptions(newValue ? [...newValue, ...options] : options)
        onChange(newValue.map((v) => ontologyManager.applyPrefixes(v.term.id)))
        setValue(newValue)
      }}
      onInputChange={(event, newInputValue) => {
        if (newInputValue) {
          setLoading(true)
        }
        setOptions([])
        setInputValue(newInputValue)
      }}
      multiple
      renderInput={(params) => (
        <TextField
          {...params}
          {...extraTextFieldParams}
          variant="outlined"
          fullWidth
        />
      )}
      renderOption={(props, option) => (
        <Option
          {...props}
          ontologyManager={ontologyManager}
          option={option}
          inputValue={inputValue}
        />
      )}
      renderTags={(v, getTagProps) =>
        v.map((option, index) => (
          <TermTagWithTooltip
            termId={option.term.id}
            index={index}
            ontology={ontology}
            getTagProps={getTagProps}
            key={option.term.id}
          />
        ))
      }
    />
  )
}

function HighlightedText(props: { str: string; search: string }) {
  const { str, search } = props

  const highlights = highlightMatch(str, search, {
    insideWords: true,
    findAllOccurrences: true,
  })
  const parts = highlightParse(str, highlights)
  return (
    <>
      {parts.map((part, index) => (
        <Typography
          key={index}
          component="span"
          sx={{ fontWeight: part.highlight ? 'bold' : 'regular' }}
          variant="body2"
          color="text.secondary"
        >
          {part.text}
        </Typography>
      ))}
    </>
  )
}
function Option(props: {
  ontologyManager: OntologyManager
  inputValue: string
  option: TermValue
}) {
  const { option, inputValue, ontologyManager } = props
  const matches = option.matches ?? []
  const fields = matches
    .filter((match) => match.field.jsonPath !== '$.lbl')
    .map((match) => {
      return (
        <>
          <Typography component="dt" variant="body2" color="text.secondary">
            {match.field.displayName}
          </Typography>
          <dd>
            <HighlightedText str={match.str} search={inputValue} />
          </dd>
        </>
      )
    })
  // const lblScore = matches
  //   .filter((match) => match.field.jsonPath === '$.lbl')
  //   .map((m) => m.score)
  //   .join(', ')
  return (
    <li {...props}>
      <Grid container>
        <Grid item>
          <Typography component="span">
            {ontologyManager.applyPrefixes(option.term.id)}
          </Typography>{' '}
          <HighlightedText
            str={option.term.lbl ?? '(no label)'}
            search={inputValue}
          />{' '}
          {/* ({lblScore}) */}
          <dl>{fields}</dl>
        </Grid>
      </Grid>
    </li>
  )
}
