import { TextField } from "@mui/material"
import { useAppContext } from "../../hooks/useAppContext"
import { ChangeEvent } from "react";

export const Curation = () => {
  const { listId, setListId, fetchPubkeysInList} = useAppContext();

  function handleTextChange(e: any) {
    if(e.target.value.length === 64) {
      setListId(e.target.value)
    }
  }

  return <TextField onChange={handleTextChange} placeholder="Enter List Id">List ID</TextField>
}